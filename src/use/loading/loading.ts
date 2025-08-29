import { tryOnBeforeUnmount } from "@vueuse/core"
import { isBoolean, isNil } from "es-toolkit"
import type { MaybeRefOrGetter, ComputedRef } from 'vue'

type LoadState = boolean | number | undefined | null
type BindTarget = MaybeRefOrGetter<LoadState> | MaybeRefOrGetter<LoadState[]>

function isLoading(v: LoadState) {
  if (isNil(v)) return false
  if (isBoolean(v)) return v
  return v > 0
}

export function useLoading() {
  const targets = ref<ComputedRef<boolean>[]>([])
  return {
    loading: computed(() => !!targets.value.length && targets.value.some(item => toValue(item))),
    bind(target: BindTarget) {
      const source = computed(() => {
        const state = toValue(target)
        if (Array.isArray(state)) return !!state.length && state.some(item => isLoading(item))
        return isLoading(state)
      })
      targets.value.push(source)
      tryOnBeforeUnmount(() => targets.value = targets.value.filter(item => item !== source))
    }
  }
}
