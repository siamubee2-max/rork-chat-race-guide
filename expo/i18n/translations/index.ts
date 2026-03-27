import en from './en';
import fr from './fr';
import es from './es';
import it from './it';
import de from './de';
import pt from './pt';
import ru from './ru';
import ar from './ar';
import zh from './zh';
import ja from './ja';
import nl from './nl';

export const translations: Record<string, any> = {
  en,
  fr,
  es,
  it,
  de,
  pt,
  ru,
  ar,
  zh,
  ja,
  nl,
};

export const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];
