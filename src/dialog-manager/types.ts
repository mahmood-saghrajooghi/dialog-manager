import { DialogIds } from './constants';

export type DialogId = typeof DialogIds[keyof typeof DialogIds];
