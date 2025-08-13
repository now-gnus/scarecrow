// screens/LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const BRAND = { pink: '#F94081', base: '#1E2A38' };

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// TODO: 실제 발급받은 Web Client ID로 교체
const CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ scheme: 'scarecrow' }),
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Token,
  },
  discovery
);


  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        try {
          setIsLoading(true);
          const accessToken = response.params.access_token;
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!res.ok) throw new Error(`userinfo failed: ${res.status}`);
          const userInfo = await res.json();

          await AsyncStorage.setItem('userLoggedIn', 'true');
          await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

          onLogin();
        } catch (e) {
          console.log('Login error:', e);
          Alert.alert('로그인 오류', '로그인 처리 중 문제가 발생했어. 다시 시도해줘.');
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await promptAsync(); // useProxy 옵션 제거
    } catch (e) {
      console.log('promptAsync error:', e);
      Alert.alert('로그인 오류', '구글 로그인 창을 열 수 없었어.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipLogin = async () => {
    await AsyncStorage.setItem('userLoggedIn', 'true');
    await AsyncStorage.setItem('isGuest', 'true');
    onLogin();
  };

  const openLink = (url: string) => Linking.openURL(url).catch(() => {});

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
              backgroundColor: `${BRAND.pink}33`,
              left: (width / 8) * i + 10,
              top: i < 4 ? height * 0.15 : height * 0.85,
            }}
          />
        ))}
      </View>

      <View style={styles.container}>
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Shield size={48} color="#fff" />
          </View>
          <Text style={styles.title}>허수아비</Text>
          <Text style={styles.subtitle}>당신의 안전한 동반자</Text>
        </View>

        {/* 로그인 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, (isLoading || !request) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading || !request}
            activeOpacity={0.9}
          >
            <View style={styles.googleButtonContent}>
              <View style={styles.googleLogo}>
                <Text style={styles.googleLogoText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>
                {isLoading ? '로그인 중...' : 'Google로 시작하기'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 또는 구분선 */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 게스트 로그인 */}
          <TouchableOpacity style={styles.guestButton} onPress={handleSkipLogin} activeOpacity={0.9}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.guestButtonGradient}
            >
              <Text style={styles.guestButtonText}>게스트로 시작하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 약관 */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            로그인하면{' '}
            <Text style={styles.termsLink} onPress={() => openLink('https://example.com/terms')}>
              서비스 약관
            </Text>
            {' '}및{' '}
            <Text style={styles.termsLink} onPress={() => openLink('https://example.com/privacy')}>
              개인정보 처리방침
            </Text>
            에 동의하는 것으로 간주됩니다.
          </Text>
          {Platform.OS === 'ios' && (
            <Text style={[styles.termsText, { marginTop: 8 }]}>
              iOS에서 로그인 이슈가 있으면 Safari 팝업 허용을 확인해줘.
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BRAND.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: BRAND.pink,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonDisabled: { opacity: 0.6 },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  googleLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleLogoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginHorizontal: 16,
  },
  guestButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  guestButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '500',
  },
  termsContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  termsText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: BRAND.pink,
    textDecorationLine: 'underline',
  },
});
