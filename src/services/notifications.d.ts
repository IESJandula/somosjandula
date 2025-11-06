import { Ref } from 'vue';

export interface NotificacionWeb {
  id?: number;
  texto: string;
  fechaInicio: string;
  fechaFin: string;
  nivel: string;
  roles: string[];
  imagen?: string;
}

export declare function obtenerRolesUsuario(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerNivelesNotificaciones(toastMessage: Ref<string>,
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
                                            inputNivel: string,
                                            inputRoles: string[],
                                            inputImagen?: string): Promise<void>;

export declare function obtenerNotificacionesVigentesPorNivel(toastMessage: Ref<string>,
                                                              toastColor: Ref<string>,
                                                              isToastOpen: Ref<boolean>,
                                                              nivel: string): Promise<NotificacionWeb[]>;

export declare function obtenerNotificacionesVigentesPorUsuario(toastMessage: Ref<string>,
                                                                toastColor: Ref<string>,
                                                                isToastOpen: Ref<boolean>): Promise<NotificacionWeb[]>;

export declare function cambiarEstadoNotificacionWeb(toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen: Ref<boolean>,
                                                     idNotificacion: number): Promise<void>;

