<h1 align="center">HTML-Prefetch-Css-Webpack-Plugin</h1>

<h2 align="center">Install</h2>

```bash
  npm i --save-dev html-prefetch-css-webpack-plugin
```

This is a [webpack] plugin, work with [html-webpack-plugin](html-url). inject prefetch link to html head;

while use code spilting in webpack, we can use magic comment to mark module that we want to prefetch;

_like this_

```js
/* webpackPrefetch: true */
```

but the split css file won't be prefetched;

_before load_

```html
<head>
  ...
  <link rel="prefetch" href="example.js">
  ...
</head>
```

_after loaded_

```html
<head>
  ...
  <link rel="prefetch" href="example.js">
  <link rel="stylesheet" type="text/css" href="example.css">
  <script charset="utf-8" src="example.js"></script>
  ...
</head>
```

although the js file be prefetched, css file still need to wait;

to solve this problem, we can use ['style-loader'][style-loader] to integrate css to js file;

**webpack.config.js**

```js
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /css$/,
        loaders: ['style-loader','css-loader']
      }
    ]
  }
  ...
}
```

else use this plugin

_before load_

```html
<head>
  ...
  <link rel="prefetch" href="example.css">
  <link rel="prefetch" href="example.js">
  ...
</head>
```

<h2 align="center">Usage</h2>

**index.js**

```js
const button = document.createElement("button");
button.innerText = "lazy load btn";
button.addEventListener("click", () => {
  // use magic comments to mark module need be prefetch
  // webpack 4.6.0+ support
  import(/* webpackChunkName: "lazy" */ /* webpackPrefetch: "true" */ "./lazy.js").then(
    module => {
      document.body.appendChild(module.default("<h2>Lazy load Content</h2>"));
    }
  );
});
document.body.appendChild(button);
```

**lazy.js**

```js
import "./lazy.css";

export default content => {
  const lazy = document.createElement("div");
  lazy.classList.add("lizy");
  lazy.innerHTML = content;
  return lazy;
};
```

**lazy.css**

```css
.lazy {
  font-size: 20px;
  color: red;
}
```

**webpack.config.js**

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

const PrefetchCssWebpackPlugin = require("html-prefetch-css-webpack-plugin");

module.export = {
  entry: "index.js",
  output: {
    path: __dirname + "/dist",
    filename: "index.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new PrefetchCssWebpackPlugin(),
    new MiniCSSExtractPlugin("[name].css")
  ]
};
```

the generated html file would be

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Webpack App</title>
    <link rel="prefetch" href="lazy.css">
  </head>
  <body>
    <script src="index_bundle.js"></script>
  </body>
</html>
```

[webpack]: https://webpack.js.org/
[html-plugin]: https://github.com/jantimon/html-webpack-plugin/
[npm-url]: https://npmjs.com/package/html-prefetch-css-webpack-plugin
[npm]: https://img.shields.io/npm/v/html-webpack-plugin.svg
[html-url]: https://npmjs.com/package/html-webpack-plugin
[style-loader]: https://webpack.js.org/loaders/style-loader/
