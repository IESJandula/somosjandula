
export interface Ubicacion {
  nombreUbicacion: string;
  dispositivos?: Dispositivo[];
}

export interface Dispositivo {
  mac: string;
  estado: string;
  ubicacion?: Ubicacion;
}

export interface Sensor extends Dispositivo {
  ultimaActualizacion?: string; 
  umbralMinimo?: number;
  umbralMaximo?: number;
}

export interface SensorBooleano extends Sensor {
  valorActual?: boolean;
}

export interface SensorNumerico extends Sensor {
  valorActual?: number;
}

export interface Actuador extends Dispositivo {
  acciones?: any[];
  listaComandos?: any[];
}

export type TipoDispositivo =
  | Actuador
  | SensorBooleano
  | SensorNumerico;


export interface DispositivosPorZona {
  actuadores: Actuador[];
  sensoresBooleanos: SensorBooleano[];
  sensoresNumericos: SensorNumerico[];
}

export interface ResumenZona {
  actuadores: number;
  sensoresBooleanos: number;
  sensoresNumericos: number;
  total: number;

  listaActuadores: Actuador[];
  listaSensoresBooleanos: SensorBooleano[];
  listaSensoresNumericos: SensorNumerico[];
}

export declare function obtenerDispositivos(toastMessage: Ref<string>,
                                        toastColor: Ref<string>,
                                        isToastOpen: Ref<boolean>): Promise<string[]>;
