import type { Tour } from '../components/TourItem';

export type TourSection = { title: string; data: Tour[] };

/** Nhóm tour theo thành phố: nhóm A→Z, tour trong nhóm theo departure tăng dần */
export function groupByCity(tours: Tour[]): TourSection[] {
  const map = new Map<string, Tour[]>();
  tours.forEach((t) => {
    const list = map.get(t.city);
    if (list) list.push(t);
    else map.set(t.city, [t]);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'vi'))
    .map(([title, data]) => ({
      title,
      data: [...data].sort((x, y) => x.departure.localeCompare(y.departure)),
    }));
}

/** "2026-11-05" -> "05/11/2026" */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

/** 0 -> "Hết chỗ", 1–3 -> "Chỉ còn N chỗ", >3 -> "Còn N chỗ" */
export function getSeatLabel(seats: number): string {
  if (seats <= 0) return 'Hết chỗ';
  if (seats <= 3) return `Chỉ còn ${seats} chỗ`;
  return `Còn ${seats} chỗ`;
}

/** 3590000 -> "3.590.000 ₫" */
export function formatPrice(price: number): string {
  return `${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`;
}