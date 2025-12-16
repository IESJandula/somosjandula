export declare function obtenerEventos(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Evento[]>;

export declare function crearEvento(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  titulo: string,
  fechaInicio: number,
  fechaFin: number,
  categoria: string
): Promise<Evento>;

export declare function borrarEvento(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  titulo: string,
  fechaInicio: number,
  fechaFin: number
): Promise<void>;

export declare function obtenerCategorias(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Categoria[]>;
