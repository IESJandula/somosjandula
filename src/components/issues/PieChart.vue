<template>
  <div ref="chartRef" class="pie-chart"></div>
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

const buildOption = (): echarts.EChartsOption => ({
  title: {
    text: props.title,
    left: "center",
    top: 10,
    textStyle: {
      fontSize: 14,
    },
  },
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
  },
  series: [
    {
      name: props.title,
      type: "pie",
      radius: "60%",
      center: ["50%", "60%"],
      data: props.data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      label: {
        formatter: "{b}: {c} ({d}%)",
      },
    },
  ],
});

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(buildOption());
};

const updateChart = () => {
  if (!chartInstance) return;
  chartInstance.setOption(buildOption(), true); // true = no merge, reemplaza
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// si cambian datos o título, actualizamos el gráfico
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
  height: 320px;
}
</style>
