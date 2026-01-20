# CNN Educational Course - Makefile
# Initialize and run the React application

.PHONY: init dev build clean install help preview run-hub run-overview run-level4 run-level5 reset lint

# Default target
.DEFAULT_GOAL := help

# Project name
PROJECT_NAME := cnn-course

# Node modules directory
NODE_MODULES := node_modules

# Colors for terminal output
GREEN := \033[0;32m
YELLOW := \033[0;33m
CYAN := \033[0;36m
NC := \033[0m # No Color

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)CNN Educational Course$(NC)"
	@echo "$(YELLOW)=====================$(NC)"
	@echo ""
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

init: ## Initialize the project (creates package.json, installs deps)
	@echo "$(CYAN)Initializing CNN Course project...$(NC)"
	@if [ ! -f package.json ]; then \
		echo "$(YELLOW)Creating package.json...$(NC)"; \
		npm init -y; \
		npm pkg set name="$(PROJECT_NAME)"; \
		npm pkg set type="module"; \
		npm pkg set version="1.0.0"; \
		npm pkg set description="Interactive CNN Educational Course"; \
		npm pkg set scripts.dev="vite"; \
		npm pkg set scripts.build="vite build"; \
		npm pkg set scripts.preview="vite preview"; \
	fi
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install react react-dom lucide-react
	npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/postcss postcss autoprefixer
	@echo "$(GREEN)✓ Project initialized successfully!$(NC)"
	@echo ""
	@echo "Run '$(CYAN)make dev$(NC)' to start the development server."

install: ## Install dependencies only
	@echo "$(CYAN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed!$(NC)"

dev: ## Start development server
	@if [ ! -d "$(NODE_MODULES)" ]; then \
		echo "$(YELLOW)Node modules not found. Running init first...$(NC)"; \
		$(MAKE) init; \
	fi
	@echo "$(CYAN)Starting development server...$(NC)"
	npm run dev

build: ## Build for production
	@if [ ! -d "$(NODE_MODULES)" ]; then \
		echo "$(YELLOW)Node modules not found. Running init first...$(NC)"; \
		$(MAKE) init; \
	fi
	@echo "$(CYAN)Building for production...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build complete! Output in ./dist$(NC)"

preview: ## Preview production build
	@echo "$(CYAN)Starting preview server...$(NC)"
	npm run preview

clean: ## Remove node_modules and build artifacts
	@echo "$(CYAN)Cleaning project...$(NC)"
	rm -rf node_modules dist .cache .vite
	@echo "$(GREEN)✓ Cleaned!$(NC)"

reset: ## Full reset - clean and reinitialize
	@echo "$(CYAN)Resetting project...$(NC)"
	rm -rf node_modules dist .cache .vite package-lock.json
	$(MAKE) init

# Module targets for running specific visualizations
run-hub: ## Run the Course Hub (default)
	@echo 'import React from "react";' > main.jsx
	@echo 'import { createRoot } from "react-dom/client";' >> main.jsx
	@echo 'import "./index.css";' >> main.jsx
	@echo 'import CNNCourseHub from "./cnn-course-hub";' >> main.jsx
	@echo '' >> main.jsx
	@echo 'createRoot(document.getElementById("root")).render(' >> main.jsx
	@echo '  <React.StrictMode>' >> main.jsx
	@echo '    <CNNCourseHub />' >> main.jsx
	@echo '  </React.StrictMode>' >> main.jsx
	@echo ');' >> main.jsx
	@$(MAKE) dev

run-overview: ## Run the CNN Overview module
	@echo 'import React from "react";' > main.jsx
	@echo 'import { createRoot } from "react-dom/client";' >> main.jsx
	@echo 'import "./index.css";' >> main.jsx
	@echo 'import CNNFlowViz from "./cnn-overview";' >> main.jsx
	@echo '' >> main.jsx
	@echo 'createRoot(document.getElementById("root")).render(' >> main.jsx
	@echo '  <React.StrictMode>' >> main.jsx
	@echo '    <CNNFlowViz />' >> main.jsx
	@echo '  </React.StrictMode>' >> main.jsx
	@echo ');' >> main.jsx
	@$(MAKE) dev

run-level4: ## Run Level 4: Convolution Deep Dive
	@echo 'import React from "react";' > main.jsx
	@echo 'import { createRoot } from "react-dom/client";' >> main.jsx
	@echo 'import "./index.css";' >> main.jsx
	@echo 'import ConvolutionDeepDive from "./level-4-convolution";' >> main.jsx
	@echo '' >> main.jsx
	@echo 'createRoot(document.getElementById("root")).render(' >> main.jsx
	@echo '  <React.StrictMode>' >> main.jsx
	@echo '    <ConvolutionDeepDive />' >> main.jsx
	@echo '  </React.StrictMode>' >> main.jsx
	@echo ');' >> main.jsx
	@$(MAKE) dev

run-level5: ## Run Level 5: Kernel Gallery
	@echo 'import React from "react";' > main.jsx
	@echo 'import { createRoot } from "react-dom/client";' >> main.jsx
	@echo 'import "./index.css";' >> main.jsx
	@echo 'import KernelGallery from "./level-5-kernel-gallery";' >> main.jsx
	@echo '' >> main.jsx
	@echo 'createRoot(document.getElementById("root")).render(' >> main.jsx
	@echo '  <React.StrictMode>' >> main.jsx
	@echo '    <KernelGallery />' >> main.jsx
	@echo '  </React.StrictMode>' >> main.jsx
	@echo ');' >> main.jsx
	@$(MAKE) dev
