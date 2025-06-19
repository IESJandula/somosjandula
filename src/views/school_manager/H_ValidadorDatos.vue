<template>
  <div class="validador-container">
    <h1 class="t-1">Validador de Datos</h1>
    
    <!-- Botón para ejecutar validación -->
    <div class="action-section">
      <button @click="ejecutarValidacion" class="btn-validar" :disabled="loading">
        <span v-if="loading">Validando...</span>
        <span v-else>Ejecutar Validación</span>
      </button>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="mensajeEstado" class="mensaje-estado" :class="mensajeColor">
      {{ mensajeEstado }}
    </div>

    <!-- Contenedor de errores -->
    <div v-if="errores.length > 0" class="errores-container">
      <h2 class="t-2">Errores Encontrados</h2>
      
      <!-- Tabs para diferentes tipos de errores -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button 
            v-for="tipo in tiposErrores" 
            :key="tipo"
            @click="tabActivo = tipo"
            class="tab-button"
            :class="{ 'active': tabActivo === tipo }"
          >
            {{ obtenerTituloTab(tipo) }}
            <span class="tab-count">({{ obtenerCantidadErrores(tipo) }})</span>
          </button>
        </div>

        <!-- Contenido de los tabs -->
        <div class="tab-content">
          <div v-for="tipo in tiposErrores" :key="tipo" v-show="tabActivo === tipo" class="tab-panel">
            <ion-card class="card-table">
              <ion-card-header>
                <ion-card-title class="t-3">
                  {{ obtenerTituloTab(tipo) }}
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="table-wrapper">
                  <table class="table-errores">
                    <thead>
                      <tr>
                        <th class="th th-center">Tipo de Error</th>
                        <th class="th th-center">Valores Implicados</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(error, index) in obtenerErroresPorTipo(tipo)" :key="index">
                        <td class="td">{{ error.tipo }}</td>
                        <td class="td">
                          <div class="valores-implicados">
                            <span 
                              v-for="(valor, valorIndex) in error.valoresImplicados" 
                              :key="valorIndex"
                              class="valor-tag"
                            >
                              {{ valor }}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay errores -->
    <div v-else-if="!loading && validacionEjecutada" class="sin-errores">
      <ion-card class="card-success">
        <ion-card-content>
          <div class="success-content">
            <ion-icon name="checkmark-circle" class="success-icon"></ion-icon>
            <h3 class="t-3">¡Excelente!</h3>
            <p>No se han encontrado errores en los datos. El sistema está listo para continuar.</p>
          </div>
        </ion-card-content>
      </ion-card>
    </div>

    <!-- Toast para notificaciones -->
    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="3000"
      @did-dismiss="() => (isToastOpen = false)"
      position="top">
    </ion-toast>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast, IonIcon } from '@ionic/vue';
import { obtenerErroresDatos } from '@/services/schoolManager.js';
import { crearToast } from '@/utils/toast.js';

// Variables reactivas
const loading = ref(false);
const errores = ref([]);
const tabActivo = ref('');
const validacionEjecutada = ref(false);
const mensajeEstado = ref('');
const mensajeColor = ref('');

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Computed properties
const tiposErrores = computed(() => {
  const tipos = [...new Set(errores.value.map(error => error.tipo))];
  return tipos;
});

// Métodos
const ejecutarValidacion = async () => {
  loading.value = true;
  mensajeEstado.value = 'Ejecutando validación de datos...';
  mensajeColor.value = 'info';
  
  try {
    const data = await obtenerErroresDatos(toastMessage, toastColor, isToastOpen);
    errores.value = data.erroresDatos || [];
    validacionEjecutada.value = true;
    
    if (errores.value.length > 0) {
      tabActivo.value = tiposErrores.value[0];
      mensajeEstado.value = `Se encontraron ${errores.value.length} errores en los datos.`;
      mensajeColor.value = 'warning';
    } else {
      mensajeEstado.value = 'Validación completada. No se encontraron errores.';
      mensajeColor.value = 'success';
    }
  } catch (error) {
    console.error('Error en la validación:', error);
    mensajeEstado.value = 'Error al ejecutar la validación. Inténtalo de nuevo.';
    mensajeColor.value = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
  } finally {
    loading.value = false;
  }
};

const obtenerTituloTab = (tipo) => {
  const titulos = {
    'CURSOS_ETAPAS': 'Cursos y Etapas',
    'DEPARTAMENTOS': 'Departamentos',
    'ASIGNATURAS': 'Asignaturas',
    'PROFESORES': 'Profesores',
    'IMPARTIR': 'Impartición'
  };
  return titulos[tipo] || tipo;
};

const obtenerCantidadErrores = (tipo) => {
  return errores.value.filter(error => error.tipo === tipo).length;
};

const obtenerErroresPorTipo = (tipo) => {
  return errores.value.filter(error => error.tipo === tipo);
};

onMounted(() => {
  // La validación se ejecuta manualmente
});
</script>

<style scoped>
.validador-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.t-1 {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.t-2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.t-3 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.action-section {
  margin-bottom: 30px;
  text-align: center;
}

.btn-validar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-validar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-validar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.mensaje-estado {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
  width: 100%;
  max-width: 600px;
}

.mensaje-estado.info {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.mensaje-estado.success {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.mensaje-estado.warning {
  background-color: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.mensaje-estado.danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.errores-container {
  width: 100%;
}

.tabs-container {
  width: 100%;
}

.tabs-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.tab-button {
  background: #f5f5f5;
  border: 2px solid #ddd;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  color: #666;
  min-width: 150px;
}

.tab-button:hover {
  background: #e0e0e0;
  border-color: #bbb;
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.tab-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.tab-content {
  width: 100%;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-table {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.table-errores {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table-errores th,
.table-errores td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table-errores th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-weight: bold;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-errores tr:hover {
  background-color: #f8f9fa;
}

.th {
  font-weight: bold;
}

.th-center {
  text-align: center;
}

.td {
  vertical-align: top;
}

.valores-implicados {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.valor-tag {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.sin-errores {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.card-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}

.success-content {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #fff;
}

/* Responsive design */
@media (max-width: 768px) {
  .validador-container {
    padding: 15px;
  }

  .t-1 {
    font-size: 1.5rem;
  }

  .tabs-header {
    flex-direction: column;
    align-items: center;
  }

  .tab-button {
    width: 100%;
    max-width: 300px;
  }

  .table-wrapper {
    font-size: 0.9rem;
  }

  .table-errores th,
  .table-errores td {
    padding: 10px 8px;
  }

  .valor-tag {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .btn-validar {
    padding: 12px 20px;
    font-size: 1rem;
  }

  .t-1 {
    font-size: 1.3rem;
  }

  .t-2 {
    font-size: 1.2rem;
  }

  .table-errores {
    font-size: 0.8rem;
  }

  .table-errores th,
  .table-errores td {
    padding: 8px 6px;
  }
}
</style>
