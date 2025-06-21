import { Redirect } from 'expo-router';

/**
 * Tela inicial do aplicativo Toque de Casa
 * 
 * Esta é a primeira tela que o usuário vê ao abrir o aplicativo.
 * Como o app é disfarçado como um aplicativo de receitas, a tela inicial
 * redireciona automaticamente para a aba de receitas, que é a funcionalidade
 * principal visível ao usuário.
 * 
 * Esta abordagem garante que:
 * - O usuário veja imediatamente o disfarce do app (receitas)
 * - A navegação seja intuitiva e natural
 * - O foco seja na funcionalidade aparente do app
 * 
 * @returns Componente Redirect que redireciona para a aba de receitas
 */
export default function Index() {
  return <Redirect href="/(tabs)/receitas" />;
} 