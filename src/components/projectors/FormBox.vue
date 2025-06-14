<script setup>
import { defineProps } from 'vue';
import { RESPONSE_STATUS_ERROR, RESPONSE_STATUS_INFO, RESPONSE_STATUS_SUCCESS, RESPONSE_STATUS_WARNING } from '@/utils/constants';

// Define the props passed from the parent
const props = defineProps({
    formTitle: {
        type: String,
        default: "Default Title"
    },
    bannerBackgroundColor: {
        type: String,
        default: "bg-primary"
    },
    enableBanner: {
        type: Boolean,
        default: true
    },
    bannerTextColor: {
        type: String,
        default: "text-white"
    },
    containerBackgroundStyle: {
        type: String,
        default: "background-color: azure;"
    },
    subtitle:{
        type: String,
        default: "Default subtitle."
    },
    helpText: {
        type: String,
        default: "Default help-text."
    },
    helpTitle:{
        type: String,
        default: "Ayuda:"
    },
    submitButtonText: {
        type: String,
        default: "Default submit."
    },
    collapseId: {
        type: String,
        default: "defaultId"
    },
    responseType:{
        type: String,
        default: ""
    },
    responseTypeAlt:{
        type: String,
        default: ""
    },
    responseData:{
        type: String,
        default: ""
    },
    responseDataAlt:{
        type: String,
        default: ""
    },
    enableButton:{
        type: Boolean,
        default: true
    },
    dataLoading:{
        type: Boolean,
        default: false
    }
});

</script>

<template>
    <!-- root container. -->
    <div class="rounded border border-dark d-flex flex-column" :style="props.containerBackgroundStyle">

        <!-- Form title banner -->
        <div v-if="props.enableBanner"
            :class="['rounded-top', 'border-bottom', 'border-dark', 'text-center', props.bannerBackgroundColor, props.bannerTextColor]">
            <h4 class="pt-0">{{ props.formTitle }}</h4>
        </div>

        <p class="mt-2 mb-0 p-1 text-center text-black" style="font-size: small;">
            <span v-html="props.subtitle"></span> 
        </p>

        <!-- Slot for custom content -->
        <div class="ps-2 pe-2 pb-2">
            <slot>
                 
            </slot>
        </div>

        <div> 
            <div v-if="props.responseType === RESPONSE_STATUS_ERROR" class="alert alert-danger ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseType === RESPONSE_STATUS_INFO" class="alert alert-primary ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseType === RESPONSE_STATUS_SUCCESS" class="alert alert-success ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseType === RESPONSE_STATUS_WARNING" class="alert alert-warning ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseTypeAlt === RESPONSE_STATUS_ERROR" class="alert alert-danger ms-3 me-3 p-3" role="alert">
                {{ props.responseDataAlt }}
            </div>
            <div v-if="props.responseTypeAlt === RESPONSE_STATUS_INFO" class="alert alert-primary ms-3 me-3 p-3" role="alert">
                {{ props.responseDataAlt }}
            </div>
            <div v-if="props.responseTypeAlt === RESPONSE_STATUS_SUCCESS" class="alert alert-success ms-3 me-3 p-3" role="alert">
                {{ props.responseDataAlt }}
            </div>
            <div v-if="props.responseTypeAlt === RESPONSE_STATUS_WARNING" class="alert alert-warning ms-3 me-3 p-3" role="alert">
                {{ props.responseDataAlt }}
            </div>
            <div v-if="props.dataLoading" class="alert alert-info ms-3 me-3 p-3 text-center" role="alert">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden text-black">Loading...</span>
                </div>
            </div>
            
        </div>

        <!-- Submit button container -->
        <div v-if="props.enableButton" class="pb-4 d-flex flex-column align-items-center text-center">
            <!-- Centered Submit Button -->
            <button type="submit"
                :class="['btn', 'fw-bold', 'rounded', 'border', 'border-dark', 'mt-2', props.bannerBackgroundColor, props.bannerTextColor]"
                @click="$emit('buttonClicked')">
                {{ props.submitButtonText }}
            </button>
        </div><!-- /Submit button container -->

    </div> <!-- /root container. -->
</template>
<style scoped>
</style>
