const webpack = require("webpack");
const config = require("./webpack.config");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

cp.spawnSync("npm", ["run", "dev"]);

test("index html", () => {
  const buildFile = fs.readFileSync(
    path.resolve(__dirname, "dist/index.html"),
    {
      encoding: "utf-8"
    }
  );
  expect(buildFile).toMatchSnapshot();
});

test('second html', () => {
  const buildFile = fs.readFileSync(
    path.resolve(__dirname, "dist/second.html"),
    {
      encoding: "utf-8"
    }
  );
  expect(buildFile).toMatchSnapshot();
})
