const boxSize = 15;
const padding = 2;
const dim = 28;
const EMPTY_CELL_COLOR_VAL = 230;

tf.loadLayersModel(
  "https://raw.githubusercontent.com/ChaunceyKiwi/cdn/main/model.json"
).then((model) => {
  let draw = SVG()
    .addTo("#container")
    .size(boxSize * dim, boxSize * dim);
  let isMouseDown = false;
  let rects = [];
  let rectsColor = [];

  const getColorCode = (colorVal) => {
    return `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
  };

  const deepen = (color) => {
    const originColor = parseInt(color.substring(1, 3), 16);
    const newColor = parseInt(originColor * 1.01 ** (-originColor / 40));
    return newColor > 0 ? newColor : 0;
  };

  const renderPixel = (x, y) => {
    if (x < 0 || y < 0 || x >= dim || y >= dim) {
      return;
    }
    const color = deepen(rects[x][y].node.getAttribute("fill"));
    const colorCode = `rgb(${color},${color},${color})`;
    rectsColor[x][y] = color;
    rects[x][y].attr({ fill: colorCode });
  };

  const renderPixels = (e, x, y) => {
    e.target.setAttribute("fill", "rgb(0, 0, 0)");
    renderPixel(x, y - 1);
    renderPixel(x, y + 1);
    renderPixel(x - 1, y);
    renderPixel(x + 1, y);
    rectsColor[x][y] = 0;
    predict();
  };

  for (let i = 0; i < dim; i++) {
    let rectTemp = [];
    let rectsColorTemp = [];

    for (let j = 0; j < dim; j++) {
      let rect = draw
        .rect(boxSize, boxSize)
        .attr({ fill: getColorCode(EMPTY_CELL_COLOR_VAL) })
        .stroke({ color: "rgb(255, 255, 255)", width: padding })
        .move(boxSize * i, boxSize * j);

      rect.mousedown((e) => {
        isMouseDown = true;
        renderPixels(e, i, j);
      });

      rect.mouseup((e) => {
        isMouseDown = false;
      });

      rect.mousemove((e) => {
        if (isMouseDown) {
          renderPixels(e, i, j);
        }
      });

      rectTemp.push(rect);
      rectsColorTemp.push(255);
    }
    rects.push(rectTemp);
    rectsColor.push(rectsColorTemp);
  }

  const btn = document.createElement("button");
  btn.id = "btn";
  btn.onclick = () => {
    for (let i = 0; i < rects.length; i++) {
      for (let j = 0; j < rects[0].length; j++) {
        rects[i][j].attr({ fill: getColorCode(EMPTY_CELL_COLOR_VAL) });
        rectsColor[i][j] = 255;
      }
    }
    for (let bucket of buckets) {
      bucket.style.backgroundColor = "white";
    }
  };
  btn.innerText = "Clear";
  document.getElementsByTagName("body")[0].append(btn);

  const btn2 = document.createElement("button");
  btn2.id = "btn2";
  btn2.onclick = () => {
    let res = [];
    for (let i = 0; i < rectsColor.length; i++) {
      let row = [];
      for (let j = 0; j < rectsColor[0].length; j++) {
        row.push((255 - rectsColor[j][i]) / 255.0);
      }
      res.push(row);
    }
    console.log(JSON.stringify(res));
  };
  btn2.innerText = "Print";
  document.getElementsByTagName("body")[0].append(btn2);

  // const btn3 = document.createElement("button");
  // btn3.id = "btn3";
  // btn3.onclick = () => {
  //   console.log(predict());
  // };
  // btn3.innerText = "Run";
  // document.getElementsByTagName("body")[0].append(btn3);

  const buckets = [];
  const bucketsContainer = document.createElement("div");
  bucketsContainer.id = "bucketsContainer";
  for (let i = 0; i < 10; i++) {
    const bucket = document.createElement("div");
    bucket.innerText = i;
    bucket.className = "bucket";
    bucketsContainer.append(bucket);
    buckets.push(bucket);
  }
  document.getElementsByTagName("body")[0].append(bucketsContainer);

  const predict = () => {
    let res = [];
    for (let i = 0; i < rectsColor.length; i++) {
      let row = [];
      for (let j = 0; j < rectsColor[0].length; j++) {
        row.push((255 - rectsColor[j][i]) / 255.0);
      }
      res.push(row);
    }
    const predictRes = (tf.argMax(model.predict(tf.tensor3d([res])), 1).arraySync())[0];

    for (let bucket of buckets) {
      bucket.style.backgroundColor = "white";
    }
    buckets[predictRes].style.backgroundColor = "yellow";

    return predictRes;
  }
});
