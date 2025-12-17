import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const needsCryptoPolyfill = () => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
        globalThis.crypto.getRandomValues(new Uint8Array(1));
        return false;
      }
      if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
        window.crypto.getRandomValues(new Uint8Array(1));
        return false;
      }
      return true;
    } catch (error) {
      console.log('[Polyfill] crypto test failed:', error);
      return true;
    }
  };

  if (needsCryptoPolyfill()) {
    console.log('[Polyfill] Installing crypto polyfill');
    
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

    const installOnTarget = (target: any, name: string) => {
      if (!target) return false;
      
      try {
        const descriptor = Object.getOwnPropertyDescriptor(target, 'crypto');
        
        if (descriptor && !descriptor.configurable) {
          console.log(`[Polyfill] ${name}.crypto is not configurable, skipping`);
          return false;
        }
        
        if (descriptor && descriptor.get && !descriptor.set) {
          console.log(`[Polyfill] ${name}.crypto is getter-only, trying to delete`);
          try {
            delete target.crypto;
          } catch {
            console.log(`[Polyfill] Cannot delete ${name}.crypto`);
            return false;
          }
        }
        
        Object.defineProperty(target, 'crypto', {
          value: cryptoPolyfill,
          writable: true,
          configurable: true,
          enumerable: true,
        });
        
        console.log(`[Polyfill] Successfully installed crypto on ${name}`);
        return true;
      } catch (error) {
        console.log(`[Polyfill] Failed to install on ${name}:`, error);
        return false;
      }
    };

    installOnTarget(globalThis, 'globalThis') ||
    installOnTarget(window, 'window') ||
    installOnTarget(global, 'global');
  } else {
    console.log('[Polyfill] crypto already available');
  }
}
