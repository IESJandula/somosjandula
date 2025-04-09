import {schoolmanagerApiUrl} from '@/environment/apiUrls';
import {obtenerTokenJWTValido} from '@/services/firebaseService';

/****************************** Ventana 1 CargarMatriculas ******************************/

export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/cursoEtapa', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });

      if(!response.ok) 
      {
        throw new Error('No se pudieron cargar los cursos y etapas');
      }
      return await response.json();
    }
    catch (error)
    {
      console.log(error);
    }
}
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
        throw new Error('Error al cargar el fichero de matrículas');
      }
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar grupos');
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar grupos');
      }
  
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      console.log(response.json)
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al crear el bloque.');
      }
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al eliminar el bloque.');
      }
    }
    catch (error)
    {
      console.log(error);
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
          throw new Error('Error al eliminar el bloque.');
        }
        
        return await response.json();
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al eliminar el bloque.');
      }
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al crear grupo');
      }
      return response;
    }
    catch (error)
    {
      console.log(error);
    }
}
export const obtenerGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
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
        throw new Error('Error al cargar grupos');
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar alumnos');
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar alumnos');
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al enviar alumnos');
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al borrar el alumno');
      }
      return await response.json();
      
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('No se pudieron cargar los cursos y etapas');
      }
      return await response.json();
    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('No se pudieron cargar los cursos y etapas');
      }

    }
    catch (error)
    {
      console.log(error);
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
        throw new Error('No se pudieron cargar los cursos y etapas');
      }
      return await response.json();
    }
    catch (error)
    {
      console.log(error);
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
      throw new Error('Error al cargar la lista de cursos. Inténtelo de nuevo');
    }

    return await response.json();

  }
  catch (error)
  {
    console.log(error);
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
      throw new Error('Error al cargar la lista de asignaturas. Inténtelo de nuevo');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
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
      throw new Error('Error al cargar la lista de asignaturas. Inténtelo de nuevo');
    }

    return await response.json();

  }
  catch (error)
  {
    console.log(error);
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
      throw new Error('Error al eliminar departamentos de la asignatura. Inténtelo de nuevo');
    }

  }
  catch (error)
  {
    console.log(error);
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
      throw new Error('Error al asignar departamentos a la asignatura. Inténtelo de nuevo');
    }


  }
  catch (error)
  {
    console.log(error);
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
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log(error);
    }
  }

export const crearReduccion = async (nombre, horas, decideDireccion, toastMessage, toastColor, isToastOpen) =>
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
                  'nombre': nombre,
                  'horas': horas,
                  'decideDireccion': decideDireccion
                },
  
          });
      if(!response.ok)
      {
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      return await response.json();

    }
    catch (error)
    {
      console.log(error);
    }
  }

export const borrarReduccion = async (nombre, horas, decideDireccion, toastMessage, toastColor, isToastOpen) =>
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
                  'nombre': nombre,
                  'horas': horas,
                  'decideDireccion': decideDireccion
                },
  
          });
      if(!response.ok)
      {
        throw new Error('Error al cargar asignaturas. Inténtelo de nuevo');
      }
      return await response.json();
  
    }
    catch (error)
    {
      console.log(error);
    }
  }


