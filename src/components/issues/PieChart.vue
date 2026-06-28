<template>
  <div ref="chartRef" class="pie-chart">
    <!-- Contenedor personalizado -->
    <div v-if="data.length > 6" class="legend-scroll-container">
      <div class="legend-scroll">
        <div v-for="(item, index) in data" :key="index" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: getColor(index) }"></span>
          <span class="legend-text">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import * as echarts from "echarts";

interface PieDatum {
  name: string;
  value: number;
}

const props = defineProps<{
  title: string;
  data: PieDatum[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Colores de ECharts por defecto
const colors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
];

const getColor = (index: number): string => {
  return colors[index % colors.length];
};

// El título y la leyenda del gráfico se dibujan sobre canvas (ECharts), por lo que el CSS
// de `@media (prefers-color-scheme: dark)` no les afecta. Determinamos el color del texto
// según el esquema del navegador: en modo oscuro va en blanco (igual que las labels
// `.legend-text`), y en modo claro se mantiene el gris oscuro habitual.
const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const buildOption = (): echarts.EChartsOption => {
  const textColor = prefersDark() ? "#ffffff" : "#333333";
  return {
  title: {
    text: props.title,
    left: "center",
    top: 10,
    textStyle: {
      fontSize: 16,
      fontWeight: "bold",
      color: textColor,
    },
  },
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    textStyle: {
      fontSize: 14,
      color: "#fff",
    },
  },
  legend: {
    show: true,
    textStyle: {
      color: textColor,
    },
  },
  series: [
    {
      name: props.title,
      type: "pie",
      radius: ["40%", "75%"],
      center: ["50%", "45%"],
      data: props.data,
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "outside",
      },
      labelLine: {
        show: false,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
  ],
  };
};

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(buildOption());
};

const updateChart = () => {
  if (!chartInstance) return;
  chartInstance.setOption(buildOption(), true);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Si el usuario cambia el esquema claro/oscuro del sistema, repintamos para recolorear el texto.
const darkModeMql =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
const handleSchemeChange = () => {
  updateChart();
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
  darkModeMql?.addEventListener("change", handleSchemeChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  darkModeMql?.removeEventListener("change", handleSchemeChange);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

watch(
  () => [props.data, props.title],
  () => {
    updateChart();
  },
  { deep: true }
);
</script>

<style scoped>
.pie-chart {
  width: 100%;
  height: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.legend-scroll-container {
  width: 90%;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.legend-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.legend-scroll-container::-webkit-scrollbar-track {
  background: #e0e0e0;
  border-radius: 3px;
}

.legend-scroll-container::-webkit-scrollbar-thumb {
  background: #0078d7;
  border-radius: 3px;
}

.legend-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #0056b3;
}

.legend-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.legend-item:hover {
  background-color: rgba(0, 120, 215, 0.1);
}

/* Color del item */
.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 12px;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .legend-scroll-container {
    background: #2c2c2c;
    border: 1px solid #444444;
  }

  .legend-text {
    color: #ffffff;
  }

  .legend-scroll-container::-webkit-scrollbar-track {
    background: #444444;
  }

  .legend-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>