import {schoolManagerApiUrl} from '@/environment/apiUrls';
import {obtenerTokenJWTValido} from '@/services/firebaseService';

/****************************** Ventana X Common ******************************/
export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/common/cursoEtapa', 
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



export const asignarReducciones = async (email, reduccion, horas, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/common/asignarReducciones',
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
      
    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/matriculas',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/asignaturas', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/bloques?' + queryParams, 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/bloques', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/sinDocencia', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/desdoble', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/horas', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/horas', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/grupos', 
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

export const obtenerGrupos = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/grupos', 
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

export const obtenerAlumnosConGrupos = async (curso, etapa, grupo, toastMessage, toastColor, isToastOpen) => 
  {
    if (!curso || !etapa || !grupo) {
      throw new Error('Curso, etapa o grupo inválidos');
    }
    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnosTotales', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/gruposAlumnos', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/turnoHorario', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/resumenAsignaturas/grupos', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/resumenAsignaturas/asignaturasUnicas',
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
  
      const response =  await fetch(schoolManagerApiUrl + '/schoolManager/resumenAsignaturas/numeroAlumnosEnAsignatura', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/departamentos', 
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/departamentos?' + queryParams, 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas/infoDepartamentos', 
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/curso',
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
        schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturasPorCursoEtapaGrupo'
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas',
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
        schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas/quitarDepartamentos'
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
        schoolManagerApiUrl + '/schoolManager/asignaturasYDepartamentos/asignaturas/asignarDepartamentos'
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
export const crearReducciones = async (nombre, horas, decideDireccion, curso, etapa, grupo, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const headers = {
      'Authorization': `Bearer ${tokenPropio}`,
      'nombre': nombre,
      'horas': horas,
      'decideDireccion': decideDireccion
    };

    // Solo agregar los headers si los valores están definidos
    if (curso !== undefined) headers.curso = curso;
    if (etapa !== undefined) headers.etapa = etapa;
    if (grupo !== undefined) headers.grupo = grupo;

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones',
      {
        method: 'POST',
        headers: headers
      });
  }

export const cargarReducciones = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones',
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/profesores',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/asignarReducciones',
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/asignarReducciones',
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
  
    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/profesores',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/asignaturas',
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

export const asignarAsignatura = async (nombre, horas, curso, etapa, email, toastMessage, toastColor, isToastOpen) =>
  {

    const cursoInt = parseInt(curso, 10);
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/asignaturas',
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
          'email': email,
        },
      });
  }

export const obtenerReducciones = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/reduccion',
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

export const actualizarOtrasObservaciones = async (email, otrasObservaciones, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones/otrasObservaciones',
      {
        method: 'PUT',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'otrasObservaciones': otrasObservaciones
        },
      });
  }

  export const actualizarSinClasePrimeraHora = async (email, sinClasePrimeraHora, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones/sinClasePrimeraHora',
      {
        method: 'PUT',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'sinClasePrimeraHora': sinClasePrimeraHora
        },
      });
  }

  export const actualizarConciliacion = async (email, conciliacion, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones/conciliacion',
      {
        method: 'PUT',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'conciliacion': conciliacion
        },
      });
  }


export const obtenerObservaciones = async (email, toastMessage, toastColor, isToastOpen) =>
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
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
  
    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/solicitudes',
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

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/gruposAsignaturas',
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

/****************************** Validador de datos ******************************/
export const obtenerErroresDatos = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/validadorDatos/errores',
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

/****************************** Generador de Horarios ******************************/
export const lanzarGeneradorHorarios = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/lanzar',
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

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/forzarDetencion',
    {
      method: 'POST',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
          },
    });
  }

export const obtenerEstadoGeneradorHorarios = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/estado',
    {
      method: 'GET',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
          },
    });
  }

/****************************** Actualizar Restricciones Impartir ******************************/
export const actualizarRestriccionesImpartir = async (email, nombreAsignatura, curso, etapa, grupo, numeroRestriccion, diaDesc, tramoDesc, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/restricciones_impartir',
    {
      method: 'POST',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
            'email': email,
            'nombreAsignatura': nombreAsignatura,
            'curso': curso,
            'etapa': etapa,
            'grupo': grupo,
            'numeroRestriccion': numeroRestriccion,
            'diaDesc': diaDesc,
            'tramoDesc': tramoDesc
          },
    });
  }

/****************************** Obtener Restricciones Impartir ******************************/
export const obtenerRestriccionesImpartir = async (email, nombreAsignatura, curso, etapa, grupo, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/generador/restricciones_impartir',
    {
      method: 'GET',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
            'email': email,
            'nombreAsignatura': nombreAsignatura,
            'curso': curso,
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

/****************************** Actualizar Restricciones Reduccion ******************************/  
export const actualizarRestriccionesReduccion = async (email, nombreReduccion, curso, etapa, grupo, numeroRestriccion, diaDesc, tramoDesc, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/restricciones_reduccion',
    {
      method: 'POST',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
            'email': email,
            'nombreReduccion': nombreReduccion,
            'curso': curso,
            'etapa': etapa,
            'grupo': grupo,
            'numeroRestriccion': numeroRestriccion,
            'diaDesc': diaDesc,
            'tramoDesc': tramoDesc
          },
    });
  }

/****************************** Obtener Restricciones Reduccion ******************************/
export const obtenerRestriccionesReduccion = async (email, nombreReduccion, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/generador/restricciones_reduccion',
    {
      method: 'GET',
      headers:
          {
            'Authorization': `Bearer ${tokenPropio}`,
            'email': email,
            'nombreReduccion': nombreReduccion,
          },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } 

/****************************** Obtener Lista de Días y Tramos ******************************/
export const obtenerListaDiaTramoTipoHorario = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/tramosHorarios',
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

/****************************** Obtener Lista de Días ******************************/
export const obtenerListaDias = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/common/diasSemana',
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

/****************************** Obtener Lista de Tramos ******************************/
export const obtenerListaTramos = async (toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/common/tramosHorarios',
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

/****************************** Seleccionar Solución ******************************/
export const seleccionarSolucion = async (idGeneradorInstancia, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/soluciones',
      {
        method: 'POST',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'idGeneradorInstancia': idGeneradorInstancia
        },
      });
  }

export const borrarSolucion = async (idGeneradorInstancia, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/generador/soluciones',
    {
    method: 'DELETE',
    headers: 
    {
        'Authorization': `Bearer ${tokenPropio}`,
        'idGeneradorInstancia': idGeneradorInstancia
      },
    });
};

/****************************** Actualizar Preferencia Horaria ******************************/
export const actualizarPreferenciaHoraria = async (email, idSeleccion, diaDesc, tramoDesc, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/eleccionDeHorarios/observaciones/preferenciaHoraria',
      {
        method: 'PUT',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'idSeleccion': idSeleccion,
          'diaDesc': diaDesc,
          'tramoDesc': tramoDesc
        },
      });
  }

/****************************** Obtener Horarios Individuales ******************************/
export const obtenerHorariosIndividuales = async (email, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/horarios/individual',
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

/****************************** Obtener Horarios Curso Etapa Grupo ******************************/
export const obtenerHorariosCursoEtapaGrupo = async (curso, etapa, grupo, toastMessage, toastColor, isToastOpen) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/horarios/cursoEtapaGrupo',
      {
        method: 'GET',
        headers:
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': curso,
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