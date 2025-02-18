import { bookingsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const getDiasSemana = async (toastMessage, toastColor, isToastOpen) =>
  {
  try
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

    if (!response.ok)
    {
      throw new Error('No se ha cargado previamente ningun dato de los dias de la semana')
    }
    return await response.json()
  }
  catch (error)
  {
    console.log(error)
  }
}

export const getTramosHorarios = async (toastMessage, toastColor, isToastOpen) =>
  {
  try
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

    if (!response.ok)
    {
      throw new Error('No se ha cargado previamente ningun horario')
    }
    return await response.json()
  }
  catch (error)
  {
    console.log(error)
  }
}

export const postRecurso = async(toastMessage, toastColor, isToastOpen, recurso, cantidad, esCompartible) =>
{
  try
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
    return response
  }
  catch (error)
  {
    console.log('Error al crear el recurso');
  }
}

//obtener reserva a partir de un recurso
export const getRecursos = async (toastMessage, toastColor, isToastOpen) =>
  {
  try
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
    
    if (!response.ok)
    {
      throw new Error('No se ha cargado previamente ningun recurso')
    }
    return await response.json()
  }
  catch (error)
  {
    console.log(error)
  }
}

export const getRecursosCompartible = async (toastMessage, toastColor, isToastOpen, esCompartible) =>
  {
  try
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
    
    if (!response.ok)
    {
      throw new Error('No se ha cargado previamente ningun recurso')
    }
    return await response.json()
  }
  catch (error)
  {
    console.log(error)
  }
}

export const deleteRecurso = async(toastMessage, toastColor, isToastOpen, recurso) =>
{
  try
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
    
    if (!response.ok)
    {
      throw new Error('No se ha cargado previamente ningun recurso')
    }

  }
  catch (error)
  {
    console.log(error)
  }
}

export const postReserva = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario, nAlumnos) =>
  {
  try
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
      },
    })

    if (!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }
    return await response.json()
  }
  catch (error)
  {
    console.log();
  }
}

export const getReservas = async (toastMessage, toastColor, isToastOpen, recurso) =>
  {
  try
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
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }
    const data = await response.json()    
    return data
  }
  catch (error)
  {
    console.error('Error al obtener las reservas:', error)
    throw error
  }
}

export const deleteReserva = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario) =>
  {
  try
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

      if (!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
    }
    catch (error)
    {
      console.error('Error al eliminar la reserva:', error)
      throw error
    }
  }

export const getProfesores = async (toastMessage, toastColor, isToastOpen) =>
  {
  try
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    const response = await fetch(firebaseApiUrl + '/firebase/queries/users', {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    })

    if (!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }
    return await response.json()
  }
  catch (error)
  {
    console.error('Error al devolver los profesores:', error)
    throw error
  }
}


export const postReservaTemporary = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario, nAlumnos, numSemana) =>
  {
  try
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
      },
    })

    if (!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }
    return await response.json()
  }
  catch (error)
  {
    console.log();
  }
}

export const getReservasTemporary = async (toastMessage, toastColor, isToastOpen, recurso, numSemana) =>
  {
  try
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
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }
    const data = await response.json()    
    return data
  }
  catch (error)
  {
    console.error('Error al obtener las reservas:', error)
    throw error
  }
}

export const deleteReservaTemporary = async (toastMessage, toastColor, isToastOpen, email, recurso, diaDeLaSemana, tramoHorario, numSemana) =>
  {
  try
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
        },
      })

      if (!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
    }
    catch (error)
    {
      console.error('Error al eliminar la reserva:', error)
      throw error
    }
  }