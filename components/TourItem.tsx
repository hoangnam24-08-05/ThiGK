import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate, formatPrice, getSeatLabel } from '../utils/tour';

export type Tour = {
  id: string;
  name: string;
  city: string;
  days: number;
  price: number;
  seats: number;
  departure: string; // "YYYY-MM-DD"
  image: string;
  isFavorite: boolean;
};

export type TourItemProps = {
  tour: Tour;
  compact?: boolean;
  onPress: (tour: Tour) => void;
  onToggleFavorite: (id: string, next: boolean) => void;
};

function TourItem({ tour, compact = false, onPress, onToggleFavorite }: TourItemProps) {
  const lowSeats = tour.seats <= 3;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.body, compact && styles.bodyCompact]}
        onPress={() => onPress(tour)}
      >
        <Image
          source={{ uri: tour.image }}
          style={[styles.image, compact && styles.imageCompact]}
        />
        <View style={[styles.info, compact && styles.infoCompact]}>
          <Text style={styles.name} numberOfLines={compact ? 1 : 2}>
            {tour.name}
          </Text>

          {!compact && <Text style={styles.city}>{tour.city}</Text>}
          {!compact && (
            <Text style={styles.meta}>
              {`📅 ${formatDate(tour.departure)} · ${tour.days} ngày`}
            </Text>
          )}

          <Text style={styles.price}>{formatPrice(tour.price)}</Text>

          {!compact && (
            <Text style={[styles.seats, lowSeats && styles.seatsLow]}>
              {getSeatLabel(tour.seats)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        testID="fav-btn"
        style={[styles.fav, compact && styles.favCompact]}
        onPress={() => onToggleFavorite(tour.id, !tour.isFavorite)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.heart, tour.isFavorite && styles.heartOn]}>
          {tour.isFavorite ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(TourItem);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  body: { flex: 1, flexDirection: 'row' },
  image: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#ddd' },
  info: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#222' },
  city: { fontSize: 13, color: '#666', marginTop: 2 },
  meta: { fontSize: 12, color: '#444', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#0a7ea4', marginTop: 4 },
  seats: { fontSize: 12, color: '#2e7d32', marginTop: 2 },
  seatsLow: { color: '#d32f2f', fontWeight: '600' },
  fav: { paddingLeft: 8, alignSelf: 'center' },
  heart: { fontSize: 26, color: '#999' },
  heartOn: { color: '#e53935' },

  cardCompact: {
    width: 160,
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 0,
    marginHorizontal: 0,
    marginVertical: 4,
    overflow: 'hidden',
  },
  bodyCompact: { flexDirection: 'column' },
  imageCompact: {
    width: '100%',
    height: undefined,
    aspectRatio: 4 / 3,
    borderRadius: 0,
  },
  infoCompact: { marginLeft: 0, padding: 8 },
  favCompact: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingLeft: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});