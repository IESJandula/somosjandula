/****************************** Ventana X Common ******************************/
export declare function cargarCursosEtapas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any>;
export declare function asignarReducciones(email: Ref<string>,
                                           reduccion: Ref<string>,
                                           horas: Ref<number>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Ventana 1 CargarMatriculas ******************************/
export declare function subirFicheros(file: FormData,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;
export declare function cargarMatriculas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarMatriculas(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerDatosMatriculas(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function matricularAsignaturas(nombre: Ref<string>,
                                           apellidos: Ref<string>,
                                           asignatura: Ref<string>,
                                           curso: Ref<string>,
                                           etapa: Ref<string>,
                                           estado: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;
export declare function matricularAlumnoS(nombre: Ref<string>,
                                           apellidos: Ref<string>,
                                           asignatura: Ref<string>,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           estado: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function desmatricularAlumnos(nombre: Ref<string>,
                                           apellidos: Ref<string>,
                                           asignatura: Ref<string>,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           estado: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

export interface AsignaturaAdHocDto {
  nombre: string;
  curso: number;
  etapa: string;
}

export declare function crearAsignaturaAdHoc(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           asignaturaAdHocDto: AsignaturaAdHocDto): Promise<Response>;

export declare function borrarAsignaturaAdHoc(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           asignaturaAdHocDto: AsignaturaAdHocDto): Promise<Response>;

/****************************** Ventana 2 AsignaturasYBloques ******************************/
export declare function cargarAsignaturas(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function crearBloques(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           asignaturas: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function eliminarBloques(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           nombre: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignaturasSinDocencia(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           nombreAsignatura: Ref<string>,
                                           sinDocencia: boolean,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignaturasDesdobles(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           nombreAsignatura: Ref<string>,
                                           desdoble: boolean,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function mostrarHoras(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarHoras(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           nombre: Ref<string>,
                                           horas: Ref<number>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function subirHorasAsignaturasCsv(file: FormData,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Ventana 3 CrearGrupos ******************************/
export declare function obtenerAlumnosConGrupos(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerAlumnosSinGrupos(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarAlumnos(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           alumnosSeleccionados: Ref<string>[],
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarAlumnos(alumno: object,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function actualizarTurnoHorario(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           esHorarioMatutino: Ref<boolean>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 4 TablaResumen ******************************/
export declare function obtenerTodosGrupos(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any>;
export declare function cargarAsignaturasUnicas(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerCantidadAlumnosEnGrupoPorAsignatura(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           asignatura: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 5 AsignaturasYDepartamentos  ******************************/
export declare function obtenerDepartamentos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarProfesoresADepartamentos(nombre: Ref<string>,
                                           plantilla: Ref<number>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerDatosDepartamentosConAsignaturas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerCursosEtapasGrupos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerAsignaturasPorCursoEtapaGrupo(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerTodasLasAsignaturas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function quitarAsignaturasDeDepartamentos(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           nombre: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarAsignaturasADepartamentos(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           nombre: Ref<string>,
                                           departamentoPropietario: Ref<string>,
                                           departamentoReceptor: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 6 Reducciones ******************************/
export declare function cargarReducciones(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<any>;
export declare function crearReducciones(nombre: Ref<string>,
                                         horas: Ref<number>,
                                         decideDireccion: Ref<boolean>,
                                         curso: Ref<number>,
                                         etapa: Ref<string>,
                                         grupo: Ref<string>,
                                         toastMessage: Ref<string>,
                                         toastColor: Ref<string>,
                                         isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarReducciones(nombre: Ref<string>,
                                           horas: Ref<number>,
                                           decideDireccion: Ref<boolean>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerReduccionesProfesores(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarReduccionesProfesores(email: Ref<string>,
                                           reduccion: Ref<string>,
                                           horas: Ref<number>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Eleccion de horarios ******************************/
export declare function obtenerProfesoresHorarios(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerAsignaturas(email: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarAsignatura(nombre: Ref<string>,
                                           horas: Ref<number>,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           email: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;
export declare function obtenerReducciones(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerListaDiaTramoTipoHorario(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function actualizarConciliacion(email: Ref<string>,
                                           conciliacion: Ref<boolean>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function actualizarSinClasePrimeraHora(email: Ref<string>,
                                           sinClasePrimeraHora: Ref<boolean>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;   

export declare function actualizarOtrasObservaciones(email: Ref<string>,
                                           otrasObservaciones: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;   
export declare function obtenerObservaciones(email: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerSolicitudes(email: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function eliminarSolicitudes(email: Ref<string>,
                                           nombreAsignatura: Ref<string>,
                                           horasAsignatura: Ref<number>,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           nombreReduccion: Ref<string>,
                                           horasReduccion: Ref<number>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function guardarSolicitudes(email: Ref<string>,
                                           nombreAsignatura: Ref<string>,
                                           horasAsignatura: Ref<number>,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupoAntiguo: Ref<string>,
                                           grupoNuevo: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerGruposDeAsignaturas(nombreAsignatura: Ref<string>,
                                           horasAsignatura: Ref<number>,
                                           curso: Ref<number>,
                                           etapa: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any>;

/****************************** Validador de datos ******************************/
export declare function obtenerErroresDatos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Generador de Horarios ******************************/
export declare function lanzarGeneradorHorarios(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

export declare function forzarDetencionGeneradorHorarios(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

export declare function obtenerEstadoGeneradorHorarios(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Actualizar Restricciones Impartir ******************************/
export declare function actualizarRestriccionesImpartir(email: Ref<string>,
                                                        nombreAsignatura: Ref<string>,
                                                        curso: Ref<number>,
                                                        etapa: Ref<string>,
                                                        grupo: Ref<string>,
                                                        numeroRestriccion: Ref<number>,
                                                        diaDesc: Ref<string>,
                                                        tramoDesc: Ref<string>,
                                                        toastMessage: Ref<string>,
                                                        toastColor: Ref<string>,
                                                        isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Obtener Restricciones Impartir ******************************/
export declare function obtenerRestriccionesImpartir(email: Ref<string>,
                                                     nombreAsignatura: Ref<string>,
                                                     curso: Ref<number>,
                                                     etapa: Ref<string>,
                                                     grupo: Ref<string>,
                                                     toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen: Ref<boolean>): Promise<any>;

/****************************** Actualizar Restricciones Reduccion ******************************/

export declare function actualizarRestriccionesReduccion(email: Ref<string>,
                                                         nombreReduccion: Ref<string>,
                                                         curso: Ref<number>,
                                                         etapa: Ref<string>,
                                                         grupo: Ref<string>,
                                                         numeroRestriccion: Ref<number>,
                                                         diaDesc: Ref<string>,
                                                         tramoDesc: Ref<string>,
                                                         toastMessage: Ref<string>,
                                                         toastColor: Ref<string>,
                                                         isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Obtener Restricciones Reduccion ******************************/

export declare function obtenerRestriccionesReduccion(email: Ref<string>,
                                                     nombreReduccion: Ref<string>,
                                                     toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen: Ref<boolean>): Promise<any>;

/****************************** Obtener Lista de Días y Tramos ******************************/
export declare function obtenerListaDiaTramoTipoHorario(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any>;

/****************************** Obtener Lista de Días ******************************/
export declare function obtenerListaDias(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any>;

/****************************** Obtener Lista de Tramos ******************************/
export declare function obtenerListaTramos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any>;

/****************************** Seleccionar Solución ******************************/
export declare function seleccionarSolucion(idGeneradorInstancia: Ref<number>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Borrar Solución ******************************/
export declare function borrarSolucion(idGeneradorInstancia: Ref<number>,
                                       toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Obtener Horarios Individuales ******************************/
export declare function obtenerHorariosIndividuales(email: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Obtener Horarios Curso Etapa Grupo ******************************/
export declare function obtenerHorariosCursoEtapaGrupo(curso: Ref<number>,
                                           etapa: Ref<string>,
                                           grupo: Ref<string>,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

/****************************** Ventana A CursosEtapasEspacios ******************************/
export interface CursoEtapaDto {
  curso: number;
  etapa: string;
  esoBachillerato: boolean;
}

export interface CursoEtapaListadoItem extends CursoEtapaDto {}

export interface CursoEtapaApiDto {
  curso: number;
  etapa: string;
  esBachillerato: boolean;
  grupo?: string | null;
}

export declare function crearCursoEtapa(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoEtapaDto: CursoEtapaDto): Promise<Response>;

export declare function borrarCursoEtapa(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoEtapaDto: Pick<CursoEtapaDto, 'curso' | 'etapa'>): Promise<void>;

export declare function listarCursosEtapas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<CursoEtapaListadoItem[]>;

export declare function obtenerCursosAcademicos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function obtenerCursoAcademicoSeleccionado(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<string>;

export declare function crearCursoEtapaGrupo(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoEtapaGrupoDto: object): Promise<Response>;

export declare function obtenerCursosEtapasGruposPorCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function listarCursosEtapasGrupos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function copiarCursosEtapasGruposCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademicoOrigen: string,
                                           cursoAcademicoDestino: string,
                                           opcionesCopia?: string[]): Promise<Response>;

export declare function borrarTodosCursosEtapasGruposCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

export declare function borrarCursoEtapaGrupo(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoEtapaGrupoDto: object): Promise<void>;

export declare function crearEspacioSinDocencia(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioSinDocenciaDto: object): Promise<Response>;

export declare function obtenerEspaciosSinDocencia(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico?: string): Promise<any[]>;

export declare function borrarEspacioSinDocencia(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioSinDocenciaDto: object): Promise<void>;

export declare function crearEspacioFijo(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioFijoDto: object): Promise<Response>;

export declare function obtenerEspaciosFijo(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico?: string): Promise<any[]>;

export declare function borrarEspacioFijo(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioFijoDto: object): Promise<void>;

export declare function obtenerEspaciosFijoAsignados(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function obtenerEspaciosDisponibles(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function obtenerBloquesConAsignaturas(curso: number | string,
                                           etapa: string,
                                           toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function asignarEspacioDesdoble(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioDesdobleDto: object): Promise<any>;

export declare function obtenerEspaciosDesdobleAsignados(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function desasignarEspacioDesdoble(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioDesdobleDto: object): Promise<void>;

export declare function crearEspacioDesdoble(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioDesdobleDto: object): Promise<Response>;

export declare function obtenerEspaciosDesdoble(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico?: string): Promise<any[]>;

export declare function borrarEspacioDesdoble(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           espacioDesdobleDto: object): Promise<void>;

export declare function borrarTodosEspaciosCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

export declare function copiarEspaciosCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademicoOrigen: string,
                                           cursoAcademicoDestino: string): Promise<Response>;

export declare function listarDepartamentos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<any[]>;

export declare function crearDepartamento(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           departamentoDto: object): Promise<Response>;

export declare function copiarDepartamentosCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademicoOrigen: string,
                                           cursoAcademicoDestino: string): Promise<Response>;

export declare function borrarTodosDepartamentosCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<Response>;

export declare function borrarDepartamento(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           departamentoDto: object): Promise<void>;

export interface AsignaturaCursoAcademicoItem {
  curso: number;
  etapa: string;
  nombre: string;
  horas: number;
}

export interface ReduccionCursoAcademicoItem {
  nombre: string;
  horas: number;
  decideDireccion: boolean;
  curso: number | null;
  etapa: string | null;
  grupo: string | null;
}

export declare function listarAsignaturasCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<AsignaturaCursoAcademicoItem[]>;

export declare function listarReduccionesCursoAcademico(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<ReduccionCursoAcademicoItem[]>;

export interface BorrarReduccionDto {
  nombre: string;
  horas: number;
  decideDireccion: boolean;
}

export declare function borrarTodasAsignaturas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico: string): Promise<Response>;

export declare function borrarTodasReduccionesNoTutoria(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico: string): Promise<Response>;

export declare function borrarTodasReduccionesTutoria(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico: string): Promise<Response>;

export declare function borrarReduccion(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>,
                                           cursoAcademico: string,
                                           reduccionDto: BorrarReduccionDto): Promise<Response>;