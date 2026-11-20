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
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '264955410811-hdfrt5djn538e61vjn6aog8v1pf5hmdu.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
