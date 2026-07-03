import { Popover } from "radix-ui";
import clsx from "clsx";
import React, { useLayoutEffect } from "react";

import { supportsResizeObserver, isShallowEqual } from "@excalidraw/common";
import { t } from "@excalidraw/excalidraw/i18n";
import { Island } from "@excalidraw/excalidraw/components/Island";
import { QuickSearch } from "@excalidraw/excalidraw/components/QuickSearch";
import { ScrollableList } from "@excalidraw/excalidraw/components/ScrollableList";
import { Tooltip } from "@excalidraw/excalidraw/components/Tooltip";

import type { Collaborator, SocketId } from "@excalidraw/excalidraw/types";

import WebxdcCollaboratorMenu from "./WebxdcCollaboratorMenu";

import "../../packages/excalidraw/components/UserList.scss";

/** collaborator user id or socket id (fallback) */
type ClientId = string & { _brand: "UserId" };

const DEFAULT_MAX_AVATARS = 4;
const SHOW_COLLABORATORS_FILTER_AT = 8;

const ConditionalTooltipWrapper = ({
  shouldWrap,
  children,
  username,
}: {
  shouldWrap: boolean;
  children: React.ReactNode;
  username?: string | null;
}) =>
  shouldWrap ? (
    <Tooltip label={username || "Unknown user"}>{children}</Tooltip>
  ) : (
    <>{children}</>
  );

const renderCollaborator = ({
  collaborator,
  socketId,
  withName = false,
  shouldWrapWithTooltip = false,
  isBeingFollowed,
}: {
  collaborator: Collaborator;
  socketId: SocketId;
  withName?: boolean;
  shouldWrapWithTooltip?: boolean;
  isBeingFollowed: boolean;
}) => {
  const statusClassNames = clsx({
    "is-followed": isBeingFollowed,
    "is-current-user": collaborator.isCurrentUser === true,
    "is-speaking": collaborator.isSpeaking,
    "is-in-call": collaborator.isInCall,
    "is-muted": collaborator.isMuted,
  });

  const statusIconJSX = collaborator.isInCall ? (
    collaborator.isSpeaking ? (
      <div
        className="UserList__collaborator-status-icon-speaking-indicator"
        title={t("userList.hint.isSpeaking")}
      >
        <div />
        <div />
        <div />
      </div>
    ) : collaborator.isMuted ? (
      <div
        className="UserList__collaborator-status-icon-microphone-muted"
        title={t("userList.hint.micMuted")}
      >
        mic
      </div>
    ) : (
      <div title={t("userList.hint.inCall")}>mic</div>
    )
  ) : null;

  return (
    <ConditionalTooltipWrapper
      key={socketId}
      username={collaborator.username}
      shouldWrap={shouldWrapWithTooltip}
    >
      <WebxdcCollaboratorMenu
        socketId={socketId}
        collaborator={collaborator}
        withName={withName}
        isBeingFollowed={isBeingFollowed}
        statusClassNames={statusClassNames}
        statusIconJSX={statusIconJSX}
      />
    </ConditionalTooltipWrapper>
  );
};

type UserListUserObject = Pick<
  Collaborator,
  | "avatarUrl"
  | "id"
  | "socketId"
  | "username"
  | "isInCall"
  | "isSpeaking"
  | "isMuted"
>;

type WebxdcUserListProps = {
  className?: string;
  mobile?: boolean;
  collaborators: Map<SocketId, UserListUserObject>;
  userToFollow: SocketId | null;
};

const collaboratorComparatorKeys = [
  "avatarUrl",
  "id",
  "socketId",
  "username",
  "isInCall",
  "isSpeaking",
  "isMuted",
] as const;

const WebxdcUserList = React.memo(
  ({ className, mobile, collaborators, userToFollow }: WebxdcUserListProps) => {
    const uniqueCollaboratorsMap = new Map<
      ClientId,
      Collaborator & { socketId: SocketId }
    >();

    collaborators.forEach((collaborator, socketId) => {
      const userId = (collaborator.id || socketId) as ClientId;
      uniqueCollaboratorsMap.set(userId, { ...collaborator, socketId });
    });

    const uniqueCollaboratorsArray = Array.from(
      uniqueCollaboratorsMap.values(),
    ).filter((collaborator) => collaborator.username?.trim());

    const [searchTerm, setSearchTerm] = React.useState("");
    const filteredCollaborators = uniqueCollaboratorsArray.filter(
      (collaborator) =>
        collaborator.username?.toLowerCase().includes(searchTerm),
    );

    const userListWrapper = React.useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      if (userListWrapper.current) {
        const updateMaxAvatars = (width: number) => {
          const maxAvatars = Math.max(1, Math.min(8, Math.floor(width / 38)));
          setMaxAvatars(maxAvatars);
        };

        updateMaxAvatars(userListWrapper.current.clientWidth);

        if (!supportsResizeObserver) {
          return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width } = entry.contentRect;
            updateMaxAvatars(width);
          }
        });

        resizeObserver.observe(userListWrapper.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }, []);

    const [maxAvatars, setMaxAvatars] = React.useState(DEFAULT_MAX_AVATARS);

    const firstNCollaborators = uniqueCollaboratorsArray.slice(
      0,
      maxAvatars - 1,
    );

    const firstNAvatarsJSX = firstNCollaborators.map((collaborator) =>
      renderCollaborator({
        collaborator,
        socketId: collaborator.socketId,
        shouldWrapWithTooltip: true,
        isBeingFollowed: collaborator.socketId === userToFollow,
      }),
    );

    return mobile ? (
      <div className={clsx("UserList UserList_mobile", className)}>
        {uniqueCollaboratorsArray.map((collaborator) =>
          renderCollaborator({
            collaborator,
            socketId: collaborator.socketId,
            shouldWrapWithTooltip: true,
            isBeingFollowed: collaborator.socketId === userToFollow,
          }),
        )}
      </div>
    ) : (
      <div className="UserList__wrapper" ref={userListWrapper}>
        <div
          className={clsx("UserList", className)}
          style={{ [`--max-avatars` as any]: maxAvatars }}
        >
          {firstNAvatarsJSX}

          {uniqueCollaboratorsArray.length > maxAvatars - 1 && (
            <Popover.Root>
              <Popover.Trigger className="UserList__more">
                +{uniqueCollaboratorsArray.length - maxAvatars + 1}
              </Popover.Trigger>
              <Popover.Content
                style={{
                  zIndex: 2,
                  width: "15rem",
                  textAlign: "left",
                }}
                align="end"
                sideOffset={10}
              >
                <Island padding={2}>
                  {uniqueCollaboratorsArray.length >=
                    SHOW_COLLABORATORS_FILTER_AT && (
                    <QuickSearch
                      placeholder={t("quickSearch.placeholder")}
                      onChange={setSearchTerm}
                    />
                  )}
                  <ScrollableList
                    className={"dropdown-menu UserList__collaborators"}
                    placeholder={t("userList.empty")}
                  >
                    {filteredCollaborators.length > 0
                      ? [
                          <div className="hint" key="hint">
                            {t("userList.hint.text")}
                          </div>,
                          ...filteredCollaborators.map((collaborator) =>
                            renderCollaborator({
                              collaborator,
                              socketId: collaborator.socketId,
                              withName: true,
                              isBeingFollowed:
                                collaborator.socketId === userToFollow,
                            }),
                          ),
                        ]
                      : []}
                  </ScrollableList>
                  <Popover.Arrow
                    width={20}
                    height={10}
                    style={{
                      fill: "var(--popup-bg-color)",
                      filter: "drop-shadow(rgba(0, 0, 0, 0.05) 0px 3px 2px)",
                    }}
                  />
                </Island>
              </Popover.Content>
            </Popover.Root>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => {
    if (
      prev.collaborators.size !== next.collaborators.size ||
      prev.mobile !== next.mobile ||
      prev.className !== next.className ||
      prev.userToFollow !== next.userToFollow
    ) {
      return false;
    }

    const nextCollaboratorSocketIds = next.collaborators.keys();

    for (const [socketId, collaborator] of prev.collaborators) {
      const nextCollaborator = next.collaborators.get(socketId);
      if (
        !nextCollaborator ||
        socketId !== nextCollaboratorSocketIds.next().value ||
        !isShallowEqual(
          collaborator,
          nextCollaborator,
          collaboratorComparatorKeys,
        )
      ) {
        return false;
      }
    }
    return true;
  },
);

WebxdcUserList.displayName = "WebxdcUserList";

export default WebxdcUserList;