<script setup>
// Import necessary functions from Vue
import { defineProps, defineEmits, ref, watch } from 'vue';

// Receive options as props
const props = defineProps({
  optionsList: {
    type: Array,
    required: true,  // The list of options is required
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
const selectedValue = ref(props.modelValue); // Use modelValue to bind with v-model

// Watch for changes in modelValue and update selectedValue accordingly
watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue;
  emitSelectUpdate(); // Emit the updated value
});

// Define an emitter for communicating the selected value to the parent component
const emit = defineEmits(['update:modelValue','selectUpdate']);

// Function to emit the selected value to the parent component
const emitSelectUpdate = () => {
  emit('update:modelValue', selectedValue.value);
  emit('selectUpdate', selectedValue.value);
  console.log("Emitting classroom: " + selectedValue.value);
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
      class="p-2 border border-gray-300 rounded border border-1 border-secondary text-black"
      style="width: 100%; background-color: white;">

      <!-- Default option when no value is selected -->
      <option value="default">Seleccione un aula.</option>

      <!-- Generate the options dynamically from props -->
      <option 
        v-for="option in props.optionsList" 
        :key="option.classroomName" 
        :value="option.classroomName">
        {{ option.classroomName }}
      </option>

    </select>
  </div>
</template>

<style scoped>
</style>
