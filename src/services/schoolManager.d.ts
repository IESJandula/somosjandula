/****************************** Ventana 1 CargarMatriculas ******************************/
export declare function cargarCursosEtapas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function subirFicheros(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerCursosCargados(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarMatriculas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerDatosMatriculas(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;
export declare function matricularAsignaturasCsv(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;
export declare function matricularAlumnoSCsv(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;
export declare function desmatricularAlumnosCsv(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;
                                           
/****************************** Ventana 2 AsignaturasYBloques ******************************/
export declare function cargarAsignaturas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function crearBloques(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function eliminarBloques(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignaturasSinDocencia(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function mostrarHoras(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarHoras(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 3 CrearGrupos ******************************/
export declare function crearNuevosGrupos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerInfoGrupos(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerAlumnosConGrupos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerAlumnosSinGrupos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarAlumnos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarAlumnos(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function actualizarTurnoHorario(curso: Ref<string>,
                                               etapa: Ref<string>,
                                               grupo: Ref<string>,
                                               esHorarioMatutino: Ref<boolean>,
                                               toastMessage: Ref<string>,
                                               toastColor: Ref<string>,
                                               isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 4 TablaResumen ******************************/
export declare function cargarAsignaturasUnicas(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerNumAlumnosAsignatura(toastMessage: Ref<string>,
                                                    toastColor: Ref<string>,
                                                    isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 5 AsignaturasYDepartamentos  ******************************/
export declare function obtenerDepartamentos(toastMessage: Ref<string>,
                                             toastColor: Ref<string>,
                                             isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarProfesoresADepartamentos(toastMessage: Ref<string>,
                                                        toastColor: Ref<string>,
                                                        isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerDatosDepartamentosConAsignaturas(toastMessage: Ref<string>,
                                                                toastColor: Ref<string>,
                                                                isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerCursosEtapasGrupos(toastMessage: Ref<string>,
                                                  toastColor: Ref<string>,
                                                  isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerAsignaturasPorCursoEtapaGrupo(toastMessage: Ref<string>,
                                                             toastColor: Ref<string>,
                                                             isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerTodasLasAsignaturas(toastMessage: Ref<string>,
                                                   toastColor: Ref<string>,
                                                   isToastOpen: Ref<boolean>): Promise<void>;
export declare function quitarAsignaturasDeDepartamentos(toastMessage: Ref<string>,
                                                         toastColor: Ref<string>,
                                                         isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarAsignaturasADepartamentos(toastMessage: Ref<string>,
                                                         toastColor: Ref<string>,
                                                         isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Ventana 6 Reducciones ******************************/
export declare function cargarReducciones(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<void>;
export declare function crearReducciones(toastMessage: Ref<string>,
                                         toastColor: Ref<string>,
                                         isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarReducciones(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerProfesores(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarReducciones(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerReduccionesProfesores(toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen: Ref<boolean>): Promise<void>;
export declare function borrarReduccionesProfesores(toastMessage: Ref<string>,
                                                    toastColor: Ref<string>,
                                                    isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Eleccion de horarios ******************************/
export declare function obtenerAsignaturas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerGruposDeAsignaturas(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerReducciones(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function asignarAsignatura(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerDiasTramosTipoHorario(toastMessage: Ref<string>,
                                                     toastColor: Ref<string>,
                                                     isToastOpen: Ref<boolean>): Promise<void>;
export declare function actualizarObservaciones(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;
export declare function obtenerSolicitudes(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function eliminarSolicitudes(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<void>;
export declare function guardarSolicitudes(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Eleccion de horarios ******************************/
export declare function obtenerSolicitudes(toastMessage: Ref<string>,
                                           toastColor: Ref<string>,
                                           isToastOpen: Ref<boolean>): Promise<void>;
export declare function eliminarSolicitudes(toastMessage: Ref<string>,
                                            toastColor: Ref<string>,
                                            isToastOpen: Ref<boolean>): Promise<void>;

/****************************** Generador de Horarios ******************************/

export declare function lanzarGeneradorHorarios(toastMessage: Ref<string>,
                                                toastColor: Ref<string>,
                                                isToastOpen: Ref<boolean>): Promise<void>;

export declare function forzarDetencionGeneradorHorarios(toastMessage: Ref<string>,
                                                          toastColor: Ref<string>,
                                                          isToastOpen: Ref<boolean>): Promise<void>;