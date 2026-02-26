import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.learntoplay.app',
  appName: 'Learn to Play',
  webDir: 'out',
  server: {
    // LAN IP — works for both emulator and physical devices on same network
    url: 'http://192.168.86.38:5445',
    cleartext: true,
  },
};

export default config;
