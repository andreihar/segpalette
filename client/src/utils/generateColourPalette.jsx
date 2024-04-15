export const generateColourPalette = (imageData) => {
  const colours = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const colour = `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}`;
    colours.push(colour);
  }

  const colourCounts = colours.reduce((counts, colour) => {
    counts[colour] = (counts[colour] || 0) + 1;
    return counts;
  }, {});

  const palette = Object.entries(colourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([colour]) => {
      const [r, g, b] = colour.split(',').map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    });

  return palette;
};