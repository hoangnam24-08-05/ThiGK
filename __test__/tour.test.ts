import { formatDate, getSeatLabel, groupByCity } from '../utils/tour';
import type { Tour } from '../components/TourItem';

const make = (id: string, city: string, departure: string): Tour => ({
  id,
  name: `Tour ${id}`,
  city,
  days: 3,
  price: 1000000,
  seats: 5,
  departure,
  image: 'https://example.com/a.jpg',
  isFavorite: false,
});

const tours: Tour[] = [
  make('1', 'Nha Trang', '2026-12-01'),
  make('2', 'Đà Lạt', '2026-11-20'),
  make('3', 'Hà Nội', '2026-11-10'),
  make('4', 'Đà Lạt', '2026-11-05'),
  make('5', 'Đà Lạt', '2026-12-15'),
];

describe('groupByCity', () => {
  const result = groupByCity(tours);

  it('trả về đúng số nhóm', () => {
    expect(result).toHaveLength(3);
  });

  it('sắp xếp tên thành phố A → Z', () => {
    expect(result.map((s) => s.title)).toEqual(['Đà Lạt', 'Hà Nội', 'Nha Trang']);
  });

  it('tour trong nhóm sắp theo departure tăng dần', () => {
    const daLat = result.find((s) => s.title === 'Đà Lạt')!;
    expect(daLat.data.map((t) => t.departure)).toEqual(['2026-11-05', '2026-11-20', '2026-12-15']);
  });
});

describe('formatDate', () => {
  it('đổi YYYY-MM-DD sang DD/MM/YYYY', () => {
    expect(formatDate('2026-11-05')).toBe('05/11/2026');
  });
});

describe('getSeatLabel', () => {
  it('giá trị biên 0 / 3 / 4', () => {
    expect(getSeatLabel(0)).toBe('Hết chỗ');
    expect(getSeatLabel(3)).toBe('Chỉ còn 3 chỗ');
    expect(getSeatLabel(4)).toBe('Còn 4 chỗ');
  });
});
