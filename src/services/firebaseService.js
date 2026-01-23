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

export async function obtenerDatosUsuarioSesion(toastMessage, toastColor, isToastOpen)
{
  const email = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
  const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);

  return {
    email,
    roles,
  };
}
