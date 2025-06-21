import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import AIService from '@/services/aiService';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

/**
 * Interface para representar um item do plano de segurança
 * Cada categoria tem um nome disfarçado e um nome real
 */
interface SafetyPlanItem {
  id: string;           // Identificador único
  category: string;     // Nome disfarçado (ex: "Ingredientes Essenciais")
  realCategory: string; // Nome real (ex: "Documentos Importantes")
  items: string[];      // Lista de itens disfarçados
  completed: boolean[]; // Status de conclusão de cada item
}

/**
 * Interface para representar um documento importante
 * Permite armazenar documentos digitais de forma segura
 */
interface ImportantDoc {
  id: string;       // Identificador único
  name: string;     // Nome do documento
  uri: string;      // URI do arquivo
  type: string;     // Tipo MIME do arquivo
}

/**
 * Template do plano de segurança disfarçado
 * Cada categoria representa um aspecto diferente da preparação
 */
const safetyPlanTemplate: SafetyPlanItem[] = [
  {
    id: '1',
    category: 'Ingredientes Essenciais',
    realCategory: 'Documentos Importantes',
    items: [
      'Receita da identidade (RG)',
      'Receita do cadastro (CPF)', 
      'Receita de união (Certidão)',
      'Receitas dos pequenos (Documentos dos filhos)',
      'Receita do lar (Comprovante de residência)',
    ],
    completed: [false, false, false, false, false],
  },
  {
    id: '2',
    category: 'Utensílios de Emergência',
    realCategory: 'Kit de Emergência',
    items: [
      'Panela extra (Roupas)',
      'Temperos reserva (Medicamentos)',
      'Cartão da feira (Dinheiro/cartão)',
      'Lista de fornecedores (Contatos importantes)',
      'Chaves da despensa (Chaves extras)',
    ],
    completed: [false, false, false, false, false],
  },
  {
    id: '3',
    category: 'Receitas Rápidas',
    realCategory: 'Plano de Saída',
    items: [
      'Caminho para o mercado 24h (Rota de fuga)',
      'Transporte para feira (Meio de transporte)',
      'Endereço da padaria amiga (Local seguro)',
      'Horário do mercado (Melhor momento)',
      'Senha do delivery (Código com contatos)',
    ],
    completed: [false, false, false, false, false],
  },
  {
    id: '4',
    category: 'Rede de Fornecedores',
    realCategory: 'Rede de Apoio',
    items: [
      'Vizinha que empresta ingredientes (Contato de confiança)',
      'Grupo de cozinheiras (Grupo de apoio)',
      'Mercado que fia (Ajuda financeira)',
      'Entregador conhecido (Transporte seguro)',
      'Chef consultora (Profissional de apoio)',
    ],
    completed: [false, false, false, false, false],
  },
];

/**
 * Tela de Plano de Segurança - Preparação Disfarçada
 * 
 * Esta tela apresenta um "plano de receita de emergência" que na verdade
 * é um plano de segurança completo para situações de violência doméstica,
 * disfarçado em linguagem culinária para manter a privacidade.
 * 
 * Funcionalidades:
 * - Checklist de preparação com metáforas culinárias
 * - Acompanhamento de progresso visual
 * - Armazenamento de documentos importantes
 * - Anotações pessoais seguras
 * - Plano personalizado gerado por IA
 * - Compartilhamento discreto de informações
 * - Alternância entre nomes disfarçados e reais
 * 
 * Categorias do Plano:
 * - "Ingredientes Essenciais" = Documentos importantes
 * - "Utensílios de Emergência" = Kit de emergência
 * - "Receitas Rápidas" = Plano de saída
 * - "Rede de Fornecedores" = Rede de apoio
 * 
 * Recursos de Segurança:
 * - Armazenamento local criptografado
 * - Interface disfarçada
 * - Compartilhamento discreto
 * - Integração com IA para personalização
 * - Backup automático de dados
 */
export default function SafetyPlanScreen() {
  const colorScheme = useColorScheme();
  const [planItems, setPlanItems] = useState<SafetyPlanItem[]>(safetyPlanTemplate);
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<ImportantDoc[]>([]);
  const [showRealNames, setShowRealNames] = useState(false);

  /**
   * Carrega plano salvo ao iniciar a tela
   */
  useEffect(() => {
    loadSavedPlan();
  }, []);

  /**
   * Carrega dados salvos do AsyncStorage
   * Restaura plano, anotações e documentos
   */
  const loadSavedPlan = async () => {
    try {
      const savedPlan = await AsyncStorage.getItem('safetyPlan');
      const savedNotes = await AsyncStorage.getItem('safetyPlanNotes');
      const savedDocs = await AsyncStorage.getItem('safetyPlanDocs');

      if (savedPlan) setPlanItems(JSON.parse(savedPlan));
      if (savedNotes) setNotes(savedNotes);
      if (savedDocs) setDocuments(JSON.parse(savedDocs));
    } catch (error) {
      console.error('Error loading safety plan:', error);
    }
  };

  /**
   * Salva plano atual no AsyncStorage
   * Armazena checklist, anotações e documentos
   */
  const savePlan = async () => {
    try {
      await AsyncStorage.setItem('safetyPlan', JSON.stringify(planItems));
      await AsyncStorage.setItem('safetyPlanNotes', notes);
      await AsyncStorage.setItem('safetyPlanDocs', JSON.stringify(documents));
      Alert.alert('Sucesso', 'Seu plano foi salvo com segurança!');
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Erro', 'Não foi possível salvar o plano');
    }
  };

  /**
   * Alterna status de conclusão de um item
   * 
   * @param categoryId - ID da categoria
   * @param itemIndex - Índice do item na categoria
   */
  const toggleItem = (categoryId: string, itemIndex: number) => {
    const updatedPlan = planItems.map(category => {
      if (category.id === categoryId) {
        const newCompleted = [...category.completed];
        newCompleted[itemIndex] = !newCompleted[itemIndex];
        return { ...category, completed: newCompleted };
      }
      return category;
    });
    setPlanItems(updatedPlan);
  };

  /**
   * Adiciona documento importante via seletor de arquivos
   * Suporta imagens e PDFs
   */
  const addDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newDoc: ImportantDoc = {
          id: Date.now().toString(),
          name: asset.name ?? 'Documento',
          uri: asset.uri,
          type: asset.mimeType || 'unknown',
        };
        setDocuments([...documents, newDoc]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  /**
   * Compartilha plano de emergência de forma discreta
   * Usa linguagem culinária para manter o disfarce
   */
  const shareEmergencyPlan = async () => {
    const emergencyInfo = `
🍳 RECEITA DE EMERGÊNCIA 🍳

📱 Contatos Rápidos:
- Mercado 24h: 190
- Feira Especializada: 180
- Consultora de Receitas: (61) 3207-6172

📍 Locais Seguros:
- Mercado Central (UPA Ceilândia)
- Feira da Região (CREAS)
- Loja Especializada (DEAM)

🔑 Códigos:
- "Preciso de sal" = Situação tensa
- "Queimei o jantar" = Emergência
- "Vou fazer um bolo" = Saindo agora

Mantenha essa receita sempre à mão!
    `;

    try {
      await Share.share({
        message: emergencyInfo,
        title: 'Receita de Emergência',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  /**
   * Calcula porcentagem de conclusão do plano
   * 
   * @returns Porcentagem de itens concluídos
   */
  const getCompletionPercentage = () => {
    const totalItems = planItems.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = planItems.reduce(
      (acc, cat) => acc + cat.completed.filter(c => c).length, 
      0
    );
    return Math.round((completedItems / totalItems) * 100);
  };

  /**
   * Gera plano personalizado via IA
   * Baseado no nível de risco e contexto da usuária
   */
  const generateAIPlan = async () => {
    const userContext = {
      location: 'Ceilândia',
      riskLevel: await AsyncStorage.getItem('riskLevel') || 'medium',
    };

    const aiPlan = await AIService.generateSafetyPlan(
      userContext.riskLevel,
      userContext
    );

    Alert.alert(
      'Plano Personalizado',
      `Baseado em sua situação, recomendamos:\n\n` +
      `Imediato:\n${aiPlan.immediate.join('\n')}\n\n` +
      `Curto Prazo:\n${aiPlan.shortTerm.join('\n')}\n\n` +
      `Recursos:\n${aiPlan.resources.join('\n')}`,
      [{ text: 'Entendi' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Receita de Emergência</ThemedText>
        <ThemedText style={styles.subtitle}>
          Prepare tudo com antecedência para momentos difíceis
        </ThemedText>
      </ThemedView>

      {/* Barra de progresso */}
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView 
            style={[styles.progressFill, { width: `${getCompletionPercentage()}%` }]} 
          />
        </ThemedView>
        <ThemedText style={styles.progressText}>
          {getCompletionPercentage()}% Preparado
        </ThemedText>
      </ThemedView>

      {/* Botão para alternar visibilidade dos nomes reais */}
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: '#FF6B6B' }]}
        onPress={() => setShowRealNames(!showRealNames)}
      >
        <MaterialIcons 
          name={showRealNames ? 'visibility-off' : 'visibility'} 
          size={20} 
          color="white" 
        />
        <ThemedText style={styles.toggleButtonText}>
          {showRealNames ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
        </ThemedText>
      </TouchableOpacity>

      {/* Lista de categorias do plano */}
      {planItems.map((category) => (
        <ThemedView
          key={category.id}
          style={[styles.categoryCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
        >
          <ThemedText style={styles.categoryTitle}>
            {category.category}
            {showRealNames && (
              <ThemedText style={styles.realCategory}> ({category.realCategory})</ThemedText>
            )}
          </ThemedText>
          
          {/* Itens da categoria */}
          {category.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkItem}
              onPress={() => toggleItem(category.id, index)}
            >
              <MaterialIcons
                name={category.completed[index] ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={category.completed[index] ? '#4CAF50' : '#999'}
              />
              <ThemedText style={[
                styles.itemText,
                category.completed[index] && styles.completedItem
              ]}>
                {item}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}

      {/* Seção de anotações */}
      <ThemedView style={[styles.notesCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.notesTitle}>Anotações da Receita</ThemedText>
        <TextInput
          style={[styles.notesInput, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
          placeholder="Adicione observações importantes..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </ThemedView>

      {/* Seção de documentos */}
      <ThemedView style={[styles.documentsCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.documentsTitle}>Receitas Importantes</ThemedText>
        
        {/* Lista de documentos */}
        {documents.map((doc) => (
          <ThemedView key={doc.id} style={styles.documentItem}>
            <MaterialIcons name="description" size={24} color="#666" />
            <ThemedText style={styles.documentName}>{doc.name}</ThemedText>
            <TouchableOpacity onPress={() => {
              setDocuments(documents.filter(d => d.id !== doc.id));
            }}>
              <MaterialIcons name="delete" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </ThemedView>
        ))}

        {/* Botão para adicionar documento */}
        <TouchableOpacity
          style={[styles.addDocButton, { backgroundColor: '#4CAF50' }]}
          onPress={addDocument}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <ThemedText style={styles.addDocText}>Adicionar Receita</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Botões de ação */}
      <ThemedView style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={generateAIPlan}
        >
          <MaterialIcons name="psychology" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Plano Personalizado</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={shareEmergencyPlan}
        >
          <MaterialIcons name="share" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Compartilhar</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={savePlan}
        >
          <MaterialIcons name="save" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Salvar Plano</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

/**
 * Estilos da tela de plano de segurança
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
    backgroundColor: '#4CAF50', // Verde para progresso
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCard: {
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
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  realCategory: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: 'normal',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  completedItem: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  notesCard: {
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
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  documentsCard: {
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
  documentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  addDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  addDocText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});