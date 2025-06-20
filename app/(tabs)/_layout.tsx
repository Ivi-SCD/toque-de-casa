import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="receitas"
        options={{
          title: 'Receitas',
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant-menu" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapas"
        options={{
          title: 'Onde Comprar',
          tabBarIcon: ({ color }) => <MaterialIcons name="store" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="grupo"
        options={{
          title: 'Grupo',
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="livro"
        options={{
          title: 'Livro',
          tabBarIcon: ({ color }) => <MaterialIcons name="menu-book" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}