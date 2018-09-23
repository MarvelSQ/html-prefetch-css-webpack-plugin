const root = document.getElementById('root')

const title = document.createElement('h1')

title.innerHTML = 'Second Page'

title.addEventListener('click', () => {
  import(/* webpackChunkName: "moduleC" */ /* webpackPrefetch: true */ './moduleC/moduleC.js').then(
    module => {
      document.body.appendChild(
        module.default(title, '<h2>Lazy load Content</h2>')
      )
    }
  )
})

document.body.appendChild(title)
