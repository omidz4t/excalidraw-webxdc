import type { Collaborator } from "@excalidraw/excalidraw/types";

export type CursorUser = {
  name?: string;
  color?: string;
  colorLight?: string;
  avatarUrl?: string;
};

export type CursorState = {
  pointer?: { x: number; y: number; tool: "pointer" | "laser" };
  button?: "down" | "up";
  selectedElementIds?: Record<string, boolean>;
  user?: CursorUser;
};

export const cursorStateToCollaborator = (
  state: CursorState,
  peerAddr: string,
): Collaborator => ({
  pointer: state.pointer,
  button: state.button,
  selectedElementIds: state.selectedElementIds as Collaborator["selectedElementIds"],
  username: state.user?.name,
  id: peerAddr,
  color: state.user?.color
    ? {
        background: state.user.colorLight ?? state.user.color,
        stroke: state.user.color,
      }
    : undefined,
  avatarUrl: state.user?.avatarUrl,
});