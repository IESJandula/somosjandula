import { automationsApiUrl, schoolBaseServerApiUrl } from '@/environment/apiUrls'
import { obtenerTokenJWTValido } from '@/services/firebaseService'

export const obtenerDispositivos = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(automationsApiUrl + '/automations/map/ubicacion/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message)
  }

  return await response.json()
}

export const obtenerCursosAcademicos = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/cursos_academicos', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message)
  }

  return await response.json()
}

export const obtenerEspaciosFijo = async (toastMessage, toastColor, isToastOpen, cursoAcademico) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/fijo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
      cursoAcademico: String(cursoAcademico),
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message)
  }

  return await response.json()
}

export const obtenerEspaciosDesdoble = async (toastMessage, toastColor, isToastOpen, cursoAcademico) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/desdoble', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
      cursoAcademico: String(cursoAcademico),
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message)
  }

  return await response.json()
}

export const obtenerEspaciosSinDocencia = async (toastMessage, toastColor, isToastOpen, cursoAcademico) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(schoolBaseServerApiUrl + '/school_base_server/admin/espacios/sin_docencia', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
      cursoAcademico: String(cursoAcademico),
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message)
  }

  return await response.json()
}
