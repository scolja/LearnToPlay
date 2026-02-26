import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAP_DEV === '1';

const config: CapacitorConfig = {
  appId: 'com.learntoplay.app',
  appName: 'Learn to Play',
  webDir: 'out',
  server: isDev
    ? {
        // Local dev — set CAP_DEV=1 before running cap sync/copy
        url: 'http://192.168.86.38:5445',
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
