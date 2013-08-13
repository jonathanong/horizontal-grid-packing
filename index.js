module.exports = Pack

function Pack(container, options) {
  if (!(this instanceof Pack))
    return new Pack(container, options)

  if (!options)
    throw new Error('You must set options.')

  this.container = container
  this.images = [].slice.call(container.childNodes, 0)
  this.width = options.width || container.clientWidth
  this.height = options.height || 320
  this.padding = options.padding || 0

  this.removeElements()
  this.calculateAspectRatios()
  this.setup()
}

Pack.prototype.removeElements = function () {
  this.images.forEach(remove)
}

Pack.prototype.calculateAspectRatios = function () {
  this.images.forEach(function (image) {
    if (!image.aspectRatio) image.aspectRatio =
      parseInt(image.getAttribute('data-width'), 10) /
      parseInt(image.getAttribute('data-height'), 10)
  })
}

Pack.prototype.setup = function () {
  var index = 0

  while (index < this.images.length)
    index += this.setupRow(index)
}

Pack.prototype.setupRow = function (index) {
  var x = this.calculateRowHeightAndCount(index)
  var height = x[0]
  var count = x[1]

  var div = document.createElement('div')
  div.style.height = height + 'px'

  this.images.slice(index, index + count)
  .forEach(function (image) {
    div.appendChild(image)
  })

  this.container.appendChild(div)

  return count
}

Pack.prototype.calculateRowHeightAndCount = function (index) {
  var costs = []
  var count = 0

  var height, cost

  while (count++ > -1) {
    height = this.calculateRowHeight(index, count)
    cost = costs[count] = Math.abs(height - this.height)

    if (index + count === this.images.length
      || (count > 1 && costs[count - 1] < cost)
    ) return [height, count]
  }
}

Pack.prototype.calculateRowHeight = function (index, count) {
  return Math.floor(
    (this.width - (this.padding * (count - 1))) /
    this.images.slice(index, index + count).map(getAspectRatio).reduce(add, 0)
  )
}

function getAspectRatio(x) {
  return x.aspectRatio
}

function add(a, b) {
  return a + b
}

function remove(x) {
  x.parentNode.removeChild(x)
}