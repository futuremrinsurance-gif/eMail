import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, View } from 'react-native';
import { useEmailStore } from '../src/store/emailStore';

export default function RootLayout() {
  const { getCurrentTheme } = useEmailStore();
  const theme = getCurrentTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            height: Platform.OS === 'ios' ? 95 : 70,
            paddingBottom: Platform.OS === 'ios' ? 34 : 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'All Inboxes',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="mail" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mailboxes"
          options={{
            title: 'Mailboxes',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="work"
          options={{
            title: 'Work',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="compose"
          options={{
            title: 'Compose',
            tabBarIcon: ({ color, size }) => (
              <View style={{
                backgroundColor: theme.primary,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}>
                <Ionicons name="mail-outline" size={24} color="#fff" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="email/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
