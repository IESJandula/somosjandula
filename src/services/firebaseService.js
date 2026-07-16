import { adminApiUrl } from '@/environment/apiUrls';
import { crearToast } from '@/utils/toast.js';
import { getAuth } from "firebase/auth";
import { SESSION_JWT_TOKEN } from '@/utils/constants';
import { jwtDecode } from 'jwt-decode';

export async function importarUsuarios(toastMessage, toastColor, isToastOpen, file) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Creamos un formData
  const formData = new FormData();

  // Agregamos el archivo al FormData
  formData.append("file", file);

  try {
    // Hacemos la llamada al microservicio para importar usuarios
    const response = await fetch(adminApiUrl + '/admin/imports/users',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`, // Agregamos el token JWT en el encabezado
        },
        body: formData // Enviamos el FormData que contiene el archivo
      });

    // Verificamos si la respuesta del servidor fue correcta
    if (!response.ok) {
      const errorMessage = await response.text();

      // Creamos un toast con el mensaje de error
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage);

      // Lanzamos la excepción
      throw new Error(errorMessage || 'Error al importar usuarios');
    }

    // Creamos un toast con el mensaje de que todo ha ido bien
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Inserción realizada correctamente");
  }
  catch (error) {
    // Creamos un toast con el mensaje de error
    crearToast(toastMessage, toastColor, isToastOpen, "success", error.message);

    // Lanzamos el error
    throw error;
  }
}

export async function importarAplicaciones(toastMessage, toastColor, isToastOpen, file) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Creamos un formData
  const formData = new FormData();

  // Agregamos el archivo al FormData
  formData.append("file", file);

  try {
    // Hacemos la llamada al microservicio para importar usuarios
    const response = await fetch(adminApiUrl + '/admin/imports/apps',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`, // Agregamos el token JWT en el encabezado
        },
        body: formData // Enviamos el FormData que contiene el archivo
      });

    // Verificamos si la respuesta del servidor fue correcta
    if (!response.ok) {
      const errorMessage = await response.text();

      // Creamos un toast con el mensaje de error
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage);

      // Lanzamos la excepción
      throw new Error(errorMessage || 'Error al importar aplicaciones');
    }

    // Creamos un toast con el mensaje de que todo ha ido bien
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Inserción realizada correctamente");
  }
  catch (error) {
    // Creamos un toast con el mensaje de error
    crearToast(toastMessage, toastColor, isToastOpen, "success", error.message);

    // Lanzamos el error
    throw error;
  }
}

export async function validarRolesMenu(toastMessage, toastColor, isToastOpen) {
  const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);

  return {
    mostrarAdmin: userRoles.includes('ADMINISTRADOR'),
    mostrarDireccion: userRoles.includes('DIRECCION'),
    mostrarDepartamentoInformatica: userRoles.includes('DEPARTAMENTO_INFORMATICA'),
  };
}

export async function obtenerRolesUsuario(toastMessage, toastColor, isToastOpen) {
  let jwtDecodificado = await obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen);

  // Obtenemos el array de roles
  return jwtDecodificado.roles || [];
}

export async function obtenerNombreYApellidosUsuario(toastMessage, toastColor, isToastOpen) {
  let jwtDecodificado = await obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen);

  // Retornamos un objeto con las propiedades 'nombre' y 'apellidos'
  return {
    nombre: jwtDecodificado.nombre,
    apellidos: jwtDecodificado.apellidos
  };
}

export async function obtenerEmailUsuario(toastMessage, toastColor, isToastOpen) {
  let jwtDecodificado = await obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen);

  // Retornamos un objeto con las propiedades 'nombre' y 'apellidos'
  return jwtDecodificado.email;
}

export async function obtenerJwtDecodificado(toastMessage, toastColor, isToastOpen) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Extraemos y decodificamos el payload (segunda parte del JWT)
  // El JWT tiene la forma: header.payload.signature
  // Queremos la parte del 'payload' (index 1)

  const base64Url = tokenPropio.split('.')[1];
  if (!base64Url) {
    let errorString = "JWT inválido: no se encontró el payload";

    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorString);
    throw new Error(errorString);
  }

  // Decodificamos correctamente usando TextDecoder para manejar UTF-8
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binaryData = atob(base64);
  const utf8Data = new TextDecoder('utf-8').decode(new Uint8Array([...binaryData].map(char => char.charCodeAt(0))));

  return JSON.parse(utf8Data);
}

export async function obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) {
  // Recupera el JWT del almacenamiento de sesión
  let tokenPropio = sessionStorage.getItem(SESSION_JWT_TOKEN);

  // Verifica si el token está presente o ha expirado
  if (!tokenPropio || tokenExpirado(tokenPropio)) {
    // Obtiene un nuevo token si es necesario
    await obtenerTokenJwt(toastMessage, toastColor, isToastOpen);

    // Recupera el nuevo token
    tokenPropio = sessionStorage.getItem(SESSION_JWT_TOKEN);
  }

  // Devuelve el token válido
  return tokenPropio;
}

/**
 * Esta función la pongo como privada
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen mensaje emergente se mostrará
 */
async function obtenerTokenJwt(toastMessage, toastColor, isToastOpen) {
  const auth = getAuth();

  // si no está logueado
  if (!auth.currentUser) {

    // Guardamos la URL actual (ej: /ia?query=hola)
    localStorage.setItem("redirectAfterLogin", window.location.href)

    // REDIRIGIR AL LOGIN
    window.location.href = "/login"

    // Lanzamos error para cortar ejecución
    throw new Error("Usuario no autenticado")
  }

  // Obtenemos el ID Token (JWT) del usuario autenticado (Google)
  const tokenGoogle = await auth.currentUser.getIdToken(true);

  // Realizamos una solicitud POST al servidor Spring Boot para obtener el JWT
  const response = await fetch(adminApiUrl + '/admin/token/user',
    {
      method: 'POST',
      headers:
      {
        'Authorization': `Bearer ${tokenGoogle}`,
        'Content-Type': 'application/json'
      }
    });

  // Verificamos si la respuesta del servidor fue correcta
  if (!response.ok) {
    // Intentamos extraer el mensaje de error del servidor
    let errorMessage = 'El usuario no está dado de alta. ¿Estás seguro que lo hiciste con el dominio g.educaand.es?';

    // Intentamos obtener el cuerpo de la respuesta (suponiendo que es JSON)
    const errorData = await response.json();
    errorMessage = errorData.message || 'El usuario no está dado de alta. ¿Estás seguro que lo hiciste con el dominio g.educaand.es?';

    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage);
    throw new Error(errorMessage);
  }
  else {
    // Obtenemos de la respuesta el token propio
    const tokenPropio = await response.text();

    // Almacena el JWT en el almacenamiento de sesión
    sessionStorage.setItem(SESSION_JWT_TOKEN, tokenPropio);
  }
}

function tokenExpirado(token) {
  // Decodificamos el token JWT
  const decoded = jwtDecode(token);

  // Tiempo actual en segundos
  const now = Math.floor(Date.now() / 1000);

  // Devolvemos true si expiró
  return decoded.exp < now;
}

export async function obtenerInfoUsuarios(toastMessage, toastColor, isToastOpen) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(adminApiUrl + '/admin/queries/users',
    {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
      }
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al obtener los usuarios');
    throw new Error(errorMessage || 'Error al obtener los usuarios');
  }

  return await response.json();
}

/**
 * Obtiene el listado de aplicaciones registradas desde Reaktor_AdminServer (GET /admin/queries/apps).
 * El curso académico se resuelve en el servidor si no se envía cabecera.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @returns {Promise<Array<{clientId: string, cursoAcademico: string, nombre: string, roles: string[]}>>} lista de apps
 */
export async function obtenerInfoApps(toastMessage, toastColor, isToastOpen) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(adminApiUrl + '/admin/queries/apps',
    {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
      }
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al obtener las aplicaciones');
    throw new Error(errorMessage || 'Error al obtener las aplicaciones');
  }

  return await response.json();
}

/**
 * Crea o actualiza (upsert) un usuario en Reaktor_AdminServer (POST /admin/save/users).
 * La clave es el email; el curso académico se resuelve en el servidor si no se envía.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @param {{email: string, nombre?: string, apellidos?: string, departamento?: string, fechaNacimiento?: string, roles?: string[]}} usuario usuario a guardar
 * @returns {Promise<Response>} la respuesta del servidor
 */
export async function guardarUsuario(toastMessage, toastColor, isToastOpen, usuario) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(adminApiUrl + '/admin/save/users',
    {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPropio}`
      },
      body: JSON.stringify(usuario)
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al guardar el usuario');
    throw new Error(errorMessage || 'Error al guardar el usuario');
  }

  return response;
}

/**
 * Crea o actualiza (upsert) una aplicación en Reaktor_AdminServer (POST /admin/save/apps).
 * La clave es el clientId; el curso académico se resuelve en el servidor si no se envía.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @param {{clientId: string, nombre?: string, roles?: string[]}} app aplicación a guardar
 * @returns {Promise<Response>} la respuesta del servidor
 */
export async function guardarApp(toastMessage, toastColor, isToastOpen, app) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(adminApiUrl + '/admin/save/apps',
    {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPropio}`
      },
      body: JSON.stringify(app)
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al guardar la aplicación');
    throw new Error(errorMessage || 'Error al guardar la aplicación');
  }

  return response;
}

/**
 * Borra un usuario en Reaktor_AdminServer (DELETE /admin/save/users). La clave es el email.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @param {string} email email del usuario a borrar
 * @returns {Promise<Response>} la respuesta del servidor
 */
export async function borrarUsuario(toastMessage, toastColor, isToastOpen, email) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // SEGURIDAD: el curso académico NO se envía; el servidor lo resuelve desde la constante del curso actual
  const headers = {
    'Authorization': `Bearer ${tokenPropio}`,
    'email': email
  };

  const response = await fetch(adminApiUrl + '/admin/save/users',
    {
      method: 'DELETE',
      headers: headers
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al borrar el usuario');
    throw new Error(errorMessage || 'Error al borrar el usuario');
  }

  return response;
}

/**
 * Borra una aplicación en Reaktor_AdminServer (DELETE /admin/save/apps). La clave es el clientId.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @param {string} clientId clientId de la aplicación a borrar
 * @returns {Promise<Response>} la respuesta del servidor
 */
export async function borrarApp(toastMessage, toastColor, isToastOpen, clientId) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // SEGURIDAD: el curso académico NO se envía; el servidor lo resuelve desde la constante del curso actual
  const headers = {
    'Authorization': `Bearer ${tokenPropio}`,
    'clientId': clientId
  };

  const response = await fetch(adminApiUrl + '/admin/save/apps',
    {
      method: 'DELETE',
      headers: headers
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al borrar la aplicación');
    throw new Error(errorMessage || 'Error al borrar la aplicación');
  }

  return response;
}

export async function obtenerDatosUsuarioSesion(toastMessage, toastColor, isToastOpen) {
  const email = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
  const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);

  return {
    email,
    roles,
  };
}

/**
 * Obtiene las constantes de configuración desde Reaktor_AdminServer (ruta base /admin/constants).
 *
 * Las cabeceras 'proyecto' y 'clave' son OPCIONALES y permiten filtrar el resultado:
 *  - proyecto + clave -> devuelve esa constante concreta (lista de 0 o 1 elemento).
 *  - solo proyecto     -> devuelve todas las constantes de ese proyecto.
 *  - sin ninguna       -> devuelve todas las constantes de todos los proyectos.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @param {string} [proyecto] nombre del proyecto/microservicio (p.ej. 'printers', 'bookings', 'schoolManager', 'notifications')
 * @param {string} [clave] ruta completa con puntos (p.ej. 'printers.impresionDeshabilitada')
 * @returns {Promise<Array<{proyecto: string, clave: string, valor: string}>>} lista de constantes
 */
export async function obtenerConstantes(toastMessage, toastColor, isToastOpen, proyecto, clave) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Construimos las cabeceras. 'proyecto' y 'clave' son opcionales.
  const headers = {
    'Authorization': `Bearer ${tokenPropio}`
  };

  if (proyecto) {
    headers['proyecto'] = proyecto;
  }

  if (clave) {
    headers['clave'] = clave;
  }

  const response = await fetch(adminApiUrl + '/admin/constants',
    {
      method: 'GET',
      headers: headers
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al obtener las constantes');
    throw new Error(errorMessage || 'Error al obtener las constantes');
  }

  return await response.json();
}

/**
 * Actualiza (upsert) el valor de UNA constante en Reaktor_AdminServer.
 *
 * El cuerpo de la petición es un ÚNICO objeto { proyecto, clave, valor }. El backend hace upsert por la
 * clave primaria compuesta (proyecto + clave): si la constante existe se sobreescribe su valor y, si no, se crea.
 *
 * @param {*} toastMessage mensaje emergente
 * @param {*} toastColor color del mensaje emergente
 * @param {*} isToastOpen si el mensaje emergente se mostrará
 * @param {{proyecto: string, clave: string, valor: string}} constante constante a actualizar
 * @returns {Promise<Response>} la respuesta del servidor
 */
export async function actualizarConstante(toastMessage, toastColor, isToastOpen, constante) {
  let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(adminApiUrl + '/admin/constants',
    {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPropio}`
      },
      body: JSON.stringify(constante)
    });

  if (!response.ok) {
    const errorMessage = await response.text();
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al actualizar la constante');
    throw new Error(errorMessage || 'Error al actualizar la constante');
  }

  return response;
}
