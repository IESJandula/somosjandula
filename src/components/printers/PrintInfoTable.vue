<template>
  <div class="print-table">
    <table class="print-table__table">
      <thead>
      <tr class="print-table__row">
        <th class="print-table__header">Fecha</th>
        <th v-if="adminRole" class="print-table__header">Usuario</th>
        <th class="print-table__header">Fichero</th>
        <th class="print-table__header">Estado</th>
        <th class="print-table__header">Impresora</th>
        <th class="print-table__header">Copias</th>
        <th class="print-table__header">Color</th>
        <th class="print-table__header">Orientación</th>
        <th class="print-table__header">Caras</th>
        <th class="print-table__header">Tamaño (KB)</th>
        <th class="print-table__header">Páginas PDF</th>
        <th class="print-table__header">Hojas totales</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(print, index) in info"
          :key="index"
          :class="['print-table__row', index % 2 === 1 ? 'print-table__row--even' : '', 'print-table__row--hover']"
      >
        <td class="print-table__cell">{{ formatDate(print.date) }}</td>
        <td v-if="adminRole" class="print-table__cell">{{ print.user }}</td>
        <td class="print-table__cell">{{ print.fileName }}</td>
        <td :title="print.errorMessage" class="print-table__cell">
          {{ print.status }}
          <ion-icon
              v-if="print.status === 'Pendiente'"
              name="close-circle-outline"
              style="font-size: 24px; cursor: pointer;"
              class="print-table__icon"
              @click="cancelarImpresionTabla(print.id)"
          ></ion-icon>
        </td>
        <td class="print-table__cell">{{ print.printer }}</td>
        <td class="print-table__cell">{{ print.copies }}</td>
        <td class="print-table__cell">{{ print.color }}</td>
        <td class="print-table__cell">{{ print.orientation }}</td>
        <td class="print-table__cell">{{ print.sides }}</td>
        <td class="print-table__cell">{{ print.fileSizeInKB }}</td>
        <td class="print-table__cell">{{ print.numeroPaginasPdf }}</td>
        <td class="print-table__cell">{{ print.hojasTotales }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { cancelarImpresion } from '@/services/printers';
import { IonIcon } from '@ionic/vue';

export default defineComponent({
  name: 'PrintInfoTable',
  props: {
    info: {
      type: Array,
      required: true
    },
    adminRole: {
      type: Boolean,
      required: true
    }
  },
  components: {
    IonIcon,
  },
  setup(props, { emit }) {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const cancelarImpresionTabla = async (id) => {
      try {
        const toastMessage = 'Cancelando impresión...';
        const toastColor = 'warning';
        const isToastOpen = true;

        const response = await cancelarImpresion(toastMessage, toastColor, isToastOpen, id);
        if (response.ok)
        {
          emit('actualizar-tabla');
        }
        else
        {
          alert('No se pudo cancelar la impresión. Pincha sobre el botón de actualizar para ver el nuevo estado de la tarea');
        }
      } catch (error) {
        console.error(error);
        alert('Ocurrió un error al intentar cancelar la impresión. Pincha sobre el botón de actualizar para ver el nuevo estado de la tarea');
      }
    };

    return {
      formatDate,
      cancelarImpresionTabla,
    };
  }
});
</script>

<style scoped>
.print-table {
  width: 100%;
  height: 38rem;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
  border-radius: 1rem;
  padding: 2.5rem;
  overflow: auto;
}

.print-table__table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Roboto', sans-serif;
}

.print-table__header,
.print-table__cell {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 0.75rem;
  font-size: 1rem;
}

.print-table__header {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--form-bg-light);
  color: var(--text-color-light);
}

.print-table__row--even {
  background-color: #f9f9f9;
}

.print-table__row--hover:hover {
  background-color: #e6f7ff;
}

.print-table__icon {
  margin-left: 0.5rem;
  color: red;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .print-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 4px 6px;
  }

  .print-table__header {
    background-color: var(--form-bg-dark);
    color: var(--text-color-dark);
  }

  .print-table__row--even {
    background-color: #2c2c2c;
  }

  .print-table__row--hover:hover {
    background-color: #3e3e3e;
  }

  .print-table__icon {
    color: #ff6b6b;
  }
}
</style>
