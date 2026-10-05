/**
 * Benchmark tasks. Every one is a multi-step personal-assistant request with a
 * condition or an ordering constraint, so the agent has to look something up,
 * decide, and then act.
 *
 * The benchmark persona is a Brazilian user, so `prompt` (the text actually sent
 * to the agent) is in Portuguese and the mock world uses Rio/São Paulo, BRL and
 * PIX. The versioned results in eval-results/ were produced with these exact
 * prompts; do not translate them. `promptEn` and `titlePt` exist only for display.
 *
 *  - `prompt`: the user request sent to the agent (Portuguese). `promptEn`: its English translation.
 *  - `title` / `titlePt`: short English / Portuguese label used by the dashboard and the deck.
 *  - `required`: each inner array is one required step; any listed tool satisfies it.
 *  - `distractors`: near-miss tools with similar names whose use counts as a
 *    wrong-tool call (the classic failure mode when 100 tools are in context).
 *  - `idealToolCalls`: number of tool calls on the ideal path.
 */
export interface BenchmarkPrompt {
  readonly id: string;
  readonly title: string;
  readonly titlePt: string;
  readonly tier: "basic" | "complex";
  readonly prompt: string;
  readonly promptEn: string;
  readonly required: readonly (readonly string[])[];
  readonly distractors: readonly string[];
  readonly idealToolCalls: number;
}

export const PROMPTS: readonly BenchmarkPrompt[] = [
  {
    id: "p1-marina",
    title: "Confirm meeting + reminder",
    titlePt: "Confirmar reunião + lembrete",
    tier: "basic",
    prompt:
      "Amanhã de manhã eu tenho reunião com a Marina? Se sim, manda um email pra ela confirmando o horário e cria um lembrete pra mim 30 minutos antes.",
    promptEn:
      "Do I have a meeting with Marina tomorrow morning? If so, email her confirming the time and create a reminder for me 30 minutes before.",
    // The calendar event already carries Marina's email, so a contact lookup
    // is optional; the ideal path is 3 calls.
    required: [
      ["calendar_list_events", "calendar_search_events"],
      ["email_send", "email_reply"],
      ["reminder_create"],
    ],
    distractors: ["email_send_later", "email_draft", "reminder_create_location", "alarm_set", "calendar_create_event", "calendar_block_time"],
    idealToolCalls: 3,
  },
  {
    id: "p2-voo-sp",
    title: "Flight to São Paulo + calendar",
    titlePt: "Voo pra São Paulo + agenda",
    tier: "basic",
    prompt:
      "Sexta-feira preciso estar em São Paulo pra uma reunião às 14h. Procura o voo mais barato saindo do Rio de manhã, reserva pra mim e coloca o voo na minha agenda.",
    promptEn:
      "On Friday I need to be in São Paulo for a 2 pm meeting. Find the cheapest flight leaving Rio in the morning, book it for me and put the flight on my calendar.",
    required: [["flights_search"], ["flights_book"], ["calendar_create_event", "calendar_block_time"]],
    distractors: ["flights_hold", "calendar_create_meeting", "hotels_search", "ride_request"],
    idealToolCalls: 3,
  },
  {
    id: "p3-orcamento",
    title: "Restaurant spending + task",
    titlePt: "Gastos com restaurante + tarefa",
    tier: "basic",
    prompt:
      "Quanto eu gastei com restaurante esse mês? Se passou de R$ 800, cria uma tarefa pra eu revisar o orçamento e me manda um resumo por mensagem.",
    promptEn:
      "How much did I spend on restaurants this month? If it is over R$ 800, create a task for me to review the budget and send me a summary by message.",
    required: [["expenses_summary", "transactions_list", "budget_get"], ["task_create"], ["message_send"]],
    distractors: ["expenses_summary_by_merchant", "task_create_subtask", "message_send_group", "message_schedule", "email_send"],
    idealToolCalls: 3,
  },
  {
    id: "p4-viagem-completa",
    title: "Full trip: hold flight, nearby hotel, block calendar, notify",
    titlePt: "Viagem completa: segurar voo, hotel perto, bloquear agenda, avisar",
    tier: "complex",
    prompt:
      "Sexta preciso ir a São Paulo pra reunião das 14h na Av. Paulista, 1000. Segura (sem pagar ainda) o voo mais barato saindo do Rio de manhã, acha um hotel a menos de 2 km da reunião por até R$ 500 a noite pra sexta (uma noite), reserva esse hotel, bloqueia minha agenda das 8h às 18h de sexta como 'Viagem SP' e, no final, avisa a Marina por mensagem que a viagem está confirmada.",
    promptEn:
      "On Friday I need to go to São Paulo for a 2 pm meeting at Av. Paulista, 1000. Hold (don't pay yet) the cheapest flight leaving Rio in the morning, find a hotel within 2 km of the meeting for up to R$ 500 a night for Friday (one night), book that hotel, block my calendar from 8 am to 6 pm on Friday as 'Viagem SP' and, at the end, message Marina that the trip is confirmed.",
    required: [
      ["flights_search"],
      ["flights_hold"],
      ["hotels_search_nearby"],
      ["hotels_book"],
      ["calendar_block_time"],
      ["message_send"],
    ],
    distractors: ["flights_book", "hotels_search", "calendar_create_event", "calendar_create_meeting", "message_send_group", "email_send", "email_send_later"],
    idealToolCalls: 6,
  },
  {
    id: "p5-reuniao-time",
    title: "Meeting with invites, subtask and scheduled email",
    titlePt: "Reunião com convites, subtarefa e email agendado",
    tier: "complex",
    prompt:
      "Marca uma reunião de 45 minutos com o Pedro Alves e a Ana Beatriz amanhã à tarde, num horário em que eu esteja livre, mandando convite pros dois. Depois cria uma subtarefa 'Preparar pauta' dentro da minha tarefa 'Revisar proposta comercial' e agenda um email pra Ana com a pauta da reunião pra ser enviado amanhã às 8h.",
    promptEn:
      "Schedule a 45-minute meeting with Pedro Alves and Ana Beatriz tomorrow afternoon at a time when I'm free, sending invites to both. Then create a subtask 'Preparar pauta' inside my task 'Revisar proposta comercial' and schedule an email to Ana with the meeting agenda to be sent tomorrow at 8 am.",
    required: [
      ["calendar_find_free_slot", "calendar_list_events"],
      ["contacts_search", "contacts_search_by_company"],
      ["calendar_create_meeting"],
      ["task_list"],
      ["task_create_subtask"],
      ["email_send_later"],
    ],
    distractors: ["calendar_create_event", "calendar_block_time", "task_create", "email_send", "email_draft", "message_schedule", "reminder_create"],
    // find slot + 1-2 contact lookups + meeting + task list + subtask + scheduled email
    idealToolCalls: 7,
  },
  {
    id: "p6-financas",
    title: "Spending by restaurant, checklist, scheduled PIX and location reminder",
    titlePt: "Gastos por restaurante, checklist, PIX agendado e lembrete por local",
    tier: "complex",
    prompt:
      "Vê em quais restaurantes eu mais gastei esse mês e cria uma nota em formato checklist com os 3 lugares onde mais gastei. Agenda uma transferência de R$ 300 pra minha mãe pro dia 25 e me lembra de olhar a fatura do cartão quando eu chegar em casa.",
    promptEn:
      "Check which restaurants I spent the most at this month and create a checklist note with the top 3 places. Schedule a R$ 300 transfer to my mom for the 25th and remind me to look at the credit card bill when I get home.",
    required: [
      ["expenses_summary_by_merchant", "transactions_list"],
      ["notes_create_checklist"],
      ["transfer_money_scheduled"],
      ["reminder_create_location"],
    ],
    distractors: ["expenses_summary", "notes_create", "transfer_money", "bill_pay", "reminder_create", "alarm_set", "task_create"],
    // optional contacts_search for "mãe" is not counted
    idealToolCalls: 4,
  },
];
