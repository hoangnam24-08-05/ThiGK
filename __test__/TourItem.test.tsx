import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import TourItem, { Tour } from '../components/TourItem';

const tour: Tour = {
  id: '7',
  name: 'Đà Lạt mộng mơ',
  city: 'Đà Lạt',
  days: 3,
  price: 3590000,
  seats: 2,
  departure: '2026-11-05',
  image: 'https://example.com/a.jpg',
  isFavorite: false,
};

describe('TourItem - bố cục', () => {
  it('compact: không hiển thị thành phố', () => {
    const { queryByText } = render(
      <TourItem tour={tour} compact onPress={jest.fn()} onToggleFavorite={jest.fn()} />
    );
    expect(queryByText('Đà Lạt')).toBeNull();
  });

  it('không compact: có hiển thị thành phố', () => {
    const { queryByText } = render(
      <TourItem tour={tour} onPress={jest.fn()} onToggleFavorite={jest.fn()} />
    );
    expect(queryByText('Đà Lạt')).not.toBeNull();
  });
});

describe('TourItem - sự kiện', () => {
  it('nhấn tim: onToggleFavorite(id, true) 1 lần, onPress không được gọi', () => {
    const onPress = jest.fn();
    const onToggleFavorite = jest.fn();
    const { getByTestId } = render(
      <TourItem tour={tour} onPress={onPress} onToggleFavorite={onToggleFavorite} />
    );
    fireEvent.press(getByTestId('fav-btn'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith('7', true);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('nhấn tên tour: onPress được gọi với cả object tour', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <TourItem tour={tour} onPress={onPress} onToggleFavorite={jest.fn()} />
    );
    fireEvent.press(getByText('Đà Lạt mộng mơ'));
    expect(onPress).toHaveBeenCalledWith(tour);
  });
});