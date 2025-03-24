<script setup>
import {ref} from 'vue';
import { IonIcon } from "@ionic/vue";
import {heart, saveOutline} from "ionicons/icons";
const selectedProfesor = ref(null);
const listaProfesores = ref([]);
const isJefatura = ref(false);
const selectedReduccion = ref("");
const listaReducciones = ref(["65 años","TDE"])
const textoReduccion = ref("")
const horasReduccion = ref(0)



</script>

<template>

  <h1 class="m-2">Reducciones de profesorado</h1>

  <div class="card-reduccion">
    <div class="horizontal-row">

      <select v-model="selectedProfesor" class="select-profesor">
        <option disabled value="">Selecciona un profesor</option>
        <option v-for="profesor in listaProfesores" :key="profesor.id" :value="profesor">
          {{ profesor.nombre }}
        </option>
      </select>

      <label>
        <input type="checkbox" v-model="isJefatura" />
        A elección de la jefatura
      </label>

      <!-- Desplegable de reducciones (si NO está marcado el checkbox) -->
      <template v-if="!isJefatura">
        <select v-model="selectedReduccion" class="select-reduccion">
          <option disabled value="">Selecciona un tipo de reducción</option>
          <option v-for="reduccion in listaReducciones" :key="reduccion" :value="reduccion">
            {{ reduccion }}
          </option>
        </select>
      </template>
      <!-- Input de texto si SI está marcado el checkbox -->
      <template v-else>
        <input
            type="text"
            v-model="textoReduccion"
            placeholder="Escribe el motivo"
            class="input-reduccion"
        />
      </template>

      <input
          type="number"
          v-model.number="horasReduccion"
          min="0"
          class="input-horas"
      />
<!--        Aqui se guarda en la tabla de reducciones-->
      <button @click="guardarReduccion" class="btn-guardar">
        <ion-icon :icon="saveOutline" ></ion-icon>
      </button>
<!--       Aqui se aplica a la tabla manytomany de los dos-->
      <button @click="aplicarReduccion" class="btn-aplicar">
        Aplicar
      </button>
    </div>
  </div>
</template>

<style scoped>

.m-2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}


.card-reduccion {
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
}

.horizontal-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}


.select-profesor,
.select-reduccion,
.input-reduccion,
.input-horas {
  padding: 0.4rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  min-width: 150px;
}

.btn-aplicar {
  padding: 0.5rem;
  border: 1px solid;
  border-radius: 0.375rem;
  background-color: #3B82F6;
  color: #FFFFFF;
  font-size: 17px;
  cursor: pointer;
  margin-left: auto; /* empuja este botón al extremo derecho */
}

.btn-guardar {
  background-color: #3B82F6;
  border: none;
  color: #FFFFFF;
  font-size: 20px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
}

.btn-guardar ion-icon {
  vertical-align: middle;
}

@media (prefers-color-scheme: dark) {
  .card-reduccion {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .btn {
    color: black;
  }
}
</style>