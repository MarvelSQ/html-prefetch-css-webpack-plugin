const path = require("path");
const chalk = require("chalk");

const isCssJs = /(css|js)$/;
const isJs = /js$/;

class WebpackResourceHintPlugin {
  /* eslint-disable */
  apply(compiler) {
    const self = this;
    compiler.hooks.compilation.tap("WebpackResourceHintPlugin", compilation => {
      if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          "ResourceHintWebpackPluginAlterAssetTags",
          (pluginData, callback) => {
            const { chunks, head, plugin } = pluginData;
            // Use the configured public path or build a relative path
            let publicPath =
              typeof compilation.options.output.publicPath !== "undefined"
                ? // If a hard coded public path exists use it
                  compilation.mainTemplate.getPublicPath({
                    hash: compilationHash
                  })
                : // If no public path was set get a relative url path
                  path
                    .relative(
                      path.resolve(
                        compilation.options.output.path,
                        path.dirname(plugin.childCompilationOutputName)
                      ),
                      compilation.options.output.path
                    )
                    .split(path.sep)
                    .join("/");

            if (publicPath.length && publicPath.substr(-1, 1) !== "/") {
              publicPath += "/";
            }
            // Get chunks info as json
            // Note: we're excluding stuff that we don't need to improve toJson serialization speed.
            const chunkOnlyConfig = {
              assets: false,
              cached: false,
              children: false,
              chunks: true,
              chunkModules: false,
              chunkOrigins: false,
              errorDetails: false,
              hash: false,
              modules: false,
              reasons: false,
              source: false,
              timings: false,
              version: false
            };
            const allChunks = compilation.getStats().toJson(chunkOnlyConfig)
              .chunks;

            let prefetches = {};
            let preloades = [];

            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];

              let { prefetch, preload } = chunk.childrenByOrder || {};
              if (prefetch && Array.isArray(prefetch)) {
                for (let f = 0; i < prefetch.length; i++) {
                  const prefetchId = prefetch[i];
                  const prefetchChunk = allChunks.find(
                    ({ id }) => id === prefetchId
                  );
                  if (prefetchChunk) {
                    let prefetchFiles = []
                      .concat(prefetchChunk.files)
                      .map(chunkFile => publicPath + chunkFile);

                    prefetchFiles.forEach(file => {
                      if (!prefetches[file]) {
                        prefetches[file] = true;
                      }
                    });
                  }
                }
              }
            }

            let appendedHead = Object.keys(prefetches)
              .filter(e => /css$/.test(e))
              .map(e => ({
                tagName: "link",
                selfClosingTag: false,
                voidTag: true,
                attributes: {
                  href: e,
                  rel: "prefetch"
                }
              }));
            console.log("");
            console.log(
              chalk.black.bold("----------- Webpack Prefetch --------------")
            );
            console.log(
              chalk.blue("Append Links:"),
              chalk.green.bold(Object.keys(prefetches))
            );
            callback(null, { ...pluginData, head: [...appendedHead, ...head] });
          }
        );
      } else {
        console.log(chalk.red("no html-webpack-plugin loaded"));
      }
    });
  }
}

module.exports = WebpackResourceHintPlugin;
