// screens/Shopping.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Search, ExternalLink } from 'lucide-react-native';

const BRAND = { pink: '#F94081' };

type Item = {
  id: string | number;
  name: string;
  price?: number;
  image?: string;
  link?: string;
  rating?: number;
  reviewCount?: number;
};

export default function Shopping() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    const keyword = q.trim();
    if (!keyword) return;
    setLoading(true);
    setSearched(true);
    try {
      // 👉 우리 프록시 API
      const url = `https://YOUR-DEPLOYMENT.vercel.app/api/coupang/search?keyword=${encodeURIComponent(keyword)}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      console.log(e);
      Alert.alert('검색 오류', '상품을 불러오지 못했어. 잠시 후 다시 시도해줘.');
    } finally {
      setLoading(false);
    }
  }, [q]);

  const open = (link?: string) => {
    if (!link) return;
    WebBrowser.openBrowserAsync(link);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity style={s.card} onPress={() => open(item.link)}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={s.thumb} resizeMode="cover" />
      ) : (
        <View style={[s.thumb, s.noImg]} />
      )}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={s.title}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          {item.price != null && <Text style={s.price}>{item.price.toLocaleString()}원</Text>}
          {(item.rating != null || item.reviewCount != null) && (
            <Text style={s.meta}>
              {item.rating != null ? ` ★ ${item.rating.toFixed ? item.rating.toFixed(1) : item.rating}` : ''}
              {item.reviewCount != null ? `  · 리뷰 ${item.reviewCount.toLocaleString()}` : ''}
            </Text>
          )}
        </View>
      </View>
      <ExternalLink size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="쿠팡에서 검색할 상품을 입력해줘"
          placeholderTextColor="#9CA3AF"
          style={s.input}
          returnKeyType="search"
          onSubmitEditing={search}
        />
        <TouchableOpacity onPress={search} style={s.searchBtn}>
          <Text style={s.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={s.center}>
          <ActivityIndicator />
          <Text style={{ color: '#6B7280', marginTop: 8 }}>불러오는 중…</Text>
        </View>
      )}

      {!loading && items.length === 0 && searched && (
        <View style={s.center}>
          <Text style={{ color: '#6B7280' }}>검색 결과가 없어요</Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id ?? Math.random())}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    backgroundColor: '#FAFAFD', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  input: { flex: 1, color: '#111', marginHorizontal: 8, paddingVertical: 6, fontSize: 15 },
  searchBtn: { backgroundColor: BRAND.pink, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  searchBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff',
    shadowColor: '#eee', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1,
  },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 8 },
  noImg: { backgroundColor: '#F3F4F6' },
  title: { color: '#111', fontSize: 14, fontWeight: '600' },
  price: { color: BRAND.pink, fontWeight: '800', marginRight: 8 },
  meta: { color: '#6B7280', fontSize: 12 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
});
