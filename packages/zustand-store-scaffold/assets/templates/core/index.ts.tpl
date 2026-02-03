import { createStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { create{{StoreName}}Slice } from './slices/core'

import type { {{StoreName}}Slice, {{StoreName}}SliceConfig } from './slices/core'

export type * from './slices/core'
export { create{{StoreName}}Slice }

export function create{{StoreName}}Store(config?: {{StoreName}}SliceConfig) {
  return createStore<{{StoreName}}Slice>()(
    immer((...args) => {
      const coreSlice = create{{StoreName}}Slice(config)(...args)

      return coreSlice
    }),
  )
}

export type {{StoreName}}StoreApi = ReturnType<typeof create{{StoreName}}Store>
