/**
 * Sistema de cores do aplicativo Toque de Casa
 * Define as cores para os temas claro e escuro
 */

// Cores principais do tema (tint) - cor de destaque do app
const tintColorLight = '#FF6B6B'; // Vermelho coral para tema claro
const tintColorDark = '#FF8A8A';  // Vermelho coral mais claro para tema escuro

/**
 * Objeto de cores organizadas por tema (claro/escuro)
 * Cada tema contém cores para diferentes elementos da interface
 */
export const Colors = {
  // Tema claro - cores para quando o dispositivo está no modo claro
  light: {
    text: '#11181C',           // Cor do texto principal (quase preto)
    background: '#FFFFFF',     // Cor de fundo (branco)
    tint: tintColorLight,      // Cor de destaque (vermelho coral)
    icon: '#687076',           // Cor dos ícones (cinza médio)
    tabIconDefault: '#687076', // Cor dos ícones das abas quando não selecionados
    tabIconSelected: tintColorLight, // Cor dos ícones das abas quando selecionados
    primary: '#FF6B6B',        // Cor primária (vermelho coral)
    secondary: '#4CAF50',      // Cor secundária (verde)
    danger: '#FF0000',         // Cor de perigo/alerta (vermelho)
    warning: '#FFA500',        // Cor de aviso (laranja)
    info: '#2196F3',           // Cor de informação (azul)
  },
  // Tema escuro - cores para quando o dispositivo está no modo escuro
  dark: {
    text: '#ECEDEE',           // Cor do texto principal (branco acinzentado)
    background: '#1A1A1A',     // Cor de fundo (cinza muito escuro)
    tint: tintColorDark,       // Cor de destaque (vermelho coral mais claro)
    icon: '#9BA1A6',           // Cor dos ícones (cinza claro)
    tabIconDefault: '#9BA1A6', // Cor dos ícones das abas quando não selecionados
    tabIconSelected: tintColorDark, // Cor dos ícones das abas quando selecionados
    primary: '#FF8A8A',        // Cor primária (vermelho coral mais claro)
    secondary: '#66BB6A',      // Cor secundária (verde mais claro)
    danger: '#FF5252',         // Cor de perigo/alerta (vermelho mais claro)
    warning: '#FFB74D',        // Cor de aviso (laranja mais claro)
    info: '#42A5F5',           // Cor de informação (azul mais claro)
  },
};