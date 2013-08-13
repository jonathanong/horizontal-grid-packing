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
  this.maxheight = options.maxheight || 400
  this.padding = options.padding || 0

  this.calculateAspectRatios()
  this.setup()
}

Pack.prototype.reload = function (width) {
  var container = this.container

  container.style.visibility = 'hidden'

  this.width = width ? width
    : width === false ? this.width
    : container.clientWidth

  this.setup()
}

Pack.prototype.setup = function () {
  var index = 0
  var container = this.container
  var mirrors = this.mirror = []

  while (index < this.images.length)
    index += this.setupRow(index)

  var lastmirror = mirrors[mirrors.length - 1]

  container.style.height = (lastmirror.top + lastmirror.height) + 'px'
  container.style.visibility = 'visible'
}

Pack.prototype.setupRow = function (index) {
  var mirror = this.mirror
  var padding = this.padding
  var x = this.calculateRowHeightAndCount(index)
  var height = Math.min(x[0], this.maxheight)
  var count = x[1]

  var row = {
    index: index,
    height: height,
    count: count
  }

  var images = this.images.slice(index, index + count)
  var imagemirrors = row.images = []
  var lastrow = mirror[mirror.length - 1]
  var top = row.top = lastrow
    ? (lastrow.top + lastrow.height + padding)
    : 0

  images.forEach(function (image, i) {
    var lastimage = i && imagemirrors[i - 1]
    var left = lastimage
      ? lastimage.right + padding
      : 0
    var width = Math.round(height * image.aspectRatio)

    image.style.left = left + 'px'
    image.style.top = top + 'px'
    image.style.height = height + 'px'
    image.style.width = width + 'px'

    imagemirrors.push({
      left: left,
      width: width,
      right: left + width,
      image: image
    })
  })

  mirror.push(row)

  return count
}

Pack.prototype.calculateRowHeightAndCount = function (index) {
  var costs = []
  var heights = []
  var count = 0

  var height, cost

  while (++count) {
    height = heights[count] = this.calculateRowHeight(index, count)
    cost = costs[count] = Math.abs(height - this.height)

    // If no more images, return high and count
    if (index + count === this.images.length)
      return [height, count]

    // If cost increases, return last height and count
    if (count > 1 && costs[count - 1] < cost)
      return [heights[count - 1], count - 1]

    // If the height is smaller than the targeted,
    // and the last height wasn't better than this one,
    // return this one.
    if (height < this.height)
      return [height, count]
  }
}

Pack.prototype.calculateRowHeight = function (index, count) {
  return Math.floor(
    (this.width - (this.padding * (count - 1))) /
    this.images.slice(index, index + count).map(getAspectRatio).reduce(add, 0)
  )
}

Pack.prototype.calculateAspectRatios = function (images) {
  (images || this.images).forEach(calculateAspectRatio)
}

function calculateAspectRatio(image) {
  if (!image.aspectRatio) image.aspectRatio =
    parseInt(image.getAttribute('data-width'), 10) /
    parseInt(image.getAttribute('data-height'), 10)
}

function getAspectRatio(x) {
  return x.aspectRatio
}

function add(a, b) {
  return a + b
}