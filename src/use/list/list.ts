import { useAsyncData } from "vue-asyncx"
import type { Ref, ComputedRef } from 'vue'
import { assign, debounce, isInteger, isObjectLike, isUndefined, omitBy } from "es-toolkit/compat"

/**
 * 对参数的修改发生于同个 tick
 * 请求发起于下一个 timeout
 */
type MaybePromise<T = any> = T | Promise<T> | PromiseLike<T>
type Query<P, I> = (options: { params: P, pageIndex: number, pageSize: number }) => MaybePromise<Array<I> | { data: Array<I>, total: number }>
type Data<Q extends Query<any, any>> = (Awaited<ReturnType<Q>>) extends Array<infer D>
  ? Array<D>
  : (Awaited<ReturnType<Q>>) extends ({ data: Array<infer D> })
    ? Array<D>
    : [] // query 返回异常参数时，类型为空数组

const isValidPageIndex = (v: any): v is number => isInteger(v) && v > -1
const isValidPageSize = (v: any): v is number => isInteger(v) && v > 0

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
  const _pageIndex = ref<number>(0)
  const _pageSize = ref(25)

  const {
    data: rawData,
    queryDataLoading: loading,
    queryData: _queryRawData
  } = useAsyncData(() => {
    return query({
      params: params.value,
      pageIndex: _pageIndex.value,
      pageSize: _pageSize.value
    })
  }, {
    initialData: undefined
  })

  const queryRawData = debounce(_queryRawData)

  function _query(options?: {
    params?: Partial<Parameters<Q>['0']['params']>
    pageIndex?: number,
    pageSize?: number
  }): void {
    if (!options) return queryRawData(), undefined

    if (isValidPageIndex(options.pageIndex)) _pageIndex.value = options.pageIndex
    if (isValidPageSize(options.pageSize)) _pageSize.value = options.pageSize
    if (isObjectLike(options.params) && Object.keys(options.params as object).length) params.value = omitBy(assign({}, params.value, options.params), isUndefined)

    queryRawData()
  }

  const result = computed<{ data: Data<Q>, total: number }>(() => {
    if (Array.isArray(rawData.value)) return { data: rawData.value as any, total: rawData.value.length }

    const { data, total, ...rest } = rawData.value || {}
    if (Array.isArray(data) && Number.isInteger(total)) return { ...rest, data, total }

    return { data: [], total: 0 }
  })
  const data = computed(() => result.value.data)
  const total = computed(() => result.value.total)

  const pageIndex = computed({
    get: () => _pageIndex.value,
    set: v => {
      if (!isValidPageIndex(v) || _pageIndex.value === v) return
      _pageIndex.value = v
      refresh()
    }
  })
  const pageSize = computed({
    get: () => _pageSize.value,
    set: v => {
      if (!isValidPageSize(v) || _pageSize.value === v) return
      _pageSize.value = v
      reload()
    }
  })
  const rowIndex = computed(() => pageIndex.value * pageSize.value)

  function reload() {
    _query({ pageIndex: 0 })
  }

  function refresh() {
    _query()
  }

  return {
    params, // 传参（读写）
    pageIndex, // 传参（读写）
    pageSize, // 传参（读写）

    loading: computed(() => loading.value), // 结果（只读）
    response: computed(() => rawData.value as any),
    data, // 结果（只读）
    total, // 结果（只读）
    rowIndex, // 结果（只读）

    refresh, // 刷新当前页
    reload, // 重首页重载数据
  }
}
