import { Router } from 'vue-router';
import { Ref } from 'vue';
import { Auth } from "firebase/auth";

export declare function importarUsuarios(toastMessage: Ref<string>,
                                         toastColor: Ref<string>,
                                         isToastOpen: Ref<boolean>,
                                         file: any): Promise<void>;

export declare function importarUsuarios(toastMessage: Ref<string>,
                                         toastColor: Ref<string>,
                                         isToastOpen: Ref<boolean>,
                                         file: any): Promise<void>;

export interface RolesMenu {
    mostrarAdmin: boolean;
    mostrarHome: boolean;
}

export interface NombreYApellidos {
  nombre: string,
  apellidos: string
}

export interface NotificacionWeb {
  id?: number;
  texto: string;
  fechaInicio: string;
  fechaFin: string;
  nivel: string;
  roles: string[];
  imagen?: string;
}

export function validarRolesMenu(toastMessage: Ref<string>,
                                 toastColor: Ref<string>,
                                 isToastOpen: Ref<boolean>): Promise<RolesMenu>;

export async function obtenerRolesUsuario(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen:Ref<boolean>): Promise<[]>;

export async function obtenerNombreYApellidosUsuario(toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen:Ref<boolean>): Promise<NombreYApellidos>;

export async function obtenerEmailUsuario(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen:Ref<boolean>): Promise<string> ;

export async function obtenerJwtDecodificado(toastMessage: Ref<string>,
                                             toastColor: Ref<string>,
                                             isToastOpen:Ref<boolean>): Promise<[]>;

export async function obtenerTokenJWTValido(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<Object>;

export async function obtenerInfoUsuarios(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<[]>;

/******************************************************/
/** Funciones relacionadas con las notificaciones web */
/******************************************************/

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

export declare function obtenerNotificacionesHoy(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>,
                                                usuarioEmail: string): Promise<NotificacionWeb[]>;

export declare function eliminarNotificacionWeb(toastMessage: Ref<string>,
                                               toastColor: Ref<string>,
                                               isToastOpen: Ref<boolean>,
                                               idNotificacion: number,
                                               nivel: string,
                                               usuarioEmail: string): Promise<void>;

