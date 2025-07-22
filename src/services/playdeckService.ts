import { PlaydeckMessage, Profile } from '../types/playdeck';

class PlaydeckService {
  private parent: Window;
  private isPlaydeckEnvironment: boolean = false;
  private userProfile: Profile | null = null;

  constructor() {
    this.parent = window.parent.window;
  }

  public init(): Promise<Profile | null> {
    return new Promise((resolve) => {
      try {
        this.isPlaydeckEnvironment = window.parent !== window;
        this.setupEventListeners(resolve);

        if (this.isPlaydeckEnvironment) {
          console.log('Running in Playdeck environment');
          this.sendMessage('loading');

          window.addEventListener('load', () => {
            setTimeout(() => {
              this.sendMessage('loading', 100);
            }, 500);
          });

          this.requestUserProfile();
        } else {
          console.log('Running standalone');
          resolve(null);
        }
      } catch (error) {
        console.error('Error initializing Playdeck:', error);
        this.isPlaydeckEnvironment = false;
        resolve(null);
      }
    });
  }

  private setupEventListeners(resolve: (profile: Profile | null) => void): void {
    window.addEventListener('message', ({ data }) => {
      if (!data || !data['playdeck']) return;

      const pdData = data['playdeck'] as PlaydeckMessage;

      if (pdData.method === 'getUserProfile') {
        this.userProfile = pdData.value as Profile;
        window.dispatchEvent(
          new CustomEvent('playdeck:profile', {
            detail: this.userProfile,
          })
        );
        resolve(this.userProfile);
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