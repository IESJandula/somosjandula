
import { automationsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const crearSensorBooleano = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, tipo, umbralMinimo, umbralMaximo) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/admin/sensor/booleano',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac: mac.value ?? mac,
        estado: estado.value ?? estado,
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion,
        tipo: tipo.value ?? tipo,
        umbralMinimo: umbralMinimo.value ?? umbralMinimo,
        umbralMaximo: umbralMaximo.value ?? umbralMaximo,
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};

export const obtenerSensorBooleano = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/sensor/booleano',
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
};

export const eliminarSensorBooleano = async (toastMessage, toastColor, isToastOpen, mac) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + `/automations/admin/sensor/booleano/${mac?.value ?? mac}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const crearSensorNumerico = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, tipo, umbralMinimo, umbralMaximo) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/sensor/numerico',
    {
      method: 'POST',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac: mac.value ?? mac,
        estado: estado.value ?? estado,
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion,
        tipo: tipo.value ?? tipo,
        umbralMinimo: umbralMinimo.value ?? umbralMinimo,
        umbralMaximo: umbralMaximo.value ?? umbralMaximo,
      })
    });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};

export const obtenerSensorNumerico = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/sensor/numerico',
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
};

export const eliminarSensorNumerico = async (toastMessage, toastColor, isToastOpen, mac) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + `/automations/admin/sensor/numerico/${mac?.value ?? mac}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const crearActuador = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, tipo) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/admin/actuador',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac: mac.value ?? mac,
        estado: estado.value ?? estado,
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion,
        tipo: tipo.value ?? tipo,
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};

export const obtenerActuadores = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/actuador',
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
};

export const eliminarActuador = async (toastMessage, toastColor, isToastOpen, mac) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + `/automations/admin/actuador/${mac?.value ?? mac}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const obtenerUbicaciones = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/ubicacion',
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
};

export const obtenerTipos = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + "/automations/admin/tipo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  const data = await response.json();

  // ✅ Asegura que SIEMPRE sea un array
  if (Array.isArray(data)) return data;
  return data?.tipos ?? data?.APLICABILIDAD ?? data?.data ?? [];
};

export const obtenerDispositivos = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/map/devices/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `HTTP ${response.status}`);
  }

  return await response.json();
};

export const crearComando = async (
  toastMessage,
  toastColor,
  isToastOpen,
  keyword,
  mac,
  ordenId
) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/admin/comando',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: keyword.value ?? keyword,
        mac: mac.value ?? mac,
        ordenId: ordenId.value ?? ordenId
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};

export const obtenerComandos = async (
  toastMessage,
  toastColor,
  isToastOpen
) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/admin/comando',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenPropio}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return await response.json();
};


export const eliminarComando = async (
  toastMessage,
  toastColor,
  isToastOpen,
  keyword,
  mac,
  ordenId
) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const orden = ordenId?.value ?? ordenId;
  const m = mac?.value ?? mac;
  const k = keyword?.value ?? keyword;

  const response = await fetch(
    automationsApiUrl + `/automations/admin/comando/${orden}/${m}/${k}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenPropio}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};


export const crearComandoActuador = async (
  toastMessage,
  toastColor,
  isToastOpen,
  mac,
  keyword,
  comandos,
  textoOk
) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + "/automations/admin/comando/actuador",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mac: mac?.value ?? mac,
        keyword: keyword?.value ?? keyword,
        comandos: comandos?.value ?? comandos,
        textoOk: textoOk?.value ?? textoOk, // ✅ NUEVO
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const obtenerComandosActuador = async (
  toastMessage,
  toastColor,
  isToastOpen
) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + "/automations/admin/comando/actuador",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return await response.json();
};

export const eliminarComandoActuador = async (
  toastMessage,
  toastColor,
  isToastOpen,
  mac,
  keyword
) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl +
      `/automations/admin/comando/actuador/${mac?.value ?? mac}/${keyword?.value ?? keyword}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};