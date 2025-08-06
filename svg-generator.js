const fs = require("fs");

function generateRandomOpacityValues() {
  // Generate 5 random opacity values between 0.2 and 1.0
  const values = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5,
    0.4, 0.3, 0.2,
  ];
  const randomIndex = Math.floor(Math.random() * values.length);
  const offsetValues = [
    ...values.slice(randomIndex),
    ...values.slice(0, randomIndex),
    values[randomIndex],
  ];
  return offsetValues.join(";");
}

function generateSVG() {
  const gridSize = 16,
    spacing = 50,
    dotRadius = 6,
    color = "#62748e",
    animationDuration = 10;

  const padding = spacing / 2;
  const width = spacing * gridSize;
  const height = width;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 ${width} ${height}" opacity="1" width="${width}"
    height="${height}">
    <g fill="${color}">`;

  // Generate grid of dots
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = padding + col * spacing;
      const y = padding + row * spacing;
      const opacityValues = generateRandomOpacityValues();

      svgContent += `
        <circle r="${dotRadius}" cx="${x}" cy="${y}">
            <animate attributeName="opacity" values="${opacityValues}" dur="${animationDuration}s" repeatCount="indefinite" />
        </circle>`;
    }
  }

  svgContent += `
    </g>
</svg>`;

  return svgContent;
}

function saveSVG(filename, options = {}) {
  const svg = generateSVG(options);
  fs.writeFileSync(filename, svg);
  console.log(`SVG saved to ${filename}`);
  console.log(`Grid: ${options.gridSize}x${options.gridSize} dots`);
  console.log(`Total dots: ${Math.pow(options.gridSize, 2)}`);
}

// Usage examples:
if (require.main === module) {
  // Generate default SVG
  saveSVG("animated-dots.svg");
}

// Export for use as module
module.exports = {
  generateSVG,
  saveSVG,
  generateRandomOpacityValues,
};
