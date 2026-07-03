import type { ExcalidrawElement } from "@excalidraw/element/types";
import * as Y from "yjs";

import type { LastKnownOrderedElement } from "./diff";

const compareFractionalPos = (left: string, right: string) =>
  left > right ? 1 : left < right ? -1 : 0;

export const getYjsElementEntry = (
  map: Y.Map<unknown> | undefined,
): ExcalidrawElement | null => {
  const el = map?.get("el") as ExcalidrawElement | undefined;
  return el?.id ? el : null;
};

export const lastKnownElementsFromYArray = (
  yArray: Y.Array<Y.Map<unknown>>,
): LastKnownOrderedElement[] => {
  return yArray
    .toArray()
    .map((map) => {
      const el = getYjsElementEntry(map);
      if (!el) {
        return null;
      }
      return {
        id: el.id,
        version: el.version,
        pos: (map.get("pos") as string) ?? el.index ?? "",
      };
    })
    .filter((entry): entry is LastKnownOrderedElement => entry !== null)
    .sort((a, b) => compareFractionalPos(a.pos, b.pos));
};

export const moveArrayItem = <T>(arr: T[], from: number, to: number, inPlace = true) => {
  if (!inPlace) {
    arr = [...arr];
  }
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  return arr;
};

export const debounce = (callback: (...args: unknown[]) => void, wait: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: unknown[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

export const areElementsSame = (
  els1: readonly { id: string; version: number }[],
  els2: readonly { id: string; version: number }[],
) => {
  if (els1.length !== els2.length) {
    return false;
  }

  for (let i = 0; i < els1.length; i++) {
    if (els1[i].id !== els2[i].id || els1[i].version !== els2[i].version) {
      return false;
    }
  }

  return true;
};

export const yjsToExcalidraw = (yArray: Y.Array<Y.Map<any>>): ExcalidrawElement[] => {
  return yArray
    .toArray()
    .sort((a, b) =>
      compareFractionalPos(
        (a.get("pos") as string) ?? "",
        (b.get("pos") as string) ?? "",
      ),
    )
    .map((map) => getYjsElementEntry(map))
    .filter((el): el is ExcalidrawElement => el !== null);
};