import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Interface que define a estrutura das configurações de segurança
 */
interface SecurityConfig {
  panicCode: string;        // Código de pânico criptografado
  biometricEnabled: boolean; // Se autenticação biométrica está habilitada
  autoLockTime: number;     // Tempo em minutos para auto-bloqueio
  lastAccessTime: number;   // Timestamp do último acesso
  secretPattern: string[];  // Padrão secreto para ativar modo oculto
}

/**
 * Serviço de segurança para o aplicativo Toque de Casa
 * 
 * Este serviço implementa funcionalidades de segurança para proteger
 * dados sensíveis e fornecer recursos de emergência:
 * - Autenticação biométrica (Face ID, Touch ID)
 * - Código de pânico para situações de emergência
 * - Auto-bloqueio por inatividade
 * - Modo pânico para limpar dados sensíveis
 * - Criptografia de dados
 * 
 * Implementa o padrão Singleton para garantir uma única instância
 */
class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig | null = null;
  private isAuthenticated: boolean = false;

  private constructor() {}

  /**
   * Obtém a instância única do serviço (Singleton)
   * @returns Instância do SecurityService
   */
  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Inicializa o serviço carregando configurações salvas
   * Se não existirem configurações, cria as padrão
   */
  async initialize() {
    try {
      const savedConfig = await AsyncStorage.getItem('securityConfig');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      } else {
        // Configurações padrão de segurança
        this.config = {
          panicCode: '911911', // Código de pânico padrão
          biometricEnabled: false,
          autoLockTime: 5, // 5 minutos
          lastAccessTime: Date.now(),
          secretPattern: ['especiais', 'hold', '5000'], // Padrão para modo secreto
        };
        await this.saveConfig();
      }
    } catch (error) {
      console.error('Error initializing security:', error);
    }
  }

  /**
   * Salva as configurações de segurança no AsyncStorage
   */
  async saveConfig() {
    if (this.config) {
      await AsyncStorage.setItem('securityConfig', JSON.stringify(this.config));
    }
  }

  /**
   * Habilita a autenticação biométrica se o dispositivo suportar
   * @returns true se habilitado com sucesso, false caso contrário
   */
  async enableBiometric(): Promise<boolean> {
    try {
      // Verifica se o dispositivo tem hardware biométrico
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      // Verifica se há biometria cadastrada
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        if (this.config) {
          this.config.biometricEnabled = true;
          await this.saveConfig();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  /**
   * Autentica o usuário usando biometria
   * @returns true se autenticado com sucesso, false caso contrário
   */
  async authenticateBiometric(): Promise<boolean> {
    if (!this.config?.biometricEnabled) return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Acesse suas receitas especiais',
        fallbackLabel: 'Usar código',
        cancelLabel: 'Cancelar',
      });

      this.isAuthenticated = result.success;
      return result.success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  }

  /**
   * Define um novo código de pânico (criptografado)
   * @param code - Código de pânico em texto plano
   */
  async setPanicCode(code: string) {
    if (this.config) {
      // Criptografa o código usando SHA-256
      this.config.panicCode = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        code
      );
      await this.saveConfig();
    }
  }

  /**
   * Verifica se o código de pânico fornecido está correto
   * @param inputCode - Código fornecido pelo usuário
   * @returns true se o código estiver correto
   */
  async checkPanicCode(inputCode: string): Promise<boolean> {
    if (!this.config) return false;

    // Criptografa o código fornecido para comparação
    const hashedInput = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      inputCode
    );

    return hashedInput === this.config.panicCode;
  }

  /**
   * Ativa o modo pânico - limpa dados sensíveis do aplicativo
   * Mantém apenas receitas e configurações normais
   */
  async panicMode() {
    // Lista de chaves que devem ser mantidas (dados não sensíveis)
    const keysToKeep = ['recipes', 'normalSettings'];
    const allKeys = await AsyncStorage.getAllKeys();
    // Remove todas as chaves exceto as que devem ser mantidas
    const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
    
    await AsyncStorage.multiRemove(keysToRemove);
    
    this.isAuthenticated = false;
  }

  /**
   * Verifica se o aplicativo deve ser bloqueado por inatividade
   * @returns true se deve ser bloqueado
   */
  checkAutoLock(): boolean {
    if (!this.config) return false;

    const now = Date.now();
    const timeDiff = (now - this.config.lastAccessTime) / 1000 / 60; // Diferença em minutos

    if (timeDiff > this.config.autoLockTime) {
      this.isAuthenticated = false;
      return true;
    }

    return false;
  }

  /**
   * Atualiza o timestamp do último acesso
   * Usado para calcular inatividade
   */
  updateLastAccess() {
    if (this.config) {
      this.config.lastAccessTime = Date.now();
      this.saveConfig();
    }
  }

  /**
   * Criptografa dados sensíveis usando SHA-256
   * @param data - Dados em texto plano
   * @returns Dados criptografados
   */
  async encryptData(data: string): Promise<string> {
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + 'salt_key_mini_cozinha' // Salt para maior segurança
    );
    return encrypted;
  }

  /**
   * Limpa dados sensíveis ao fazer logout
   * Remove informações de avaliação, contatos de emergência, etc.
   */
  async clearOnLogout() {
    const sensitiveKeys = [
      'assessmentScore',
      'riskLevel',
      'emergencyContacts',
      'chatMessages',
      'secretAccess',
    ];

    await AsyncStorage.multiRemove(sensitiveKeys);
    this.isAuthenticated = false;
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns true se autenticado
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Define o status de autenticação do usuário
   * @param value - true para autenticado, false para não autenticado
   */
  setAuthenticated(value: boolean) {
    this.isAuthenticated = value;
    if (value) {
      this.updateLastAccess();
    }
  }
}

// Exporta uma instância única do serviço
export default SecurityService.getInstance();