import { schoolmanagerApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/****************************** Ventana 1 CargarMatriculas ******************************/

export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/cursoEtapa', 
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
       
      const response = await fetch(schoolmanagerApiUrl + '/cargarMatriculas/matriculas',
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
  
      const response = await fetch(schoolmanagerApiUrl + '/cargarMatriculas/matriculas',
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
  
      const response = await fetch(schoolmanagerApiUrl + '/cargarMatriculas/matriculas',
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

export const cargarAlumnosCsv = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/cargarMatriculas/datosMatriculas', 
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

/****************************** Ventana 2 AsignaturasYBloques ******************************/

export const cargarAsignaturas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/asignaturasYBloques/asignaturas', 
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

      const response = await fetch(schoolmanagerApiUrl + '/asignaturasYBloques/bloques?' + queryParams, 
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


export const eliminarBloques = async (curso, etapa, nombre, grupo, toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/asignaturasYBloques/bloques', 
      {
        method: 'DELETE',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({curso, etapa, nombre, grupo})
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

      const response = await fetch(schoolmanagerApiUrl + '/asignaturasYBloques/horas', 
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

      const response = await fetch(schoolmanagerApiUrl + '/asignaturasYBloques/horas', 
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

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/grupos', 
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

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/grupos', 
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

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/gruposAlumnos', 
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

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/gruposAlumnosTotales', 
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

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/gruposAlumnos', 
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

      const response = await fetch(schoolmanagerApiUrl + '/crearGrupos/gruposAlumnos', 
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


