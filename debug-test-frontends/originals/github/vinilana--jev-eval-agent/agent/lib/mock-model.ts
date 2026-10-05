import { mockModel } from "eve/evals";

/**
 * Offline stand-in for Gemini used by `AGENT_MODEL=mock`. It follows a scripted
 * plan keyed by a keyword of the user prompt so the whole pipeline (dynamic
 * tools, eval harness, result files, dashboard) can be exercised without keys.
 */
export const PLANS: { match: RegExp; calls: { name: string; input: Record<string, unknown> }[] }[] = [
  {
    match: /segura|sem pagar/i,
    calls: [
      { name: "flights_search", input: { from: "SDU", to: "CGH", date: "2026-09-18", latest_departure: "12:00" } },
      { name: "flights_hold", input: { flight_id: "fl_4" } },
      { name: "hotels_search_nearby", input: { near: "Av. Paulista, 1000", check_in: "2026-09-18", check_out: "2026-09-19", max_distance_km: 2, max_price_per_night_brl: 500 } },
      { name: "hotels_book", input: { hotel_id: "h_1", check_in: "2026-09-18", check_out: "2026-09-19" } },
      { name: "calendar_block_time", input: { label: "Viagem SP", date: "2026-09-18", start_time: "08:00", end_time: "18:00" } },
      { name: "message_send", input: { to: "Marina Costa", text: "Viagem confirmada!" } },
    ],
  },
  {
    match: /subtarefa|pauta/i,
    calls: [
      { name: "calendar_find_free_slot", input: { date: "2026-09-17", duration_minutes: 45, earliest: "13:00" } },
      { name: "contacts_search", input: { query: "Pedro Alves" } },
      { name: "contacts_search", input: { query: "Ana Beatriz" } },
      { name: "calendar_create_meeting", input: { title: "Alinhamento", date: "2026-09-17", start_time: "15:00", duration_minutes: 45, attendee_emails: ["pedro.alves@example.com", "ana.souza@example.com"] } },
      { name: "task_list", input: {} },
      { name: "task_create_subtask", input: { parent_task_id: "t_1", title: "Preparar pauta" } },
      { name: "email_send_later", input: { to: ["ana.souza@example.com"], subject: "Pauta", body: "Pauta da reunião", send_date: "2026-09-17", send_time: "08:00" } },
    ],
  },
  {
    match: /checklist|transfer/i,
    calls: [
      { name: "expenses_summary_by_merchant", input: { category: "restaurante" } },
      { name: "notes_create_checklist", input: { title: "Restaurantes onde mais gastei", items: ["Sushi Leblon", "Bar do Momo", "Outback"] } },
      { name: "transfer_money_scheduled", input: { to: "Mãe (Regina)", amount_brl: 300, date: "2026-09-25" } },
      { name: "reminder_create_location", input: { text: "Olhar a fatura do cartão", place: "home", trigger: "arrive" } },
    ],
  },
  {
    match: /marina/i,
    calls: [
      { name: "calendar_list_events", input: { start_date: "2026-09-17" } },
      { name: "contacts_search", input: { query: "Marina" } },
      { name: "email_send", input: { to: ["marina.costa@example.com"], subject: "Confirmação da reunião de amanhã", body: "Oi Marina, confirmo nossa reunião amanhã às 10h. Abraço, Vinícius" } },
      { name: "reminder_create", input: { text: "Reunião com Marina Costa", date: "2026-09-17", time: "09:30" } },
    ],
  },
  {
    match: /s[ãa]o paulo|voo/i,
    calls: [
      { name: "flights_search", input: { from: "SDU", to: "CGH", date: "2026-09-18", latest_departure: "12:00" } },
      { name: "flights_book", input: { flight_id: "fl_2" } },
      { name: "calendar_create_event", input: { title: "Voo GOL G31404 SDU→CGH", date: "2026-09-18", start_time: "08:00", end_time: "09:05" } },
    ],
  },
  {
    match: /restaurante|gastei/i,
    calls: [
      { name: "expenses_summary", input: { category: "restaurante" } },
      { name: "task_create", input: { title: "Revisar orçamento de restaurantes", priority: "high" } },
      { name: "message_send", input: { to: "me", text: "Resumo: R$ 942,50 em restaurantes este mês, acima do orçamento de R$ 800." } },
    ],
  },
];

export function buildMockModel() {
  return mockModel({
    modelId: "mock-gemini",
    provider: "mock",
    respond: ({ lastUserMessage, toolResults, tools }) => {
      const plan = PLANS.find((p) => p.match.test(lastUserMessage ?? ""));
      const available = new Set(tools.map((t) => t.name));
      const next = plan?.calls[toolResults.length];
      if (next && available.has(next.name)) {
        return { toolCalls: [{ name: next.name, input: next.input }] };
      }
      // Classifier branch exposes one tool at a time: call it with the planned input if it matches.
      if (tools.length === 1 && plan) {
        const planned = plan.calls.find((c) => c.name === tools[0]!.name);
        if (planned && toolResults.length < plan.calls.length + 2) {
          return { toolCalls: [{ name: planned.name, input: planned.input }] };
        }
      }
      return `Pronto. Executei ${toolResults.length} ação(ões) para: "${lastUserMessage}".`;
    },
  });
}
