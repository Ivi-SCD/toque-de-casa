/**
 * Configurações globais do aplicativo Toque de Casa
 * Contém constantes e configurações usadas em todo o app
 */
export const Config = {
    /**
     * Números de emergência para situações de risco
     * Usados para contato rápido em casos de necessidade
     */
    EMERGENCY_NUMBERS: {
      POLICE: '190',           // Polícia Militar
      WOMEN_HOTLINE: '180',    // Central de Atendimento à Mulher
      AMBULANCE: '192',        // SAMU
      HUMAN_RIGHTS: '100',     // Disque Direitos Humanos
    },
    
    /**
     * Configurações de segurança e tempo
     */
    SECRET_HOLD_DURATION: 5000, // Tempo em ms para ativar modo secreto (5 segundos)
    AUTO_LOCK_TIME: 5 * 60 * 1000, // Tempo para auto-bloqueio (5 minutos em ms)
    MAX_EVIDENCE_SIZE: 50 * 1024 * 1024, // Tamanho máximo para evidências (50MB)

    /**
     * Níveis de risco para avaliação de segurança
     * Define faixas de pontuação e labels para cada nível
     */
    RISK_LEVELS: {
      LOW: { min: 0, max: 20, label: 'baixo' },      // Risco baixo: 0-20 pontos
      MEDIUM: { min: 21, max: 40, label: 'moderado' }, // Risco moderado: 21-40 pontos
      HIGH: { min: 41, max: 75, label: 'alto' },     // Risco alto: 41-75 pontos
    },
  };