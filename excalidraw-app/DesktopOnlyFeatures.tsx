import { TTDDialogTrigger } from "@excalidraw/excalidraw";

import { AIComponents } from "./components/AI";
import Collab from "./collab/Collab";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const DesktopOnlyFeatures = ({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}) => {
  return (
    <>
      <Collab excalidrawAPI={excalidrawAPI} />
      <AIComponents excalidrawAPI={excalidrawAPI} />
      <TTDDialogTrigger />
    </>
  );
};

export default DesktopOnlyFeatures;