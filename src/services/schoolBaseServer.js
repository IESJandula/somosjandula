import { schoolBaseServerApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const obtenerCursosAcademicos = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/cursos_academicos',
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
export const seleccionarCursoAcademico = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/cursos_academicos',
  {
    method: 'POST',
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
export const crearCursoEtapaGrupo = async (toastMessage, toastColor, isToastOpen, cursoEtapaGrupoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/cursos_etapas_grupos',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cursoEtapaGrupoDto)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response;
}
export const obtenerCursosEtapasGrupos = async (toastMessage, toastColor, isToastOpen, cursoAcademico) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/cursos_etapas_grupos',
  {
    method: 'GET',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'cursoAcademico': cursoAcademico,
    },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status} al obtener grupos`);
  }
  return await response.json()
}
export const borrarCursoEtapaGrupo = async (toastMessage, toastColor, isToastOpen, cursoEtapaGrupoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/cursos_etapas_grupos',
  {
    method: 'DELETE',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json'
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

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/sin_docencia',
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

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/sin_docencia',
  {
    method: 'GET',
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
  return await response.json()
}
export const borrarEspacioSinDocencia = async (toastMessage, toastColor, isToastOpen, espacioSinDocenciaDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/sin_docencia',
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

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/fijo',
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

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/fijo',
  {
    method: 'GET',
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
  return await response.json()
}
export const borrarEspacioFijo = async (toastMessage, toastColor, isToastOpen, espacioFijoDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/fijo',
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
export const crearEspacioDesdoble = async (toastMessage, toastColor, isToastOpen, espacioDesdobleDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/desdoble',
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

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/desdoble',
  {
    method: 'GET',
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
  return await response.json()
}
export const borrarEspacioDesdoble = async (toastMessage, toastColor, isToastOpen, espacioDesdobleDto) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/desdoble',
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
