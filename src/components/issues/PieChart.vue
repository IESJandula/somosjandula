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
    top: -5,
    textStyle: {
      fontSize: 16,
      fontWeight: "bold",
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
    orient: "vertical",  // ← Leyenda vertical
    left: "center",  // ← Centrada horizontalmente
    bottom: -10,  
    textStyle: {
      fontSize: 12,
      fontWeight: 500,
    },
    itemWidth: 15,
    itemHeight: 15,
    itemGap: 12,  // Espacio entre items de la leyenda
    padding: [10, 10, 10, 10],  // Padding alrededor de la leyenda
  },
  series: [
    {
      name: props.title,
      type: "pie",
      radius: ["40%", "70%"],
      center: ["50%", "40%"],  
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
});

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
  height: 500px;  
}
</style>