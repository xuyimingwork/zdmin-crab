<script setup lang="ts">
  import { createNamespace } from '@/utils';
  import { filter, includes, join, keys } from 'es-toolkit/compat';
  import type { StyleValue } from 'vue';

  defineOptions({
    name: createNamespace('flex').name
  })

  const { bem } = createNamespace('flex')

  type FlexChild = {
    visible?: boolean,
    style?: StyleValue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class?: any
  }

  const props = withDefaults(defineProps<{
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse',
    start?: FlexChild,
    main?: FlexChild,
    end?: FlexChild,
  }>(), { direction: 'row' })

  const CHILDREN = ['start', 'main', 'end'] as const
  type SlotName = typeof CHILDREN[number] | 'default'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slots: Partial<{ [key in SlotName]: any }> = useSlots()
  const slotNames = ref<SlotName[]>(keys(slots) as SlotName[])
  onBeforeUpdate(() => slotNames.value = keys(slots) as SlotName[])

  const children = computed(() => filter(CHILDREN, key => {
    const config = props[key as typeof CHILDREN[number]]
    if (config && 'visible' in config) return !!config.visible
    if (key !== 'main') return includes(slotNames.value, key)
    return includes(slotNames.value, 'default') || includes(slotNames.value, 'main')
  }))
</script>

<template>
  <div :class="bem({
    [direction]: true,
    [`children-${join(children, '-')}`]: children.length > 0
  })">
    <div v-for="child in children"
      :class="[bem(child), props[child]?.class]"
      :key="child"
      :style="props[child]?.style">
      <slot :name="child"><slot v-if="child === 'main'" /></slot>
    </div>
  </div>
</template>

<style lang="scss">
  .crab-flex {
    $self: &;

    display: flex;
    flex-direction: v-bind(direction);
    box-sizing: border-box;

    & > &__main {
      flex: auto; /* 1 1 auto 自动伸缩 */
    }
    & > &__start,
    & > &__end {
      flex: none; /* 0 0 auto 不允许伸缩 */
    }

    &--row,
    &--row-reverse {
      width: 100%; // 默认行为，保持代码结构一致性
      overflow-x: auto; // start end 超出水平空间，由于 start、end 无法压缩，故允许容器水平滚动

      & > #{$self}__main {
        min-width: 0; // 默认情况下，允许 main 部分被压缩至消失
        overflow-x: auto; // good: 超出主内容区域，允许滚动 bad: 内容 100% 情形下会导致 box-shadow 被 hidden
      }
    }

    &--column,
    &--column-reverse {
      height: 100%; // 垂直状态默认占据垂直向 100% 空间，与水平向保持一致
      overflow-y: auto; // start、end 超出垂直空间，由于 start、end 无法压缩，故允许容器垂直滚动

      & > #{$self}__main {
        min-height: 0; // 默认情况下，允许 main 部分被压缩至消失
        overflow-y: auto;  // good: 超出主内容区域，允许滚动 bad: 内容 100% 情形下会导致 box-shadow 被 hidden
      }
    }

    // 处理只存在 start + end 情况
    &--children-start-end {
      justify-content: space-between
    }

    // 处理只存在 end 情况
    &--children-end {
      justify-content: flex-end;
    }
  }
</style>
