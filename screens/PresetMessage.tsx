import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Home, Package, AlertTriangle, User, Volume2 } from 'lucide-react-native';

// 타입 안전을 위한 key 타입 정의
type CategoryKey = 'default' | 'delivery' | 'emergency' | 'visitor';

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}[] = [
  { key: 'default', label: '일반상황', icon: Home, color: '#406CFF' },
  { key: 'delivery', label: '배달/택배', icon: Package, color: '#3ECB6C' },
  { key: 'emergency', label: '응급상황', icon: AlertTriangle, color: '#F94081' },
  { key: 'visitor', label: '방문자', icon: User, color: '#D8337C' },
];

const MESSAGE_LIST: Record<CategoryKey, string[]> = {
  default: [
    '여보, 나 돌아왔어',
    '형이 곧 올 거야',
    '남자친구가 여기 있어',
    '회사 동료가 와있어요',
  ],
  delivery: [
    '문 앞에 두고 가주세요.',
    '곧 내려갈게요.',
    '잠시만 기다려주세요.',
    '방문자 확인 후 열어드릴게요.',
  ],
  emergency: [
    '지금 바로 112에 신고했습니다.',
    '경찰이 곧 도착할 예정입니다.',
    '잠시만 기다려주세요, 누가 오고 있습니다.',
    '도움이 곧 도착합니다.',
  ],
  visitor: [
    '잠시만 기다려주세요.',
    '부모님이 곧 오실 거예요.',
    '저는 지금 바빠요, 나중에 오세요.',
    '방문자 기록을 남기겠습니다.',
  ],
};

export default function PresetMessage() {
  // 타입을 CategoryKey로 지정 (여기가 핵심!)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('default');

  const currentMessages = MESSAGE_LIST[selectedCategory];

  return (
    <View style={{ flex: 1 }}>
      {/* 카테고리 탭 */}
      <View style={styles.categoryTabs}>
        {CATEGORIES.map(({ key, label, icon: Icon, color }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.catTab,
              selectedCategory === key && { backgroundColor: '#fff', borderColor: color, borderWidth: 2 },
            ]}
            onPress={() => setSelectedCategory(key)}
            activeOpacity={0.8}
          >
            <Icon color={selectedCategory === key ? color : '#ccc'} size={26} />
            <Text style={[
              styles.catTabLabel,
              { color: selectedCategory === key ? color : '#888' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 메시지 리스트 */}
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>평상시 사용하는 메시지</Text>
        <FlatList
          data={currentMessages}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageCard}>
              <Text style={styles.msgText}>{item}</Text>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => {/* TTS/음성재생 자리 */}}
                activeOpacity={0.7}
              >
                <Volume2 size={22} color="#B0B0B0" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      </View>
  );
}

const styles = StyleSheet.create({
  categoryTabs: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 10,
    marginTop: 8,
    backgroundColor: '#F6F6F8',
    borderRadius: 16,
    padding: 6,
  },
  catTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  catTabLabel: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  sectionTitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 10,
    fontWeight: '600',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    elevation: 1,
    shadowColor: '#eee',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  msgText: { flex: 1, color: '#222', fontSize: 16, fontWeight: '400' },
  playBtn: {
    marginLeft: 18,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F8F8FA',
    elevation: 0,
  },
});
