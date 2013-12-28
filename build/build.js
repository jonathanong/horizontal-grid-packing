
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
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
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
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("math-utils-linear-partitioning/linear-partitioning.js", Function("exports, require, module",
"\n\
// Explanation: http://www8.cs.umu.se/kurser/TDBAfl/VT06/algorithms/BOOK/BOOK2/NODE45.HTM\n\
\n\
// Partition seq into k buckets\n\
\n\
\n\
var partition = function (seq, k) {\n\
\n\
\tif (k === 0) return [];\n\
\tif (k === 1) return [seq];\n\
\n\
\tif (k >= seq.length) {\n\
\t\t// return the lists of each single element in sequence, plus empty lists for any extra buckets.\n\
\t\tvar repeated =  [];\n\
\t\tfor (var q = 0; q < k - seq.length; ++q) repeated.push([]);\n\
\t\treturn seq.map(function(x) { return [x]; }).concat(repeated);\n\
\t}\n\
\n\
\tvar sequence = seq.slice(0);\n\
\tvar dividers = [];\n\
\tvar sums = prefix_sums(sequence, k);\n\
\tvar conds = boundary_conditions(sequence, k, sums);\n\
\n\
\t// evaluate main recurrence\n\
\tfor(var i = 2; i <= sequence.length; ++i) {\n\
\t\tfor(var j = 2; j <= k; ++j) {\n\
\n\
\t\t\tconds[i][j] = undefined;\n\
\n\
\t\t\tfor(var x = 1; x < i; ++x) {\n\
\n\
\t\t\t\tvar s = Math.max(conds[x][j-1], sums[i] - sums[x]);\n\
\t\t\t\tdividers[i] = dividers[i] || []; // Initialize a new row in the dividers matrix (unless it's already initialized).\n\
\n\
\t\t\t\t// Continue to find the cost of the largest range in the optimal partition.\n\
\t\t\t\tif (conds[i][j] === undefined || conds[i][j] > s) {\n\
\t\t\t\t\tconds[i][j] = s;\n\
\t\t\t\t\tdividers[i][j] = x;\n\
\t\t\t\t}\n\
\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\treturn(reconstruct_partition(sequence, dividers, k));\n\
};\n\
\n\
/* Work our way back up through the dividers, referencing each divider that we\n\
 * saved given a value for k and a length of seq, using each divider to make\n\
 * the partitions. */\n\
var reconstruct_partition = function(seq, dividers, k) {\n\
\tvar partitions = [];\n\
\n\
\twhile (k > 1) {\n\
\t\tif (dividers[seq.length]) { \n\
\t\t\tvar divider = dividers[seq.length][k];\n\
\t\t\tvar part = seq.splice(divider);\n\
\t\t\tpartitions.unshift(part);\n\
\t\t}\n\
\t\t--k;\n\
\t}\n\
\n\
\tpartitions.unshift(seq);\n\
\n\
\treturn partitions;\n\
};\n\
\n\
/*\n\
Given a list of numbers of length n, loop through it with index 'i'\n\
Make each element the sum of all the numbers from 0...i\n\
For example, given [1,2,3,4,5]\n\
The prefix sums are [1,3,6,10,15]\n\
*/\n\
var prefix_sums = function(seq, k) {\n\
\n\
\tvar sums = [0];\n\
\n\
\tfor(var i = 1; i <= seq.length; ++i) {\n\
\t\tsums[i] = sums[i - 1] + seq[i - 1];\n\
\t}\n\
\n\
\treturn sums;\n\
};\n\
\n\
/* This matrix holds the maximum sums over all the ranges given the length of\n\
 * seq and the number of buckets (k) */\n\
var boundary_conditions = function(seq, k, sums) {\n\
\tvar conds = [];\n\
\n\
\tfor(var i = 1; i <= seq.length; ++i) {\n\
\t\tconds[i] = [];\n\
\t\tconds[i][1] = sums[i];\n\
\t}\n\
\n\
\tfor(var j = 1; j <= k; ++j) {\n\
\t\tconds[1][j] = seq[0];\n\
\t}\n\
\n\
\treturn conds;\n\
};\n\
\n\
module.exports = partition;\n\
//@ sourceURL=math-utils-linear-partitioning/linear-partitioning.js"
));
require.register("component-raf/index.js", Function("exports, require, module",
"/**\n\
 * Expose `requestAnimationFrame()`.\n\
 */\n\
\n\
exports = module.exports = window.requestAnimationFrame\n\
  || window.webkitRequestAnimationFrame\n\
  || window.mozRequestAnimationFrame\n\
  || window.oRequestAnimationFrame\n\
  || window.msRequestAnimationFrame\n\
  || fallback;\n\
\n\
/**\n\
 * Fallback implementation.\n\
 */\n\
\n\
var prev = new Date().getTime();\n\
function fallback(fn) {\n\
  var curr = new Date().getTime();\n\
  var ms = Math.max(0, 16 - (curr - prev));\n\
  var req = setTimeout(fn, ms);\n\
  prev = curr;\n\
  return req;\n\
}\n\
\n\
/**\n\
 * Cancel.\n\
 */\n\
\n\
var cancel = window.cancelAnimationFrame\n\
  || window.webkitCancelAnimationFrame\n\
  || window.mozCancelAnimationFrame\n\
  || window.oCancelAnimationFrame\n\
  || window.msCancelAnimationFrame\n\
  || window.clearTimeout;\n\
\n\
exports.cancel = function(id){\n\
  cancel.call(window, id);\n\
};\n\
//@ sourceURL=component-raf/index.js"
));
require.register("horizontal-grid-packing/lib/pack.js", Function("exports, require, module",
"var part = require('linear-partitioning')\n\
var classes = require('classes')\n\
\n\
module.exports = Pack\n\
\n\
function Pack(container, options) {\n\
  if (!(this instanceof Pack))\n\
    return new Pack(container, options)\n\
\n\
  options = options || {}\n\
\n\
  this.container = container\n\
  this.isFragment = container instanceof DocumentFragment\n\
  this.classes = !this.isFragment && classes(container)\n\
  this.images = slice(container.childNodes)\n\
  this.top = options.top || 0\n\
  this.width = options.width || container.clientWidth\n\
  this.height = options.height\n\
    || Math.max(Math.round(window.outerHeight / Math.PI), 120)\n\
  this.padding = options.padding || 0\n\
\n\
  this.create()\n\
}\n\
\n\
Pack.prototype.append = function (images) {\n\
  var fragment\n\
\n\
  if (images instanceof DocumentFragment) {\n\
    fragment = images\n\
    images = slice(fragment.childNodes)\n\
  } else {\n\
    fragment = document.createDocumentFragment()\n\
    images = slice(images)\n\
    images.forEach(function (image) {\n\
      if (image.parentNode)\n\
        image.parentNode.removeChild(image)\n\
\n\
      fragment.appendChild(image)\n\
    })\n\
  }\n\
\n\
  var subpack = new Pack(fragment, {\n\
    top: this.totalheight + this.padding,\n\
    width: this.width,\n\
    height: this.height,\n\
    padding: this.padding\n\
  })\n\
\n\
  this.totalheight = subpack.totalheight\n\
  this.images = this.images.concat(images)\n\
  this.mirror = this.mirror.concat(subpack.mirror)\n\
\n\
  var container = this.container\n\
  container.appendChild(fragment)\n\
  container.style.height = this.totalheight + 'px'\n\
}\n\
\n\
Pack.prototype.destroy = function () {\n\
  this.images.forEach(unsetStyle)\n\
  this.mirror = null\n\
\n\
  if (this.isFragment)\n\
    return\n\
\n\
  var style = this.container.style\n\
  style.visibility =\n\
  style.height = ''\n\
  this.classes.remove('hgp')\n\
}\n\
\n\
Pack.prototype.reload = function () {\n\
  this.container.style.visibility = 'hidden'\n\
  this.create()\n\
}\n\
\n\
Pack.prototype.create = function () {\n\
  var index = 0\n\
  var ratios = this.calculateAspectRatios()\n\
  var container = this.container\n\
  var mirrors = this.mirror = []\n\
\n\
  part(ratios, Math.max(Math.min(\n\
    Math.floor(ratios.reduce(add, 0) * this.height / this.width),\n\
    ratios.length\n\
  ), 1)).forEach(function (x) {\n\
    index += this.createRow(index, x.length)\n\
  }, this)\n\
\n\
  var lastmirror = mirrors[mirrors.length - 1]\n\
  this.totalheight = lastmirror.top + lastmirror.height\n\
  this.images.forEach(positionAbsolute)\n\
\n\
  if (this.isFragment)\n\
    return\n\
\n\
  this.classes.add('hgp')\n\
\n\
  var style = container.style\n\
  style.height = this.totalheight + 'px'\n\
  style.visibility = 'visible'\n\
}\n\
\n\
Pack.prototype.createRow = function (index, count) {\n\
  var mirror = this.mirror\n\
  var padding = this.padding\n\
  var images = this.images.slice(index, index + count)\n\
  var height = this.calculateRowHeight(images)\n\
\n\
  var row = {\n\
    index: index,\n\
    count: count,\n\
    height: height\n\
  }\n\
\n\
  var imagemirrors = row.images = []\n\
  var lastrow = mirror[mirror.length - 1]\n\
  var top = row.top = lastrow\n\
    ? (lastrow.top + lastrow.height + padding)\n\
    : (this.top || 0)\n\
\n\
  images.forEach(function (image, i) {\n\
    var lastimage = i && imagemirrors[i - 1]\n\
    var left = lastimage\n\
      ? lastimage.right + padding\n\
      : 0\n\
    var width = Math.round(height * image.aspectRatio)\n\
\n\
    var style = image.style\n\
    style.left = left + 'px'\n\
    style.top = top + 'px'\n\
    style.height = height + 'px'\n\
    style.width = width + 'px'\n\
\n\
    imagemirrors.push({\n\
      left: left,\n\
      width: width,\n\
      right: left + width,\n\
      image: image\n\
    })\n\
  })\n\
\n\
  mirror.push(row)\n\
\n\
  return count\n\
}\n\
\n\
Pack.prototype.calculateRowHeight = function (images) {\n\
  return Math.ceil(\n\
    (this.width - (this.padding * (images.length - 1))) /\n\
    images.map(getAspectRatio).reduce(add, 0)\n\
  )\n\
}\n\
\n\
Pack.prototype.calculateAspectRatios = function () {\n\
  return this.images.map(calculateAspectRatio)\n\
}\n\
\n\
function positionAbsolute(image) {\n\
  image.style.position = 'absolute'\n\
}\n\
\n\
function unsetStyle(image) {\n\
  var style = image.style\n\
  style.width =\n\
  style.height =\n\
  style.top =\n\
  style.left =\n\
  style.position = ''\n\
}\n\
\n\
function calculateAspectRatio(image) {\n\
  return image.aspectRatio || (image.aspectRatio =\n\
    parseFloat(image.getAttribute('data-aspect-ratio')) ||\n\
    parseInt(image.getAttribute('data-width'), 10) /\n\
    parseInt(image.getAttribute('data-height'), 10)\n\
  )\n\
}\n\
\n\
function getAspectRatio(x) {\n\
  return x.aspectRatio\n\
}\n\
\n\
function slice(x) {\n\
  return [].slice.call(x, 0)\n\
}\n\
\n\
function add(a, b) {\n\
  return a + b\n\
}//@ sourceURL=horizontal-grid-packing/lib/pack.js"
));






require.alias("component-classes/index.js", "horizontal-grid-packing/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("math-utils-linear-partitioning/linear-partitioning.js", "horizontal-grid-packing/deps/linear-partitioning/linear-partitioning.js");
require.alias("math-utils-linear-partitioning/linear-partitioning.js", "horizontal-grid-packing/deps/linear-partitioning/index.js");
require.alias("math-utils-linear-partitioning/linear-partitioning.js", "linear-partitioning/index.js");
require.alias("math-utils-linear-partitioning/linear-partitioning.js", "math-utils-linear-partitioning/index.js");
require.alias("component-raf/index.js", "horizontal-grid-packing/deps/raf/index.js");
require.alias("component-raf/index.js", "raf/index.js");

require.alias("horizontal-grid-packing/lib/pack.js", "horizontal-grid-packing/index.js");