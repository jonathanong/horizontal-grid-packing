var part = require('linear-partitioning')
var classes = require('classes')

module.exports = Pack

function Pack(container, options) {
  if (!(this instanceof Pack))
    return new Pack(container, options)

  options = options || {}

  this.container = container
  this.isFragment = container instanceof DocumentFragment
  this.classes = !this.isFragment && classes(container)
  this.images = slice(container.childNodes).filter(isElement)
  this.top = options.top || 0
  this.width = options.width || container.clientWidth
  this.height = options.height || 120
  this.padding = options.padding || 0

  this.create()
}

Pack.prototype.append = function (images) {
  var fragment

  if (images instanceof DocumentFragment) {
    fragment = images
    images = slice(fragment.childNodes)
  } else {
    fragment = document.createDocumentFragment()
    images = slice(images)
    images.forEach(function (image) {
      if (image.parentNode)
        image.parentNode.removeChild(image)

      fragment.appendChild(image)
    })
  }

  var subpack = new Pack(fragment, {
    top: this.totalheight + this.padding,
    width: this.width,
    height: this.height,
    padding: this.padding
  })

  this.totalheight = subpack.totalheight
  this.images = this.images.concat(images.filter(isElement))
  this.mirror = this.mirror.concat(subpack.mirror)

  var container = this.container
  container.appendChild(fragment)
  container.style.height = this.totalheight + 'px'
}

Pack.prototype.destroy = function () {
  this.images.forEach(unsetStyle)
  this.mirror = null

  if (this.isFragment)
    return

  var style = this.container.style
  style.visibility =
  style.height = ''
  this.classes.remove('hgp')
}

Pack.prototype.reload = function () {
  this.container.style.visibility = 'hidden'
  this.create()
}

Pack.prototype.create = function () {
  var index = 0
  var ratios = this.calculateAspectRatios()
  var container = this.container
  var mirrors = this.mirror = []

  part(ratios, Math.max(Math.min(
    Math.floor(ratios.reduce(add, 0) * this.height / this.width),
    ratios.length
  ), 1)).forEach(function (x) {
    index += this.createRow(index, x.length)
  }, this)

  var lastmirror = mirrors[mirrors.length - 1]
  this.totalheight = lastmirror.top + lastmirror.height
  this.images.forEach(positionAbsolute)

  if (this.isFragment)
    return

  this.classes.add('hgp')

  var style = container.style
  style.height = this.totalheight + 'px'
  style.visibility = 'visible'
}

Pack.prototype.createRow = function (index, count) {
  var mirror = this.mirror
  var padding = this.padding
  var images = this.images.slice(index, index + count)
  var height = this.calculateRowHeight(images)

  var row = {
    index: index,
    count: count,
    height: height
  }

  var imagemirrors = row.images = []
  var lastrow = mirror[mirror.length - 1]
  var top = row.top = lastrow
    ? (lastrow.top + lastrow.height + padding)
    : (this.top || 0)

  images.forEach(function (image, i) {
    var lastimage = i && imagemirrors[i - 1]
    var left = lastimage
      ? lastimage.right + padding
      : 0
    var width = Math.round(height * image.aspectRatio)

    var style = image.style
    style.left = left + 'px'
    style.top = top + 'px'
    style.height = height + 'px'
    style.width = width + 'px'

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

Pack.prototype.calculateRowHeight = function (images) {
  return Math.ceil(
    (this.width - (this.padding * (images.length - 1))) /
    images.map(getAspectRatio).reduce(add, 0)
  )
}

Pack.prototype.calculateAspectRatios = function () {
  return this.images.map(calculateAspectRatio)
}

function positionAbsolute(image) {
  image.style.position = 'absolute'
}

function unsetStyle(image) {
  var style = image.style
  style.width =
  style.height =
  style.top =
  style.left =
  style.position = ''
}

function calculateAspectRatio(image) {
  return image.aspectRatio || (image.aspectRatio =
    parseFloat(image.getAttribute('data-aspect-ratio')) ||
    parseInt(image.getAttribute('data-width'), 10) /
    parseInt(image.getAttribute('data-height'), 10)
  )
}

function getAspectRatio(x) {
  return x.aspectRatio
}

function slice(x) {
  return [].slice.call(x, 0)
}

function add(a, b) {
  return a + b
}

function isElement(el) {
  return el.nodeType && el.nodeType === Node.ELEMENT_NODE
}
