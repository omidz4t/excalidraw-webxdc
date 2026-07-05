import { atom } from "jotai";

import { appJotaiStore } from "../app-jotai";

export const webxdcHelpOpenAtom = atom(false);

export const openWebxdcHelp = () => {
  appJotaiStore.set(webxdcHelpOpenAtom, true);
};

export const closeWebxdcHelp = () => {
  appJotaiStore.set(webxdcHelpOpenAtom, false);
};

export const toggleWebxdcHelp = () => {
  appJotaiStore.set(webxdcHelpOpenAtom, (open) => !open);
};