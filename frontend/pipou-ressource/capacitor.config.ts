import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pipou.ressource',
  appName: 'Pipou Ressource',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;