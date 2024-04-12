const dim = 28;
const boxSize = (document.documentElement.clientWidth - 40) / dim;
const bucketMargin = 8;
const bucketWidth =
  (document.documentElement.clientWidth - 40 - 20 - bucketMargin * 20) / 10;
const padding = boxSize / 8;
const EMPTY_CELL_COLOR_VAL = 230;
let isMouseDown = false;
let model;
const buckets = [];
const rects = [];

const getColorCode = (colorVal, opacity) => {
  return `rgba(${colorVal}, ${colorVal}, ${colorVal}, ${opacity})`;
};

const deepen = (color) => {
  return color * 1.01 ** (-color / 40);
};

const renderPixel = (x, y) => {
  if (x < 0 || y < 0 || x >= dim || y >= dim) {
    return;
  }

  const color = deepen(rects[x][y].color);
  const colorCode = getColorCode(color, 1);
  rects[x][y].attr({ fill: colorCode });
  rects[x][y].color = color;
};

const renderPixels = (e) => {
  let target;
  if (e.targetTouches) {
    target = document.elementFromPoint(
      e.targetTouches[0].clientX,
      e.targetTouches[0].clientY
    );
  } else {
    target = document.elementFromPoint(e.clientX, e.clientY);
  }

  if (target) {
    x = target.i;
    y = target.j;

    // console.log(target.i, target.j)
    target.setAttribute("fill", getColorCode(0, 1));
    renderPixel(x, y - 1);
    renderPixel(x, y + 1);
    renderPixel(x - 1, y);
    renderPixel(x + 1, y);
    rects[x][y].color = 0;
    predict();
  }
};

const drawPixels = () => {
  let draw = SVG()
    .addTo("#container")
    .size(boxSize * dim, boxSize * dim);

  for (let i = 0; i < dim; i++) {
    let rectTemp = [];

    for (let j = 0; j < dim; j++) {
      let rect = draw
        .rect(boxSize, boxSize)
        .attr({ fill: getColorCode(EMPTY_CELL_COLOR_VAL, 1) })
        .stroke({ color: getColorCode(255, 1), width: padding })
        .move(boxSize * i, boxSize * j);

      rect.on(["mousedown", "touchstart"], (e) => {
        isMouseDown = true;
        renderPixels(e);
      });

      rect.on(["mouseup", "touchend"], () => {
        isMouseDown = false;
      });

      rect.on(["mousemove", "touchmove"], (e) => {
        if (isMouseDown) {
          renderPixels(e);
        }
      });

      rect.color = EMPTY_CELL_COLOR_VAL;
      rect.node.i = i;
      rect.node.j = j;
      rectTemp.push(rect);
    }
    rects.push(rectTemp);
  }
};

const drawButtons = () => {
  const btn = document.createElement("button");
  btn.id = "btn";
  btn.onclick = () => {
    for (let i = 0; i < rects.length; i++) {
      for (let j = 0; j < rects[0].length; j++) {
        rects[i][j].color = EMPTY_CELL_COLOR_VAL;
        rects[i][j].attr({ fill: getColorCode(EMPTY_CELL_COLOR_VAL, 1) });
      }
    }
    for (let bucket of buckets) {
      bucket.style.backgroundColor = "white";
    }
  };
  btn.innerText = "Clear";
  btn.style.width = bucketWidth * 2 + "px";
  btn.style.height = bucketWidth + "px";
  btn.style.fontSize = bucketWidth / 2 + "px";
  document.getElementsByTagName("body")[0].append(btn);
};

const drawBuckets = () => {
  const bucketsContainer = document.createElement("div");
  bucketsContainer.id = "bucketsContainer";
  for (let i = 0; i < 10; i++) {
    const bucket = document.createElement("div");
    bucket.innerText = i;
    bucket.className = "bucket";
    bucket.style.width = bucketWidth + "px";
    bucket.style.height = bucketWidth / 2 + "px";
    bucket.style.fontSize = bucketWidth / 2.5 + "px";
    bucket.style.margin = bucketMargin + "px";
    bucketsContainer.append(bucket);
    buckets.push(bucket);
  }
  document.getElementsByTagName("body")[0].prepend(bucketsContainer);
};

const predict = () => {
  let res = [];
  for (let i = 0; i < rects.length; i++) {
    let row = [];
    for (let j = 0; j < rects[0].length; j++) {
      row.push(
        (EMPTY_CELL_COLOR_VAL - rects[j][i].color) / EMPTY_CELL_COLOR_VAL
      );
    }
    res.push(row);
  }
  const modelOutput = model.predict(tf.tensor3d([res]));
  const predictRes = tf.argMax(modelOutput, 1).arraySync()[0];
  const modelOutputArray = modelOutput.arraySync()[0];
  for (let index in modelOutputArray) {
    buckets[
      index
    ].style.backgroundColor = `rgba(0, 255, 0, ${modelOutputArray[index]})`;
  }
  return predictRes;
};

(async () => {
  model = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/ChaunceyKiwi/cdn/main/model.json"
  );
  drawBuckets();
  drawPixels();
  drawButtons();
})();
