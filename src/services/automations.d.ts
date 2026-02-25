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
                                        tipo: Ref<string>,
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
                                        tipo: Ref<string>, 
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
                                        tipo: Ref<string>): Promise<string[]>;

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

export declare function obtenerTipos(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;
export type ComandoResponseDto = {keyword: string
                                  mac: string
                                  ordenId: number
}

export declare function crearComando(toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>,
                                      keyword: Ref<string>,
                                      mac: Ref<string>,
                                      ordenId: Ref<number>): Promise<void>

export declare function obtenerComandos(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<ComandoResponseDto[]>

export declare function eliminarComando(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>,
                                          keyword: Ref<string>,
                                          mac: Ref<string>,
                                          ordenId: Ref<number>): Promise<void>
export type ComandoActuadorResponseDto = {
                                          mac: string
                                          keyword: string
                                          comandos: string
                                          textoOk: string
}

export declare function crearComandoActuador(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>,
                                            mac: string | Ref<string>,
                                            keyword: Ref<string> | string,
                                            comandos: Ref<string> | string,
                                            textoOk: Ref<string> | string): Promise<boolean>

export declare function obtenerComandosActuador(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<ComandoActuadorResponseDto[]>

export declare function eliminarComandoActuador(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>,
                                                mac: string | Ref<string>,
                                                keyword: string | Ref<string>): Promise<boolean>
