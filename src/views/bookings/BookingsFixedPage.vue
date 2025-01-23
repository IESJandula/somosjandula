<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <ion-page>
    <ion-content class="ion-padding" fullscreen>
      <div class="container">
        <!-- Dropdown para seleccionar recurso -->
        <select class="custom-select" v-model="recursoSeleccionado">
          <option value="">Seleccione un recurso</option>
          <option v-for="(recurso, index) in recursos" :key="index" :value="recurso.recursos">
            {{ recurso.recursos }}
          </option>
        </select>

        <!-- Tabla con horarios y reservas -->
        <table>
          <thead>
            <tr>
              <th>Horarios</th>
              <th v-for="(dia, index) in diasSemanas" :key="index">{{ dia.diaSemana }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tramo, index) in tramosHorarios" :key="index">
              <td>{{ tramo.tramosHorarios }}</td>
              <td v-for="(dia, index) in diasSemanas" :key="index" @click="openModal(tramo, dia)">
                <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos > 0">
                  {{ reservas[tramo.id][dia.id].nombreYapellidos }} (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos
                  }})
                  <button
                    @click.stop="deleteReservas(tramo, dia, $event, recursoSeleccionado, reservas[tramo.id][dia.id].email)">Borrar</button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Modal de edición -->
        <div v-if="isModalOpen && (!reservas[currentTramo?.id]?.[currentDia?.id]?.nalumnos)" class="modal-overlay">
          <div class="modal-content">
            <h2>Editar Reserva</h2>
            <label for="profesorCorreo">Correo del Profesor:</label>
            <input v-model="correoProfesor" type="email" id="profesorCorreo" placeholder="Correo del profesor" />

            <label for="numAlumnos">Número de Alumnos:</label>
            <input v-model="numAlumnos" type="number" id="numAlumnos" placeholder="Número de alumnos" />

            <button @click="saveChanges">Guardar Cambios</button>
            <button @click="closeModal">Cerrar</button>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { getDiasSemana, getTramosHorarios, getRecursos, getReservas, postReserva, deleteReserva } from '@/services/bookings.js'

// Variables reactivas
const diasSemanas = ref([])
const tramosHorarios = ref([])
const recursos = ref([])
const reservas = ref({})
const recursoSeleccionado = ref('')
const isModalOpen = ref(false)
const correoProfesor = ref('')
const numAlumnos = ref('')
const currentTramo = ref(null)
const currentDia = ref(null)

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Función para abrir el modal
const openModal = (tramo, dia) => {
  currentTramo.value = tramo
  currentDia.value = dia
  correoProfesor.value = reservas[dia.id]?.[tramo.id]?.nombreYapellidos || '' // Cargar correo si existe
  numAlumnos.value = reservas[dia.id]?.[tramo.id]?.nalumnos || '' // Cargar número de alumnos si existe
  isModalOpen.value = true
}

// Función para cerrar el modal
const closeModal = () => {
  isModalOpen.value = false
}

// Función para guardar los cambios (ahora usando `postReserva`)
const saveChanges = async () => {
  if (currentDia.value && currentTramo.value && recursoSeleccionado.value) {
    try {
      // Llamar a la API para guardar la reserva
      await postReserva(
        isToastOpen,
        toastMessage,
        toastColor,
        correoProfesor.value,
        recursoSeleccionado.value,
        currentDia.value.id,
        currentTramo.value.id,
        numAlumnos.value
      )

      // Actualizar localmente las reservas después de guardar
      if (!reservas.value[currentDia.value.id]) {
        reservas.value[currentDia.value.id] = {}
      }
      reservas.value[currentDia.value.id][currentTramo.value.id] = {
        nombreYapellidos: correoProfesor.value,
        nalumnos: numAlumnos.value,
      }

      console.log('Reserva guardada exitosamente')
    } catch (error) {
      console.error('Error al guardar la reserva:', error)
    }
  } else {
    console.warn('Faltan datos para guardar la reserva')
  }
  closeModal()
  getReserva(recursoSeleccionado) // Actualizar reservas después de guardar
}

// Función para obtener los días de la semana
const getDiasSemanas = async () => {
  try {
    const data = await getDiasSemana(isToastOpen,toastMessage,toastColor)
    diasSemanas.value = data.map((item) => ({ diaSemana: item.diasDeLaSemana, id: item.id }))
  } catch (error) {
    console.error('Error obteniendo los días de la semana:', error)
  }
}

// Función para obtener los tramos horarios
const getTramosHorario = async () => {
  try {
    const data = await getTramosHorarios(isToastOpen,toastMessage,toastColor)
    tramosHorarios.value = data.map((item) => ({
      tramosHorarios: item.tramosHorarios,
      id: item.id,
    }))
  } catch (error) {
    console.error('Error obteniendo los tramos horarios:', error)
  }
}

// Función para obtener los recursos
const getRecurso = async () => {
  try {
    const data = await getRecursos(isToastOpen,toastMessage,toastColor)
    recursos.value = data.map((item) => ({ recursos: item.aulaYCarritos }))
  } catch (error) {
    console.error('Error obteniendo los recursos:', error)
  }
}

// Función para obtener las reservas estructuradas
const getReserva = async () => {
  const recurso = recursoSeleccionado.value;
  const data = await getReservas(isToastOpen,toastMessage,toastColor,recurso)

  // Reestructurar reservas en un objeto organizado por tramos y días
  const estructuraReservas = {}

  for (let i = 0; i < data.length; i++) {
    const reserva = data[i]
    const tramo = reserva.tramoHorario
    const dia = reserva.diaSemana

    if (!estructuraReservas[tramo]) {
      estructuraReservas[tramo] = {}
    }

    estructuraReservas[tramo][dia] = {
      nalumnos: reserva.nalumnos,
      nombreYapellidos: reserva.nombreYapellidos,
      email: reserva.email,
    }
  }
  reservas.value = estructuraReservas
}

const deleteReservas = async (tramo, dia, event, recursoSeleccionado, email) => {
  try {
    event.stopPropagation()
    console.log('Reserva a cancelar:', tramo, dia, recursoSeleccionado, email);



    // Llamar a la API para cancelar la reserva
    await deleteReserva(isToastOpen,toastMessage,toastColor,email, recursoSeleccionado, dia.id, tramo.id)


    console.log('Reserva cancelada exitosamente');
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
  }
  getReserva(recursoSeleccionado) // Actualizar reservas después de cancelar
}

// Watcher para observar cambios en recursoSeleccionado
watch(recursoSeleccionado, async () => {
  console.log('Recurso seleccionado:', recursoSeleccionado.value)
  await getReserva(isToastOpen,toastMessage,toastColor)
})

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await getDiasSemanas()
  await getTramosHorario()
  await getRecurso()
  await deleteReservas()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: white;
  color: #1a1a1a;
  font-family: Arial, sans-serif;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-select {
  width: 80%;
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #007bff;
  outline: none;
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  margin-top: 20px;
  border-radius: 5px;
  overflow: hidden;
}

span {
  cursor: pointer;
  font-weight: bold;
  font-style: oblique;
}

th,
td {
  border: 2px solid #007bff;
  padding: 10px;
}

td {
  height: 50px;
  width: 150px;
  /* Establece un ancho fijo */
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  /* Para manejar contenido largo */
  overflow: hidden;
  /* Oculta cualquier contenido que desborde */
  word-wrap: break-word;
  /* Permite que el texto largo se divida y se ajuste */
}


th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

td {
  height: 50px;
  background-color: #e9f5ff;
}

th:first-child {
  background-color: #0056b3;
  /* Diferenciar la columna de tramos horarios */
}

button {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

tr:hover td {
  background-color: #d0eaff;
  /* Efecto hover en filas */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 300px;
}

.modal-content h2 {
  margin-bottom: 10px;
}

.modal-content label {
  display: block;
  margin-bottom: 5px;
}

.modal-content input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.modal-content button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  table {
    font-size: 14px;
    width: 100%;
  }

  .custom-select {
    width: 100%;
  }
}
</style>
