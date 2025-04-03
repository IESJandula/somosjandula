<script setup>
import { ref, watch} from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { cargarAsignaturas, crearBloques, eliminarBloques, mostrarHoras, asignarHoras } from '@/services/schoolManager.js'
import { IonToast, IonCard, IonInput, IonButton, IonCardContent, IonCardHeader, IonCardTitle } from "@ionic/vue";

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const asignaturas = ref([]);
const columnasGrupos = ref([]);
const asignaturasSeleccionadas = ref([]);
const loading = ref(false);
const errorMensaje = ref("");
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const asignaturasConHoras = ref([]);
const horasPorAsignatura = ref({});
const isProcessing = ref(false); // Estado de carga para "Guardar Todo"
const bloquesConUnaAsignatura = ref([]);


const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
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
  errorMensaje.value = "";

  try {
    const data = await cargarAsignaturas(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);
    
    asignaturas.value = data;

    asignaturas.value = Array.isArray(data) ? data : [];
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
    errorMensaje.value = "Error al cargar asignaturas. Inténtelo de nuevo.";
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};


const crearBloque = async () => {
  if (asignaturasSeleccionadas.value.length < 2) {
    errorMensaje.value = "Debe seleccionar al menos dos asignaturas.";
    return;
  }
  // esta propiedad hace que se vuelva a cargar el template
  loading.value = true;
  errorMensaje.value = "";

  try {
    const nombresSeleccionados = asignaturasSeleccionadas.value.map(a => a.nombre);
    await crearBloques(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      nombresSeleccionados, 
      toastMessage, 
      toastColor, 
      isToastOpen);

    
    asignaturasSeleccionadas.value = [];
    //Esta tambien pero quizas es necesario que lo haga para que cambie la casilla de bloque
    await cargarAsignatura();
    
  } catch (error) {
    errorMensaje.value = "Error al crear el bloque.";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};



const eliminarBloque = async (asignatura) => {
  loading.value = true;
  errorMensaje.value = "";
  try {
    await eliminarBloques(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      asignatura.nombre, 
      asignatura.grupo, 
      toastMessage, 
      toastColor, 
      isToastOpen);
      
    asignatura.bloqueId = null;
    cargarAsignatura();

    actualizarBloquesConUnaAsignatura(); // Actualiza los bloques con una asignatura

    } catch (error) {
    errorMensaje.value = "Error al eliminar el bloque.";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

const mostrarHora = async () =>{

  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {
    asignaturasConHoras.value = [];
    return;
  }

  loading.value = true;
  errorMensaje.value = "";

  try {
    // Llamada al servicio que obtiene las horas
    const data = await mostrarHoras(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);
    console.log(data);

    asignaturasConHoras.value =Array.isArray(data) ? data : []; // Guarda los resultados

    console.log(asignaturasConHoras.value)
    // Inicializa el objeto de horasPorAsignatura
    horasPorAsignatura.value = asignaturasConHoras.value.reduce((acc, item) => {
      acc[item.nombre] = item.horas;
      return acc;
    }, {});

  } catch (error) {
    errorMensaje.value = "Error al cargar las horas. Inténtelo de nuevo.";
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

const guardarHoras = async (nombreAsignatura) => {
  if (!horasPorAsignatura.value[nombreAsignatura] || horasPorAsignatura.value[nombreAsignatura] <= 0) {
    errorMensaje.value = "Seleccione una asignatura válida y horas mayores a 0.";
    return;
  }

  try {
    await asignarHoras(
      filtroSeleccionado.value.curso,
      filtroSeleccionado.value.etapa,
      nombreAsignatura,
      horasPorAsignatura.value[nombreAsignatura],
      toastMessage, 
      toastColor, 
      isToastOpen
    );

    toastMessage.value = `Horas actualizadas para ${nombreAsignatura}.`;
    toastColor.value = "success";
    isToastOpen.value = true;

  } catch (error) {
    errorMensaje.value = "Error al actualizar las horas.";
    console.error("Error:", error);
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
    for (const [nombre, horas] of asignaturasAActualizar) {
      await guardarHoras(nombre, horas );
    }

    toastMessage.value = "Todas las asignaturas se actualizaron correctamente.";
    toastColor.value = "success";
  } catch (error) {
    console.error("Error al actualizar todas las horas:", error);
    toastMessage.value = "Error al actualizar las horas.";
    toastColor.value = "danger";
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

<template>
  <div class="container">
    <h1 class="m-4">Asignaturas y bloques</h1>
    <FilterCursoEtapa @actualizar-select="actualizarSelect" class="m-1"/>

    <!-- Tarjeta que contiene la tabla de asignaturas -->
    <ion-card class="m-6">
      <ion-card-header>
        <ion-card-title style="text-align: center;">Tabla de Asignaturas</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div v-if="errorMensaje" class="mensejeError">{{ errorMensaje }}</div>
        <div v-if="loading" class="cargar">Cargando datos...</div>
        <div v-if="bloquesConUnaAsignatura.length > 0" class="mensajeBloqueUnico">
          {{ bloquesConUnaAsignatura.length === 1
            ? `El bloque ${bloquesConUnaAsignatura[0]} tiene una asignatura, elimínalo, ya un bloque debe tener al menos dos asignaturas.`
            : `Los bloques ${bloquesConUnaAsignatura.join(", ")} tienen una asignatura, elimínalos, ya que un bloque debe tener al menos dos asignaturas.` }}
        </div>

        <!-- Tabla de asignaturas -->
        <div v-if="asignaturas.length > 0 && !loading">
          <table class="table">
            <thead>
            <tr>
              <th class="th">Selecciona para crear un bloque</th>
              <th class="th">Nombre</th>
              <th class="td-bloque">Bloque</th>
              <th class="th">Horas</th>
              <th class="th">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="asignatura in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="p-4 th">
                <input type="checkbox" :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null"
                       v-model="asignaturasSeleccionadas" :value="asignatura" />
              </td>
              <td class="th">{{ asignatura.nombre }}</td>
              <td class="th">
                <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null" class="bloque">
                  Bloque {{ asignatura.bloqueId }}
                  <button @click="eliminarBloque(asignatura)" class="btn-x">X</button>
                </div>
                <div v-else class="m-7">Sin bloque</div>
              </td>
              <td class="p-4 th">
              <ion-input type="number" v-model.number="horasPorAsignatura[asignatura.nombre]"
                  min="1" step="1" class="form-input-numer">
              </ion-input>
            </td>
            <td class="p-4 th">
              <button class="btn" @click="guardarHoras(asignatura.nombre)">Actualizar hora</button>
            </td>
            </tr>
            </tbody>
          </table>
          <div class="btn-container">
            <ion-button @click="crearBloque" :disabled="asignaturasSeleccionadas.length < 2 || loading">
            {{ loading ? "Procesando..." : "Crear Bloque" }}
            </ion-button>
            <ion-button class="btn-todo" @click="guardarTodasHoras">Actualizar horas</ion-button>
          </div>
        </div>

        <div v-else-if="!loading" class="m-7">
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

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}
.m-1 {
  font-size: 20px;
  flex-grow: 1; 
  
}
.m-4 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.m-6 {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 56rem;
  overflow: auto;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
}
.th {
  border: 1px solid currentColor; 
  padding-left: 0.3rem; 
  padding-right: 0.3rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.td-bloque{
  border: 1px solid currentColor;
  padding-left: 2rem; 
  padding-right: 2rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.mensajeBloqueUnico {
  color: #f56565;
  margin-bottom: 1rem;
}


.bloque{
  text-align: center;
}
.form-input-numer {
  max-width: 60px;
  text-align: center;
  background: transparent;
}
.table{
  color: black;
  table-layout: auto;
  border-collapse: collapse;
  border: 1px solid currentColor;
  width: 100%;
}
.mensejeError{
  color: #f56565;
  margin-bottom: 1rem;
  text-align: center;
}
.cargar{
  text-align: center;
  color: #6b7280;
}
.p-4{
  text-align: center;
  padding-left: 1rem;
  padding-right: 1rem;
}
.m-7{
  margin-top: 1.5rem;
  text-align: center;
  color: black;
}

.btn-x{
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

.btn-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-top: 1rem;
}

.btn {
  background-color: #4782eb;
  color: #ffffff;
  border-radius: 0.25rem;
  margin-top: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.btn-todo{
  margin-left: auto;
}

button:hover {
  background-color: #acaeb4;
}

button:disabled {
  opacity: 0.5;
}

@media (prefers-color-scheme: dark) {
  .btn{
    color: black
  }
  .table{
    color: #c4c6ca;
  }
  .m-7{
    color: #c4c6ca;
  }
}

</style>
