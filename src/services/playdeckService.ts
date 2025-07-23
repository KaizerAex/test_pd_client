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
      console.log('init started');
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
        console.log('[PlaydeckService] Received response for requestPayment:', JSON.stringify(pdData.value, null, 2));

        // Playdeck sends back the payment info, including the URL to open
        window.dispatchEvent(
            new CustomEvent('playdeck:payment', {
                detail: pdData.value,
            })
        );
        
        // CRITICAL: Open the payment invoice using the official Telegram method
        if (pdData.value && typeof pdData.value === 'object' && 'url' in pdData.value) {
            console.log('[PlaydeckService] Found URL. Attempting to open invoice:', pdData.value.url);
            this.openTelegramInvoice(pdData.value.url as string);
        } else {
            console.error('[PlaydeckService] Response received, but "url" field is missing or invalid.');
        }
      }
    });
  }

  private openTelegramInvoice(url: string): void {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.openInvoice) {
      // Use the official Telegram method to open invoices
      webApp.openInvoice(url, (status: string) => {
        console.log(`[PlaydeckService] Invoice status: ${status}`);
        // Optionally, dispatch an event with the status
        window.dispatchEvent(new CustomEvent('playdeck:invoiceStatus', {
            detail: { status, url },
        }));
      });
    } else {
      // Fallback for non-Telegram environments
      console.warn('[PlaydeckService] Telegram WebApp not found. Opening in new tab as fallback.');
      window.open(url, '_blank');
    }
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

  public isAvailable(): boolean {
    return this.isPlaydeckEnvironment;
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