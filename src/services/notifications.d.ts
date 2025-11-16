import { Ref } from 'vue';

export interface NotificacionWeb {
  id?: number;
  creador: string;
  texto: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  receptor: string;
  tipo: string;
  imagen?: string;
}

export declare function obtenerReceptores(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerTiposNotificaciones(toastMessage: Ref<string>,
                                                   toastColor: Ref<string>,
                                                   isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function crearNotificacionWeb(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>,
                                            inputTexto: string,
                                            inputFechaInicio: string,
                                            inputHoraInicio: string,
                                            inputFechaFin: string,
                                            inputHoraFin: string,
                                            inputReceptor: string,
                                            inputTipo: string,
                                            inputImagen?: string): Promise<void>;

export declare function obtenerNotificacionesVigentesPorTipo(toastMessage: Ref<string>,
                                                             toastColor: Ref<string>,
                                                             isToastOpen: Ref<boolean>,
                                                             inputTipo: string): Promise<NotificacionWeb[]>;

export declare function obtenerNotificacionesVigentesPorUsuario(toastMessage: Ref<string>,
                                                                toastColor: Ref<string>,
                                                                isToastOpen: Ref<boolean>): Promise<NotificacionWeb[]>;

export declare function cambiarEstadoNotificacionWeb(toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen: Ref<boolean>,
                                                     idNotificacion: number): Promise<void>;

