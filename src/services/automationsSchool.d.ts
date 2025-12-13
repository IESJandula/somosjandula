export declare function crearSensorBooleano(toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>): Promise<void>;

export declare function obtenerSensorBooleano(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function crearSensorNumerico(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerSensorNumerico(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerActuadores(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;
                                    
export declare function obtenerUbicaciones(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;