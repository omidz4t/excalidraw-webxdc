import { CaptureUpdateAction } from "@excalidraw/element";
import { Popover } from "radix-ui";
import clsx from "clsx";
import { useState } from "react";

import { getClientColor } from "@excalidraw/excalidraw/clients";
import { Avatar } from "@excalidraw/excalidraw/components/Avatar";
import { useExcalidrawAPI } from "@excalidraw/excalidraw/index";
import type { Collaborator, SocketId } from "@excalidraw/excalidraw/types";

import { webxdcRealtimeRef } from "./realtime-ref";

import "./WebxdcCollaboratorMenu.scss";

type WebxdcCollaboratorMenuProps = {
  socketId: SocketId;
  collaborator: Collaborator;
  isBeingFollowed: boolean;
  withName?: boolean;
  statusClassNames: string;
  statusIconJSX: React.ReactNode;
};

const WebxdcCollaboratorMenu = ({
  socketId,
  collaborator,
  isBeingFollowed,
  withName = false,
  statusClassNames,
  statusIconJSX,
}: WebxdcCollaboratorMenuProps) => {
  const api = useExcalidrawAPI();
  const [open, setOpen] = useState(false);
  const background = getClientColor(socketId, collaborator);
  const realtimeAvailable = webxdcRealtimeRef.current?.isAvailable ?? false;

  const follow = () => {
    if (!api) {
      return;
    }

    if (
      !collaborator.socketId ||
      api.getAppState().userToFollow?.socketId === collaborator.socketId
    ) {
      api.updateScene({
        appState: { userToFollow: null },
        captureUpdate: CaptureUpdateAction.EVENTUALLY,
      });
    } else {
      api.updateScene({
        appState: {
          userToFollow: {
            socketId: collaborator.socketId,
            username: collaborator.username || "",
          },
          openMenu:
            api.getAppState().openMenu === "canvas"
              ? null
              : api.getAppState().openMenu,
        },
        captureUpdate: CaptureUpdateAction.EVENTUALLY,
      });
    }

    setOpen(false);
  };

  const requestFollow = () => {
    const addr = collaborator.socketId as string;
    if (!webxdcRealtimeRef.current?.requestFollow(addr)) {
      window.alert(
        "Request to follow needs live P2P (Delta Chat 1.48+ with realtime enabled).",
      );
      return;
    }
    setOpen(false);
  };

  const menu = (
    <div className="webxdc-collaborator-menu">
      <button type="button" className="webxdc-collaborator-menu__item" onClick={follow}>
        {isBeingFollowed ? "Unfollow" : "Follow"}
      </button>
      <button
        type="button"
        className="webxdc-collaborator-menu__item"
        onClick={requestFollow}
        disabled={!realtimeAvailable}
        title={
          realtimeAvailable
            ? undefined
            : "Needs live P2P (Delta Chat 1.48+)"
        }
      >
        Request to follow me
      </button>
    </div>
  );

  if (withName) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <div
            className={`dropdown-menu-item dropdown-menu-item-base UserList__collaborator ${statusClassNames}`}
            style={{ [`--avatar-size` as any]: "1.5rem" }}
          >
            <Avatar
              color={background}
              onClick={() => {}}
              name={collaborator.username || ""}
              src={collaborator.avatarUrl}
              className={statusClassNames}
            />
            <div className="UserList__collaborator-name">
              {collaborator.username}
            </div>
            <div className="UserList__collaborator-status-icons" aria-hidden>
              {isBeingFollowed && (
                <div
                  className="UserList__collaborator-status-icon-is-followed"
                  title="You are following this user"
                >
                  ●
                </div>
              )}
              {statusIconJSX}
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Content
          style={{ zIndex: 3 }}
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {menu}
        </Popover.Content>
      </Popover.Root>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          className={clsx(
            "UserList__collaborator UserList__collaborator--avatar-only",
            statusClassNames,
          )}
        >
          <Avatar
            color={background}
            onClick={() => {}}
            name={collaborator.username || ""}
            src={collaborator.avatarUrl}
            className={statusClassNames}
          />
          {statusIconJSX && (
            <div className="UserList__collaborator-status-icon">
              {statusIconJSX}
            </div>
          )}
        </div>
      </Popover.Trigger>
      <Popover.Content
        style={{ zIndex: 3 }}
        align="end"
        sideOffset={6}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {menu}
      </Popover.Content>
    </Popover.Root>
  );
};

export default WebxdcCollaboratorMenu;