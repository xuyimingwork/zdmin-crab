import { createBEM } from '@/utils/bem'
import { camelCase, upperFirst } from 'es-toolkit/compat'

const PREFIX = 'Crab'

export function createNamespace(name: string) {
  name = upperFirst(camelCase(`${PREFIX}-${name}`))
  return {
    name,
    bem: createBEM(name)
  }
}
