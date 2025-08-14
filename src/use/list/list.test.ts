import { useList } from "@/use/list/list";
import { expect, test, vi } from 'vitest'

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))
const createSource = () => ({
  query: ({ pageIndex, pageSize }: any) => ({
    total: 100,
    data: new Array((100 - (pageIndex * pageSize)) < 0
      ? 0
      : (100 - (pageIndex * pageSize)) < pageSize
        ? (100 - (pageIndex * pageSize))
        : pageSize
    ).fill(0).map((v, i) => pageIndex * pageSize + i)
  })
})

test('before first query state', async () => {
  const { data } = useList({ query: () => ([1]) as any })
  expect(data.value).toBeInstanceOf(Array)
  expect(data.value.length).toBe(0)
})

test('after first query state', async () => {
  const { data,  reload } = useList({ query: () => ([1]) as any })
  reload()
  await wait()
  expect(data.value).toBeInstanceOf(Array)
  expect(data.value.length).toBe(1)
})

test('allow query return undefined', async () => {
  const { data, reload } = useList({ query: () => (undefined) as any })
  const v = data.value
  reload()
  await wait()
  expect(data.value).toBe(v)
})

test('allow query return async undefined', async () => {
  const { data, reload } = useList({ query: () => Promise.resolve() as any })
  const v = data.value
  reload()
  await wait()
  expect(data.value).toBe(v)
})

test('allow query return addition value', async () => {
  const { response, reload } = useList({ query: () => ({ total: 3, data: [1, 2, 3], abc: 'ok' }) })
  expect(response.value).toBe(undefined)
  reload()
  await wait()
  expect(response.value.abc).toBe('ok')
})

test('reload immediate update page', async () => {
  const source = createSource()
  const { reload, pageIndex } = useList({ query: (options: any) => source.query(options) })
  pageIndex.value++
  expect(pageIndex.value).toBe(1)
  reload()
  expect(pageIndex.value).toBe(0)
})

test('query called on same delay', async () => {
  const source = createSource()
  const spyQuery = vi.spyOn(source, 'query')
  const {
    pageIndex,
    pageSize,
    reload,
    refresh,
  } = useList({ query: (options: any) => source.query(options) })
  pageSize.value = 20
  await wait(0)
  expect(spyQuery).toBeCalledTimes(1)

  pageIndex.value++
  await wait(0)
  expect(spyQuery).toBeCalledTimes(2)

  reload()
  await wait(0)
  expect(spyQuery).toBeCalledTimes(3)

  refresh()
  await wait(0)
  expect(spyQuery).toBeCalledTimes(4)
})

test('change page size will auto change index', async () => {
  const source = createSource()
  const {
    pageSize,
    pageIndex,
  } = useList({ query: (options: any) => {
    return source.query(options)
  }})

  pageIndex.value++
  expect(pageIndex.value).toBe(1)
  pageSize.value = 2
  expect(pageIndex.value).toBe(0)
})

test('change page size will auto query', async () => {
  const source = createSource()
  const spyQuery = vi.spyOn(source, 'query')
  const {
    pageSize,
  } = useList({ query: (options: any) => {
    return source.query(options)
  }})

  pageSize.value = 2
  await wait(0)
  expect(spyQuery).toBeCalledTimes(1)
})

test('change page index will auto query', async () => {
  const source = createSource()
  const spyQuery = vi.spyOn(source, 'query')
  const {
    pageIndex,
  } = useList({ query: (options: any) => {
    return source.query(options)
  }})

  pageIndex.value++
  await wait(0)
  expect(spyQuery).toBeCalledTimes(1)
})

test('change page variable both should query only once', async () => {
  const source = createSource()
  const spyQuery = vi.spyOn(source, 'query')
  const {
    pageIndex,
    pageSize,
  } = useList({ query: (options: any) => {
    return source.query(options)
  }})

  pageIndex.value = 2
  pageSize.value = 2
  await wait(0)
  expect(spyQuery).toBeCalledTimes(1)
})

test('change page variable order: index first', async () => {
  const source = createSource()
  const {
    pageIndex,
    pageSize,
  } = useList({ query: (options: any) => {
    expect(options.pageIndex).toBe(0)
    expect(options.pageSize).toBe(2)
    return source.query(options)
  }})

  pageIndex.value = 2
  pageSize.value = 2
  await wait(0)
})

test('change page variable order: size first', async () => {
  const source = createSource()
  const {
    pageIndex,
    pageSize,
  } = useList({ query: (options: any) => {
    expect(options.pageIndex).toBe(2)
    expect(options.pageSize).toBe(2)
    return source.query(options)
  }})

  pageSize.value = 2
  pageIndex.value = 2
  await wait(0)
})


