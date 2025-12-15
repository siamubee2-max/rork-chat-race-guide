import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  if (typeof global.crypto === 'undefined') {
    const crypto = window.crypto || (window as any).msCrypto;
    if (crypto) {
      global.crypto = crypto;
    } else {
      global.crypto = {
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
      } as any;
    }
  }

  if (typeof global.window !== 'undefined' && !window.crypto) {
    (window as any).crypto = global.crypto;
  }
}
