<script setup>
import {onMounted, ref} from 'vue';
import {IonInput, IonToast} from "@ionic/vue";
import { asignarAsignaturasADepartamentos, asignarProfesoresADepartamentos, obtenerAsignaturasPorCursoEtapaGrupo, obtenerCursosEtapasGrupos, obtenerDatosDepartamentosConAsignaturas, obtenerDepartamentos, obtenerTodasLasAsignaturas, quitarAsignaturasDeDepartamentos } from '@/services/schoolManager.js';
import { crearToast } from '@/utils/toast.js';

const departamentos = ref([]);
const departamentoSeleccionado = ref('');
const plantillaPorAsignatura = ref('');
const cursosYetapas = ref([]);
const cursosYetapasSeleccionado = ref('');
const asignaturas = ref([]);
const asignaturaSeleccionada = ref([]);
const depPropietarioSeleccionado = ref('');
const depReceptorSeleccionado = ref('');
const listaAsignaturasDepartamentos = ref([]);
const listaDepartamentosIterable = ref([]);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const obtenerDepartamento = async () => {
  try {
    const data = await obtenerDepartamentos(toastMessage, toastColor, isToastOpen);
    departamentos.value = data;
  } catch (error) {
    mensajeActualizacion = "Error al cargar departamentos";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerCursoYEtapa = async () => {
  try {
    const data = await obtenerCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
    cursosYetapas.value = data;
  } catch (error) {
    mensajeActualizacion = "Error al cargar cursos y etapas";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerDatosDepartamentoConAsignatura = async () => {
  try {
    const data = await obtenerDatosDepartamentosConAsignaturas(
        toastMessage, toastColor, isToastOpen
    );
    listaDepartamentosIterable.value = data;

    // Aseguramos que desfase sea numérico
    listaDepartamentosIterable.value.forEach(d =>
        d.desfase = Number(d.desfase)
    );

    // Mapa rápido por nombre de departamento
    const deptMap = new Map(
        listaDepartamentosIterable.value.map(d => [d.nombre, d])
    );

    // Para cada asignación
    listaAsignaturasDepartamentos.value.forEach(asign => {
      const donor   = deptMap.get(asign.departamentoDonante);
      const receptor= deptMap.get(asign.departamentoPropietario);
      if (!donor || !receptor) return;

      // Solo se dona si hay sobrante y déficit, es decir que a uno le sobre y otro este en negativo
      if (donor.desfase > 0 && receptor.desfase < 0) {
        // horas que realmente necesita el receptor
        const receptorDeficit = -receptor.desfase;
        // la donacion tiene que parar cuando el que dona que se queda sin sobrantes o cuando se queda a 0 el receptor
        // el mas pequeño de los dos
        const ajuste = Math.min(donor.desfase, receptorDeficit);

        // aplicamos la donación
        donor.desfase    -= ajuste;   // el donante pierde esas horas
        receptor.desfase += ajuste;   // el receptor “cubre” parte de su déficit
      }
    });

  } catch (error) {
    mensajeActualizacion = "Error al cargar departamentos con asignaturas";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

//Asignaturas sin departamento propietario asignado
const obtenerAsignaturas = async () => {
  if (cursosYetapasSeleccionado.value) {
    try {
      const data = await obtenerAsignaturasPorCursoEtapaGrupo(
        cursosYetapasSeleccionado.value.curso,
        cursosYetapasSeleccionado.value.etapa,
        cursosYetapasSeleccionado.value.grupo,
        toastMessage,
        toastColor,
        isToastOpen
      );
      asignaturas.value = data;
    } catch (error) {
      console.error(error);
    }
  } else {
    asignaturas.value = [];
  }
};

//Todas las asignaturas
const obtenerAsignaturasCompletas = async () => {
  try {
    const todasLasAsignaturas = await obtenerTodasLasAsignaturas();

    listaAsignaturasDepartamentos.value = todasLasAsignaturas.filter(asignatura => {
      const receptor = asignatura.departamentoReceptor?.trim();
      const propietario = asignatura.departamentoPropietario?.trim();
      return receptor && receptor.length > 0 || propietario && propietario.length > 0;
    });
  } catch (error) {
    mensajeActualizacion = "Error al cargar todas las asignaturas";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const actualizarCurso = (parametro) => {
  cursosYetapasSeleccionado.value = parametro;
  obtenerAsignaturas()
};

const asignarDepPropietario = async () => {
  if (cursosYetapasSeleccionado.value &&
      asignaturaSeleccionada.value.length > 0 &&
      depPropietarioSeleccionado.value) {
  try{
    
    if (asignaturaSeleccionada.value.length === 0) {
      mensajeActualizacion = "No se ha seleccionado ninguna asignatura.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    for (const asignatura of asignaturaSeleccionada.value)
    {
      const nombreAsignatura = asignatura.nombreAsignaturas;
      await asignarAsignaturasADepartamentos(
        cursosYetapasSeleccionado.value.curso,
        cursosYetapasSeleccionado.value.etapa,
        cursosYetapasSeleccionado.value.grupo,
        nombreAsignatura,
        depPropietarioSeleccionado.value,
        depReceptorSeleccionado.value,
        toastMessage,
        toastColor,
        isToastOpen
      );
    }
    mensajeActualizacion = "Asignación realizada correctamente.";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    asignaturaSeleccionada.value = [];
    await obtenerAsignaturas()
    await obtenerAsignaturasCompletas()
    await obtenerDatosDepartamentoConAsignatura()
    } catch (error) {
      mensajeActualizacion = "Error al asignar departamentos a las asignaturas";
      mensajeColor = "danger";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      console.error(error);
    }
  } else {
    mensajeActualizacion = "Se necesita seleccionar al menos un curso-etapa, una asignatura y un departamento";
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }

}

const eliminarAsignaturaDepartamento = async (index) => {
  const registro = listaAsignaturasDepartamentos.value[index];
  if (!registro) {
    mensajeActualizacion = "Registro no encontrado";
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  const curso = registro.curso;
  const etapa = registro.etapa;
  const grupo = registro.grupo;
  const nombre = registro.nombre;

  try {
    await quitarAsignaturasDeDepartamentos(
      curso,
      etapa,
      grupo,
      nombre,
      toastMessage,
      toastColor,
      isToastOpen
    );

    await obtenerAsignaturasCompletas();
    await obtenerAsignaturas();
    await obtenerDatosDepartamentoConAsignatura();
    await obtenerDepartamento();
    mensajeActualizacion = "Asignatura desasignada correctamente";
    mensajeColor = "success"; 
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

  } catch (error) {
    mensajeActualizacion = "Error al desasignar la asignatura del departamento";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};


const asignarProfesorADepartamento = async (nombreDepartamento) => {
 
  if (nombreDepartamento === '') {
    mensajeActualizacion = "Por favor, selecciona un departamento."; 
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }
  
  if (plantillaPorAsignatura.value === '') {
    mensajeActualizacion = "La plantilla no puede estar vacía.";
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  try {
    const data = await asignarProfesoresADepartamentos(nombreDepartamento, plantillaPorAsignatura.value, toastMessage, toastColor, isToastOpen);
    departamentos.value = data;

    mensajeActualizacion = "Profesor asignado correctamente.";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    await obtenerDepartamento();
    await obtenerDatosDepartamentoConAsignatura();

  } catch (error) {
    mensajeActualizacion = "Error al asignar profesor al departamento";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

onMounted(async () => {
  await obtenerDepartamento();
  await obtenerCursoYEtapa();
  await obtenerAsignaturasCompletas();
  await obtenerDatosDepartamentoConAsignatura();
});
</script>

<template>
  <h1 class="t-1">Asignaturas y departamentos</h1>
  <div class="top-card">
    <!-- TODO Tabla para asignar las asignaturas a los departamentos -->
    <div class="card-asignacion">
      <div class="t-2">Asignar asignaturas a departamentos</div>
      <div class="top-container">
        <select 
            id="profesor-select"
            v-model="cursosYetapasSeleccionado" @change="actualizarCurso(cursosYetapasSeleccionado)"
            class="dropdown-select">
            <option value="">Selecciona un curso-etapa-grupo</option>
            <option
                v-for="item in cursosYetapas"
                :key="`${item.curso}-${item.etapa}-${item.grupo}`"
                :value="item">
              {{ item.curso }} - {{ item.etapa }} - {{ item.grupo }}
            </option>
        </select>
        <div class="top-section">
          <ul class="listaAsignaturas p-2">
            <li v-for="asignatura in asignaturas" :key="asignatura.id" class="p-2 transparente ">
              <label>
                <input
                    type="checkbox"
                    name="asignaturas"
                    :value="asignatura"
                    v-model="asignaturaSeleccionada">
                {{ asignatura.nombreAsignaturas }}
              </label>
            </li>
          </ul>
          <div class="form-groups">
            <div class="dropdown-departamentos">
              <label for="depPropietario-select">Departamento propietario:</label>
              <select 
                id="depPropietario-select"
                v-model="depPropietarioSeleccionado"
                class="dropdown-select-group">
                <option value="">Selecciona un dpto</option>
                <option
                    v-for="departamento in departamentos"
                    :key="departamento.nombre"
                    :value="departamento.nombre">
                  {{ departamento.nombre }}
                </option>
              </select>
            </div>
            <div class="dropdown-departamentos">
              <label class="form-label" for="depReceptor-select">Departamento donante:</label>
              <select 
                id="depReceptor-select"
                v-model="depReceptorSeleccionado"
                class="dropdown-select-group">
                <option value="">Selecciona un dpto</option>
                <option 
                  v-for="departamento in departamentos" 
                  :key="departamento.nombre" 
                  :value="departamento.nombre">
                  {{ departamento.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <!-- Aqui se guarda en la tabla de asignaturas y departamentos -->
      <button @click="asignarDepPropietario" class="btn-asignar">Asignar</button>
    </div>
    <!-- ? Tabla con todas las reducciones que existen -->
    <div class="card-departamentos-asignaturas">
      <div class="t-2">Tabla de asignaturas y departamentos</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="columna">Curso-etapa-grupo</th>
              <th class="columna">Asignaturas</th>
              <th class="columna">Horas</th>
              <th class="columna">Departamento propietario</th>
              <th class="columna">Departamento donante</th>
              <th class="columna">Acción</th>
            </tr>
          </thead>
            <tbody>
              <tr v-for="(registro, index) in listaAsignaturasDepartamentos" :key="index">
                <td class="columna">{{ registro.curso }} {{ registro.etapa }} {{ registro.grupo }}</td>
                <td class="columna">{{ registro.nombre }}</td>
                <td class="columna">{{ registro.horas }}</td>
                <td class="columna">{{ registro.departamentoPropietario }}</td>
                <td class="columna">{{ registro.departamentoDonante }}</td>
                <td class="columna">
                  <button @click="eliminarAsignaturaDepartamento(index)" class="btn-eliminar">&times;</button>
                </td>
              </tr>
           </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="top-card-dos">
    <!-- * Tabla para asignar profesores a departamentos -->
    <div class="card-asignacion">
      <div class="t-2">Profesores en plantilla</div>
      <div class="form-group">
        <div class="dropdown-departamentos">
          <label  for="profesor-select">Departamentos:</label>
          <select 
            id="departamento-select"
            v-model="departamentoSeleccionado" 
            class="dropdown-select">
            <option value="">Selecciona un departamento</option>
            <option 
              v-for="departamento in departamentos" 
              :key="departamento.nombre" 
              :value="departamento.nombre">
              {{ departamento.nombre }}
            </option>
          </select>
        </div>
        <label class="form-label-numer">Plantilla:
          <ion-input type="number" v-model.number="plantillaPorAsignatura" min="1" max="50" step="1" class="form-input-numer"/>
        </label>
      </div>
      <!-- Aqui se guarda en la tabla de departamentos -->
      <button @click="asignarProfesorADepartamento(departamentoSeleccionado)" class="btn-asignar">Asignar</button>
    </div>
    <!-- ? Tabla con los datos de los departamentos -->
    <div class="card-departamentos-asignaturas">
      <div class="t-2">Tabla de departamentos</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="columna">Departamentos</th>
              <th class="columna">Plantilla</th>
              <th class="columna">Horas necesarias</th>
              <th class="columna">Hotas totales</th>
              <th class="columna">Desfase</th>
              <th class="columna">Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="departamento in listaDepartamentosIterable" :key="departamento.nombre">
              <td class="columna">{{ departamento.nombre }}</td>
              <td class="columna">{{ departamento.plantilla }}</td>
              <td class="columna">{{ departamento.horasNecesarias }}</td>
              <td class="columna">{{ departamento.horasTotales }}</td>
              <td class="columna">{{ departamento.desfase }}</td>
              <td class="columna" :class="{
                'texto-amarillo': departamento.desfase > 0,
                'texto-rojo': departamento.desfase < 0,
                'texto-verde': departamento.desfase === 0
              }">{{ departamento.desfase > 0 ? 'Sobran horas' : departamento.desfase < 0 ? 'Faltan horas' : 'Cerrado' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
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

.t-1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}
.t-2{
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1rem;
}

.top-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  min-width: 100%;
}

.top-card-dos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 2rem;
}

.card-asignacion {
  min-width: 520px;
  min-height: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.form-label-numer {
  cursor: pointer;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.form-group{
  display: flex;
  flex-direction: column;
  padding-top: 2.5rem;
  margin-left: 2rem;
}

.form-groups{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 300px;
}

.form-input-numer {
  max-width: 80px;
  text-align: center;
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid black;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.btn-asignar {
  background-color: #3B82F6;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  margin-top: 1.5rem;
  margin-left: 15px;
  margin-right: 15px;
}

.card-departamentos-asignaturas {
  min-width: 900px;
  min-height: 435px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
    height: 300px;
    width: 300px;
}

.table-wrapper {
  width: 100%;
}

table{
  margin-top: 1.5rem;
  min-width: 800px;
}

.columna {
  min-width: 120px;
  border: 1px solid black;
  padding: 0.5rem;
  text-align: center;
}

.btn-eliminar {
  color: #EF4444;
  font-size: 2rem; /* <-- Reducir tamaño */
  background-color: transparent;
  line-height: 1; /* <-- Ajuste para evitar desbordamiento */
  border: none;
}

.top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-left: 1rem;
  margin-top: 1.5rem;
}

.dropdown-departamentos {
  display: flex;
  flex-direction: column;
  
}

.dropdown-departamentos label {
  margin-bottom: 0.8rem;
}

.dropdown-select {
  width: 270px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.dropdown-select-group {
  width: 190px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.top-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
}

.listaAsignaturas {
  max-width: 250px;
  table-layout: auto;
  min-height: 10rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  border-radius: 10px;
  overflow: auto;
    height: 100px;
}

.p-2{
  padding: 0.4rem;
  border: 1px solid currentColor;
  border-radius: 0.375rem;
}

.transparente{
  border-color: transparent;
}

li{
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 2.2rem;
}

.form-label {
  margin-top: 1rem;
}

.texto-verde{
  color: #2b8f06;
}
.texto-amarillo{
  color: #e0a205;
}
.texto-rojo{
  color: #EF4444;
}


@media (prefers-color-scheme: dark) {
  .card-asignacion,
  .card-departamentos-asignaturas {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .form-input-numer {
    border-bottom: 1px solid #D1D5DB
  }
  .btn-asignar {
    color: black;
  }
  .columna{
    border: 1px solid white;
  }
  .texto-amarillo{
  color: #FBBF24;
}
}

@media ((min-width: 768px) and (max-width: 1422px)) {

  .card-departamentos-asignaturas {
    min-width: 520px;
  }
}

@media (max-width: 768px ) {

  .card-departamentos-asignaturas {
    min-width: 355px;
    min-height: 100%;
  }
  .card-asignacion {
  width: 100%;
  max-width: 355px;
  min-width: 340px;
  }
  .top-container {
    flex-direction: column;
    min-width: 350px;
    align-self: center;
    min-width: 340px;
  }
  .top-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 350px;
    min-width: 340px;
  }
  .listaAsignaturas {
  width: 100%;
  max-width: 250px;
  }
  .dropdown-select-group{
    width: 250px;
  }
  .form-groups {
    align-items: center;
  }
  
}
</style>
