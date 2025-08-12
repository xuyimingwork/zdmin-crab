import { useList } from "@/use/list/list";
import { expect, test } from 'vitest'

test('allow query return illegal', () => {
  const { data } = useList({ query: () => null as any })
  expect(data.value).toBeInstanceOf(Array)
  expect(data.value.length).toBe(0)

  const { data: data2 } = useList({ query: () => Promise.resolve() as any })
  expect(data2.value).toBeInstanceOf(Array)
  expect(data2.value.length).toBe(0)
})
