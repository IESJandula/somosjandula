<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  optionsList: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: "default"
  },
  labelValue: {
    type: String,
  }
});

// Label to be displayed above the selector.
const label = ref(props.labelValue);

// Declare a reactive variable to store the selected value
const selectedValue = ref(props.modelValue);

// Watch for changes in statusValue and update selectedValue accordingly
watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue;
  emitSelectUpdate(); // Emit the updated value
});

// Define an emitter for communicating the selected value to the parent component
const emit = defineEmits(['update:modelValue']);

// Function to emit the selected value to the parent component
const emitSelectUpdate = () => {
  emit('update:modelValue', selectedValue.value);
  console.log("Emitting projector status: " + selectedValue.value);
};
</script>

<template>
  <div>
    <!-- Dropdown for selecting the value -->
    <label v-if="label" for="selectDropDown" style="width: 100%;" class="fw-bold mt-2 text-start text-black">{{ label }}</label>
    <select 
      id="selectDropDown"
      v-model="selectedValue" 
      @change="emitSelectUpdate" 
      class="p-2 border border-gray-300 rounded border border-1 border-secondary  text-black"
      style="width: 100%; background-color: white;">

      <!-- Default option when no value is selected -->
      <option value="default">Seleccione un estado.</option>

      <!-- Generate the options dynamically from props -->
      <option 
        v-for="option in props.optionsList" 
        :key="option" 
        :value="option">
        {{ option }}
      </option>

    </select>
  </div>
</template>

<style scoped>
</style>
