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

const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
    console.log("Filtro actualizado:", seleccionado);
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

    // Marcar asignaturas seleccionadas con un bloque ficticio (para que refleje cambios sin recargar)
    asignaturasSeleccionadas.value.forEach(asignatura => {
      asignatura.bloqueId = Math.floor(Math.random() * 1000); // Simulación de ID de bloque
    });
    
    asignaturasSeleccionadas.value = [];
    
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

    } catch (error) {
    errorMensaje.value = "Error al eliminar el bloque.";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

// const listaAsignaturas = computed(() => {
//   const seen = new Set();
//   return asignaturas.value.filter(item => {
//     if (seen.has(item.nombre)) {
//       return false;
//     } else {
//       seen.add(item.nombre);
//       return true;
//     }
//   });
// });

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
        <ion-card-title>Tabla de Asignaturas</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div v-if="errorMensaje" class="mensejeError">{{ errorMensaje }}</div>
        <div v-if="loading" class="cargar">Cargando datos...</div>

        <div v-if="asignaturas.length > 0 && !loading">
          <table class="table">
            <thead>
            <tr class="bg-gray-200">
              <th class="th"></th>
              <th class="th">Nombre</th>
              <th class="th">Grupo</th>
              <th class="th">Total Alumnos</th>
              <th v-for="grupo in columnasGrupos" :key="grupo" class="th">Grupo {{ grupo }}</th>
              <th class="th">Bloque</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="asignatura in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="p-4">
                <input type="checkbox" :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null"
                       v-model="asignaturasSeleccionadas" :value="asignatura" />
              </td>
              <td class="th">{{ asignatura.nombre }}</td>
              <td class="th">{{ asignatura.grupo }}</td>
              <td class="th">{{ asignatura.numeroDeAlumnos }}</td>
              <td v-for="grupo in columnasGrupos" :key="grupo" class="th">{{ asignatura.numeroAlumnosEnGrupo[grupo] || 0 }}</td>
              <td class="th">
                <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null">
                  Bloque {{ asignatura.bloqueId }}
                  <button @click="eliminarBloque(asignatura)" class="element">X</button>
                </div>
                <div v-else style="color: #cbd5e0;">Sin bloque</div>
              </td>
            </tr>
            </tbody>
          </table>
          <button @click="crearBloque" :disabled="asignaturasSeleccionadas.length < 2 || loading">
            {{ loading ? "Procesando..." : "Crear Bloque" }}
          </button>
        </div>

        <div v-else-if="!loading" class="m-7">
          <p style="color: #6b7280;">No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Tarjeta para modificar el número de horas de una asignatura -->
    <ion-card class="m-6">
      <ion-card-header>
        <ion-card-title>Modificar Horas de Asignatura</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <table class="table">
          <thead>
          <tr>
            <th class="th">Asignatura</th>
            <th class="th">Horas</th>
            <th class="th">Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in asignaturasConHoras" :key="item.nombre">
            <td class="th">{{ item.nombre }}</td>
            <td class="p-4 th">
              <ion-input type="number" v-model.number="horasPorAsignatura[item.nombre]"
                  min="1" max="50" step="1">
              </ion-input>
            </td>
            <td class="p-4 th">
              <button class="btn" @click="guardarHoras(item.nombre)">Guardar</button>
            </td>
          </tr>
          </tbody>
        </table>
        <ion-button @click="guardarTodasHoras">Guardar todo</ion-button>
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
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700; /* font-bold */
  margin-bottom: 2.5rem; /* mb-10 */
}
.m-6 {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 56rem;
}
.th {
  border: 1px solid currentColor; 
  padding-left: 0.5rem; 
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.table{
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
.element{
  margin-left: 0.5rem;
  color: #f56565;
  font-size: 15px;
}

.element:hover {
  text-decoration: underline;
}
.m-7{
  margin-top: 1.5rem;
  text-align: center;
}
button{
  margin-top: 1rem;
  background-color: transparent;
  color: #ffffff;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.25rem;
}

.btn {
  background-color: #4782eb;
  color: black;
  border-radius: 0.25rem;
}
button:hover {
  background-color: #acaeb4;
}

button:disabled {
  opacity: 0.5;
}

</style>
