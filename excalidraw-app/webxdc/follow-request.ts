import { atom } from "jotai";

export type PendingFollowRequest = {
  fromAddr: string;
  fromName: string;
};

export const pendingFollowRequestAtom = atom<PendingFollowRequest | null>(null);