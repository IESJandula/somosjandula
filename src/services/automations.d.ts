export type VistaPajaroResponseDto = 
{
  mapaActuadores: Record<string, any[]>
  mapaSensoresBooleanos: Record<string, any[]>
  mapaSensoresNumericos: Record<string, any[]>
}

export type PageResponseDto<T> = 
{
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export type ComandoResponseDto = 
{
  keyword: string
  mac: string
  ordenId: number
}

export type ComandoActuadorResponseDto = 
{
  mac: string
  keyword: string
  comandos: string
  textoOk: string
  indiceRele?: number | null
}

export type ComandoActuadorPuertaResponseDto =
{
  comandoActuadorMac: string
  comandoActuadorKeyword: string
  indiceRele: number
}

export type AccionResponseDto = 
{
  id: number
  resultado: string
  mac: string
  orden_id: number
}

export type OrdenSimpleResponseDto = 
{
  id: number
  email: string
  nombre: string
  apellidos: string
  fecha: string
}

export type ActuadorResponseDto = 
{
  mac: string
  estado: string
  nombreUbicacion: string
  tipo: string
  numeroReles?: number | null
}
export type ActuadorAccionPendienteResponseDto =
{
  accionId: number
  orden: string
  keyword?: string
  indiceRele?: number | null
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

export declare function crearActuadorPuerta(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>,
                                            mac: Ref<string> | string,
                                            estado: Ref<string> | string,
                                            nombreUbicacion: Ref<string> | string,
                                            tipo: Ref<string> | string,
                                            numeroReles: Ref<number> | number): Promise<boolean>;

export declare function crearActuadorProyector(toastMessage: Ref<string>,
                                               toastColor: Ref<string>,
                                               isToastOpen: Ref<boolean>,
                                               mac: Ref<string> | string,
                                               estado: Ref<string> | string,
                                               nombreUbicacion: Ref<string> | string,
                                               tipo: Ref<string> | string,
                                               comandoEstado: Ref<string> | string): Promise<boolean>;

export declare function obtenerActuadores(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<ActuadorResponseDto[]>;

export declare function eliminarActuador(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        mac: Ref<string>): Promise<string[]>;

export declare function eliminarActuadorPuerta(toastMessage: Ref<string>,
                                               toastColor: Ref<string>,
                                               isToastOpen: Ref<boolean>,
                                               mac: Ref<string> | string): Promise<boolean>;

export declare function eliminarActuadorProyector(toastMessage: Ref<string>,
                                                  toastColor: Ref<string>,
                                                  isToastOpen: Ref<boolean>,
                                                  mac: Ref<string> | string): Promise<boolean>;

export declare function obtenerUbicaciones(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerTiposActuador(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerTiposSensores(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;

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

export declare function crearComandoActuador(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>,
                                            mac: string | Ref<string>,
                                            keyword: Ref<string> | string,
                                            comandos: Ref<string> | string,
                                            textoOk: Ref<string> | string): Promise<boolean>

export declare function crearComandoActuadorPuerta(toastMessage: Ref<string>,
                                                   toastColor: Ref<string>,
                                                   isToastOpen: Ref<boolean>,
                                                   mac: Ref<string> | string,
                                                   keyword: Ref<string> | string,
                                                   indiceRele: Ref<number> | number): Promise<boolean>

export declare function obtenerComandosActuador(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>,
                                                page?: number,
                                                size?: number): Promise<PageResponseDto<ComandoActuadorResponseDto>>

export declare function obtenerComandosActuadorPuerta(toastMessage: Ref<string>,
                                                      toastColor: Ref<string>,
                                                      isToastOpen: Ref<boolean>): Promise<ComandoActuadorPuertaResponseDto[]>

export declare function eliminarComandoActuador(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>,
                                                mac: string | Ref<string>,
                                                keyword: string | Ref<string>): Promise<boolean>

export declare function eliminarComandoActuadorPuerta(toastMessage: Ref<string>,
                                                      toastColor: Ref<string>,
                                                      isToastOpen: Ref<boolean>,
                                                      mac: Ref<string> | string,
                                                      keyword: Ref<string> | string,
                                                      indiceRele: Ref<number> | number): Promise<boolean>

export declare function obtenerAcciones(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>,
                                        page?: number,
                                        size?: number): Promise<PageResponseDto<AccionResponseDto>>

export declare function obtenerOrdenesSimples(toastMessage: Ref<string>,
                                              toastColor: Ref<string>,
                                              isToastOpen: Ref<boolean>): Promise<OrdenSimpleResponseDto[]>

export declare function obtenerActuadoresPaginacion(toastMessage: Ref<string>,
                                                    toastColor: Ref<string>,
                                                    isToastOpen: Ref<boolean>,
                                                    page?: number,
                                                    size?: number): Promise<PageResponseDto<ActuadorResponseDto>>;

export declare function obtenerSensorBooleanoPaginacion(toastMessage: Ref<string>,
                                                        toastColor: Ref<string>,
                                                        isToastOpen: Ref<boolean>,
                                                        page?: number,
                                                        size?: number): Promise<PageResponseDto<any>>;

export declare function obtenerSensorNumericoPaginacion(toastMessage: Ref<string>,
                                                        toastColor: Ref<string>,
                                                        isToastOpen: Ref<boolean>,
                                                        page?: number,
                                                        size?: number): Promise<PageResponseDto<any>>;
                                                        
export declare function obtenerAccionesPendientesActuador(toastMessage: Ref<string>,
                                                          toastColor: Ref<string>,
                                                          isToastOpen: Ref<boolean>,
                                                          mac: Ref<string> | string): Promise<ActuadorAccionPendienteResponseDto[]>