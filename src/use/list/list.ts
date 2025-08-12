// list = [query params] + table + [pagination]
// pagination => index + size + total

import { useAsyncData } from "vue-asyncx"
import type { Ref, ComputedRef } from 'vue'

type MaybePromise<T = any> = T | Promise<T> | PromiseLike<T>

export function useList<
  Item = any,
  Params = any,
  Fn extends (...args: any) => any = (options: { params: Params, pageIndex: number, pageSize: number }) => MaybePromise<Array<Item> | { data: Array<Item>, total: number }>>({
  query
}: {
  query: Fn
}): {
  params: Ref<Params>, // 传参（读写）
  pageIndex: Ref<number>, // 传参（读写）
  pageSize: Ref<number>, // 传参（读写）

  loading: ComputedRef<boolean>, // 结果（只读）
  response: ComputedRef<Awaited<ReturnType<Fn>>>
  data: ComputedRef<Item[]>, // 结果（只读）
  total: ComputedRef<number>, // 结果（只读）
  rowIndex: ComputedRef<number>, // 结果（只读）

  reload: () => void, // 操作
  refresh: () => void, // 操作
} {
  const params = ref<any>({})
  const pageIndex = ref<number>(0)
  const pageSize = ref(25)

  const {
    data: rawData,
    queryDataLoading: loading,
    queryData: queryRawData
  } = useAsyncData(() => {
    return query({
      params: params.value,
      pageIndex: pageIndex.value,
      pageSize: pageSize.value
    })
  }, {
    initialData: undefined
  })

  // 初始状态总项数为 0
  // 单页状态总项数为列表项数
  const result = computed<{ data: Item[], total: number }>(() => {
    if (Array.isArray(rawData.value)) return { data: rawData.value, total: rawData.value.length }

    const { data, total, ...rest } = rawData.value || {}
    if (Array.isArray(data) && Number.isInteger(total)) return { ...rest, data, total }

    return { data: [], total: 0 }
  })

  const data = computed(() => result.value.data)
  const total = computed(() => result.value.total)

  // 第 1 页，25 项/页，第 1 项为 0
  // 第 2 页，25 项/页，第 1 项为 25
  const rowIndex = computed(() => pageIndex.value * pageSize.value)

  function reload() {
    pageIndex.value = 0
    queryRawData()
  }

  function refresh() {
    queryRawData()
  }

  // 配置化触发
  watch(pageIndex, () => refresh())
  // 配置化触发
  watch(pageSize, () => reload())

  return {
    params, // 传参（读写）
    pageIndex, // 传参（读写）
    pageSize, // 传参（读写）

    loading: computed(() => loading.value), // 结果（只读）
    response: computed(() => rawData.value),
    data, // 结果（只读）
    total, // 结果（只读）
    rowIndex, // 结果（只读）

    reload, // 操作
    refresh, // 操作
  }
}
