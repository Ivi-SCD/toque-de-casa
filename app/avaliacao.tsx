import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

/**
 * Interface para representar uma pergunta da avaliação
 * Cada pergunta tem uma versão disfarçada e uma versão original
 */
interface Question {
  id: string;           // Identificador único
  question: string;     // Pergunta disfarçada (ex: "Você tem todos os utensílios?")
  originalQuestion: string; // Pergunta original (ex: "Seu parceiro já ameaçou machucá-la?")
  options: {
    value: string;      // Valor da resposta
    label: string;      // Texto da opção
    score: number;      // Pontuação da opção (0-15)
  }[];
}

/**
 * Perguntas da avaliação de risco disfarçadas como checklist culinário
 * Cada pergunta avalia um aspecto diferente da segurança da usuária
 */
const questions: Question[] = [
  {
    id: '1',
    question: 'Você tem todos os utensílios necessários na sua cozinha?',
    originalQuestion: 'Seu parceiro já ameaçou machucá-la?',
    options: [
      { value: 'sim', label: 'Sim, tenho tudo', score: 0 },
      { value: 'alguns', label: 'Tenho alguns', score: 5 },
      { value: 'poucos', label: 'Tenho poucos', score: 10 },
      { value: 'nenhum', label: 'Não tenho', score: 15 },
    ],
  },
  {
    id: '2',
    question: 'Você consegue escolher livremente seus ingredientes?',
    originalQuestion: 'Ele controla suas atividades?',
    options: [
      { value: 'sempre', label: 'Sempre', score: 0 },
      { value: 'geralmente', label: 'Geralmente', score: 5 },
      { value: 'as_vezes', label: 'Às vezes', score: 10 },
      { value: 'nunca', label: 'Nunca', score: 15 },
    ],
  },
  {
    id: '3',
    question: 'Como está sua despensa ultimamente?',
    originalQuestion: 'Você tem medo dele?',
    options: [
      { value: 'cheia', label: 'Bem abastecida', score: 0 },
      { value: 'razoavel', label: 'Razoável', score: 5 },
      { value: 'pouca', label: 'Com pouca coisa', score: 10 },
      { value: 'vazia', label: 'Vazia', score: 15 },
    ],
  },
  {
    id: '4',
    question: 'Você cozinha com tranquilidade?',
    originalQuestion: 'Você se sente segura em casa?',
    options: [
      { value: 'sempre', label: 'Sempre', score: 0 },
      { value: 'maioria', label: 'Na maioria das vezes', score: 5 },
      { value: 'raramente', label: 'Raramente', score: 10 },
      { value: 'nunca', label: 'Nunca', score: 15 },
    ],
  },
  {
    id: '5',
    question: 'Suas receitas têm dado certo?',
    originalQuestion: 'Você tem sofrido violência psicológica?',
    options: [
      { value: 'sempre', label: 'Sempre dão certo', score: 0 },
      { value: 'maioria', label: 'A maioria sim', score: 5 },
      { value: 'poucas', label: 'Poucas vezes', score: 10 },
      { value: 'nunca', label: 'Nunca dão certo', score: 15 },
    ],
  },
];

/**
 * Tela de Avaliação - Checklist de Risco Disfarçado
 * 
 * Esta tela apresenta um "checklist de cozinha" que na verdade é uma
 * avaliação de risco para violência doméstica, disfarçada em perguntas
 * sobre culinária e organização da cozinha.
 * 
 * Funcionalidades:
 * - Perguntas progressivas com metáforas culinárias
 * - Sistema de pontuação baseado em respostas
 * - Cálculo automático do nível de risco
 * - Armazenamento seguro dos resultados
 * - Redirecionamento para resultados personalizados
 * 
 * Perguntas e Significados:
 * - "Utensílios na cozinha" = Histórico de ameaças físicas
 * - "Escolha de ingredientes" = Controle de atividades
 * - "Estado da despensa" = Medo do parceiro
 * - "Tranquilidade ao cozinhar" = Segurança em casa
 * - "Sucesso das receitas" = Violência psicológica
 * 
 * Níveis de Risco:
 * - Baixo (0-20 pontos): Situação segura
 * - Moderado (21-40 pontos): Atenção necessária
 * - Alto (41+ pontos): Intervenção urgente
 * 
 * Objetivos:
 * - Identificar situações de risco de forma discreta
 * - Fornecer orientações personalizadas
 * - Conectar usuárias com recursos apropriados
 * - Manter privacidade e segurança
 */
export default function AssessmentScreen() {
  const colorScheme = useColorScheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [totalScore, setTotalScore] = useState(0);

  /**
   * Processa a resposta selecionada pelo usuário
   * Avança para próxima pergunta ou calcula resultado final
   * 
   * @param questionId - ID da pergunta respondida
   * @param value - Valor da resposta selecionada
   * @param score - Pontuação da resposta
   */
  const handleAnswer = (questionId: string, value: string, score: number) => {
    setAnswers({ ...answers, [questionId]: value });
    
    if (currentQuestion < questions.length - 1) {
      // Avança para próxima pergunta
      setCurrentQuestion(currentQuestion + 1);
      setTotalScore(totalScore + score);
    } else {
      // Última pergunta - calcula resultado final
      const finalScore = totalScore + score;
      calculateRisk(finalScore);
    }
  };

  /**
   * Calcula o nível de risco baseado na pontuação total
   * Salva resultados e apresenta orientações personalizadas
   * 
   * @param score - Pontuação total da avaliação
   */
  const calculateRisk = async (score: number) => {
    let riskLevel = '';
    let message = '';
    let tips = [];

    // Define nível de risco e mensagens baseado na pontuação
    if (score <= 20) {
      riskLevel = 'baixo';
      message = 'Você é uma cozinheira experiente! Continue assim.';
      tips = [
        'Mantenha sua organização',
        'Continue explorando novas receitas',
        'Compartilhe suas experiências com amigas',
      ];
    } else if (score <= 40) {
      riskLevel = 'moderado';
      message = 'Sua cozinha precisa de alguns ajustes para melhorar.';
      tips = [
        'Organize melhor seus utensílios',
        'Procure receitas mais simples',
        'Peça ajuda quando precisar',
        'Conheça nosso grupo de cozinheiras',
      ];
    } else {
      riskLevel = 'alto';
      message = 'Precisamos melhorar sua experiência na cozinha urgentemente.';
      tips = [
        'Temos receitas especiais para você',
        'Conheça nossos mercados recomendados',
        'Entre em contato com nossas cozinheiras experientes',
        'Veja nosso livro de receitas emergenciais',
      ];
    }

    // Salva resultados no AsyncStorage
    await AsyncStorage.setItem('riskLevel', riskLevel);
    await AsyncStorage.setItem('assessmentScore', score.toString());

    // Apresenta resultado e opções
    Alert.alert(
      'Resultado do Checklist',
      message,
      [
        {
          text: 'Ver Dicas',
          onPress: () => router.push({
            pathname: '/resultado',
            params: { score, riskLevel, tips: JSON.stringify(tips) }
          }),
        },
      ],
    );
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Checklist de Cozinha</ThemedText>
        <ThemedText style={styles.subtitle}>
          Vamos descobrir seu nível na cozinha
        </ThemedText>
      </ThemedView>

      {/* Barra de progresso */}
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
        </ThemedView>
        <ThemedText style={styles.progressText}>
          {currentQuestion + 1} de {questions.length}
        </ThemedText>
      </ThemedView>

      {/* Conteúdo da pergunta atual */}
      <ScrollView style={styles.content}>
        <ThemedView style={[styles.questionCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
          <ThemedText style={styles.questionText}>{question.question}</ThemedText>
          
          {/* Opções de resposta */}
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionButton, { backgroundColor: colorScheme === 'dark' ? '#3A3A3A' : '#F5F5F5' }]}
              onPress={() => handleAnswer(question.id, option.value, option.score)}
            >
              <ThemedText style={styles.optionText}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Estilos da tela de avaliação
 * Define a aparência visual de todos os elementos
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B6B', // Cor coral do app
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B', // Cor coral do app
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});