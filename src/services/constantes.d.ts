export declare function obtenerConstantes(endpointConstantes: Ref<string>,
                                          toastMessage: Ref<string>, 
                                          toastColor: Ref<string>, 
                                          isToastOpen: Ref<boolean>): Promise<DtoConstante[]>;

export declare function actualizarConstantes(endpointConstantes: Ref<string>,
                                             toastMessage: Ref<string>, 
                                             toastColor: Ref<string>, 
                                             isToastOpen: Ref<boolean>, 
                                             payload: DtoConstante[]): Promise<Void>;
