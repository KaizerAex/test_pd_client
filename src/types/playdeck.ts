export interface Profile {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
}

export interface PlaydeckMessage {
  method: string;
  value?: unknown;
} 