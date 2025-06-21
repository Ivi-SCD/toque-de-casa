/**
 * Componente de aba com feedback háptico
 * 
 * Este componente adiciona feedback tátil (vibração) quando o usuário
 * toca nas abas da navegação, melhorando a experiência do usuário
 * especialmente em dispositivos iOS
 */

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Componente que envolve os botões das abas para adicionar feedback háptico
 * 
 * @param props - Props padrão do botão de aba do React Navigation
 * @returns Componente PlatformPressable com feedback háptico
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: any) => {
        // Adiciona feedback háptico apenas no iOS
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Chama o handler original se existir
        props.onPressIn?.(ev);
      }}
    />
  );
}