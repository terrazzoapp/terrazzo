export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1);
  const d = String(date.getDate() + 1);
  const y = date.getFullYear();
  return `${y}.${m.length === 1 ? `0${m}` : m}.${d.length === 1 ? `0${d}` : d}`;
}
