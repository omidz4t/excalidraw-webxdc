export const USER_COLORS = [
  { color: "#30bced", light: "#30bced33" },
  { color: "#6eeb83", light: "#6eeb8333" },
  { color: "#ffbc42", light: "#ffbc4233" },
  { color: "#ecd444", light: "#ecd44433" },
  { color: "#ee6352", light: "#ee635233" },
  { color: "#9ac2c9", light: "#9ac2c933" },
  { color: "#8acb88", light: "#8acb8833" },
  { color: "#1be7ff", light: "#1be7ff33" },
] as const;

const hashAddr = (addr: string) => {
  let hash = 0;
  for (let i = 0; i < addr.length; i++) {
    hash = (hash << 5) - hash + addr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const pickUserColor = (addr: string) => {
  return USER_COLORS[hashAddr(addr) % USER_COLORS.length];
};

export const clientIdFromAddr = (addr: string) => {
  const hash = hashAddr(addr);
  return hash === 0 ? 1 : hash;
};