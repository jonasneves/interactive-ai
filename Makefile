.DEFAULT_GOAL := help

.PHONY: help install dev dev-nn dev-cnn dev-rl build clean

help:
	@echo ""
	@echo "\033[2mSetup\033[0m"
	@echo "  \033[36minstall\033[0m    Install all dependencies"
	@echo ""
	@echo "\033[2mDev\033[0m"
	@echo "  \033[36mdev\033[0m        Start all dev servers"
	@echo "  \033[36mdev-nn\033[0m     Start neural-networks dev server"
	@echo "  \033[36mdev-cnn\033[0m    Start convolutional-networks dev server"
	@echo "  \033[36mdev-rl\033[0m     Start reinforcement-learning dev server"
	@echo ""
	@echo "\033[2mBuild\033[0m"
	@echo "  \033[36mbuild\033[0m      Build all projects"
	@echo "  \033[36mclean\033[0m      Remove build artifacts"
	@echo ""

install:
	npm install

dev:
	@echo "Starting all dev servers..."
	@echo "Landing:                http://localhost:3000"
	@echo "Neural Networks:        http://localhost:3003"
	@echo "Reinforcement Learning: http://localhost:3001"
	@echo "Convolutional Networks: http://localhost:3002"
	@echo ""
	npm run dev:landing & npm run dev:nn & npm run dev:rl & npm run dev:cnn & wait

dev-nn:
	npm run dev:nn

dev-cnn:
	npm run dev:cnn

dev-rl:
	npm run dev:rl

build:
	npm run build

clean:
	rm -rf node_modules
	rm -rf landing/dist landing/node_modules
	rm -rf neural-networks/dist neural-networks/node_modules
	rm -rf convolutional-networks/dist convolutional-networks/node_modules
	rm -rf reinforcement-learning/dist reinforcement-learning/node_modules
