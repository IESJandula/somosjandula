import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.iesjandula.somosjandula',
  appName: 'somosjandula',
  webDir: 'dist',
  server: {
    androidScheme: 'https',  // Usa HTTPS
    cleartext: false,  // Desactiva el tráfico HTTP, ya no es necesario
    allowNavigation: [
      '194.164.164.183',  // Permite la navegación hacia tu servidor backend
    ]
  }
};

export default config;
