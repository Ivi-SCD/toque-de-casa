/**
 * Hook personalizado para obter o esquema de cores do dispositivo
 * 
 * Este hook é um wrapper do hook nativo do React Native para detectar
 * se o dispositivo está no modo claro ou escuro
 * 
 * @returns 'light' | 'dark' | null - O esquema de cores atual do dispositivo
 */
import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
  return useNativeColorScheme();
}