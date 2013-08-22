
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("jonathanong-linear-partition/linear_partition.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.3
var linear_partition, min;

min = function(arr) {
  var computed, result, x, _i, _len;
  for (_i = 0, _len = arr.length; _i < _len; _i++) {
    x = arr[_i];
    computed = x[0];
    if (!result || computed < result.computed) {
      result = {
        value: x,
        computed: computed
      };
    }
  }
  return result.value;
};

linear_partition = function(seq, k) {
  var ans, i, j, m, n, solution, table, x, y, _i, _j, _k, _l;
  n = seq.length;
  if (k <= 0) {
    return [];
  }
  if (k > n) {
    return seq.map(function(x) {
      return [x];
    });
  }
  table = (function() {
    var _i, _results;
    _results = [];
    for (y = _i = 0; 0 <= n ? _i < n : _i > n; y = 0 <= n ? ++_i : --_i) {
      _results.push((function() {
        var _j, _results1;
        _results1 = [];
        for (x = _j = 0; 0 <= k ? _j < k : _j > k; x = 0 <= k ? ++_j : --_j) {
          _results1.push(0);
        }
        return _results1;
      })());
    }
    return _results;
  })();
  solution = (function() {
    var _i, _ref, _results;
    _results = [];
    for (y = _i = 0, _ref = n - 1; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (x = _j = 0, _ref1 = k - 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
          _results1.push(0);
        }
        return _results1;
      })());
    }
    return _results;
  })();
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    table[i][0] = seq[i] + (i ? table[i - 1][0] : 0);
  }
  for (j = _j = 0; 0 <= k ? _j < k : _j > k; j = 0 <= k ? ++_j : --_j) {
    table[0][j] = seq[0];
  }
  for (i = _k = 1; 1 <= n ? _k < n : _k > n; i = 1 <= n ? ++_k : --_k) {
    for (j = _l = 1; 1 <= k ? _l < k : _l > k; j = 1 <= k ? ++_l : --_l) {
      m = min((function() {
        var _m, _results;
        _results = [];
        for (x = _m = 0; 0 <= i ? _m < i : _m > i; x = 0 <= i ? ++_m : --_m) {
          _results.push([Math.max(table[x][j - 1], table[i][0] - table[x][0]), x]);
        }
        return _results;
      })());
      table[i][j] = m[0];
      solution[i - 1][j - 1] = m[1];
    }
  }
  n = n - 1;
  k = k - 2;
  ans = [];
  while (k >= 0) {
    ans = [
      (function() {
        var _m, _ref, _ref1, _results;
        _results = [];
        for (i = _m = _ref = solution[n - 1][k] + 1, _ref1 = n + 1; _ref <= _ref1 ? _m < _ref1 : _m > _ref1; i = _ref <= _ref1 ? ++_m : --_m) {
          _results.push(seq[i]);
        }
        return _results;
      })()
    ].concat(ans);
    n = solution[n - 1][k];
    k = k - 1;
  }
  return [
    (function() {
      var _m, _ref, _results;
      _results = [];
      for (i = _m = 0, _ref = n + 1; 0 <= _ref ? _m < _ref : _m > _ref; i = 0 <= _ref ? ++_m : --_m) {
        _results.push(seq[i]);
      }
      return _results;
    })()
  ].concat(ans);
};

module.exports = function(seq, k) {
  if (k <= 0) {
    return [];
  }
  while (k) {
    try {
      return linear_partition(seq, k--);
    } catch (_error) {}
  }
};

});
require.register("horizontal-grid-packing/lib/pack.js", function(exports, require, module){
var part = require('linear-partition')
var classes = require('classes')

module.exports = Pack

function Pack(container, options) {
  if (!(this instanceof Pack))
    return new Pack(container, options)

  options = options || {}

  this.container = container
  this.isFragment = container instanceof DocumentFragment
  this.classes = !this.isFragment && classes(container)
  this.images = slice(container.childNodes)
  this.top = options.top || 0
  this.width = options.width || container.clientWidth
  this.height = options.height || Math.round(window.innerHeight / Math.PI)
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
  this.images = this.images.concat(images)

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
});


require.alias("component-classes/index.js", "horizontal-grid-packing/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("jonathanong-linear-partition/linear_partition.js", "horizontal-grid-packing/deps/linear-partition/linear_partition.js");
require.alias("jonathanong-linear-partition/linear_partition.js", "horizontal-grid-packing/deps/linear-partition/index.js");
require.alias("jonathanong-linear-partition/linear_partition.js", "linear-partition/index.js");
require.alias("jonathanong-linear-partition/linear_partition.js", "jonathanong-linear-partition/index.js");
require.alias("horizontal-grid-packing/lib/pack.js", "horizontal-grid-packing/index.js");