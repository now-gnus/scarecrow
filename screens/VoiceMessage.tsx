import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, Pencil } from 'lucide-react-native';
import PresetMessage from './PresetMessage';
import DirectInputMessage from './DirectInputMessage';

export default function VoiceMessage() {
  const [selectedTab, setSelectedTab] = useState<'preset' | 'custom'>('preset');

  return (
    <View style={styles.container}>
      {/* 상단 탭 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'preset' ? styles.tabButtonActive : styles.tabButtonInactive,
            selectedTab === 'preset' ? styles.tabButtonActivePill : styles.tabButtonInactiveLeft,
          ]}
          onPress={() => setSelectedTab('preset')}
          activeOpacity={0.8}
        >
          <MessageCircle
            size={18}
            color={selectedTab === 'preset' ? '#fff' : '#000'}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'preset' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            지정 메시지
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'custom' ? styles.tabButtonActive : styles.tabButtonInactive,
            selectedTab === 'custom' ? styles.tabButtonActivePill : styles.tabButtonInactiveRight,
          ]}
          onPress={() => setSelectedTab('custom')}
          activeOpacity={0.8}
        >
          <Pencil
            size={18}
            color={selectedTab === 'custom' ? '#fff' : '#000'}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'custom' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            직접 입력
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, width: '100%', padding: 24 }}>
        {selectedTab === 'preset' ? <PresetMessage /> : <DirectInputMessage />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#f6f6f8',
    borderRadius: 20,
    padding: 3,
    width: 320,
    height: 38,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  tabButtonActive: { backgroundColor: '#F94081' },
  tabButtonInactive: { backgroundColor: 'transparent' },
  tabButtonActivePill: { borderRadius: 16 },
  tabButtonInactiveLeft: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabButtonInactiveRight: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  tabText: { fontSize: 14, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  tabTextInactive: { color: '#000' },
});
