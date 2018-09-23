import './moduleA.css'

export default content => {
  const lazy = document.createElement('div')
  lazy.classList.add('module-a')
  lazy.innerHTML = content
  lazy.addEventListener('click', () => {
    import(/* webpackChunkName: "moduleB" */ /* webpackPrefetch: true */ '../moduleB/moduleB').then(
      module => {
        document.body.appendChild(module.default('moduleB'))
      }
    )
  })
  return lazy
}
