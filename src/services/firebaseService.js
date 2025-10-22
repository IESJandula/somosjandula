import { firebaseApiUrl } from '@/environment/apiUrls';
import { crearToast } from '@/utils/toast.js';
import { getAuth } from "firebase/auth";
import { SESSION_JWT_TOKEN } from '@/utils/constants' ;
import { jwtDecode } from 'jwt-decode';

export async function importarUsuarios(toastMessage, toastColor, isToastOpen, file)
{
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Creamos un formData
  const formData = new FormData() ;

  // Agregamos el archivo al FormData
  formData.append("file", file) ; 

  try
  {
    // Hacemos la llamada al microservicio para importar usuarios
    const response = await fetch(firebaseApiUrl + '/firebase/imports/users',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`, // Agregamos el token JWT en el encabezado
      },
      body: formData // Enviamos el FormData que contiene el archivo
    }) ;

    // Verificamos si la respuesta del servidor fue correcta
    if (!response.ok)
    {
      const errorMessage = await response.text() ;

      // Creamos un toast con el mensaje de error
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage) ;

      // Lanzamos la excepción
      throw new Error(errorMessage || 'Error al importar usuarios') ;
    }

    // Creamos un toast con el mensaje de que todo ha ido bien
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Inserción realizada correctamente") ;
  }
  catch (error)
  {
    // Creamos un toast con el mensaje de error
    crearToast(toastMessage, toastColor, isToastOpen, "success", error.message) ;
    
    // Lanzamos el error
    throw error;
  }
}

export async function importarAplicaciones(toastMessage, toastColor, isToastOpen, file)
{
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Creamos un formData
  const formData = new FormData() ;

  // Agregamos el archivo al FormData
  formData.append("file", file) ; 

  try
  {
    // Hacemos la llamada al microservicio para importar usuarios
    const response = await fetch(firebaseApiUrl + '/firebase/imports/apps',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`, // Agregamos el token JWT en el encabezado
      },
      body: formData // Enviamos el FormData que contiene el archivo
    }) ;

    // Verificamos si la respuesta del servidor fue correcta
    if (!response.ok)
    {
      const errorMessage = await response.text() ;

      // Creamos un toast con el mensaje de error
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage) ;

      // Lanzamos la excepción
      throw new Error(errorMessage || 'Error al importar aplicaciones') ;
    }

    // Creamos un toast con el mensaje de que todo ha ido bien
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Inserción realizada correctamente") ;
  }
  catch (error)
  {
    // Creamos un toast con el mensaje de error
    crearToast(toastMessage, toastColor, isToastOpen, "success", error.message) ;
    
    // Lanzamos el error
    throw error;
  }
}

export async function validarRolesMenu(toastMessage, toastColor, isToastOpen)
{
  const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);

  return {
    mostrarAdmin: userRoles.includes('ADMINISTRADOR'),
    mostrarDireccion: userRoles.includes('DIRECCION'),
  };
}

export async function obtenerRolesUsuario(toastMessage, toastColor, isToastOpen)
{
  let jwtDecodificado = await obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen) ;

  // Obtenemos el array de roles
  return jwtDecodificado.roles || [] ;
}

export async function obtenerNombreYApellidosUsuario(toastMessage, toastColor, isToastOpen)
{
  let jwtDecodificado = await obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen) ;

  // Retornamos un objeto con las propiedades 'nombre' y 'apellidos'
  return {
    nombre: jwtDecodificado.nombre,
    apellidos: jwtDecodificado.apellidos
  };
}

export async function obtenerEmailUsuario(toastMessage, toastColor, isToastOpen)
{
  let jwtDecodificado = await obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen) ;

  // Retornamos un objeto con las propiedades 'nombre' y 'apellidos'
  return jwtDecodificado.email;
}

export async function obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen)
{
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  // Extraemos y decodificamos el payload (segunda parte del JWT)
  // El JWT tiene la forma: header.payload.signature
  // Queremos la parte del 'payload' (index 1)
    
  const base64Url = tokenPropio.split('.')[1];
  if (!base64Url)
  {
    let errorString = "JWT inválido: no se encontró el payload" ;

    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorString) ;
    throw new Error(errorString) ;
  }

  // Decodificamos correctamente usando TextDecoder para manejar UTF-8
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binaryData = atob(base64);
  const utf8Data = new TextDecoder('utf-8').decode(new Uint8Array([...binaryData].map(char => char.charCodeAt(0))));

  return JSON.parse(utf8Data);
}

export async function obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)
{
  // Recupera el JWT del almacenamiento de sesión
  let tokenPropio = sessionStorage.getItem(SESSION_JWT_TOKEN) ; 

  // Verifica si el token está presente o ha expirado
  if (!tokenPropio || tokenExpirado(tokenPropio))
  {
    // Obtiene un nuevo token si es necesario
    await obtenerTokenJwt(toastMessage, toastColor, isToastOpen) ;
    
    // Recupera el nuevo token
    tokenPropio = sessionStorage.getItem(SESSION_JWT_TOKEN) ;
  }

  // Devuelve el token válido
  return tokenPropio ;
}

/**
 * Esta función la pongo como privada
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen mensaje emergente se mostrará
 */
async function obtenerTokenJwt(toastMessage, toastColor, isToastOpen)
{
  const auth = getAuth() ;

  // Obtenemos el ID Token (JWT) del usuario autenticado (Google)
  const tokenGoogle = await auth.currentUser.getIdToken(true);

  // Realizamos una solicitud POST al servidor Spring Boot para obtener el JWT
  const response = await fetch(firebaseApiUrl + '/firebase/token/user', 
  {
      method: 'POST',
      headers:
      {
        'Authorization': `Bearer ${tokenGoogle}`,
        'Content-Type': 'application/json'
      }
  }) ;

  // Verificamos si la respuesta del servidor fue correcta
  if (!response.ok)
  {
    // Intentamos extraer el mensaje de error del servidor
    let errorMessage = 'El usuario no está dado de alta. ¿Estás seguro que lo hiciste con el dominio g.educaand.es?' ;

    // Intentamos obtener el cuerpo de la respuesta (suponiendo que es JSON)
    const errorData = await response.json();
    errorMessage = errorData.message || 'El usuario no está dado de alta. ¿Estás seguro que lo hiciste con el dominio g.educaand.es?';

    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage) ;
    throw new Error(errorMessage) ;
  }
  else
  {
    // Obtenemos de la respuesta el token propio
    const tokenPropio = await response.text() ;

    // Almacena el JWT en el almacenamiento de sesión
    sessionStorage.setItem(SESSION_JWT_TOKEN, tokenPropio) ;
  }
}

function tokenExpirado(token)
{
    // Decodificamos el token JWT
    const decoded = jwtDecode(token) ;

    // Tiempo actual en segundos
    const now = Math.floor(Date.now() / 1000) ;
    
    // Devolvemos true si expiró
    return decoded.exp < now ;
}

export async function obtenerInfoUsuarios(toastMessage, toastColor, isToastOpen)
{
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  return await fetch(firebaseApiUrl + '/firebase/queries/users',
  {
      method: 'GET',
      headers:
      {
          'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
      }
  }).then(res => res.json());
}

/******************************************************/
/** Funciones relacionadas con las notificaciones web */
/******************************************************/

/**
 * Crea una nueva notificación web.
 */
export async function crearNotificacionWeb(
  toastMessage,
  toastColor,
  isToastOpen,
  inputTexto,
  inputFechaInicio,
  inputHoraInicio,
  inputFechaFin,
  inputHoraFin,
  inputNivel,
  inputRoles,
  inputImagen
) {
  try {
    // ✅ Validaciones de campos obligatorios
    if (!inputTexto || String(inputTexto).trim() === "")
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ El campo 'Texto' es obligatorio");

    if (!inputFechaInicio)
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ La 'Fecha de inicio' es obligatoria");

    if (!inputHoraInicio)
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ La 'Hora de inicio' es obligatoria");

    if (!inputFechaFin)
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ La 'Fecha de fin' es obligatoria");

    if (!inputHoraFin)
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ La 'Hora de fin' es obligatoria");

    if (!inputNivel)
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ El 'Nivel' es obligatorio");

    if (!inputRoles || inputRoles.length === 0)
      return crearToast(toastMessage, toastColor, isToastOpen, "warning", "⚠️ Debes seleccionar al menos un 'Rol'");

    // ✅ Obtenemos token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // ✅ Envío al backend
    const response = await fetch(`${firebaseApiUrl}/notifications_web/crearNotificacionWeb`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        client_id: "app123",
        nombre: "MiAplicacionDePrueba",
        texto: inputTexto,
        fecha_inicio: inputFechaInicio,
        hora_inicio: inputHoraInicio,
        fecha_fin: inputFechaFin,
        hora_fin: inputHoraFin,
        nivel: inputNivel,
        roles: inputRoles,
        imagen: inputImagen || "",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage);
      throw new Error(errorMessage || "Error al crear notificación");
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "✅ Notificación creada correctamente");
  } catch (error) {
    console.error("❌ Error creando notificación:", error);
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Obtiene todas las notificaciones web almacenadas.
 */
export async function obtenerNotificacionesHoy(toastMessage, toastColor, isToastOpen, nivel, usuarioEmail) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${firebaseApiUrl}/notifications_web/obtenerNotificacionesHoy`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        usuario: usuarioEmail,
        nivel: nivel
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener notificaciones');
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return [];
    }

    return data;
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Elimina una notificación web por ID.
 */
export async function eliminarNotificacionWeb(toastMessage, toastColor, isToastOpen, id, usuarioEmail, nivel) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${firebaseApiUrl}/notifications_web/eliminarNotificacionWeb/${id}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`, 
        usuario: usuarioEmail,
        nivel: nivel}
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al eliminar notificación');
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Notificación eliminada");
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

