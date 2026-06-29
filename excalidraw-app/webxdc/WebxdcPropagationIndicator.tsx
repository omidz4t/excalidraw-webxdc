import { useAtomValue } from "../app-jotai";

import { collabSyncStatusAtom } from "./collab-status";

const WARNING_ICON = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 512 512"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
  </svg>
);

const getPropagationMessage = (
  reason: string,
  detail: string,
): string => {
  if (reason === "size") {
    return "Your latest changes could not be sent to the chat because the update is too large. Keep editing locally; try removing large images or splitting the board.";
  }

  if (detail) {
    return `Your latest changes could not be sent to the chat.\n${detail}\nYou can keep editing locally; the app will retry automatically.`;
  }

  return "Your latest changes could not be sent to the chat. You can keep editing locally; the app will retry automatically.";
};

const WebxdcPropagationIndicator = () => {
  const status = useAtomValue(collabSyncStatusAtom);

  if (!status.propagationFailed || status.initPhase !== "ready") {
    return null;
  }

  const message = getPropagationMessage(
    status.propagationFailureReason,
    status.propagationError,
  );

  return (
    <button
      type="button"
      className="webxdc-propagation-indicator"
      title={message}
      aria-label={message.replace(/\n/g, " ")}
      onClick={() => {
        window.alert(message);
      }}
    >
      {WARNING_ICON}
    </button>
  );
};

export default WebxdcPropagationIndicator;