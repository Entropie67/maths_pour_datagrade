import type { Keys } from './keyboardContent'

export type KeyCap = {
  display: string
  insert?: string
  command?: string | string[]
  action?: 'insertMatrix'
}

export const isSpecialKey = (key: Keys): boolean =>
  ['DEL', 'CLOSE', 'BACK', 'FWD', 'abc', 'ABC', 'NUM'].includes(key.toString())
export const isPageKey = (key: Keys): boolean =>
  ['abc', 'ABC', 'NUM'].includes(key.toString())
