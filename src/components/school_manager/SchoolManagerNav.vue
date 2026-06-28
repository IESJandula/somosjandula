<template>
  <div class="page-intro-row">
    <div class="intro-nav intro-nav-prev">
      <button
        v-if="prevStep"
        type="button"
        class="nav-btn"
        @click="goTo(prevStep.path)"
      >
        &lt;&lt; {{ prevStep.label }}
      </button>
    </div>

    <div class="intro-content">
      <slot />
    </div>

    <div class="intro-nav intro-nav-next">
      <button
        v-if="nextStep"
        type="button"
        class="nav-btn"
        @click="goTo(nextStep.path)"
      >
        {{ nextStep.label }} &gt;&gt;
      </button>
      <slot v-else name="next" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SCHOOL_MANAGER_STEPS, getSchoolManagerStepIndex } from '@/constants/schoolManagerSteps.js';

const route = useRoute();
const router = useRouter();

const currentIndex = computed(() => getSchoolManagerStepIndex(route));

const prevStep = computed(() => {
  const index = currentIndex.value;
  return index > 0 ? SCHOOL_MANAGER_STEPS[index - 1] : null;
});

const nextStep = computed(() => {
  const index = currentIndex.value;
  return index >= 0 && index < SCHOOL_MANAGER_STEPS.length - 1
    ? SCHOOL_MANAGER_STEPS[index + 1]
    : null;
});

function goTo(path) {
  router.push(path);
}
</script>

<style scoped>
.page-intro-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  column-gap: 1rem;
  width: 100%;
}

.intro-nav-prev {
  justify-self: start;
}

.intro-content {
  justify-self: center;
  text-align: center;
  width: 100%;
  max-width: 100%;
}

.intro-nav-next {
  justify-self: end;
}

.intro-content :deep(.page-subtitle) {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #555;
}

.nav-btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: #2196f3;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.nav-btn:hover {
  background-color: #1976d2;
}

@media (prefers-color-scheme: dark) {
  .intro-content :deep(.page-subtitle) {
    color: #c8c8c8;
  }

  .nav-btn {
    background-color: #1976d2;
  }

  .nav-btn:hover {
    background-color: #1565c0;
  }
}
</style>
