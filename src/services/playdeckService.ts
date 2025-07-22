import { PlaydeckMessage, Profile } from '../types/playdeck';

class PlaydeckService {
  private parent: Window;
  private isPlaydeckEnvironment: boolean = false;
  private isPlaydeckOpened: boolean = false;
  private userProfile: Profile | null = null;

  constructor() {
    this.parent = window.parent.window;
  }

  public init(): void {
    try {
      this.isPlaydeckEnvironment = window.parent !== window;
      this.setupEventListeners();

      if (this.isPlaydeckEnvironment) {
        console.log('Running in Playdeck environment');
        this.sendMessage('loading');

        // Отправляем сигнал о полной загрузке через фиксированную задержку,
        // а не по событию window.load, чтобы избежать проблем с синхронизацией.
        setTimeout(() => {
          console.log('Sending loading: 100');
          this.sendMessage('loading', 100);
        }, 3000);

        this.getPlaydeckState();
        this.requestUserProfile();
      } else {
        console.log('Running standalone, dispatching fake profile event');
        window.dispatchEvent(new CustomEvent('playdeck:profile', { detail: null }));
      }
    } catch (error) {
      console.error('Error initializing Playdeck:', error);
      this.isPlaydeckEnvironment = false;
      window.dispatchEvent(new CustomEvent('playdeck:profile', { detail: null }));
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('message', ({ data }) => {
      if (!data || !data['playdeck']) return;

      const pdData = data['playdeck'] as PlaydeckMessage;
      
      if (pdData.method === 'getPlaydeckState') {
        this.isPlaydeckOpened = pdData.value as boolean;
      }

      if (pdData.method === 'getUserProfile') {
        this.userProfile = pdData.value as Profile;
        window.dispatchEvent(
          new CustomEvent('playdeck:profile', {
            detail: this.userProfile,
          })
        );
      }

      if (pdData.method === 'requestPayment') {
        window.dispatchEvent(
            new CustomEvent('playdeck:payment', {
                detail: pdData.value,
            })
        );
      }
    });
  }

  private sendMessage(method: string, value?: unknown): void {
    if (!this.isPlaydeckEnvironment) return;

    const payload: { playdeck: PlaydeckMessage } = {
      playdeck: {
        method,
      },
    };

    if (value !== undefined) {
      payload.playdeck.value = value;
    }

    this.parent.postMessage(payload, '*');
  }

  public getPlaydeckState(): Promise<boolean> {
    return new Promise((resolve) => {
        const handler = (event: MessageEvent) => {
            const playdeck = event.data?.playdeck;
            if (playdeck?.method === 'getPlaydeckState') {
                window.removeEventListener('message', handler);
                resolve(playdeck.value as boolean);
            }
        };
        window.addEventListener('message', handler);
        this.sendMessage('getPlaydeckState');
    });
  }

  public isMenuOpened(): boolean {
    return this.isPlaydeckOpened;
  }

  public isPlaydeck(): boolean {
    return this.isPlaydeckEnvironment;
  }

  public requestUserProfile(): void {
    this.sendMessage('getUserProfile');
  }

  public getUserProfile(): Profile | null {
    return this.userProfile;
  }

  public requestPayment(amount: number, description: string, externalId: string): void {
    this.sendMessage('requestPayment', { amount, description, externalId });
  }
}

export const playdeckService = new PlaydeckService(); 