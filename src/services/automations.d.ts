export declare function crearSensorBooleano(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>,
                                        umbralMinimo: Ref<number>,
                                        umbralMaximo: Ref<number>): Promise<string[]>;

export declare function obtenerSensorBooleano(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function crearSensorNumerico(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>,
                                        umbralMinimo: Ref<number>,
                                        umbralMaximo: Ref<number>): Promise<string[]>;

export declare function obtenerSensorNumerico(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function crearActuador(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>): Promise<string[]>;

export declare function obtenerActuadores(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>): Promise<[]>;
                                    
export declare function obtenerUbicaciones(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<[]>;