import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface HelpTopic {
  id: string;
  title: string;
  icon: string;
  content: string[];
  tips?: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: '1',
    title: 'Como Usar o App',
    icon: 'phone-android',
    content: [
      'O Toque de Casa funciona como um app normal de receitas.',
      'Para acessar funcionalidades especiais, mantenha pressionada a categoria "Especiais" por 5 segundos.',
      'Todas as informações sensíveis são camufladas como conteúdo culinário.',
      'Use os códigos de emergência no chat quando precisar de ajuda.',
    ],
    tips: [
      'Configure um código de pânico nas configurações',
      'Adicione contatos de emergência discretamente',
      'Mantenha o app sempre atualizado',
    ],
  },
  {
    id: '2',
    title: 'Códigos de Emergência',
    icon: 'warning',
    content: [
      '"Preciso de sal" = Situação de violência psicológica',
      '"Queimei o jantar" = Escalada para violência física',
      '"Vou fazer um bolo" = Necessito sair urgentemente',
      '"Receita não deu certo" = Preciso conversar',
      '"Faltou tempero" = Preciso de orientação',
    ],
    tips: [
      'Memorize os códigos mais importantes',
      'Use naturalmente em conversas',
      'Seus contatos receberão alertas automáticos',
    ],
  },
  {
    id: '3',
    title: 'Rede de Apoio',
    icon: 'people',
    content: [
      'Adicione até 5 contatos de emergência',
      'Configure níveis de alerta diferentes',
      'Participe do grupo de apoio anônimo',
      'Conecte-se com mentoras experientes',
    ],
  },
  {
    id: '4',
    title: 'Segurança Digital',
    icon: 'security',
    content: [
      'O app tem aparência normal de receitas',
      'Dados sensíveis são criptografados',
      'Modo pânico limpa informações comprometedoras',
      'Histórico duplo protege sua privacidade',
    ],
  },
  {
    id: '5',
    title: 'Recursos de Emergência',
    icon: 'emergency',
    content: [
      'Mapa offline com locais seguros',
      'Números de emergência disfarçados',
      'Plano de segurança personalizado',
      'Coleta segura de evidências',
    ],
  },
];

const faqs: FAQ[] = [
  {
    question: 'O app é realmente seguro?',
    answer: 'Sim. Usamos criptografia de ponta, aparência camuflada e múltiplas camadas de segurança. Nenhum dado pessoal é compartilhado sem sua autorização.',
  },
  {
    question: 'E se alguém pegar meu celular?',
    answer: 'O app parece um aplicativo normal de receitas. As funcionalidades especiais só são acessíveis com autenticação biométrica ou código secreto.',
  },
  {
    question: 'Como funciona o modo pânico?',
    answer: 'Ao inserir o código de pânico, o app remove instantaneamente todos os dados sensíveis e volta ao modo receitas normal.',
  },
  {
    question: 'Os contatos de emergência são notificados automaticamente?',
    answer: 'Apenas quando você usar códigos de emergência críticos ou ativar manualmente. Você tem controle total sobre quando alertar sua rede.',
  },
  {
    question: 'Posso recuperar dados após usar o modo pânico?',
    answer: 'Por segurança, dados removidos no modo pânico não podem ser recuperados. Faça backups regulares em local seguro.',
  },
];

const emergencyNumbers = [
  { name: 'Central de Atendimento à Mulher', number: '180', real: true },
  { name: 'Mercado 24h (Emergência)', number: '190', real: true },
  { name: 'Feira Especializada (DEAM)', number: '197', real: true },
  { name: 'Consultoria Jurídica', number: '(61) 3207-6172', real: false },
];

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showEmergencyNumbers, setShowEmergencyNumbers] = useState(false);

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleTopicPress = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Central de Ajuda</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tudo que você precisa saber
        </ThemedText>
      </ThemedView>

      {/* Quick Emergency Button */}
      <TouchableOpacity
        style={[styles.emergencyButton, { backgroundColor: '#FF0000' }]}
        onPress={() => setShowEmergencyNumbers(!showEmergencyNumbers)}
      >
        <MaterialIcons name="emergency" size={24} color="white" />
        <ThemedText style={styles.emergencyButtonText}>
          Números de Emergência
        </ThemedText>
        <MaterialIcons 
          name={showEmergencyNumbers ? 'expand-less' : 'expand-more'} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>

      {showEmergencyNumbers && (
        <ThemedView style={[styles.emergencyNumbers, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
          {emergencyNumbers.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emergencyNumberItem}
              onPress={() => handleCall(item.number)}
            >
              <ThemedView>
                <ThemedText style={styles.emergencyName}>{item.name}</ThemedText>
                <ThemedText style={styles.emergencyNumber}>{item.number}</ThemedText>
              </ThemedView>
              <MaterialIcons name="phone" size={24} color="#4CAF50" />
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}

      {/* Help Topics */}
      <ThemedText style={styles.sectionTitle}>Tópicos de Ajuda</ThemedText>
      {helpTopics.map((topic) => (
        <TouchableOpacity
          key={topic.id}
          style={[styles.topicCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
          onPress={() => handleTopicPress(topic)}
        >
          <MaterialIcons name={topic.icon as any} size={32} color="#666" />
          <ThemedText style={styles.topicTitle}>{topic.title}</ThemedText>
          <MaterialIcons name="arrow-forward-ios" size={20} color="#999" />
        </TouchableOpacity>
      ))}

      {/* FAQs */}
      <ThemedText style={styles.sectionTitle}>Perguntas Frequentes</ThemedText>
      {faqs.map((faq, index) => (
        <ThemedView
          key={index}
          style={[styles.faqCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
        >
          <ThemedView style={styles.faqQuestion}>
            <MaterialIcons name="help-outline" size={20} color="#2196F3" />
            <ThemedText style={styles.faqQuestionText}>{faq.question}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.faqAnswer}>{faq.answer}</ThemedText>
        </ThemedView>
      ))}

      {/* Tutorial Video */}
      <TouchableOpacity
        style={[styles.tutorialCard, { backgroundColor: '#4CAF50' }]}
        onPress={() => {
          // Open tutorial video or interactive guide
          router.push('/plano-seguranca');
        }}
      >
        <MaterialIcons name="play-circle-outline" size={48} color="white" />
        <ThemedView style={styles.tutorialContent}>
          <ThemedText style={styles.tutorialTitle}>Tutorial Interativo</ThemedText>
          <ThemedText style={styles.tutorialText}>
            Aprenda a usar todas as funcionalidades
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {/* Support Contact */}
      <ThemedView style={[styles.supportCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <MaterialIcons name="support-agent" size={32} color="#666" />
        <ThemedView style={styles.supportContent}>
          <ThemedText style={styles.supportTitle}>Precisa de mais ajuda?</ThemedText>
          <ThemedText style={styles.supportText}>
            Entre em contato com nossa equipe de suporte através do chat no grupo
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Topic Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
            {selectedTopic && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                </TouchableOpacity>

                <MaterialIcons
                  name={selectedTopic.icon as any}
                  size={48}
                  color="#666"
                  style={styles.modalIcon}
                />
                <ThemedText style={styles.modalTitle}>{selectedTopic.title}</ThemedText>

                {selectedTopic.content.map((paragraph, index) => (
                  <ThemedText key={index} style={styles.modalParagraph}>
                    {paragraph}
                  </ThemedText>
                ))}

                {selectedTopic.tips && selectedTopic.tips.length > 0 && (
                  <ThemedView style={styles.tipsSection}>
                    <ThemedText style={styles.tipsSectionTitle}>Dicas Importantes:</ThemedText>
                    {selectedTopic.tips.map((tip, index) => (
                      <ThemedView key={index} style={styles.tipItem}>
                        <MaterialIcons name="lightbulb" size={16} color="#FFA500" />
                        <ThemedText style={styles.tipText}>{tip}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                )}
              </ScrollView>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>
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
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
  },
  emergencyButtonText: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyNumbers: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
  },
  emergencyNumberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topicTitle: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  faqCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  faqQuestionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  faqAnswer: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginLeft: 28,
  },
  tutorialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  tutorialContent: {
    flex: 1,
    marginLeft: 15,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  tutorialText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
  },
  supportContent: {
    flex: 1,
    marginLeft: 15,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
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
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalParagraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  tipsSection: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#E65100',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
  },
});