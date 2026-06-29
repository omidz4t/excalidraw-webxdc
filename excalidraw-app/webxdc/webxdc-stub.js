// Minimal shim for standalone browser testing ONLY (realFinger pattern).
// In Delta Chat / webxdc-dev, window.webxdc is injected by the host first.
if (!window.webxdc) {
  window.webxdc = (() => {
    let updateListener = (_u) => {};
    let serial = 0;
    const updates = [];

    const selfAddr = "dev-" + Math.random().toString(36).slice(2, 8);
    const selfName = "Local Tester";

    class RealtimeChannel {
      constructor() {
        this._listener = null;
      }
      setListener(cb) {
        this._listener = cb;
      }
      send(_data) {}
      leave() {
        this._listener = null;
      }
    }

    return {
      selfAddr,
      selfName,
      sendUpdateInterval: 1000,
      sendUpdateMaxSize: 128000,
      setUpdateListener(cb, startingSerial) {
        updateListener = cb;
        const start = startingSerial || 0;
        for (const u of updates) {
          if (u.serial > start) {
            cb(u);
          }
        }
        return Promise.resolve();
      },
      sendUpdate(update, _descr) {
        serial++;
        const u = { ...update, serial, max_serial: serial };
        updates.push(u);
        try {
          updateListener(u);
        } catch (_) {}
      },
      joinRealtimeChannel() {
        return new RealtimeChannel();
      },
      getAllUpdates() {
        return Promise.resolve(updates);
      },
    };
  })();
}