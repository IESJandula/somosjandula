import { bookingsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const getDiasSemana = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/days_week',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const getTramosHorarios = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/timeslots',
    {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const postRecurso = async(toastMessage, toastColor, isToastOpen, recurso, cantidad, esCompartible) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(bookingsApiUrl + '/bookings/admin/resources',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      recurso: recurso,
      cantidad: cantidad,
      esCompartible: esCompartible
    }
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response
}


//obtener reserva a partir de un recurso
export const getRecursos = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/resources',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    }
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const getRecursosCompartible = async (toastMessage, toastColor, isToastOpen, esCompartible) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/resourcesCompartible',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      esCompartible: esCompartible
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const comprobarEliminacion = async (toastMessage, toastColor, isToastOpen, recurso) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/admin/checkDelete',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      recurso: recurso
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const deleteRecurso = async(toastMessage, toastColor, isToastOpen, recurso) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/admin/resources',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      recurso: recurso
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const deleteRecursoReserva = async(toastMessage, toastColor, isToastOpen, recurso) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/admin/resources/bookings',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      recurso: recurso
    },
  })

  if (!response.ok)
  {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const postReserva = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario, nAlumnos, motivoCurso) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/bookings',
    {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      email: email,
      recurso: recurso,
      diaDeLaSemana: diaDeLaSemana,
      tramosHorarios: tramoHorario,
      nAlumnos: nAlumnos,
      motivoCurso: motivoCurso
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const getReservas = async (toastMessage, toastColor, isToastOpen, recurso) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/bookings',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      aulaYCarritos: recurso,
    },
  })

  if (!response.ok)
  {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const deleteReserva = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/fixed/bookings', {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      email: email,
      recurso: recurso,
      diaDeLaSemana: diaDeLaSemana,
      tramoHorario: tramoHorario,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const getProfesores = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(firebaseApiUrl + '/firebase/queries/users', {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}


export const postReservaTemporary = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario, nAlumnos, numSemana, esSemanal, motivoCurso) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/temporary/bookings',
      {
      method: 'POST',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
        email: email,
        recurso: recurso,
        diaDeLaSemana: diaDeLaSemana,
        tramosHorarios: tramoHorario,
        nAlumnos: nAlumnos,
        numSemana: numSemana,
        esSemanal: esSemanal,
        motivoCurso: motivoCurso
      }
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const getReservasTemporary = async (toastMessage, toastColor, isToastOpen, recurso, numSemana) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/temporary/bookings',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      aulaYCarritos: recurso,
      numSemana: numSemana,
    },
  })

  if (!response.ok)
  {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const deleteReservaTemporary = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario, numSemana, esSemanal) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/temporary/bookings', {
        method: 'DELETE',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          email: email,
          recurso: recurso,
          diaDeLaSemana: diaDeLaSemana,
          tramoHorario: tramoHorario,
          numSemana: numSemana,
          esSemanal: esSemanal
        },
      })

  if (!response.ok)
  {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const getCantMaxResource = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(bookingsApiUrl + '/bookings/admin/resources/cantMax',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const getCheckAvailable = async (toastMessage, toastColor, isToastOpen,diaDeLaSemana,recurso,tramoHorario,numAlumnos,semanas) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/temporary/bookings/available',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'diaDeLaSemana': diaDeLaSemana,
      'recurso': recurso,
      'tramoHorario': tramoHorario,
      'numAlumnos': numAlumnos,
      'semanas': semanas
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const modifyResourceLock = async (toastMessage, toastColor, isToastOpen, recurso, bloqueado) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/admin/resources',
    {
    method: 'PUT',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      recurso: recurso,
      bloqueado: bloqueado,
    }
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const getPaginatedLogs = async (toastMessage, toastColor, isToastOpen, pagina) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(bookingsApiUrl + '/bookings/admin/logs',
    {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      pagina: pagina
    }
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}
