import { SESSION_USER_INFO, SESSION_USER_UID } from '@/utils/constants' ;

export const guardarUserInfoEnSesion = async (usuario) =>
{
    localStorage.setItem(SESSION_USER_INFO, JSON.stringify(usuario)) ;
}

export const obtenerUserInfoEnSesion = async (toastMessage, toastColor, isToastOpen) =>
{
    // Obtenemos el usuario almacenado previamente en sesión
    const userInfo = localStorage.getItem(SESSION_USER_INFO) ;
    
    // Verificamos si no existe el objeto
    if (!userInfo)
    {
        let errorString = "No se encontró el usuario en sesión" ;

        // Crear toast y lanzar excepción
        crearToast(toastMessage, toastColor, isToastOpen, "danger", errorString) ;
        throw new Error(errorString) ;
    }

    // Parseamos el JSON a un objeto JavaScript y lo devolvemos
    return JSON.parse(userInfo) ;
} ;

export const guardarUserUidEnSesion = async (userUid) =>
    {
        localStorage.setItem(SESSION_USER_UID, userUid) ;
    }

export const obtenerUserUidEnSesion = async (toastMessage, toastColor, isToastOpen) =>
{
    // Obtenemos el usuario UID almacenado previamente en sesión
    const userUid = localStorage.getItem(SESSION_USER_UID) ;

    // Verificamos si no existe
    if (!userUid)
    {
        let errorString = "No se encontró el usuario UID en sesión" ;

        // Crear toast y lanzar excepción
        crearToast(toastMessage, toastColor, isToastOpen, "danger", errorString) ;
        throw new Error(errorString) ;
    }

    // Devolvemos el UID del usuario
    return userUid ;
}
