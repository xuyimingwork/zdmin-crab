<script setup lang="ts">
  import { createNamespace } from '@/utils';

  defineOptions({
    name: createNamespace('flex').name
  })

  const { bem } = createNamespace('flex')

  const { direction = 'row' } = defineProps<{
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse',
  }>()
</script>

<template>
  <div :class="bem()">{{ direction }}</div>
</template>

<style lang="scss" scoped>
  .abc {
    background: pink;
  }
</style>
