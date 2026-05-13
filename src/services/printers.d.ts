export declare function obtenerImpresoras(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerColores(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerEstados(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerOrientaciones(toastMessage: Ref<string>,
                                             toastColor: Ref<string>,
                                             isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerCaras(toastMessage: Ref<string>,
                                     toastColor: Ref<string>,
                                     isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function prevalidacionesImpresion(toastMessage: Ref<string>,
                                                 toastColor: Ref<string>,
                                                 isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function filtrarDatos(toastMessage: Ref<string>,
                                     toastColor: Ref<string>,
                                     isToastOpen: Ref<boolean>,
                                     payload: string): Promise<[]>;

export declare function filtrarDatosPaginado(toastMessage: Ref<string>,
                                             toastColor: Ref<string>,
                                             isToastOpen: Ref<boolean>,
                                             payload: string,
                                             pagina: number,
                                             size?: number): Promise<Response>;

export declare function imprimir(toastMessage: Ref<string>,
                                 toastColor: Ref<string>,
                                 isToastOpen: Ref<boolean>,
                                 payload: string): Promise<Void>;

export declare function cancelarImpresion(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>,
                                          id: number): Promise<Void>;