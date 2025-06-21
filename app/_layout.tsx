import { Stack } from 'expo-router';
import React from 'react';

/**
 * Layout principal da aplicação Toque de Casa
 * 
 * Este componente define a estrutura de navegação principal do app
 * usando o expo-router com navegação em pilha (Stack).
 * 
 * Estrutura de telas:
 * - (tabs): Navegação por abas (receitas, mapas, grupo, livro)
 * - resultado: Tela de resultado de avaliação
 * - quiz: Tela de questionário de avaliação
 * - plano-seguranca: Tela de plano de segurança
 * - evidencias: Tela para gerenciar evidências
 * - dashboard: Painel principal com estatísticas
 * - configuracoes: Configurações do aplicativo
 * - avaliacao: Tela de avaliação de risco
 * - ajuda: Tela de ajuda e suporte
 */
export default function RootLayout() {
  return (
    <Stack>
      {/* Navegação por abas - tela principal do app */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Telas de funcionalidades de segurança */}
      <Stack.Screen name="resultado" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="plano-seguranca" options={{ headerShown: false }} />
      <Stack.Screen name="evidencias" options={{ headerShown: false }} />
      
      {/* Telas de configuração e suporte */}
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="configuracoes" options={{ headerShown: false }} />
      <Stack.Screen name="avaliacao" options={{ headerShown: false }} />
      <Stack.Screen name="ajuda" options={{ headerShown: false }} />
    </Stack>
  );
} 