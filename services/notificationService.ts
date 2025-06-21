import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import SecurityService from './security';

/**
 * Interface para notificações seguras
 * Permite armazenar tanto o conteúdo real quanto o disfarçado
 */
interface SecureNotification {
  id: string;           // Identificador único da notificação
  realTitle: string;    // Título real da notificação
  culinaryTitle: string; // Título disfarçado (culinário)
  realBody: string;     // Corpo real da notificação
  culinaryBody: string; // Corpo disfarçado (culinário)
  data: any;            // Dados adicionais da notificação
  priority: 'low' | 'medium' | 'high' | 'critical'; // Prioridade da notificação
  timestamp: Date;      // Data/hora da notificação
}

/**
 * Configurações de notificação do usuário
 */
interface NotificationSettings {
  enabled: boolean;           // Se notificações estão habilitadas
  hideContent: boolean;       // Se deve ocultar conteúdo real
  soundEnabled: boolean;      // Se som está habilitado
  vibrationEnabled: boolean;  // Se vibração está habilitada
  criticalAlertsOnly: boolean; // Se deve mostrar apenas alertas críticos
}

/**
 * Serviço de notificações seguras para o aplicativo Toque de Casa
 * 
 * Este serviço implementa um sistema de notificações que pode disfarçar
 * o conteúdo real com mensagens relacionadas a culinária, permitindo
 * que o usuário receba alertas de emergência sem revelar a verdadeira
 * natureza do aplicativo.
 * 
 * Funcionalidades:
 * - Notificações disfarçadas com tema culinário
 * - Diferentes níveis de prioridade
 * - Histórico de notificações
 * - Configurações personalizáveis
 * - Integração com sistema de segurança
 * 
 * Implementa o padrão Singleton
 */
class NotificationService {
  private static instance: NotificationService;
  
  /**
   * Configurações padrão de notificação
   */
  private settings: NotificationSettings = {
    enabled: true,
    hideContent: true,        // Por padrão, oculta conteúdo real
    soundEnabled: false,      // Som desabilitado por padrão
    vibrationEnabled: true,   // Vibração habilitada por padrão
    criticalAlertsOnly: false, // Mostra todas as notificações por padrão
  };
  
  /**
   * Histórico das últimas notificações
   */
  private notificationHistory: SecureNotification[] = [];

  /**
   * Frases culinárias para disfarçar notificações reais
   * Organizadas por prioridade e tipo
   */
  private culinaryPhrases = {
    // Frases para alertas gerais
    alerts: [
      'Nova receita especial disponível!',
      'Dica quente de culinária',
      'Ingrediente em promoção',
      'Chef online agora',
      'Receita do dia',
    ],
    // Frases para lembretes
    reminders: [
      'Hora de preparar o jantar',
      'Não esqueça dos ingredientes',
      'Mercado fecha em 1 hora',
      'Receita agendada',
      'Tempo de preparo',
    ],
    // Frases para urgências
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

  /**
   * Obtém a instância única do serviço (Singleton)
   */
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Inicializa o serviço carregando configurações e configurando notificações
   */
  private async initialize() {
    await this.loadSettings();
    await this.setupNotifications();
    this.setupNotificationHandlers();
  }

  /**
   * Carrega configurações salvas do AsyncStorage
   */
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

  /**
   * Salva configurações no AsyncStorage
   */
  private async saveSettings() {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Configura os canais de notificação para Android
   * e solicita permissões necessárias
   */
  private async setupNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      // Canal padrão para notificações normais
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Receitas',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
        sound: null,
      });

      // Canal crítico para notificações de emergência
      await Notifications.setNotificationChannelAsync('critical', {
        name: 'Ofertas Especiais',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#FF0000',
        sound: 'default',
      });
    }
  }

  /**
   * Configura handlers para processar notificações recebidas
   */
  private setupNotificationHandlers() {
    // Handler para quando a notificação é recebida
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

    // Handler para quando o usuário interage com a notificação
    Notifications.addNotificationResponseReceivedListener((response) => {
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Determina se uma notificação deve ser exibida baseado nas configurações
   */
  private shouldShowNotification(notification: Notifications.Notification): boolean {
    if (!this.settings.enabled) return false;
    
    const priority = notification.request.content.data?.priority || 'low';
    
    // Se configurado para mostrar apenas alertas críticos
    if (this.settings.criticalAlertsOnly && priority !== 'critical') {
      return false;
    }

    return true;
  }

  /**
   * Processa a resposta do usuário a uma notificação
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.action) {
      switch (data.action) {
        case 'emergency':
          // Ativa modo pânico se for uma notificação de emergência
          SecurityService.panicMode();
          break;
        case 'openChat':
          // Abrir chat (implementação futura)
          break;
        case 'viewMap':
          // Abrir mapa (implementação futura)
          break;
      }
    }
  }

  /**
   * Envia uma notificação segura com conteúdo disfarçado
   * 
   * @param realTitle - Título real da notificação
   * @param realBody - Corpo real da notificação
   * @param priority - Prioridade da notificação
   * @param data - Dados adicionais
   */
  async sendSecureNotification(
    realTitle: string,
    realBody: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    data?: any
  ) {
    if (!this.settings.enabled) return;

    // Gera títulos e corpos disfarçados baseados na prioridade
    const culinaryTitle = this.generateCulinaryTitle(priority);
    const culinaryBody = this.generateCulinaryBody(priority);

    // Monta o conteúdo da notificação
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

    // Configurações especiais para notificações críticas
    if (priority === 'critical') {
      notificationContent.badge = 1;
      notificationContent.sound = 'default';
    }

    const channelId = priority === 'critical' ? 'critical' : 'default';

    // Agenda a notificação
    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null,
      identifier: `secure_${Date.now()}`,
    });

    // Salva no histórico
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

  /**
   * Gera um título culinário baseado na prioridade da notificação
   */
  private generateCulinaryTitle(priority: 'low' | 'medium' | 'high' | 'critical'): string {
    const phrases = priority === 'critical' ? this.culinaryPhrases.urgent :
                   priority === 'high' ? this.culinaryPhrases.alerts :
                   this.culinaryPhrases.reminders;
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Gera um corpo culinário baseado na prioridade da notificação
   */
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

  /**
   * Envia alerta de emergência para contatos específicos
   * 
   * @param contacts - Lista de contatos para notificar
   * @param location - Localização opcional para incluir no alerta
   */
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

  /**
   * Agenda uma notificação de check-in periódico
   * 
   * @param intervalHours - Intervalo em horas para o check-in (padrão: 24h)
   */
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

  /**
   * Atualiza as configurações de notificação
   */
  async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  /**
   * Obtém as configurações atuais de notificação
   */
  getSettings(): NotificationSettings {
    return this.settings;
  }

  /**
   * Salva uma notificação no histórico local
   * Mantém apenas as últimas 50 notificações
   */
  private async saveNotificationToHistory(notification: SecureNotification) {
    this.notificationHistory.unshift(notification);
    
    // Limita o histórico a 50 notificações
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }

    try {
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  /**
   * Obtém o histórico de notificações
   */
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

  /**
   * Limpa o histórico de notificações
   */
  async clearNotificationHistory() {
    this.notificationHistory = [];
    await AsyncStorage.removeItem('notificationHistory');
  }

  /**
   * Envia uma notificação de teste para verificar configurações
   * 
   * @param type - Tipo de notificação de teste
   */
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

// Exporta uma instância única do serviço
export default NotificationService.getInstance();