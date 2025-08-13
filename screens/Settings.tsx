import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Volume2, ChevronDown, ChevronUp, Star, Speaker, Smartphone } from 'lucide-react-native';
import BluetoothSpeakerModal from './BluetoothSpeakerModal';

const VOICE_STYLES = [
  { label: '자연스러운 남성 목소리', value: 'male1' },
  { label: '중저음 남성 목소리', value: 'male2' },
  { label: '부드러운 여성 목소리', value: 'female1' },
  { label: '밝은 여성 목소리', value: 'female2' },
  { label: '로봇 목소리', value: 'robot' },
];

export default function SettingsScreen() {
  const [voiceStyle, setVoiceStyle] = useState(VOICE_STYLES[0].value);
  const [showDropdown, setShowDropdown] = useState(false);

  // 블루투스 모달 상태
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  // 연결된 기기명 상태
  const [connectedDeviceName, setConnectedDeviceName] = useState('핸드폰 스피커');

  const currentStyle = VOICE_STYLES.find(v => v.value === voiceStyle);

  // 모달에서 기기 연결 시 콜백
  const handleDeviceConnect = (deviceName: string) => {
    setConnectedDeviceName(deviceName);
    setShowSpeakerModal(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. 음성 스타일 */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Star color="#F7B801" size={20} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>음성 스타일</Text>
        </View>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setShowDropdown(!showDropdown)}
          activeOpacity={0.85}
        >
          <Volume2 color="#F94081" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.selectText}>{currentStyle?.label}</Text>
          {showDropdown
            ? <ChevronUp color="#aaa" size={18} style={{ marginLeft: 'auto' }} />
            : <ChevronDown color="#aaa" size={18} style={{ marginLeft: 'auto' }} />
          }
        </TouchableOpacity>
        <Modal visible={showDropdown} transparent animationType="fade">
          <TouchableOpacity style={styles.modalBg} onPress={() => setShowDropdown(false)} activeOpacity={1}>
            <View style={styles.dropdownList}>
              <FlatList
                data={VOICE_STYLES}
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.value === voiceStyle && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setVoiceStyle(item.value);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      item.value === voiceStyle && styles.dropdownItemTextActive,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* 2. 스피커 설정 */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Speaker color="#4FA1E1" size={20} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>스피커</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSpeakerModal(true)} activeOpacity={0.9}>
          <View style={styles.speakerCard}>
            <View style={styles.speakerIconWrap}>
              <Smartphone color="#fff" size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={styles.speakerCardTitle}>{connectedDeviceName}</Text>
                <View style={styles.speakerDefaultBadge}>
                  <Text style={styles.speakerDefaultBadgeText}>
                    {connectedDeviceName === '핸드폰 스피커' ? '기본' : '연결됨'}
                  </Text>
                </View>
              </View>
              <Text style={styles.speakerCardDesc}>
                {connectedDeviceName === '핸드폰 스피커'
                  ? 'TTS 음성이 핸드폰 스피커로 출력됩니다'
                  : `${connectedDeviceName}로 출력됩니다`
                }
              </Text>
            </View>
            <Text style={styles.otherDeviceText}>다른 기기</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 블루투스 연결 모달 */}
      <BluetoothSpeakerModal
        visible={showSpeakerModal}
        onClose={() => setShowSpeakerModal(false)}
        onDeviceConnect={handleDeviceConnect} // 기기 연결 시 연결 기기명 받음
        currentDeviceName={connectedDeviceName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  section: { marginTop: 16, marginBottom: 32 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold', fontSize: 17, color: '#222' },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#fafafd',
    borderWidth: 1,
    borderColor: '#f0f0f3',
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  selectText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#0004',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 270,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#888',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  dropdownItemActive: {
    backgroundColor: '#F9408120',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111',
  },
  dropdownItemTextActive: {
    color: '#F94081',
    fontWeight: 'bold',
  },
  speakerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6F8',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDD1E0',
    padding: 18,
    marginTop: 6,
    marginBottom: 0,
    minHeight: 60,
  },
  speakerIconWrap: {
    backgroundColor: '#F94081',
    borderRadius: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#F94081',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  speakerCardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginRight: 7,
  },
  speakerCardDesc: {
    color: '#777',
    fontSize: 13,
    marginTop: 1,
  },
  speakerDefaultBadge: {
    backgroundColor: '#3A68D7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    marginTop: 1,
  },
  speakerDefaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  otherDeviceText: {
    color: '#F94081',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 18,
  },
});
