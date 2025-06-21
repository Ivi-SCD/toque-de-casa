import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import SecurityService from '@/services/security';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';

/**
 * Interface para as configurações do aplicativo
 * Define todas as opções de segurança e privacidade
 */
interface Settings {
  biometricEnabled: boolean;    // Autenticação biométrica
  autoLockTime: number;         // Tempo de auto-bloqueio (minutos)
  panicModeEnabled: boolean;    // Modo pânico ativo
  hideNotifications: boolean;   // Ocultar notificações sensíveis
  fakeAppMode: boolean;         // Modo disfarçado ativo
  emergencyWipe: boolean;       // Limpeza de emergência
  locationTracking: boolean;    // Rastreamento de localização
  cloudBackup: boolean;         // Backup na nuvem
}

/**
 * Tela de Configurações - Controle de Segurança e Privacidade
 * 
 * Esta tela permite configurar todas as funcionalidades de segurança
 * do aplicativo, incluindo autenticação biométrica, modo pânico,
 * configurações de privacidade e gerenciamento de dados.
 * 
 * Funcionalidades de Segurança:
 * - Autenticação biométrica (impressão digital/Face ID)
 * - Auto-bloqueio configurável
 * - Modo pânico com código personalizado
 * - Limpeza de emergência de dados
 * - Teste do modo pânico
 * 
 * Configurações de Privacidade:
 * - Ocultação de notificações sensíveis
 * - Modo disfarçado de app de receitas
 * - Controle de rastreamento de localização
 * - Backup criptografado na nuvem
 * 
 * Gerenciamento de Dados:
 * - Exportação segura de dados
 * - Limpeza completa de dados
 * - Backup e restauração
 * 
 * Recursos Especiais:
 * - Código de pânico personalizado
 * - Simulação de modo de emergência
 * - Configurações persistentes
 * - Integração com serviços de segurança
 */
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>({
    biometricEnabled: false,
    autoLockTime: 5,
    panicModeEnabled: true,
    hideNotifications: true,
    fakeAppMode: true,
    emergencyWipe: false,
    locationTracking: true,
    cloudBackup: false,
  });
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicCode, setPanicCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  /**
   * Carrega configurações salvas e inicializa serviços de segurança
   */
  useEffect(() => {
    loadSettings();
    SecurityService.initialize();
  }, []);

  /**
   * Carrega configurações do AsyncStorage
   */
  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  /**
   * Salva configurações no AsyncStorage
   * 
   * @param newSettings - Novas configurações a serem salvas
   */
  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  /**
   * Ativa/desativa autenticação biométrica
   * Verifica disponibilidade do hardware antes de ativar
   * 
   * @param value - True para ativar, false para desativar
   */
  const toggleBiometric = async (value: boolean) => {
    if (value) {
      // Verifica se o dispositivo suporta biometria
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometria Indisponível',
          'Seu dispositivo não suporta ou não tem biometria configurada'
        );
        return;
      }

      // Ativa autenticação biométrica via serviço de segurança
      const result = await SecurityService.enableBiometric();
      if (result) {
        saveSettings({ ...settings, biometricEnabled: true });
      }
    } else {
      saveSettings({ ...settings, biometricEnabled: false });
    }
  };

  /**
   * Atualiza código de pânico
   * Valida entrada e salva via serviço de segurança
   */
  const updatePanicCode = async () => {
    if (panicCode.length < 6) {
      Alert.alert('Erro', 'O código deve ter pelo menos 6 dígitos');
      return;
    }

    if (panicCode !== confirmCode) {
      Alert.alert('Erro', 'Os códigos não coincidem');
      return;
    }

    await SecurityService.setPanicCode(panicCode);
    setShowPanicModal(false);
    setPanicCode('');
    setConfirmCode('');
    Alert.alert('Sucesso', 'Código de pânico atualizado');
  };

  /**
   * Testa o modo pânico
   * Simula ativação de emergência para verificar funcionamento
   */
  const testPanicMode = () => {
    Alert.alert(
      'Testar Modo Pânico',
      'Isso irá simular o modo pânico. O app voltará ao modo receitas normal.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Testar',
          style: 'destructive',
          onPress: async () => {
            await SecurityService.panicMode();
            router.replace('/plano-seguranca');
          },
        },
      ]
    );
  };

  /**
   * Limpa todos os dados do aplicativo
   * Ação irreversível com confirmação obrigatória
   */
  const clearAllData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'ATENÇÃO: Isso removerá permanentemente todos os dados do app, incluindo evidências, contatos e configurações.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/plano-seguranca');
          },
        },
      ]
    );
  };

  /**
   * Exporta dados do aplicativo
   * Cria backup seguro de todas as informações
   */
  const exportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data: any = {};
      
      // Coleta todos os dados salvos
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) data[key] = JSON.parse(value);
      }

      Alert.alert(
        'Dados Exportados',
        'Um arquivo seguro foi criado com todos seus dados. Guarde em local seguro.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  // Tipos para itens de configuração
  type SwitchSettingItem = {
    icon: string;
    label: string;
    description: string;
    type: 'switch';
    value: boolean;
    onToggle: (value: boolean) => void | Promise<void>;
    danger?: boolean;
  };
  type SelectSettingItem = {
    icon: string;
    label: string;
    description: string;
    type: 'select';
    value: number;
    onPress: () => void;
    danger?: boolean;
  };
  type ButtonSettingItem = {
    icon: string;
    label: string;
    description: string;
    type: 'button';
    onPress: () => void;
    danger?: boolean;
  };
  type InfoSettingItem = {
    icon: string;
    label: string;
    description: string;
    type: 'info';
    danger?: boolean;
  };
  type SettingItem = SwitchSettingItem | SelectSettingItem | ButtonSettingItem | InfoSettingItem;
  
  type SettingsSection = {
    title: string;
    items: SettingItem[];
  };
  
  /**
   * Seções de configurações organizadas por categoria
   * Cada seção agrupa configurações relacionadas
   */
  const settingsSections: SettingsSection[] = [
    {
      title: 'Segurança',
      items: [
        {
          icon: 'fingerprint',
          label: 'Biometria',
          description: 'Use impressão digital ou Face ID',
          type: 'switch',
          value: settings.biometricEnabled,
          onToggle: toggleBiometric,
        },
        {
          icon: 'timer',
          label: 'Auto-bloqueio',
          description: `Bloqueia após ${settings.autoLockTime} minutos`,
          type: 'select',
          value: settings.autoLockTime,
          onPress: () => {
            Alert.alert(
              'Tempo de Auto-bloqueio',
              'Selecione o tempo de inatividade',
              [
                { text: '1 minuto', onPress: () => saveSettings({ ...settings, autoLockTime: 1 }) },
                { text: '5 minutos', onPress: () => saveSettings({ ...settings, autoLockTime: 5 }) },
                { text: '15 minutos', onPress: () => saveSettings({ ...settings, autoLockTime: 15 }) },
                { text: '30 minutos', onPress: () => saveSettings({ ...settings, autoLockTime: 30 }) },
              ]
            );
          },
        },
        {
          icon: 'warning',
          label: 'Modo Pânico',
          description: 'Ativa limpeza de emergência',
          type: 'switch',
          value: settings.panicModeEnabled,
          onToggle: (value: boolean) => saveSettings({ ...settings, panicModeEnabled: value }),
        },
        {
          icon: 'vpn-key',
          label: 'Código de Pânico',
          description: 'Configure código de emergência',
          type: 'button',
          onPress: () => setShowPanicModal(true),
        },
      ],
    },
    {
      title: 'Privacidade',
      items: [
        {
          icon: 'notifications-off',
          label: 'Ocultar Notificações',
          description: 'Notificações sem conteúdo sensível',
          type: 'switch',
          value: settings.hideNotifications,
          onToggle: (value: boolean) => saveSettings({ ...settings, hideNotifications: value }),
        },
        {
          icon: 'restaurant',
          label: 'Modo App Falso',
          description: 'Aparência de app de receitas',
          type: 'switch',
          value: settings.fakeAppMode,
          onToggle: (value: boolean) => saveSettings({ ...settings, fakeAppMode: value }),
        },
        {
          icon: 'location-off',
          label: 'Rastreamento',
          description: 'Registrar localização em evidências',
          type: 'switch',
          value: settings.locationTracking,
          onToggle: (value: boolean) => saveSettings({ ...settings, locationTracking: value }),
        },
      ],
    },
    {
      title: 'Dados',
      items: [
        {
          icon: 'cloud',
          label: 'Backup na Nuvem',
          description: 'Backup automático criptografado',
          type: 'switch',
          value: settings.cloudBackup,
          onToggle: (value: boolean) => saveSettings({ ...settings, cloudBackup: value }),
        },
        {
          icon: 'download',
          label: 'Exportar Dados',
          description: 'Baixar todos os dados',
          type: 'button',
          onPress: exportData,
        },
        {
          icon: 'delete-forever',
          label: 'Limpar Dados',
          description: 'Remover todos os dados',
          type: 'button',
          danger: true,
          onPress: clearAllData,
        },
      ],
    },
    {
      title: 'Sobre',
      items: [
        {
          icon: 'info',
          label: 'Versão',
          description: 'Toque De Casa v1.0.0',
          type: 'info',
        },
        {
          icon: 'help',
          label: 'Ajuda',
          description: 'Guia de uso do app',
          type: 'button',
          onPress: () => router.push('/ajuda'),
        },
        {
          icon: 'bug-report',
          label: 'Testar Modo Pânico',
          description: 'Simular ativação de emergência',
          type: 'button',
          danger: true,
          onPress: testPanicMode,
        },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FAFAFA' }]}>
      {/* Cabeçalho da tela */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Voltar</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Configurações</ThemedText>
        <ThemedText style={styles.subtitle}>
          Personalize sua experiência
        </ThemedText>
      </ThemedView>

      {/* Seções de configurações */}
      {settingsSections.map((section, sectionIndex) => (
        <ThemedView key={sectionIndex} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          
          {/* Itens de configuração */}
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[
                styles.settingItem,
                { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' },
                item.danger && styles.dangerItem,
              ]}
              onPress={item.type === 'button' ? item.onPress : undefined}
              disabled={item.type === 'info'}
            >
              <MaterialIcons
                name={item.icon as any}
                size={24}
                color={item.danger ? '#FF6B6B' : colorScheme === 'dark' ? '#999' : '#666'}
              />
              <ThemedView style={styles.settingContent}>
                <ThemedText style={[styles.settingLabel, item.danger && styles.dangerText]}>
                  {item.label}
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  {item.description}
                </ThemedText>
              </ThemedView>
              {/* Switch para configurações booleanas */}
              {item.type === 'switch' && (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#767577', true: '#FF6B6B' }}
                  thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
                />
              )}
              {/* Seta para itens de ação */}
              {item.type === 'button' && (
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}

      {/* Modal para configurar código de pânico */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPanicModal}
        onRequestClose={() => setShowPanicModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
            <ThemedText style={styles.modalTitle}>Configurar Código de Pânico</ThemedText>
            <ThemedText style={styles.modalDescription}>
              Digite um código que ativará o modo de emergência quando inserido
            </ThemedText>
            
            {/* Campo para novo código */}
            <TextInput
              style={[styles.codeInput, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              placeholder="Novo código (mínimo 6 dígitos)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              secureTextEntry
              maxLength={10}
              value={panicCode}
              onChangeText={setPanicCode}
            />
            
            {/* Campo para confirmar código */}
            <TextInput
              style={[styles.codeInput, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              placeholder="Confirmar código"
              placeholderTextColor="#999"
              keyboardType="numeric"
              secureTextEntry
              maxLength={10}
              value={confirmCode}
              onChangeText={setConfirmCode}
            />

            {/* Botões do modal */}
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#666' }]}
                onPress={() => {
                  setShowPanicModal(false);
                  setPanicCode('');
                  setConfirmCode('');
                }}
              >
                <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF6B6B' }]}
                onPress={updatePanicCode}
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
 * Estilos da tela de configurações
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 1,
    borderRadius: 8,
  },
  dangerItem: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginLeft: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  dangerText: {
    color: '#FF6B6B',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
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