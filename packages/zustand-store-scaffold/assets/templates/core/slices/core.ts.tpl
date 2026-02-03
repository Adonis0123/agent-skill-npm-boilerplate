import type { StateCreator } from 'zustand'

export interface {{StoreName}}SliceState {
  // TODO: add state
}

export interface {{StoreName}}SliceActions {
  // TODO: add actions
}

export type {{StoreName}}Slice = {{StoreName}}SliceState & {{StoreName}}SliceActions

export interface {{StoreName}}SliceConfig {
  initialState?: Partial<{{StoreName}}SliceState>
}

export function create{{StoreName}}Slice<Slice = unknown>(config?: {{StoreName}}SliceConfig) {
  const { initialState } = config || {}

  const slice: StateCreator<
    {{StoreName}}Slice & Slice,
    [['zustand/immer', never]],
    [],
    {{StoreName}}Slice
  > = (set) => ({
    ...initialState,
  })

  return slice
}
