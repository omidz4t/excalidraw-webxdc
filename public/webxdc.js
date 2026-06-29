// Minimal shim for standalone browser testing ONLY.
// In Delta Chat (or webxdc-dev), window.webxdc is injected by the host — this file is not in the .xdc zip.
if (!window.webxdc) {
  window.webxdc = (() => {
    let updateListener = () => {};
    let serial = 0;
    const updates = [];

    const selfAddr = `dev-${Math.random().toString(36).slice(2, 8)}@example.org`;
    const selfName = "Local Tester";
    const chatDrafts = [];
    const realtimeShim = {
      channel: null,
      currentListener: null,
    };
    const updatesShim = {
      channel: null,
      listener: null,
    };

    class RealtimeChannelShim {
      constructor(listenerBridge) {
        this.listenerBridge = listenerBridge;
        this.listener = null;
        this.closed = false;
      }

      setListener(cb) {
        this.listener = cb;
      }

      send(data) {
        if (this.closed) return;
        if (!(data instanceof Uint8Array)) {
          throw new Error("realtimeChannel.send() expects Uint8Array");
        }
        if (data.byteLength > 128000) {
          throw new Error(
            "realtimeChannel.send() payload exceeds 128000 bytes",
          );
        }
        this.listenerBridge.broadcast(Array.from(data));
      }

      leave() {
        if (this.closed) return;
        this.closed = true;
        this.listenerBridge.detach();
      }
    }

    function getRealtimeBridge() {
      if (realtimeShim.channel) return realtimeShim.channel;
      if (typeof BroadcastChannel !== "undefined") {
        realtimeShim.channel = new BroadcastChannel("webxdc-realtime-shim");
      }
      return realtimeShim.channel;
    }

    function getUpdatesBridge() {
      if (updatesShim.channel) return updatesShim.channel;
      if (typeof BroadcastChannel !== "undefined") {
        updatesShim.channel = new BroadcastChannel("webxdc-updates-shim");
        updatesShim.channel.addEventListener("message", (event) => {
          const update = event.data;
          if (!update || update.from === selfAddr) {
            return;
          }
          serial = Math.max(serial, update.serial || 0);
          updates.push(update);
          try {
            updateListener(update);
          } catch {
            // Ignore listener errors in the shim.
          }
        });
      }
      return updatesShim.channel;
    }

    return {
      selfAddr,
      selfName,
      sendUpdateInterval: 250,
      sendUpdateMaxSize: 128000,
      sendUpdate(payload, description) {
        serial += 1;
        const update = {
          ...(payload || {}),
          info: payload?.info ?? description ?? "",
          serial,
          max_serial: serial,
        };
        updates.push(update);
        try {
          updateListener(update);
        } catch {
          // Ignore listener errors in the shim.
        }
        const updatesChannel = getUpdatesBridge();
        if (updatesChannel) {
          updatesChannel.postMessage({ ...update, from: selfAddr });
        }
      },
      sendToChat(message) {
        chatDrafts.push({
          text: message?.text ?? "",
          fileName: message?.file?.name ?? null,
          createdAt: Date.now(),
        });
        console.log("webxdc.sendToChat(shim)", message);
        return Promise.resolve();
      },
      importFiles(filter) {
        const extensions = filter?.extensions || [];
        const mimeTypes = filter?.mimeTypes || [];
        const accept = [...extensions, ...mimeTypes].join(",");
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = !!filter?.multiple;
          if (accept) input.accept = accept;
          input.onchange = () => resolve(Array.from(input.files || []));
          input.click();
        });
      },
      setUpdateListener(cb, minSerial) {
        updateListener = cb;
        const fromSerial = Number(minSerial || 0);
        for (const update of updates) {
          if (update.serial >= fromSerial) cb(update);
        }
      },
      getAllUpdates() {
        return Promise.resolve([...updates]);
      },
      getAppInfo() {
        return Promise.resolve({
          name: "Excalidraw",
          version: "1.0.0",
        });
      },
      joinRealtimeChannel() {
        if (realtimeShim.currentListener) {
          throw new Error(
            "joinRealtimeChannel() already active, call leave() first",
          );
        }
        const channel = getRealtimeBridge();
        const instanceId = `${selfAddr}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const bridge = {
          broadcast(payloadArray) {
            if (!channel) return;
            channel.postMessage({
              from: instanceId,
              payload: payloadArray,
            });
          },
          detach() {
            if (channel && realtimeShim.currentListener) {
              channel.removeEventListener(
                "message",
                realtimeShim.currentListener,
              );
            }
            realtimeShim.currentListener = null;
          },
        };
        const realtime = new RealtimeChannelShim(bridge);
        if (channel) {
          realtimeShim.currentListener = (event) => {
            const message = event.data;
            if (
              !message ||
              message.from === instanceId ||
              !Array.isArray(message.payload)
            ) {
              return;
            }
            if (typeof realtime.listener === "function") {
              realtime.listener(new Uint8Array(message.payload));
            }
          };
          channel.addEventListener("message", realtimeShim.currentListener);
        }
        return realtime;
      },
      __getChatDrafts() {
        return Promise.resolve([...chatDrafts]);
      },
    };
  })();
}