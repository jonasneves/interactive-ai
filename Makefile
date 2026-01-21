.PHONY: help install dev build clean

help:
	@echo "make install   Install dependencies"
	@echo "make dev       Start all dev servers"
	@echo "make build     Build all projects"
	@echo "make clean     Remove build artifacts"

install:
	@cd neural-networks && npm install
	@cd convolutional-networks && npm install
	@cd reinforcement-learning && npm install

dev:
	@npx concurrently \
		"cd neural-networks && npm run dev" \
		"cd convolutional-networks && npm run dev" \
		"cd reinforcement-learning && npm run dev"

build:
	@cd neural-networks && npm run build
	@cd convolutional-networks && npm run build
	@cd reinforcement-learning && npm run build

clean:
	@rm -rf neural-networks/dist neural-networks/node_modules/.vite
	@rm -rf convolutional-networks/dist convolutional-networks/node_modules/.vite
	@rm -rf reinforcement-learning/dist reinforcement-learning/node_modules/.vite
