import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import * as IntentLauncher from 'expo-intent-launcher';
import { Shield, CheckCircle2, XCircle, AlertCircle, Mic, MapPin, Phone, Users, HardDrive, Bluetooth, MessageSquare } from 'lucide-react-native';
import Constants from 'expo-constants';


type PState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

const BRAND = { pink: '#F94081', base: '#1E2A38' };

export default function PermissionsScreen({ navigation }: any) {
  // 요청 가능한 권한 상태
  const [loc, setLoc] = useState<PState>('undetermined');
  const [mic, setMic] = useState<PState>('undetermined');
  const [contacts, setContacts] = useState<PState>('undetermined');
  const [media, setMedia] = useState<PState>('undetermined');

  // 요청 불가(설정 바로가기만) 항목: 전화, 근처기기(블루투스), SMS
  const phone: PState = 'unavailable';
  const nearby: PState = Platform.OS === 'android' ? 'denied' : 'unavailable'; // 안내용
  const sms: PState = Platform.OS === 'android' ? 'denied' : 'unavailable';   // 안내용

  useEffect(() => {
    (async () => {
      // 위치
      const l = await Location.getForegroundPermissionsAsync();
      setLoc(mapExpoStatus(l.status));
      // 마이크
      const m = await Audio.getPermissionsAsync();
      setMic(mapExpoStatus(m.status));
      // 연락처
      const c = await Contacts.getPermissionsAsync();
      setContacts(mapExpoStatus(c.status));
      // 미디어/파일
      const md = await MediaLibrary.getPermissionsAsync();
      setMedia(mapExpoStatus(md.status));
    })();
  }, []);

  const allDone = useMemo(() => {
    // 앱 내에서 직접 요청 가능한 항목들만 기준
    return [loc, mic, contacts, media].every((s) => s === 'granted');
  }, [loc, mic, contacts, media]);

  // ===== 요청 핸들러 =====
  const reqLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLoc(mapExpoStatus(status));
  };
  const reqMic = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setMic(mapExpoStatus(status));
  };
  const reqContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setContacts(mapExpoStatus(status));
  };
  const reqMedia = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setMedia(mapExpoStatus(status));
  };

  const openAppSettings = () => {
  if (Platform.OS === 'android') {
    // 앱 패키지명 안전하게 가져오기
    const pkg = Constants.expoConfig?.android?.package ?? '';
    IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: 'package:' + pkg }  // ✅ 결합 전에 nullish 처리
    ).catch(() => {});
  } else {
    Alert.alert('안내', '설정 > 허수아비에서 권한을 변경해줘.');
  }
};


  const openBluetoothSettings = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS).catch(() => {});
    } else {
      Alert.alert('안내', 'iOS는 설정 > Bluetooth에서 기기 연결을 관리해줘.');
    }
  };

  const openPhoneSettings = () => {
    // CALL_PHONE 같은 권한은 Managed Expo에선 직접 요청 불가 → 앱 세부 설정으로 유도
    openAppSettings();
  };

  const openSmsSettings = () => {
    if (Platform.OS === 'android') {
      // 특정 권한 토글로 바로 이동은 제한적 → 앱 상세/기본 앱 관리로 유도
      IntentLauncher.startActivityAsync('android.settings.APP_NOTIFICATION_SETTINGS' as any).catch(() => {
        openAppSettings();
      });
    } else {
      Alert.alert('안내', 'iOS는 기본 SMS 권한이 앱별 토글로 제공되지 않아요.');
    }
  };

  const grantAll = async () => {
    await reqLocation();
    await reqMic();
    await reqContacts();
    await reqMedia();
    Alert.alert('완료', '요청 가능한 권한을 모두 처리했어.');
  };

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 20 }}>
      <LinearGradient
        colors={[BRAND.base, BRAND.base]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Shield size={36} color="#fff" />
        <Text style={styles.title}>필수 권한 설정</Text>
        <Text style={styles.subtitle}>안전 기능을 제대로 쓰려면 아래 권한을 허용해줘</Text>
      </LinearGradient>

      <View style={{ padding: 16 }}>
        {/* 위치 */}
        <PermissionItem
          icon={<MapPin size={18} color="#6B7280" />}
          title="위치"
          desc="현재 위치 첨부 및 지도 연동"
          state={loc}
          onRequest={reqLocation}
          onSettings={openAppSettings}
        />
        {/* 마이크 */}
        <PermissionItem
          icon={<Mic size={18} color="#6B7280" />}
          title="마이크"
          desc="음성 메시지 재생/녹음(향후 기능) 이용"
          state={mic}
          onRequest={reqMic}
          onSettings={openAppSettings}
        />
        {/* 연락처 */}
        <PermissionItem
          icon={<Users size={18} color="#6B7280" />}
          title="연락처"
          desc="응급 연락처 자동 선택/표시"
          state={contacts}
          onRequest={reqContacts}
          onSettings={openAppSettings}
        />
        {/* 파일/미디어 */}
        <PermissionItem
          icon={<HardDrive size={18} color="#6B7280" />}
          title="파일 및 미디어"
          desc="오디오 캐시/저장 및 미디어 접근"
          state={media}
          onRequest={reqMedia}
          onSettings={openAppSettings}
        />
        {/* 근처 기기(블루투스) */}
        <PermissionItem
          icon={<Bluetooth size={18} color="#6B7280" />}
          title="근처 기기(블루투스)"
          desc="블루투스 스피커로 재생 (Android 12+)"
          state={nearby}
          requestLabel="설정 열기"
          onRequest={openBluetoothSettings}
          onSettings={openBluetoothSettings}
          requestOnlySettings
        />
        {/* 전화 */}
        <PermissionItem
          icon={<Phone size={18} color="#6B7280" />}
          title="전화"
          desc="전화걸기(다이얼러 열기) 사용 — 직접 권한 토글은 설정에서"
          state={phone}
          requestLabel="앱 설정"
          onRequest={openPhoneSettings}
          onSettings={openPhoneSettings}
          requestOnlySettings
        />
        {/* SMS */}
        <PermissionItem
          icon={<MessageSquare size={18} color="#6B7280" />}
          title="SMS"
          desc="긴급 문자 전송 — 권한은 시스템 설정에서 관리"
          state={sms}
          requestLabel="SMS 설정"
          onRequest={openSmsSettings}
          onSettings={openSmsSettings}
          requestOnlySettings
        />

        {/* 액션 버튼 */}
        <View style={{ marginTop: 16, gap: 8 }}>
          <TouchableOpacity onPress={grantAll} style={styles.primaryBtn} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>요청 가능한 권한 모두 허용</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!allDone) {
                Alert.alert('권한 미완료', '요청 가능한 권한을 우선 허용해줘.');
                return;
              }
              goHome();
            }}
            style={[styles.ghostBtn, !allDone && { opacity: 0.7 }]}
            activeOpacity={0.9}
          >
            <Text style={styles.ghostBtnText}>홈으로 이동</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function mapExpoStatus(s: Location.PermissionStatus | Contacts.PermissionStatus | MediaLibrary.PermissionStatus | 'granted' | 'denied' | 'undetermined'): PState {
  if (s === 'granted') return 'granted';
  if (s === 'denied') return 'denied';
  return 'undetermined';
}

function StateBadge({ state }: { state: PState }) {
  const content =
    state === 'granted' ? { color: '#16A34A', icon: <CheckCircle2 size={14} color="#16A34A" />, label: '허용됨' } :
    state === 'denied' ? { color: '#EF4444', icon: <XCircle size={14} color="#EF4444" />, label: '거부됨' } :
    state === 'unavailable' ? { color: '#9CA3AF', icon: <AlertCircle size={14} color="#9CA3AF" />, label: '설정에서 관리' } :
    { color: '#F59E0B', icon: <AlertCircle size={14} color="#F59E0B" />, label: '요청 가능' };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {content.icon}
      <Text style={{ color: content.color, fontWeight: '700', fontSize: 12 }}>{content.label}</Text>
    </View>
  );
}

function PermissionItem({
  icon, title, desc, state, onRequest, onSettings, requestLabel, requestOnlySettings,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  state: PState;
  onRequest?: () => void;
  onSettings?: () => void;
  requestLabel?: string;
  requestOnlySettings?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={{ marginLeft: 'auto' }}>
          <StateBadge state={state} />
        </View>
      </View>
      <Text style={styles.cardDesc}>{desc}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {onRequest && (
          <TouchableOpacity onPress={onRequest} style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>{requestLabel || '권한 요청'}</Text>
          </TouchableOpacity>
        )}
        {onSettings && (requestOnlySettings || state !== 'granted') && (
          <TouchableOpacity onPress={onSettings} style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>설정 열기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 80, paddingBottom: 24, paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#d7dee8', fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: '#FAFAFD', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#EEE', marginBottom: 12,
  },
  cardTitle: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: '#111' },
  cardDesc: { color: '#6B7280', fontSize: 13, marginTop: 4 },
  outlineBtn: { borderColor: BRAND.pink, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  outlineBtnText: { color: BRAND.pink, fontWeight: '800' },
  primaryBtn: {
    backgroundColor: BRAND.pink, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ghostBtn: { borderRadius: 12, borderWidth: 1, borderColor: '#EEE', paddingVertical: 12, alignItems: 'center' },
  ghostBtnText: { color: '#111', fontSize: 15, fontWeight: '700' },
});
