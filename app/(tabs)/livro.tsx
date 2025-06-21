import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

/**
 * Interface para representar um capítulo do livro
 * Cada capítulo tem um título disfarçado e um título real
 */
interface Chapter {
  id: string;           // Identificador único
  title: string;        // Título disfarçado (ex: "Conhecendo sua Cozinha")
  realTitle: string;    // Título real (ex: "Reconhecendo Sinais de Violência")
  icon: string;         // Emoji representativo
  description: string;  // Descrição disfarçada
  content: string[];    // Conteúdo educativo disfarçado
  tips: string[];       // Dicas práticas e informações reais
}

/**
 * Capítulos do livro educativo disfarçado
 * Cada capítulo ensina sobre violência doméstica usando metáforas culinárias
 */
const chapters: Chapter[] = [
  {
    id: '1',
    title: 'Conhecendo sua Cozinha',
    realTitle: 'Reconhecendo Sinais de Violência',
    icon: '🏠',
    description: 'Aprenda a identificar os utensílios essenciais',
    content: [
      'Toda cozinha precisa de organização e harmonia para funcionar bem.',
      'Quando os utensílios estão sempre "sumindo" ou "quebrando", algo pode estar errado.',
      'Uma cozinha saudável permite que você escolha livremente o que preparar.',
      'Se alguém sempre critica suas receitas ou controla o que você cozinha, isso não é normal.',
    ],
    tips: [
      'Confie em seus instintos - se algo parece errado, provavelmente está',
      'Mantenha contato com amigas que também gostam de cozinhar',
      'Tenha sempre alguns ingredientes "extras" guardados',
      'Anote suas receitas favoritas em um lugar seguro',
    ],
  },
  {
    id: '2',
    title: 'Ingredientes Básicos',
    realTitle: 'Seus Direitos Fundamentais',
    icon: '⚖️',
    description: 'Os elementos essenciais para qualquer receita',
    content: [
      'Assim como toda receita tem ingredientes básicos, você tem direitos fundamentais.',
      'Direito de ir e vir - como escolhar onde comprar seus ingredientes.',
      'Direito à dignidade - ninguém deve estragar suas receitas ou criticar sua forma de cozinhar.',
      'Direito à segurança - sua cozinha deve ser um lugar de paz.',
      'Direito à igualdade - as tarefas da cozinha devem ser divididas.',
    ],
    tips: [
      'Lei Maria da Penha protege mulheres de todas as formas de violência',
      'Violência não é apenas física - pode ser psicológica, moral, patrimonial',
      'Você tem direito a medidas protetivas se necessário',
      'Denúncias podem ser feitas de forma anônima',
    ],
  },
  {
    id: '3',
    title: 'Planejando o Cardápio',
    realTitle: 'Criando um Plano de Segurança',
    icon: '📋',
    description: 'Como organizar suas refeições semanais',
    content: [
      'Um bom cardápio precisa de planejamento, assim como sua segurança.',
      'Tenha sempre uma "receita de emergência" - um plano B para situações difíceis.',
      'Guarde números importantes como se fossem receitas especiais.',
      'Combine com amigas um "prato código" para pedir ajuda discretamente.',
      'Mantenha documentos importantes como se fossem receitas preciosas.',
    ],
    tips: [
      'Guarde cópias de documentos em local seguro',
      'Tenha uma reserva financeira, mesmo que pequena',
      'Combine códigos com pessoas de confiança',
      'Identifique locais seguros próximos de casa',
      'Mantenha telefone sempre carregado',
    ],
  },
  {
    id: '4',
    title: 'Cozinhando com Autonomia',
    realTitle: 'Independência Financeira',
    icon: '💰',
    description: 'Gerencie seu orçamento culinário',
    content: [
      'Administrar o orçamento da cozinha é uma habilidade importante.',
      'Procure sempre ter sua própria verba para ingredientes.',
      'Aprenda receitas econômicas que te dão mais autonomia.',
      'Valorize suas habilidades culinárias - elas podem gerar renda.',
      'Mantenha controle sobre suas compras e gastos.',
    ],
    tips: [
      'Abra uma conta bancária própria se possível',
      'Guarde notas fiscais e comprovantes',
      'Desenvolva habilidades que possam gerar renda',
      'Conheça programas de assistência disponíveis',
      'Construa uma rede de apoio profissional',
    ],
  },
  {
    id: '5',
    title: 'Histórias de Cozinheiras',
    realTitle: 'Histórias de Superação',
    icon: '✨',
    description: 'Inspire-se com quem já domina a arte',
    content: [
      'Maria aprendeu a fazer bolos e hoje tem sua própria confeitaria.',
      'Ana descobriu que podia escolher suas próprias receitas e hoje ensina outras mulheres.',
      'Joana percebeu que merecia uma cozinha harmoniosa e buscou ajuda.',
      'Cada história começa com o primeiro passo - reconhecer que você merece melhor.',
      'Milhares de mulheres já transformaram suas "cozinhas" e você também pode.',
    ],
    tips: [
      'Buscar ajuda é sinal de força, não de fraqueza',
      'Você não está sozinha - existe uma rede de apoio',
      'Cada pequeno passo conta na jornada',
      'Acredite em sua capacidade de mudança',
      'O futuro pode ser diferente e melhor',
    ],
  },
];

/**
 * Tela do Livro de Receitas - Conteúdo Educativo Disfarçado
 * 
 * Esta tela apresenta um "livro de receitas" que na verdade é um
 * guia educativo sobre violência doméstica, direitos das mulheres
 * e estratégias de segurança, tudo disfarçado em metáforas culinárias.
 * 
 * Funcionalidades:
 * - Capítulos educativos com metáforas culinárias
 * - Informações sobre direitos e leis
 * - Dicas práticas de segurança
 * - Histórias inspiradoras de superação
 * - Acesso rápido ao plano de segurança
 * - Quiz para testar conhecimento
 * 
 * Capítulos Disponíveis:
 * - "Conhecendo sua Cozinha" = Reconhecendo Sinais de Violência
 * - "Ingredientes Básicos" = Seus Direitos Fundamentais
 * - "Planejando o Cardápio" = Criando um Plano de Segurança
 * - "Cozinhando com Autonomia" = Independência Financeira
 * - "Histórias de Cozinheiras" = Histórias de Superação
 * 
 * Objetivos Educativos:
 * - Conscientização sobre violência doméstica
 * - Conhecimento sobre direitos legais
 * - Desenvolvimento de estratégias de segurança
 * - Fortalecimento da autonomia feminina
 * - Inspiração através de histórias reais
 */
export default function BookScreen() {
  const colorScheme = useColorScheme();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Abre o modal com o conteúdo do capítulo selecionado
   * 
   * @param chapter - Capítulo selecionado
   */
  const handleChapterPress = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setModalVisible(true);
  };

  /**
   * Navega para a tela de plano de segurança
   * Acesso direto às funcionalidades de proteção
   */
  const handleEmergencyRecipe = () => {
    router.push('/plano-seguranca');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Livro de Receitas</ThemedText>
        <ThemedText style={styles.subtitle}>
          Aprenda os segredos da culinária
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Card de acesso rápido ao plano de segurança */}
        <TouchableOpacity 
          style={[styles.emergencyCard, { backgroundColor: '#FF6B6B' }]}
          onPress={handleEmergencyRecipe}
        >
          <MaterialIcons name="emergency" size={32} color="white" />
          <ThemedView style={styles.emergencyContent}>
            <ThemedText style={styles.emergencyTitle}>Receita de Emergência</ThemedText>
            <ThemedText style={styles.emergencySubtitle}>
              Para quando você precisar de algo rápido
            </ThemedText>
          </ThemedView>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        {/* Lista de capítulos educativos */}
        {chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.id}
            style={[styles.chapterCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
            onPress={() => handleChapterPress(chapter)}
          >
            <ThemedText style={styles.chapterIcon}>{chapter.icon}</ThemedText>
            <ThemedView style={styles.chapterContent}>
              <ThemedText style={styles.chapterTitle}>{chapter.title}</ThemedText>
              <ThemedText style={styles.chapterDescription}>{chapter.description}</ThemedText>
            </ThemedView>
            <MaterialIcons 
              name="arrow-forward-ios" 
              size={20} 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
        ))}

        {/* Dica motivacional */}
        <ThemedView style={[styles.tipCard, { backgroundColor: '#4CAF50' }]}>
          <MaterialIcons name="lightbulb" size={24} color="white" />
          <ThemedText style={styles.tipText}>
            Dica: Pratique uma receita nova por semana para expandir suas habilidades!
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Modal com conteúdo detalhado do capítulo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : 'white' }]}>
            {selectedChapter && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                </TouchableOpacity>

                {/* Cabeçalho do capítulo */}
                <ThemedText style={styles.modalIcon}>{selectedChapter.icon}</ThemedText>
                <ThemedText style={styles.modalTitle}>{selectedChapter.title}</ThemedText>
                <ThemedText style={styles.modalSubtitle}>({selectedChapter.realTitle})</ThemedText>

                {/* Conteúdo educativo */}
                <ThemedView style={styles.contentSection}>
                  {selectedChapter.content.map((paragraph, index) => (
                    <ThemedText key={index} style={styles.paragraph}>
                      {paragraph}
                    </ThemedText>
                  ))}
                </ThemedView>

                {/* Dicas práticas */}
                <ThemedView style={styles.tipsSection}>
                  <ThemedText style={styles.tipsTitle}>Dicas Importantes:</ThemedText>
                  {selectedChapter.tips.map((tip, index) => (
                    <ThemedView key={index} style={styles.tipRow}>
                      <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                      <ThemedText style={styles.tipItem}>{tip}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                {/* Botão para testar conhecimento */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/quiz');
                  }}
                >
                  <ThemedText style={styles.actionButtonText}>
                    Testar Conhecimento
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

/**
 * Estilos da tela do livro
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
  content: {
    flex: 1,
    padding: 20,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 15,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterIcon: {
    fontSize: 36,
    marginRight: 15,
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  tipsSection: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipItem: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});