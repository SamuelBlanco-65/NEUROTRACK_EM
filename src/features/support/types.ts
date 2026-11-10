export type GuideType = 'leer' | 'escuchar' | 'ver';

export type SupportGuide = {
  id: string;
  type: GuideType;
  title: string;
  duration: string;
  badge?: string;
  summary: string;
  body: string[];
};

export type CrisisContact = {
  id: string;
  title: string;
  description: string;
  phone: string;
  badge: string;
  variant: 'primary' | 'error';
};
