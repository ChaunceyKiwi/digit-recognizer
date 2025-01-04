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
  layerValues[0] = getOutputOfLayer("dense", model, res);
  layerValues[1] = getOutputOfLayer("dense_1", model, res);
  updateColor();
  return tf.argMax(modelOutput, 1).arraySync()[0];
};

const getOutputOfLayer = (layerName, model, res) => {
  const layer = model.getLayer(layerName);
  const singleLayerModel = tf.model({
    inputs: model.inputs,
    outputs: layer.output,
  });
  const singleLayerOutput = singleLayerModel.predict(tf.tensor3d([res]));
  return Array.from(singleLayerOutput.dataSync());
};

const updateColor = () => {
  svg
    .selectAll(".fill")
    .attr("x", (d) => d.x - 6)
    .attr("y", (d, i) => {
      if (i < 20) {
        const height = Math.min(Math.ceil((layerValues[0][i] / 10) * 12), 12);
        return d.y + 6 - height;
      } else {
        const height = Math.ceil(layerValues[1][i - 20] * 12);
        return d.y + 6 - height;
      }
    })
    .attr("width", 12)
    .attr("height", (d, i) => {
      if (i < 20) {
        const height = Math.min(Math.ceil((layerValues[0][i] / 10) * 12), 12);
        return height;
      } else {
        const height = Math.ceil(layerValues[1][i - 20] * 12);
        return height;
      }
    })
    .style("fill", "#000000")
    .attr("opacity", 0.7);

  svg.selectAll(".link").attr("opacity", (d, i) => {
    return layerValues[1][d.targetIdx];
  });
};

const visualizeNeuralNetwork = () => {
  const layers = [
    { name: "Dense", neurons: layerValues[0].length },
    { name: "Output", neurons: layerValues[1].length },
  ];

  // SVG Canvas setup
  const width = 800;
  const height = 250;
  svg = d3
    .select("#visualizationContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Calculate layer positions
  const layerSpacing = height / (layers.length + 1);
  const neuronSpacing = 30;

  // Generate neuron positions and links
  const neurons = [];
  const links = [];
  layers.forEach((layer, layerIndex) => {
    const y = layerSpacing * (layerIndex + 1);
    const xStart = (width - layer.neurons * neuronSpacing) / 2;

    for (let i = 0; i < layer.neurons; i++) {
      neurons.push({
        layer: layerIndex,
        x: xStart + i * neuronSpacing,
        y,
        index: i,
      });

      // Add links to previous layer
      if (layerIndex > 0) {
        const prevLayerNeurons = neurons.filter(
          (n) => n.layer === layerIndex - 1
        );
        prevLayerNeurons.forEach((prevNeuron, idx) => {
          links.push({
            source: prevNeuron,
            target: { x: xStart + i * neuronSpacing, y },
            sourceIdx: idx,
            targetIdx: i,
          });
        });
      }
    }
  });

  // Draw links (connections between neurons)
  svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("targetIdx", (d) => d.targetIdx)
    .attr("sourceIdx", (d) => d.sourceIdx)
    .attr("opacity", 0.1)
    .style("stroke-width", "1px");

  // draw filled part
  svg
    .selectAll("rect")
    .data(neurons)
    .enter()
    .append("rect")
    .attr("x", (d) => d.x - 10)
    .attr("y", (d) => d.y - 10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("opacity", 0.7)
    .attr("stroke", "black")
    .style("fill", "#ffffff");

  svg
    .selectAll(".fill")
    .data(neurons)
    .enter()
    .append("rect")
    .attr("class", "fill")
    .attr("x", (d) => d.x - 6)
    .attr("y", (d) => d.y + 6)
    .attr("width", 12)
    .attr("height", 0)
    .style("fill", "#000000")
    .attr("opacity", 0.7);

  svg
    .selectAll("label")
    .data(neurons.slice(20))
    .enter()
    .append("text")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y + 30)
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", "#000000")
    .text((d, i) => i);
};
