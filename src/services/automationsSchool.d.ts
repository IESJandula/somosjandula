export declare function postSensorBooleano(toastMessage: Ref<string>,
                                      toastColor: Ref<string>,
                                      isToastOpen: Ref<boolean>): Promise<void>;

export declare function getpostSensorBooleano(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function deletepostSensorBooleano(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function postSensorNumerico(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function getSensorNumerico(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function deleteSensorNumerico(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerSensores(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;

export declare function obtenerActuadores(toastMessage: Ref<string>,
                                    toastColor: Ref<string>,
                                    isToastOpen: Ref<boolean>): Promise<[]>;