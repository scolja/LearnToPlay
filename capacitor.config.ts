import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAP_DEV === '1';
const isEmulator = process.env.CAP_EMU === '1';

const devUrl = isEmulator
  ? 'http://10.0.2.2:5445'   // Android emulator → host localhost
  : 'http://192.168.86.38:5445'; // Physical device → LAN IP

const config: CapacitorConfig = {
  appId: 'com.learntoplay.app',
  appName: 'Learn to Play',
  webDir: 'out',
  server: isDev
    ? {
        // Local dev — set CAP_DEV=1 (+ CAP_EMU=1 for emulator) before cap sync
        url: devUrl,
        cleartext: true,
      }
    : {
        // Production
        url: 'https://learntoplay.azurewebsites.net',
      },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
  },
};

export default config;
