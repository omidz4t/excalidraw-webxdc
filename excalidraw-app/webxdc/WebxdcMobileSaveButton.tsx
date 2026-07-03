import { webxdcPersistRef } from "./persist-ref";

import "./WebxdcMobileSaveButton.scss";

const WebxdcMobileSaveButton = () => {
  return (
    <button
      type="button"
      className="webxdc-mobile-save-btn"
      onClick={() => webxdcPersistRef.current?.()}
      title="Save to chat (Ctrl+S)"
    >
      Save
    </button>
  );
};

export default WebxdcMobileSaveButton;