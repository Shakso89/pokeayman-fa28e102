import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pokeayman.app',
  appName: 'PokéAyman',
  webDir: '.output/public',
  server: {
    url: 'https://pokeayman.pokeayman.workers.dev?platform=android',
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
