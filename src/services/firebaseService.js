import { getFirestore, doc, getDoc, getDocs, collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { crearToast } from '@/utils/toast.js';
import { firebaseColeccionUsuarios } from '@/environment/firebaseConfig';
import { guardarUserInfoEnSesion, guardarUserUidEnSesion } from '@/services/session' ;
import { getAuth } from "firebase/auth";
import { SESSION_JWT_TOKEN } from '@/utils/constants.js' ;
import { firebaseApiUrl } from '@/environment/apiUrls';
import { jwtDecode } from 'jwt-decode';

export async function validarUsuario(router, auth, toastMessage, toastColor, isToastOpen, userUid)
{
    const db      = getFirestore() ;
    const docRef  = doc(db, firebaseColeccionUsuarios, userUid) ;
    const docSnap = await getDoc(docRef) ;

    if (!docSnap.exists())
    {
        // Acceso denegado
        signOut(auth) ; // Cierra la sesión del usuario

        // Crear toast
        crearToast(toastMessage, toastColor, isToastOpen, "danger", "Contacta con el TDE para darte de alta") ;
    }
    else
    {
        // Obtenemos el usuario
        const usuario = docSnap.data() ;

        // Almacenamos en local el usuario
        guardarUserInfoEnSesion(usuario) ;

        // Almacenamos el UID en localStorage
        guardarUserUidEnSesion(userUid) ;

        // Obtenemos los roles
        const roles = usuario.roles ;

        // Validamos si contiene el de administrador
        if (roles.includes('ADMINISTRADOR'))
        {
            router.push({ name: 'AdminFirebase' }) ;
        }
        else
        {
            router.push({ name: 'PrintersPrint' }) ;
        }
    }
}

export async function validarRolesMenu(toastMessage, toastColor, isToastOpen, userUid)
{
  const db = getFirestore();
  const docRef = doc(db, firebaseColeccionUsuarios, userUid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists())
  {
    let errorString = "El usuario no tiene roles asignados o no existe" ;

    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, "danger", errorString) ;
    throw new Error(errorString) ;
  }

  const usuario = docSnap.data() ;
  const roles = usuario.roles || [] ;

  return {
    mostrarAdmin: roles.includes('ADMINISTRADOR'),
    mostrarDireccion: roles.includes('DIRECCION'),
  };
}

export async function obtenerUsuariosConRoles(toastMessage, toastColor, isToastOpen)
{
  const usuarios = [] ;
  
  try
  {
    const db            = getFirestore() ;
    const querySnapshot = await getDocs(collection(db, firebaseColeccionUsuarios)) ;
    
    querySnapshot.forEach((doc) =>
    {
      const data = doc.data() ;
      usuarios.push(
                    { 
                      uid: doc.id,
                      email: data.email,
                      roles: data.roles || [],  // Aseguramos que sea un array
                      nombreCompleto: data.nombre + " " + data.apellidos
                    }) ;
    }) ;
  }
  catch (error)
  {
      // Crear toast y lanzar excepción
      crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message) ;
      throw new Error(error.message) ;
  }

  return usuarios ;
}

export async function obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)
{
  // Recupera el JWT del almacenamiento de sesión
  let token = sessionStorage.getItem(SESSION_JWT_TOKEN) ; 

  // Verifica si el token está presente o ha expirado
  if (!token || tokenExpirado(token))
  {
    console.log('Token expirado o no encontrado, solicitando uno nuevo...') ;
    
    // Obtiene un nuevo token si es necesario
    await obtenerTokenJwt(toastMessage, toastColor, isToastOpen) ;
    
    // Recupera el nuevo token
    token = sessionStorage.getItem(SESSION_JWT_TOKEN) ;
  }

  // Devuelve el token válido
  return token ;
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

  try
  {
    const uid = auth.currentUser.uid ; // Obtiene el UID del usuario autenticado

    // Realizamos una solicitud POST al servidor Spring Boot para obtener el JWT
    const response = await fetch(firebaseApiUrl + '/firebase/getCustomToken', 
    {
      method: 'POST',
      headers: { 'uid': uid }    
    }) ;

    const token = await response.text() ;

    if (!token)
    {
      let errorString = "No has sido autenticado correctamente" ;

      // Crear toast y lanzar excepción
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorString) ;
      throw new Error(errorString) ;
    }

    console.log('JWT personalizado recibido:', token) ;

    // Almacena el JWT en el almacenamiento de sesión
    sessionStorage.setItem(SESSION_JWT_TOKEN, token) ;
  }
  catch (error)
  {
    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message) ;
    throw new Error(error.message) ;
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
