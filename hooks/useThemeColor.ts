import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

/**
 * Hook para obter cores baseadas no tema atual (claro/escuro)
 * 
 * Este hook permite que componentes obtenham cores apropriadas
 * para o tema atual do dispositivo, com fallback para cores padrão
 * 
 * @param props - Objeto com cores personalizadas para tema claro e escuro
 * @param colorName - Nome da cor padrão a ser usada como fallback
 * @returns string - A cor apropriada para o tema atual
 * 
 * @example
 * const backgroundColor = useThemeColor({}, 'background');
 * const textColor = useThemeColor(
 *   { light: '#FF0000', dark: '#00FF00' }, 
 *   'text'
 * );
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Obtém o tema atual do dispositivo (claro/escuro)
  const theme = useColorScheme() ?? 'light';
  
  // Verifica se há uma cor personalizada para o tema atual
  const colorFromProps = props[theme];

  // Retorna a cor personalizada se existir, senão usa a cor padrão
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}