import { useList } from "@/use/list/list";
import { expect, test } from 'vitest'

test('allow query return undefined', () => {
  const { data, reload } = useList({ query: () => (undefined) as any })
  reload()
  expect(data.value).toBeInstanceOf(Array)
  expect(data.value.length).toBe(0)
})

test('allow query return async undefined', () => {
  const { data: data, reload: reload } = useList({ query: () => Promise.resolve() as any })
  reload()
  expect(data.value).toBeInstanceOf(Array)
  expect(data.value.length).toBe(0)
})

test('allow query return addition value', () => {
  const { response, reload } = useList({ query: () => ({ total: 3, data: [], abc: 'ok' }) })
  expect(response.value).toBe(undefined)
  reload()
  expect(response.value.abc).toBe('ok')
})
