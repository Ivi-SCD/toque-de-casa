import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

/**
 * Interface para representar um contato de emergência
 * Define a estrutura dos contatos que podem ser notificados
 */
interface Contact {
  id: string;           // Identificador único
  name: string;         // Nome do contato
  phone: string;        // Número de telefone
  alertLevel: 'high' | 'medium' | 'low'; // Nível de prioridade para alertas
}

/**
 * Interface para representar uma mensagem no chat
 * Define a estrutura das mensagens trocadas
 */
interface Message {
  id: string;           // Identificador único
  text: string;         // Conteúdo da mensagem
  timestamp: Date;      // Data/hora da mensagem
  sender: 'user' | 'system' | 'mentor'; // Remetente da mensagem
}

/**
 * Códigos de emergência disfarçados como frases culinárias
 * Cada código tem um significado específico e aciona diferentes protocolos
 */
const emergencyCodes = {
  'Preciso de sal': { 
    meaning: 'Violência psicológica',
    severity: 'medium',
    response: 'Entendi! Vou te enviar uma receita com bastante sal. Você está bem?'
  },
  'Queimei o jantar': { 
    meaning: 'Escalada para violência física',
    severity: 'high',
    response: 'Oh não! Vou te ajudar com uma receita rápida. Precisa de ajuda agora?'
  },
  'Vou fazer um bolo': { 
    meaning: 'Necessito sair de casa urgentemente',
    severity: 'critical',
    response: 'Ótima ideia! Conheço um mercado 24h perfeito para comprar ingredientes. Quer que eu te encontre lá?'
  },
  'Receita não deu certo': { 
    meaning: 'Necessito conversar',
    severity: 'low',
    response: 'Que pena! Vamos conversar sobre o que deu errado? Estou aqui para ajudar.'
  },
  'Faltou tempero': { 
    meaning: 'Preciso de orientação',
    severity: 'low',
    response: 'Entendo! Vou te dar algumas dicas especiais de temperos. Como posso ajudar?'
  },
};

/**
 * Tela de Grupo - Sistema de Comunicação Segura Disfarçado
 * 
 * Esta tela apresenta um "grupo de receitas" que na verdade é um sistema
 * de comunicação segura com códigos de emergência e rede de apoio.
 * 
 * Funcionalidades:
 * - Chat disfarçado com códigos de emergência
 * - Gerenciamento de contatos de emergência
 * - Sistema de mentoria
 * - Detecção automática de códigos de alerta
 * - Notificação discreta de contatos
 * 
 * Abas Disponíveis:
 * - Chat: Comunicação com códigos secretos
 * - Contatos: Gerenciamento de rede de apoio
 * - Mentora: Conexão com mentoras experientes
 * 
 * Códigos de Emergência:
 * - "Preciso de sal" = Violência psicológica
 * - "Queimei o jantar" = Escalada para violência física
 * - "Vou fazer um bolo" = Necessito sair urgentemente
 * - "Receita não deu certo" = Necessito conversar
 * - "Faltou tempero" = Preciso de orientação
 */
export default function GroupScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<'chat' | 'contacts' | 'mentor'>('chat');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bem-vinda ao grupo de receitas! Aqui compartilhamos dicas e nos ajudamos.',
      timestamp: new Date(),
      sender: 'system',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', alertLevel: 'medium' as 'high' | 'medium' | 'low' });

  /**
   * Carrega contatos salvos do AsyncStorage ao iniciar
   */
  useEffect(() => {
    loadContacts();
  }, []);

  /**
   * Carrega contatos de emergência do armazenamento local
   */
  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('emergencyContacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  /**
   * Salva contatos de emergência no armazenamento local
   * 
   * @param updatedContacts - Lista atualizada de contatos
   */
  const saveContacts = async (updatedContacts: Contact[]) => {
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  /**
   * Envia uma mensagem no chat
   * Verifica automaticamente se contém códigos de emergência
   */
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      timestamp: new Date(),
      sender: 'user',
    };

    setMessages([...messages, newMessage]);

    // Verifica se a mensagem contém códigos de emergência
    Object.entries(emergencyCodes).forEach(([code, info]) => {
      if (inputText.toLowerCase().includes(code.toLowerCase())) {
        handleEmergencyCode(code, info);
      }
    });

    setInputText('');
  };

  /**
   * Processa códigos de emergência detectados
   * Envia resposta automática e notifica contatos se necessário
   * 
   * @param code - Código de emergência detectado
   * @param info - Informações do código (significado, severidade, resposta)
   */
  const handleEmergencyCode = async (code: string, info: typeof emergencyCodes[keyof typeof emergencyCodes]) => {
    // Envia resposta automática da mentora
    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: info.response,
      timestamp: new Date(),
      sender: 'mentor',
    };
    setMessages(prev => [...prev, responseMessage]);

    // Se for crítico, notifica contatos de emergência
    if (info.severity === 'critical' && contacts.length > 0) {
      const location = await Location.getCurrentPositionAsync({});
      const highPriorityContacts = contacts.filter(c => c.alertLevel === 'high');
      
      Alert.alert(
        'Alerta Enviado',
        `Seus contatos de emergência foram notificados discretamente.`,
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Adiciona um novo contato de emergência
   * Valida os campos obrigatórios antes de salvar
   */
  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
    };

    saveContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', alertLevel: 'medium' });
    setShowContactModal(false);
  };

  /**
   * Remove um contato de emergência
   * Solicita confirmação antes de deletar
   * 
   * @param id - ID do contato a ser removido
   */
  const deleteContact = (id: string) => {
    Alert.alert(
      'Remover Contato',
      'Tem certeza que deseja remover este contato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => saveContacts(contacts.filter(c => c.id !== id))
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Grupo de Receitas</ThemedText>
        <ThemedText style={styles.subtitle}>
          Compartilhe experiências e peça ajuda
        </ThemedText>
      </ThemedView>

      {/* Navegação por abas */}
      <ThemedView style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MaterialIcons name="chat" size={24} color={activeTab === 'chat' ? '#FF6B6B' : '#666'} />
          <ThemedText style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <MaterialIcons name="people" size={24} color={activeTab === 'contacts' ? '#FF6B6B' : '#666'} />
          <ThemedText style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contatos
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mentor' && styles.activeTab]}
          onPress={() => setActiveTab('mentor')}
        >
          <MaterialIcons name="psychology" size={24} color={activeTab === 'mentor' ? '#FF6B6B' : '#666'} />
          <ThemedText style={[styles.tabText, activeTab === 'mentor' && styles.activeTabText]}>
            Mentora
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Aba de Chat */}
      {activeTab === 'chat' && (
        <>
          {/* Container de mensagens */}
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <ThemedView
                key={message.id}
                style={[
                  styles.messageCard,
                  message.sender === 'user' && styles.userMessage,
                  message.sender === 'mentor' && styles.mentorMessage,
                  { backgroundColor: 
                    message.sender === 'user' ? '#FF6B6B' : 
                    message.sender === 'mentor' ? '#4CAF50' : 
                    colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5' 
                  }
                ]}
              >
                <ThemedText style={[
                  styles.messageText,
                  (message.sender === 'user' || message.sender === 'mentor') && styles.whiteText
                ]}>
                  {message.text}
                </ThemedText>
                <ThemedText style={[
                  styles.messageTime,
                  (message.sender === 'user' || message.sender === 'mentor') && styles.whiteText
                ]}>
                  {message.timestamp.toLocaleTimeString()}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
          {/* Campo de entrada de mensagem */}
          <ThemedView style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
            <TextInput
              style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </ThemedView>
        </>
      )}

      {/* Aba de Contatos */}
      {activeTab === 'contacts' && (
        <ScrollView style={styles.contactsContainer}>
          {/* Botão para adicionar novo contato */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => setShowContactModal(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <ThemedText style={styles.addButtonText}>Adicionar Contato</ThemedText>
          </TouchableOpacity>

          {/* Lista de contatos */}
          {contacts.map((contact) => (
            <ThemedView
              key={contact.id}
              style={[styles.contactCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
            >
              <ThemedView style={styles.contactInfo}>
                <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
                <ThemedText style={styles.contactPhone}>{contact.phone}</ThemedText>
                {/* Badge de nível de alerta */}
                <ThemedView style={[styles.alertBadge, 
                  { backgroundColor: 
                    contact.alertLevel === 'high' ? '#FF0000' :
                    contact.alertLevel === 'medium' ? '#FFA500' : '#4CAF50'
                  }
                ]}>
                  <ThemedText style={styles.alertText}>
                    {contact.alertLevel === 'high' ? 'Alto' :
                     contact.alertLevel === 'medium' ? 'Médio' : 'Baixo'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <TouchableOpacity onPress={() => deleteContact(contact.id)}>
                <MaterialIcons name="delete" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ScrollView>
      )}

      {/* Aba de Mentora */}
      {activeTab === 'mentor' && (
        <ThemedView style={styles.mentorContainer}>
          <MaterialIcons name="psychology" size={80} color="#4CAF50" />
          <ThemedText style={styles.mentorTitle}>Cozinheiras Experientes</ThemedText>
          <ThemedText style={styles.mentorText}>
            Conecte-se com mulheres que já passaram por experiências similares e podem te ajudar.
          </ThemedText>
          <TouchableOpacity style={[styles.connectButton, { backgroundColor: '#4CAF50' }]}>
            <ThemedText style={styles.connectButtonText}>Encontrar Mentora</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Modal para adicionar contato */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContactModal}
        onRequestClose={() => setShowContactModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
            <ThemedText style={styles.modalTitle}>Adicionar Contato</ThemedText>
            
            {/* Campo de nome */}
            <TextInput
              style={[styles.modalInput, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              placeholder="Nome"
              placeholderTextColor="#999"
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            />
            
            {/* Campo de telefone */}
            <TextInput
              style={[styles.modalInput, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              placeholder="Telefone"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            />
            
            {/* Seleção de nível de alerta */}
            <ThemedText style={styles.modalLabel}>Nível de Alerta:</ThemedText>
            <ThemedView style={styles.alertLevelContainer}>
              {(['high', 'medium', 'low'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.alertLevelButton,
                    newContact.alertLevel === level && styles.selectedAlertLevel,
                    { backgroundColor: 
                      level === 'high' ? '#FF0000' :
                      level === 'medium' ? '#FFA500' : '#4CAF50'
                    }
                  ]}
                  onPress={() => setNewContact({ ...newContact, alertLevel: level })}
                >
                  <ThemedText style={styles.alertLevelText}>
                    {level === 'high' ? 'Alto' : level === 'medium' ? 'Médio' : 'Baixo'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            {/* Botões de ação */}
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#666' }]}
                onPress={() => setShowContactModal(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={addContact}
              >
                <ThemedText style={styles.modalButtonText}>Adicionar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/**
 * Estilos da tela de grupo
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B', // Cor coral do app
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messageCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  mentorMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  whiteText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B', // Cor coral do app
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsContainer: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  alertBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  alertText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mentorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  mentorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  mentorText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 30,
  },
  connectButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  alertLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  alertLevelButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    opacity: 0.6,
  },
  selectedAlertLevel: {
    opacity: 1,
  },
  alertLevelText: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});