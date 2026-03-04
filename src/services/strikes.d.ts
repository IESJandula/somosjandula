export declare function crearHuelga( toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>,
                                      titulo: string,
                                      fechaInicio: number,
                                      fechaFin: number,
                                    ): Promise<string>;

export declare function obtenerHuelga(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>
                                    ): Promise<Huelga[]>;


export declare function borrarHuelga( toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>,
                                      titulo: string,
                                      fechaInicio: number
                                    ): Promise<void>;
