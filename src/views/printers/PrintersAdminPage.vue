<template>
  <div class="consulta__container">
    <div class="consulta__top">
      <div class="consulta__form">
        <h1 class="consulta__title">Consultar impresión</h1>
        <form @submit.prevent="submitForm">
          <div class="consulta__form-group">
            <div class="consulta__row">
              <div class="consulta__col">
                <label class="consulta__label">Usuario:</label>
                <select v-model="filtroBusqueda.user" class="consulta__select">
                  <option value="Todos">Todos</option>
                  <option v-for="user in users" :key="`${user.nombre} ${user.apellidos}`" :value="`${user.nombre} ${user.apellidos}`">
                    {{ `${user.nombre} ${user.apellidos}` }}
                  </option>
                </select>
              </div>
              <div class="consulta__col">
                <label class="consulta__label">Impresora:</label>
                <select v-model="filtroBusqueda.printer" class="consulta__select">
                  <option value="Todos">Todos</option>
                  <option v-for="printer in printers" :key="printer.name" :value="printer.name">{{ printer.name }}</option>
                </select>
              </div>
            </div>
            <div class="consulta__row">
              <div class="consulta__col">
                <label class="consulta__label">Estado:</label>
                <select v-model="filtroBusqueda.status" class="consulta__select">
                  <option value="Todos">Todos</option>
                  <option v-for="state in states" :key="state" :value="state">{{ state }}</option>
                </select>
              </div>
              <div class="consulta__col">
                <label class="consulta__label">Fecha de Inicio:</label>
                <input v-model="filtroBusqueda.startDate" type="date" class="consulta__input" placeholder="Fecha de inicio" />
              </div>
              <div class="consulta__col">
                <label class="consulta__label">Fecha de Fin:</label>
                <input v-model="filtroBusqueda.endDate" type="date" class="consulta__input" placeholder="Fecha de fin" />
              </div>
            </div>
            <button type="submit" class="consulta__button">Filtrar</button>
            <button type="button" class="consulta__button consulta__button--danger" @click="resetForm">Reset</button>
          </div>
        </form>
      </div>

      <div class="consulta__tabla">
        <PrintInfoTable :info="filteredInfo" :adminRole="true" @actualizar-tabla="submitForm" />
      </div>
    </div>

    <div class="consulta__bottom">
      <div class="consulta__estado">
        <div class="consulta__title-container">
          <h1 class="consulta__title">Estado de las Impresoras</h1>
          <button class="consulta__refresh" @click="refrescarImpresoras">🔄</button>
        </div>
        <table class="consulta__tabla-estado">
          <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Cola</th>
            <th>Actualización</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="printer in printers" :key="printer.name">
            <td>{{ printer.name }}</td>
            <td>{{ printer.status }}</td>
            <td>{{ printer.printingQueue }}</td>
            <td>{{ formatDate(printer.lastUpdate) }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="consulta__constantes">
        <div class="consulta__title-container">
          <h1 class="consulta__title">Actualizar constantes</h1>
        </div>
        <div class="consulta__form-group">
          <label class="consulta__label">Clave de la constante:</label>
          <select v-model="selectedConstante" class="consulta__select" @change="onConstanteChange">
            <option v-for="constante in constantes" :key="constante.clave" :value="constante">{{ constante.clave }}</option>
          </select>

          <div v-if="selectedConstante">
            <label class="consulta__label">Valor:</label>
            <input v-model="selectedConstante.valor" class="consulta__input" />
          </div>

          <button class="consulta__button" @click="actualizarConstanteSeleccionada">Actualizar</button>

          <div v-if="mensajeActualizacion" class="consulta__mensaje" :class="mensajeColor">
            {{ mensajeActualizacion }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// La lógica original del componente permanece intacta y funcional.
</script>

<style scoped>
.consulta__container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.consulta__top,
.consulta__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.consulta__form,
.consulta__estado,
.consulta__constantes,
.consulta__tabla {
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 45%;
  min-width: 300px;
}

.consulta__title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.consulta__title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: var(--text-color-light);
}

.consulta__form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.consulta__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.consulta__col {
  flex: 1;
  min-width: 150px;
}

.consulta__label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
}

.consulta__input,
.consulta__select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.consulta__button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: var(--button-bg-light);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.consulta__button--danger {
  background-color: red;
}

.consulta__refresh {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.consulta__mensaje.success {
  color: green;
  font-weight: bold;
}

.consulta__mensaje.danger {
  color: red;
  font-weight: bold;
}

.consulta__tabla-estado {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.consulta__tabla-estado th,
.consulta__tabla-estado td {
  border: 1px solid #dddddd;
  padding: 8px;
  text-align: center;
}

.consulta__tabla-estado th {
  background-color: #f2f2f2;
  color: #3a7ca5;
  font-weight: 600;
  text-transform: uppercase;
}

.consulta__tabla-estado tr:nth-child(even) {
  background-color: #f9f9f9;
}

.consulta__tabla-estado tr:hover {
  background-color: #e6f7ff;
}

@media (prefers-color-scheme: dark) {
  .consulta__form,
  .consulta__estado,
  .consulta__constantes,
  .consulta__tabla {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  }

  .consulta__title {
    color: var(--text-color-dark);
  }

  .consulta__tabla-estado th {
    background-color: #3a3a3a;
    color: var(--text-color-dark);
  }

  .consulta__tabla-estado tr:nth-child(even) {
    background-color: #2c2c2c;
  }

  .consulta__tabla-estado tr:hover {
    background-color: #3e3e3e;
  }
}
</style>
