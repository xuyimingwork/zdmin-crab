import { filter, join, kebabCase, keys, map, merge, pickBy, trim, uniq } from "es-toolkit/compat"

type Modifiers = {
  [key: string]: boolean
}

export interface Bem {
  (): string
  (...mods: Modifiers[]): string
  (el: string): string
  (el: string, ...mods: Modifiers[]): string
}

function normalize(name: string): string {
  return kebabCase(trim(name))
}

export function createBEM(block: string): Bem {
  block = normalize(block)
  return (...args: any[]) => {
    const [el, ..._mods] = typeof args[0] === 'string'
      ? args : ['', ...args]

    const base = el ? `${block}__${el}` : block
    const mods = map(keys(pickBy(merge({}, ..._mods), (v) => !!v)), mod => normalize(mod))

    return join([base, ...map(filter(uniq(mods), mod => !!mod), mod => `${base}--${mod}`)], ' ')
  }
}
