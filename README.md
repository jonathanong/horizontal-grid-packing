# Horizontal grid packing

Packs grids into rows so that each row expands to the full container width.
Row heights are dynamically adjusted.
Similar to [Masonry](https://github.com/desandro/masonry), but the space taken by all the grids will always be a rectangle without any jagged edges.
By being horizontal, users view the grid linearly (scan left to right, top to bottom) kind of like a comic book.

Demo: http://jonathanong.github.io/horizontal-grid-packing/

See:

- https://github.com/jonathanong/linear-partition
- https://news.ycombinator.com/item?id=6198400
- http://www.crispymtn.com/stories/the-algorithm-for-a-perfectly-balanced-photo-gallery

## Install

This package is written in vanilla Javascript (specifically without jQuery).
If you use [component](https://github.com/component/component‎), the dependencies are handled for you.
If you use [bower](https://github.com/bower/bower‎), the dependencies are packaged together.

```bash
bower install jonathanong/horizontal-grid-packing
component install jonathanong/horizontal-grid-packing
```

## API

### Layout

The HTML must strictly be a single container whose children are strictly grid elements.

```html
<div>
  <img data-width="100" data-height="320">
  <div data-aspect-ratio=".55"></div>
  <element></element>
  <element></element>
</div>
```

This library assumes you know the aspect ratio of each grid element.
Each element should either have a `data-aspect-ratio` attribute or `data-width` and `data-height` attributes.
If you do not know these attributes, use a library such as [imagesloaded](https://github.com/desandro/imagesloaded) to calculate the dimensions before using this library.

### Pack(container, options)

Returns a new instance of `Pack`.

```js
var pack = new Pack(container, options)
```

`new` is optional.
`container` is the element that contains all the grids.
The `options` are:

- `height` - Target row height in pixels.
  `Math.round(window.innerHeight / Math.PI)` by default.
- `padding` - Padding between each grid in pixels.
  `0` by default.

Each of these options can be changed as an attribute of `pack`:

```js
// Change the target height
pack.height = Math.round(window.innerHeight / 5)
// Change the padding
pack.padding = 5
// Recalculate the grid
pack.reload()
```

Other options you may be interested are:

- `width` - the width of the grid in pixels.
  You should change this when `container`'s width changes.

### pack.reload()

Recalculates the grid.
Specifically, you would want to use this when `container` is resized:

```js
window.addEventListener('resize', function () {
  pack.width = container.clientWidth
  pack.height = Math.round(window.innerHeight / Math.PI)
  pack.reload()
})
```

### pack.destroy()

Destroys the grid and returns the container to the original state.

### pack.create()

Creates the grid.
This is called by default.
You should only use this if the grid has been previously destroyed.

### pack.append(DocumentFragment || elements)

Append elements to the current grid.
Could either be a `DocumentFragment` instance whose child nodes are `elements`,
or an array-like variable of grid `elements`.
Appends using `DocumentFragment`, so don't worry about reflows.

## Compatibility

IE9+

## License

The MIT License (MIT)

Copyright (c) 2013 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
