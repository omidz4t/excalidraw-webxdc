.PHONY: help install run run-sim build-webxdc dev-webxdc start-webxdc \
        test test-update fix clean clean-install

.DEFAULT_GOAL := help

BUN ?= bun
BUN_RUN := $(BUN) run
APP_DIR := excalidraw-app
WEBXDC_VERSION ?= 1.0.4
WEBXDC_OUT := $(APP_DIR)/dist-xdc/excalidraw.xdc
MANIFEST := $(APP_DIR)/manifest.toml
VITE_DEV_PORT ?= 3000
WEBXDC_DEV_PORT ?= 7100
# webxdc-dev spawns peer instances on the next ports (7101, 7102, …)
SIM_INSTANCE_PORTS ?= 7101 7102 7103 7104

help:
	@echo "Excalidraw WebXDC (Bun)"
	@echo ""
	@echo "  make install        Install dependencies (bun install)"
	@echo "  make run            Single-user dev — open http://localhost:$(VITE_DEV_PORT)/webxdc/"
	@echo "  make run-sim        Multi-peer dev — open http://localhost:$(WEBXDC_DEV_PORT)"
	@echo "                      (two chat instances side-by-side; live sync via WebSocket realtime)"
	@echo "                      Do NOT use make run for multi-peer testing — it uses BroadcastChannel"
	@echo "  make build-webxdc   Build multiplayer WebXDC package ($(WEBXDC_OUT))"
	@echo "                      Version: $(WEBXDC_VERSION) — override with WEBXDC_VERSION=x.y.z"
	@echo "  make test           Run tests"
	@echo "  make test-update    Run tests and update snapshots"
	@echo "  make fix            Auto-fix formatting and linting"
	@echo "  make clean          Remove WebXDC build artifacts"
	@echo "  make clean-install  Remove node_modules and reinstall"
	@echo ""
	@echo "  make dev-webxdc     Alias for make run-sim"
	@echo "  make start-webxdc   Alias for make run-sim"

install:
	$(BUN) install

run:
	@-fuser -k $(VITE_DEV_PORT)/tcp 2>/dev/null || true
	@sleep 1
	@echo "Open http://localhost:$(VITE_DEV_PORT)/webxdc/"
	VITE_DEV_PORT=$(VITE_DEV_PORT) $(BUN_RUN) --cwd ./$(APP_DIR) dev:webxdc:vite

run-sim: dev-webxdc

build-webxdc: install
	@sed -i 's/^version = .*/version = "$(WEBXDC_VERSION)"/' $(MANIFEST)
	WEBXDC_VERSION=$(WEBXDC_VERSION) $(BUN_RUN) --cwd ./$(APP_DIR) build:webxdc
	@echo "WebXDC v$(WEBXDC_VERSION): $(WEBXDC_OUT)"

dev-webxdc:
	@-fuser -k $(VITE_DEV_PORT)/tcp $(WEBXDC_DEV_PORT)/tcp $(SIM_INSTANCE_PORTS) 2>/dev/null || true
	@sleep 1
	@echo ""
	@echo "  Multi-peer simulator: http://localhost:$(WEBXDC_DEV_PORT)"
	@echo "  Two peers open side-by-side — draw in one panel, changes appear in the other."
	@echo "  SENT/RECEIVED counters in each panel should increase when you draw."
	@echo ""
	VITE_DEV_PORT=$(VITE_DEV_PORT) WEBXDC_DEV_PORT=$(WEBXDC_DEV_PORT) $(BUN_RUN) dev:webxdc

start-webxdc: run-sim

test:
	$(BUN_RUN) test:all

test-update:
	$(BUN_RUN) test:update

fix:
	$(BUN_RUN) fix

clean:
	rm -rf $(APP_DIR)/build-webxdc $(APP_DIR)/dist-xdc

clean-install:
	$(BUN_RUN) clean-install