import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import AIService from '@/services/aiService';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ResultScreen() {
  const colorScheme = useColorScheme();
  const localParams = useLocalSearchParams();

  const params = useMemo(() => ({
    score: Array.isArray(localParams.score) ? localParams.score[0] : localParams.score,
    riskLevel: Array.isArray(localParams.riskLevel) ? localParams.riskLevel[0] : localParams.riskLevel,
    tips: Array.isArray(localParams.tips) ? localParams.tips[0] : localParams.tips,
  }), [localParams]);

  const [tips, setTips] = useState<string[]>([]);
  const [recommendedActions, setRecommendedActions] = useState<RecommendedAction[]>([]);
  const [safetyPlan, setSafetyPlan] = useState<any>(null);

  useEffect(() => {
    if (params.tips) {
      setTips(JSON.parse(params.tips));
    }
    loadRecommendations();
  }, [params]);

  const loadRecommendations = async () => {
    const riskLevel = params.riskLevel || 'baixo';
    
    const aiPlan = await AIService.generateSafetyPlan(riskLevel, {
      riskLevel,
      location: 'Ceilândia',
    });
    setSafetyPlan(aiPlan);

    let actions: RecommendedAction[] = [];

    if (riskLevel === 'alto') {
      actions = [
        {
          id: '1',
          title: 'Criar Plano de Emergência',
          description: 'Configure sua receita de emergência agora',
          icon: 'emergency',
          route: '/plano-seguranca',
          priority: 'high',
        },
        {
          id: '2',
          title: 'Adicionar Contatos',
          description: 'Configure sua rede de apoio',
          icon: 'people',
          route: '/grupo',
          priority: 'high',
        },
        {
          id: '3',
          title: 'Locais Seguros',
          description: 'Conheça os mercados 24h próximos',
          icon: 'store',
          route: '/mapas',
          priority: 'high',
        },
        {
          id: '4',
          title: 'Falar com Mentora',
          description: 'Conecte-se com cozinheiras experientes',
          icon: 'psychology',
          route: '/grupo',
          priority: 'medium',
        },
      ];
    } else if (riskLevel === 'moderado') {
      actions = [
        {
          id: '1',
          title: 'Fortalecer Rede',
          description: 'Amplie seu grupo de apoio',
          icon: 'group-add',
          route: '/grupo',
          priority: 'medium',
        },
        {
          id: '2',
          title: 'Aprender Mais',
          description: 'Leia o livro de receitas',
          icon: 'menu-book',
          route: '/livro',
          priority: 'medium',
        },
        {
          id: '3',
          title: 'Preparar Segurança',
          description: 'Inicie seu plano preventivo',
          icon: 'security',
          route: '/plano-seguranca',
          priority: 'low',
        },
      ];
    } else {
      actions = [
        {
          id: '1',
          title: 'Manter Vigilância',
          description: 'Continue atenta aos sinais',
          icon: 'visibility',
          route: '/livro',
          priority: 'low',
        },
        {
          id: '2',
          title: 'Ajudar Outras',
          description: 'Seja mentora no grupo',
          icon: 'volunteer-activism',
          route: '/grupo',
          priority: 'low',
        },
      ];
    }

    setRecommendedActions(actions);
  };

  const shareResults = async () => {
    const message = `
🍳 Resultado do Checklist Culinário 🍳

Nível: ${getRiskLevelText()}
Pontuação: ${params.score}/75

Dicas principais:
${tips.slice(0, 3).map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

Baixe o Toque de Casa para mais receitas!
    `;

    try {
      await Share.share({
        message,
        title: 'Meu Resultado Culinário',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getRiskLevelText = () => {
    switch (params.riskLevel) {
      case 'alto':
        return 'Iniciante na Cozinha';
      case 'moderado':
        return 'Cozinheira em Desenvolvimento';
      case 'baixo':
        return 'Chef Experiente';
      default:
        return 'Avaliando...';
    }
  };

  const getRiskLevelColor = () => {
    switch (params.riskLevel) {
      case 'alto':
        return '#FF0000';
      case 'moderado':
        return '#FFA500';
      case 'baixo':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const getRiskLevelIcon = () => {
    switch (params.riskLevel) {
      case 'alto':
        return '🔴';
      case 'moderado':
        return '🟡';
      case 'baixo':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Resultado do Checklist</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.riskCard, { backgroundColor: getRiskLevelColor() }]}>
        <ThemedText style={styles.riskIcon}>{getRiskLevelIcon()}</ThemedText>
        <ThemedText style={styles.riskLevel}>{getRiskLevelText()}</ThemedText>
        <ThemedText style={styles.riskScore}>Pontuação: {params.score}/75</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.sectionTitle}>Dicas Personalizadas</ThemedText>
        {tips.map((tip, index) => (
          <ThemedView key={index} style={styles.tipItem}>
            <MaterialIcons name="lightbulb" size={20} color="#FFA500" />
            <ThemedText style={styles.tipText}>{tip}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {params.riskLevel === 'alto' && safetyPlan && (
        <ThemedView style={[styles.urgentSection, { backgroundColor: '#FF6B6B' }]}>
          <ThemedText style={styles.urgentTitle}>Ações Imediatas</ThemedText>
          {safetyPlan.immediate.map((action: string, index: number) => (
            <ThemedView key={index} style={styles.urgentItem}>
              <MaterialIcons name="warning" size={20} color="white" />
              <ThemedText style={styles.urgentText}>{action}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <ThemedView style={styles.actionsSection}>
        <ThemedText style={styles.sectionTitle}>Próximos Passos Recomendados</ThemedText>
        
        {recommendedActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionCard,
              { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' },
              action.priority === 'high' && styles.highPriorityCard,
            ]}
            onPress={() => router.push(action.route as any)}
          >
            <MaterialIcons
              name={action.icon as any}
              size={32}
              color={action.priority === 'high' ? '#FF0000' : '#666'}
            />
            <ThemedView style={styles.actionContent}>
              <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
              <ThemedText style={styles.actionDescription}>{action.description}</ThemedText>
            </ThemedView>
            <MaterialIcons name="arrow-forward" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </ThemedView>

      {safetyPlan && safetyPlan.resources.length > 0 && (
        <ThemedView style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
          <ThemedText style={styles.sectionTitle}>Recursos Disponíveis</ThemedText>
          {safetyPlan.resources.map((resource: string, index: number) => (
            <ThemedView key={index} style={styles.resourceItem}>
              <MaterialIcons name="place" size={20} color="#2196F3" />
              <ThemedText style={styles.resourceText}>{resource}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={() => router.push('/dashboard')}
        >
          <MaterialIcons name="dashboard" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Ver Progresso</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196F3' }]}
          onPress={shareResults}
        >
          <MaterialIcons name="share" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Compartilhar</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={[styles.motivationalCard, { backgroundColor: '#F5F5F5' }]}>
        <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
        <ThemedText style={styles.motivationalText}>
          {params.riskLevel === 'alto' 
            ? 'Você deu o primeiro passo mais importante. Estamos aqui para apoiar você!'
            : params.riskLevel === 'moderado'
            ? 'Continue fortalecendo suas habilidades. Cada passo conta!'
            : 'Parabéns por cuidar de si mesma! Continue inspirando outras.'}
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

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
    color: '#FF6B6B',
    marginBottom: 10,
  },
  riskCard: {
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  riskIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  riskScore: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  urgentSection: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
  },
  urgentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  urgentText: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  highPriorityCard: {
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  motivationalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  motivationalText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});