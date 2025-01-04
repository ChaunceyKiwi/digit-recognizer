const rects = [];
let isMouseDown = false;

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
    let currRect = [];

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
      currRect.push(rect);
    }
    rects.push(currRect);
  }
};