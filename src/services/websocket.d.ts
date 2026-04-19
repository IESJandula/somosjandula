export declare function conectarWebSocket(
  toastMessage: any,
  toastColor: any,
  isToastOpen: any,
  onMessage: (msg: any) => void
): Promise<void>;

export declare function enviarMensajeWebSocket(
  mensaje: any
): void;