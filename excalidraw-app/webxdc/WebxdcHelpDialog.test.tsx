import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Provider, appJotaiStore } from "../app-jotai";
import WebxdcHelpDialog from "./WebxdcHelpDialog";
import {
  openWebxdcHelp,
  toggleWebxdcHelp,
  webxdcHelpOpenAtom,
} from "./webxdc-help-state";

describe("WebxdcHelpDialog", () => {
  it("shows the dialog when help is toggled open", () => {
    appJotaiStore.set(webxdcHelpOpenAtom, false);

    render(
      <Provider store={appJotaiStore}>
        <WebxdcHelpDialog />
      </Provider>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => {
      toggleWebxdcHelp();
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Excalidraw in Delta Chat")).toBeInTheDocument();
  });

  it("stays open when openWebxdcHelp is called twice (webxdc WebView-safe)", () => {
    appJotaiStore.set(webxdcHelpOpenAtom, false);

    render(
      <Provider store={appJotaiStore}>
        <WebxdcHelpDialog />
      </Provider>,
    );

    act(() => {
      openWebxdcHelp();
      openWebxdcHelp();
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows slide body text on the last slide", () => {
    appJotaiStore.set(webxdcHelpOpenAtom, false);

    render(
      <Provider store={appJotaiStore}>
        <WebxdcHelpDialog />
      </Provider>,
    );

    act(() => {
      openWebxdcHelp();
    });

    for (let i = 0; i < 4; i++) {
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
      });
    }

    expect(screen.getByRole("heading", { name: "Menu exports" })).toBeInTheDocument();
    expect(screen.getByText(/Share as WebXDC/)).toBeInTheDocument();
  });

  it("closes again when toggled twice (double-toggle leaves dialog hidden)", () => {
    appJotaiStore.set(webxdcHelpOpenAtom, false);

    render(
      <Provider store={appJotaiStore}>
        <WebxdcHelpDialog />
      </Provider>,
    );

    act(() => {
      toggleWebxdcHelp();
      toggleWebxdcHelp();
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});