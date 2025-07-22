/* eslint-disable @typescript-eslint/no-explicit-any */
import { playdeckService } from './playdeckService';
import { Profile } from '../types/playdeck';

// Определяем возможные окружения
export enum Environment {
  PLAYDECK = 'playdeck',
  STANDALONE = 'standalone',
}

// Общий интерфейс для всех платформенных сервисов
export interface PlatformService {
  init(): void;
  isAvailable(): boolean;
  getUserProfile(): Profile | null;
  requestUserProfile(): void;
}

class EnvironmentService {
  private environment: Environment;
  private platformService: PlatformService | null = null;

  constructor() {
    this.environment = this.detectEnvironment();
  }

  private detectEnvironment(): Environment {
    const isPlaydeck = window.parent !== window;
    if (isPlaydeck) {
      return Environment.PLAYDECK;
    }
    return Environment.STANDALONE;
  }

  public getEnvironment(): Environment {
    return this.environment;
  }

  public async initializePlatformService(): Promise<PlatformService> {
    if (this.platformService) {
      return this.platformService;
    }

    const environment = this.getEnvironment();
    let service: PlatformService;
    
    switch (environment) {
      case Environment.PLAYDECK:
        console.log('Initializing Playdeck Platform Service');
        playdeckService.init();
        service = playdeckService as any;
        break;
        
      case Environment.STANDALONE:
      default:
        console.log('Initializing Standalone Platform Service');
        const standaloneService = {
            init: () => {
                console.log('Standalone service init');
                setTimeout(() => window.dispatchEvent(new CustomEvent('playdeck:profile', { detail: null })), 100);
            },
            isAvailable: () => false,
            getUserProfile: () => null,
            requestUserProfile: () => { /* no-op */ },
        };
        standaloneService.init();
        service = standaloneService;
        break;
    }
    this.platformService = service;
    return service;
  }
}

export const environmentService = new EnvironmentService(); 