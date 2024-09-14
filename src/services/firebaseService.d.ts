import { Router } from 'vue-router';
import { Ref } from 'vue';
import { Auth } from "firebase/auth";

export declare function validarUsuario(
    router: Router,
    auth: Auth,
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    userUid: string
): Promise<void>;

export interface RolesMenu {
    mostrarAdmin: boolean;
    mostrarHome: boolean;
  }

export function validarRolesMenu(toastMessage: Ref<string>,
                                 toastColor: Ref<string>,
                                 isToastOpen: Ref<boolean>,
                                 userUid: string): Promise<RolesMenu>;

export async function obtenerUsuariosConRoles(toastMessage: Ref<string>,
                                              toastColor: Ref<string>,
                                              isToastOpen: Ref<boolean>): Promise<[]>;

export async function obtenerTokenJWTValido(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<Object>;