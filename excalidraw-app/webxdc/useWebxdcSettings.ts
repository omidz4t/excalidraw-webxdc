import { useEffect } from "react";

import { useSetAtom } from "../app-jotai";

import {
  autosaveToChatAtom,
  loadWebxdcAutosaveSetting,
} from "./webxdc-settings";

export const useWebxdcSettings = () => {
  const setAutosaveToChat = useSetAtom(autosaveToChatAtom);

  useEffect(() => {
    loadWebxdcAutosaveSetting().then(setAutosaveToChat);
  }, [setAutosaveToChat]);
};