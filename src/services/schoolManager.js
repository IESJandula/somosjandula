import {schoolManagerApiUrl} from '@/environment/apiUrls';
import {obtenerTokenJWTValido} from '@/services/firebaseService';

/****************************** Ventana X Common ******************************/
export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/common/cursoEtapa', 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
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
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'email': email,
          'reduccion': reduccion.toString(),
          'horas': horas.toString(),
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
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': parseInt(curso,10).toString(),
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
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
        },
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
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'curso': curso.toString(),
        'etapa': etapa,
      },
    });
  }

export const obtenerDatosMatriculas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'curso': curso.toString(),
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
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombre': nombre,
          'apellidos': apellidos,
          'asignatura': asignatura.toString(),
          'curso': curso.toString(),
          'etapa': etapa,
          'estado': estado,
        },
      });
  }

export const matricularAlumnos = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombre': nombre,
          'apellidos': apellidos,
          'asignatura': asignatura,
          'curso': curso,
          'etapa': etapa,
          'estado': estado,
        },
      });
  }

export const desmatricularAlumnos = async (nombre, apellidos, asignatura, curso, etapa, estado, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/datosMatriculas', 
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'nombre': nombre,
          'apellidos': apellidos,
          'asignatura': asignatura,
          'curso': curso,
          'etapa': etapa,
          'estado': estado,
        },
      });
  }

// Crea una asignatura ad-hoc (a medida, no proveniente del CSV) para el curso/etapa.
// El curso académico activo lo resuelve el backend (seleccionado = true). Body { nombre, curso, etapa }.
export const crearAsignaturaAdHoc = async (toastMessage, toastColor, isToastOpen, asignaturaAdHocDto) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/asignaturaAdHoc',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignaturaAdHocDto)
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    return response;
  }

// Borra una asignatura ad-hoc del curso/etapa. El curso académico activo lo resuelve el backend.
export const borrarAsignaturaAdHoc = async (toastMessage, toastColor, isToastOpen, asignaturaAdHocDto) =>
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/cargarMatriculas/asignaturaAdHoc',
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignaturaAdHocDto)
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    return response;
  }

/****************************** Ventana 2 AsignaturasYBloques ******************************/
export const cargarAsignaturas = async (curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/asignaturas', 
      {
        method: 'GET',
        headers: {
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
        headers: {
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
        headers: {
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
        headers: {
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
        headers: {
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
        headers: {
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
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'Content-Type': 'application/json',
          'curso': curso,
          'etapa': etapa,
          'nombreAsignatura': nombreAsignatura,
          'horas': horas
        },
      });
  }

export const subirHorasAsignaturasCsv = async (file, curso, etapa, toastMessage, toastColor, isToastOpen) =>
  {
    if (!file) {
      return;
    }

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(schoolManagerApiUrl + '/schoolManager/asignaturasYBloques/horas/csv',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': parseInt(curso, 10),
          'etapa': etapa,
        },
        body: file
      });
  }

/****************************** Ventana 3 CrearGrupos ******************************/
// Los grupos ya no se crean manualmente: en el frontend se elige una letra fija (A-H) y el grupo se
// materializa en el backend al asignarle alumnos (endpoint asignarAlumnos).

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
      'cursoAcademico': localStorage.getItem('cursoAcademicoSeleccionado') || '',
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

/****************************** Ventana A CursosEtapasEspacios ******************************/

export const crearCursoEtapa = async (toastMessage, toastColor, isToastOpen, cursoEtapaDto) =>
{
  return crearCursoEtapaGrupo(toastMessage, toastColor, isToastOpen, {
    curso: cursoEtapaDto.curso,
    etapa: cursoEtapaDto.etapa,
    esBachillerato: cursoEtapaDto.esoBachillerato
  });
}

export const borrarCursoEtapa = async (toastMessage, toastColor, isToastOpen, cursoEtapaDto) =>
{
  return borrarCursoEtapaGrupo(toastMessage, toastColor, isToastOpen, {
    curso: cursoEtapaDto.curso,
    etapa: cursoEtapaDto.etapa
  });
}

export const listarCursosEtapas = async (toastMessage, toastColor, isToastOpen) =>
{
  const data = await listarCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    curso: item.curso,
    etapa: item.etapa,
    esoBachillerato: item.esBachillerato === true
  }));
}

export const obtenerCursosAcademicos = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosAcademicos',
    {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
        'Accept': 'application/json',
      },
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

// NOTA: seleccionarCursoAcademico se ha eliminado. El curso académico actual es ahora una constante centralizada
// en AdminServer (CURSO_ACADEMICO_ACTUAL) que se edita en "Gestión de constantes"; ya no se selecciona aquí.

export const obtenerCursoAcademicoSeleccionado = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/cursoAcademico',
    {
      method: 'GET',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message)
  }

  return await response.text()
}

export const crearCursoEtapaGrupo = async (toastMessage, toastColor, isToastOpen, cursoEtapaGrupoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cursoEtapaGrupoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const obtenerCursosEtapasGruposPorCursoAcademico = async (toastMessage, toastColor, isToastOpen) =>
{
  return listarCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
}

export const listarCursosEtapasGrupos = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status} al obtener grupos`);
  }
  return await response.json()
}

export const copiarCursosEtapasGruposCursoAcademico = async (toastMessage, toastColor, isToastOpen, cursoAcademicoOrigen, cursoAcademicoDestino, opcionesCopia = ['cursos_etapas']) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos/copiar',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
      'cursoAcademicoOrigen': cursoAcademicoOrigen,
      'cursoAcademicoDestino': cursoAcademicoDestino,
    },
    body: JSON.stringify({ opciones: opcionesCopia }),
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const borrarTodosCursosEtapasGruposCursoAcademico = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos/borrarTodos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const borrarCursoEtapaGrupo = async (toastMessage, toastColor, isToastOpen, cursoEtapaGrupoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cursoEtapaGrupoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const crearEspacioSinDocencia = async (toastMessage, toastColor, isToastOpen, espacioSinDocenciaDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/sinDocencia',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioSinDocenciaDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const obtenerEspaciosSinDocencia = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/sinDocencia',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico ?? localStorage.getItem('cursoAcademicoSeleccionado') ?? '',
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const borrarEspacioSinDocencia = async (toastMessage, toastColor, isToastOpen, espacioSinDocenciaDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/sinDocencia',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioSinDocenciaDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const crearEspacioFijo = async (toastMessage, toastColor, isToastOpen, espacioFijoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/fijo',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioFijoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const obtenerEspaciosFijo = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/fijo',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico ?? localStorage.getItem('cursoAcademicoSeleccionado') ?? '',
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const borrarEspacioFijo = async (toastMessage, toastColor, isToastOpen, espacioFijoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/fijo',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioFijoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

/**
 * Obtiene los espacios fijos (aulas de referencia) ya asignados a algún curso/etapa/grupo del curso académico
 * activo. El curso académico se resuelve internamente en el backend (sin cabecera cursoAcademico).
 */
export const obtenerEspaciosFijoAsignados = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/fijo',
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

/**
 * Obtiene los espacios disponibles (catálogo del instituto sin asignar a ningún grupo) del curso académico activo.
 * El curso académico se resuelve internamente en el backend (sin cabecera cursoAcademico).
 */
export const obtenerEspaciosDisponibles = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/disponibles',
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

/**
 * Obtiene los bloques (con sus asignaturas) del curso y etapa indicados para el curso académico activo.
 * El curso académico se resuelve internamente en el backend (sin cabecera cursoAcademico).
 */
export const obtenerBloquesConAsignaturas = async (curso, etapa, toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/bloques',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'curso': curso,
      'etapa': etapa,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * Asigna un aula de desdoble (espacio del catálogo) a un bloque. El curso académico se resuelve internamente
 * en el backend (sin cabecera cursoAcademico). espacioDesdobleDto = { nombre, bloqueId }.
 */
export const asignarEspacioDesdoble = async (toastMessage, toastColor, isToastOpen, espacioDesdobleDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/desdoble',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioDesdobleDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

/**
 * Obtiene las aulas de desdoble ya asignadas (con su bloque) del curso académico activo.
 * El curso académico se resuelve internamente en el backend (sin cabecera cursoAcademico).
 */
export const obtenerEspaciosDesdobleAsignados = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/desdoble',
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

/**
 * Desasigna un aula de desdoble, devolviéndola al catálogo de espacios disponibles.
 * El curso académico se resuelve internamente en el backend (sin cabecera cursoAcademico). espacioDesdobleDto = { nombre }.
 */
export const desasignarEspacioDesdoble = async (toastMessage, toastColor, isToastOpen, espacioDesdobleDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/espacios/desdoble',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioDesdobleDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const crearEspacioDesdoble = async (toastMessage, toastColor, isToastOpen, espacioDesdobleDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/desdoble',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioDesdobleDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const obtenerEspaciosDesdoble = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/desdoble',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico ?? localStorage.getItem('cursoAcademicoSeleccionado') ?? '',
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const borrarEspacioDesdoble = async (toastMessage, toastColor, isToastOpen, espacioDesdobleDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/desdoble',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espacioDesdobleDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const borrarTodosEspaciosCursoAcademico = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/borrarTodos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const copiarEspaciosCursoAcademico = async (toastMessage, toastColor, isToastOpen, cursoAcademicoOrigen, cursoAcademicoDestino) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/copiar',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademicoOrigen': cursoAcademicoOrigen,
      'cursoAcademicoDestino': cursoAcademicoDestino,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const listarDepartamentos = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/departamentos',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status} al obtener departamentos`);
  }
  return await response.json()
}

export const crearDepartamento = async (toastMessage, toastColor, isToastOpen, departamentoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/departamentos',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(departamentoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const copiarDepartamentosCursoAcademico = async (toastMessage, toastColor, isToastOpen, cursoAcademicoOrigen, cursoAcademicoDestino) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/departamentos/copiar',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademicoOrigen': cursoAcademicoOrigen,
      'cursoAcademicoDestino': cursoAcademicoDestino,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const borrarTodosDepartamentosCursoAcademico = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/departamentos/borrarTodos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

export const borrarDepartamento = async (toastMessage, toastColor, isToastOpen, departamentoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/departamentos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(departamentoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

/**
 * Lista las asignaturas únicas (curso, etapa, nombre, horas) del curso académico activo.
 * Se envía la cabecera `cursoAcademico` (leída de localStorage) para que el backend filtre por ese curso académico.
 * Se usa en el listado de la configuración básica al elegir la categoría "Asignaturas".
 */
export const listarAsignaturasCursoAcademico = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos/asignaturas',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': localStorage.getItem('cursoAcademicoSeleccionado') || '',
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * Carga por fichero CSV de la configuración básica (Crear). El curso académico activo lo resuelve el backend
 * (seleccionado = true); no se envía cabecera cursoAcademico. Cada función recibe un File (.csv), lo envía como
 * multipart/form-data en el campo "csv" y devuelve el resumen de la carga ({@code CargaCsvResultDto}).
 *
 * CSV de espacios: 1 columna (primera fila = cabecera ignorada). Cada fila = nombre de un espacio.
 */
export const subirEspaciosCsv = async (file, toastMessage, toastColor, isToastOpen) =>
{
  if (!file) {
    return;
  }

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/espacios/sinDocencia/csv',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * CSV de cursos y etapas: 2 columnas (primera fila = cabecera ignorada). Col1 = curso (entero), Col2 = etapa (texto).
 */
export const subirCursosEtapasCsv = async (file, toastMessage, toastColor, isToastOpen) =>
{
  if (!file) {
    return;
  }

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos/csv',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * CSV de departamentos: 1 columna (primera fila = cabecera ignorada). Cada fila = nombre de un departamento.
 */
export const subirDepartamentosCsv = async (file, toastMessage, toastColor, isToastOpen) =>
{
  if (!file) {
    return;
  }

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/departamentos/csv',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * Carga por fichero CSV de reducciones del tipo "NO tutorías". Envía el File (.csv) como multipart/form-data en el
 * campo "csv" y devuelve el resumen de la carga ({@code CargaCsvResultDto}). El curso académico activo lo resuelve
 * el backend (seleccionado = true); no se envía cabecera.
 *
 * CSV de 2 columnas (primera fila = cabecera ignorada): Col1 = nombre (texto), Col2 = horas (entero). Las filas con
 * el mismo nombre y horas distintas se crean como reducciones independientes (PK = nombre + horas); las repetidas
 * exactas se omiten (idempotencia).
 */
export const subirReduccionesNoTutoriasCsv = async (file, toastMessage, toastColor, isToastOpen) =>
{
  if (!file) {
    return;
  }

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones/noTutorias/csv',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * Carga por fichero CSV de reducciones del tipo "TUTORÍAS". Envía el File (.csv) como multipart/form-data en el
 * campo "csv" y devuelve el resumen de la carga ({@code CargaCsvResultDto}). El curso académico activo lo resuelve
 * el backend (seleccionado = true); no se envía cabecera.
 *
 * CSV de 3 columnas (primera fila = cabecera ignorada): Col1 = curso (entero), Col2 = etapa (texto), Col3 = horas
 * (entero). El backend sintetiza el nombre "Tutoría <curso>º <etapa>" para encajar en la PK existente.
 */
export const subirReduccionesTutoriasCsv = async (file, toastMessage, toastColor, isToastOpen) =>
{
  if (!file) {
    return;
  }

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones/tutorias/csv',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * Lista las reducciones (tutorías y no tutorías) del curso académico activo.
 * Se envía la cabecera `cursoAcademico` (leída de localStorage) para que el backend filtre por ese curso académico.
 * Se usa en el listado de la configuración básica al elegir la categoría "Reducciones".
 */
export const listarReduccionesCursoAcademico = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos/reducciones',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': localStorage.getItem('cursoAcademicoSeleccionado') || '',
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

/**
 * Borra TODAS las asignaturas del curso académico indicado (cabecera `cursoAcademico`).
 * RUTA ASUMIDA (pendiente de confirmar con backend):
 *   DELETE /schoolManager/espacios/admin/cursosEtapasGrupos/asignaturas/borrarTodos
 */
export const borrarTodasAsignaturas = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/espacios/admin/cursosEtapasGrupos/asignaturas/borrarTodos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

/**
 * Borra TODAS las reducciones NO tutorías. El backend resuelve el curso académico internamente (seleccionado = true);
 * el filtro tutorías/no tutorías lo determina el query param `tutoria`. Se envía igualmente la cabecera `cursoAcademico`
 * por coherencia con el resto de la vista.
 *   DELETE /schoolManager/crearReducciones/reducciones/borrarTodos?tutoria=false
 */
export const borrarTodasReduccionesNoTutoria = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones/borrarTodos?tutoria=false',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

/**
 * Borra TODAS las reducciones de tutorías. El backend resuelve el curso académico internamente (seleccionado = true);
 * el filtro tutorías/no tutorías lo determina el query param `tutoria`. Se envía igualmente la cabecera `cursoAcademico`
 * por coherencia con el resto de la vista.
 *   DELETE /schoolManager/crearReducciones/reducciones/borrarTodos?tutoria=true
 */
export const borrarTodasReduccionesTutoria = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones/borrarTodos?tutoria=true',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

/**
 * Borra UNA reducción concreta. El backend la identifica por las cabeceras `nombre`, `horas` y `decideDireccion`
 * (mismo patrón que `crearReducciones`/`borrarReducciones`) y resuelve el curso académico internamente (seleccionado
 * = true). Se mantiene el parámetro `cursoAcademico` (enviado como cabecera) por coherencia con el resto de la vista.
 *   DELETE /schoolManager/crearReducciones/reducciones
 *   headers: nombre, horas, decideDireccion
 */
export const borrarReduccion = async (toastMessage, toastColor, isToastOpen, cursoAcademico, reduccionDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearReducciones/reducciones',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico,
      'nombre': reduccionDto.nombre,
      'horas': reduccionDto.horas,
      'decideDireccion': reduccionDto.decideDireccion,
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}

/**
 * Carga por fichero CSV de alumnos de la ventana "Creación de grupos". Envía el File (.csv) como multipart/form-data
 * en el campo "csv" y devuelve el resumen de la carga ({@code CargaCsvResultDto}). El curso académico activo lo
 * resuelve el backend (seleccionado = true); no se envía cabecera.
 *
 * CSV `alumnos_cursoEtapaGrupo.csv` (primera fila = cabecera ignorada): filas `nombreApellidos, curso etapa grupo`
 * (p. ej. "Pérez García, Ana,1 ESO A"). El fichero se envía como multipart/form-data en el campo "csv". El backend
 * (ROLE_DIRECCION) autocrea los grupos y asocia los alumnos. Si algún alumno del CSV no existe en datos brutos, el
 * backend responde error (400) y se aborta la importación; el mensaje (con nombre y apellidos del alumno) se propaga
 * vía throw new Error(errorData.message). Se envía la cabecera `cursoAcademico` (leída de localStorage).
 */
export const subirAlumnosCsv = async (file, toastMessage, toastColor, isToastOpen) =>
{
  if (!file) {
    return;
  }

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(schoolManagerApiUrl + '/schoolManager/crearGrupos/alumnos/asignarPorFichero',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': localStorage.getItem('cursoAcademicoSeleccionado') || '',
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}