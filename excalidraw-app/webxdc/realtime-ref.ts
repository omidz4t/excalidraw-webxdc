import type { WebxdcRealtimeChannel } from "./webxdc-realtime-channel";

export const webxdcRealtimeRef: { current: WebxdcRealtimeChannel | null } = {
  current: null,
};