import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  return (
    <LinearGradient
      colors={['#222B36', '#232836', '#302539', '#1e2a38']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      {/* 배경 도트 */}
      <View style={StyleSheet.absoluteFill}>
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 10 + (i % 2) * 3,
              height: 10 + (i % 2) * 3,
              borderRadius: 10,
              backgroundColor: '#f9408133',
              left: (width / 8) * i + 10,
              top: i < 4 ? height * 0.32 : height * 0.67,
            }}
          />
        ))}
      </View>

      <View style={styles.centered}>
        {/* 원형 로고 */}
        <View style={styles.logoCircle}>
          <Shield size={48} color="#fff" />
        </View>
        {/* 앱명/설명 */}
        <Text style={styles.title}>허수아비</Text>
        <Text style={styles.subtitle}>당신의 안전한 동반자</Text>
        {/* 인디케이터 */}
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorDotActive} />
          <View style={styles.indicatorDot} />
          <View style={styles.indicatorDot} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centered: { alignItems: 'center', marginTop: -50 },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F94081',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#f94081',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 17,
    marginBottom: 38,
    fontWeight: '400',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F94081',
    opacity: 0.25,
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F94081',
    opacity: 1,
    marginHorizontal: 4,
  },
});
