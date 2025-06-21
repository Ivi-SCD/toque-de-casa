import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';

/**
 * Componente de fundo personalizado para a barra de abas
 * 
 * Este componente aplica um efeito de blur no fundo da barra de abas
 * no iOS, criando um efeito visual moderno e elegante.
 * No Android, retorna null pois o efeito de blur não é necessário.
 * 
 * @returns BlurView para iOS, null para Android
 */
export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="systemChromeMaterial" // Usa o material do sistema iOS
        intensity={100}             // Intensidade do blur (0-100)
        style={StyleSheet.absoluteFill} // Preenche todo o espaço disponível
      />
    );
  }
  return null;
}

/**
 * Hook para obter a altura da barra de abas para ajustes de layout
 * 
 * Este hook retorna a altura da barra de abas no iOS para que outros
 * componentes possam ajustar seu posicionamento adequadamente.
 * No Android, retorna 0 pois não é necessário.
 * 
 * @returns Altura da barra de abas no iOS, 0 no Android
 */
export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  return Platform.OS === 'ios' ? tabHeight : 0;
}