const noop = () => ({});
const noopAsync = async () => ({});

export const initializeApp = noop;
export const getApps = () => [];
export const getApp = noop;
export const getFirestore = noop;
export const getStorage = noop;
export const doc = noop;
export const getDoc = noopAsync;
export const runTransaction = noopAsync;
export const Bytes = class {};
export const ref = noop;
export const uploadBytes = noopAsync;
export default {};