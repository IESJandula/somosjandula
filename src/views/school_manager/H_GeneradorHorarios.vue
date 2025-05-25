<template>
  <h1 class="t-1">Generador de horarios</h1>
    <div class="top-section">
      <!-- Botón para lanzar el generador aquí -->
      <button @click="generarHorarios" class="btn-lanzar-generador">Lanzar Generador</button>
      <button @click="forzarDetencion" class="btn-forzar-detencion">Forzar Detención</button>

      
      
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
import {ref} from 'vue';
import { IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { lanzarGeneradorHorarios, forzarDetencionGeneradorHorarios } from '@/services/schoolManager.js';

// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const generarHorarios = async () => {
  try
  {
    const response = await lanzarGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok)
    {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios lanzado con éxito');
    }
    else
    {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorData.message);
    } 
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al lanzar el generador de horarios.');
  }
};

const forzarDetencion = async () => {
  try
  {
    const response = await forzarDetencionGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok)
    {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios detenido con éxito');
    }
    else
    {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorData.message);
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al forzar la detención del generador.');
  }
};

</script>

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
  margin-top: 1.5rem;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.top-section-dos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 2rem;
}

.card-crea-reduccion {
  min-width: 420px;
  min-height: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.form-label {
  cursor: pointer;
  top: 50px;
  left: 5px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 25px;
}

.form-label-numer {
  cursor: pointer;
  top: 50px;
  left: 5px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 5rem;
}

.form-group{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 2.5rem;
}

.form-input {
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid black;
  padding: 0.5rem;
  min-width: 150px;
  margin-bottom: 1rem;
}

.form-input-numer {
  min-width: 60px;
  text-align: center;
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid black;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.btn-guardar {
  background-color: #3B82F6;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  margin-top: 2.4rem;
  margin-left: 15px;
  margin-right: 15px;
}

.card-cargar-reduccion {
  min-width: 590px;
  min-height: 400px;
  height: auto;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  height: 300px;
}

table{
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.columna {
  width: 33%;
  border: 1px solid currentColor;
  padding-left: 0.5rem; 
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.btn-eliminar {
  color: #EF4444;
  font-size: 2rem;
  background-color: transparent;
  line-height: 1;
  border: none;
}

.dropdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
}

.dropdown-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 300px;
  margin-top: 0.5rem;
}

.dropdown-group label {
  margin-bottom: 0.8rem;
}

.dropdown-select {
  width: 300px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

@media (prefers-color-scheme: dark) {
  .card-crea-reduccion,
  .card-cargar-reduccion {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .form-input,
  .form-input-numer {
    border-bottom: 1px solid #D1D5DB
  }
  .btn-guardar {
    color: black;
  }
}

@media ((min-width: 768px) and (max-width: 1422px)) {

  .card-cargar-reduccion {
    min-width: 420px;
  }
}

@media (max-width: 768px) {
  .card-crea-reduccion,
  .card-cargar-reduccion {
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }
}

.generador-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem; /* Espacio por encima del botón */
}

.btn-lanzar-generador {
  background-color: #10B981; /* Un color verde diferente */
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem; /* Un poco más grande */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-lanzar-generador:hover {
  background-color: #059669; /* Verde más oscuro al pasar el ratón */
}

@media (prefers-color-scheme: dark) {
  .btn-lanzar-generador {
    color: black;
  }
}

.btn-forzar-detencion {
  background-color: #EF4444; /* Rojo */
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-forzar-detencion:hover {
  background-color: #DC2626; /* Rojo más oscuro al pasar el ratón */
}

@media (prefers-color-scheme: dark) {
  .btn-forzar-detencion {
    color: black; /* O mantener blanco si prefieres */
  }
}

</style>