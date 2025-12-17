import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const cryptoPolyfill = {
    getRandomValues: (array: Uint8Array) => {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        return window.crypto.getRandomValues(array);
      }
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: () => {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    subtle: typeof window !== 'undefined' && window.crypto ? window.crypto.subtle : undefined,
  } as any;

  try {
    if (typeof global !== 'undefined' && !(global as any).crypto) {
      Object.defineProperty(global, 'crypto', {
        value: cryptoPolyfill,
        writable: false,
        configurable: true,
      });
    }
  } catch {
    // crypto is already defined and read-only
  }

  try {
    if (typeof window !== 'undefined' && !window.crypto) {
      Object.defineProperty(window, 'crypto', {
        value: cryptoPolyfill,
        writable: false,
        configurable: true,
      });
    }
  } catch {
    // crypto is already defined and read-only
  }

  try {
    if (typeof globalThis !== 'undefined' && !(globalThis as any).crypto) {
      Object.defineProperty(globalThis, 'crypto', {
        value: cryptoPolyfill,
        writable: false,
        configurable: true,
      });
    }
  } catch {
    // crypto is already defined and read-only
  }
}
