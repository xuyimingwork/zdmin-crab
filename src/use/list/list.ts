// list = [query params] + table + [pagination]
// pagination => index + size + total

import { useAsyncData } from "vue-asyncx"
import type { Ref, ComputedRef } from 'vue'

type MaybePromise<T = any> = T | Promise<T> | PromiseLike<T>
type Query<P, I> = (options: { params: P, pageIndex: number, pageSize: number }) => MaybePromise<Array<I> | { data: Array<I>, total: number }>
type Data<Q extends Query<any, any>> = (Awaited<ReturnType<Q>>) extends Array<infer D>
  ? Array<D>
  : (Awaited<ReturnType<Q>>) extends ({ data: Array<infer D> })
    ? Array<D>
    : [] // query 返回异常参数时，类型为空数组

export function useList<
  Q extends Query<any, any> = any
>({
  query
}: {
  query: Q
}): {
  params: Ref<Parameters<Q>['0']['params']>, // 传参（读写）
  pageIndex: Ref<number>, // 传参（读写）
  pageSize: Ref<number>, // 传参（读写）

  loading: ComputedRef<boolean>, // 结果（只读）
  response: ComputedRef<Awaited<ReturnType<Q>>>
  data: ComputedRef<Data<Q>>, // 结果（只读）
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
  const result = computed<{ data: Data<Q>, total: number }>(() => {
    if (Array.isArray(rawData.value)) return { data: rawData.value as any, total: rawData.value.length }

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
    response: computed(() => rawData.value as any),
    data, // 结果（只读）
    total, // 结果（只读）
    rowIndex, // 结果（只读）

    reload, // 操作
    refresh, // 操作
  }
}
