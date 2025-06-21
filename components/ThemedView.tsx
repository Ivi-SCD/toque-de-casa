import { useThemeColor } from '@/hooks/useThemeColor';
import { View, type ViewProps } from 'react-native';

/**
 * Props do componente ThemedView
 * Estende as props padrão do View do React Native
 */
export type ThemedViewProps = ViewProps & {
  lightColor?: string;  // Cor de fundo personalizada para tema claro
  darkColor?: string;   // Cor de fundo personalizada para tema escuro
};

/**
 * Componente de view que se adapta automaticamente ao tema do dispositivo
 * 
 * Este componente aplica cores de fundo apropriadas baseadas no tema atual
 * É útil para criar containers que respeitam o tema do usuário
 * 
 * @param style - Estilos adicionais do React Native
 * @param lightColor - Cor de fundo personalizada para tema claro
 * @param darkColor - Cor de fundo personalizada para tema escuro
 * @param otherProps - Outras props do componente View
 */
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Obtém a cor de fundo apropriada para o tema atual
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}