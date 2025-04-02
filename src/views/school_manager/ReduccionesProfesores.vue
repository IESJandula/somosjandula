<script setup>
import {ref} from 'vue';
import { IonInput } from "@ionic/vue";
const isJefatura = ref(false);
const listaReducciones = ref(["65 años","TDE"])



</script>

<template>
  <h1 class="t-1">Reducciones</h1>
  <div class="top-section">
    <!-- Tabla para crear las reducciones -->
    <div class="card-crea-reduccion">
      <div class="t-2">Crear reducción</div>
      <div class="form-group">
        <label class="form-label">Nombre:
          <ion-input type="text" v-model="a" class="form-input"/>
        </label>
        <label class="form-label-numer">Horas:
          <ion-input type="number" v-model.number="s" min="1" max="50" step="1" class="form-input-numer"/>
        </label>
      </div>
      <label class="form-label">Elección de jefatura
        <input type="checkbox" v-model="isJefatura" />
      </label>
      <!-- Aqui se guarda en la tabla de reducciones -->
      <button @click="guardarReduccion" class="btn-guardar">Guardar</button>
      <!-- formulario -->
    </div>
    <!-- Tabla con todas las reducciones que existen -->
    <div class="card-cargar-reduccion">
      <div>Tabla de reducciones</div>
      <table>
       <thead>
         <tr>
           <th class="columna">Nombre</th>
           <th class="columna">Horas</th>
           <th class="columna">Asigna dirección</th>
           <th class="columna">Acción</th>
         </tr>
       </thead>
       <tbody>
          <tr v-for="reduccion in listaReducciones" :key="reduccion">
            <td class="columna">{{ reduccion.nombre }}</td>
            <td class="columna">{{ reduccion.horas }}</td>
            <td class="columna">{{ reduccion.asignacion }}</td>
            <td class="columna">
              <button @click="eliminarReduccion(reduccion.id)" class="btn-eliminar">&times;</button>
            </td>
          </tr>
       </tbody>
      </table>

    </div>
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
  margin-top: 1.7rem;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
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
  padding-top: 3rem;
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
  margin-top: 2rem;
  margin-left: 15px;
  margin-right: 15px;
}

.card-cargar-reduccion {
  min-width: 520px;
  min-height: 400px;
  height: auto;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

table{
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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
  font-size: 2rem; /* <-- Reducir tamaño */
  background-color: transparent;
  line-height: 1; /* <-- Ajuste para evitar desbordamiento */
  border: none;
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

@media (max-width: 768px) {
  .card-reduccion{
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }
}
</style>