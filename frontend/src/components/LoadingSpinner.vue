<template>
  <div class="flex justify-center items-center" :class="containerClass">
    <svg
      class="animate-spin text-indigo-600"
      :class="sizeClass"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span v-if="message" class="ml-2 text-sm text-gray-600" :class="textClass">
      {{ message }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  }
})

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const sizeClass = computed(() => sizeClasses[props.size] || sizeClasses.md)

const containerClass = computed(() => {
  return props.inline ? '' : 'py-8'
})

const textClass = computed(() => {
  const classes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }
  return classes[props.size] || classes.md
})
</script>