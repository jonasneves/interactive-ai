# CNN Educational Course

Interactive visualizations for learning Convolutional Neural Networks. Master CNNs through hands-on exploration—no prerequisites required.

![Course Preview](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan)

## Quick Start

```bash
make init    # Initialize project (first time only)
make dev     # Start development server
```

Then open [http://localhost:3000](http://localhost:3000)

## Available Modules

| Module | Command | Description |
|--------|---------|-------------|
| Course Hub | `make run-hub` | Main navigation and progress tracking |
| CNN Overview | `make run-overview` | End-to-end pipeline visualization |
| Level 4 | `make run-level4` | Convolution deep dive (1D & 2D) |
| Level 5 | `make run-level5` | Interactive kernel gallery |

## Course Structure

```
CNN Course
├── Overview (Level 0) ← The "map" showing full pipeline
│
├── Prerequisites (Levels 1-3)
│   ├── Pixels & Images
│   ├── Dot Products & Matrix Math
│   └── Basic Neural Network
│
├── Core Concepts (Levels 4-8)
│   ├── ✅ Convolution Deep Dive
│   ├── ✅ Kernel Gallery
│   ├── Building Feature Maps
│   ├── Pooling
│   └── Classification Head
│
└── Advanced (Levels 9-12)
    ├── Training a CNN
    ├── Deeper Networks
    ├── Famous Architectures
    └── Interpretability
```

## Features

- **Interactive Visualizations**: Every concept is hands-on
- **ELI5 Mode**: Kid-friendly explanations for complex topics
- **Draw Your Own**: Create custom inputs and kernels
- **Side-by-Side Comparisons**: See how different kernels behave
- **Progress Tracking**: Pick up where you left off
- **Keyboard Shortcuts**: Space (play/pause), arrows (step)

## Project Structure

```
convolutional-neural-network/
├── cnn-course-hub.jsx      # Main navigation hub
├── cnn-overview.jsx        # Full pipeline overview
├── level-4-convolution.jsx # Convolution deep dive
├── level-5-kernel-gallery.jsx # Kernel exploration
├── main.jsx                # Entry point
├── index.html              # HTML template
├── index.css               # Tailwind imports
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Dependencies
├── Makefile                # Build commands
└── README.md               # This file
```

## Development

```bash
# Install dependencies
make install

# Start dev server
make dev

# Build for production
make build

# Preview production build
make preview

# Clean build artifacts
make clean

# Full reset
make reset
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause animation |
| `→` | Step forward |
| `←` | Step backward |
| `R` | Reset |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-level`)
3. Commit changes (`git commit -am 'Add new level'`)
4. Push to branch (`git push origin feature/new-level`)
5. Open a Pull Request

## License

MIT License - feel free to use for educational purposes.

## Acknowledgments

Inspired by:
- [3Blue1Brown](https://www.youtube.com/c/3blue1brown) - Visual math explanations
- [Distill.pub](https://distill.pub/) - Interactive ML articles
- [CNN Explainer](https://poloclub.github.io/cnn-explainer/) - CNN visualization tool
