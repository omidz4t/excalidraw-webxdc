const NullComponent = () => null;

export const DEFAULT_CATEGORIES = {
  app: "App",
  export: "Export",
  tools: "Tools",
  editor: "Editor",
  elements: "Elements",
  links: "Links",
  library: "Library",
};

export const CommandPalette = Object.assign(NullComponent, {
  DEFAULT_CATEGORIES,
});

export default CommandPalette;