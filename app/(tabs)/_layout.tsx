import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Layout das abas principais do aplicativo Toque de Casa
 * 
 * Este componente define a navegação por abas na parte inferior do app,
 * que serve como interface principal para acessar as funcionalidades
 * disfarçadas do aplicativo.
 * 
 * Abas disponíveis:
 * - Receitas: Funcionalidade principal disfarçada
 * - Onde Comprar (Mapas): Localização de recursos e ajuda
 * - Grupo: Comunidade e suporte
 * - Livro: Documentação e informações
 * 
 * Características:
 * - Feedback háptico ao tocar nas abas
 * - Adaptação automática ao tema (claro/escuro)
 * - Ícones do Material Design
 * - Posicionamento absoluto no iOS
 */
export default function TabLayout() {
  // Obtém o tema atual do dispositivo
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Cor ativa das abas baseada no tema
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Oculta o cabeçalho padrão
        headerShown: false,
        // Usa componente personalizado com feedback háptico
        tabBarButton: HapticTab,
        // Fundo personalizado da barra de abas
        tabBarBackground: TabBarBackground,
        // Estilo específico para iOS (posicionamento absoluto)
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      
      {/* Aba de Receitas - Funcionalidade principal disfarçada */}
      <Tabs.Screen
        name="receitas"
        options={{
          title: 'Receitas',
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant-menu" size={28} color={color} />,
        }}
      />
      
      {/* Aba de Onde Comprar - Localização de recursos e ajuda */}
      <Tabs.Screen
        name="mapas"
        options={{
          title: 'Onde Comprar',
          tabBarIcon: ({ color }) => <MaterialIcons name="store" size={28} color={color} />,
        }}
      />
      
      {/* Aba de Grupo - Comunidade e suporte */}
      <Tabs.Screen
        name="grupo"
        options={{
          title: 'Grupo',
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={28} color={color} />,
        }}
      />
      
      {/* Aba de Livro - Documentação e informações */}
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