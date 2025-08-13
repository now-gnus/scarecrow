import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  Alert, ActivityIndicator, Platform, Linking, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Updates from 'expo-updates';
import { Phone as PhoneIcon, Mail, MapPin, Edit3, RefreshCw, HelpCircle, LogOut } from 'lucide-react-native';

type EmergencyContact = { name: string; phone: string };
type SavedHome = { label?: string; address?: string; lat?: number; lng?: number };

const BRAND = { pink: '#F94081' };
const KEYS = {
  PHONE: 'profile_phone',
  USERINFO: 'userInfo',
  USER_LOGGED_IN: 'userLoggedIn',
  IS_GUEST: 'isGuest',
  SOS_CONTACT: 'sos_contact',
  HOME: 'home_address',
};

export default function Profile() {
  // 데이터 상태
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [home, setHome] = useState<SavedHome | null>(null);
  const [contact, setContact] = useState<EmergencyContact | null>(null);

  // 위치 상태
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // 편집 모달 상태
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [draftPhone, setDraftPhone] = useState('');
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [draftContact, setDraftContact] = useState<EmergencyContact>({ name: '', phone: '' });

  // 초기 로드
  useEffect(() => {
    (async () => {
      try {
        const [rawUser, rawPhone, rawHome, rawContact] = await Promise.all([
          AsyncStorage.getItem(KEYS.USERINFO),
          AsyncStorage.getItem(KEYS.PHONE),
          AsyncStorage.getItem(KEYS.HOME),
          AsyncStorage.getItem(KEYS.SOS_CONTACT),
        ]);
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u?.email) setEmail(u.email);
        }
        if (rawPhone) setPhone(rawPhone);
        if (rawHome) setHome(JSON.parse(rawHome));
        if (rawContact) setContact(JSON.parse(rawContact));
      } catch {}
      await refreshLocation();
    })();
  }, []);

  // 위치 새로고침
  const refreshLocation = useCallback(async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '현재 위치를 표시하려면 위치 권한이 필요해.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(c);
      const rev = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
      if (rev && rev.length > 0) {
        const it = rev[0];
        const line = [it.region, it.city, it.district, it.street, it.name].filter(Boolean).join(' ');
        setAddress(line || '주소를 찾을 수 없음');
      } else setAddress('주소를 찾을 수 없음');
    } catch {
      setAddress('위치 정보를 가져오지 못했어');
    } finally {
      setLocLoading(false);
    }
  }, []);

  // 집을 현재 위치로 저장
  const saveHomeAsCurrent = async () => {
    if (!coords) {
      Alert.alert('위치 없음', '현재 위치 정보가 없어. 먼저 위치를 새로고침 해줘.');
      return;
    }
    const saved: SavedHome = { label: '우리 집', address: address || undefined, lat: coords.lat, lng: coords.lng };
    await AsyncStorage.setItem(KEYS.HOME, JSON.stringify(saved));
    setHome(saved);
    Alert.alert('완료', '현재 위치를 집으로 저장했어.');
  };

  // 전화번호 저장
  const savePhone = async () => {
    const n = draftPhone.trim();
    if (!n) return Alert.alert('입력 필요', '전화번호를 입력해줘.');
    await AsyncStorage.setItem(KEYS.PHONE, n);
    setPhone(n);
    setEditPhoneOpen(false);
  };

  // 응급 연락처 저장
  const saveContact = async () => {
    const name = draftContact.name.trim();
    const tel = draftContact.phone.trim();
    if (!name || !tel) return Alert.alert('입력 필요', '이름과 전화번호를 모두 입력해줘.');
    await AsyncStorage.setItem(KEYS.SOS_CONTACT, JSON.stringify({ name, phone: tel }));
    setContact({ name, phone: tel });
    setEditContactOpen(false);
  };

  // 도움말/지원
  const openSupport = () => {
    const subject = encodeURIComponent('[허수아비] 앱 문의/지원 요청');
    Linking.openURL(`mailto:support@example.com?subject=${subject}`).catch(() => {});
  };

  // 로그아웃
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.USER_LOGGED_IN, KEYS.IS_GUEST, KEYS.USERINFO]);
      // 앱 리로드하여 App.tsx가 로그인 상태 재평가
      await Updates.reloadAsync();
    } catch {
      // 개발 환경 대체: 리로드 실패 시 경고
      Alert.alert('알림', '앱을 재시작하면 로그아웃이 반영돼요.');
    }
  };

  const currentAddressText = useMemo(() => {
    if (locLoading) return '위치 확인 중...';
    if (address) return address;
    if (coords) return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    return '위치 정보 없음';
  }, [address, coords, locLoading]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      {/* 휴대폰 번호 */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.title}>휴대폰 번호</Text>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              setDraftPhone(phone);
              setEditPhoneOpen(true);
            }}
          >
            <Edit3 size={18} color={BRAND.pink} />
          </TouchableOpacity>
        </View>
        <View style={s.row}>
          <PhoneIcon size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <Text style={s.mainText}>{phone || '미등록'}</Text>
        </View>
      </View>

      {/* 이메일 (로그인 시 자동) */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.title}>이메일</Text>
        </View>
        <View style={s.row}>
          <Mail size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <Text style={s.mainText}>{email || '미등록(로그인 필요)'}</Text>
        </View>
      </View>

      {/* 집 주소 */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.title}>집 주소</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={s.badgeBtn} onPress={saveHomeAsCurrent}>
              <Text style={s.badgeText}>현재 위치로 저장</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.row}>
          <MapPin size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.mainText}>{home?.address || '미등록'}</Text>
            {home?.lat && home?.lng && (
              <Text style={s.subText}>
                {home.lat.toFixed(5)}, {home.lng.toFixed(5)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 현재 위치 */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.title}>현재 위치</Text>
          <TouchableOpacity style={s.iconBtn} onPress={refreshLocation}>
            {locLoading ? <ActivityIndicator /> : <RefreshCw size={18} color={BRAND.pink} />}
          </TouchableOpacity>
        </View>
        <View style={s.row}>
          <MapPin size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.mainText}>{currentAddressText}</Text>
            {coords && (
              <Text style={s.subText}>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 응급 연락처 */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.title}>응급 연락처</Text>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              setDraftContact(contact || { name: '', phone: '' });
              setEditContactOpen(true);
            }}
          >
            <Edit3 size={18} color={BRAND.pink} />
          </TouchableOpacity>
        </View>
        {contact ? (
          <>
            <Text style={s.mainText}>{contact.name}</Text>
            <Text style={s.subText}>{contact.phone}</Text>
          </>
        ) : (
          <Text style={s.emptyText}>등록된 응급 연락처가 없습니다. 우측 상단에서 추가하세요.</Text>
        )}
      </View>

      {/* 도움말/지원 */}
      <TouchableOpacity style={s.rowBtn} onPress={openSupport}>
        <HelpCircle size={18} color="#6B7280" />
        <Text style={s.rowBtnText}>도움말 · 지원</Text>
      </TouchableOpacity>

      {/* 로그아웃 */}
      <TouchableOpacity style={[s.rowBtn, { marginTop: 8 }]} onPress={logout}>
        <LogOut size={18} color="#EF4444" />
        <Text style={[s.rowBtnText, { color: '#EF4444' }]}>로그아웃</Text>
      </TouchableOpacity>

      {/* ====== 전화번호 편집 모달 ====== */}
      <Modal visible={editPhoneOpen} transparent animationType="fade" onRequestClose={() => setEditPhoneOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>전화번호 편집</Text>
            <TextInput
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="01012345678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={s.input}
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.outlineBtn} onPress={() => setEditPhoneOpen(false)}>
                <Text style={s.outlineBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.primaryBtn} onPress={savePhone}>
                <Text style={s.primaryBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====== 응급 연락처 편집 모달 ====== */}
      <Modal visible={editContactOpen} transparent animationType="fade" onRequestClose={() => setEditContactOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>응급 연락처</Text>
            <TextInput
              value={draftContact.name}
              onChangeText={(v) => setDraftContact((p) => ({ ...p, name: v }))}
              placeholder="이름"
              placeholderTextColor="#9CA3AF"
              style={s.input}
            />
            <TextInput
              value={draftContact.phone}
              onChangeText={(v) => setDraftContact((p) => ({ ...p, phone: v }))}
              placeholder="전화번호"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={s.input}
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.outlineBtn} onPress={() => setEditContactOpen(false)}>
                <Text style={s.outlineBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.primaryBtn} onPress={saveContact}>
                <Text style={s.primaryBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#FAFAFD',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 12,
    shadowColor: '#eee',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  row: { flexDirection: 'row', alignItems: 'center' },
  mainText: { color: '#1F2937', fontSize: 15, fontWeight: '600' },
  subText: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  emptyText: { color: '#6B7280', fontSize: 13 },
  iconBtn: {
    marginLeft: 'auto',
    backgroundColor: '#FFF1F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeBtn: {
    borderColor: BRAND.pink, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: '#fff',
  },
  badgeText: { color: BRAND.pink, fontWeight: '700', fontSize: 12 },
  rowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FAFAFD', padding: 14, borderRadius: 12, borderColor: '#EEE', borderWidth: 1,
  },
  rowBtnText: { color: '#111', fontSize: 15, fontWeight: '600' },
  // 모달
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: {
    width: '88%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#EEE', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#FAFAFD', color: '#111', fontSize: 15, marginBottom: 10,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  outlineBtn: { borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  outlineBtnText: { color: '#374151', fontWeight: '700' },
  primaryBtn: { backgroundColor: BRAND.pink, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
});
