import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { obtenerTokenJWTValido } from '@/services/adminService';
import {
  actualizarEstadoEvento,
  borrarEvento,
  crearEvento,
  crearSolicitudEvento,
  obtenerEventos,
  obtenerEventosAdministracion,
  obtenerImagenCategoriaEvento,
  tieneSolicitudEventoPendiente,
} from '@/services/events';

vi.mock('@/environment/apiUrls', () => ({
  eventsApiUrl: 'https://events.example.test',
}));

vi.mock('@/services/adminService', () => ({
  obtenerTokenJWTValido: vi.fn(),
}));

vi.mock('@/utils/toast.js', () => ({
  crearToast: vi.fn(),
}));

const toastMessage = { value: '' };
const toastColor = { value: '' };
const isToastOpen = { value: false };

const respuestaJson = (datos, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(datos),
});

describe('servicio de eventos', () => {
  beforeEach(() => {
    obtenerTokenJWTValido.mockResolvedValue('jwt-prueba');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('consulta los eventos en los endpoints separados de profesor y administración', async () => {
    fetch
      .mockResolvedValueOnce(respuestaJson([{ titulo: 'Profesor' }]))
      .mockResolvedValueOnce(respuestaJson([{ titulo: 'Admin' }]));

    await obtenerEventos(toastMessage, toastColor, isToastOpen);
    await obtenerEventosAdministracion(toastMessage, toastColor, isToastOpen);

    expect(fetch.mock.calls[0][0]).toBe('https://events.example.test/events/eventos/profesor/');
    expect(fetch.mock.calls[1][0]).toBe('https://events.example.test/events/eventos/admin/');
  });

  it.each([
    ['crearEvento', crearEvento],
    ['crearSolicitudEvento', crearSolicitudEvento],
  ])('crea eventos con %s en el endpoint de profesor', async (_nombre, crear) => {
    fetch.mockResolvedValue(respuestaJson(null));

    await crear(
      toastMessage,
      toastColor,
      isToastOpen,
      'Claustro',
      1785974400000,
      1786060800000,
      'Gestión y coordinación académica',
    );

    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe('https://events.example.test/events/eventos/profesor/');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({
      titulo: 'Claustro',
      fechaInicio: 1785974400000,
      fechaFin: 1786060800000,
      nombreCategoria: 'Gestión y coordinación académica',
    });
  });

  it('envía estadoEvento al endpoint de administración', async () => {
    fetch.mockResolvedValue(respuestaJson(null));

    await actualizarEstadoEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      'Claustro',
      1785974400000,
      'ACTIVO',
    );

    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe('https://events.example.test/events/eventos/admin/estado');
    expect(opciones.method).toBe('PATCH');
    expect(JSON.parse(opciones.body)).toEqual({
      titulo: 'Claustro',
      fechaInicio: 1785974400000,
      estadoEvento: 'ACTIVO',
    });
  });

  it('borra eventos en el endpoint de administración conservando los nombres de cabecera', async () => {
    fetch.mockResolvedValue(respuestaJson(null));

    await borrarEvento(toastMessage, toastColor, isToastOpen, 'Claustro', 1785974400000);

    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe('https://events.example.test/events/eventos/admin/');
    expect(opciones.method).toBe('DELETE');
    expect(opciones.headers).toMatchObject({
      titulo: 'Claustro',
      fechaInicio: '1785974400000',
    });
  });

  it('interpreta el contrato por estado HTTP de la solicitud pendiente', async () => {
    fetch
      .mockResolvedValueOnce(respuestaJson(null))
      .mockResolvedValueOnce(respuestaJson({ message: 'Ya existe' }, { ok: false, status: 400 }));

    await expect(tieneSolicitudEventoPendiente(toastMessage, toastColor, isToastOpen))
      .resolves.toBe(false);
    await expect(tieneSolicitudEventoPendiente(toastMessage, toastColor, isToastOpen))
      .resolves.toBe(true);

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://events.example.test/events/eventos/profesor/pendiente',
      expect.any(Object),
    );
  });

  it('corrige la ruta antigua de imagen devuelta por EventsServer', async () => {
    const imagen = new Blob(['png'], { type: 'image/png' });
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(imagen),
    });

    await expect(obtenerImagenCategoriaEvento(
      '/events/eventos/imagen?nombreCategoria=Familias%20y%20tutor%C3%ADas',
      toastMessage,
      toastColor,
      isToastOpen,
    )).resolves.toBe(imagen);

    const [url, opciones] = fetch.mock.calls[0];
    const urlImagen = new URL(url);
    expect(urlImagen.pathname).toBe('/events/eventos/profesor/imagen');
    expect(urlImagen.searchParams.get('nombreCategoria')).toBe('Familias y tutorías');
    expect(opciones.headers.Accept).toBe('image/png');
  });
});
