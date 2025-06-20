import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

interface SecurityConfig {
  panicCode: string;
  biometricEnabled: boolean;
  autoLockTime: number;
  lastAccessTime: number;
  secretPattern: string[];
}

class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig | null = null;
  private isAuthenticated: boolean = false;

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async initialize() {
    try {
      const savedConfig = await AsyncStorage.getItem('securityConfig');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      } else {
        this.config = {
          panicCode: '911911',
          biometricEnabled: false,
          autoLockTime: 5,
          lastAccessTime: Date.now(),
          secretPattern: ['especiais', 'hold', '5000'],
        };
        await this.saveConfig();
      }
    } catch (error) {
      console.error('Error initializing security:', error);
    }
  }

  async saveConfig() {
    if (this.config) {
      await AsyncStorage.setItem('securityConfig', JSON.stringify(this.config));
    }
  }

  async enableBiometric(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
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

  async setPanicCode(code: string) {
    if (this.config) {
      this.config.panicCode = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        code
      );
      await this.saveConfig();
    }
  }

  async checkPanicCode(inputCode: string): Promise<boolean> {
    if (!this.config) return false;

    const hashedInput = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      inputCode
    );

    return hashedInput === this.config.panicCode;
  }

  async panicMode() {
    const keysToKeep = ['recipes', 'normalSettings'];
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
    
    await AsyncStorage.multiRemove(keysToRemove);
    
    this.isAuthenticated = false;
  }

  checkAutoLock(): boolean {
    if (!this.config) return false;

    const now = Date.now();
    const timeDiff = (now - this.config.lastAccessTime) / 1000 / 60;

    if (timeDiff > this.config.autoLockTime) {
      this.isAuthenticated = false;
      return true;
    }

    return false;
  }

  updateLastAccess() {
    if (this.config) {
      this.config.lastAccessTime = Date.now();
      this.saveConfig();
    }
  }

  async encryptData(data: string): Promise<string> {
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + 'salt_key_mini_cozinha'
    );
    return encrypted;
  }

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

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  setAuthenticated(value: boolean) {
    this.isAuthenticated = value;
    if (value) {
      this.updateLastAccess();
    }
  }
}

export default SecurityService.getInstance();