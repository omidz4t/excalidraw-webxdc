import { CaptureUpdateAction } from "@excalidraw/element";
import { getClientColor } from "@excalidraw/excalidraw/clients";
import { useExcalidrawAPI } from "@excalidraw/excalidraw/index";
import { useCallback, useEffect, useState } from "react";

import type { UserToFollow } from "@excalidraw/excalidraw/types";

import {
  clearFollowSyncViewport,
  shouldUnfollowOnScroll,
  snapshotFromAppState,
} from "./follow-viewport-sync-ref";

import "./WebxdcFollowBorder.scss";

const resolveFollowColors = (
  api: NonNullable<ReturnType<typeof useExcalidrawAPI>>,
  userToFollow: UserToFollow,
) => {
  const collaborator = api
    .getAppState()
    .collaborators.get(userToFollow.socketId);
  const stroke =
    collaborator?.color?.stroke ??
    getClientColor(userToFollow.socketId, collaborator);

  return {
    stroke,
    background: collaborator?.color?.background ?? `${stroke}33`,
  };
};

const WebxdcFollowBorder = () => {
  const api = useExcalidrawAPI();
  const [userToFollow, setUserToFollow] = useState<UserToFollow | null>(null);
  const [borderColor, setBorderColor] = useState<string>("");
  const [badgeBackground, setBadgeBackground] = useState<string>("");

  const refreshColors = useCallback(() => {
    if (!api || !userToFollow) {
      return;
    }

    const { stroke, background } = resolveFollowColors(api, userToFollow);
    setBorderColor(stroke);
    setBadgeBackground(background);
  }, [api, userToFollow]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const syncFollowState = (next: UserToFollow | null) => {
      setUserToFollow(next);
      if (!next) {
        clearFollowSyncViewport();
      }
    };

    syncFollowState(api.getAppState().userToFollow);
    return api.onStateChange("userToFollow", syncFollowState);
  }, [api]);

  useEffect(() => {
    if (!api || !userToFollow) {
      return;
    }

    refreshColors();
    return api.onChange(refreshColors);
  }, [api, userToFollow, refreshColors]);

  useEffect(() => {
    if (!api) {
      return;
    }

    return api.onScrollChange(() => {
      if (!api.getAppState().userToFollow) {
        return;
      }

      if (!shouldUnfollowOnScroll(snapshotFromAppState(api.getAppState()))) {
        return;
      }

      clearFollowSyncViewport();
      api.updateScene({
        appState: { userToFollow: null },
        captureUpdate: CaptureUpdateAction.EVENTUALLY,
      });
    });
  }, [api]);

  if (!userToFollow) {
    return null;
  }

  const stopFollowing = () => {
    api?.updateScene({
      appState: { userToFollow: null },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    });
  };

  return (
    <div
      className="webxdc-follow-border"
      style={{ borderColor }}
      aria-live="polite"
    >
      <div
        className="webxdc-follow-border__badge"
        style={{ backgroundColor: badgeBackground }}
      >
        <div className="webxdc-follow-border__badge__label">
          Following{" "}
          <span
            className="webxdc-follow-border__badge__username"
            title={userToFollow.username}
          >
            {userToFollow.username}
          </span>
        </div>
        <button
          type="button"
          onClick={stopFollowing}
          className="webxdc-follow-border__disconnect-btn"
          aria-label="Stop following"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default WebxdcFollowBorder;