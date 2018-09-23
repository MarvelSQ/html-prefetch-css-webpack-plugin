const path = require('path')
const chalk = require('chalk')

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

class WebpackResourceHintPlugin {
  apply(compiler) {
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
                  }) // If a hard coded public path exists use it
                : path
                    .relative(
                      path.resolve(
                        compilation.options.output.path,
                        path.dirname(plugin.childCompilationOutputName)
                      ),
                      compilation.options.output.path
                    )
                    .split(path.sep)
                    .join('/') // If no public path was set get a relative url path

            if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
              publicPath += '/'
            }

            const allChunks = compilation.getStats().toJson(chunkOnlyConfig)
              .chunks

            // prefetch file map
            let prefetches = {}
            // prefetch chunk map
            let prefetchChunks = {}

            console.log(allChunks, chunks)

            function getChunkById(cid) {
              return allChunks.find(({ id }) => id === cid)
            }

            function readPrefetchs(chunk, isPrefetch) {
              let prefetch = chunk.childrenByOrder.prefetch || []
              const target = isPrefetch ? chunk.children : prefetch
              if (isPrefetch) {
                chunk.files.forEach(filename => {
                  prefetches[publicPath + filename] = true
                })
              }
              target.forEach(chunkId => {
                if (!prefetchChunks[chunkId]) {
                  prefetchChunks[chunkId] = true
                  readPrefetchs(getChunkById(chunkId), true)
                }
              })
            }

            chunks.forEach(chunk => readPrefetchs(chunk))

            let appendedHead = Object.keys(prefetches)
              .filter(e => /css$/.test(e))
              .map(e => ({
                tagName: 'link',
                selfClosingTag: false,
                voidTag: true,
                attributes: {
                  href: e,
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
                chalk.green.bold(
                  Object.keys(prefetches).filter(e => /css$/.test(e))
                )
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
