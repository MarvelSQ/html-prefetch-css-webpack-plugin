import './moduleB.css'

export default content => {
  const lazy = document.createElement('div')
  lazy.classList.add('module-b')
  lazy.addEventListener('click', () => {
    import(/* webpackChunkName: "moduleA" */ /* webpackPrefetch: true */ '../moduleA/moduleA').then(
      module => {
        module.default('lazy in lazy')
      }
    )
  })
  lazy.innerHTML = content
  return lazy
}
