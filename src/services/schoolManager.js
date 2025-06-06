import {schoolmanagerApiUrl} from '@/environment/apiUrls';
import {obtenerTokenJWTValido} from '@/services/firebaseService';

/****************************** Ventana X Common ******************************/
export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
}

export const obtenerGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/common/grupos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const asignarReducciones = async (email, reduccion, horas, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/common/asignarReducciones',
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
  }

/****************************** Ventana 1 CargarMatriculas ******************************/
export const subirFicheros = async (file, curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    if (!file) 
    {
      return;
    }

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
      
    return await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
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
}

export const cargarMatriculas = async (toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const borrarMatriculas = async (curso, etapa, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
    {
      method: 'DELETE',
      headers:
      {
        'curso': curso,
        'etapa': etapa,
        'Authorization': `Bearer ${tokenPropio}`
      },
    });
  }

export const obtenerDatosMatriculas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
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
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const matricularAsignaturas = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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
  }

export const matricularAlumnos = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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
  }

export const desmatricularAlumnos = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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
  }

/****************************** Ventana 2 AsignaturasYBloques ******************************/
export const cargarAsignaturas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
}

export const crearBloques = async (curso, etapa, asignaturas, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const queryParams = new URLSearchParams({
      curso,
      etapa,
      asignaturas 
    }).toString();

    return await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/bloques?' + queryParams, 
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json'
        },
      });
  }

export const eliminarBloques = async (curso, etapa, nombre, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/bloques', 
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
  }

export const asignaturasSinDocencia = async (curso, etapa, nombreAsignatura, sinDocencia, toastMessage, toastColor, isToastOpen) =>
  {
  
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/sinDocencia', 
      {
        method: 'PUT',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
          'nombreAsignatura': nombreAsignatura,
          'curso': curso,
          'etapa': etapa,
          'sinDocencia': sinDocencia
        },
      });
  }

export const asignaturasDesdobles = async (curso, etapa, nombreAsignatura, desdoble, toastMessage, toastColor, isToastOpen) =>
  {
  
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/desdoble', 
      {
        method: 'PUT',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
          'nombreAsignatura': nombreAsignatura,
          'curso': curso,
          'etapa': etapa,
          'desdoble': desdoble
        },
      });
  }

export const mostrarHoras = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
      
    return await response.json();
}

export const asignarHoras = async (curso, etapa, nombreAsignatura, horas, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYBloques/horas', 
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
  }

/****************************** Ventana 3 CrearGrupos ******************************/
export const crearNuevosGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/grupos', 
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa
        },
      });
  }

export const obtenerAlumnosConGrupos = async (curso, etapa, grupo, toastMessage, toastColor, isToastOpen) => 
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
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerAlumnosSinGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
}

export const asignarAlumnos = async (curso, etapa, grupo, alumnosSeleccionados, toastMessage, toastColor, isToastOpen) => 
  {
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
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
  }

export const borrarAlumnos = async (alumno, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
      {
        method: 'DELETE',
        headers: 
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenPropio}`
        },
        body: JSON.stringify(alumno)
      });
  }

export const actualizarTurnoHorario = async (curso, etapa, grupo, esHorarioMatutino, toastMessage, toastColor, isToastOpen) => 
  {
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearGrupos/turnoHorario', 
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
  }

/****************************** Ventana 4 TablaResumen ******************************/
export const obtenerTodosGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/resumenAsignaturas/grupos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': cursoInt,
          'etapa': etapa
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }
export const cargarAsignaturasUnicas = async (curso, etapa, toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerCantidadAlumnosEnGrupoPorAsignatura = async (curso, etapa, grupo, asignatura, toastMessage, toastColor, isToastOpen) => 
  {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
      const response =  await fetch(schoolmanagerApiUrl + '/schoolManager/resumenAsignaturas/numeroAlumnosEnAsignatura', 
        {
          method: 'GET',
          headers: 
          {
            'Authorization': `Bearer ${tokenPropio}`,
            'curso': curso,
            'etapa': etapa,
            'grupo': grupo,
            'asignatura': asignatura
          },
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return await response.json();
  }

/****************************** Ventana 5 AsignaturasYDepartamentos ******************************/
export const obtenerDepartamentos = async (toastMessage, toastColor, isToastOpen) => 
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const asignarProfesoresADepartamentos = async (nombre, plantilla, toastMessage, toastColor, isToastOpen) => 
  {

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const queryParams = new URLSearchParams({
      nombre,
      plantilla
    }).toString();

    return await fetch(schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/departamentos?' + queryParams, 
      {
        method: 'PUT',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });
  }
export const obtenerDatosDepartamentosConAsignaturas = async (toastMessage, toastColor, isToastOpen) => 
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerCursosEtapasGrupos = async (toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerAsignaturasPorCursoEtapaGrupo = async (curso, etapa, grupo, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const url = new URL(
        schoolmanagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturasPorCursoEtapaGrupo'
    );
    url.searchParams.append('curso', curso);
    url.searchParams.append('etapa', etapa);
    url.searchParams.append('grupo', grupo);

    const response = await fetch(url.toString(), 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
        }
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerTodasLasAsignaturas = async (toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const quitarAsignaturasDeDepartamentos = async (curso, etapa, grupo, nombre, toastMessage, toastColor, isToastOpen) =>
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

    return await fetch(url.toString(),
      {
        method: 'PATCH',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`
        },

      });
  }

export const asignarAsignaturasADepartamentos = async (curso, etapa, grupo, nombre, departamentoPropietario, departamentoReceptor, toastMessage, toastColor, isToastOpen) =>
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

    return await fetch(url.toString(),
      {
        method: 'PATCH',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`
        },
      });
  }

/****************************** Ventana 6 Reducciones ******************************/
export const crearReducciones = async (nombre, horas, decideDireccion, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/reducciones',
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
  }

export const cargarReducciones = async (toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const borrarReducciones = async (nombre, horas, decideDireccion, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/reducciones',
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
  }

export const obtenerProfesores = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/profesores',
      {
        method: 'GET',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerReduccionesProfesores = async (toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const borrarReduccionesProfesores = async (email, reduccion, horas, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/crearReducciones/asignarReducciones',
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
  }

/****************************** Eleccion de horarios ******************************/
export const obtenerProfesoresHorarios = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/profesores',
      {
        method: 'GET',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
      
    return await response.json();
  }

export const obtenerAsignaturas = async (email, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/asignaturas',
      {
        method: 'GET',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const asignarAsignatura = async (nombre, horas, curso, etapa, grupo, email, toastMessage, toastColor, isToastOpen) =>
  {

    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/asignaturas',
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
  }

export const obtenerReducciones = async (toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }

export const obtenerDiasTramosTipoHorario = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones',
      {
        method: 'GET',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  }
  
export const actualizarObservaciones = async (conciliacion, trabajarPrimeraHora, otrasObservaciones, dia, tramo, tipoHorario, email, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones',
      {
        method: 'PUT',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'conciliacion': conciliacion,
          'trabajarPrimeraHora': trabajarPrimeraHora,
          'otrasObservaciones': otrasObservaciones,
          'dia': dia,
          'tramo': tramo,
          'tipoHorario': tipoHorario,
          'email': email
        },
      });
  }

export const obtenerObservacionesDeUsuario = async (email, toastMessage, toastColor, isToastOpen) =>
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones/usuario',
        {
            method: 'GET',
            headers:
                {
                    'Authorization': `Bearer ${tokenPropio}`,
                    'email': email
                },
        });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }

    return await response.json();
}

export const obtenerPreferenciasDeUsuario = async (email, toastMessage, toastColor, isToastOpen) =>
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/preferencias/usuario',
        {
            method: 'GET',
            headers:
                {
                    'Authorization': `Bearer ${tokenPropio}`,
                    'email': email
                },
        });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }

    return await response.json();
}


export const obtenerSolicitudes = async (email, toastMessage, toastColor, isToastOpen) =>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

      return await response.json();
  }

export const eliminarSolicitudes = async (email, nombreAsignatura, horasAsignatura, curso, etapa, grupo, nombreReduccion, horasReduccion, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
      {
        method: 'DELETE',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'nombreAsignatura': nombreAsignatura || '',
          'horasAsignatura': horasAsignatura ?? '',
          'curso': curso || '',
          'etapa': etapa || '',
          'grupo': grupo || '',
          'nombreReduccion': nombreReduccion || '',
          'horasReduccion': horasReduccion ?? ''
        },
      });
  }

export const guardarSolicitudes = async (email, nombreAsignatura, horasAsignatura, curso, etapa, grupoAntiguo, grupoNuevo, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    return await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
      {
        method: 'PUT',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'nombreAsignatura': nombreAsignatura,
          'horasAsignatura': horasAsignatura,
          'curso': curso,
          'etapa': etapa,
          'grupoAntiguo': grupoAntiguo,
          'grupoNuevo': grupoNuevo,
        },
      });
  }

export const obtenerGruposDeAsignaturas = async (nombreAsignatura, horasAsignatura, curso, etapa, toastMessage, toastColor, isToastOpen) =>
  {

    const cursoInt = parseInt(curso, 10);
    const horasInt = parseInt(horasAsignatura, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolmanagerApiUrl + '/schoolManager/eleccionDeHorarios/gruposAsignaturas',
      {
        method: 'GET',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombreAsignatura': nombreAsignatura,
          'horasAsignatura': horasInt,
          'curso': cursoInt,
          'etapa': etapa,
        },
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
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