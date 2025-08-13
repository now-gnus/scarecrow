import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { Mic, History, Save } from 'lucide-react-native';

export default function DirectInputMessage() {
  const [customMessage, setCustomMessage] = useState('');
  const [recentMessages, setRecentMessages] = useState<string[]>([]);

  const saveMessageToBackend = async (msg: string) => {
    // 나중에 fetch/axios 등으로 실제 저장
    return true;
  };

  const handleSaveMessage = async () => {
    const msg = customMessage.trim();
    if (!msg) {
      Alert.alert('알림', '메시지를 입력해주세요.');
      return;
    }
    if (msg.length > 50) {
      Alert.alert('알림', '메시지는 50자 이내여야 합니다.');
      return;
    }
    await saveMessageToBackend(msg);
    setRecentMessages(prev => {
      const filtered = prev.filter(m => m !== msg);
      return [msg, ...filtered].slice(0, 5);
    });
    setCustomMessage('');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.box}>
        <View style={styles.inputLabelRow}>
          <Mic size={18} color="#F94081" style={{ marginRight: 4, marginTop: 1 }} />
          <Text style={styles.inputLabel}>메시지 입력</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="재생할 메시지를 입력해주세요..."
            placeholderTextColor="#bbb"
            multiline
            maxLength={50}
          />
          <TouchableOpacity
            onPress={handleSaveMessage}
            style={styles.saveBtn}
            activeOpacity={0.8}
          >
            <Save color="#fff" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.charCount}>{customMessage.length}/50</Text>
      </View>
      {/* 최근 메시지 박스 */}
      <View style={styles.recentBox}>
        <View style={styles.recentRow}>
          <History size={22} color="#bbb" style={{ marginRight: 6, marginTop: 2 }} />
          <Text style={styles.recentTitle}>최근 사용한 메시지</Text>
        </View>
        {recentMessages.length === 0 ? (
          <View style={styles.recentEmpty}>
            <History size={32} color="#dadada" style={{ marginBottom: 10 }} />
            <Text style={styles.recentEmptyText1}>최근 사용한 메시지가 없습니다</Text>
            <Text style={styles.recentEmptyText2}>메시지를 입력하고 저장해보세요</Text>
          </View>
        ) : (
          <FlatList
            data={recentMessages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.recentItem}>
                <Text style={styles.recentMsgText}>{item}</Text>
              </View>
            )}
            style={{ marginTop: 8 }}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#fafafd',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    minHeight: 110,
    position: 'relative',
    marginBottom: 22,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  input: {
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#222',
    paddingTop: 2,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 0,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginLeft: 8,
    backgroundColor: '#F94081',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    fontSize: 13,
    color: '#bbb',
  },
  recentBox: {
    backgroundColor: '#fafafd',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  recentEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  recentEmptyText1: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 3,
    fontWeight: '600',
  },
  recentEmptyText2: {
    color: '#bbb',
    fontSize: 13,
  },
  recentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#eee',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  recentMsgText: {
    color: '#222',
    fontSize: 15,
  },
});
