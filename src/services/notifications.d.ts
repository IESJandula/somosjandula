import { Ref } from 'vue';

/*************************************************/
/*************** Tipos Comunes *******************/
/*************************************************/

export interface NotificacionWeb
{
  id?: number;
  creador: string;
  texto: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  receptor: string;
  tipo: string;
  imagen?: string;
}

export interface AplicacionDto
{
  nombre: string;
  fechaUltimaNotificacionCalendar: string;
  notifHoyCalendar: number;
  notifMaxCalendar: number;
  fechaUltimaNotificacionEmail: string;
  notifHoyEmail: number;
  notifMaxEmail: number;
  fechaUltimaNotificacionWeb: string;
  notifHoyWeb: number;
  notifMaxWeb: number;
}

/*************************************************/
/******** Gestión de notificaciones web **********/
/*************************************************/

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

export declare function borrarNotificacionWeb(toastMessage: Ref<string>,
                                              toastColor: Ref<string>,
                                              isToastOpen: Ref<boolean>,
                                              idNotificacion: number): Promise<void>;

/*********************************************************/
/******************** Administración *********************/
/*********************************************************/

export declare function autorizarGmailOAuth(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<boolean>;


export declare function crearAplicacion(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        nombreAplicacion: string,
                                        notificacionesMaximasCalendar: number,
                                        notificacionesMaximasEmail: number,
                                        notificacionesMaximasWeb: number): Promise<void>;

export declare function listarAplicaciones(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           pageNumber: number,
                                           pageSize: number): Promise<Page<AplicacionDto>>;

export declare function actualizarNotificacionesMaximasCalendar(toastMessage: Ref<string>,
                                                                toastColor: Ref<string>,
                                                                isToastOpen: Ref<boolean>,
                                                                nombreAplicacion: string,
                                                                nuevoValorMaximoAplicacion: number): Promise<void>;

export declare function actualizarNotificacionesMaximasEmail(toastMessage: Ref<string>,
                                                             toastColor: Ref<string>,
                                                             isToastOpen: Ref<boolean>,
                                                             nombreAplicacion: string,
                                                             nuevoValorMaximoAplicacion: number): Promise<void>;

export declare function actualizarNotificacionesMaximasWeb(toastMessage: Ref<string>,
                                                           toastColor: Ref<string>,
                                                           isToastOpen: Ref<boolean>,
                                                           nombreAplicacion: string,
                                                           nuevoValorMaximoAplicacion: number): Promise<void>;

export declare function borrarAplicacion(toastMessage: Ref<string>,
                                         toastColor: Ref<string>,
                                         isToastOpen: Ref<boolean>,
                                         nombreAplicacion: string): Promise<void>;