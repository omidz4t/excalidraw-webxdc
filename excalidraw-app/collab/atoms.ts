import { atom } from "../app-jotai";

import type { CollabAPI } from "./types";

export const collabAPIAtom = atom<CollabAPI | null>(null);
export const isCollaboratingAtom = atom(false);
export const isOfflineAtom = atom(false);
export const activeRoomLinkAtom = atom<string | null>(null);