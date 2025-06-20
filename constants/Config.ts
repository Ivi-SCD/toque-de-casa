export const Config = {
    EMERGENCY_NUMBERS: {
      POLICE: '190',
      WOMEN_HOTLINE: '180',
      AMBULANCE: '192',
      HUMAN_RIGHTS: '100',
    },
    
    SECRET_HOLD_DURATION: 5000, 
    AUTO_LOCK_TIME: 5 * 60 * 1000,
    MAX_EVIDENCE_SIZE: 50 * 1024 * 1024,

    RISK_LEVELS: {
      LOW: { min: 0, max: 20, label: 'baixo' },
      MEDIUM: { min: 21, max: 40, label: 'moderado' },
      HIGH: { min: 41, max: 75, label: 'alto' },
    },
  };