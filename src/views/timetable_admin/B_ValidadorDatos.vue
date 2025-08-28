<template>
  <div class="validador-container">
    <h1 class="t-1">Validador de Datos</h1>
    
    <!-- Mensaje de estado con botón de recargar -->
    <div v-if="mensajeEstado" class="mensaje-estado-container">
      <div class="mensaje-estado" :class="mensajeColor">
        {{ mensajeEstado }}
      </div>
      <button @click="ejecutarValidacion" class="btn-reload" :disabled="loading">
        <span class="reload-icon" :class="{ 'rotating': loading }">🔄</span>
      </button>
    </div>

    <!-- Contenedor de errores -->
    <div v-if="errores.length > 0" class="errores-container">
      
      <!-- Tabs para diferentes tipos de errores -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button 
            v-for="titulo in tituloErrores" 
            :key="titulo"
            @click="tabActivo = titulo"
            class="tab-button"
            :class="obtenerTipoPorTitulo(titulo)"
            :disabled="obtenerCantidadErrores(titulo) === 0"
          >
            {{ titulo }}
            <span 
              class="tab-count"
              :class="{ 
                'count-success': obtenerCantidadErrores(titulo) === 0,
                'count-error': obtenerCantidadErrores(titulo) > 0 
              }"
            >
              <span v-if="obtenerCantidadErrores(titulo) > 0">
                ({{ obtenerCantidadErrores(titulo) }})
              </span>
            </span>
          </button>
        </div>

        <!-- Contenido de los tabs -->
        <div class="tab-content">
          <div v-for="titulo in tituloErrores" :key="titulo" v-show="tabActivo === titulo" class="tab-panel">
            <div class="card-table card-error" @click="seleccionarTitulo(titulo)">
              <div class="card-header">
                <h3 class="t-3">
                  {{ titulo }}
                </h3>
              </div>
              <div class="card-content">
                <div class="valores-implicados-container">
                  <span 
                    v-for="(error, index) in obtenerErroresPorTitulo(titulo)"
                    :key="index"
                  >
                    <span  v-for="(valor, valorIndex) in error.valoresImplicados" 
                          :key="`${index}-${valorIndex}`"
                          class="valor-tag">
                      {{ valor }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay errores -->
    <div v-else-if="!loading && validacionEjecutada" class="sin-errores">
      <div class="card-success">
        <div class="card-content">
          <div class="success-content">
            <ion-icon name="checkmark-circle-outline" class="success-icon"></ion-icon>
            <h3 class="t-3">¡Excelente!</h3>
            <p>No se han encontrado errores en los datos</p>
          </div>
        </div>
      </div>
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
import { IonToast, IonIcon } from '@ionic/vue';
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

// Variables adicionales
const tituloSeleccionado = ref('');

// Computed properties
const tituloErrores = computed(() => {
  const titulos = [...new Set(errores.value.map(error => error.titulo))];
  return titulos;
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
      // Buscar la primera pestaña que tenga errores
      const primeraPestanaConErrores = tituloErrores.value.find(titulo => obtenerCantidadErrores(titulo) > 0);
      if (primeraPestanaConErrores) {
        tabActivo.value = primeraPestanaConErrores;
      }
      
      // Calcular el total de valores implicados en todos los errores
      const totalValoresImplicados = errores.value.reduce((total, error) => {
        if (error.valoresImplicados && Array.isArray(error.valoresImplicados)) {
          return total + error.valoresImplicados.length;
        }
        return total;
      }, 0);
      
      mensajeEstado.value = `Encontrados ${totalValoresImplicados} errores en los datos`;
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

const obtenerTipoPorTitulo = (titulo) => {
  const erroresDelTitulo = errores.value.filter(error => error.titulo === titulo);
  if (erroresDelTitulo.length > 0) {
    if (erroresDelTitulo[0].tipo === 'warning') {
      return 'tab-button warning';
    } else if (erroresDelTitulo[0].tipo === 'error') {
      return 'tab-button error';
    }
  }
  return null;
};

const obtenerCantidadErrores = (titulo) => {
  const erroresDelTitulo = errores.value.filter(error => error.titulo === titulo);
  const cantidad = erroresDelTitulo.reduce((total, error) => {
    // Verificar que valoresImplicados existe y es un array
    if (error.valoresImplicados && Array.isArray(error.valoresImplicados)) {
      return total + error.valoresImplicados.length;
    }
    return total;
  }, 0);
  
  return cantidad;
};

const obtenerErroresPorTitulo = (titulo) => {
  return errores.value.filter(error => error.titulo === titulo);
};

const seleccionarTitulo = (titulo) => {
  tituloSeleccionado.value = titulo;
};

onMounted(() => {
  // Ejecutar validación automáticamente al cargar la página
  ejecutarValidacion();
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

.t-3 {
  margin-bottom: 0; /* Elimina el espacio inferior del título */
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
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

.mensaje-estado-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 800px;
}

.mensaje-estado {
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-reload {
  background: transparent;
  color: #667eea;
  border: none;
  padding: 15px;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  min-width: 60px;
  flex-shrink: 0;
}

.btn-reload:hover:not(:disabled) {
  transform: translateY(-2px);
  color: #764ba2;
}

.btn-reload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.reload-icon {
  font-size: 2rem;
  display: block;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.tab-button.warning {
  background: linear-gradient(135deg, #d68910 0%, #b7950b 100%);
  color: white;
  border-color: #d68910;
  box-shadow: 0 4px 15px rgba(214, 137, 16, 0.4);
}

.tab-button.error {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-color: #ff6b6b;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

/* Estilos para botones deshabilitados */
.tab-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}

.tab-button:disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
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
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #e0e0e0;
}

.card-table:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 20px 20px 0 20px;
  background: transparent;
}

.card-content {
  padding: 0 20px 20px 20px;
  background: transparent;
}

.valores-implicados-container {
  max-height: 200px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0px 15px;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.valor-tag {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 6px;
  word-break: break-word;
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

  .valores-implicados-container {
    flex-wrap: wrap;
    gap: 8px;
    padding: 0px 10px;
    justify-content: flex-start;
  }

  .valor-tag {
    font-size: 0.8rem;
    padding: 6px 10px;
    min-height: 30px;
    margin: 4px;
    white-space: normal;
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

  .valores-implicados-container {
    flex-wrap: wrap;
    gap: 6px;
    padding: 0px 8px;
    justify-content: flex-start;
  }

  .valor-tag {
    font-size: 0.75rem;
    padding: 4px 8px;
    min-height: 28px;
    margin: 3px;
    white-space: normal;
  }
}

.card-error {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 2px solid #ff6b6b;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
}

.card-warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2px solid #ffa726;
  box-shadow: 0 4px 20px rgba(255, 167, 38, 0.2);
}

.valor-tag-error {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.valor-tag-warning {
  background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.3);
}

ion-card-title.t-3 {
  margin-bottom: 0; /* Elimina el espacio inferior del título */
}

</style>
