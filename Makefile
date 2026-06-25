# ============================================================
# jx_m_apk — 一键启动前后端开发服务
#
# 端口：
#   - 3007 : Next.js H5 前端
#   - 8009 : FastAPI 后端
#
# 优雅释放策略（free-port target）：
#   1. 用 lsof 精确找到绑定端口的 PID（不杀全进程）
#   2. 先 SIGTERM，给 8 秒优雅退出
#   3. 未退出则升级到 SIGKILL（最后保险）
#   4. 等待端口真正释放
#
# 用法：
#   make dev       一键启动（自动释放端口 + 后台运行两个服务 + 写日志）
#   make stop      停止两个服务（优雅释放端口）
#   make status    查看端口/进程状态
#   make logs      跟踪两个服务的日志
#   make restart   等价于 make stop && make dev
# ============================================================

ROOT_DIR     := $(shell pwd)
FRONTEND_DIR := $(ROOT_DIR)/frontend
BACKEND_DIR  := $(ROOT_DIR)/backend
LOG_DIR      := $(ROOT_DIR)/.dev-logs

FRONTEND_PORT := 3007
BACKEND_PORT  := 8009

FRONTEND_LOG := $(LOG_DIR)/frontend.log
BACKEND_LOG  := $(LOG_DIR)/backend.log

# 后端启动用全局 python（项目无独立 venv）
PYTHON := python3

.PHONY: help dev stop restart status logs clean

help: ## 显示帮助
	@echo "可用命令："
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ------------------------------------------------------------
# 端口释放：先 SIGTERM → 等待 → 再 SIGKILL
# 使用 fuser -n tcp <port> 精确只取监听方（不杀连接到该端口的客户端）
# ------------------------------------------------------------
.PHONY: free-port
free-port: ## 优雅释放端口（参数 PORT=xxxx）
	@PORT=$${PORT:-$(FRONTEND_PORT)}; \
	PIDS=$$(fuser -n tcp $$PORT 2>/dev/null | tr -d ' '); \
	if [ -z "$$PIDS" ]; then \
		echo "  [free-port] :$$PORT 空闲"; \
	else \
		echo "  [free-port] :$$PORT 被占用 (PID: $$PIDS)"; \
		for PID in $$PIDS; do \
			echo "  [free-port] -> SIGTERM $$PID"; \
			kill -TERM $$PID 2>/dev/null || true; \
		done; \
		# 等待最多 8 秒优雅退出 \
		for i in 1 2 3 4 5 6 7 8; do \
			if ! fuser -n tcp $$PORT >/dev/null 2>&1; then \
				echo "  [free-port] :$$PORT 已释放"; \
				break; \
			fi; \
			sleep 1; \
		done; \
		# 还在就升级到 SIGKILL（最后保险） \
		if fuser -n tcp $$PORT >/dev/null 2>&1; then \
			echo "  [free-port] !! 优雅退出超时，升级 SIGKILL"; \
			for PID in $$(fuser -n tcp $$PORT 2>/dev/null | tr -d ' '); do \
				kill -KILL $$PID 2>/dev/null || true; \
			done; \
			sleep 1; \
		fi; \
		if fuser -n tcp $$PORT >/dev/null 2>&1; then \
			echo "  [free-port] !! 释放失败，请检查 :$$PORT"; \
			exit 1; \
		fi; \
	fi

# ------------------------------------------------------------
# 一键启动：先释放端口，再后台跑两个服务
# ------------------------------------------------------------
dev: free-frontend free-backend prepare-logs ## 释放端口并后台启动 frontend(3007) + backend(8009)
	@echo ""
	@echo "  [dev] 启动 backend (uvicorn :8009)..."
	@cd $(BACKEND_DIR) && \
		PYTHONPATH=$(BACKEND_DIR) \
		$(PYTHON) -m uvicorn main:app --host 0.0.0.0 --port $(BACKEND_PORT) \
		>> $(BACKEND_LOG) 2>&1 & \
		echo $$! > $(LOG_DIR)/backend.pid
	@echo "  [dev] 启动 frontend (next dev :3007)..."
	@cd $(FRONTEND_DIR) && \
		./node_modules/.bin/next dev -H 0.0.0.0 -p $(FRONTEND_PORT) \
		>> $(FRONTEND_LOG) 2>&1 & \
		echo $$! > $(LOG_DIR)/frontend.pid
	@echo ""
	@echo "  ✓ backend  PID=$$(cat $(LOG_DIR)/backend.pid 2>/dev/null)  http://localhost:$(BACKEND_PORT)"
	@echo "  ✓ frontend PID=$$(cat $(LOG_DIR)/frontend.pid 2>/dev/null)  http://localhost:$(FRONTEND_PORT)"
	@echo "  ✓ 日志:    $(LOG_DIR)/{backend,frontend}.log"
	@echo "  ✓ 跟踪:    make logs"
	@sleep 2
	@$(MAKE) --no-print-directory status

.PHONY: free-frontend free-backend prepare-logs
free-frontend:
	@echo "  [dev] 释放 frontend :$(FRONTEND_PORT)..."
	@PORT=$(FRONTEND_PORT) $(MAKE) --no-print-directory free-port

free-backend:
	@echo "  [dev] 释放 backend :$(BACKEND_PORT)..."
	@PORT=$(BACKEND_PORT) $(MAKE) --no-print-directory free-port

prepare-logs:
	@mkdir -p $(LOG_DIR)

# ------------------------------------------------------------
# 停止
# ------------------------------------------------------------
stop: free-frontend free-backend ## 优雅停止 frontend + backend
	@echo ""
	@echo "  ✓ 已停止"

# ------------------------------------------------------------
# 重启
# ------------------------------------------------------------
restart: stop ## 重启两个服务
	@$(MAKE) --no-print-directory dev

# ------------------------------------------------------------
# 状态
# ------------------------------------------------------------
status: ## 查看端口 + 进程状态
	@echo ""
	@echo "  端口监听："
	@for P in $(FRONTEND_PORT) $(BACKEND_PORT); do \
		PID=$$(fuser -n tcp $$P 2>/dev/null | tr -d ' '); \
		if [ -n "$$PID" ]; then \
			CMD=$$(ps -p $$PID -o cmd= --no-headers 2>/dev/null | head -c 60); \
			echo "    :$$P  ✓ PID=$$PID  $$CMD"; \
		else \
			echo "    :$$P  空闲"; \
		fi; \
	done
	@echo ""
	@echo "  内存中的 PID 文件："
	@for f in frontend.pid backend.pid; do \
		if [ -f $(LOG_DIR)/$$f ]; then \
			PID=$$(cat $(LOG_DIR)/$$f); \
			if kill -0 $$PID 2>/dev/null; then \
				echo "    $$f = $$PID ✓ 存活"; \
			else \
				echo "    $$f = $$PID ✗ 已退出"; \
			fi; \
		else \
			echo "    $$f 不存在"; \
		fi; \
	done
	@echo ""

# ------------------------------------------------------------
# 日志
# ------------------------------------------------------------
logs: ## 跟踪两个服务的日志（Ctrl+C 退出）
	@echo "  跟踪日志（Ctrl+C 退出）..."
	@tail -n 50 -F $(BACKEND_LOG) $(FRONTEND_LOG)

# ------------------------------------------------------------
# 清理
# ------------------------------------------------------------
clean: ## 清理日志和 PID 文件（不影响运行中的服务）
	@rm -rf $(LOG_DIR)
	@echo "  ✓ 已清理 $(LOG_DIR)"
