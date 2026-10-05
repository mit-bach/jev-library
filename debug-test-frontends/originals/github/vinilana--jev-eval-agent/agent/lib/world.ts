/**
 * Deterministic mock "world" shared by all 100 tools, so that multi-step tasks
 * have consistent data to chain on (and both branches see identical facts).
 *
 * Today = 2026-09-16 (Wednesday). Tomorrow = 09-17 (Thu). Friday = 09-18.
 */
export const TODAY = "2026-09-16";
export const TOMORROW = "2026-09-17";
export const FRIDAY = "2026-09-18";

export const USER = {
  name: "Vinícius Lana",
  email: "vinicius@example.com",
  phone: "+55 21 99999-0000",
  homeCity: "Rio de Janeiro",
  homeAirport: "SDU",
  timezone: "America/Sao_Paulo",
};

export const CONTACTS = [
  { id: "c_marina", name: "Marina Costa", email: "marina.costa@example.com", phone: "+55 11 98888-1111", company: "Acme Ltda", role: "Head de Produto", birthday: "1990-03-12" },
  { id: "c_pedro", name: "Pedro Alves", email: "pedro.alves@example.com", phone: "+55 21 97777-2222", company: "Studio Alves", role: "Designer", birthday: "1988-09-20" },
  { id: "c_ana", name: "Ana Beatriz Souza", email: "ana.souza@example.com", phone: "+55 31 96666-3333", company: "Contab & Cia", role: "Contadora", birthday: "1985-11-02" },
  { id: "c_dr", name: "Dra. Helena Martins", email: "helena@clinicavida.com", phone: "+55 21 3333-4444", company: "Clínica Vida", role: "Dentista", birthday: "1979-06-30" },
  { id: "c_mae", name: "Mãe (Regina)", email: "regina.lana@example.com", phone: "+55 21 95555-1234", company: "", role: "Família", birthday: "1962-09-25" },
];

export const EVENTS = [
  { id: "ev_1", title: "Daily do time", date: TODAY, start: "09:30", end: "09:45", location: "Google Meet", attendees: ["pedro.alves@example.com"], calendar: "Trabalho" },
  { id: "ev_2", title: "Dentista - Dra. Helena", date: TODAY, start: "16:00", end: "17:00", location: "Clínica Vida, Botafogo", attendees: [], calendar: "Pessoal" },
  { id: "ev_3", title: "Reunião com Marina Costa - roadmap Q4", date: TOMORROW, start: "10:00", end: "11:00", location: "Google Meet", attendees: ["marina.costa@example.com"], calendar: "Trabalho" },
  { id: "ev_4", title: "Almoço com Pedro", date: TOMORROW, start: "12:30", end: "13:30", location: "Restaurante Zazá, Ipanema", attendees: ["pedro.alves@example.com"], calendar: "Pessoal" },
  { id: "ev_5", title: "Reunião com cliente (São Paulo)", date: FRIDAY, start: "14:00", end: "15:30", location: "Av. Paulista, 1000 - SP", attendees: [], calendar: "Trabalho" },
];

export const EMAILS = [
  { id: "em_1", from: "marina.costa@example.com", to: USER.email, subject: "Pauta da reunião de amanhã", date: `${TODAY}T08:12:00`, unread: true, body: "Oi Vinícius, segue a pauta: roadmap Q4, contratações e budget. Confirma o horário das 10h?", labels: ["inbox", "trabalho"] },
  { id: "em_2", from: "no-reply@nubank.com.br", to: USER.email, subject: "Sua fatura de setembro está disponível", date: `${TODAY}T07:00:00`, unread: true, body: "Sua fatura no valor de R$ 3.412,90 vence em 25/09.", labels: ["inbox", "financeiro"] },
  { id: "em_3", from: "pedro.alves@example.com", to: USER.email, subject: "Layouts v2", date: "2026-09-15T18:40:00", unread: false, body: "Mandei os layouts v2 no Figma, dá uma olhada quando puder.", labels: ["inbox", "trabalho"] },
  { id: "em_4", from: "promo@lojaexemplo.com", to: USER.email, subject: "50% OFF só hoje!", date: "2026-09-15T10:00:00", unread: true, body: "Promoções imperdíveis.", labels: ["inbox", "promoções"] },
];

export const TASKS = [
  { id: "t_1", title: "Revisar proposta comercial", due: TOMORROW, priority: "high", done: false, list: "Trabalho" },
  { id: "t_2", title: "Comprar presente da mãe", due: "2026-09-24", priority: "medium", done: false, list: "Pessoal" },
  { id: "t_3", title: "Enviar NF de agosto", due: "2026-09-10", priority: "high", done: true, list: "Trabalho" },
];

export const REMINDERS = [
  { id: "r_1", text: "Tomar remédio", at: `${TODAY}T22:00:00`, repeat: "daily" },
  { id: "r_2", text: "Ligar para a contadora", at: `${TOMORROW}T15:00:00`, repeat: "none" },
];

export const NOTES = [
  { id: "n_1", title: "Ideias para o Q4", body: "- Onboarding novo\n- Integração com WhatsApp\n- Métricas de retenção", updated: "2026-09-14" },
  { id: "n_2", title: "Lista de leitura", body: "- Thinking, Fast and Slow\n- The Mom Test", updated: "2026-09-10" },
];

export const MESSAGES = [
  { id: "m_1", from: "Pedro Alves", channel: "whatsapp", text: "Almoço amanhã confirmado?", at: `${TODAY}T09:05:00`, unread: true },
  { id: "m_2", from: "Mãe (Regina)", channel: "whatsapp", text: "Me liga quando puder", at: "2026-09-15T20:11:00", unread: true },
];

export const FLIGHTS_FRIDAY = [
  { id: "fl_1", airline: "LATAM", flight: "LA3002", from: "SDU", to: "CGH", date: FRIDAY, departs: "06:30", arrives: "07:35", priceBRL: 389.0, seatsLeft: 4 },
  { id: "fl_2", airline: "GOL", flight: "G31404", from: "SDU", to: "CGH", date: FRIDAY, departs: "08:00", arrives: "09:05", priceBRL: 312.0, seatsLeft: 9 },
  { id: "fl_3", airline: "Azul", flight: "AD4130", from: "SDU", to: "CGH", date: FRIDAY, departs: "09:45", arrives: "10:50", priceBRL: 455.0, seatsLeft: 2 },
  { id: "fl_4", airline: "GOL", flight: "G31410", from: "SDU", to: "CGH", date: FRIDAY, departs: "11:30", arrives: "12:35", priceBRL: 298.0, seatsLeft: 6 },
  { id: "fl_5", airline: "LATAM", flight: "LA3010", from: "SDU", to: "CGH", date: FRIDAY, departs: "15:00", arrives: "16:05", priceBRL: 280.0, seatsLeft: 12 },
];

export const HOTELS = [
  { id: "h_1", name: "Hotel Paulista Plaza", city: "São Paulo", pricePerNightBRL: 420, rating: 4.4, distanceKm: 0.6 },
  { id: "h_2", name: "Ibis Paulista", city: "São Paulo", pricePerNightBRL: 260, rating: 4.0, distanceKm: 1.1 },
  { id: "h_3", name: "Tivoli Mofarrej", city: "São Paulo", pricePerNightBRL: 1250, rating: 4.8, distanceKm: 0.9 },
];

export const TRANSACTIONS = [
  { id: "tx_1", date: "2026-09-02", merchant: "Restaurante Zazá", category: "restaurante", amountBRL: 186.5 },
  { id: "tx_2", date: "2026-09-03", merchant: "Uber", category: "transporte", amountBRL: 32.9 },
  { id: "tx_3", date: "2026-09-05", merchant: "Sushi Leblon", category: "restaurante", amountBRL: 240.0 },
  { id: "tx_4", date: "2026-09-06", merchant: "Supermercado Zona Sul", category: "mercado", amountBRL: 412.3 },
  { id: "tx_5", date: "2026-09-09", merchant: "Pizzaria Guanabara", category: "restaurante", amountBRL: 128.0 },
  { id: "tx_6", date: "2026-09-11", merchant: "Netflix", category: "assinaturas", amountBRL: 55.9 },
  { id: "tx_7", date: "2026-09-12", merchant: "Bar do Momo", category: "restaurante", amountBRL: 198.0 },
  { id: "tx_8", date: "2026-09-14", merchant: "Farmácia Pacheco", category: "saúde", amountBRL: 89.7 },
  { id: "tx_9", date: "2026-09-15", merchant: "Outback", category: "restaurante", amountBRL: 190.0 },
  { id: "tx_10", date: "2026-08-28", merchant: "Restaurante Zazá", category: "restaurante", amountBRL: 150.0 },
];

export const BUDGETS: Record<string, number> = {
  restaurante: 800,
  mercado: 1200,
  transporte: 400,
  assinaturas: 200,
  saúde: 300,
  lazer: 500,
};

export const BILLS = [
  { id: "b_1", name: "Fatura Nubank", due: "2026-09-25", amountBRL: 3412.9, paid: false },
  { id: "b_2", name: "Aluguel", due: "2026-09-30", amountBRL: 3800.0, paid: false },
  { id: "b_3", name: "Internet", due: "2026-09-18", amountBRL: 129.9, paid: false },
];

export const DEVICES = [
  { id: "d_1", name: "Termostato Sala", type: "thermostat", state: { temperatureC: 23, mode: "cool" } },
  { id: "d_2", name: "Luz Sala", type: "light", state: { on: false, brightness: 80 } },
  { id: "d_3", name: "Luz Quarto", type: "light", state: { on: true, brightness: 40 } },
  { id: "d_4", name: "Fechadura Porta", type: "lock", state: { locked: true } },
  { id: "d_5", name: "Câmera Entrada", type: "camera", state: { recording: true, motionLast: `${TODAY}T07:41:00` } },
  { id: "d_6", name: "Echo Cozinha", type: "speaker", state: { playing: false } },
];

export const SHOPPING_LIST = [
  { id: "s_1", item: "Café", qty: 1, done: false },
  { id: "s_2", item: "Leite", qty: 2, done: false },
  { id: "s_3", item: "Pão integral", qty: 1, done: true },
];

export const PRODUCTS = [
  { id: "p_1", name: "Fone Bluetooth XYZ", priceBRL: 249.9, store: "Amazon", rating: 4.5, deliveryDays: 2 },
  { id: "p_2", name: "Fone Bluetooth ABC Pro", priceBRL: 399.0, store: "Mercado Livre", rating: 4.7, deliveryDays: 3 },
  { id: "p_3", name: "Livro: The Mom Test", priceBRL: 89.0, store: "Amazon", rating: 4.8, deliveryDays: 1 },
];

export const WEATHER: Record<string, { tempC: number; condition: string; rainPct: number }> = {
  "Rio de Janeiro": { tempC: 28, condition: "Ensolarado", rainPct: 10 },
  "São Paulo": { tempC: 19, condition: "Nublado", rainPct: 60 },
  "Belo Horizonte": { tempC: 24, condition: "Parcialmente nublado", rainPct: 20 },
};

let seq = 100;
export function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq}`;
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** Loose category match: "restaurantes" ~ "restaurante", "saude" ~ "saúde". */
export function sameCategory(a: string | undefined | null, b: string | undefined | null): boolean {
  const x = norm(a).replace(/s$/, ""), y = norm(b).replace(/s$/, "");
  return !!x && !!y && (x === y || x.startsWith(y) || y.startsWith(x));
}

export function norm(s: string | undefined | null): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
