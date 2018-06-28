const path = require('path')
const chalk = require('chalk')

class WebpackResourceHintPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('WebpackResourceHintPlugin', compilation => {
      if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          'ResourceHintWebpackPluginAlterAssetTags',
          (pluginData, callback) => {
            const { chunks, head, plugin } = pluginData
            // Use the configured public path or build a relative path
            let publicPath =
              typeof compilation.options.output.publicPath !== 'undefined'
                ? compilation.mainTemplate.getPublicPath({
                  hash: compilation.hash
                })// If a hard coded public path exists use it
                : path
                  .relative(
                    path.resolve(
                      compilation.options.output.path,
                      path.dirname(plugin.childCompilationOutputName)
                    ),
                    compilation.options.output.path
                  )
                  .split(path.sep)
                  .join('/')// If no public path was set get a relative url path

            if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
              publicPath += '/'
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
            }
            const allChunks = compilation.getStats().toJson(chunkOnlyConfig)
              .chunks

            let prefetches = {}

            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i]

              let { prefetch } = chunk.childrenByOrder || {}
              if (prefetch && Array.isArray(prefetch)) {
                for (let f = 0; f < prefetch.length; f++) {
                  const prefetchId = prefetch[f]
                  const prefetchChunk = allChunks.find(
                    ({ id }) => id === prefetchId
                  )
                  if (prefetchChunk) {
                    let prefetchFiles = []
                      .concat(prefetchChunk.files)
                      .map(chunkFile => publicPath + chunkFile)

                    prefetchFiles.forEach(file => {
                      if (!prefetches[file]) {
                        prefetches[file] = true
                      }
                    })
                  }
                }
              }
            }

            let appendedHead = Object.keys(prefetches)
              .filter(e => /css$/.test(e))
              .map(e => ({
                tagName: 'link',
                selfClosingTag: false,
                voidTag: true,
                attributes: {
                  href: `${e}?${compilation.hash}`,
                  rel: 'prefetch'
                }
              }))
            console.log('')
            console.log(
              chalk.black.bold('----------- Webpack Prefetch --------------')
            )
            if (appendedHead.length > 0) {
              console.log(
                chalk.blue('Append Links:'),
                chalk.green.bold(Object.keys(prefetches).filter(e => /css$/.test(e)))
              )
            } else {
              console.log(chalk.red('no css prefetched'))
            }
            callback(null, { ...pluginData, head: [...appendedHead, ...head] })
          }
        )
      } else {
        console.log(chalk.red('no html-webpack-plugin loaded'))
      }
    })
  }
}

module.exports = WebpackResourceHintPlugin
