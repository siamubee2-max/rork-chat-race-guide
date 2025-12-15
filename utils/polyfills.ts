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

  if (typeof global !== 'undefined') {
    (global as any).crypto = cryptoPolyfill;
  }

  if (typeof window !== 'undefined') {
    if (!window.crypto) {
      (window as any).crypto = cryptoPolyfill;
    }
  }

  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any).crypto) {
      (globalThis as any).crypto = cryptoPolyfill;
    }
  }
}
