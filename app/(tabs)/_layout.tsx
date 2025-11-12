import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet } from 'react-native';

function LogoTitle() {
  return (
    <Image
      source={require('../../assets/images/logo-framez.png')}
      style={styles.logo}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E1306C',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#dbdbdb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#dbdbdb'
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: () => <LogoTitle />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerTitle: () => <LogoTitle />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
  },
});