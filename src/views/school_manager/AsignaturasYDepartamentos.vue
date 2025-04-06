<script setup>

</script>

<template>
  <h1 class="t-1">Asignaturas y departamentos</h1>
  <div class="top-card">
    <!-- * Tabla para asignar profesores a departamentos -->
    <div class="card-asignacion">
      <div class="t-2">Profesores en plantilla</div>
      <div class="form-group">
        <div class="dropdown-departamentos">
          <label  for="profesor-select">Departamentos:</label>
          <select 
            id="profesor-select"
            v-model="profesorSeleccionado" 
            class="dropdown-select">
            <option value="">Selecciona un departamento</option>
            <option 
              v-for="profesor in listaProfesores" 
              :key="profesor.id" 
              :value="profesor.id">
              {{ profesor.nombre }}
            </option>
          </select>
        </div>
        <label class="form-label-numer">Plantilla:
          <ion-input type="number" v-model.number="s" min="1" max="50" step="1" class="form-input-numer"/>
        </label>
      </div>
      <!-- Aqui se guarda en la tabla de departamentos -->
      <button @click="guardarReduccion" class="btn-asignar">Asignar</button>
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
            <tr v-for="departamento in listaDepartamentos" :key="departamento">
              <td class="columna">{{ departamento.nombre }}</td>
              <td class="columna">{{ departamento.plantilla }}</td>
              <td class="columna">{{ departamento.horasNecesaria }}</td>
              <td class="columna">{{ departamento.horasTotales }}</td>
              <td class="columna">{{ departamento.Desfase }}</td>
              <td class="columna">{{ departamento.resultado }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="top-card-dos">
    <!-- TODO Tabla para asignar las asignaturas a los departamentos -->
    <div class="card-asignacion">
      <div class="t-2">Asignar de asignaturas a departamentos</div>
      <div class="top-container">
        <select 
            id="profesor-select"
            v-model="profesorSeleccionado" 
            class="dropdown-select">
            <option value="">Selecciona un curso-etapa-grupo</option>
            <option 
              v-for="profesor in listaProfesores" 
              :key="profesor.id" 
              :value="profesor.id">
              {{ profesor.nombre }}
            </option>
        </select>
        <div class="top-section">
          <ul class="listaAsignaturas p-2">
            <li>AAAAAAA
              <!-- <label>
                <input type="checkbox" :value="alumno" v-model="listadoAlumnosSeleccionados" />
                {{ alumno.apellidos }}, {{ alumno.nombre }}
              </label> -->
            </li>
            <li>BBBBBBB</li>
            <li>CCCCCCC</li>
            <li>DDDDDDD</li>
            <li>EEEEEEE</li>
          </ul>
          <div class="form-groups">
            <div class="dropdown-departamentos">
              <label for="profesor-select">Departamento propietario:</label>
              <select 
                id="profesor-select"
                v-model="profesorSeleccionado" 
                class="dropdown-select-group">
                <option value="">Selecciona un departamento</option>
                <option 
                    v-for="profesor in listaProfesores" 
                    :key="profesor.id" 
                    :value="profesor.id">
                    {{ profesor.nombre }}
                </option>
              </select>
            </div>
            <div class="dropdown-departamentos">
              <label class="form-label" for="reduccion-select">Departamento donante:</label>
              <select 
                id="reduccion-select"
                v-model="reduccionSeleccionada" 
                class="dropdown-select-group">
                <option value="">Selecciona un departamento</option>
                <option 
                  v-for="reduccion in listaReducciones" 
                  :key="reduccion.nombre" 
                  :value="reduccion.nombre">
                  {{ reduccion.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <!-- Aqui se guarda en la tabla de asignaturas y departamentos -->
      <button @click="asignarReduccion" class="btn-asignar">Asignar</button>
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
              <th class="columna">Departamento propietario</th>
              <th class="columna">Departamento donante</th>
              <th class="columna">Acción</th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="asignaturasDepartamentos in listaAsignaturasDepartamentos" :key="asignaturasDepartamentos">
                <td class="columna">{{ asignaturasDepartamentos.cursoEtapaGrupo }}</td>
                <td class="columna">{{ asignaturasDepartamentos.asignaturas }}</td>
                <td class="columna">{{ asignaturasDepartamentos.departamentoPropietario }}</td>
                <td class="columna">{{ asignaturasDepartamentos.departamentoDonante }}</td>
                <td class="columna">
                  <button @click="eliminarAsignaturaDepartamento(asignaturasDepartamentos.id)" class="btn-eliminar">&times;</button>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
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
  min-width: 850px;
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
  border: 1px solid currentColor;
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
  width: 250px;
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
  table-layout: auto;
  min-height: 10rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  border-radius: 10px;
  overflow: auto;
    height: 100px;
}

li{
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 2.2rem;
}

.form-label {
  margin-top: 1rem;
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
