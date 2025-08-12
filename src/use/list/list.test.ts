import { useList } from "@/use/list/list";
import { expect, test } from 'vitest'

test('允许查询返回空数据', () => {
  const { data } = useList({ query: () => null as any })
  expect(data.value).toBeInstanceOf(Array)
  expect(data.value.length).toBe(0)

  const { data: data2 } = useList({ query: () => Promise.resolve() as any })
  expect(data2.value).toBeInstanceOf(Array)
  expect(data2.value.length).toBe(0)
})
