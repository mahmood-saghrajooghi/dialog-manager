import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';

import type { DialogId } from './types';

type DialogManagerStore = {
  state: Record<string, { open: boolean }>;
  openDialog: (id: DialogId) => void;
  closeDialog: (id: DialogId) => void;
  registerDialog: (id: DialogId) => void;
  unregisterDialog: (id: DialogId) => void;
}

export const useDialogManager = create(devtools<DialogManagerStore>(
  (set) => ({
    state: {},
    registerDialog: (id: DialogId) => set(
      produce((state) => {
        state.state[id] = { open: false };
      }),
    ),
    unregisterDialog: (id: DialogId) => set(
      produce((state: DialogManagerStore) => {
        delete state.state[id];
      }),
    ),
    openDialog: (id: DialogId) => set(
      produce((state: DialogManagerStore) => {
        state.state[id].open = true;
      }),
    ),
    closeDialog: (id: DialogId) => set(
      produce((state: DialogManagerStore) => {
        state.state[id].open = false;
      }),
    ),
  }),
  { name: 'DialogManagerStore' },
));
