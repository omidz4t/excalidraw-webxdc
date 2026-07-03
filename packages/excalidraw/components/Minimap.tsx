import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";

import { THEME } from "@excalidraw/common";

import type {
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";

import { getClientColor } from "../clients";
import {
  getMinimapRenderData,
  getScrollForSceneCenter,
  MINIMAP_HEIGHT,
  MINIMAP_PADDING,
  MINIMAP_WIDTH,
  minimapToScene,
} from "../utils/minimap";

import "./Minimap.scss";

import type {
  AppClassProperties,
  AppState,
  Collaborator,
  SocketId,
  UIAppState,
} from "../types";

type MinimapProps = {
  app: AppClassProperties;
  appState: UIAppState;
  elements: readonly NonDeletedExcalidrawElement[];
  elementsMap: ElementsMap;
  setAppState: React.Component<any, AppState>["setState"];
  className?: string;
};

const COLLABORATOR_DOT_RADIUS = 3;

export const Minimap = ({
  app,
  appState,
  elements,
  elementsMap,
  setAppState,
  className,
}: MinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const currentAppState = app.api.getAppState();
    const dpr = window.devicePixelRatio || 1;
    const width = MINIMAP_WIDTH;
    const height = MINIMAP_HEIGHT;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const isDarkTheme = currentAppState.theme === THEME.DARK;
    context.fillStyle = isDarkTheme ? "#2e2e2e" : "#f8f9fa";
    context.fillRect(0, 0, width, height);

    const { elementRects, viewportRect, sceneBounds, transform } =
      getMinimapRenderData({
        elements,
        elementsMap,
        appState: currentAppState,
      });

    for (const elementRect of elementRects) {
      context.fillStyle = isDarkTheme
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)";
      context.strokeStyle = elementRect.strokeColor;
      context.globalAlpha = 0.85;
      context.fillRect(
        elementRect.x,
        elementRect.y,
        elementRect.width,
        elementRect.height,
      );
      context.globalAlpha = 0.35;
      context.strokeRect(
        elementRect.x,
        elementRect.y,
        elementRect.width,
        elementRect.height,
      );
      context.globalAlpha = 1;
    }

    context.strokeStyle = isDarkTheme ? "#6995f7" : "#1d63ed";
    context.lineWidth = 1.5;
    context.strokeRect(
      viewportRect.x,
      viewportRect.y,
      viewportRect.width,
      viewportRect.height,
    );
    context.fillStyle = isDarkTheme
      ? "rgba(105, 149, 247, 0.18)"
      : "rgba(29, 99, 237, 0.12)";
    context.fillRect(
      viewportRect.x,
      viewportRect.y,
      viewportRect.width,
      viewportRect.height,
    );

    currentAppState.collaborators.forEach(
      (collaborator: Collaborator, socketId: SocketId) => {
        if (collaborator.isCurrentUser || !collaborator.pointer) {
          return;
        }

        const dotX =
          transform.offsetX +
          (collaborator.pointer.x - sceneBounds.minX) * transform.scale;
        const dotY =
          transform.offsetY +
          (collaborator.pointer.y - sceneBounds.minY) * transform.scale;

        if (
          dotX < MINIMAP_PADDING - COLLABORATOR_DOT_RADIUS ||
          dotY < MINIMAP_PADDING - COLLABORATOR_DOT_RADIUS ||
          dotX > width - MINIMAP_PADDING + COLLABORATOR_DOT_RADIUS ||
          dotY > height - MINIMAP_PADDING + COLLABORATOR_DOT_RADIUS
        ) {
          return;
        }

        context.beginPath();
        context.fillStyle = getClientColor(socketId, collaborator);
        context.strokeStyle = isDarkTheme ? "#1e1e1e" : "#ffffff";
        context.lineWidth = 1;
        context.arc(dotX, dotY, COLLABORATOR_DOT_RADIUS, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      },
    );
  }, [app, elements, elementsMap]);

  useEffect(() => {
    draw();
  }, [
    draw,
    appState.collaborators,
    appState.zoom,
    appState.width,
    appState.height,
    appState.theme,
    elements,
  ]);

  useEffect(() => {
    return app.api.onScrollChange(() => {
      draw();
    });
  }, [app.api, draw]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const currentAppState = app.api.getAppState();
    const { sceneBounds, transform } = getMinimapRenderData({
      elements,
      elementsMap,
      appState: currentAppState,
    });
    const [sceneX, sceneY] = minimapToScene(x, y, sceneBounds, transform);

    setAppState(getScrollForSceneCenter(sceneX, sceneY, currentAppState));
  };

  return (
    <div
      className={clsx("minimap", className)}
      aria-label="Canvas minimap"
      role="img"
    >
      <canvas
        ref={canvasRef}
        className="minimap__canvas"
        onPointerDown={handlePointerDown}
      />
    </div>
  );
};