import './index.css'
const appendChild = () => {
  const button = document.createElement('button')
  button.innerText = 'lazy load btn'
  button.addEventListener('click', () => {
    // use magic comments to mark module need be prefetch
    // webpack 4.6.0+ support
    import(/* webpackChunkName: "moduleA" */ /* webpackPrefetch: true */ './moduleA/moduleA.js').then(
      module => {
        document.body.appendChild(module.default('<h2>Lazy load Content</h2>'))
      }
    )
  })
  document.body.appendChild(button)
}

appendChild()
