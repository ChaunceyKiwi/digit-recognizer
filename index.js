const dim = 28;
const width = 560;
const boxSize = width / dim;
const bucketMargin = 8;
const bucketWidth = (width - 40 - 20 - bucketMargin * 20) / 10;
const padding = boxSize / 8;
const EMPTY_CELL_COLOR_VAL = 230;

let svg;
let model;
let layerValues;

(async () => {
  model = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/ChaunceyKiwi/cdn/refs/heads/main/%2320250102/model.json"
  );

  const layerUnitCounts = model.layers.slice(2).map((layer) => {
    return layer.units;
  });

  layerValues = layerUnitCounts.map((layerUnitCount) =>
    Array(layerUnitCount).fill(0)
  );

  drawPixels();
  visualizeNeuralNetwork();
})();
