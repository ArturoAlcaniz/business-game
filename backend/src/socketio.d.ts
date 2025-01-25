import { Handshake } from 'socket.io';

declare module 'socket.io' {
  interface Handshake {
    user: {
      sub: string; // Ajusta el tipo según la estructura de tu payload
      username?: string; // Otras propiedades si las hay
    };
  }
}