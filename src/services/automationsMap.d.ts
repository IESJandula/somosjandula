
export declare function obtenerDispositivos(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerCursosAcademicos(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerEspaciosFijo(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        cursoAcademico: Ref<string>): Promise<string[]>;

export declare function obtenerEspaciosDesdoble(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        cursoAcademico: Ref<string>): Promise<string[]>;

export declare function obtenerEspaciosSinDocencia(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        cursoAcademico: Ref<string>): Promise<string[]>;
