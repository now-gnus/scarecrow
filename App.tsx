import * as React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, ShoppingCart, User, Settings as SettingsIcon, AlertTriangle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// screens import
import VoiceMessage from './screens/VoiceMessage';
import SOS from './screens/SOS';
import Shopping from './screens/Shopping';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import LoginScreen from './screens/LoginScreen';
import PermissionsScreen from './screens/PermissionsScreen'; // ✅ 권한 화면

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomHeader(props: any) {
  const { navigation, route, options } = props;
  return (
    <LinearGradient
      colors={['#1E2A38', '#1E2A38', '#1E2A38']}
      locations={[0, 0.8, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        height: 90,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          flex: 1,
          color: '#fff',
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {options.title || route.name}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        style={{ position: 'absolute', right: 16, bottom: 16 }}
      >
        <SettingsIcon color="#fff" size={24} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

function MainTabs({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  return (
    <Tab.Navigator
      initialRouteName="VoiceMessage"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'VoiceMessage') return <Mic color={color} size={size} />;
          if (route.name === 'SOS') return <AlertTriangle color={color} size={size} />;
          if (route.name === 'Shopping') return <ShoppingCart color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
          return null;
        },
        tabBarActiveTintColor: '#F94081',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
        header: (props) => <CustomHeader {...props} />,
      })}
    >
      <Tab.Screen name="VoiceMessage" component={VoiceMessage} options={{ title: '음성메시지' }} />
      <Tab.Screen name="SOS" component={SOS} options={{ title: 'SOS' }} />
      <Tab.Screen name="Shopping" component={Shopping} options={{ title: '쇼핑' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: '프로필' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null);
  const [initialRoute, setInitialRoute] = React.useState<'Permissions' | 'MainTabs' | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
        const permissionsDone = await AsyncStorage.getItem('permissions_done');
        const loggedIn = userLoggedIn === 'true';
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          // 권한 화면을 이미 완료했다면 메인으로, 아니면 권한 화면부터
          setInitialRoute(permissionsDone === 'true' ? 'MainTabs' : 'Permissions');
        } else {
          setInitialRoute(null);
        }
      } catch (error) {
        console.log('Error checking login/permissions status:', error);
        setIsLoggedIn(false);
        setInitialRoute(null);
      }
    })();
  }, []);

  // 로딩 중일 때는 아무것도 렌더링하지 않음
  if (isLoggedIn === null || (isLoggedIn && initialRoute === null)) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      {isLoggedIn ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute ?? 'MainTabs'}>
            {/* ✅ 로그인 후 첫 진입: 권한 화면 → 메인 탭 */}
            <Stack.Screen name="Permissions" component={PermissionsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{
                title: '설정',
                headerTitleAlign: 'center',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <LoginScreen
          onLogin={() => {
            // 로그인 직후 권한 화면부터 보이게 설정
            setIsLoggedIn(true);
            setInitialRoute('Permissions');
          }}
        />
      )}
    </>
  );
}
