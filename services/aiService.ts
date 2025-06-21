import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Interface para representar um alibi (cobertura)
 * Um alibi é um evento disfarçado que pode ser usado como cobertura
 */
interface Alibi {
  id: string;                    // Identificador único do alibi
  title: string;                 // Título real do evento
  culinaryTitle: string;         // Título disfarçado (culinário)
  startTime: Date;               // Horário de início
  endTime: Date;                 // Horário de término
  location: string;              // Localização real
  culinaryLocation: string;      // Localização disfarçada
  description: string;           // Descrição do evento
  recurring: boolean;            // Se é um evento recorrente
  reminderMinutesBefore: number; // Minutos antes para lembrete
  calendarEventId?: string;      // ID do evento no calendário
}

/**
 * Template de alibi pré-definido
 * Define tipos de eventos que podem ser criados como alibis
 */
interface AlibiTemplate {
  id: string;                    // Identificador do template
  name: string;                  // Nome real do tipo de evento
  culinaryName: string;          // Nome disfarçado (culinário)
  duration: number;              // Duração em minutos
  suggestedLocations: string[];  // Locais sugeridos para o evento
}

/**
 * Serviço de IA e Alibis para o aplicativo Toque de Casa
 * 
 * Este serviço gerencia a criação e gerenciamento de alibis (coberturas)
 * que permitem ao usuário ter eventos disfarçados no calendário e
 * notificações para situações de emergência.
 * 
 * Funcionalidades:
 * - Criação de eventos disfarçados no calendário
 * - Templates pré-definidos de alibis
 * - Notificações de lembrete
 * - Geração de desculpas rápidas
 * - Compartilhamento de "provas" de alibi
 * 
 * Implementa o padrão Singleton
 */
class AlibiService {
  private static instance: AlibiService;
  private alibis: Alibi[] = [];
  private calendarId: string | null = null;

  /**
   * Templates pré-definidos de alibis
   * Cada template tem um evento real e sua versão disfarçada
   */
  private alibiTemplates: AlibiTemplate[] = [
    {
      id: '1',
      name: 'Consulta médica',
      culinaryName: 'Aula de culinária',
      duration: 120, // 2 horas
      suggestedLocations: ['Hospital Regional', 'UBS Central', 'Clínica Popular'],
    },
    {
      id: '2',
      name: 'Reunião com advogada',
      culinaryName: 'Degustação de vinhos',
      duration: 90, // 1h30
      suggestedLocations: ['Defensoria Pública', 'Escritório Centro', 'Fórum'],
    },
    {
      id: '3',
      name: 'Terapia/Psicóloga',
      culinaryName: 'Workshop de confeitaria',
      duration: 60, // 1 hora
      suggestedLocations: ['CAPS', 'Consultório particular', 'Centro de Saúde'],
    },
    {
      id: '4',
      name: 'Grupo de apoio',
      culinaryName: 'Clube de cozinheiras',
      duration: 120, // 2 horas
      suggestedLocations: ['CREAS', 'Igreja local', 'Centro comunitário'],
    },
    {
      id: '5',
      name: 'Curso profissionalizante',
      culinaryName: 'Feira gastronômica',
      duration: 180, // 3 horas
      suggestedLocations: ['SENAC', 'SENAI', 'Instituto Federal'],
    },
  ];

  private constructor() {}

  /**
   * Obtém a instância única do serviço (Singleton)
   */
  static getInstance(): AlibiService {
    if (!AlibiService.instance) {
      AlibiService.instance = new AlibiService();
    }
    return AlibiService.instance;
  }

  /**
   * Inicializa o serviço carregando dados e configurando permissões
   */
  async initialize() {
    await this.loadAlibis();
    await this.setupCalendar();
    await this.setupNotifications();
  }

  /**
   * Carrega alibis salvos do AsyncStorage
   */
  private async loadAlibis() {
    try {
      const saved = await AsyncStorage.getItem('alibis');
      if (saved) {
        this.alibis = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading alibis:', error);
    }
  }

  /**
   * Salva alibis no AsyncStorage
   */
  private async saveAlibis() {
    try {
      await AsyncStorage.setItem('alibis', JSON.stringify(this.alibis));
    } catch (error) {
      console.error('Error saving alibis:', error);
    }
  }

  /**
   * Configura o calendário para criar eventos disfarçados
   * Cria um calendário específico "Toque de Casa Receitas" se não existir
   */
  private async setupCalendar() {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        
        // Procura pelo calendário do Toque de Casa
        let toqueDeCasaCalendar = calendars.find(cal => cal.title === 'Toque de Casa Receitas');
        
        if (!toqueDeCasaCalendar) {
          // Determina a fonte padrão do calendário baseado na plataforma
          const defaultCalendarSource = 
            Platform.OS === 'ios'
              ? calendars.find(cal => cal.source.name === 'iCloud')?.source
              : undefined;

          if (defaultCalendarSource || Platform.OS === 'android') {
            // Cria o calendário personalizado
            this.calendarId = await Calendar.createCalendarAsync({
              title: 'Toque de Casa Receitas',
              color: '#FF6B6B', // Cor coral do app
              entityType: Calendar.EntityTypes.EVENT,
              sourceId: defaultCalendarSource?.id,
              source: defaultCalendarSource,
              name: 'Toque de Casa',
              ownerAccount: 'Toque de Casa',
              accessLevel: Calendar.CalendarAccessLevel.OWNER,
            });
          }
        } else {
          this.calendarId = toqueDeCasaCalendar.id;
        }
      }
    } catch (error) {
      console.error('Error setting up calendar:', error);
    }
  }

  /**
   * Configura as notificações para lembretes de alibis
   */
  private async setupNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }

  /**
   * Cria um novo alibi baseado em um template
   * 
   * @param templateId - ID do template a ser usado
   * @param startTime - Horário de início do evento
   * @param location - Localização do evento
   * @param customDescription - Descrição personalizada (opcional)
   * @returns Alibi criado ou null se falhar
   */
  async createAlibi(
    templateId: string,
    startTime: Date,
    location: string,
    customDescription?: string
  ): Promise<Alibi | null> {
    const template = this.alibiTemplates.find(t => t.id === templateId);
    if (!template) return null;

    // Calcula o horário de término baseado na duração do template
    const endTime = new Date(startTime.getTime() + template.duration * 60000);
    
    const alibi: Alibi = {
      id: Date.now().toString(),
      title: template.name,
      culinaryTitle: template.culinaryName,
      startTime,
      endTime,
      location,
      culinaryLocation: this.generateCulinaryLocation(location),
      description: customDescription || `${template.culinaryName} especial`,
      recurring: false,
      reminderMinutesBefore: 30,
    };

    // Cria evento no calendário se possível
    if (this.calendarId) {
      try {
        const eventId = await Calendar.createEventAsync(this.calendarId, {
          title: alibi.culinaryTitle, // Usa o título disfarçado
          startDate: startTime,
          endDate: endTime,
          location: alibi.culinaryLocation, // Usa a localização disfarçada
          notes: alibi.description,
          alarms: [{ relativeOffset: -alibi.reminderMinutesBefore }],
        });
        
        alibi.calendarEventId = eventId;
      } catch (error) {
        console.error('Error creating calendar event:', error);
      }
    }

    // Agenda notificação de lembrete
    await this.scheduleNotification(alibi);

    // Salva o alibi localmente
    this.alibis.push(alibi);
    await this.saveAlibis();

    return alibi;
  }

  private generateCulinaryLocation(realLocation: string): string {
    const culinaryLocations: Record<string, string> = {
      'Hospital': 'Mercado Gourmet',
      'UBS': 'Feira Orgânica',
      'Clínica': 'Empório Especial',
      'Defensoria': 'Wine Bar',
      'Escritório': 'Café Gourmet',
      'Fórum': 'Restaurante Fino',
      'CAPS': 'Confeitaria Artesanal',
      'CREAS': 'Clube Gastronômico',
      'Igreja': 'Padaria Comunitária',
      'SENAC': 'Festival de Food Trucks',
      'SENAI': 'Expo Gastronomia',
    };

    for (const [key, value] of Object.entries(culinaryLocations)) {
      if (realLocation.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'Espaço Gourmet';
  }

  private async scheduleNotification(alibi: Alibi) {
    const trigger = new Date(alibi.startTime.getTime() - alibi.reminderMinutesBefore * 60000);

    if (trigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Lembrete: ${alibi.culinaryTitle}`,
          body: `Sua ${alibi.culinaryTitle} começa em ${alibi.reminderMinutesBefore} minutos`,
          data: { alibiId: alibi.id },
        },
        trigger: null, // Immediate notification
      });
    }
  }


  async generateSafetyPlan(riskLevel: string, context: any) {
     return {
       immediate: ['Exemplo de ação imediata'],
       shortTerm: ['Exemplo de ação de curto prazo'],
       resources: ['Exemplo de recurso'],
     };
   }

  async createRecurringAlibi(
    templateId: string,
    startTime: Date,
    location: string,
    recurrenceRule: string,
    occurrences: number
  ): Promise<Alibi[]> {
    const alibis: Alibi[] = [];
    const currentDate = new Date(startTime);

    for (let i = 0; i < occurrences; i++) {
      const alibi = await this.createAlibi(templateId, new Date(currentDate), location);
      if (alibi) {
        alibi.recurring = true;
        alibis.push(alibi);
      }

      switch (recurrenceRule) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return alibis;
  }

  async getUpcomingAlibis(): Promise<Alibi[]> {
    const now = new Date();
    return this.alibis
      .filter(alibi => alibi.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getPastAlibis(): Promise<Alibi[]> {
    const now = new Date();
    return this.alibis
      .filter(alibi => alibi.startTime <= now)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async deleteAlibi(id: string) {
    const alibi = this.alibis.find(a => a.id === id);
    if (alibi) {
      if (alibi.calendarEventId && this.calendarId) {
        try {
          await Calendar.deleteEventAsync(alibi.calendarEventId);
        } catch (error) {
          console.error('Error deleting calendar event:', error);
        }
      }

      this.alibis = this.alibis.filter(a => a.id !== id);
      await this.saveAlibis();
    }
  }

  async generateQuickExcuse(): Promise<{
    excuse: string;
    culinaryExcuse: string;
    suggestedDuration: string;
  }> {
    const excuses = [
      {
        excuse: 'Emergência médica - preciso ir ao hospital',
        culinaryExcuse: 'Ingrediente estragou - preciso comprar urgente no mercado 24h',
        suggestedDuration: '2-3 horas',
      },
      {
        excuse: 'Reunião importante de última hora',
        culinaryExcuse: 'Convidada para degustação exclusiva de vinhos',
        suggestedDuration: '1-2 horas',
      },
      {
        excuse: 'Problema no trabalho que preciso resolver',
        culinaryExcuse: 'Oportunidade única de curso com chef famoso',
        suggestedDuration: '3-4 horas',
      },
      {
        excuse: 'Consulta médica que consegui encaixe',
        culinaryExcuse: 'Vaga de última hora no workshop de confeitaria',
        suggestedDuration: '2 horas',
      },
    ];

    return excuses[Math.floor(Math.random() * excuses.length)];
  }

  async shareAlibiProof(alibiId: string): Promise<string> {
    const alibi = this.alibis.find(a => a.id === alibiId);
    if (!alibi) return '';

    const proof = `
📅 Compromisso: ${alibi.culinaryTitle}
📍 Local: ${alibi.culinaryLocation}
🕐 Horário: ${alibi.startTime.toLocaleString('pt-BR')}
📝 Descrição: ${alibi.description}

Confirmado no app Toque de Casa - Receitas & Eventos Gastronômicos
    `;

    return proof;
  }

  getTemplates(): AlibiTemplate[] {
    return this.alibiTemplates;
  }
}

export default AlibiService.getInstance();