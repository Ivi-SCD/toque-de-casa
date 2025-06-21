import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

/**
 * Interface para os dados do dashboard
 * Define a estrutura dos dados de progresso e bem-estar
 */
interface DashboardData {
  wellbeingScore: number;      // Pontuação de bem-estar (0-100)
  safetyProgress: number;      // Progresso do plano de segurança (0-100)
  networkStrength: number;     // Força da rede de apoio (0-100)
  knowledgeLevel: number;      // Nível de conhecimento (0-100)
  weeklyMood: number[];        // Humor semanal (7 dias)
  achievements: Achievement[]; // Conquistas desbloqueadas
  recentActivities: Activity[]; // Atividades recentes
}

/**
 * Interface para representar uma conquista
 * Define a estrutura das conquistas do usuário
 */
interface Achievement {
  id: string;           // Identificador único
  title: string;        // Título da conquista
  description: string;  // Descrição da conquista
  icon: string;         // Emoji representativo
  unlockedAt: Date;     // Data de desbloqueio
}

/**
 * Interface para representar uma atividade
 * Define a estrutura das atividades recentes
 */
interface Activity {
  id: string;           // Identificador único
  type: string;         // Tipo de atividade
  description: string;  // Descrição da atividade
  timestamp: Date;      // Data/hora da atividade
}

const screenWidth = Dimensions.get('window').width;

/**
 * Tela de Dashboard - Acompanhamento de Progresso Disfarçado
 * 
 * Esta tela apresenta um "dashboard culinário" que na verdade é um
 * sistema de acompanhamento do progresso de segurança e bem-estar
 * da usuária, disfarçado como métricas de evolução na cozinha.
 * 
 * Funcionalidades:
 * - Gráficos de progresso disfarçados como métricas culinárias
 * - Acompanhamento de bem-estar baseado no nível de risco
 * - Progresso do plano de segurança
 * - Força da rede de apoio
 * - Conquistas motivacionais
 * - Metas semanais
 * - Acesso rápido às funcionalidades principais
 * 
 * Métricas Disfarçadas:
 * - "Bem-estar" = Nível de segurança baseado na avaliação de risco
 * - "Segurança" = Progresso do plano de segurança
 * - "Rede" = Força da rede de contatos de emergência
 * - "Conhecimento" = Nível de conhecimento sobre direitos
 * - "Humor Semanal" = Acompanhamento do estado emocional
 * 
 * Objetivos:
 * - Motivar o uso contínuo do aplicativo
 * - Visualizar progresso de forma segura
 * - Manter engajamento através de gamificação
 * - Facilitar acesso às funcionalidades principais
 */
export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    wellbeingScore: 0,
    safetyProgress: 0,
    networkStrength: 0,
    knowledgeLevel: 0,
    weeklyMood: [0, 0, 0, 0, 0, 0, 0],
    achievements: [],
    recentActivities: [],
  });

  /**
   * Carrega dados do dashboard ao iniciar a tela
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Carrega e calcula os dados do dashboard
   * Combina informações de diferentes fontes para criar métricas
   */
  const loadDashboardData = async () => {
    try {
      // Carrega dados salvos do AsyncStorage
      const riskLevel = await AsyncStorage.getItem('riskLevel');
      const assessmentScore = await AsyncStorage.getItem('assessmentScore');
      const contacts = await AsyncStorage.getItem('emergencyContacts');
      const safetyPlan = await AsyncStorage.getItem('safetyPlan');
      const achievements = await AsyncStorage.getItem('achievements');
      const activities = await AsyncStorage.getItem('recentActivities');

      const contactsList = contacts ? JSON.parse(contacts) : [];
      const planItems = safetyPlan ? JSON.parse(safetyPlan) : [];
      
      // Calcula pontuação de bem-estar baseada no nível de risco
      const wellbeing = riskLevel === 'baixo' ? 80 : 
                       riskLevel === 'moderado' ? 50 : 20;

      // Calcula progresso do plano de segurança
      const totalPlanItems = planItems.reduce((acc: number, cat: any) => 
        acc + cat.items.length, 0
      );
      const completedItems = planItems.reduce((acc: number, cat: any) => 
        acc + cat.completed.filter((c: boolean) => c).length, 0
      );
      const safetyProgress = totalPlanItems > 0 ? 
        (completedItems / totalPlanItems) * 100 : 0;

      // Calcula força da rede de apoio baseada no número de contatos
      const networkStrength = Math.min(contactsList.length * 20, 100);

      // Dados simulados de humor semanal
      const weeklyMood = [65, 70, 60, 75, 80, 85, 90];

      // Conquistas padrão
      const defaultAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Primeira Receita',
          description: 'Completou sua primeira avaliação',
          icon: '🎯',
          unlockedAt: new Date(),
        },
        {
          id: '2',
          title: 'Rede Formada',
          description: 'Adicionou contatos de emergência',
          icon: '🤝',
          unlockedAt: new Date(),
        },
      ];

      // Atualiza o estado com os dados calculados
      setDashboardData({
        wellbeingScore: wellbeing,
        safetyProgress,
        networkStrength,
        knowledgeLevel: 60,
        weeklyMood,
        achievements: achievements ? JSON.parse(achievements) : defaultAchievements,
        recentActivities: activities ? JSON.parse(activities) : [],
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  /**
   * Configuração dos gráficos
   * Define cores e estilos baseados no tema
   */
  const chartConfig = {
    backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
    backgroundGradientFrom: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
    backgroundGradientTo: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // Cor coral do app
    labelColor: (opacity = 1) => 
      colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#FF6B6B',
    },
  };

  /**
   * Dados para o gráfico de progresso circular
   */
  const progressData = {
    labels: ['Bem-estar', 'Segurança', 'Rede', 'Conhecimento'],
    data: [
      dashboardData.wellbeingScore / 100,
      dashboardData.safetyProgress / 100,
      dashboardData.networkStrength / 100,
      dashboardData.knowledgeLevel / 100,
    ],
  };

  // Dias da semana para o gráfico de linha
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Meu Progresso Culinário</ThemedText>
        <ThemedText style={styles.subtitle}>
          Acompanhe sua evolução na cozinha
        </ThemedText>
      </ThemedView>

      {/* Gráfico de progresso circular */}
      <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.cardTitle}>Visão Geral</ThemedText>
        <ProgressChart
          data={progressData}
          width={screenWidth - 60}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
          style={styles.chart}
        />
      </ThemedView>

      {/* Gráfico de linha - humor semanal */}
      <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.cardTitle}>Humor Semanal na Cozinha</ThemedText>
        <LineChart
          data={{
            labels: weekDays,
            datasets: [{
              data: dashboardData.weeklyMood,
            }],
          }}
          width={screenWidth - 60}
          height={200}
          yAxisSuffix="%"
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </ThemedView>

      {/* Cards de estatísticas */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <MaterialIcons name="favorite" size={32} color="white" />
          <ThemedText style={styles.statValue}>{dashboardData.wellbeingScore}%</ThemedText>
          <ThemedText style={styles.statLabel}>Bem-estar</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
          <MaterialIcons name="security" size={32} color="white" />
          <ThemedText style={styles.statValue}>{Math.round(dashboardData.safetyProgress)}%</ThemedText>
          <ThemedText style={styles.statLabel}>Segurança</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
          <MaterialIcons name="people" size={32} color="white" />
          <ThemedText style={styles.statValue}>{dashboardData.networkStrength}%</ThemedText>
          <ThemedText style={styles.statLabel}>Rede</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Seção de conquistas */}
      <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.cardTitle}>Conquistas Desbloqueadas</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dashboardData.achievements.map((achievement) => (
            <ThemedView key={achievement.id} style={styles.achievementCard}>
              <ThemedText style={styles.achievementIcon}>{achievement.icon}</ThemedText>
              <ThemedText style={styles.achievementTitle}>{achievement.title}</ThemedText>
              <ThemedText style={styles.achievementDesc}>{achievement.description}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Metas semanais */}
      <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.cardTitle}>Metas da Semana</ThemedText>
        
        <TouchableOpacity style={styles.goalItem}>
          <MaterialIcons 
            name="check-circle" 
            size={24} 
            color="#4CAF50" 
          />
          <ThemedText style={styles.goalText}>Participar do grupo de receitas</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.goalItem}>
          <MaterialIcons 
            name="radio-button-unchecked" 
            size={24} 
            color="#999" 
          />
          <ThemedText style={styles.goalText}>Atualizar plano de segurança</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.goalItem}>
          <MaterialIcons 
            name="radio-button-unchecked" 
            size={24} 
            color="#999" 
          />
          <ThemedText style={styles.goalText}>Conectar com uma mentora</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Botões de ação rápida */}
      <ThemedView style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => router.push('/avaliacao')}
        >
          <MaterialIcons name="assessment" size={24} color="white" />
          <ThemedText style={styles.actionButtonText}>Nova Avaliação</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => router.push('/plano-seguranca')}
        >
          <MaterialIcons name="checklist" size={24} color="white" />
          <ThemedText style={styles.actionButtonText}>Revisar Plano</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

/**
 * Estilos da tela de dashboard
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
  card: {
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  achievementCard: {
    alignItems: 'center',
    padding: 15,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    width: 120,
  },
  achievementIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalText: {
    marginLeft: 10,
    fontSize: 16,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});