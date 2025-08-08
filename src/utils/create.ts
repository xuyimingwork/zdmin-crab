import { createBEM } from '@/utils/bem'
import { camelCase, upperFirst } from 'lodash-es'

const PREFIX = 'Crab'

export function createNamespace(name: string) {
  name = upperFirst(camelCase(`${PREFIX}-${name}`))
  return {
    name,
    bem: createBEM(name)
  }
}
