import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Smartphone, Bluetooth, RefreshCw, CheckCircle2, Speaker, BatteryFull } from 'lucide-react-native';

// 더미 데이터
const DUMMY_DEVICES = [
  {
    id: 'phone',
    name: '핸드폰 스피커',
    type: 'builtin',
    connected: true,
    battery: 100,
  },
  {
    id: 'marshall',
    name: 'Marshall Acton II',
    type: 'bt',
    connected: false,
    battery: 87,
  },
  {
    id: 'jbl',
    name: 'JBL Flip 6',
    type: 'bt',
    connected: false,
    battery: 67,
  },
];

export default function BluetoothSpeakerModal({
  visible,
  onClose,
  onDeviceConnect,
  currentDeviceName,
}: {
  visible: boolean;
  onClose: () => void;
  onDeviceConnect: (deviceName: string) => void;
  currentDeviceName: string;
}) {
  const [currentId, setCurrentId] = useState('phone');
  const [devices, setDevices] = useState(DUMMY_DEVICES);

  // 실제 연결 시에는 BLE/Classic 연동
  const handleSelect = (id: string, name: string) => {
    setCurrentId(id);
    onDeviceConnect(name);
  };

  // 새로고침 구현 시 BLE로 대체
  const handleRefresh = () => {
    // setDevices(...);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          {/* 헤더 */}
          <View style={modalStyles.headerRow}>
            <Speaker size={19} color="#F94081" style={{ marginRight: 8 }} />
            <Text style={modalStyles.headerTitle}>블루투스 스피커 연결</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
              <Text style={{ color: '#888', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={modalStyles.headerDesc}>
            TTS 음성을 출력할 스피커를 선택하세요. 핸드폰 내장 스피커 또는 블루투스 연결된 기기를 사용할 수 있습니다.
          </Text>

          {/* 사용 가능한 기기 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
            <Text style={modalStyles.groupTitle}>사용 가능한 기기</Text>
            <TouchableOpacity onPress={handleRefresh} style={modalStyles.refreshBtn}>
              <RefreshCw color="#6CB2F8" size={18} />
              <Text style={modalStyles.refreshText}>새로고침</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 240 }}>
            {devices.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[
                  modalStyles.deviceCard,
                  currentDeviceName === d.name && { borderColor: '#F94081', backgroundColor: '#FFF3F8' },
                ]}
                onPress={() => handleSelect(d.id, d.name)}
                activeOpacity={0.88}
              >
                <View style={[modalStyles.iconWrap, { backgroundColor: '#F94081' }]}>
                  {d.type === 'builtin'
                    ? <Bluetooth color="#fff" size={22} />
                    : <Speaker color="#fff" size={22} />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#222' }}>{d.name}</Text>
                    {currentDeviceName === d.name && (
                      <View style={modalStyles.connectedBadge}>
                        <Text style={modalStyles.connectedBadgeText}>연결됨</Text>
                      </View>
                    )}
                  </View>
                  {/* 배터리만 표시 */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    {d.battery !== undefined && (
                      <>
                        <BatteryFull size={14} color="#71BC4F" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#888' }}>{d.battery}%</Text>
                      </>
                    )}
                  </View>
                </View>
                {currentDeviceName === d.name && (
                  <CheckCircle2 color="#F94081" size={22} style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* 안내 문구 */}
          <Text style={modalStyles.footerHint}>
            블루투스 기기가 보이지 않나요? 기기를 페어링 모드로 설정하고 새로고침을 눌러주세요.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0007',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 22,
    width: '100%',
    maxWidth: 470,
    padding: 22,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontWeight: 'bold', fontSize: 17, color: '#222' },
  headerDesc: { color: '#888', fontSize: 13, marginBottom: 12, marginTop: 2 },
  groupTitle: { fontWeight: 'bold', color: '#555', fontSize: 14, marginTop: 8, marginBottom: 8 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#F0F0F4',
    backgroundColor: '#fff',
    padding: 13,
    marginBottom: 10,
    minHeight: 46,
  },
  iconWrap: {
    width: 38,
    height: 38,
    backgroundColor: '#F94081',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  connectedBadge: {
    backgroundColor: '#40C2B6',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
    marginTop: 1,
  },
  connectedBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#ECF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  refreshText: { color: '#378FD2', fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  footerHint: { color: '#888', fontSize: 13, marginTop: 10, textAlign: 'center' },
});
