export declare function crearHuelga(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>,
                                    titulo: string,
                                    fechaInicio: number,
                                    fechaFin: number
                                  ): Promise<void>;

export declare function obtenerHuelgas(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        page: number,
                                        size: number
                                      ): Promise<any>;


export declare function borrarHuelga( toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>,
                                      titulo: string
                                    ): Promise<void>;