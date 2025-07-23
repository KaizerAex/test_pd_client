export type Profile = {
  avatar: string;
  username: string;
  firstName: string;
  lastName:string;
  telegramId: number;
  locale: 'en' | 'ru';
  token: string;
  params: { [key: string]: string };
  sessionId: string;
  currentGameStarted: number;
  anonymousId?: string;
  isAnonymous?: boolean;
}; 

export interface PlaydeckMessage {
  method: string;
  value?: unknown;
  data?: unknown;
  key?: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  externalId: string;
  photoUrl?: string;
}