import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="resultado" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="plano-seguranca" options={{ headerShown: false }} />
      <Stack.Screen name="evidencias" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="configuracoes" options={{ headerShown: false }} />
      <Stack.Screen name="avaliacao" options={{ headerShown: false }} />
      <Stack.Screen name="ajuda" options={{ headerShown: false }} />
    </Stack>
  );
} 