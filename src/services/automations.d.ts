export type VistaPajaroResponseDto = {
  mapaActuadores: Record<string, any[]>
  mapaSensoresBooleanos: Record<string, any[]>
  mapaSensoresNumericos: Record<string, any[]>
}
export declare function obtenerDispositivos(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<VistaPajaroResponseDto>

export declare function crearSensorBooleano(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>,
                                        aplicabilidad: Ref<string>,
                                        umbralMinimo: Ref<number>,
                                        umbralMaximo: Ref<number>): Promise<string[]>;

export declare function obtenerSensorBooleano(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function eliminarSensorBooleano(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>): Promise<string[]>;

export declare function crearSensorNumerico(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>,
                                        aplicabilidad: Ref<string>, 
                                        umbralMinimo: Ref<number>,
                                        umbralMaximo: Ref<number>): Promise<string[]>;

export declare function obtenerSensorNumerico(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function eliminarSensorNumerico(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>): Promise<string[]>;

export declare function crearActuador(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>,
                                        estado: Ref<string>,
                                        nombreUbicacion: Ref<string>,
                                        aplicabilidad: Ref<string>): Promise<string[]>;

export declare function obtenerActuadores(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,): Promise<string[]>;

export declare function eliminarActuador(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>): Promise<string[]>;
                                    
export declare function obtenerUbicaciones(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerAplicabilidad(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;
