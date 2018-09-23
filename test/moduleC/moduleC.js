import './module.css'

export default (element, content) => {
  element = element || document.createElement('div')
  element.innerHTML = content
}
