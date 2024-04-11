// Use `tfjs-node`. Note that `tfjs` is imported indirectly by `tfjs-node`.
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const obj = JSON.parse(fs.readFileSync("./data/data.json", "utf8"));
const handler = tf.io.fileSystem("./model/model.json");

tf.loadLayersModel(handler).then((model) => {
  const x = tf.tensor3d(obj);
  const res = model.predict(x);
  tf.argMax(res, 1).print()
});
