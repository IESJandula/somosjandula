export declare function obtenerConstantes(toastMessage: Ref<string>, 
                                          toastColor: Ref<string>, 
                                          isToastOpen: Ref<boolean>): Promise<DtoConstante[]>;

export declare function actualizarConstantes(toastMessage: Ref<string>, 
                                             toastColor: Ref<string>, 
                                             isToastOpen: Ref<boolean>, 
                                             payload: DtoConstante[]): Promise<Void>;
