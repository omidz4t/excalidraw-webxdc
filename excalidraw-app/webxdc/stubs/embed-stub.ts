/** Offline fork: embed/iframe URL parsing disabled. */

export const createSrcDoc = (body: string) =>
  `<html><body>${body}</body></html>`;

export const getEmbedLink = () => null;

export const createPlaceholderEmbeddableLabel = () => "";

export const maybeParseEmbedSrc = (str: string) => str;

export const embeddableURLValidator = () => false;