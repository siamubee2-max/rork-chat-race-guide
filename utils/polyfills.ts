import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const needsCryptoPolyfill = () => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
        return false;
      }
      if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  if (needsCryptoPolyfill()) {
    const cryptoPolyfill = {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
      subtle: undefined,
    } as any;

    const targets = [
      typeof global !== 'undefined' ? global : null,
      typeof window !== 'undefined' ? window : null,
      typeof globalThis !== 'undefined' ? globalThis : null,
    ].filter(Boolean);

    for (const target of targets) {
      if (target && !(target as any).crypto) {
        try {
          Object.defineProperty(target, 'crypto', {
            value: cryptoPolyfill,
            writable: false,
            configurable: false,
            enumerable: true,
          });
        } catch {
          // Property already exists or is not configurable
        }
      }
    }
  }
}
