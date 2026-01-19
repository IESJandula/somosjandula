export declare function obtenerEventos(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>
                                      ): Promise<Evento[]>;


export declare function crearEvento( toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>,
                                      titulo: string,
                                      nombre: string,
                                      fechaInicio: number,
                                      fechaFin: number,
                                      usuarioNombre: string,
                                      usuarioApellidos: string,
                                      usuarioEmail: string
                                    ): Promise<string>;

export declare function borrarEvento( toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>,
                                      titulo: string,
                                      fechaInicio: number
                                    ): Promise<void>;
export declare function crearCategoria( toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        nombre: string,
                                        color: string
                                      ): Promise<string>;


export declare function obtenerCategorias(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>,  
                                        ): Promise<Categoria[]>;

export declare function borrarCategoria(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        nombre: string
                                      ): Promise<void>;

