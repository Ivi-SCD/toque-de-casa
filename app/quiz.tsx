import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

/**
 * Interface para representar uma pergunta do quiz
 * Define a estrutura das perguntas educativas
 */
interface Question {
  id: string;           // Identificador único
  question: string;     // Pergunta disfarçada em linguagem culinária
  options: string[];    // Opções de resposta
  correctAnswer: number; // Índice da resposta correta
  explanation: string;  // Explicação educativa da resposta
  category: string;     // Categoria da pergunta (sinais, direitos, seguranca)
}

/**
 * Perguntas do quiz educativo disfarçado
 * Cada pergunta ensina sobre violência doméstica usando metáforas culinárias
 */
const questions: Question[] = [
  {
    id: '1',
    question: 'O que fazer quando um prato não sai como esperado várias vezes?',
    options: [
      'Insistir na mesma receita',
      'Procurar novas técnicas e apoio',
      'Desistir de cozinhar',
      'Culpar os ingredientes',
    ],
    correctAnswer: 1,
    explanation: 'Quando algo não está funcionando repetidamente, é importante buscar ajuda e novas perspectivas.',
    category: 'sinais',
  },
  {
    id: '2',
    question: 'Qual o ingrediente mais importante em qualquer receita?',
    options: [
      'Sal e pimenta',
      'Óleo de qualidade',
      'Respeito e segurança',
      'Temperos caros',
    ],
    correctAnswer: 2,
    explanation: 'O respeito mútuo e a segurança são fundamentais em qualquer relacionamento saudável.',
    category: 'direitos',
  },
  {
    id: '3',
    question: 'Quando você deve compartilhar suas receitas especiais?',
    options: [
      'Com qualquer pessoa',
      'Nunca compartilhar',
      'Apenas com pessoas de confiança',
      'Somente em redes sociais',
    ],
    correctAnswer: 2,
    explanation: 'Informações pessoais e planos de segurança devem ser compartilhados apenas com pessoas confiáveis.',
    category: 'seguranca',
  },
  {
    id: '4',
    question: 'O que significa quando alguém sempre critica sua forma de cozinhar?',
    options: [
      'Você precisa melhorar',
      'É uma forma de controle',
      'É normal em relacionamentos',
      'Demonstra cuidado',
    ],
    correctAnswer: 1,
    explanation: 'Críticas constantes são uma forma de violência psicológica e controle.',
    category: 'sinais',
  },
  {
    id: '5',
    question: 'Qual a melhor hora para ir ao mercado quando precisa de ingredientes urgentes?',
    options: [
      'Sempre à noite',
      'Quando houver segurança',
      'Sozinha de madrugada',
      'Nunca sair de casa',
    ],
    correctAnswer: 1,
    explanation: 'Sempre priorize sua segurança ao sair, especialmente em situações de risco.',
    category: 'seguranca',
  },
];

/**
 * Tela de Quiz - Teste Educativo Disfarçado
 * 
 * Esta tela apresenta um "quiz de culinária" que na verdade é um
 * teste educativo sobre violência doméstica, direitos das mulheres
 * e estratégias de segurança, disfarçado em perguntas sobre cozinha.
 * 
 * Funcionalidades:
 * - Perguntas progressivas com metáforas culinárias
 * - Sistema de pontuação em tempo real
 * - Explicações educativas para cada resposta
 * - Categorização por temas (sinais, direitos, segurança)
 * - Conquistas por alto desempenho
 * - Feedback visual imediato
 * - Progresso visual do quiz
 * 
 * Categorias de Perguntas:
 * - "Reconhecendo Sinais" = Identificação de violência
 * - "Seus Direitos" = Conhecimento sobre direitos legais
 * - "Segurança Pessoal" = Estratégias de proteção
 * 
 * Objetivos Educativos:
 * - Conscientização sobre violência doméstica
 * - Aprendizado sobre direitos e leis
 * - Desenvolvimento de estratégias de segurança
 * - Fortalecimento da autonomia feminina
 * - Gamificação para engajamento
 */
export default function QuizScreen() {
  const colorScheme = useColorScheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  /**
   * Processa a resposta selecionada pelo usuário
   * Mostra feedback visual e explicação educativa
   * 
   * @param answerIndex - Índice da resposta selecionada
   */
  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    // Verifica se a resposta está correta e ainda não foi respondida
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect && !answeredQuestions[currentQuestion]) {
      setScore(score + 1);
    }

    // Marca a pergunta como respondida
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
  };

  /**
   * Avança para próxima pergunta ou finaliza o quiz
   */
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Avança para próxima pergunta
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Finaliza o quiz
      finishQuiz();
    }
  };

  /**
   * Finaliza o quiz e apresenta resultados
   * Salva conquista se o desempenho for alto
   */
  const finishQuiz = async () => {
    const percentage = Math.round((score / questions.length) * 100);
    
    // Salva conquista se pontuação alta (80% ou mais)
    if (percentage >= 80) {
      const achievements = await AsyncStorage.getItem('achievements');
      const currentAchievements = achievements ? JSON.parse(achievements) : [];
      
      const newAchievement = {
        id: `quiz_${Date.now()}`,
        title: 'Mestre do Conhecimento',
        description: `Acertou ${percentage}% no quiz`,
        icon: '🎓',
        unlockedAt: new Date(),
      };
      
      currentAchievements.push(newAchievement);
      await AsyncStorage.setItem('achievements', JSON.stringify(currentAchievements));
    }

    // Apresenta resultado final
    Alert.alert(
      'Quiz Concluído!',
      `Você acertou ${score} de ${questions.length} perguntas (${percentage}%)`,
      [
        {
          text: 'Ver Progresso',
          onPress: () => router.replace('/dashboard'),
        },
        {
          text: 'Refazer',
          onPress: () => {
            // Reinicia o quiz
            setCurrentQuestion(0);
            setScore(0);
            setSelectedAnswer(null);
            setShowExplanation(false);
            setAnsweredQuestions(new Array(questions.length).fill(false));
          },
        },
      ]
    );
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Teste seu Conhecimento</ThemedText>
        <ThemedText style={styles.subtitle}>
          Aprenda mais sobre culinária segura
        </ThemedText>
      </ThemedView>

      {/* Barra de progresso e pontuação */}
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
        </ThemedView>
        <ThemedView style={styles.progressInfo}>
          <ThemedText style={styles.progressText}>
            Pergunta {currentQuestion + 1} de {questions.length}
          </ThemedText>
          <ThemedText style={styles.scoreText}>
            Pontos: {score}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Card da pergunta atual */}
      <ThemedView style={[styles.questionCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        {/* Badge da categoria */}
        <ThemedView style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>
            {question.category === 'sinais' ? 'Reconhecendo Sinais' :
             question.category === 'direitos' ? 'Seus Direitos' :
             'Segurança Pessoal'}
          </ThemedText>
        </ThemedView>

        {/* Texto da pergunta */}
        <ThemedText style={styles.questionText}>{question.question}</ThemedText>

        {/* Opções de resposta */}
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showResult = showExplanation;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                showResult && isCorrect && styles.correctOption,
                showResult && isSelected && !isCorrect && styles.wrongOption,
                { backgroundColor: 
                  showResult && isCorrect ? '#4CAF50' : // Verde para resposta correta
                  showResult && isSelected && !isCorrect ? '#FF6B6B' : // Vermelho para resposta errada
                  colorScheme === 'dark' ? '#3A3A3A' : '#F5F5F5'
                }
              ]}
              onPress={() => handleAnswer(index)}
              disabled={showExplanation}
            >
              <ThemedText style={[
                styles.optionText,
                showResult && (isCorrect || (isSelected && !isCorrect)) && styles.whiteText
              ]}>
                {option}
              </ThemedText>
              {/* Ícones de feedback visual */}
              {showResult && isCorrect && (
                <MaterialIcons name="check-circle" size={24} color="white" />
              )}
              {showResult && isSelected && !isCorrect && (
                <MaterialIcons name="cancel" size={24} color="white" />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Explicação educativa */}
        {showExplanation && (
          <ThemedView style={[styles.explanationCard, { backgroundColor: '#E3F2FD' }]}>
            <MaterialIcons name="info" size={24} color="#1976D2" />
            <ThemedText style={styles.explanationText}>{question.explanation}</ThemedText>
          </ThemedView>
        )}

        {/* Botão para próxima pergunta */}
        {showExplanation && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: '#2196F3' }]}
            onPress={nextQuestion}
          >
            <ThemedText style={styles.nextButtonText}>
              {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
            </ThemedText>
            <MaterialIcons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Dica motivacional */}
      <ThemedView style={styles.tipsCard}>
        <MaterialIcons name="lightbulb" size={24} color="#FFA500" />
        <ThemedText style={styles.tipText}>
          Dica: Cada pergunta ensina algo importante sobre segurança e bem-estar.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

/**
 * Estilos da tela de quiz
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
    backgroundColor: '#2196F3', // Azul para progresso
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50', // Verde para pontuação
  },
  questionCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#2196F3', // Azul para seleção
  },
  correctOption: {
    borderWidth: 0,
  },
  wrongOption: {
    borderWidth: 0,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  whiteText: {
    color: 'white',
    fontWeight: '500',
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  explanationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: '#1976D2',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#E65100',
  },
});