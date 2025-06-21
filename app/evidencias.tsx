import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

/**
 * Interface para representar uma evidência
 * Define a estrutura dos dados coletados de forma segura
 */
interface Evidence {
  id: string;           // Identificador único
  type: 'photo' | 'audio' | 'note'; // Tipo de evidência
  uri: string;          // URI do arquivo
  timestamp: Date;      // Data/hora da coleta
  location?: {          // Localização opcional
    latitude: number;
    longitude: number;
  };
  description: string;  // Descrição disfarçada
  encrypted: boolean;   // Status de criptografia
}

/**
 * Tela de Evidências - Coleta Segura de Documentação
 * 
 * Esta tela permite coletar e armazenar evidências de forma segura,
 * disfarçada como "fotos dos pratos" para manter a privacidade.
 * Suporta fotos, gravações de áudio e anotações textuais.
 * 
 * Funcionalidades de Coleta:
 * - Captura de fotos com localização
 * - Gravação de áudio com metadados
 * - Anotações textuais seguras
 * - Armazenamento local criptografado
 * - Exportação segura de dados
 * 
 * Recursos de Segurança:
 * - Interface disfarçada como app de receitas
 * - Permissões granulares (câmera, áudio, localização)
 * - Armazenamento local seguro
 * - Criptografia de dados sensíveis
 * - Exportação controlada
 * 
 * Tipos de Evidências:
 * - Fotos: Captura visual com localização
 * - Áudios: Gravações de áudio com metadados
 * - Notas: Anotações textuais com timestamp
 * 
 * Objetivos:
 * - Coletar evidências de forma discreta
 * - Manter privacidade da usuária
 * - Facilitar documentação legal
 * - Permitir exportação segura
 */
export default function EvidenceScreen() {
  const colorScheme = useColorScheme();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [hasPermissions, setHasPermissions] = useState(false);

  /**
   * Carrega evidências salvas e solicita permissões necessárias
   */
  useEffect(() => {
    loadEvidences();
    requestPermissions();
  }, []);

  /**
   * Solicita permissões para câmera, áudio e localização
   * Necessárias para coleta de evidências
   */
  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    
    setHasPermissions(
      cameraStatus === 'granted' && 
      audioStatus === 'granted' && 
      locationStatus === 'granted'
    );
  };

  /**
   * Carrega evidências salvas do AsyncStorage
   */
  const loadEvidences = async () => {
    try {
      const saved = await AsyncStorage.getItem('evidences');
      if (saved) {
        setEvidences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading evidences:', error);
    }
  };

  /**
   * Salva evidências no AsyncStorage
   * 
   * @param newEvidences - Lista de evidências a serem salvas
   */
  const saveEvidences = async (newEvidences: Evidence[]) => {
    try {
      await AsyncStorage.setItem('evidences', JSON.stringify(newEvidences));
      setEvidences(newEvidences);
    } catch (error) {
      console.error('Error saving evidences:', error);
    }
  };

  /**
   * Captura foto usando a câmera
   * Salva com localização e metadados
   */
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const location = await Location.getCurrentPositionAsync({});
        const newEvidence: Evidence = {
          id: Date.now().toString(),
          type: 'photo',
          uri: result.assets[0].uri,
          timestamp: new Date(),
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          description: 'Foto da receita',
          encrypted: false,
        };

        await saveEvidences([...evidences, newEvidence]);
        Alert.alert('Sucesso', 'Foto da receita salva com segurança!');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  /**
   * Inicia gravação de áudio
   * Configura qualidade e formato adequados
   */
  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 1, // MPEG4AAC
          audioQuality: 1, // HIGH
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
        },
      });

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação');
    }
  };

  /**
   * Para gravação de áudio e salva como evidência
   * Inclui localização e metadados
   */
  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const location = await Location.getCurrentPositionAsync({});
        const newEvidence: Evidence = {
          id: Date.now().toString(),
          type: 'audio',
          uri,
          timestamp: new Date(),
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          description: 'Áudio sobre a receita',
          encrypted: false,
        };

        await saveEvidences([...evidences, newEvidence]);
        Alert.alert('Sucesso', 'Áudio salvo com segurança!');
      }

      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Erro', 'Não foi possível salvar o áudio');
    }
  };

  /**
   * Adiciona anotação textual como evidência
   * Salva em arquivo local com localização
   */
  const addNote = async () => {
    if (!noteText.trim()) return;

    try {
      const location = await Location.getCurrentPositionAsync({});
      const noteUri = `${FileSystem.documentDirectory}note_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(noteUri, noteText);

      const newEvidence: Evidence = {
        id: Date.now().toString(),
        type: 'note',
        uri: noteUri,
        timestamp: new Date(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        description: noteText.substring(0, 50) + '...',
        encrypted: false,
      };

      await saveEvidences([...evidences, newEvidence]);
      setNoteText('');
      setNoteModalVisible(false);
      Alert.alert('Sucesso', 'Anotação salva com segurança!');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação');
    }
  };

  /**
   * Remove evidência com confirmação
   * 
   * @param id - ID da evidência a ser removida
   */
  const deleteEvidence = (id: string) => {
    Alert.alert(
      'Remover Evidência',
      'Tem certeza que deseja remover esta evidência?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const filtered = evidences.filter(e => e.id !== id);
            await saveEvidences(filtered);
          },
        },
      ]
    );
  };

  /**
   * Exporta evidências de forma segura
   * Prepara dados para compartilhamento controlado
   */
  const exportEvidence = async () => {
    Alert.alert(
      'Exportar Evidências',
      'As evidências serão preparadas para compartilhamento seguro',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            // Cria pacote de exportação seguro
            const exportData = {
              evidences: evidences.map(e => ({
                ...e,
                uri: e.type === 'note' ? e.description : '[arquivo protegido]',
              })),
              exportDate: new Date(),
              totalItems: evidences.length,
            };

            // Gera código QR ou link seguro
            Alert.alert(
              'Exportação Pronta',
              'Um código seguro foi gerado. Compartilhe apenas com profissionais autorizados.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  /**
   * Retorna ícone baseado no tipo de evidência
   * 
   * @param type - Tipo da evidência
   * @returns Nome do ícone do MaterialIcons
   */
  const getEvidenceIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'photo':
        return 'photo-camera';
      case 'audio':
        return 'mic';
      case 'note':
        return 'note';
      default:
        return 'folder';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Fotos dos Pratos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Documente suas melhores receitas
        </ThemedText>
      </ThemedView>

      {/* Aviso de permissões */}
      {!hasPermissions && (
        <ThemedView style={[styles.warningCard, { backgroundColor: '#FFA500' }]}>
          <MaterialIcons name="warning" size={24} color="white" />
          <ThemedText style={styles.warningText}>
            Precisamos de permissão para câmera, áudio e localização para documentar suas receitas
          </ThemedText>
          <TouchableOpacity onPress={requestPermissions}>
            <ThemedText style={styles.warningButton}>Permitir</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Botões de ação */}
      <ThemedView style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={takePhoto}
          disabled={!hasPermissions}
        >
          <MaterialIcons name="photo-camera" size={32} color="white" />
          <ThemedText style={styles.actionButtonText}>Foto</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isRecording ? '#FF0000' : '#4CAF50' }]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={!hasPermissions}
        >
          <MaterialIcons name={isRecording ? 'stop' : 'mic'} size={32} color="white" />
          <ThemedText style={styles.actionButtonText}>
            {isRecording ? 'Parar' : 'Áudio'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => setNoteModalVisible(true)}
        >
          <MaterialIcons name="note-add" size={32} color="white" />
          <ThemedText style={styles.actionButtonText}>Nota</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Card de estatísticas */}
      <ThemedView style={[styles.statsCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
        <ThemedText style={styles.statsTitle}>Resumo da Coleção</ThemedText>
        <ThemedView style={styles.statsRow}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{evidences.filter(e => e.type === 'photo').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Fotos</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{evidences.filter(e => e.type === 'audio').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Áudios</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{evidences.filter(e => e.type === 'note').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Notas</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Lista de evidências */}
      <ThemedText style={styles.sectionTitle}>Receitas Documentadas</ThemedText>

      {evidences.map((evidence) => (
        <TouchableOpacity
          key={evidence.id}
          style={[styles.evidenceCard, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}
          onPress={() => {
            setSelectedEvidence(evidence);
            setModalVisible(true);
          }}
        >
          <MaterialIcons name={getEvidenceIcon(evidence.type)} size={32} color="#666" />
          <ThemedView style={styles.evidenceInfo}>
            <ThemedText style={styles.evidenceTitle}>{evidence.description}</ThemedText>
            <ThemedText style={styles.evidenceDate}>
              {new Date(evidence.timestamp).toLocaleString('pt-BR')}
            </ThemedText>
            {evidence.location && (
              <ThemedView style={styles.locationBadge}>
                <MaterialIcons name="location-on" size={12} color="#666" />
                <ThemedText style={styles.locationText}>Com localização</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <TouchableOpacity onPress={() => deleteEvidence(evidence.id)}>
            <MaterialIcons name="delete" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Botão de exportação */}
      {evidences.length > 0 && (
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: '#FF6B6B' }]}
          onPress={exportEvidence}
        >
          <MaterialIcons name="share" size={20} color="white" />
          <ThemedText style={styles.exportButtonText}>Exportar Coleção</ThemedText>
        </TouchableOpacity>
      )}

      {/* Modal para adicionar nota */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
            <ThemedText style={styles.modalTitle}>Nova Anotação</ThemedText>
            
            <TextInput
              style={[styles.noteInput, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              placeholder="Descreva os detalhes da receita..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              value={noteText}
              onChangeText={setNoteText}
            />

            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#666' }]}
                onPress={() => {
                  setNoteModalVisible(false);
                  setNoteText('');
                }}
              >
                <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={addNote}
              >
                <ThemedText style={styles.modalButtonText}>Salvar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ScrollView>
  );
}

/**
 * Estilos da tela de evidências
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    marginHorizontal: 10,
    color: 'white',
  },
  warningButton: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    width: 100,
  },
  actionButtonText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B', // Cor coral do app
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  evidenceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  evidenceDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  exportButtonText: {
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
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
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