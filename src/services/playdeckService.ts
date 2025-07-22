import { Profile } from '../types/playdeck';

class PlaydeckService {
  private profile: Profile | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Сообщаем родительскому окну, что мы готовы
    if (window.parent) {
      window.parent.postMessage({ type: 'playdeck-game-ready' }, '*');
    }
  }

  private handleMessage(event: MessageEvent) {
    // В идеале, здесь нужна проверка на event.origin
    const { data } = event;
    if (data && data.type === 'playdeck-user-info') {
      this.profile = data.payload;
      this.dispatchProfileEvent();
    }
  }

  private dispatchProfileEvent() {
    const event = new CustomEvent('playdeck:profile', { detail: this.profile });
    window.dispatchEvent(event);
  }

  getProfile(): Profile | null {
    return this.profile;
  }
}

export const playdeckService = new PlaydeckService(); 