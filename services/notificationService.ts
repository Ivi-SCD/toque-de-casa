import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import SecurityService from './security';

interface SecureNotification {
  id: string;
  realTitle: string;
  culinaryTitle: string;
  realBody: string;
  culinaryBody: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

interface NotificationSettings {
  enabled: boolean;
  hideContent: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  criticalAlertsOnly: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: true,
    hideContent: true,
    soundEnabled: false,
    vibrationEnabled: true,
    criticalAlertsOnly: false,
  };
  private notificationHistory: SecureNotification[] = [];

  private culinaryPhrases = {
    alerts: [
      'Nova receita especial disponível!',
      'Dica quente de culinária',
      'Ingrediente em promoção',
      'Chef online agora',
      'Receita do dia',
    ],
    reminders: [
      'Hora de preparar o jantar',
      'Não esqueça dos ingredientes',
      'Mercado fecha em 1 hora',
      'Receita agendada',
      'Tempo de preparo',
    ],
    urgent: [
      'Oferta limitada no mercado!',
      'Últimas unidades do ingrediente',
      'Promoção relâmpago',
      'Chef VIP disponível',
      'Receita exclusiva liberada',
    ],
  };

  private constructor() {
    this.initialize();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    await this.loadSettings();
    await this.setupNotifications();
    this.setupNotificationHandlers();
  }

  private async loadSettings() {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private async setupNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Receitas',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
        sound: null,
      });

      await Notifications.setNotificationChannelAsync('critical', {
        name: 'Ofertas Especiais',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#FF0000',
        sound: 'default',
      });
    }
  }

  private setupNotificationHandlers() {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const shouldShow = this.shouldShowNotification(notification);
        
        return {
          shouldShowAlert: shouldShow,
          shouldPlaySound: this.settings.soundEnabled && shouldShow,
          shouldSetBadge: false,
          shouldShowBanner: shouldShow,
          shouldShowList: shouldShow,
        };
      },
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      this.handleNotificationResponse(response);
    });
  }

  private shouldShowNotification(notification: Notifications.Notification): boolean {
    if (!this.settings.enabled) return false;
    
    const priority = notification.request.content.data?.priority || 'low';
    
    if (this.settings.criticalAlertsOnly && priority !== 'critical') {
      return false;
    }

    return true;
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.action) {
      switch (data.action) {
        case 'emergency':
          SecurityService.panicMode();
          break;
        case 'openChat':
          break;
        case 'viewMap':
          break;
      }
    }
  }

  async sendSecureNotification(
    realTitle: string,
    realBody: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    data?: any
  ) {
    if (!this.settings.enabled) return;

    const culinaryTitle = this.generateCulinaryTitle(priority);
    const culinaryBody = this.generateCulinaryBody(priority);

    const notificationContent: Notifications.NotificationContentInput = {
      title: this.settings.hideContent ? culinaryTitle : realTitle,
      body: this.settings.hideContent ? culinaryBody : realBody,
      data: {
        ...data,
        realTitle,
        realBody,
        priority,
        timestamp: new Date().toISOString(),
      },
      categoryIdentifier: priority === 'critical' ? 'emergency' : 'default',
    };

    if (priority === 'critical') {
      notificationContent.badge = 1;
      notificationContent.sound = 'default';
    }

    const channelId = priority === 'critical' ? 'critical' : 'default';

    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null,
      identifier: `secure_${Date.now()}`,
    });

    this.saveNotificationToHistory({
      id: Date.now().toString(),
      realTitle,
      culinaryTitle,
      realBody,
      culinaryBody,
      data,
      priority,
      timestamp: new Date(),
    });
  }

  private generateCulinaryTitle(priority: 'low' | 'medium' | 'high' | 'critical'): string {
    const phrases = priority === 'critical' ? this.culinaryPhrases.urgent :
                   priority === 'high' ? this.culinaryPhrases.alerts :
                   this.culinaryPhrases.reminders;
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private generateCulinaryBody(priority: 'low' | 'medium' | 'high' | 'critical'): string {
    const bodies = {
      low: [
        'Confira as novidades no app',
        'Temos sugestões para você',
        'Novas receitas adicionadas',
      ],
      medium: [
        'Não perca essa oportunidade',
        'Disponível por tempo limitado',
        'Recomendado para você',
      ],
      high: [
        'Ação necessária agora',
        'Importante verificar',
        'Requer sua atenção',
      ],
      critical: [
        'Urgente! Veja agora',
        'Atenção imediata necessária',
        'Não pode esperar',
      ],
    };

    const options = bodies[priority];
    return options[Math.floor(Math.random() * options.length)];
  }

  async sendEmergencyAlert(contacts: string[], location?: { latitude: number; longitude: number }) {
    const message = this.settings.hideContent 
      ? 'Receita especial em andamento! Venha experimentar 🍰'
      : 'EMERGÊNCIA - Preciso de ajuda imediata';

    await this.sendSecureNotification(
      'Alertas enviados',
      `${contacts.length} contatos notificados`,
      'critical',
      { action: 'emergency_sent' }
    );
  }

  async scheduleCheckIn(intervalHours: number = 24) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger = new Date();
    trigger.setHours(trigger.getHours() + intervalHours);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Como está sua experiência culinária?',
        body: 'Toque para fazer uma avaliação rápida',
        data: { action: 'checkIn' },
      },
      trigger: null,
      identifier: 'checkIn',
    });
  }

  async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return this.settings;
  }

  private async saveNotificationToHistory(notification: SecureNotification) {
    this.notificationHistory.unshift(notification);
    
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }

    try {
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  async getNotificationHistory(): Promise<SecureNotification[]> {
    try {
      const saved = await AsyncStorage.getItem('notificationHistory');
      if (saved) {
        this.notificationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }

    return this.notificationHistory;
  }

  async clearNotificationHistory() {
    this.notificationHistory = [];
    await AsyncStorage.removeItem('notificationHistory');
  }

  async testNotification(type: 'low' | 'medium' | 'high' | 'critical') {
    const testMessages = {
      low: {
        title: 'Teste: Notificação Baixa Prioridade',
        body: 'Esta é uma notificação de teste com baixa prioridade',
      },
      medium: {
        title: 'Teste: Notificação Média Prioridade',
        body: 'Esta é uma notificação de teste com média prioridade',
      },
      high: {
        title: 'Teste: Notificação Alta Prioridade',
        body: 'Esta é uma notificação de teste com alta prioridade',
      },
      critical: {
        title: 'Teste: Notificação Crítica',
        body: 'Esta é uma notificação de teste crítica - Em produção, seria um alerta de emergência',
      },
    };

    const message = testMessages[type];
    await this.sendSecureNotification(message.title, message.body, type, { test: true });
  }
}

export default NotificationService.getInstance();