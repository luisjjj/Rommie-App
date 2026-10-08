import { View } from 'react-native';
import { Tabs, useSegments, router } from 'expo-router';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';

const TAB_ROUTES = ['discover', 'likes', 'matches', 'profile'] as const;

const HREFS: Record<string, '/(tabs)/discover' | '/(tabs)/likes' | '/(tabs)/matches' | '/(tabs)/profile'> = {
  discover: '/(tabs)/discover',
  likes: '/(tabs)/likes',
  matches: '/(tabs)/matches',
  profile: '/(tabs)/profile',
};

export default function TabsLayout() {
  const segments = useSegments();
  const active = [...segments].reverse().find((s) => (TAB_ROUTES as readonly string[]).includes(s)) ?? 'discover';
  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="likes" options={{ title: 'Likes' }} />
        <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
      <FloatingTabBar active={active} onNavigate={(name) => router.push(HREFS[name])} />
    </View>
  );
}
