.PHONY: help install dev dev-nn dev-cnn dev-rl build clean

help:
	@echo "make install   Install all dependencies"
	@echo "make dev       Start landing dev server"
	@echo "make dev-nn    Start neural-networks dev server"
	@echo "make dev-cnn   Start convolutional-networks dev server"
	@echo "make dev-rl    Start reinforcement-learning dev server"
	@echo "make build     Build all projects"
	@echo "make clean     Remove build artifacts"

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
