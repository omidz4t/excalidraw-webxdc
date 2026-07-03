const EMBED_STUB = `/** Offline fork: embed/iframe URL parsing disabled. */

export const createSrcDoc = (body: string) =>
  \`<html><body>\${body}</body></html>\`;

export const getEmbedLink = () => null;

export const createPlaceholderEmbeddableLabel = () => "";

export const maybeParseEmbedSrc = (str: string) => str;

export const embeddableURLValidator = () => false;
`;

/** Build-time transforms applied to all builds (offline / WebXDC). */

export function applyOfflineTransforms(
  code: string,
  id: string,
): { code: string } | null {
  if (id.endsWith("/element/src/embeddable.ts")) {
    return { code: EMBED_STUB };
  }

  if (id.endsWith("/components/LayerUI.tsx")) {
    return {
      code: code
        .replace(/import \{ HelpDialog \} from "\.\/HelpDialog";\n/, "")
        .replace(/\s*<MainMenu\.DefaultItems\.Help \/>\n/, "")
        .replace(
          /\s*\{appState\.openDialog\?\.name === "help" && \([\s\S]*?\)\}\n/,
          "",
        )
        .replace(
          /import \{ UserList \} from "\.\/UserList";/,
          'import WebxdcUserList from "../../../excalidraw-app/webxdc/WebxdcUserList";',
        )
        .replace(/<UserList/g, "<WebxdcUserList"),
    };
  }

  if (id.endsWith("/components/main-menu/MainMenu.tsx")) {
    return {
      code: code
        .replace(
          /import \{ UserList \} from "\.\.\/UserList";/,
          'import WebxdcUserList from "../../../../excalidraw-app/webxdc/WebxdcUserList";',
        )
        .replace(/<UserList/g, "<WebxdcUserList"),
    };
  }

  if (id.endsWith("/components/main-menu/DefaultItems.tsx")) {
    return {
      code: code.replace(
        /export const Help = \(\) => \{[\s\S]*?\};\nHelp\.displayName = "Help";/,
        'export const Help = () => null;\nHelp.displayName = "Help";',
      ),
    };
  }

  if (id.endsWith("/components/Actions.tsx")) {
    return {
      code: code.replace(
        /\s*<DropdownMenu\.Item\s+onSelect=\{\(\) => app\.setActiveTool\(\{ type: "embeddable" \}\)\}[\s\S]*?\{t\("toolBar\.embeddable"\)\}\s*<\/DropdownMenu\.Item>\n/,
        "",
      ),
    };
  }

  if (id.endsWith("/components/MobileToolBar.tsx")) {
    return {
      code: code.replace(
        /\s*<DropdownMenu\.Item\s+onSelect=\{\(\) => app\.setActiveTool\(\{ type: "embeddable" \}\)\}[\s\S]*?\{t\("toolBar\.embeddable"\)\}\s*<\/DropdownMenu\.Item>\n/,
        "",
      ),
    };
  }

  if (id.endsWith("/components/App.tsx")) {
    let next = code
      .replace(
        /  private onWindowMessage\(event: MessageEvent\) \{[\s\S]*?(?=\n  private handleSkipBindMode)/,
        "  private onWindowMessage(_event: MessageEvent) {\n    return;\n  }\n\n",
      )
      .replace(
        /  private handleIframeLikeElementHover = \(\{[\s\S]*?(?=\n  \/\*\* @returns true if iframe-like element click handled \*\/)/,
        "  private handleIframeLikeElementHover = (): boolean => false;\n\n",
      )
      .replace(
        /  private handleIframeLikeCenterClick\(\): boolean \{[\s\S]*?(?=\n  private isDoubleClick)/,
        "  private handleIframeLikeCenterClick(): boolean {\n    return false;\n  }\n\n",
      )
      .replace(
        /  private updateEmbeddables = \(\) => \{[\s\S]*?(?=\n  private renderEmbeddables)/,
        "  private updateEmbeddables = () => {};\n\n",
      )
      .replace(
        /  private renderEmbeddables\(\) \{[\s\S]*?(?=\n  private getFrameNameDOMId)/,
        "  private renderEmbeddables() {\n    return null;\n  }\n\n",
      )
      .replace(
        /  public insertIframeElement = \(\{[\s\S]*?(?=\n  \/\/create rectangle element)/,
        "  public insertIframeElement = () => {\n    return;\n  };\n\n",
      )
      .replace(
        /  public insertEmbeddableElement = \(\{[\s\S]*?(?=\n  public insertStickyNote)/,
        "  public insertEmbeddableElement = () => {\n    return;\n  };\n\n",
      )
      .replace(
        /\/\/ ------------------- Pure embeddable URLs -------------------[\s\S]*?return;\n    \}\n\n    \/\/ ------------------- Text -------------------/,
        "// offline: embeddable URL paste disabled\n\n    // ------------------- Text -------------------",
      )
      .replace(
        /if \(\s*text &&\s*embeddableURLValidator\(text, this\.props\.validateEmbeddable\) &&[\s\S]*?this\.setState\(\{ selectedElementIds: \{ \[embeddable\.id\]: true \} \}\);\n        \}\n      \}/,
        "if (false) { /* offline: embed drop disabled */ }",
      )
      .replace(
        /if \(elementType === "embeddable"\) \{/,
        'if (false && elementType === "embeddable") {',
      );

    return { code: next };
  }

  if (id.endsWith("/components/ContextMenu.tsx")) {
    return {
      code: code
        .replace(
          'import "./ContextMenu.scss";',
          'import "./ContextMenu.scss";\nimport WebxdcContextMenuBackground from "../../../excalidraw-app/webxdc/WebxdcContextMenuBackground";',
        )
        .replace(
          /const filteredItems = items\.reduce/,
          `const isCanvasContextMenu = !items.some(
      (item) =>
        item && item !== CONTEXT_MENU_SEPARATOR && item.name === "cut",
    );

    const filteredItems = items.reduce`,
        )
        .replace(
          /<\/ul>\s*<\/Popover>/,
          `</ul>
        {isCanvasContextMenu && <WebxdcContextMenuBackground />}
      </Popover>`,
        ),
    };
  }

  if (id.endsWith("/components/BraveMeasureTextError.tsx")) {
    return {
      code: code.replace(
        /export const BraveMeasureTextError[\s\S]*$/,
        "export const BraveMeasureTextError = () => null;\n",
      ),
    };
  }

  if (id.endsWith("/actions/actionMenu.tsx")) {
    return {
      code: code.replace(
        /export const actionShortcuts = register\(\{[\s\S]*?\}\);/,
        `export const actionShortcuts = register({
  name: "toggleShortcuts",
  label: "welcomeScreen.defaults.helpHint",
  icon: HelpIconThin,
  viewMode: true,
  trackEvent: { category: "menu", action: "toggleHelpDialog" },
  perform: (_elements, appState, _, { focusContainer }) => {
    if (appState.openDialog?.name === "help") {
      focusContainer();
    }
    return {
      appState: {
        ...appState,
        openDialog:
          appState.openDialog?.name === "help"
            ? null
            : { name: "help" },
        openMenu: null,
        openPopup: null,
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  keyTest: () => false,
});`,
      ),
    };
  }

  return null;
}