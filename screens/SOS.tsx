// screens/SOS.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AlertTriangle,
  Phone,
  Edit3,
  MapPin,
  RefreshCw,
  Navigation as NavigationIcon,
} from 'lucide-react-native';


type EmergencyContact = { name: string; phone: string };
type SavedHome = { label?: string; address?: string; lat?: number; lng?: number };

const BRAND = { pink: '#F94081', base: '#1E2A38' };
const KEYS = {
  CONTACT: 'sos_contact',
  HOME: 'home_address',
};

export default function SOS() {
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [home, setHome] = useState<SavedHome | null>(null);

  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // 초기 로드: 저장된 연락처/집 정보 가져오기 + 현재 위치 측정
  useEffect(() => {
    (async () => {
      try {
        const [cRaw, hRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.CONTACT),
          AsyncStorage.getItem(KEYS.HOME),
        ]);
        if (cRaw) setContact(JSON.parse(cRaw));
        if (hRaw) setHome(JSON.parse(hRaw));
      } catch {}
      await refreshLocation();
    })();
  }, []);

  const refreshLocation = useCallback(async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '현재 위치를 표시하려면 위치 권한이 필요해.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(current);

      // 역지오코딩
      const rev = await Location.reverseGeocodeAsync({
        latitude: current.lat,
        longitude: current.lng,
      });
      if (rev && rev.length > 0) {
        const item = rev[0];
        const line = [item.region, item.city, item.district, item.street, item.name]
          .filter(Boolean)
          .join(' ');
        setAddress(line || '주소를 찾을 수 없음');
      } else {
        setAddress('주소를 찾을 수 없음');
      }
    } catch (e) {
      setAddress('위치 정보를 가져오지 못했어');
    } finally {
      setLocLoading(false);
    }
  }, []);

  // ===== 응급 버튼 동작 =====
  const onTriggerSOS = useCallback(async () => {
    Vibration.vibrate(200);
    // 여기에: 서버 호출 / SMS 전송 / 푸시 / 위치첨부 등 연결 가능
    // 지금은 전화 또는 SMS로 분기
    const phone = contact?.phone;
    if (!phone) {
      Alert.alert('연락처 없음', '응급 연락처를 먼저 등록해줘.');
      return;
    }
    Alert.alert(
      '응급 신호',
      '어떻게 연락할까?',
      [
        { text: 'SMS 보내기', onPress: () => openSMS(phone) },
        { text: '전화 걸기', onPress: () => openTel(phone), style: 'destructive' },
        { text: '취소', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [contact]);

  const openTel = (phone: string) => Linking.openURL(`tel:${phone}`).catch(() => {});
  const openSMS = (phone: string) => {
    const msg = buildSOSMessage();
    const url = `sms:${phone}${msg ? `?body=${encodeURIComponent(msg)}` : ''}`;
    Linking.openURL(url).catch(() => {});
  };

  const buildSOSMessage = useCallback(() => {
    let msg = '[허수아비] 긴급 도움이 필요해요.';
    if (address) msg += `\n현재 위치: ${address}`;
    if (coords) msg += `\n좌표: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    return msg;
  }, [address, coords]);

  // ===== 편집/등록 (간단 Alert로 처리, 실제로는 별도 모달/화면 추천) =====
  const editContact = () => {
    Alert.alert(
      '연락처 설정',
      '설정 화면에서 편집하도록 연결하거나, 간단히 하드코딩된 예시를 저장할게?',
      [
        {
          text: '예시 저장',
          onPress: async () => {
            const sample = { name: '보호자', phone: '01012345678' };
            await AsyncStorage.setItem(KEYS.CONTACT, JSON.stringify(sample));
            setContact(sample);
          },
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const editHome = () => {
    Alert.alert(
      '집 위치 설정',
      '지금 위치를 집으로 저장할까?',
      [
        {
          text: '저장',
          onPress: async () => {
            if (!coords) {
              Alert.alert('위치 없음', '현재 위치 정보가 없어. 먼저 위치를 새로고침 해줘.');
              return;
            }
            const saved: SavedHome = {
              label: '우리 집',
              address: address || undefined,
              lat: coords.lat,
              lng: coords.lng,
            };
            await AsyncStorage.setItem(KEYS.HOME, JSON.stringify(saved));
            setHome(saved);
          },
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const openMapsToHome = () => {
    if (!home?.lat || !home?.lng) return;
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${home.lat},${home.lng}`,
      android: `geo:${home.lat},${home.lng}?q=${home.lat},${home.lng}(Home)`,
      default: `https://maps.google.com/?q=${home.lat},${home.lng}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const openMapsToCurrent = () => {
    if (!coords) return;
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${coords.lat},${coords.lng}`,
      android: `geo:${coords.lat},${coords.lng}?q=${coords.lat},${coords.lng}(Here)`,
      default: `https://maps.google.com/?q=${coords.lat},${coords.lng}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const currentAddressText = useMemo(() => {
    if (locLoading) return '위치 확인 중...';
    if (address) return address;
    if (coords) return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    return '위치 정보 없음';
  }, [address, coords, locLoading]);

  return (
    <View style={styles.container}>
      {/* 안내 문구 */}
      <Text style={styles.caption}>긴급 상황 시 버튼을 길게 눌러 도움을 요청하세요.</Text>

      {/* 응급 신호 버튼 */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => Alert.alert('안내', '오작동 방지를 위해 길게 눌러주세요.')}
        onLongPress={onTriggerSOS}
        delayLongPress={500}
        style={styles.sosButtonWrap}
      >
        <LinearGradient
          colors={['#F85F9B', BRAND.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sosButton}
        >
          <AlertTriangle color="#fff" size={40} />
          <Text style={styles.sosText}>SOS</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 응급 연락처 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>응급 연락처</Text>
          <TouchableOpacity onPress={editContact} style={styles.iconBtn}>
            <Edit3 size={18} color={BRAND.pink} />
          </TouchableOpacity>
        </View>
        {contact ? (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryText}>{contact.name}</Text>
              <Text style={styles.secondaryText}>{contact.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => openTel(contact.phone)} style={styles.callBtn}>
              <Phone size={18} color="#fff" />
              <Text style={styles.callBtnText}>전화</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.emptyText}>등록된 연락처가 없습니다. 우측 상단에서 추가하세요.</Text>
        )}
      </View>

      {/* 집 위치 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>집 위치</Text>
          <TouchableOpacity onPress={editHome} style={styles.iconBtn}>
            <Edit3 size={18} color={BRAND.pink} />
          </TouchableOpacity>
        </View>
        {home?.address || (home?.lat && home?.lng) ? (
          <View style={styles.row}>
            <MapPin size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryText}>{home.address || '좌표 저장됨'}</Text>
              {home.lat && home.lng && (
                <Text style={styles.secondaryText}>
                  {home.lat.toFixed(5)}, {home.lng.toFixed(5)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={openMapsToHome} style={styles.outlineBtn}>
              <NavigationIcon size={16} color={BRAND.pink} />
              <Text style={styles.outlineBtnText}>지도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.emptyText}>집 주소가 없습니다. 우측 상단에서 현재 위치를 집으로 저장해보세요.</Text>
        )}
      </View>

      {/* 현재 위치 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>현재 위치</Text>
          <TouchableOpacity onPress={refreshLocation} style={styles.iconBtn}>
            {locLoading ? <ActivityIndicator /> : <RefreshCw size={18} color={BRAND.pink} />}
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <MapPin size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.primaryText}>{currentAddressText}</Text>
            {coords && (
              <Text style={styles.secondaryText}>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={openMapsToCurrent} style={styles.outlineBtn}>
            <NavigationIcon size={16} color={BRAND.pink} />
            <Text style={styles.outlineBtnText}>지도</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  caption: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  sosButtonWrap: { alignItems: 'center', marginVertical: 8, marginBottom: 16 },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.pink,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sosText: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  iconBtn: {
    marginLeft: 'auto',
    backgroundColor: '#FFF1F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  primaryText: { color: '#1F2937', fontSize: 15, fontWeight: '600' },
  secondaryText: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  emptyText: { color: '#6B7280', fontSize: 13 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.pink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 8,
  },
  callBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: BRAND.pink,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 8,
    backgroundColor: '#fff',
  },
  outlineBtnText: { color: BRAND.pink, fontSize: 12, fontWeight: '700', marginLeft: 6 },
});
