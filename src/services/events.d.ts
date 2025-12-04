export declare function obtenerEventos(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<void>;

export declare function crearEvento(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function borrarEvento(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerListaEventos(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<string[]>;
    