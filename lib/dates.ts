/** Dates « calendrier » (AAAA-MM-JJ) calculées à l'heure de la boutique (Casablanca). */
const TZ = "Africa/Casablanca";

/** Date du jour à Casablanca, au format AAAA-MM-JJ. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** Ajoute (ou retire) des jours à une date AAAA-MM-JJ. */
export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Nombre de jours entre aujourd'hui et la date (négatif = passée). */
export function daysFromToday(iso: string) {
  const a = new Date(`${todayISO()}T12:00:00Z`).getTime();
  const b = new Date(`${iso}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

/** « lundi 12 octobre » */
export function formatDayLong(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

/** « 12 oct. » */
export function formatDayShort(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

/** « Aujourd'hui », « Demain », « Dans 2 jours », « En retard de 3 jours » */
export function relativeDay(iso: string) {
  const n = daysFromToday(iso);
  if (n === 0) return "Aujourd'hui";
  if (n === 1) return "Demain";
  if (n > 1) return `Dans ${n} jours`;
  return `En retard de ${-n} jour${n < -1 ? "s" : ""}`;
}
