/**
 * Catalog of 100 personal-assistant tools.
 *
 * Every tool is pure data here (name, description, zod schema, mock executor).
 * `agent/tools/catalog.ts` turns these into eve tools; `agent/lib/jev-router.ts`
 * turns the same descriptions into Jev "choice" criteria. One source of truth
 * keeps both branches of the experiment identical except for who picks the tool.
 */
import { z } from "zod";
import * as W from "./world";

export interface ToolSpec {
  readonly name: string;
  readonly category: string;
  readonly description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly inputSchema: z.ZodObject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly run: (input: any) => unknown;
}

const specs: ToolSpec[] = [];

function tool<S extends z.ZodObject<any>>(
  category: string,
  name: string,
  description: string,
  inputSchema: S,
  run: (input: z.infer<S>) => unknown,
): void {
  specs.push({ category, name, description, inputSchema, run });
}

const date = z.string().describe("Date in YYYY-MM-DD");
const time = z.string().describe("Time in HH:MM (24h)");
const q = z.string().min(1).describe("Free-text search query");

const findContact = (query: string) => {
  const n = W.norm(query);
  return W.CONTACTS.filter(
    (c) => W.norm(c.name).includes(n) || W.norm(c.email).includes(n) || W.norm(c.company).includes(n),
  );
};

// ─── Calendar (10) ────────────────────────────────────────────────────────────
tool("calendar", "calendar_list_events", "List calendar events in a date range (defaults to today). Use to check what is scheduled on a given day.",
  z.object({ start_date: date.optional(), end_date: date.optional() }),
  ({ start_date, end_date }) => {
    const s = start_date ?? W.TODAY;
    const e = end_date ?? s;
    return { range: { start: s, end: e }, events: W.EVENTS.filter((ev) => ev.date >= s && ev.date <= e) };
  });
tool("calendar", "calendar_search_events", "Search calendar events by keyword (title, attendee, location) across all dates.",
  z.object({ query: q }),
  ({ query }) => {
    const n = W.norm(query);
    return { events: W.EVENTS.filter((ev) => W.norm(ev.title).includes(n) || ev.attendees.some((a) => W.norm(a).includes(n)) || W.norm(ev.location).includes(n)) };
  });
tool("calendar", "calendar_get_event", "Get full details of one calendar event by id.",
  z.object({ event_id: z.string() }),
  ({ event_id }) => W.EVENTS.find((e) => e.id === event_id) ?? { error: "not_found" });
tool("calendar", "calendar_create_event", "Create a new calendar event with title, date, start/end time and optional location and attendees.",
  z.object({ title: z.string(), date, start_time: time, end_time: time.optional(), location: z.string().optional(), attendees: z.array(z.string()).optional(), calendar: z.string().optional() }),
  (i) => ({ ok: true, event: { id: W.nextId("ev"), ...i, end_time: i.end_time ?? "" } }));
tool("calendar", "calendar_create_meeting", "Schedule a meeting WITH other people: creates the event, generates a video link and sends invitations to the attendees' emails. For an event without invitees use calendar_create_event.",
  z.object({ title: z.string(), date, start_time: time, duration_minutes: z.number().int().positive(), attendee_emails: z.array(z.string()).min(1), agenda: z.string().optional() }),
  (i) => ({ ok: true, event: { id: W.nextId("ev"), ...i, video_link: "https://meet.example.com/abc-defg-hij", invites_sent: i.attendee_emails } }));
tool("calendar", "calendar_block_time", "Block a time range on the user's own calendar as busy (focus time, travel, out of office) without attendees or invitations. Not for meetings with other people.",
  z.object({ label: z.string(), date, start_time: time, end_time: time, calendar: z.string().optional() }),
  (i) => ({ ok: true, block: { id: W.nextId("blk"), ...i } }));
tool("calendar", "calendar_update_event", "Update fields (title, date, time, location, attendees) of an existing calendar event.",
  z.object({ event_id: z.string(), title: z.string().optional(), date: date.optional(), start_time: time.optional(), end_time: time.optional(), location: z.string().optional() }),
  (i) => ({ ok: true, updated: i }));
tool("calendar", "calendar_delete_event", "Delete (cancel) a calendar event by id.",
  z.object({ event_id: z.string() }),
  ({ event_id }) => ({ ok: true, deleted: event_id }));
tool("calendar", "calendar_find_free_slot", "Find free time slots of a given duration on a date, respecting existing events.",
  z.object({ date, duration_minutes: z.number().int().positive(), earliest: time.optional(), latest: time.optional() }),
  ({ date: d, duration_minutes }) => ({ date: d, duration_minutes, slots: [{ start: "08:00", end: "09:30" }, { start: "11:00", end: "12:30" }, { start: "15:00", end: "18:00" }] }));
tool("calendar", "calendar_respond_invite", "Accept, decline or tentatively accept a calendar invitation.",
  z.object({ event_id: z.string(), response: z.enum(["accept", "decline", "tentative"]) }),
  (i) => ({ ok: true, ...i }));
tool("calendar", "calendar_list_calendars", "List the user's calendars (work, personal, shared…).",
  z.object({}),
  () => ({ calendars: ["Trabalho", "Pessoal", "Família", "Feriados"] }));
tool("calendar", "calendar_set_out_of_office", "Set an out-of-office / away status for a date range with an auto-reply message.",
  z.object({ start_date: date, end_date: date, message: z.string().optional() }),
  (i) => ({ ok: true, ...i }));

// ─── Email (10) ───────────────────────────────────────────────────────────────
tool("email", "email_list_unread", "List unread emails in the inbox (newest first).",
  z.object({ limit: z.number().int().positive().optional() }),
  ({ limit }) => ({ emails: W.EMAILS.filter((e) => e.unread).slice(0, limit ?? 20).map(({ body: _b, ...rest }) => rest) }));
tool("email", "email_search", "Search emails by sender, subject or content keyword.",
  z.object({ query: q, limit: z.number().int().positive().optional() }),
  ({ query, limit }) => {
    const n = W.norm(query);
    return { emails: W.EMAILS.filter((e) => W.norm(e.from).includes(n) || W.norm(e.subject).includes(n) || W.norm(e.body).includes(n)).slice(0, limit ?? 20) };
  });
tool("email", "email_read", "Read the full content of one email by id.",
  z.object({ email_id: z.string() }),
  ({ email_id }) => W.EMAILS.find((e) => e.id === email_id) ?? { error: "not_found" });
tool("email", "email_send", "Send a new email to one or more recipients with subject and body.",
  z.object({ to: z.array(z.string().describe("Recipient email address")).min(1), subject: z.string(), body: z.string(), cc: z.array(z.string()).optional() }),
  (i) => ({ ok: true, message_id: W.nextId("em"), sent_to: i.to, subject: i.subject }));
tool("email", "email_send_later", "Schedule an email to be sent automatically at a future date and time (not now). For sending immediately use email_send.",
  z.object({ to: z.array(z.string()).min(1), subject: z.string(), body: z.string(), send_date: date, send_time: time }),
  (i) => ({ ok: true, scheduled_id: W.nextId("sem"), send_at: `${i.send_date}T${i.send_time}`, to: i.to }));
tool("email", "email_reply", "Reply to an existing email thread by email id.",
  z.object({ email_id: z.string(), body: z.string(), reply_all: z.boolean().optional() }),
  (i) => ({ ok: true, message_id: W.nextId("em"), in_reply_to: i.email_id }));
tool("email", "email_forward", "Forward an existing email to other recipients.",
  z.object({ email_id: z.string(), to: z.array(z.string()).min(1), note: z.string().optional() }),
  (i) => ({ ok: true, forwarded: i.email_id, to: i.to }));
tool("email", "email_draft", "Save an email as a draft without sending it.",
  z.object({ to: z.array(z.string()).optional(), subject: z.string(), body: z.string() }),
  (i) => ({ ok: true, draft_id: W.nextId("dr"), subject: i.subject }));
tool("email", "email_archive", "Archive one or more emails (remove from inbox).",
  z.object({ email_ids: z.array(z.string()).min(1) }),
  ({ email_ids }) => ({ ok: true, archived: email_ids }));
tool("email", "email_label", "Add or remove a label/folder on an email.",
  z.object({ email_id: z.string(), label: z.string(), action: z.enum(["add", "remove"]).optional() }),
  (i) => ({ ok: true, ...i }));

// ─── Reminders & tasks (10) ──────────────────────────────────────────────────
tool("reminders", "reminder_create", "Create a reminder that notifies the user at a specific date and time (optionally repeating).",
  z.object({ text: z.string(), date, time, repeat: z.enum(["none", "daily", "weekly", "monthly"]).optional() }),
  (i) => ({ ok: true, reminder: { id: W.nextId("r"), ...i, repeat: i.repeat ?? "none" } }));
tool("reminders", "reminder_create_location", "Create a location-based reminder that fires when the user arrives at or leaves a place (home, work, an address). For a date/time reminder use reminder_create.",
  z.object({ text: z.string(), place: z.string().describe("e.g. 'home', 'work', or an address"), trigger: z.enum(["arrive", "leave"]).optional() }),
  (i) => ({ ok: true, reminder: { id: W.nextId("rl"), ...i, trigger: i.trigger ?? "arrive" } }));
tool("reminders", "reminder_list", "List upcoming reminders.",
  z.object({ date: date.optional() }),
  ({ date: d }) => ({ reminders: W.REMINDERS.filter((r) => !d || r.at.startsWith(d)) }));
tool("reminders", "reminder_update", "Change the text or time of an existing reminder.",
  z.object({ reminder_id: z.string(), text: z.string().optional(), date: date.optional(), time: time.optional() }),
  (i) => ({ ok: true, updated: i }));
tool("reminders", "reminder_delete", "Delete a reminder by id.",
  z.object({ reminder_id: z.string() }),
  ({ reminder_id }) => ({ ok: true, deleted: reminder_id }));
tool("tasks", "task_create", "Create a to-do task with optional due date, priority and list.",
  z.object({ title: z.string(), due_date: date.optional(), priority: z.enum(["low", "medium", "high"]).optional(), list: z.string().optional(), notes: z.string().optional() }),
  (i) => ({ ok: true, task: { id: W.nextId("t"), done: false, ...i } }));
tool("tasks", "task_create_subtask", "Create a subtask under an existing parent task (requires the parent task id). For a standalone task use task_create.",
  z.object({ parent_task_id: z.string(), title: z.string(), due_date: date.optional(), priority: z.enum(["low", "medium", "high"]).optional() }),
  (i) => ({ ok: true, subtask: { id: W.nextId("st"), ...i } }));
tool("tasks", "task_list", "List to-do tasks, optionally filtered by list, status or due date.",
  z.object({ list: z.string().optional(), include_done: z.boolean().optional(), due_before: date.optional() }),
  ({ list, include_done, due_before }) => ({ tasks: W.TASKS.filter((t) => (!list || W.norm(t.list) === W.norm(list)) && (include_done || !t.done) && (!due_before || t.due <= due_before)) }));
tool("tasks", "task_complete", "Mark a task as done.",
  z.object({ task_id: z.string() }),
  ({ task_id }) => ({ ok: true, completed: task_id }));
tool("tasks", "task_update", "Edit a task's title, due date, priority or notes.",
  z.object({ task_id: z.string(), title: z.string().optional(), due_date: date.optional(), priority: z.enum(["low", "medium", "high"]).optional(), notes: z.string().optional() }),
  (i) => ({ ok: true, updated: i }));
tool("tasks", "task_delete", "Delete a task permanently.",
  z.object({ task_id: z.string() }),
  ({ task_id }) => ({ ok: true, deleted: task_id }));
tool("tasks", "task_prioritize", "Re-order the open tasks by priority and due date and return the suggested order.",
  z.object({ list: z.string().optional() }),
  () => ({ order: W.TASKS.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due)).map((t) => t.id) }));

// ─── Contacts (6) ────────────────────────────────────────────────────────────
tool("contacts", "contacts_search", "Search contacts by name, email or company. Use to find someone's email address or phone number.",
  z.object({ query: q }),
  ({ query }) => ({ contacts: findContact(query) }));
tool("contacts", "contacts_search_by_company", "List all contacts that work at a given company. To find one person by name/email use contacts_search.",
  z.object({ company: z.string() }),
  ({ company }) => ({ contacts: W.CONTACTS.filter((c) => W.norm(c.company).includes(W.norm(company))) }));
tool("contacts", "contacts_get", "Get one contact's full details by contact id.",
  z.object({ contact_id: z.string() }),
  ({ contact_id }) => W.CONTACTS.find((c) => c.id === contact_id) ?? { error: "not_found" });
tool("contacts", "contacts_create", "Create a new contact.",
  z.object({ name: z.string(), email: z.string().optional(), phone: z.string().optional(), company: z.string().optional() }),
  (i) => ({ ok: true, contact: { id: W.nextId("c"), ...i } }));
tool("contacts", "contacts_update", "Update a contact's details.",
  z.object({ contact_id: z.string(), email: z.string().optional(), phone: z.string().optional(), company: z.string().optional(), role: z.string().optional() }),
  (i) => ({ ok: true, updated: i }));
tool("contacts", "contacts_list_birthdays", "List contacts with birthdays in the next N days.",
  z.object({ days: z.number().int().positive().optional() }),
  ({ days }) => ({ within_days: days ?? 30, birthdays: W.CONTACTS.filter((c) => c.birthday.slice(5) >= "09-16" && c.birthday.slice(5) <= "10-16").map((c) => ({ name: c.name, birthday: c.birthday })) }));

// ─── Notes (6) ───────────────────────────────────────────────────────────────
tool("notes", "notes_create", "Create a new note with a title and body.",
  z.object({ title: z.string(), body: z.string() }),
  (i) => ({ ok: true, note: { id: W.nextId("n"), ...i } }));
tool("notes", "notes_create_checklist", "Create a note in CHECKLIST format (each item has a checkbox). For free-text notes use notes_create.",
  z.object({ title: z.string(), items: z.array(z.string()).min(1) }),
  (i) => ({ ok: true, note: { id: W.nextId("n"), title: i.title, items: i.items.map((text) => ({ text, done: false })) } }));
tool("notes", "notes_search", "Search notes by keyword.",
  z.object({ query: q }),
  ({ query }) => { const n = W.norm(query); return { notes: W.NOTES.filter((x) => W.norm(x.title).includes(n) || W.norm(x.body).includes(n)) }; });
tool("notes", "notes_get", "Read one note by id.",
  z.object({ note_id: z.string() }),
  ({ note_id }) => W.NOTES.find((n) => n.id === note_id) ?? { error: "not_found" });
tool("notes", "notes_append", "Append text to the end of an existing note.",
  z.object({ note_id: z.string(), text: z.string() }),
  (i) => ({ ok: true, ...i }));
tool("notes", "notes_delete", "Delete a note by id.",
  z.object({ note_id: z.string() }),
  ({ note_id }) => ({ ok: true, deleted: note_id }));

// ─── Messaging & calls (6) ───────────────────────────────────────────────────
tool("messaging", "message_send", "Send an instant message (WhatsApp/SMS/Telegram) to a contact or phone number. Also used to send the user themself a summary message.",
  z.object({ to: z.string().describe("Contact name, phone number, or 'me' for the user"), text: z.string(), channel: z.enum(["whatsapp", "sms", "telegram"]).optional() }),
  (i) => ({ ok: true, message_id: W.nextId("m"), to: i.to, channel: i.channel ?? "whatsapp" }));
tool("messaging", "message_send_group", "Send an instant message to a GROUP chat by group name (several people at once). For one recipient use message_send.",
  z.object({ group: z.string(), text: z.string(), channel: z.enum(["whatsapp", "telegram"]).optional() }),
  (i) => ({ ok: true, message_id: W.nextId("gm"), group: i.group }));
tool("messaging", "message_read_recent", "Read recent (unread) instant messages.",
  z.object({ limit: z.number().int().positive().optional() }),
  ({ limit }) => ({ messages: W.MESSAGES.slice(0, limit ?? 20) }));
tool("messaging", "message_search", "Search message history by keyword or contact.",
  z.object({ query: q }),
  ({ query }) => { const n = W.norm(query); return { messages: W.MESSAGES.filter((m) => W.norm(m.text).includes(n) || W.norm(m.from).includes(n)) }; });
tool("messaging", "message_schedule", "Schedule an instant message to be sent later at a given date/time.",
  z.object({ to: z.string(), text: z.string(), date, time }),
  (i) => ({ ok: true, scheduled_id: W.nextId("sm"), ...i }));
tool("messaging", "call_start", "Start a phone or video call with a contact.",
  z.object({ contact: z.string(), video: z.boolean().optional() }),
  (i) => ({ ok: true, calling: i.contact, video: i.video ?? false }));

// ─── Travel (10) ─────────────────────────────────────────────────────────────
tool("travel", "flights_search", "Search available flights between two cities/airports on a date, with prices and times. Use before booking.",
  z.object({ from: z.string().describe("Origin city or airport code"), to: z.string().describe("Destination city or airport code"), date, max_price_brl: z.number().optional(), earliest_departure: time.optional(), latest_departure: time.optional() }),
  (i) => ({ query: i, flights: W.FLIGHTS_FRIDAY.filter((f) => (!i.earliest_departure || f.departs >= i.earliest_departure) && (!i.latest_departure || f.departs <= i.latest_departure) && (!i.max_price_brl || f.priceBRL <= i.max_price_brl)) }));
tool("travel", "flights_book", "Book a specific flight by flight id (from flights_search) for the user.",
  z.object({ flight_id: z.string(), passenger_name: z.string().optional(), seat_preference: z.enum(["window", "aisle", "any"]).optional() }),
  ({ flight_id, passenger_name }) => { const f = W.FLIGHTS_FRIDAY.find((x) => x.id === flight_id); return f ? { ok: true, booking_code: "ABC123", passenger: passenger_name ?? W.USER.name, flight: f } : { ok: false, error: "flight_not_found" }; });
tool("travel", "flights_hold", "Put a flight on hold (reserve the seat for 24h WITHOUT paying) by flight id. Use when the user asks to hold/segurar a flight rather than buy it. To pay and confirm use flights_book.",
  z.object({ flight_id: z.string(), passenger_name: z.string().optional() }),
  ({ flight_id, passenger_name }) => { const f = W.FLIGHTS_FRIDAY.find((x) => x.id === flight_id); return f ? { ok: true, hold_code: "HLD-4471", expires_at: "2026-09-18T02:00:00", passenger: passenger_name ?? W.USER.name, flight: f } : { ok: false, error: "flight_not_found" }; });
tool("travel", "flights_status", "Check the live status (on time, delayed, gate) of a flight.",
  z.object({ flight_number: z.string(), date: date.optional() }),
  ({ flight_number }) => ({ flight_number, status: "on_time", gate: "B12" }));
tool("travel", "hotels_search", "Search hotels in a city for a date range.",
  z.object({ city: z.string(), check_in: date, check_out: date, max_price_per_night_brl: z.number().optional() }),
  (i) => ({ hotels: W.HOTELS.filter((h) => W.norm(h.city).includes(W.norm(i.city)) && (!i.max_price_per_night_brl || h.pricePerNightBRL <= i.max_price_per_night_brl)) }));
tool("travel", "hotels_search_nearby", "Search hotels within a radius of a specific address or place (e.g. near a meeting location). For a city-wide search use hotels_search.",
  z.object({ near: z.string().describe("Address or place"), check_in: date, check_out: date, max_distance_km: z.number().positive().optional(), max_price_per_night_brl: z.number().optional() }),
  (i) => ({ near: i.near, hotels: W.HOTELS.filter((h) => (!i.max_distance_km || h.distanceKm <= i.max_distance_km) && (!i.max_price_per_night_brl || h.pricePerNightBRL <= i.max_price_per_night_brl)).map((h) => ({ ...h, distance_km_from_near: h.distanceKm })) }));
tool("travel", "hotels_book", "Book a hotel by hotel id for a date range.",
  z.object({ hotel_id: z.string(), check_in: date, check_out: date, guests: z.number().int().positive().optional() }),
  (i) => ({ ok: true, confirmation: "HTL-7781", ...i }));
tool("travel", "ride_request", "Request a ride (Uber/99) from a pickup location to a destination.",
  z.object({ pickup: z.string(), destination: z.string(), when: z.string().optional().describe("'now' or ISO datetime") }),
  (i) => ({ ok: true, ride_id: W.nextId("ride"), eta_minutes: 6, ...i }));
tool("travel", "ride_estimate", "Estimate price and duration of a ride between two places.",
  z.object({ pickup: z.string(), destination: z.string() }),
  (i) => ({ ...i, price_brl: 38.5, duration_minutes: 22 }));
tool("travel", "directions_get", "Get directions and travel time between two places by car, transit, walking or bike.",
  z.object({ origin: z.string(), destination: z.string(), mode: z.enum(["driving", "transit", "walking", "bicycling"]).optional() }),
  (i) => ({ ...i, duration_minutes: 35, distance_km: 14.2 }));
tool("travel", "trip_itinerary_get", "Get the consolidated itinerary (flights, hotels, events) of an upcoming trip.",
  z.object({ destination: z.string().optional(), date: date.optional() }),
  () => ({ trips: [{ destination: "São Paulo", date: W.FRIDAY, items: ["Reunião com cliente 14:00"] }] }));

// ─── Finance (10) ────────────────────────────────────────────────────────────
tool("finance", "expenses_summary", "Total spending by category for a period (defaults to the current month). Use to answer 'how much did I spend on X'.",
  z.object({ month: z.string().optional().describe("YYYY-MM, defaults to current month"), category: z.string().optional() }),
  ({ month, category }) => {
    const m = month ?? W.monthOf(W.TODAY);
    const txs = W.TRANSACTIONS.filter((t) => W.monthOf(t.date) === m && (!category || W.sameCategory(t.category, category)));
    const byCategory: Record<string, number> = {};
    for (const t of txs) byCategory[t.category] = Math.round(((byCategory[t.category] ?? 0) + t.amountBRL) * 100) / 100;
    return { month: m, total_brl: Math.round(txs.reduce((s, t) => s + t.amountBRL, 0) * 100) / 100, by_category: byCategory, budgets: W.BUDGETS };
  });
tool("finance", "expenses_summary_by_merchant", "Total spending per merchant/establishment for a period, optionally within one category (e.g. which restaurants the user spent most at). For totals per category use expenses_summary.",
  z.object({ month: z.string().optional().describe("YYYY-MM, defaults to current month"), category: z.string().optional() }),
  ({ month, category }) => {
    const m = month ?? W.monthOf(W.TODAY);
    const by: Record<string, number> = {};
    for (const t of W.TRANSACTIONS) if (W.monthOf(t.date) === m && (!category || W.sameCategory(t.category, category))) by[t.merchant] = Math.round(((by[t.merchant] ?? 0) + t.amountBRL) * 100) / 100;
    return { month: m, category: category ?? "all", by_merchant: Object.entries(by).sort((a, b) => b[1] - a[1]).map(([merchant, total_brl]) => ({ merchant, total_brl })) };
  });
tool("finance", "transactions_list", "List individual bank/card transactions for a period, optionally filtered by category or merchant.",
  z.object({ month: z.string().optional(), category: z.string().optional(), merchant: z.string().optional() }),
  ({ month, category, merchant }) => ({ transactions: W.TRANSACTIONS.filter((t) => (!month || W.monthOf(t.date) === month) && (!category || W.sameCategory(t.category, category)) && (!merchant || W.norm(t.merchant).includes(W.norm(merchant)))) }));
tool("finance", "transactions_categorize", "Change the category of a transaction.",
  z.object({ transaction_id: z.string(), category: z.string() }),
  (i) => ({ ok: true, ...i }));
tool("finance", "budget_get", "Get the monthly budget limits per category and how much of each is used.",
  z.object({ category: z.string().optional() }),
  ({ category }) => ({ budgets: category ? { [category]: Object.entries(W.BUDGETS).find(([k]) => W.sameCategory(k, category))?.[1] ?? null } : W.BUDGETS }));
tool("finance", "budget_set", "Set or change the monthly budget limit for a category.",
  z.object({ category: z.string(), limit_brl: z.number().positive() }),
  (i) => ({ ok: true, ...i }));
tool("finance", "bill_list_upcoming", "List upcoming bills and their due dates.",
  z.object({ days: z.number().int().positive().optional() }),
  () => ({ bills: W.BILLS.filter((b) => !b.paid) }));
tool("finance", "bill_pay", "Pay a bill by bill id.",
  z.object({ bill_id: z.string(), amount_brl: z.number().optional() }),
  ({ bill_id }) => ({ ok: true, paid: bill_id, receipt: W.nextId("rc") }));
tool("finance", "transfer_money", "Transfer money (PIX/TED) to a contact or key.",
  z.object({ to: z.string(), amount_brl: z.number().positive(), description: z.string().optional() }),
  (i) => ({ ok: true, transfer_id: W.nextId("tr"), ...i }));
tool("finance", "transfer_money_scheduled", "Schedule a money transfer (PIX/TED) for a FUTURE date. For an immediate transfer use transfer_money.",
  z.object({ to: z.string(), amount_brl: z.number().positive(), date, description: z.string().optional() }),
  (i) => ({ ok: true, scheduled_transfer_id: W.nextId("str"), ...i }));
tool("finance", "invest_portfolio_get", "Get the current investment portfolio balance and allocation.",
  z.object({}),
  () => ({ total_brl: 84250.3, allocation: { "renda fixa": 0.6, ações: 0.3, cripto: 0.1 }, change_30d_pct: 1.8 }));
tool("finance", "currency_convert", "Convert an amount between currencies using today's rate.",
  z.object({ amount: z.number(), from: z.string(), to: z.string() }),
  ({ amount, from, to }) => ({ amount, from, to, rate: 5.32, result: Math.round(amount * 5.32 * 100) / 100 }));

// ─── Health (6) ──────────────────────────────────────────────────────────────
tool("health", "health_log_workout", "Log a workout (type, duration, calories).",
  z.object({ type: z.string(), duration_minutes: z.number().int().positive(), calories: z.number().optional() }),
  (i) => ({ ok: true, workout_id: W.nextId("wk"), ...i }));
tool("health", "health_get_activity", "Get today's steps, active minutes and calories.",
  z.object({ date: date.optional() }),
  ({ date: d }) => ({ date: d ?? W.TODAY, steps: 6420, active_minutes: 38, calories: 410 }));
tool("health", "medication_reminder_set", "Set a recurring medication reminder.",
  z.object({ medication: z.string(), time, repeat: z.enum(["daily", "weekly"]).optional() }),
  (i) => ({ ok: true, reminder_id: W.nextId("med"), ...i }));
tool("health", "appointment_book_doctor", "Book a medical/dental appointment with a doctor or clinic.",
  z.object({ doctor_or_clinic: z.string(), date, time, reason: z.string().optional() }),
  (i) => ({ ok: true, appointment_id: W.nextId("ap"), ...i }));

// ─── Smart home (8) ──────────────────────────────────────────────────────────
tool("home", "home_device_list", "List smart home devices and their current state.",
  z.object({ type: z.string().optional() }),
  ({ type }) => ({ devices: W.DEVICES.filter((d) => !type || d.type === type) }));
tool("home", "home_set_thermostat", "Set the thermostat target temperature and mode.",
  z.object({ temperature_c: z.number(), mode: z.enum(["cool", "heat", "auto", "off"]).optional() }),
  (i) => ({ ok: true, ...i }));
tool("home", "home_lights_control", "Turn lights on/off or set brightness in a room.",
  z.object({ room: z.string(), on: z.boolean(), brightness: z.number().int().min(0).max(100).optional() }),
  (i) => ({ ok: true, ...i }));
tool("home", "home_lights_schedule", "Schedule lights to turn on/off at a given time (does not change them now). To change lights immediately use home_lights_control.",
  z.object({ room: z.string(), on: z.boolean(), time }),
  (i) => ({ ok: true, schedule_id: W.nextId("ls"), ...i }));
tool("home", "home_lock_doors", "Lock or unlock the home doors.",
  z.object({ locked: z.boolean(), door: z.string().optional() }),
  (i) => ({ ok: true, ...i }));
tool("home", "home_camera_status", "Check security camera status and last motion events.",
  z.object({ camera: z.string().optional() }),
  () => ({ cameras: W.DEVICES.filter((d) => d.type === "camera") }));
tool("home", "home_play_music", "Play music (song, artist, playlist) on a smart speaker.",
  z.object({ query: z.string(), speaker: z.string().optional() }),
  (i) => ({ ok: true, now_playing: i.query, speaker: i.speaker ?? "Echo Cozinha" }));
tool("home", "home_set_alarm_system", "Arm or disarm the home security alarm.",
  z.object({ mode: z.enum(["away", "home", "off"]) }),
  (i) => ({ ok: true, ...i }));

// ─── Shopping & food (8) ─────────────────────────────────────────────────────
tool("shopping", "shopping_list_add", "Add one or more items to the shopping list.",
  z.object({ items: z.array(z.string()).min(1) }),
  ({ items }) => ({ ok: true, added: items }));
tool("shopping", "shopping_list_get", "Show the current shopping list.",
  z.object({}),
  () => ({ items: W.SHOPPING_LIST }));
tool("shopping", "shopping_list_remove", "Remove items from the shopping list or mark them bought.",
  z.object({ items: z.array(z.string()).min(1) }),
  ({ items }) => ({ ok: true, removed: items }));
tool("shopping", "product_search", "Search products and prices across online stores.",
  z.object({ query: q, max_price_brl: z.number().optional() }),
  ({ query, max_price_brl }) => { const n = W.norm(query); return { products: W.PRODUCTS.filter((p) => W.norm(p.name).includes(n) && (!max_price_brl || p.priceBRL <= max_price_brl)) }; });
tool("shopping", "order_place", "Place an online order for a product id.",
  z.object({ product_id: z.string(), quantity: z.number().int().positive().optional() }),
  (i) => ({ ok: true, order_id: W.nextId("ord"), ...i }));
tool("shopping", "food_order", "Order food delivery from a restaurant (iFood-style).",
  z.object({ restaurant: z.string(), items: z.array(z.string()).min(1), address: z.string().optional() }),
  (i) => ({ ok: true, order_id: W.nextId("food"), eta_minutes: 40, ...i }));
tool("shopping", "restaurant_reserve", "Reserve a table at a restaurant for a date, time and party size.",
  z.object({ restaurant: z.string(), date, time, party_size: z.number().int().positive() }),
  (i) => ({ ok: true, reservation_id: W.nextId("res"), ...i }));

// ─── Information & utilities (10) ────────────────────────────────────────────
tool("info", "weather_get", "Current weather for a city.",
  z.object({ city: z.string().optional() }),
  ({ city }) => ({ city: city ?? W.USER.homeCity, ...(W.WEATHER[city ?? W.USER.homeCity] ?? { tempC: 25, condition: "Ensolarado", rainPct: 5 }) }));
tool("info", "weather_forecast", "Multi-day weather forecast for a city.",
  z.object({ city: z.string().optional(), days: z.number().int().positive().optional() }),
  ({ city, days }) => ({ city: city ?? W.USER.homeCity, forecast: Array.from({ length: days ?? 3 }, (_, i) => ({ day: i + 1, tempMaxC: 27 - i, tempMinC: 19, condition: i === 1 ? "Chuva" : "Sol" })) }));
tool("info", "news_headlines", "Latest news headlines, optionally by topic.",
  z.object({ topic: z.string().optional(), limit: z.number().int().positive().optional() }),
  ({ topic }) => ({ topic: topic ?? "geral", headlines: ["Banco Central mantém Selic", "Nova linha do metrô inaugurada", "Seleção convocada para amistosos"] }));
tool("info", "web_search", "General web search for information not covered by other tools.",
  z.object({ query: q }),
  ({ query }) => ({ query, results: [{ title: `Resultado para ${query}`, url: "https://example.com", snippet: "…" }] }));
tool("info", "timer_set", "Start a countdown timer for N minutes.",
  z.object({ minutes: z.number().positive(), label: z.string().optional() }),
  (i) => ({ ok: true, timer_id: W.nextId("tm"), ...i }));
tool("info", "alarm_set", "Set an alarm clock for a time (optionally repeating on weekdays).",
  z.object({ time, label: z.string().optional(), repeat_weekdays: z.boolean().optional() }),
  (i) => ({ ok: true, alarm_id: W.nextId("al"), ...i }));

export const TOOL_SPECS: readonly ToolSpec[] = specs;
const byName = new Map(specs.map((s) => [s.name, s]));

export function getSpec(name: string): ToolSpec {
  const spec = byName.get(name);
  if (!spec) throw new Error(`Unknown tool: ${name} (catalog has ${byName.size} of ${specs.length} specs)`);
  return spec;
}

export const TOOL_NAMES: readonly string[] = specs.map((s) => s.name);
