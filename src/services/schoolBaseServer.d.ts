export declare function obtenerCursosAcademicos(toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>): Promise<void>;

export declare function seleccionarCursoAcademico(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function crearCursoEtapaGrupo(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerCursosEtapasGrupos(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function borrarCursoEtapaGrupo(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;
                                    
export declare function crearEspacioSinDocencia(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;

export declare function obtenerEspaciosSinDocencia(toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>): Promise<void>;

export declare function borrarEspacioSinDocencia(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function crearEspacioFijo(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerEspaciosFijo(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function borrarEspacioFijo(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;
                                    
export declare function crearEspacioDesdoble(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;

export declare function obtenerEspaciosDesdoble(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;

export declare function borrarEspacioDesdoble(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;

export declare function obtenerCursosAcademicos(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<any[]>

export declare function obtenerEspaciosFijo(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>,
                                            cursoAcademico: string): Promise<any[]>

export declare function obtenerEspaciosDesdoble(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>,
                                                cursoAcademico: string): Promise<any[]>

export declare function obtenerEspaciosSinDocencia(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>,
                                                cursoAcademico: string): Promise<any[]>
