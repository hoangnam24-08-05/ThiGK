import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TourItem, { Tour } from './components/TourItem';
import { formatDate, formatPrice, groupByCity } from './utils/tour';

// TODO: GIỮ NGUYÊN URL mockapi.io của bạn (resource "tours"), không có dấu "/" ở cuối
const API_URL = 'https://6acdcc04f338359cf1c25910.mockapi.io/tours';

// TODO: GIỮ NGUYÊN MSSV – Họ tên của bạn
const STUDENT = '23639071 – Trần Hoàng Nam';

// true  : mục "Tour yêu thích" chỉ hiện khi đang gõ tìm kiếm (ô trống thì chỉ còn danh sách nhóm)
// false : mục "Tour yêu thích" luôn hiện (đúng nguyên văn đề bài)
const HIDE_FAVORITES_WHEN_QUERY_EMPTY = false;

// Alert.alert KHÔNG hiện trên bản Web của Snack -> dùng window.alert khi chạy Web
function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    // @ts-ignore
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TourScreen />
    </SafeAreaProvider>
  );
}

function TourScreen() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  // ---------- GET ----------
  const fetchTours = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const raw = await res.json();
      const data: Tour[] = raw.map((t: any, index: number) => ({
        ...t,
        // mockapi tự tạo id tăng dần 1,2,3...; nếu dữ liệu không có id thì dùng số thứ tự (index + 1)
        id: t.id !== undefined && t.id !== null ? String(t.id) : String(index + 1),
        days: Number(t.days),
        price: Number(t.price),
        seats: Number(t.seats),
        isFavorite: t.isFavorite === true || t.isFavorite === 'true',
      }));
      setTours(data);
    } catch (e) {
      showAlert('Lỗi', 'Không tải được danh sách tour.\n' + String(e));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchTours();
      setLoading(false);
    })();
  }, [fetchTours]);

  // Kéo để làm mới: gọi lại GET, giữ nguyên từ khoá (query không bị reset)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTours();
    setRefreshing(false);
  }, [fetchTours]);

  // ---------- PUT (cập nhật lạc quan) ----------
  const handleToggleFavorite = useCallback(async (id: string, next: boolean) => {
    // đổi state ngay, không chờ API
    setTours((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: next } : t)));
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${API_URL}/${id}`);
    } catch (e) {
      // hoàn tác về trạng thái cũ
      setTours((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: !next } : t)));
      console.log('PUT lỗi:', e);
      showAlert('Lỗi', 'Không cập nhật được yêu thích. Vui lòng thử lại.\n' + String(e));
    }
  }, []);

  const handlePress = useCallback((tour: Tour) => {
    showAlert(
      tour.name,
      `Khởi hành: ${formatDate(tour.departure)}\nSố ngày: ${tour.days} ngày\nGiá: ${formatPrice(tour.price)}`
    );
  }, []);

  // ---------- Lọc + nhóm ----------
  const keyword = query.trim().toLowerCase();

  const sections = useMemo(() => {
    const filtered = keyword
      ? tours.filter((t) => t.name.toLowerCase().includes(keyword))
      : tours;
    return groupByCity(filtered); // nhóm rỗng tự không xuất hiện
  }, [tours, keyword]);

  // Mục yêu thích KHÔNG bị ảnh hưởng bởi ô tìm kiếm (luôn lấy từ toàn bộ tours)
  const favorites = useMemo(() => tours.filter((t) => t.isFavorite), [tours]);

  const favoriteHeader = (
    <View style={styles.favBlock}>
      <Text style={styles.favTitle}>{`Tour yêu thích (${favorites.length})`}</Text>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có tour yêu thích</Text>
      ) : (
        <FlatList
          data={favorites}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TourItem
              tour={item}
              compact
              onPress={handlePress}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        />
      )}
    </View>
  );

  const showFavorites = HIDE_FAVORITES_WHEN_QUERY_EMPTY ? keyword !== '' : true;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tour Việt</Text>
        <Text style={styles.student}>{STUDENT}</Text>
        <TextInput
          style={styles.search}
          placeholder="Tìm tour theo tên..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0a7ea4" style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          // key + extraData: ép danh sách vẽ lại khi từ khoá thay đổi (fix lỗi xoá chữ vẫn còn kết quả cũ)
          key={keyword === '' ? 'all' : 'filtered'}
          extraData={keyword}
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{`${section.title} · ${section.data.length} tour`}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TourItem
              tour={item}
              onPress={handlePress}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          ListHeaderComponent={showFavorites ? favoriteHeader : null}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { textAlign: 'center', marginTop: 24 }]}>
              Không tìm thấy tour phù hợp
            </Text>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f7' },
  header: { backgroundColor: '#0a7ea4', padding: 12, paddingBottom: 14 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  student: { fontSize: 13, color: '#e0f2f7', marginTop: 2, marginBottom: 10 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  favBlock: { paddingTop: 12, paddingBottom: 4 },
  favTitle: { fontSize: 17, fontWeight: '700', marginHorizontal: 12, marginBottom: 8, color: '#222' },
  emptyText: { fontSize: 14, color: '#777', marginHorizontal: 12 },
  sectionHeader: { backgroundColor: '#e3eef2', paddingHorizontal: 12, paddingVertical: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0a5c78' },
});