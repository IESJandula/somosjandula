<template>
  <div class="table-container">
    <h1 class="t-1">Asignaturas y bloques</h1>
    <FilterCursoEtapa 
      v-model="filtroSeleccionadoString"
      @actualizar-select="actualizarSelect" 
      selectClass="select-sm"
      class="texto-dropdown"/>

    <!-- Tarjeta que contiene la tabla de asignaturas -->
    <ion-card class="card-table">
      <ion-card-header>
        <ion-card-title class="t-2">Tabla de Asignaturas</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div v-if="loading" class="cargar">Cargando datos...</div>
        <div v-if="bloquesConUnaAsignatura.length > 0" class="mensajeBloqueUnico">
          {{ bloquesConUnaAsignatura.length === 1
            ? `El bloque ${bloquesConUnaAsignatura[0]} tiene una asignatura, elimínalo, ya un bloque debe tener al menos dos asignaturas.`
            : `Los bloques ${bloquesConUnaAsignatura.join(", ")} tienen una asignatura, elimínalos, ya que un bloque debe tener al menos dos asignaturas.` }}
        </div>

        <!-- Tabla de asignaturas -->
        <div v-if="asignaturas.length > 0 && !loading">
          <table class="table-asignaturas">
            <thead>
            <tr>
              <th class="th-seleccion">Selecciona para crear un bloque</th>
              <th class="th-nombre">Nombre</th>
              <th class="th-bloque">Bloque</th>
              <th class="th-sin-docencia">Asignaturas sin docencia</th>
              <th class="th-desdoble">Desdoble</th>
              <th class="th-horas">Horas</th>
              <th class="th-accion">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="asignatura in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="t-3 th">
                <input 
                  type="checkbox" 
                  class="checkbox"
                  :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null"
                  v-model="asignaturasSeleccionadas" :value="asignatura" />
              </td>
              <td class="th">{{ asignatura.nombre }}</td>
              <td class="th">
                <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null" class="t-3">
                  Bloque {{ asignatura.bloqueId }}
                  <button @click="eliminarBloque(asignatura)" class="btn-x">X</button>
                </div>
                <div v-else class="t-3">Sin bloque</div>
              </td>
              <td class="th t-3">
                <input 
                  type="checkbox" 
                  class="checkbox"
                  v-model="asignatura.sinDocencia" 
                  @click="asignaturaSinDocencia(asignatura)"/>
              </td>
              <td class="th t-3">
                <input 
                  type="checkbox" 
                  class="checkbox"
                  v-model="asignatura.desdoble" 
                  @click="asignaturasDesdoble(asignatura)"/>
              </td>
              <td class="t-3 th">
              <ion-input 
                type="number" 
                v-model.number="horasPorAsignatura[asignatura.nombre]"
                min="1" 
                step="1" 
                class="form-input-numer">
              </ion-input>
            </td>
            <td class="t-3 th">
              <button class="btn-horas" @click="guardarHoras(asignatura.nombre)">Actualizar hora</button>
            </td>
            </tr>
            </tbody>
          </table>
          <div class="container-botones">
            <button class="btn-bloque" @click="crearBloque" :disabled="asignaturasSeleccionadas.length < 2 || loading">
            {{ loading ? "Procesando..." : "CREAR BLOQUE" }}
            </button>
            <button class="btn-actualizar-todas-horas" @click="guardarTodasHoras">ACTUALIZAR HORAS</button>
          </div>
        </div>

        <div v-else-if="!loading" class="t-3">
          <p>No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-toast
        :is-open="isToastOpen"
        :message="toastMessage"
        :color="toastColor"
        duration="2000"
        @did-dismiss="() => (isToastOpen = false)"
        position="top">
    </ion-toast>
  </div>
</template>

<script setup>
import { ref, watch} from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { crearToast } from '@/utils/toast.js';
import { cargarAsignaturas, crearBloques, eliminarBloques, asignaturasSinDocencia, asignaturasDesdobles, mostrarHoras, asignarHoras } from '@/services/schoolManager.js'
import { IonToast, IonCard, IonInput, IonCardContent, IonCardHeader, IonCardTitle } from "@ionic/vue";

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const asignaturas = ref([]);
const columnasGrupos = ref([]);
const asignaturasSeleccionadas = ref([]);
const loading = ref(false);
const asignaturasConHoras = ref([]);
const horasPorAsignatura = ref({});
const isProcessing = ref(false); // Estado de carga para "Guardar Todo"
const bloquesConUnaAsignatura = ref([]);
const filtroSeleccionadoString = ref('');
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";


const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
    filtroSeleccionadoString.value = `${seleccionado.curso}-${seleccionado.etapa}`;
    console.log("Filtro actualizado:", seleccionado);
};

const actualizarBloquesConUnaAsignatura = () => {
  const bloques = asignaturas.value.reduce((acc, asignatura) => {
    if (asignatura.bloqueId) {
      if (!acc[asignatura.bloqueId]) {
        acc[asignatura.bloqueId] = [];
      }
      acc[asignatura.bloqueId].push(asignatura);
    }
    return acc;
  }, {});

  // Filtrar los bloques que solo tienen una asignatura
  bloquesConUnaAsignatura.value = Object.entries(bloques)
    .filter(([, asignaturasBloque]) => asignaturasBloque.length === 1)
    .map(([bloqueId]) => bloqueId);
};

const cargarAsignatura = async () => {
  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {
    asignaturas.value = [];
    columnasGrupos.value = [];
    return;
  }

  loading.value = true;

  try {
    const response = await cargarAsignaturas(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);
    
    asignaturas.value = response;

    asignaturas.value = Array.isArray(response) ? response : [];
    console.log(asignaturas.value.length);
  
    actualizarBloquesConUnaAsignatura(); // Actualiza los bloques con una asignatura

    const gruposSet = new Set();
    asignaturas.value.forEach((asignatura) => {
      const grupos = typeof asignatura.numeroAlumnosEnGrupo === 'object' ? asignatura.numeroAlumnosEnGrupo : {};
      Object.keys(grupos).forEach((grupo) => {
        gruposSet.add(grupo);
      });
    });
    columnasGrupos.value = Array.from(gruposSet);

  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
    asignaturas.value = [];
  } finally {
    loading.value = false;
  }
};


const crearBloque = async () => {
  if (asignaturasSeleccionadas.value.length < 2) {
    mensajeActualizacion = "Debe seleccionar al menos dos asignaturas.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }
  // esta propiedad hace que se vuelva a cargar el template
  loading.value = true;

  try {
    const nombresSeleccionados = asignaturasSeleccionadas.value.map(a => a.nombre);
    const response = await crearBloques(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      nombresSeleccionados, 
      toastMessage, 
      toastColor, 
      isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Bloque creado correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }
    
    asignaturasSeleccionadas.value = [];
    //Esta tambien pero quizas es necesario que lo haga para que cambie la casilla de bloque
    await cargarAsignatura();
    
  } catch (error) {
    mensajeActualizacion = "Error al crear el bloque.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const eliminarBloque = async (asignatura) => {
  loading.value = true;
  try {
    const response =  await eliminarBloques(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      asignatura.nombre, 
      toastMessage, 
      toastColor, 
      isToastOpen);

    if(response.ok) {
      mensajeActualizacion = `Bloque ${asignatura.bloqueId} eliminado correctamente correctamente.`;
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }
      
    asignatura.bloqueId = null;
    cargarAsignatura();

    actualizarBloquesConUnaAsignatura(); // Actualiza los bloques con una asignatura

    } catch (error) {
    mensajeActualizacion = "Error al eliminar el bloque.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const asignaturaSinDocencia = async (asignatura) => {
  try {

    // Invertimos el valor actual de sinDocencia
    const nuevoValor = !asignatura.sinDocencia;
    
    const response = await asignaturasSinDocencia(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      asignatura.nombre,
      nuevoValor,
      toastMessage, 
      toastColor, 
      isToastOpen
    );

    if(response.ok) {
      mensajeActualizacion = `Asignatura ${asignatura.nombre} ${nuevoValor ? 'marcada' : 'desmarcada'} como sin docencia`;
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    // Actualizamos el valor en la asignatura
    asignatura.sinDocencia = nuevoValor;

  } catch (error) {
    mensajeActualizacion = "Error al actualizar el estado de sin docencia";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    // Revertimos el cambio en caso de error
    asignatura.sinDocencia = !nuevoValor;
  }
};

const asignaturasDesdoble = async (asignatura) => {
  try {
    // Invertimos el valor actual de desdoble
    const nuevoValor = !asignatura.desdoble;

    const response = await asignaturasDesdobles(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      asignatura.nombre,
      nuevoValor,
      toastMessage, 
      toastColor, 
      isToastOpen
    );

    if(response.ok) {
      mensajeActualizacion = `Asignatura ${asignatura.nombre} ${nuevoValor ? 'marcada' : 'desmarcada'} como desdoble`;
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = "Error al desdoblar la asignatura.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const mostrarHora = async () => {

  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {
    asignaturasConHoras.value = [];
    return;
  }

  loading.value = true;

  try {
    // Llamada al servicio que obtiene las horas
    const response = await mostrarHoras(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);
    console.log(response);

    asignaturasConHoras.value =Array.isArray(response) ? response : []; // Guarda los resultados

    console.log(asignaturasConHoras.value)
    // Inicializa el objeto de horasPorAsignatura
    horasPorAsignatura.value = asignaturasConHoras.value.reduce((acc, item) => {
      acc[item.nombre] = item.horas;
      return acc;
    }, {});

  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const guardarHoras = async (nombreAsignatura) => {
  if (horasPorAsignatura.value[nombreAsignatura] < 0) {
    mensajeActualizacion = "Asignatura con horas negativas";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  try {
    const response = await asignarHoras(
      filtroSeleccionado.value.curso,
      filtroSeleccionado.value.etapa,
      nombreAsignatura,
      horasPorAsignatura.value[nombreAsignatura],
      toastMessage, 
      toastColor, 
      isToastOpen
    );

    if(response.ok) {
      mensajeActualizacion = `Has actualizado las horas de ${nombreAsignatura}.`;
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = "Error al actualizar las horas.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  } 
};

const guardarTodasHoras = async () => {
  const asignaturasAActualizar = Object.entries(horasPorAsignatura.value).filter(
    ([, horas]) => horas > 0
  );

  if (asignaturasAActualizar.length === 0) {
    toastMessage.value = "No hay cambios para guardar.";
    toastColor.value = "warning";
    isToastOpen.value = true;
    return;
  }

  isProcessing.value = true;

  try {

    let response = null;

    for (const [nombre, horas] of asignaturasAActualizar) {
      response = await asignarHoras(
      filtroSeleccionado.value.curso,
      filtroSeleccionado.value.etapa,
      nombre,
      horas,
      toastMessage, 
      toastColor, 
      isToastOpen)
    }

    if(response.ok) {
      mensajeActualizacion = "Todas las asignaturas se actualizaron correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = "Error al actualizar las horas.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  } finally {
    isProcessing.value = false;
    isToastOpen.value = true;
  }
};

watch([() => filtroSeleccionado.value.curso, () => filtroSeleccionado.value.etapa], 
async () =>{
  cargarAsignatura();
  mostrarHora();
},
 { immediate: true });
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.texto-dropdown {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.card-table {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 56rem;
  overflow: auto;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
}

.t-2 {
  font-size: 1.3rem;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.cargar {
  text-align: center;
  color: #6b7280;
}

.mensajeBloqueUnico {
  color: #f56565;
  margin-bottom: 1rem;
}

.table-asignaturas {
  color: black;
  table-layout: auto;
  border-collapse: collapse;
  border: 1px solid currentColor;
  width: 100%;
}

.th-seleccion {
  width: 15%;
  border: 1px solid currentColor; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.th-nombre {
  border: 1px solid currentColor; 
  text-align: center;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.th-asignatura {
  width: 15%;
  border: 1px solid black; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.th-bloque {
  border: 1px solid currentColor;
  width: 11.5%;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.th-sin-docencia {
  border: 1px solid currentColor;
  width: 12.5%;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.th-desdoble {
  border: 1px solid currentColor;
  width: 10%;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.th-horas {
  border: 1px solid currentColor;
  width: 8%;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.th-accion {
  width: 14%;
  border: 1px solid currentColor; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.th {
  border: 1px solid currentColor; 
  padding-left: 1rem; 
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox:disabled {
  cursor: not-allowed;
}

.bloque {
  text-align: center;
}

.btn-x {
  margin-left: 0.5rem;
  color: #f56565;
  font-size: 15px;
  background-color: transparent;
  border-radius: 0.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.btn-x:hover {
  text-decoration: underline;
}

.t-3 {
  text-align: center;
  color: black;
}

.form-input-numer {
  max-width: 60px;
  text-align: center;
  background: transparent;
}

.btn-horas {
  background-color: #0054e9;
  color: #ffffff;
  border-radius: 0.25rem;
  padding: 0.5rem;
  height: 45px;
}

.btn-horas:hover {
  background-color: #1461eb;
}

.container-botones {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-top: 1rem;
}

.btn-bloque {
  width: 145px;
  height: 45px;
  border-radius: 0.375rem; 
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.02rem;
  font-weight: 600;
}

.btn-bloque:hover {
  background-color: #1461eb;
}

.btn-actualizar-todas-horas {
  width: 180px;
  height: 45px;
  margin-left: auto;
  background-color: #0054e9;
  color: #ffffff;
  border-radius: 0.375rem;
  font-size: 1.02rem;
  font-weight: 550;
}

.btn-actualizar-todas-horas:hover {
  background-color: #1461eb;
}

button:disabled {
  opacity: 0.5;
}

@media (prefers-color-scheme: dark) {
  .btn-horas,
  .btn-bloque,
  .btn-actualizar-todas-horas {
    color: #000000;
    background-color: #4782eb
  }

  .table-asignaturas {
    color: #c4c6ca;
  }

  .t-3 {
    color: #c4c6ca;
  }

  .btn-bloque:hover {
  background-color: #3476eb;
  }

  .btn-horas:hover {
    background-color: #3476eb;
  }

  .btn-actualizar-todas-horas:hover {
    background-color: #3476eb;
  }
}

@media (max-width: 768px) {
  .card-table {
    width: 100%;
    max-width: 100%;
  }

  .table-asignaturas {
    font-size: 0.9rem;
  }

  .th-seleccion, 
  .th-nombre, 
  .th-bloque, 
  .th-sin-docencia, 
  .th-desdoble, 
  .th-horas, 
  .th-accion {
    padding: 0.3rem;
  }

  .btn-bloque {
    width: 100%;
    margin-bottom: 1rem;
    
  }

  .container-botones {
    width: 630px;
   flex-direction: row;  /* Apila los botones en móvil */
  }

  .btn-actualizar-todas-horas {
    margin-left: 11rem;
    width: 500px;
  }
}


</style>
