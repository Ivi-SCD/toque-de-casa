import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Vibration
} from 'react-native';

/**
 * Interface para representar uma receita
 * Define a estrutura dos dados de cada receita no aplicativo
 */
interface Recipe {
  id: string;           // Identificador único da receita
  title: string;        // Nome da receita
  time: string;         // Tempo de preparo
  difficulty: string;   // Nível de dificuldade
  category: string;     // Categoria da receita
  image: string;        // Emoji representativo da receita
}

/**
 * Categorias de receitas disponíveis
 * A categoria "especiais" contém a funcionalidade secreta de acesso
 */
const categories = [
  { id: 'rapidas', name: 'Pratos Rápidos', icon: '⚡' },
  { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
  { id: 'saudaveis', name: 'Saudáveis', icon: '🥗' },
  { id: 'especiais', name: 'Especiais', icon: '⭐' }, // Categoria com acesso secreto
];

/**
 * Lista de receitas pré-definidas
 * Cada receita tem informações completas para o disfarce do aplicativo
 */
const recipes: Recipe[] = [
  { id: '1', title: 'Risoto de Limão', time: '30 min', difficulty: 'Fácil', category: 'rapidas', image: '🍚' },
  { id: '2', title: 'Brigadeiro Gourmet', time: '20 min', difficulty: 'Fácil', category: 'sobremesas', image: '🍫' },
  { id: '3', title: 'Salada Caesar', time: '15 min', difficulty: 'Fácil', category: 'saudaveis', image: '🥗' },
  { id: '4', title: 'Bolo de Cenoura', time: '45 min', difficulty: 'Médio', category: 'especiais', image: '🥕' },
  { id: '5', title: 'Lasanha de Berinjela', time: '1h 10min', difficulty: 'Difícil', category: 'saudaveis', image: '🍆' },
  { id: '6', title: 'Mousse de Maracujá', time: '25 min', difficulty: 'Fácil', category: 'sobremesas', image: '🍮' },
  { id: '7', title: 'Frango Xadrez', time: '35 min', difficulty: 'Médio', category: 'rapidas', image: '🍗' },
  { id: '8', title: 'Torta de Limão', time: '50 min', difficulty: 'Médio', category: 'sobremesas', image: '🥧' },
  { id: '9', title: 'Macarrão Carbonara', time: '25 min', difficulty: 'Fácil', category: 'rapidas', image: '🍝' },
  { id: '10', title: 'Pão de Queijo', time: '40 min', difficulty: 'Fácil', category: 'especiais', image: '🧀' },
  { id: '11', title: 'Feijoada', time: '2h 30min', difficulty: 'Difícil', category: 'especiais', image: '🍛' },
  { id: '12', title: 'Panqueca de Aveia', time: '20 min', difficulty: 'Fácil', category: 'saudaveis', image: '🥞' },
  { id: '13', title: 'Pudim de Leite', time: '1h 30min', difficulty: 'Médio', category: 'sobremesas', image: '🍮' },
  { id: '14', title: 'Strogonoff de Frango', time: '40 min', difficulty: 'Fácil', category: 'rapidas', image: '🍗' },
  { id: '15', title: 'Quiche de Alho-Poró', time: '1h', difficulty: 'Médio', category: 'especiais', image: '🥧' },
  { id: '16', title: 'Escondidinho de Carne', time: '1h 20min', difficulty: 'Médio', category: 'especiais', image: '🥘' },
  { id: '17', title: 'Smoothie Detox', time: '10 min', difficulty: 'Fácil', category: 'saudaveis', image: '🥤' },
  { id: '18', title: 'Tapioca com Coco', time: '15 min', difficulty: 'Fácil', category: 'saudaveis', image: '🥥' },
  { id: '19', title: 'Arroz Carreteiro', time: '50 min', difficulty: 'Médio', category: 'rapidas', image: '🍚' },
  { id: '20', title: 'Brownie de Chocolate', time: '35 min', difficulty: 'Médio', category: 'sobremesas', image: '🍫' },
];

/**
 * Tela principal de receitas - Funcionalidade disfarçada do aplicativo
 * 
 * Esta tela serve como a interface principal visível do aplicativo,
 * apresentando-se como um app de receitas culinárias. No entanto,
 * ela contém uma funcionalidade secreta: manter pressionado a categoria
 * "Especiais" por 5 segundos ativa o acesso às funcionalidades de segurança.
 * 
 * Funcionalidades:
 * - Exibição de receitas por categoria
 * - Navegação entre categorias
 * - Acesso secreto via pressão prolongada
 * - Interface responsiva e temática
 * 
 * Acesso Secreto:
 * - Pressionar e segurar a categoria "Especiais" por 5 segundos
 * - Vibração confirma a ativação
 * - Redireciona para a tela de avaliação de risco
 */
export default function RecipesScreen() {
  const colorScheme = useColorScheme();
  const [selectedCategory, setSelectedCategory] = useState('rapidas');
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  /**
   * Manipula o início do toque em uma categoria
   * Se for a categoria "especiais", inicia o timer para acesso secreto
   * 
   * @param categoryId - ID da categoria tocada
   */
  const handlePressIn = (categoryId: string) => {
    if (categoryId === 'especiais') {
      startTime.current = Date.now();
      setIsHolding(true);
      
      // Animação de progresso visual
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 5000, // 5 segundos
        useNativeDriver: false,
      }).start();
      
      // Timer para ativar o acesso secreto após 5 segundos
      holdTimer.current = setTimeout(() => {
        console.log('5 segundos completos! Ativando acesso secreto...');
        Vibration.vibrate(100); // Feedback háptico
        handleSecretAccess();
      }, 5000);
    }
  };

  /**
   * Manipula o fim do toque
   * Cancela o timer se o usuário soltar antes dos 5 segundos
   */
  const handlePressOut = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    progressAnim.setValue(0);
    setIsHolding(false);
  };

  /**
   * Ativa o acesso secreto às funcionalidades de segurança
   * Salva o estado no AsyncStorage e navega para a avaliação
   */
  const handleSecretAccess = async () => {
    try {
      // Salvar estado de acesso seguro
      await AsyncStorage.setItem('secretAccess', 'true');
      console.log('Acesso secreto ativado! Navegando para avaliação...');
      
      // Resetar estado
      setIsHolding(false);
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      
      // Navegar para a tela de avaliação
      router.push('/avaliacao');
    } catch (error) {
      console.error('Erro ao ativar acesso secreto:', error);
    }
  };

  /**
   * Manipula a seleção de categoria
   * Impede mudança durante o acesso secreto
   * 
   * @param categoryId - ID da categoria selecionada
   */
  const handleCategoryPress = (categoryId: string) => {
    // Se estiver segurando, não muda a categoria
    if (isHolding && categoryId === 'especiais') {
      return;
    }
    setSelectedCategory(categoryId);
  };

  // Filtra receitas pela categoria selecionada
  const filteredRecipes = recipes.filter(recipe => recipe.category === selectedCategory);

  return (
    <ThemedView style={styles.container}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Toque de Casa 👩‍🍳</ThemedText>
        <ThemedText style={styles.subtitle}>Receitas práticas para o dia a dia</ThemedText>
      </ThemedView>

      {/* Container de categorias com scroll horizontal */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            onPressIn={() => handlePressIn(category.id)}
            onPressOut={handlePressOut}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.selectedCategory,
              isHolding && category.id === 'especiais' && styles.holdingCategory,
              { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5' }
            ]}
          >
            <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
            <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
            {/* Barra de progresso para acesso secreto */}
            {category.id === 'especiais' && isHolding && (
              <ThemedView style={styles.progressBar}>
                <ThemedView style={[styles.progressFill, { width: '100%' }]} />
              </ThemedView>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Lista de receitas filtradas */}
      <ScrollView style={styles.recipesContainer}>
        {filteredRecipes.map((recipe) => (
          <TouchableOpacity 
            key={recipe.id} 
            style={[styles.recipeCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
          >
            <ThemedText style={styles.recipeIcon}>{recipe.image}</ThemedText>
            <ThemedView style={styles.recipeInfo}>
              <ThemedText style={styles.recipeTitle}>{recipe.title}</ThemedText>
              <ThemedView style={styles.recipeDetails}>
                <ThemedText style={styles.recipeTime}>⏱ {recipe.time}</ThemedText>
                <ThemedText style={styles.recipeDifficulty}>• {recipe.difficulty}</ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

/**
 * Estilos da tela de receitas
 * Define a aparência visual de todos os elementos
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    maxHeight: 120,
  },
  categoryCard: {
    padding: 15,
    marginRight: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    position: 'relative',
  },
  selectedCategory: {
    backgroundColor: '#FF6B6B', // Cor coral do app
  },
  holdingCategory: {
    opacity: 0.8, // Feedback visual durante pressão
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50', // Verde para indicar progresso
  },
  recipesContainer: {
    flex: 1,
    padding: 20,
  },
  recipeCard: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  recipeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  recipeDifficulty: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 10,
  },
});