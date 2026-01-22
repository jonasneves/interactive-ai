import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, Eye, Grid3X3,
  Lightbulb, ChevronRight, ChevronLeft, Check, X, Sparkles
} from 'lucide-react';

const PixelsAndImages = () => {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [eli5Mode, setEli5Mode] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [colorMode, setColorMode] = useState('grayscale'); // grayscale, rgb
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);

  // Sample 8x8 grayscale image (simple digit "3")
  const [imageData, setImageData] = useState([
    [0, 0, 50, 150, 200, 200, 100, 0],
    [0, 0, 0, 0, 0, 50, 200, 50],
    [0, 0, 0, 0, 0, 100, 200, 0],
    [0, 0, 50, 150, 200, 200, 50, 0],
    [0, 0, 0, 0, 0, 50, 200, 50],
    [0, 0, 0, 0, 0, 100, 200, 0],
    [0, 0, 50, 150, 200, 200, 100, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  // RGB version of sample image
  const [rgbData, setRgbData] = useState([
    [[0,0,50], [0,0,100], [50,100,200], [150,50,50], [200,100,50], [200,150,0], [100,50,100], [0,0,50]],
    [[0,50,0], [0,0,0], [0,0,0], [0,50,0], [0,0,50], [50,100,0], [200,150,100], [50,0,50]],
    [[0,0,0], [0,50,50], [0,0,0], [0,0,0], [0,50,0], [100,50,50], [200,200,0], [0,50,0]],
    [[0,50,0], [0,0,50], [50,100,100], [150,150,0], [200,100,100], [200,200,50], [50,100,0], [0,0,50]],
    [[0,0,50], [0,50,0], [0,0,0], [0,0,50], [0,50,0], [50,50,100], [200,100,150], [50,50,0]],
    [[0,50,0], [0,0,0], [0,50,0], [0,0,0], [0,0,50], [100,100,50], [200,150,100], [0,0,50]],
    [[0,0,0], [0,50,50], [50,50,100], [150,100,150], [200,150,100], [200,200,50], [100,100,50], [0,50,0]],
    [[0,50,50], [0,0,0], [0,0,50], [0,50,0], [0,0,0], [0,50,50], [0,0,0], [0,0,50]],
  ]);

  const sections = [
    {
      title: "What is a Pixel?",
      content: eli5Mode
        ? "Think of a pixel like a tiny colored square - like one LEGO brick. When you put lots of LEGO bricks together, you can make a picture! Each brick can be a different color."
        : "A pixel (picture element) is the smallest addressable unit in a digital image. Each pixel stores color information as numerical values. In grayscale, this is a single value 0-255. In color (RGB), it's three values for Red, Green, and Blue channels."
    },
    {
      title: "Grayscale Images",
      content: eli5Mode
        ? "In black and white pictures, each tiny square has a number from 0 to 255. 0 means totally black (like nighttime), and 255 means totally white (like snow). Numbers in between are different shades of gray!"
        : "Grayscale images use a single channel where each pixel value represents intensity. 0 = black, 255 = white, with intermediate values representing shades of gray. This is simpler than color and often used as input for CNNs."
    },
    {
      title: "RGB Color Images",
      content: eli5Mode
        ? "Color pictures are like having 3 invisible layers stacked on top of each other - one red, one green, one blue. Mix them together and you get any color you want! It's like mixing paints."
        : "RGB images have three channels (Red, Green, Blue). Each pixel is a triplet [R, G, B] where each value is 0-255. By combining these three primary colors at different intensities, we can represent ~16.7 million colors."
    },
    {
      title: "Images as Numbers",
      content: eli5Mode
        ? "To a computer, every picture is just a big grid of numbers! The computer doesn't 'see' a cat or a dog - it sees thousands of numbers. Our job is to teach it what those numbers mean."
        : "Computers represent images as matrices (2D arrays) of numbers. A grayscale image is a 2D matrix, while an RGB image is a 3D tensor with shape [height, width, 3]. Neural networks process these numerical representations to 'understand' images."
    }
  ];

  const presetImages = [
    { name: "Digit 3", data: [
      [0, 0, 50, 150, 200, 200, 100, 0],
      [0, 0, 0, 0, 0, 50, 200, 50],
      [0, 0, 0, 0, 0, 100, 200, 0],
      [0, 0, 50, 150, 200, 200, 50, 0],
      [0, 0, 0, 0, 0, 50, 200, 50],
      [0, 0, 0, 0, 0, 100, 200, 0],
      [0, 0, 50, 150, 200, 200, 100, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ]},
    { name: "Cross", data: [
      [0, 0, 0, 200, 200, 0, 0, 0],
      [0, 0, 0, 200, 200, 0, 0, 0],
      [0, 0, 0, 200, 200, 0, 0, 0],
      [200, 200, 200, 200, 200, 200, 200, 200],
      [200, 200, 200, 200, 200, 200, 200, 200],
      [0, 0, 0, 200, 200, 0, 0, 0],
      [0, 0, 0, 200, 200, 0, 0, 0],
      [0, 0, 0, 200, 200, 0, 0, 0],
    ]},
    { name: "Gradient", data: [
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
      [0, 32, 64, 96, 128, 160, 192, 224],
    ]},
    { name: "Checkerboard", data: [
      [0, 255, 0, 255, 0, 255, 0, 255],
      [255, 0, 255, 0, 255, 0, 255, 0],
      [0, 255, 0, 255, 0, 255, 0, 255],
      [255, 0, 255, 0, 255, 0, 255, 0],
      [0, 255, 0, 255, 0, 255, 0, 255],
      [255, 0, 255, 0, 255, 0, 255, 0],
      [0, 255, 0, 255, 0, 255, 0, 255],
      [255, 0, 255, 0, 255, 0, 255, 0],
    ]},
  ];

  const handlePixelClick = (row, col) => {
    setSelectedPixel({ row, col });
  };

  const handlePixelDraw = (row, col) => {
    if (drawing && colorMode === 'grayscale') {
      const newData = imageData.map((r, ri) =>
        r.map((v, ci) => (ri === row && ci === col) ? Math.min(255, v + 50) : v)
      );
      setImageData(newData);
    }
  };

  const clearImage = () => {
    setImageData(Array(8).fill().map(() => Array(8).fill(0)));
  };

  const getPixelColor = (value) => {
    if (colorMode === 'grayscale') {
      return `rgb(${value}, ${value}, ${value})`;
    }
    return `rgb(${value[0]}, ${value[1]}, ${value[2]})`;
  };

  const getTextColor = (value) => {
    const brightness = colorMode === 'grayscale' ? value : (value[0] + value[1] + value[2]) / 3;
    return brightness > 127 ? '#000' : '#fff';
  };

  const pixelSize = 40 * zoom;
  const data = colorMode === 'grayscale' ? imageData : rgbData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                Level 1
              </span>
              <span className="text-slate-400">Prerequisites</span>
            </div>
            <h1 className="text-3xl font-bold">Pixels & Images</h1>
            <p className="text-slate-400 mt-1">Understanding how computers see images</p>
          </div>

          <button
            onClick={() => setEli5Mode(!eli5Mode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              eli5Mode
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Lightbulb size={18} />
            {eli5Mode ? 'ELI5 Mode ON' : 'ELI5 Mode'}
          </button>
        </div>

        {/* Learning Section Navigator */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{sections[currentSection].title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-slate-400 text-sm px-2">
                {currentSection + 1} / {sections.length}
              </span>
              <button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                disabled={currentSection === sections.length - 1}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed">{sections[currentSection].content}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSection ? 'bg-blue-400 w-6' : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Interactive Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pixel Grid */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Interactive Pixel Grid</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-sm text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                  showGrid ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Grid3X3 size={14} />
                Grid
              </button>
              <button
                onClick={() => setShowValues(!showValues)}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                  showValues ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Eye size={14} />
                Values
              </button>
              <button
                onClick={() => setColorMode(colorMode === 'grayscale' ? 'rgb' : 'grayscale')}
                className="px-3 py-1.5 rounded text-sm bg-violet-500/20 text-violet-300"
              >
                {colorMode === 'grayscale' ? 'Grayscale' : 'RGB'}
              </button>
              <button
                onClick={clearImage}
                className="px-3 py-1.5 rounded text-sm bg-slate-700 text-slate-400 hover:bg-slate-600"
              >
                <RotateCcw size={14} className="inline mr-1" />
                Clear
              </button>
            </div>

            {/* Preset Images */}
            <div className="flex gap-2 mb-4">
              {presetImages.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageData(preset.data)}
                  className="px-3 py-1.5 rounded text-sm bg-slate-700 hover:bg-slate-600 text-slate-300"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Pixel Grid Display */}
            <div
              className="overflow-auto bg-slate-900 rounded-lg p-4"
              style={{ maxHeight: '400px' }}
            >
              <div
                className="grid gap-0 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(8, ${pixelSize}px)`,
                  width: 'fit-content'
                }}
                onMouseDown={() => setDrawing(true)}
                onMouseUp={() => setDrawing(false)}
                onMouseLeave={() => setDrawing(false)}
              >
                {data.map((row, rowIdx) =>
                  row.map((value, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handlePixelClick(rowIdx, colIdx)}
                      onMouseEnter={() => handlePixelDraw(rowIdx, colIdx)}
                      className={`flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                        showGrid ? 'border border-slate-600' : ''
                      } ${
                        selectedPixel?.row === rowIdx && selectedPixel?.col === colIdx
                          ? 'ring-2 ring-blue-400 z-10'
                          : ''
                      }`}
                      style={{
                        width: pixelSize,
                        height: pixelSize,
                        backgroundColor: getPixelColor(value),
                      }}
                    >
                      {showValues && (
                        <span
                          className="text-xs font-mono"
                          style={{
                            color: getTextColor(value),
                            fontSize: Math.max(8, pixelSize / 5)
                          }}
                        >
                          {colorMode === 'grayscale' ? value : '...'}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-sm text-slate-400 mt-3 text-center">
              Click a pixel to inspect • Drag to draw (grayscale mode)
            </p>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Selected Pixel Info */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-4">Pixel Inspector</h3>
              {selectedPixel ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-lg border-2 border-slate-600"
                      style={{
                        backgroundColor: getPixelColor(
                          colorMode === 'grayscale'
                            ? imageData[selectedPixel.row][selectedPixel.col]
                            : rgbData[selectedPixel.row][selectedPixel.col]
                        )
                      }}
                    />
                    <div>
                      <p className="text-slate-400 text-sm">Position</p>
                      <p className="text-lg font-mono">
                        [{selectedPixel.row}, {selectedPixel.col}]
                      </p>
                    </div>
                  </div>

                  {colorMode === 'grayscale' ? (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Grayscale Value</p>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono text-blue-300">
                          {imageData[selectedPixel.row][selectedPixel.col]}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 bg-gradient-to-r from-black to-white rounded-full">
                            <div
                              className="h-full w-1 bg-blue-400 rounded-full relative"
                              style={{
                                marginLeft: `${(imageData[selectedPixel.row][selectedPixel.col] / 255) * 100}%`
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0 (Black)</span>
                            <span>255 (White)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-slate-400 text-sm">RGB Values</p>
                      {['Red', 'Green', 'Blue'].map((channel, idx) => (
                        <div key={channel} className="flex items-center gap-3">
                          <span className={`w-16 text-sm ${
                            idx === 0 ? 'text-red-400' : idx === 1 ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {channel}
                          </span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${(rgbData[selectedPixel.row][selectedPixel.col][idx] / 255) * 100}%`
                              }}
                            />
                          </div>
                          <span className="font-mono text-sm w-8">
                            {rgbData[selectedPixel.row][selectedPixel.col][idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  Click a pixel to inspect its values
                </p>
              )}
            </div>

            {/* Matrix Representation */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-4">As a Computer Sees It</h3>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300">
                  {colorMode === 'grayscale' ? (
                    <>
                      <span className="text-slate-500"># 8x8 grayscale image</span>{'\n'}
                      <span className="text-blue-400">image</span> = [{'\n'}
                      {imageData.map((row, idx) => (
                        <span key={idx}>
                          {'  '}[{row.map(v => v.toString().padStart(3, ' ')).join(', ')}]{idx < 7 ? ',' : ''}{'\n'}
                        </span>
                      ))}
                      ]
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500"># 8x8x3 RGB image</span>{'\n'}
                      <span className="text-blue-400">image.shape</span> = (8, 8, 3){'\n'}
                      <span className="text-slate-500"># Each pixel: [R, G, B]</span>
                    </>
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Quick Quiz
          </h3>
          <p className="text-slate-300 mb-4">
            A 1920x1080 grayscale image has how many total pixel values?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: '2,073,600', correct: true },
              { value: '6,220,800', correct: false },
              { value: '1,920,000', correct: false },
              { value: '1,080,000', correct: false },
            ].map((option, idx) => (
              <button
                key={idx}
                onClick={() => setQuizAnswer(option.correct)}
                className={`p-3 rounded-lg border transition-all ${
                  quizAnswer === null
                    ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                    : option.correct
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-600 opacity-50'
                }`}
                disabled={quizAnswer !== null}
              >
                <span className="font-mono">{option.value}</span>
                {quizAnswer !== null && option.correct && (
                  <Check size={16} className="inline ml-2 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
          {quizAnswer !== null && (
            <p className={`mt-4 ${quizAnswer ? 'text-emerald-400' : 'text-red-400'}`}>
              {quizAnswer
                ? '✓ Correct! 1920 × 1080 = 2,073,600 pixels. For RGB, multiply by 3 for 6,220,800 values.'
                : '✗ Not quite. Remember: width × height for grayscale!'}
            </p>
          )}
        </div>

        {/* Key Takeaways */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-blue-300">Key Takeaways</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Images are grids of pixels, each storing numerical values</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Grayscale: 1 value per pixel (0-255), RGB: 3 values per pixel</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>CNNs process these numerical matrices to "understand" images</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Image dimensions are often written as Height × Width × Channels</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PixelsAndImages;
