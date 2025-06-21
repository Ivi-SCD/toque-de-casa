import { useThemeColor } from '@/hooks/useThemeColor';
import { StyleSheet, Text, type TextProps } from 'react-native';

/**
 * Props do componente ThemedText
 * Estende as props padrão do Text do React Native
 */
export type ThemedTextProps = TextProps & {
  lightColor?: string;  // Cor personalizada para tema claro
  darkColor?: string;   // Cor personalizada para tema escuro
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'; // Tipo de texto
};

/**
 * Componente de texto que se adapta automaticamente ao tema do dispositivo
 * 
 * Este componente aplica cores apropriadas baseadas no tema atual
 * e oferece diferentes estilos de texto pré-definidos
 * 
 * @param style - Estilos adicionais do React Native
 * @param lightColor - Cor personalizada para tema claro
 * @param darkColor - Cor personalizada para tema escuro
 * @param type - Tipo de texto (define tamanho e peso da fonte)
 * @param rest - Outras props do componente Text
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // Obtém a cor apropriada para o tema atual
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color }, // Aplica a cor baseada no tema
        // Aplica o estilo baseado no tipo de texto
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style, // Estilos personalizados têm prioridade
      ]}
      {...rest}
    />
  );
}

/**
 * Estilos pré-definidos para diferentes tipos de texto
 * Cada tipo tem tamanho, peso e altura de linha específicos
 */
const styles = StyleSheet.create({
  default: {
    fontSize: 16,      // Tamanho padrão
    lineHeight: 24,    // Altura da linha para boa legibilidade
  },
  defaultSemiBold: {
    fontSize: 16,      // Mesmo tamanho do padrão
    lineHeight: 24,    // Mesma altura de linha
    fontWeight: '600', // Peso semi-bold para destaque
  },
  title: {
    fontSize: 32,      // Tamanho grande para títulos
    fontWeight: 'bold', // Peso bold para destaque
    lineHeight: 32,    // Altura igual ao tamanho da fonte
  },
  subtitle: {
    fontSize: 20,      // Tamanho médio para subtítulos
    fontWeight: 'bold', // Peso bold para destaque
  },
  link: {
    lineHeight: 30,    // Altura maior para links
    fontSize: 16,      // Tamanho padrão
    color: '#FF6B6B',  // Cor específica para links (vermelho coral)
  },
});