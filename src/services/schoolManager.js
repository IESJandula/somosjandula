import {schoolmanagerApiUrl} from '@/environment/apiUrls';
import {obtenerTokenJWTValido} from '@/services/firebaseService';

/****************************** Ventana X Common ******************************/
export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/common/cursoEtapa', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    }
    catch (error)
    {
      console.log('No se pudieron cargar los cursos y etapas: ', error);
    }
}

export const obtenerProfesores = async (toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/common/profesores',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al obtener los profesores: ', error);
    }
  }

export const asignarReducciones = async (email, reduccion, horas, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/common/asignarReducciones',
          {
            method: 'POST',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'email': email,
                  'reduccion': reduccion,
                  'horas': horas
                },
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }

    }
    catch (error)
    {
      console.log('Error al asignar la reduccion: ', error);
    }
  }

/****************************** Ventana 1 CargarMatriculas ******************************/
export const subirFicheros = async (file, curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    if (!file) 
    {
      return;
    }
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
       
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': parseInt(curso,10),
          'etapa': etapa,
        },
        body: file
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
      }
    }
    catch (error)
    {
      console.log('Error al cargar el fichero de matrículas: ', error);
    }
}

export const obtenerCursosCargados = async (toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`
  
                }
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al cargar grupos: ', error);
    }
  }

export const borrarMatriculas = async (curso, etapa, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
          {
            method: 'DELETE',
            headers:
                {
                  'curso': curso,
                  'etapa': etapa,
                  'Authorization': `Bearer ${tokenPropio}`
                },
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
  
    }
    catch (error)
    {
      console.log('Error al borrar los grupos: ', error);
    }
  }

export const obtenerDatosMatriculas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': curso,
          'etapa': etapa,
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      console.log(response.json)
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al cargar los datos de las matriculas: ', error);
    }
  }

export const matricularAsignaturasCsv = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
      {
        method: 'PUT',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombre': nombre,
          'apellidos': apellidos,
          'asignatura': asignatura,
          'curso': curso,
          'etapa': etapa,
          'estado': estado
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      
    }
    catch (error)
    {
      console.log('Error al matricular asignaturas: ', error);
    }
  }

export const matricularAlumnosCsv = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombre': nombre,
          'apellidos': apellidos,
          'asignatura': asignatura,
          'curso': curso,
          'etapa': etapa,
          'estado': estado
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      
    }
    catch (error)
    {
      console.log('Error al matricular el alumno: ', error);
    }
  }

  export const desmatricularAlumnosCsv = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
      {
        method: 'DELETE',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombre': nombre,
          'apellidos': apellidos,
          'asignatura': asignatura,
          'curso': curso,
          'etapa': etapa,
          'estado': estado
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      
    }
    catch (error)
    {
      console.log('Error al desmatricular el alumno: ', error);
    }
  }

/****************************** Ventana 2 AsignaturasYBloques ******************************/

export const cargarAsignaturas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/asignaturas', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': curso,
          'etapa': etapa,
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al cargar las asignaturas: ', error);
    }
}

export const crearBloques = async (curso, etapa, asignaturas, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const queryParams = new URLSearchParams({
        curso,
        etapa,
        asignaturas 
      }).toString();

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/bloques?' + queryParams, 
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json'
        },
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      
    }
    catch (error)
    {
      console.log('Error al crear el bloque: ', error);
    }
}


export const eliminarBloques = async (curso, etapa, nombre, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/bloques', 
      {
        method: 'DELETE',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
          'curso': curso,
          'etapa': etapa,
          'nombre': nombre
        },
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
    }
    catch (error)
    {
      console.log('Error al eliminar el bloque: ', error);
    }
}
export const mostrarHoras = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/horas', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
          'curso': curso,
          'etapa': etapa
        },
      });

      if(!response.ok) 
        {
          throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
        }
        
        return await response.json();
    }
    catch (error)
    {
      console.log('Error al cargar las horas', error);
    }
}
export const asignarHoras = async (curso, etapa, nombreAsignatura, horas, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/horas', 
      {
        method: 'PUT',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
          'curso': curso,
          'etapa': etapa,
          'nombreAsignatura': nombreAsignatura,
          'horas': horas
        },
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
    }
    catch (error)
    {
      console.log('Error al asignar las horas: ', error);
    }
}

/****************************** Ventana 3 CrearGrupos ******************************/
  
export const crearNuevosGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
{
    try
    {
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/grupos', 
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa
        },
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return response;
    }
    catch (error)
    {
      console.log('Error al crear grupo: ', error);
    }
}
export const obtenerInfoGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      if (!curso || etapa === '') {
        throw new Error('Curso o etapa inválidos');
      }
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/grupos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa
        },
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al cargar grupos: ', error);
    }
}
export const obtenerAlumnosConGrupos = async (curso, etapa, grupo, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      if (!curso || !etapa || !grupo) {
        throw new Error('Curso, etapa o grupo inválidos');
      }
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa,
          'grupo': grupo
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al cargar alumnos: ', error);
    }
}
export const obtenerAlumnosSinGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      if (!curso || !etapa) {
        throw new Error('Curso, etapa o grupo inválidos');
      }
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnosTotales', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa,
        },
        
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al cargar alumnos sin grupo: ', error);
    }
}
export const asignarAlumnos = async (curso, etapa, grupo, alumnosSeleccionados, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
      {
        method: 'POST',
        headers: 
        {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa,
          'grupo': grupo,
        },
        body: JSON.stringify(alumnosSeleccionados)
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al asignar alumnos: ', error);
    }
}

export const borrarAlumnos = async (alumno, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
      {
        method: 'DELETE',
        headers: 
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenPropio}`
        },
        body: JSON.stringify(alumno)
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al borrar el alumno: ', error);
    }
}

export const actualizarTurnoHorario = async (curso, etapa, grupo, esHorarioMatutino, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/turnoHorario', 
      {
        method: 'POST',
        headers: 
        {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa,
          'grupo': grupo,
          'esHorarioMatutino': esHorarioMatutino
        },
      });
      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log('Error al asignar el turno horario: ', error);
    }
}

/****************************** Ventana 4 TablaResumen ******************************/
export const cargarAsignaturasUnicas = async (curso, etapa, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/resumenAsignaturas/asignaturasUnicas',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'curso': curso,
                  'etapa': etapa,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al cargar asignaturas: ', error);
    }
  }

export const obtenerNumAlumnosAsignatura = async (curso, etapa, grupo, asignatura, toastMessage, toastColor, isToastOpen) => 
  {
    try 
    {
      // Se obtiene un token válido
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response =  await fetch(schoolmanagerApiUrl + '/schoolManager/resumenAsignaturas/numeroAlumnosEnAsignatura', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': curso,
          'etapa': etapa,
          'grupo': grupo,
          'asignatura': asignatura
        },
      })
      return await response.json();
    } catch (error) {
      throw new Error(`Error al obtener alumnos para ${asignatura} - Grupo ${grupo}`);
    }
  }

/****************************** Ventana 5 AsignaturasYDepartamentos ******************************/
export const obtenerDepartamentos = async (toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/departamentos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
    }
    catch (error)
    {
      console.log('No se ha podido cargar los departamentos: ', error);
    }
}

export const asignarProfesoresADepartamentos = async (nombre, plantilla, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const queryParams = new URLSearchParams({
        nombre,
        plantilla
      }).toString();

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/departamentos?' + queryParams, 
      {
        method: 'PUT',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }

    }
    catch (error)
    {
      console.log('No se pudieron asignar los profesores al departamento: ', error);
    }
}
export const obtenerDatosDepartamentosConAsignaturas = async (toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas/infoDepartamentos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });

      if(!response.ok) 
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
    }
    catch (error)
    {
      console.log('No se ha podido obtener los tados de los departamentos con sus asignaturas asignadas: ', error);
    }
}
export const obtenerCursosEtapasGrupos = async (toastMessage, toastColor, isToastOpen) =>
{
  try
  {

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/curso',
        {
          method: 'GET',
          headers:
              {
                'Authorization': `Bearer ${tokenPropio}`
              },

        });
    if(!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }

    return await response.json();

  }
  catch (error)
  {
    console.log('Error al cargar la lista de cursos: ', error);
  }
}

export const obtenerAsignaturasPorCursoEtapaGrupo = async (curso, etapa, grupo, toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const url = new URL(
        schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturasPorCursoEtapaGrupo'
    );
    url.searchParams.append('curso', curso);
    url.searchParams.append('etapa', etapa);
    url.searchParams.append('grupo', grupo);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }

    return await response.json();
  } catch (error) 
  {
    console.error('Error al cargar la lista de asignaturas por curso, etapa y grupo: ', error);
  }
}

export const obtenerTodasLasAsignaturas = async (toastMessage, toastColor, isToastOpen) =>
{
  try
  {

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas',
        {
          method: 'GET',
          headers:
              {
                'Authorization': `Bearer ${tokenPropio}`
              },

        });
    if(!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }

    return await response.json();

  }
  catch (error)
  {
    console.log('Error al cargar la lista de asignaturas: ', error);
  }
}

export const quitarAsignaturasDeDepartamentos = async (curso, etapa, grupo, nombre, toastMessage, toastColor, isToastOpen) =>
{
  try
  {
    const cursoInt = parseInt(curso, 10);
    const url = new URL(
        schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas/quitarDepartamentos'
    );
    url.searchParams.append('curso', cursoInt);
    url.searchParams.append('etapa', etapa);
    url.searchParams.append('grupo', grupo);
    url.searchParams.append('nombre', nombre);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(url.toString(),
        {
          method: 'PATCH',
          headers:
              {
                'Authorization': `Bearer ${tokenPropio}`
              },

        });
    if(!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }

  }
  catch (error)
  {
    console.log('Error al eliminar la asignatura de los departamentos: ', error);
  }
}

export const asignarAsignaturasADepartamentos = async (curso, etapa, grupo, nombre, departamentoPropietario, departamentoReceptor, toastMessage, toastColor, isToastOpen) =>
{
  try
  {
    const cursoInt = parseInt(curso, 10);
    const url = new URL(
        schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas/asignarDepartamentos'
    );
    url.searchParams.append('curso', cursoInt);
    url.searchParams.append('etapa', etapa);
    url.searchParams.append('grupo', grupo);
    url.searchParams.append('nombre', nombre);
    url.searchParams.append('departamentoPropietario', departamentoPropietario);
    url.searchParams.append('departamentoReceptor', departamentoReceptor);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(url.toString(),
        {
          method: 'PATCH',
          headers:
              {
                'Authorization': `Bearer ${tokenPropio}`
              },

        });
    if(!response.ok)
    {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
    }


  }
  catch (error)
  {
    console.log('Error al asignar la asignatura de los departamentos: ', error);
  }
}

/****************************** Ventana 6 Reducciones ******************************/
export const cargarReducciones = async (toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/reducciones',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al cargar las reducciones: ', error);
    }
  }

export const crearReducciones = async (nombre, horas, decideDireccion, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/reducciones',
          {
            method: 'POST',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'nombre': nombre,
                  'horas': horas,
                  'decideDireccion': decideDireccion
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }

    }
    catch (error)
    {
      console.log('Error al crear la reduccion: ', error);
    }
  }

export const borrarReducciones = async (nombre, horas, decideDireccion, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/reducciones',
          {
            method: 'DELETE',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'nombre': nombre,
                  'horas': horas,
                  'decideDireccion': decideDireccion
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
  
    }
    catch (error)
    {
      console.log('Error al borrar la reduccion: ', error);
    }
  }

export const obtenerReduccionesProfesores = async (toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/asignarReducciones',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al obtener las reducciones asignadas: ', error);
    }
  }

export const borrarReduccionesProfesores = async (email, reduccion, horas, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/asignarReducciones',
          {
            method: 'DELETE',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'email': email,
                  'reduccion': reduccion,
                  'horas': horas
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
  
    }
    catch (error)
    {
      console.log('Error al borrar la reduccion asignada: ', error);
    }
  }

/****************************** Eleccion de horarios ******************************/
export const obtenerAsignaturas = async (toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/asignaturas',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
  
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al cargar la lista de asignaturas: ', error);
    }
  }
  
export const obtenerGruposDeAsignaturas = async (nombreAsignatura, horaAsignatura, curso, etapa, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
      const cursoInt = parseInt(curso, 10);
      const horasInt = parseInt(horaAsignatura, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/gruposAsignaturas',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'nombreAsignatura': nombreAsignatura,
                  'horaAsignatura': horasInt,
                  'curso': cursoInt,
                  'etapa': etapa,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
  
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al cargar la lista de asignaturas: ', error);
    }
  }
  
export const obtenerReducciones = async (toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/reduccion',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al obtener las reducciones asignadas: ', error);
    }
  }
  
export const asignarAsignatura = async (nombre, horas, curso, etapa, grupo, email, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
      const cursoInt = parseInt(curso, 10);
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/asignaturas',
          {
            method: 'POST',
            headers:
                {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokenPropio}`,
                  'nombre': nombre,
                  'horas': horas,
                  'curso': cursoInt,
                  'etapa': etapa,
                  'grupo': grupo,
                  'email': email,
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al obtener las reducciones asignadas: ', error);
    }
  }

export const obtenerSolicitudes = async (email, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
          {
            method: 'GET',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'email': email
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al obtener las reducciones asignadas: ', error);
    }
  }

export const eliminarSolicitudes = async (data, toastMessage, toastColor, isToastOpen) =>
  {
    try
    {
  
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
          {
            method: 'DELETE',
            headers:
                {
                  'Authorization': `Bearer ${tokenPropio}`,
                  'email': data.email,
                  'nombreAsignatura': data.nombreAsignatura || '',
                  'horasAsignatura': data.horasAsignatura || '',
                  'curso': data.curso || '',
                  'etapa': data.etapa || '',
                  'grupo': data.grupo || '',
                  'nombreReduccion': data.nombreReduccion || '',
                  'horasReduccion': data.horasReduccion || ''
                },
  
          });
      if(!response.ok)
      {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`)
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log('Error al obtener las reducciones asignadas: ', error);
    }
  }

/****************************** Generador de Horarios ******************************/
export const lanzarGeneradorHorarios = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/generadorHorarios/lanzar',
    {
      method: 'GET',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
          },
    });
  }

export const forzarDetencionGeneradorHorarios = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/generadorHorarios/forzarDetencion',
    {
      method: 'POST',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
          },
    });
  }