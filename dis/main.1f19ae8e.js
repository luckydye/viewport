// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../src/Config.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Config =
/*#__PURE__*/
function () {
  _createClass(Config, [{
    key: "getValue",
    value: function getValue(name, fallback) {
      if (!(name in this)) {
        this.define(name, fallback);
      }

      this.load();
      return this[name].value;
    }
  }, {
    key: "setValue",
    value: function setValue(name, value) {
      if (!this[name]) this.define(name, value);
      this[name].value = value;
      this.save();
    }
  }, {
    key: "define",
    value: function define(name, defaultValue, value) {
      this[name] = new ConfigParameter(name, defaultValue, value);
    }
  }], [{
    key: "global",
    get: function get() {
      return gloalconfig;
    }
  }]);

  function Config(name) {
    _classCallCheck(this, Config);

    this.name = name;
  }

  _createClass(Config, [{
    key: "save",
    value: function save() {
      var save = localStorage.getItem(this.name);
      var data = JSON.parse(save) || {};

      for (var key in this) {
        var value = this[key].value;
        if (value != null) data[key] = value;
      }

      localStorage.setItem(this.name, JSON.stringify(data));
    }
  }, {
    key: "load",
    value: function load() {
      var save = localStorage.getItem(this.name);
      var data = JSON.parse(save);

      for (var key in data) {
        if (key in this) {
          this[key].value = data[key];
        }
      }
    }
  }]);

  return Config;
}();

exports.default = Config;

var ConfigParameter = function ConfigParameter(name, defaultValue, value) {
  _classCallCheck(this, ConfigParameter);

  this.name = name;
  this.default = defaultValue;
  this.value = value || this.default;
};

var gloalconfig = new Config('viewport-config');
},{}],"../../src/Scheduler.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = exports.Scheduler = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Scheduler =
/*#__PURE__*/
function () {
  _createClass(Scheduler, null, [{
    key: "timer",
    value: function timer(_timer, callback) {
      var accumulator = 0;
      return function (deltaTime) {
        accumulator += deltaTime;

        if (accumulator >= _timer) {
          callback(accumulator);
          accumulator = 0;
        }
      };
    }
  }]);

  function Scheduler() {
    _classCallCheck(this, Scheduler);

    this.queue = [];
  }

  _createClass(Scheduler, [{
    key: "addTask",
    value: function addTask(task) {
      if (task instanceof Task) {
        this.queue.push(task);
      }
    }
  }, {
    key: "removeTask",
    value: function removeTask(task) {
      var index = this.queue.indexOf(task);

      if (index != -1) {
        this.queue.splice(index, 1);
      }
    }
  }, {
    key: "requestTask",
    value: function requestTask() {
      if (this.queue.length > 0) {
        var task = this.queue[0];
        return task;
      }

      return null;
    }
  }, {
    key: "run",
    value: function run(deltaTime) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.queue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var task = _step.value;
          var done = task.execute(deltaTime);
          if (done) this.removeTask(task);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return Scheduler;
}();

exports.Scheduler = Scheduler;

var Task =
/*#__PURE__*/
function () {
  function Task(taskFunction) {
    _classCallCheck(this, Task);

    _defineProperty(this, "taskFunction", function () {
      return true;
    });

    this.taskFunction = taskFunction;
  }

  _createClass(Task, [{
    key: "execute",
    value: function execute(ms) {
      return this.taskFunction(ms);
    }
  }]);

  return Task;
}();

exports.Task = Task;
},{}],"../../src/materials/Texture.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Texture = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Texture =
/*#__PURE__*/
function () {
  _createClass(Texture, [{
    key: "width",
    get: function get() {
      return this.image.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.image.height;
    }
  }]);

  function Texture(image) {
    _classCallCheck(this, Texture);

    _defineProperty(this, "type", "TEXTURE_2D");

    _defineProperty(this, "gltexture", null);

    _defineProperty(this, "animated", false);

    this.image = image;
    this.animated = image && image.localName === "video" || this.animated;
  }

  return Texture;
}();

exports.Texture = Texture;
},{}],"../../src/materials/Material.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Material = void 0;

var _Texture = require("./Texture");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Material =
/*#__PURE__*/
function () {
  _createClass(Material, null, [{
    key: "applyAttributes",
    value: function applyAttributes(material, attributes) {
      return Object.assign(material, attributes);
    }
  }]);

  function Material() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Material);

    _defineProperty(this, "texture", new _Texture.Texture());

    _defineProperty(this, "specularMap", new _Texture.Texture());

    _defineProperty(this, "displacementMap", new _Texture.Texture());

    _defineProperty(this, "normalMap", new _Texture.Texture());

    _defineProperty(this, "diffuseColor", [1, 1, 1]);

    _defineProperty(this, "transparency", 0);

    _defineProperty(this, "specular", 1);

    _defineProperty(this, "roughness", 1);

    _defineProperty(this, "metallic", 0);

    _defineProperty(this, "textureScale", 1);

    _defineProperty(this, "receiveShadows", true);

    _defineProperty(this, "castShadows", true);

    _defineProperty(this, "scaleUniform", false);

    for (var attrb in attributes) {
      this[attrb] = attributes[attrb];
    }
  }

  return Material;
}();

exports.Material = Material;
},{"./Texture":"../../src/materials/Texture.js"}],"../../src/resources/File.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var File =
/*#__PURE__*/
function () {
  function File() {
    _classCallCheck(this, File);

    _defineProperty(this, "vertecies", []);

    _defineProperty(this, "uvs", []);

    _defineProperty(this, "faces", []);

    _defineProperty(this, "normals", []);
  }

  _createClass(File, null, [{
    key: "parseFile",
    value: function parseFile(strData) {
      var fileData = new File();
      return fileData;
    }
  }]);

  return File;
}();

exports.default = File;
},{}],"../../src/resources/OBJFile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _File2 = _interopRequireDefault(require("./File"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var OBJFile =
/*#__PURE__*/
function (_File) {
  _inherits(OBJFile, _File);

  function OBJFile() {
    _classCallCheck(this, OBJFile);

    return _possibleConstructorReturn(this, _getPrototypeOf(OBJFile).apply(this, arguments));
  }

  _createClass(OBJFile, null, [{
    key: "parseFile",
    value: function parseFile(strData) {
      var lines = strData.split(/\n/g);
      var objData = new OBJFile();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var line = _step.value;
          var data = line.split(" ");
          var prefix = data[0];
          var coords = [];

          switch (prefix) {
            case "v":
              coords = data.slice(1);
              objData.vertecies.push([+coords[0], +coords[1], +coords[2]]);
              break;

            case "vt":
              coords = data.slice(1);
              objData.uvs.push([+coords[0], +coords[1]]);
              break;

            case "vn":
              coords = data.slice(1);
              objData.normals.push([+coords[0], +coords[1], +coords[2]]);
              break;

            case "f":
              coords = data.slice(1);
              var face = [];
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = coords[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var c = _step2.value;
                  face.push(c.split('/').map(function (i) {
                    return parseInt(i);
                  }));
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              objData.faces.push(face);
              break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return objData;
    }
  }]);

  return OBJFile;
}(_File2.default);

exports.default = OBJFile;
},{"./File":"../../src/resources/File.js"}],"../../src/Resources.js":[function(require,module,exports) {

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Resources = void 0;

var _OBJFile = _interopRequireDefault(require("./resources/OBJFile.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var global = {};
global.initLoaded = false;
global.resourceTypes = {
  JSON: [".json"],
  TEXT: [".txt"],
  IMAGE: [".png", ".jpg"],
  VIDEO: [".mp4"],
  SHADER: [".shader", ".fs", ".vs"],
  GEOMETRY: [".obj"]
};
global.queue = new Set();
global.map = new Map();
/*
	Resource.add({ name, path }: arr, startLoading: bool): startLoading ? Promise : null
		# add resource to queue

	Resource.load(): Promise
		# initiate loading of queue

	Resource.map(void)
		# return resource map

	Resource.get(name: str)
		# return resource data by name

	Resource.finished: bool
		# returns if queue is finished
*/

var Resources =
/*#__PURE__*/
function () {
  function Resources() {
    _classCallCheck(this, Resources);
  }

  _createClass(Resources, null, [{
    key: "add",
    value: function add(obj, startLoad) {
      for (var key in obj) {
        global.queue.add({
          name: key,
          path: obj[key]
        });
      }

      if (startLoad === true) {
        return Resources.load();
      }
    }
  }, {
    key: "map",
    value: function map() {
      return global.map;
    }
  }, {
    key: "get",
    value: function get(name) {
      return global.map.get(name);
    }
  }, {
    key: "load",
    value: function load() {
      var loads = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var res = _step.value;

          var loading = Resources._fetch(res.path).then(function (dataObj) {
            var resource = res;
            global.map.set(resource.name, dataObj);
          });

          loads.push(loading);
        };

        for (var _iterator = global.queue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return Promise.all(loads).then(function () {
        global.queue.clear();

        if (!global.initLoaded && Resources.finished) {
          global.initLoaded = true;
        }
      });
    }
  }, {
    key: "_fetch",
    value: function _fetch(path) {
      var type = null;

      for (var t in Resources.Types) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Resources.Types[t][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var ending = _step2.value;

            if (path.match(ending)) {
              type = Resources.Types[t];
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      switch (type) {
        case Resources.Types.JSON:
          return fetch(path).then(function (res) {
            return res.json().catch(function (err) {
              console.error("File failed parsing:", path);
            });
          });

        case Resources.Types.IMAGE:
          return new Promise(function (resolve, reject) {
            var img = new Image();

            img.onload = function () {
              resolve(img);
            };

            img.src = path;
          });

        case Resources.Types.VIDEO:
          return new Promise(function (resolve, reject) {
            var vid = document.createElement('video');

            vid.oncanplay = function () {
              vid.width = 1024;
              vid.height = 1024;
              vid.loop = true;
              vid.play();
              resolve(vid);
            };

            vid.src = path;
          });

        case Resources.Types.GEOMETRY:
          return fetch(path).then(function (res) {
            return res.text().then(function (strData) {
              return _OBJFile.default.parseFile(strData);
            });
          });

        case Resources.Types.TEXT:
          return fetch(path).then(function (res) {
            return res.text();
          });

        case Resources.Types.SHADER:
          return fetch(path).then(function (res) {
            return res.text();
          });

        default:
          throw "Err: not a valid resource type: \"".concat(path, "\"");
      }
    }
  }, {
    key: "Types",
    get: function get() {
      return global.resourceTypes;
    }
  }, {
    key: "finished",
    get: function get() {
      return global.queue.size === 0;
    }
  }]);

  return Resources;
}();

exports.Resources = Resources;
},{"./resources/OBJFile.js":"../../src/resources/OBJFile.js"}],"../../src/Logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var loggerListeners = new Map();

var Logger =
/*#__PURE__*/
function () {
  _createClass(Logger, null, [{
    key: "listen",
    value: function listen(name, f) {
      var listeners = loggerListeners.get(name);

      if (listeners) {
        listeners.push(f);
      }
    }
  }, {
    key: "dispatch",
    value: function dispatch(name, msg) {
      var listeners = loggerListeners.get(name);

      if (listeners) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listener = _step.value;
            listener(msg);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }]);

  function Logger(name) {
    _classCallCheck(this, Logger);

    this.prefix = name;
    loggerListeners.set(name, []);
    this.style = {
      prefix: "\n                background: #1c1c1c;\n                color: rgba(255, 255, 255, 0.65);\n                font-weight: 600;\n                padding: 2px 6px;\n                border-radius: 4px;\n                margin-right: 5px;\n            ",
      text: "\n                background: #333;\n                color: #eee;\n                padding: 2px 6px;\n            ",
      attr: "\n                background: #3f3f3f;\n                color: #eee;\n                padding: 2px 6px;\n                font-style: italic;\n            "
    };
  }

  _createClass(Logger, [{
    key: "out",
    value: function out(type, text, attr) {
      if (attr) {
        console[type]("%c".concat(this.prefix, "%c").concat(text, "%c").concat(attr), this.style.prefix, this.style.text, this.style.attr);
      } else {
        console[type]("%c".concat(this.prefix, "%c").concat(text), this.style.prefix, this.style.text);
      }

      Logger.dispatch(this.prefix, {
        style: this.style,
        prefix: this.prefix,
        text: text
      });
    }
  }, {
    key: "log",
    value: function log(text, attr) {
      this.out('info', text, attr);
    }
  }, {
    key: "error",
    value: function error(text, attr) {
      this.out('error', text, attr);
    }
  }]);

  return Logger;
}();

exports.Logger = Logger;
},{}],"../../src/materials/PrimitiveMaterial.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Material2 = require("./Material");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PrimitivetMaterial =
/*#__PURE__*/
function (_Material) {
  _inherits(PrimitivetMaterial, _Material);

  function PrimitivetMaterial() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, PrimitivetMaterial);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(PrimitivetMaterial)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "diffuseColor", [1, 1, 1]);

    _defineProperty(_assertThisInitialized(_this), "transparency", 0.5);

    _defineProperty(_assertThisInitialized(_this), "scaleUniform", true);

    _defineProperty(_assertThisInitialized(_this), "receiveShadows", false);

    _defineProperty(_assertThisInitialized(_this), "castShadows", false);

    _defineProperty(_assertThisInitialized(_this), "selected", false);

    return _this;
  }

  return PrimitivetMaterial;
}(_Material2.Material);

exports.default = PrimitivetMaterial;
},{"./Material":"../../src/materials/Material.js"}],"../../node_modules/gl-matrix/esm/common.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setMatrixArrayType = setMatrixArrayType;
exports.toRadian = toRadian;
exports.equals = equals;
exports.RANDOM = exports.ARRAY_TYPE = exports.EPSILON = void 0;

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
exports.EPSILON = EPSILON;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
exports.ARRAY_TYPE = ARRAY_TYPE;
var RANDOM = Math.random;
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */

exports.RANDOM = RANDOM;

function setMatrixArrayType(type) {
  exports.ARRAY_TYPE = ARRAY_TYPE = type;
}

var degree = Math.PI / 180;
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */

function toRadian(a) {
  return a * degree;
}
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */


function equals(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
},{}],"../../node_modules/gl-matrix/esm/mat2.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.copy = copy;
exports.identity = identity;
exports.fromValues = fromValues;
exports.set = set;
exports.transpose = transpose;
exports.invert = invert;
exports.adjoint = adjoint;
exports.determinant = determinant;
exports.multiply = multiply;
exports.rotate = rotate;
exports.scale = scale;
exports.fromRotation = fromRotation;
exports.fromScaling = fromScaling;
exports.str = str;
exports.frob = frob;
exports.LDU = LDU;
exports.add = add;
exports.subtract = subtract;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.multiplyScalar = multiplyScalar;
exports.multiplyScalarAndAdd = multiplyScalarAndAdd;
exports.sub = exports.mul = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 2x2 Matrix
 * @module mat2
 */

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(4);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */


function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */


function fromValues(m00, m01, m10, m11) {
  var out = new glMatrix.ARRAY_TYPE(4);
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */


function set(out, m00, m01, m10, m11) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */


function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache
  // some values
  if (out === a) {
    var a1 = a[1];
    out[1] = a[2];
    out[2] = a1;
  } else {
    out[0] = a[0];
    out[1] = a[2];
    out[2] = a[1];
    out[3] = a[3];
  }

  return out;
}
/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */


function invert(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3]; // Calculate the determinant

  var det = a0 * a3 - a2 * a1;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = a3 * det;
  out[1] = -a1 * det;
  out[2] = -a2 * det;
  out[3] = a0 * det;
  return out;
}
/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */


function adjoint(out, a) {
  // Caching this value is nessecary if out == a
  var a0 = a[0];
  out[0] = a[3];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a0;
  return out;
}
/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */


function determinant(a) {
  return a[0] * a[3] - a[2] * a[1];
}
/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */


function multiply(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  return out;
}
/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */


function rotate(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  return out;
}
/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/


function scale(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */


function fromRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2} out
 */


function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */


function str(a) {
  return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
}
/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */


function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
}
/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix
 * @param {mat2} D the diagonal matrix
 * @param {mat2} U the upper triangular matrix
 * @param {mat2} a the input matrix to factorize
 */


function LDU(L, D, U, a) {
  L[2] = a[2] / a[0];
  U[0] = a[0];
  U[1] = a[1];
  U[3] = a[3] - L[2] * U[1];
  return [L, D, U];
}
/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */


function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */


function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Alias for {@link mat2.multiply}
 * @function
 */


var mul = multiply;
/**
 * Alias for {@link mat2.subtract}
 * @function
 */

exports.mul = mul;
var sub = subtract;
exports.sub = sub;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/mat2d.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.copy = copy;
exports.identity = identity;
exports.fromValues = fromValues;
exports.set = set;
exports.invert = invert;
exports.determinant = determinant;
exports.multiply = multiply;
exports.rotate = rotate;
exports.scale = scale;
exports.translate = translate;
exports.fromRotation = fromRotation;
exports.fromScaling = fromScaling;
exports.fromTranslation = fromTranslation;
exports.str = str;
exports.frob = frob;
exports.add = add;
exports.subtract = subtract;
exports.multiplyScalar = multiplyScalar;
exports.multiplyScalarAndAdd = multiplyScalarAndAdd;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.sub = exports.mul = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 2x3 Matrix
 * @module mat2d
 *
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(6);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[4] = 0;
    out[5] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(6);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */


function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */


function fromValues(a, b, c, d, tx, ty) {
  var out = new glMatrix.ARRAY_TYPE(6);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */


function set(out, a, b, c, d, tx, ty) {
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */


function invert(out, a) {
  var aa = a[0],
      ab = a[1],
      ac = a[2],
      ad = a[3];
  var atx = a[4],
      aty = a[5];
  var det = aa * ad - ab * ac;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}
/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */


function determinant(a) {
  return a[0] * a[3] - a[1] * a[2];
}
/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */


function multiply(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  out[4] = a0 * b4 + a2 * b5 + a4;
  out[5] = a1 * b4 + a3 * b5 + a5;
  return out;
}
/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */


function rotate(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/


function scale(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/


function translate(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0;
  out[1] = a1;
  out[2] = a2;
  out[3] = a3;
  out[4] = a0 * v0 + a2 * v1 + a4;
  out[5] = a1 * v0 + a3 * v1 + a5;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */


function fromRotation(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2d} out
 */


function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat2d} out
 */


function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = v[0];
  out[5] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */


function str(a) {
  return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ')';
}
/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */


function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1);
}
/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */


function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  return out;
}
/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */


function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5));
}
/**
 * Alias for {@link mat2d.multiply}
 * @function
 */


var mul = multiply;
/**
 * Alias for {@link mat2d.subtract}
 * @function
 */

exports.mul = mul;
var sub = subtract;
exports.sub = sub;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/mat3.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.fromMat4 = fromMat4;
exports.clone = clone;
exports.copy = copy;
exports.fromValues = fromValues;
exports.set = set;
exports.identity = identity;
exports.transpose = transpose;
exports.invert = invert;
exports.adjoint = adjoint;
exports.determinant = determinant;
exports.multiply = multiply;
exports.translate = translate;
exports.rotate = rotate;
exports.scale = scale;
exports.fromTranslation = fromTranslation;
exports.fromRotation = fromRotation;
exports.fromScaling = fromScaling;
exports.fromMat2d = fromMat2d;
exports.fromQuat = fromQuat;
exports.normalFromMat4 = normalFromMat4;
exports.projection = projection;
exports.str = str;
exports.frob = frob;
exports.add = add;
exports.subtract = subtract;
exports.multiplyScalar = multiplyScalar;
exports.multiplyScalarAndAdd = multiplyScalarAndAdd;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.sub = exports.mul = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(9);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */


function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */


function fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new glMatrix.ARRAY_TYPE(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */


function set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */


function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */


function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out;
}
/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */


function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20; // Calculate the determinant

  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */


function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}
/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */


function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}
/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */


function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b00 = b[0],
      b01 = b[1],
      b02 = b[2];
  var b10 = b[3],
      b11 = b[4],
      b12 = b[5];
  var b20 = b[6],
      b21 = b[7],
      b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */


function translate(out, a, v) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      x = v[0],
      y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */


function rotate(out, a, rad) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}

;
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */


function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */


function fromRotation(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = -s;
  out[4] = c;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */


function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/


function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;
  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;
  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}
/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/


function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/


function normalFromMat4(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}
/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */


function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}
/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */


function str(a) {
  return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ')';
}
/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */


function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
}
/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */


function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}
/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */


function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7],
      a8 = a[8];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7],
      b8 = b[8];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
}
/**
 * Alias for {@link mat3.multiply}
 * @function
 */


var mul = multiply;
/**
 * Alias for {@link mat3.subtract}
 * @function
 */

exports.mul = mul;
var sub = subtract;
exports.sub = sub;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/mat4.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.copy = copy;
exports.fromValues = fromValues;
exports.set = set;
exports.identity = identity;
exports.transpose = transpose;
exports.invert = invert;
exports.adjoint = adjoint;
exports.determinant = determinant;
exports.multiply = multiply;
exports.translate = translate;
exports.scale = scale;
exports.rotate = rotate;
exports.rotateX = rotateX;
exports.rotateY = rotateY;
exports.rotateZ = rotateZ;
exports.fromTranslation = fromTranslation;
exports.fromScaling = fromScaling;
exports.fromRotation = fromRotation;
exports.fromXRotation = fromXRotation;
exports.fromYRotation = fromYRotation;
exports.fromZRotation = fromZRotation;
exports.fromRotationTranslation = fromRotationTranslation;
exports.fromQuat2 = fromQuat2;
exports.getTranslation = getTranslation;
exports.getScaling = getScaling;
exports.getRotation = getRotation;
exports.fromRotationTranslationScale = fromRotationTranslationScale;
exports.fromRotationTranslationScaleOrigin = fromRotationTranslationScaleOrigin;
exports.fromQuat = fromQuat;
exports.frustum = frustum;
exports.perspective = perspective;
exports.perspectiveFromFieldOfView = perspectiveFromFieldOfView;
exports.ortho = ortho;
exports.lookAt = lookAt;
exports.targetTo = targetTo;
exports.str = str;
exports.frob = frob;
exports.add = add;
exports.subtract = subtract;
exports.multiplyScalar = multiplyScalar;
exports.multiplyScalarAndAdd = multiplyScalarAndAdd;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.sub = exports.mul = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(16);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */


function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new glMatrix.ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */


function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */


function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */


function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */


function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */


function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */


function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */


function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */


function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/


function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */


function rotate(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < glMatrix.EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */


function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */


function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */


function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */


function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */


function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */


function fromRotation(out, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;

  if (len < glMatrix.EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c; // Perform rotation-specific matrix multiplication

  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */


function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */


function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */


function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */


function fromRotationTranslation(out, q, v) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {quat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */


function fromQuat2(out, a) {
  var translation = new glMatrix.ARRAY_TYPE(3);
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw; //Only scale if it makes sense

  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }

  fromRotationTranslation(out, a, translation);
  return out;
}
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */


function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */


function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */


function getRotation(out, mat) {
  // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  var trace = mat[0] + mat[5] + mat[10];
  var S = 0;

  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (mat[6] - mat[9]) / S;
    out[1] = (mat[8] - mat[2]) / S;
    out[2] = (mat[1] - mat[4]) / S;
  } else if (mat[0] > mat[5] && mat[0] > mat[10]) {
    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
    out[3] = (mat[6] - mat[9]) / S;
    out[0] = 0.25 * S;
    out[1] = (mat[1] + mat[4]) / S;
    out[2] = (mat[8] + mat[2]) / S;
  } else if (mat[5] > mat[10]) {
    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
    out[3] = (mat[8] - mat[2]) / S;
    out[0] = (mat[1] + mat[4]) / S;
    out[1] = 0.25 * S;
    out[2] = (mat[6] + mat[9]) / S;
  } else {
    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
    out[3] = (mat[1] - mat[4]) / S;
    out[0] = (mat[8] + mat[2]) / S;
    out[1] = (mat[6] + mat[9]) / S;
    out[2] = 0.25 * S;
  }

  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */


function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */


function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */


function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */


function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */


function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */


function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1.0;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = far * near / (near - far);
  out[15] = 0.0;
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */


function ortho(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */


function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (Math.abs(eyex - centerx) < glMatrix.EPSILON && Math.abs(eyey - centery) < glMatrix.EPSILON && Math.abs(eyez - centerz) < glMatrix.EPSILON) {
    return identity(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */


function targetTo(out, eye, target, up) {
  var eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];
  var z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  var x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}

;
/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str(a) {
  return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
}
/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */


function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
}
/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */


function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */


function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var a8 = a[8],
      a9 = a[9],
      a10 = a[10],
      a11 = a[11];
  var a12 = a[12],
      a13 = a[13],
      a14 = a[14],
      a15 = a[15];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  var b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  var b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11];
  var b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}
/**
 * Alias for {@link mat4.multiply}
 * @function
 */


var mul = multiply;
/**
 * Alias for {@link mat4.subtract}
 * @function
 */

exports.mul = mul;
var sub = subtract;
exports.sub = sub;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/vec3.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.length = length;
exports.fromValues = fromValues;
exports.copy = copy;
exports.set = set;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.divide = divide;
exports.ceil = ceil;
exports.floor = floor;
exports.min = min;
exports.max = max;
exports.round = round;
exports.scale = scale;
exports.scaleAndAdd = scaleAndAdd;
exports.distance = distance;
exports.squaredDistance = squaredDistance;
exports.squaredLength = squaredLength;
exports.negate = negate;
exports.inverse = inverse;
exports.normalize = normalize;
exports.dot = dot;
exports.cross = cross;
exports.lerp = lerp;
exports.hermite = hermite;
exports.bezier = bezier;
exports.random = random;
exports.transformMat4 = transformMat4;
exports.transformMat3 = transformMat3;
exports.transformQuat = transformQuat;
exports.rotateX = rotateX;
exports.rotateY = rotateY;
exports.rotateZ = rotateZ;
exports.angle = angle;
exports.zero = zero;
exports.str = str;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.forEach = exports.sqrLen = exports.len = exports.sqrDist = exports.dist = exports.div = exports.mul = exports.sub = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(3);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */


function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */


function fromValues(x, y, z) {
  var out = new glMatrix.ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */


function set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */


function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */


function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */


function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */


function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */


function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */


function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */


function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */


function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */


function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */


function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */


function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */


function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */


function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */


function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */


function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */


function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */


function random(out, scale) {
  scale = scale || 1.0;
  var r = glMatrix.RANDOM() * 2.0 * Math.PI;
  var z = glMatrix.RANDOM() * 2.0 - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */


function transformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */


function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */


function transformQuat(out, a, q) {
  // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];
  var x = a[0],
      y = a[1],
      z = a[2]; // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);

  var uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);

  var uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);

  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2; // vec3.scale(uuv, uuv, 2);

  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));

  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */


function rotateX(out, a, b, c) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0];
  r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
  r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */


function rotateY(out, a, b, c) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */


function rotateZ(out, a, b, c) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
  r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
  r[2] = p[2]; //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */


function angle(a, b) {
  var tempA = fromValues(a[0], a[1], a[2]);
  var tempB = fromValues(b[0], b[1], b[2]);
  normalize(tempA, tempA);
  normalize(tempB, tempB);
  var cosine = dot(tempA, tempB);

  if (cosine > 1.0) {
    return 0;
  } else if (cosine < -1.0) {
    return Math.PI;
  } else {
    return Math.acos(cosine);
  }
}
/**
 * Set the components of a vec3 to zero
 *
 * @param {vec3} out the receiving vector
 * @returns {vec3} out
 */


function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {vec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */


function str(a) {
  return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
}
/**
 * Alias for {@link vec3.subtract}
 * @function
 */


var sub = subtract;
/**
 * Alias for {@link vec3.multiply}
 * @function
 */

exports.sub = sub;
var mul = multiply;
/**
 * Alias for {@link vec3.divide}
 * @function
 */

exports.mul = mul;
var div = divide;
/**
 * Alias for {@link vec3.distance}
 * @function
 */

exports.div = div;
var dist = distance;
/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */

exports.dist = dist;
var sqrDist = squaredDistance;
/**
 * Alias for {@link vec3.length}
 * @function
 */

exports.sqrDist = sqrDist;
var len = length;
/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */

exports.len = len;
var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

exports.sqrLen = sqrLen;

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

exports.forEach = forEach;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/vec4.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.fromValues = fromValues;
exports.copy = copy;
exports.set = set;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.divide = divide;
exports.ceil = ceil;
exports.floor = floor;
exports.min = min;
exports.max = max;
exports.round = round;
exports.scale = scale;
exports.scaleAndAdd = scaleAndAdd;
exports.distance = distance;
exports.squaredDistance = squaredDistance;
exports.length = length;
exports.squaredLength = squaredLength;
exports.negate = negate;
exports.inverse = inverse;
exports.normalize = normalize;
exports.dot = dot;
exports.cross = cross;
exports.lerp = lerp;
exports.random = random;
exports.transformMat4 = transformMat4;
exports.transformQuat = transformQuat;
exports.zero = zero;
exports.str = str;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.forEach = exports.sqrLen = exports.len = exports.sqrDist = exports.dist = exports.div = exports.mul = exports.sub = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(4);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */


function fromValues(x, y, z, w) {
  var out = new glMatrix.ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */


function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */


function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}
/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */


function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}
/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to ceil
 * @returns {vec4} out
 */


function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}
/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to floor
 * @returns {vec4} out
 */


function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}
/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */


function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */


function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to round
 * @returns {vec4} out
 */


function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */


function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */


function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */


function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */


function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */


function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}
/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */


function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */


function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}
/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */


function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */


function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */


function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {vec4} result the receiving vector
 * @param {vec4} U the first vector
 * @param {vec4} V the second vector
 * @param {vec4} W the third vector
 * @returns {vec4} result
 */


function cross(out, u, v, w) {
  var A = v[0] * w[1] - v[1] * w[0],
      B = v[0] * w[2] - v[2] * w[0],
      C = v[0] * w[3] - v[3] * w[0],
      D = v[1] * w[2] - v[2] * w[1],
      E = v[1] * w[3] - v[3] * w[1],
      F = v[2] * w[3] - v[3] * w[2];
  var G = u[0];
  var H = u[1];
  var I = u[2];
  var J = u[3];
  out[0] = H * F - I * E + J * D;
  out[1] = -(G * F) + I * C - J * B;
  out[2] = G * E - H * C + J * A;
  out[3] = -(G * D) + H * B - I * A;
  return out;
}

;
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */

function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */


function random(out, scale) {
  scale = scale || 1.0; // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;

  var v1, v2, v3, v4;
  var s1, s2;

  do {
    v1 = glMatrix.RANDOM() * 2 - 1;
    v2 = glMatrix.RANDOM() * 2 - 1;
    s1 = v1 * v1 + v2 * v2;
  } while (s1 >= 1);

  do {
    v3 = glMatrix.RANDOM() * 2 - 1;
    v4 = glMatrix.RANDOM() * 2 - 1;
    s2 = v3 * v3 + v4 * v4;
  } while (s2 >= 1);

  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */


function transformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */


function transformQuat(out, a, q) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3]; // calculate quat * vec

  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to zero
 *
 * @param {vec4} out the receiving vector
 * @returns {vec4} out
 */


function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {vec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */


function str(a) {
  return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Alias for {@link vec4.subtract}
 * @function
 */


var sub = subtract;
/**
 * Alias for {@link vec4.multiply}
 * @function
 */

exports.sub = sub;
var mul = multiply;
/**
 * Alias for {@link vec4.divide}
 * @function
 */

exports.mul = mul;
var div = divide;
/**
 * Alias for {@link vec4.distance}
 * @function
 */

exports.div = div;
var dist = distance;
/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */

exports.dist = dist;
var sqrDist = squaredDistance;
/**
 * Alias for {@link vec4.length}
 * @function
 */

exports.sqrDist = sqrDist;
var len = length;
/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */

exports.len = len;
var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

exports.sqrLen = sqrLen;

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

exports.forEach = forEach;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/quat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.identity = identity;
exports.setAxisAngle = setAxisAngle;
exports.getAxisAngle = getAxisAngle;
exports.multiply = multiply;
exports.rotateX = rotateX;
exports.rotateY = rotateY;
exports.rotateZ = rotateZ;
exports.calculateW = calculateW;
exports.slerp = slerp;
exports.random = random;
exports.invert = invert;
exports.conjugate = conjugate;
exports.fromMat3 = fromMat3;
exports.fromEuler = fromEuler;
exports.str = str;
exports.setAxes = exports.sqlerp = exports.rotationTo = exports.equals = exports.exactEquals = exports.normalize = exports.sqrLen = exports.squaredLength = exports.len = exports.length = exports.lerp = exports.dot = exports.scale = exports.mul = exports.add = exports.set = exports.copy = exports.fromValues = exports.clone = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

var mat3 = _interopRequireWildcard(require("./mat3.js"));

var vec3 = _interopRequireWildcard(require("./vec3.js"));

var vec4 = _interopRequireWildcard(require("./vec4.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(4);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */


function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/


function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {quat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */


function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2.0;
  var s = Math.sin(rad / 2.0);

  if (s > glMatrix.EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    // If s is zero, return any axis (no rotation - axis does not matter)
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }

  return rad;
}
/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */


function multiply(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */


function rotateX(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */


function rotateY(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */


function rotateZ(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bz = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */


function calculateW(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */


function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > glMatrix.EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Generates a random quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */


function random(out) {
  // Implementation of http://planning.cs.uiuc.edu/node198.html
  // TODO: Calling random 3 times is probably not the fastest solution
  var u1 = glMatrix.RANDOM();
  var u2 = glMatrix.RANDOM();
  var u3 = glMatrix.RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
  return out;
}
/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */


function invert(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */


function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */


function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */


function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */


function str(a) {
  return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */


var clone = vec4.clone;
/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */

exports.clone = clone;
var fromValues = vec4.fromValues;
/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */

exports.fromValues = fromValues;
var copy = vec4.copy;
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */

exports.copy = copy;
var set = vec4.set;
/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */

exports.set = set;
var add = vec4.add;
/**
 * Alias for {@link quat.multiply}
 * @function
 */

exports.add = add;
var mul = multiply;
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */

exports.mul = mul;
var scale = vec4.scale;
/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

exports.scale = scale;
var dot = vec4.dot;
/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */

exports.dot = dot;
var lerp = vec4.lerp;
/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 */

exports.lerp = lerp;
var length = vec4.length;
/**
 * Alias for {@link quat.length}
 * @function
 */

exports.length = length;
var len = length;
/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

exports.len = len;
var squaredLength = vec4.squaredLength;
/**
 * Alias for {@link quat.squaredLength}
 * @function
 */

exports.squaredLength = squaredLength;
var sqrLen = squaredLength;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

exports.sqrLen = sqrLen;
var normalize = vec4.normalize;
/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat} a The first quaternion.
 * @param {quat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

exports.normalize = normalize;
var exactEquals = vec4.exactEquals;
/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {quat} a The first vector.
 * @param {quat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

exports.exactEquals = exactEquals;
var equals = vec4.equals;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */

exports.equals = equals;

var rotationTo = function () {
  var tmpvec3 = vec3.create();
  var xUnitVec3 = vec3.fromValues(1, 0, 0);
  var yUnitVec3 = vec3.fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot = vec3.dot(a, b);

    if (dot < -0.999999) {
      vec3.cross(tmpvec3, xUnitVec3, a);
      if (vec3.len(tmpvec3) < 0.000001) vec3.cross(tmpvec3, yUnitVec3, a);
      vec3.normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      vec3.cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */


exports.rotationTo = rotationTo;

var sqlerp = function () {
  var temp1 = create();
  var temp2 = create();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */


exports.sqlerp = sqlerp;

var setAxes = function () {
  var matr = mat3.create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize(out, fromMat3(out, matr));
  };
}();

exports.setAxes = setAxes;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js","./mat3.js":"../../node_modules/gl-matrix/esm/mat3.js","./vec3.js":"../../node_modules/gl-matrix/esm/vec3.js","./vec4.js":"../../node_modules/gl-matrix/esm/vec4.js"}],"../../node_modules/gl-matrix/esm/quat2.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.fromValues = fromValues;
exports.fromRotationTranslationValues = fromRotationTranslationValues;
exports.fromRotationTranslation = fromRotationTranslation;
exports.fromTranslation = fromTranslation;
exports.fromRotation = fromRotation;
exports.fromMat4 = fromMat4;
exports.copy = copy;
exports.identity = identity;
exports.set = set;
exports.getDual = getDual;
exports.setDual = setDual;
exports.getTranslation = getTranslation;
exports.translate = translate;
exports.rotateX = rotateX;
exports.rotateY = rotateY;
exports.rotateZ = rotateZ;
exports.rotateByQuatAppend = rotateByQuatAppend;
exports.rotateByQuatPrepend = rotateByQuatPrepend;
exports.rotateAroundAxis = rotateAroundAxis;
exports.add = add;
exports.multiply = multiply;
exports.scale = scale;
exports.lerp = lerp;
exports.invert = invert;
exports.conjugate = conjugate;
exports.normalize = normalize;
exports.str = str;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.sqrLen = exports.squaredLength = exports.len = exports.length = exports.dot = exports.mul = exports.setReal = exports.getReal = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

var quat = _interopRequireWildcard(require("./quat.js"));

var mat4 = _interopRequireWildcard(require("./mat4.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Dual Quaternion<br>
 * Format: [real, dual]<br>
 * Quaternion format: XYZW<br>
 * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
 * @module quat2
 */

/**
 * Creates a new identity dual quat
 *
 * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
 */
function create() {
  var dq = new glMatrix.ARRAY_TYPE(8);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }

  dq[3] = 1;
  return dq;
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat2} a dual quaternion to clone
 * @returns {quat2} new dual quaternion
 * @function
 */


function clone(a) {
  var dq = new glMatrix.ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}
/**
 * Creates a new dual quat initialized with the given values
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} new dual quaternion
 * @function
 */


function fromValues(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new glMatrix.ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}
/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component (translation)
 * @param {Number} y2 Y component (translation)
 * @param {Number} z2 Z component (translation)
 * @returns {quat2} new dual quaternion
 * @function
 */


function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new glMatrix.ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5,
      ay = y2 * 0.5,
      az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}
/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param {quat2} dual quaternion receiving operation result
 * @param {quat} q quaternion
 * @param {vec3} t tranlation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */


function fromRotationTranslation(out, q, t) {
  var ax = t[0] * 0.5,
      ay = t[1] * 0.5,
      az = t[2] * 0.5,
      bx = q[0],
      by = q[1],
      bz = q[2],
      bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Creates a dual quat from a translation
 *
 * @param {quat2} dual quaternion receiving operation result
 * @param {vec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */


function fromTranslation(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}
/**
 * Creates a dual quat from a quaternion
 *
 * @param {quat2} dual quaternion receiving operation result
 * @param {quat} q the quaternion
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */


function fromRotation(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param {quat2} out the dual quaternion
 * @param {mat4} a the matrix
 * @returns {quat2} dual quat receiving operation result
 * @function
 */


function fromMat4(out, a) {
  //TODO Optimize this
  var outer = quat.create();
  mat4.getRotation(outer, a);
  var t = new glMatrix.ARRAY_TYPE(3);
  mat4.getTranslation(t, a);
  fromRotationTranslation(out, outer, t);
  return out;
}
/**
 * Copy the values from one dual quat to another
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the source dual quaternion
 * @returns {quat2} out
 * @function
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}
/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @returns {quat2} out
 */


function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Set the components of a dual quat to the given values
 *
 * @param {quat2} out the receiving quaternion
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} out
 * @function
 */


function set(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}
/**
 * Gets the real part of a dual quat
 * @param  {quat} out real part
 * @param  {quat2} a Dual Quaternion
 * @return {quat} real part
 */


var getReal = quat.copy;
/**
 * Gets the dual part of a dual quat
 * @param  {quat} out dual part
 * @param  {quat2} a Dual Quaternion
 * @return {quat} dual part
 */

exports.getReal = getReal;

function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}
/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {quat} q a quaternion representing the real part
 * @returns {quat2} out
 * @function
 */


var setReal = quat.copy;
/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {quat} q a quaternion representing the dual part
 * @returns {quat2} out
 * @function
 */

exports.setReal = setReal;

function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}
/**
 * Gets the translation of a normalized dual quat
 * @param  {vec3} out translation
 * @param  {quat2} a Dual Quaternion to be decomposed
 * @return {vec3} translation
 */


function getTranslation(out, a) {
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}
/**
 * Translates a dual quat by the given vector
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to translate
 * @param {vec3} v vector to translate by
 * @returns {quat2} out
 */


function translate(out, a, v) {
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3],
      bx1 = v[0] * 0.5,
      by1 = v[1] * 0.5,
      bz1 = v[2] * 0.5,
      ax2 = a[4],
      ay2 = a[5],
      az2 = a[6],
      aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}
/**
 * Rotates a dual quat around the X axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */


function rotateX(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  quat.rotateX(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Y axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */


function rotateY(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  quat.rotateY(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Z axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */


function rotateZ(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  quat.rotateZ(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {quat} q quaternion to rotate by
 * @returns {quat2} out
 */


function rotateByQuatAppend(out, a, q) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat} q quaternion to rotate by
 * @param {quat2} a the dual quaternion to rotate
 * @returns {quat2} out
 */


function rotateByQuatPrepend(out, q, a) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      bx = a[0],
      by = a[1],
      bz = a[2],
      bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}
/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {vec3} axis the axis to rotate around
 * @param {Number} rad how far the rotation should be
 * @returns {quat2} out
 */


function rotateAroundAxis(out, a, axis, rad) {
  //Special case for rad = 0
  if (Math.abs(rad) < glMatrix.EPSILON) {
    return copy(out, a);
  }

  var axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Adds two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @returns {quat2} out
 * @function
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}
/**
 * Multiplies two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @returns {quat2} out
 */


function multiply(out, a, b) {
  var ax0 = a[0],
      ay0 = a[1],
      az0 = a[2],
      aw0 = a[3],
      bx1 = b[4],
      by1 = b[5],
      bz1 = b[6],
      bw1 = b[7],
      ax1 = a[4],
      ay1 = a[5],
      az1 = a[6],
      aw1 = a[7],
      bx0 = b[0],
      by0 = b[1],
      bz0 = b[2],
      bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}
/**
 * Alias for {@link quat2.multiply}
 * @function
 */


var mul = multiply;
/**
 * Scales a dual quat by a scalar number
 *
 * @param {quat2} out the receiving dual quat
 * @param {quat2} a the dual quat to scale
 * @param {Number} b amount to scale the dual quat by
 * @returns {quat2} out
 * @function
 */

exports.mul = mul;

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}
/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */


var dot = quat.dot;
/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param {quat2} out the receiving dual quat
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat2} out
 */

exports.dot = dot;

function lerp(out, a, b, t) {
  var mt = 1 - t;
  if (dot(a, b) < 0) t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}
/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a dual quat to calculate inverse of
 * @returns {quat2} out
 */


function invert(out, a) {
  var sqlen = squaredLength(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}
/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param {quat2} out the receiving quaternion
 * @param {quat2} a quat to calculate conjugate of
 * @returns {quat2} out
 */


function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}
/**
 * Calculates the length of a dual quat
 *
 * @param {quat2} a dual quat to calculate length of
 * @returns {Number} length of a
 * @function
 */


var length = quat.length;
/**
 * Alias for {@link quat2.length}
 * @function
 */

exports.length = length;
var len = length;
/**
 * Calculates the squared length of a dual quat
 *
 * @param {quat2} a dual quat to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

exports.len = len;
var squaredLength = quat.squaredLength;
/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */

exports.squaredLength = squaredLength;
var sqrLen = squaredLength;
/**
 * Normalize a dual quat
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a dual quaternion to normalize
 * @returns {quat2} out
 * @function
 */

exports.sqrLen = sqrLen;

function normalize(out, a) {
  var magnitude = squaredLength(a);

  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }

  return out;
}
/**
 * Returns a string representation of a dual quatenion
 *
 * @param {quat2} a dual quaternion to represent as a string
 * @returns {String} string representation of the dual quat
 */


function str(a) {
  return 'quat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ')';
}
/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat2} a the first dual quaternion.
 * @param {quat2} b the second dual quaternion.
 * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}
/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param {quat2} a the first dual quat.
 * @param {quat2} b the second dual quat.
 * @returns {Boolean} true if the dual quats are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7));
}
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js","./quat.js":"../../node_modules/gl-matrix/esm/quat.js","./mat4.js":"../../node_modules/gl-matrix/esm/mat4.js"}],"../../node_modules/gl-matrix/esm/vec2.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.clone = clone;
exports.fromValues = fromValues;
exports.copy = copy;
exports.set = set;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.divide = divide;
exports.ceil = ceil;
exports.floor = floor;
exports.min = min;
exports.max = max;
exports.round = round;
exports.scale = scale;
exports.scaleAndAdd = scaleAndAdd;
exports.distance = distance;
exports.squaredDistance = squaredDistance;
exports.length = length;
exports.squaredLength = squaredLength;
exports.negate = negate;
exports.inverse = inverse;
exports.normalize = normalize;
exports.dot = dot;
exports.cross = cross;
exports.lerp = lerp;
exports.random = random;
exports.transformMat2 = transformMat2;
exports.transformMat2d = transformMat2d;
exports.transformMat3 = transformMat3;
exports.transformMat4 = transformMat4;
exports.rotate = rotate;
exports.angle = angle;
exports.zero = zero;
exports.str = str;
exports.exactEquals = exactEquals;
exports.equals = equals;
exports.forEach = exports.sqrLen = exports.sqrDist = exports.dist = exports.div = exports.mul = exports.sub = exports.len = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
function create() {
  var out = new glMatrix.ARRAY_TYPE(2);

  if (glMatrix.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */


function clone(a) {
  var out = new glMatrix.ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */


function fromValues(x, y) {
  var out = new glMatrix.ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */


function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */


function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */


function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */


function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */


function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */


function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to ceil
 * @returns {vec2} out
 */


function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to floor
 * @returns {vec2} out
 */


function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */


function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */


function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to round
 * @returns {vec2} out
 */


function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */


function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */


function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */


function distance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}
/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */


function squaredDistance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return x * x + y * y;
}
/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */


function length(a) {
  var x = a[0],
      y = a[1];
  return Math.sqrt(x * x + y * y);
}
/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */


function squaredLength(a) {
  var x = a[0],
      y = a[1];
  return x * x + y * y;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */


function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */


function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}
/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */


function normalize(out, a) {
  var x = a[0],
      y = a[1];
  var len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */


function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */


function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */


function lerp(out, a, b, t) {
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */


function random(out, scale) {
  scale = scale || 1.0;
  var r = glMatrix.RANDOM() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}
/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */


function transformMat2(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */


function transformMat2d(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */


function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */


function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {vec2} a The vec2 point to rotate
 * @param {vec2} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec2} out
 */


function rotate(out, a, b, c) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
      p1 = a[1] - b[1],
      sinC = Math.sin(c),
      cosC = Math.cos(c); //perform rotation and translate to correct position

  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
/**
 * Get the angle between two 2D vectors
 * @param {vec2} a The first operand
 * @param {vec2} b The second operand
 * @returns {Number} The angle in radians
 */


function angle(a, b) {
  var x1 = a[0],
      y1 = a[1],
      x2 = b[0],
      y2 = b[1];
  var len1 = x1 * x1 + y1 * y1;

  if (len1 > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len1 = 1 / Math.sqrt(len1);
  }

  var len2 = x2 * x2 + y2 * y2;

  if (len2 > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len2 = 1 / Math.sqrt(len2);
  }

  var cosine = (x1 * x2 + y1 * y2) * len1 * len2;

  if (cosine > 1.0) {
    return 0;
  } else if (cosine < -1.0) {
    return Math.PI;
  } else {
    return Math.acos(cosine);
  }
}
/**
 * Set the components of a vec2 to zero
 *
 * @param {vec2} out the receiving vector
 * @returns {vec2} out
 */


function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {vec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */


function str(a) {
  return 'vec2(' + a[0] + ', ' + a[1] + ')';
}
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */


function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */


function equals(a, b) {
  var a0 = a[0],
      a1 = a[1];
  var b0 = b[0],
      b1 = b[1];
  return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}
/**
 * Alias for {@link vec2.length}
 * @function
 */


var len = length;
/**
 * Alias for {@link vec2.subtract}
 * @function
 */

exports.len = len;
var sub = subtract;
/**
 * Alias for {@link vec2.multiply}
 * @function
 */

exports.sub = sub;
var mul = multiply;
/**
 * Alias for {@link vec2.divide}
 * @function
 */

exports.mul = mul;
var div = divide;
/**
 * Alias for {@link vec2.distance}
 * @function
 */

exports.div = div;
var dist = distance;
/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */

exports.dist = dist;
var sqrDist = squaredDistance;
/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */

exports.sqrDist = sqrDist;
var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

exports.sqrLen = sqrLen;

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

exports.forEach = forEach;
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js"}],"../../node_modules/gl-matrix/esm/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vec4 = exports.vec3 = exports.vec2 = exports.quat2 = exports.quat = exports.mat4 = exports.mat3 = exports.mat2d = exports.mat2 = exports.glMatrix = void 0;

var glMatrix = _interopRequireWildcard(require("./common.js"));

exports.glMatrix = glMatrix;

var mat2 = _interopRequireWildcard(require("./mat2.js"));

exports.mat2 = mat2;

var mat2d = _interopRequireWildcard(require("./mat2d.js"));

exports.mat2d = mat2d;

var mat3 = _interopRequireWildcard(require("./mat3.js"));

exports.mat3 = mat3;

var mat4 = _interopRequireWildcard(require("./mat4.js"));

exports.mat4 = mat4;

var quat = _interopRequireWildcard(require("./quat.js"));

exports.quat = quat;

var quat2 = _interopRequireWildcard(require("./quat2.js"));

exports.quat2 = quat2;

var vec2 = _interopRequireWildcard(require("./vec2.js"));

exports.vec2 = vec2;

var vec3 = _interopRequireWildcard(require("./vec3.js"));

exports.vec3 = vec3;

var vec4 = _interopRequireWildcard(require("./vec4.js"));

exports.vec4 = vec4;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }
},{"./common.js":"../../node_modules/gl-matrix/esm/common.js","./mat2.js":"../../node_modules/gl-matrix/esm/mat2.js","./mat2d.js":"../../node_modules/gl-matrix/esm/mat2d.js","./mat3.js":"../../node_modules/gl-matrix/esm/mat3.js","./mat4.js":"../../node_modules/gl-matrix/esm/mat4.js","./quat.js":"../../node_modules/gl-matrix/esm/quat.js","./quat2.js":"../../node_modules/gl-matrix/esm/quat2.js","./vec2.js":"../../node_modules/gl-matrix/esm/vec2.js","./vec3.js":"../../node_modules/gl-matrix/esm/vec3.js","./vec4.js":"../../node_modules/gl-matrix/esm/vec4.js"}],"../../src/Math.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transform = exports.Raycast = exports.Vec = void 0;

var _glMatrix = require("gl-matrix");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Vec =
/*#__PURE__*/
function (_Array) {
  _inherits(Vec, _Array);

  _createClass(Vec, [{
    key: "toString",
    value: function toString() {
      return "".concat(new Number(this[0]).toFixed(2), ";").concat(new Number(this[1]).toFixed(2), ";").concat(new Number(this[2]).toFixed(2));
    }
  }, {
    key: "x",
    get: function get() {
      return this[0];
    },
    set: function set(val) {
      this[0] = val;
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    },
    set: function set(val) {
      this[1] = val;
    }
  }, {
    key: "z",
    get: function get() {
      return this[2];
    },
    set: function set(val) {
      this[2] = val;
    }
  }, {
    key: "w",
    get: function get() {
      return this[3];
    },
    set: function set(val) {
      this[3] = val;
    }
  }], [{
    key: "avg",
    value: function avg(vec1, vec2) {
      return new Vec((vec2[0] + vec1[0]) / 2, (vec2[1] + vec1[1]) / 2, (vec2[2] + vec1[2]) / 2);
    }
  }, {
    key: "normal",
    value: function normal(vec1) {
      var n1 = new Vec();

      _glMatrix.vec3.normalize(n1, vec1);

      return n1;
    }
  }, {
    key: "divide",
    value: function divide(vec1, vec2) {
      return new Vec(vec1[0] / vec2[0], vec1[1] / vec2[1], vec1[2] / vec2[2]);
    }
  }, {
    key: "add",
    value: function add(vec1, vec2) {
      return new Vec(vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2], vec1[3] + vec2[3]);
    }
  }, {
    key: "subtract",
    value: function subtract(vec1, vec2) {
      return new Vec(vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2], vec1[3] - vec2[3]);
    }
  }, {
    key: "multiply",
    value: function multiply(vec1, vec2) {
      return new Vec(vec1[0] * vec2[0], vec1[1] * vec2[1], vec1[2] * vec2[2], vec1[3] * vec2[3]);
    }
  }]);

  function Vec() {
    var _this;

    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, Vec);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Vec).call(this));
    _this[0] = x;
    _this[1] = y;
    _this[2] = z;
    _this[3] = w;

    if (arguments.length === 1) {
      _this[0] = x[0];
      _this[1] = x[1];
      _this[2] = x[2];
      _this[3] = x[3];
    }

    return _this;
  }

  _createClass(Vec, [{
    key: "add",
    value: function add(vec) {
      return Vec.add(this, vec);
    }
  }, {
    key: "multiply",
    value: function multiply(vec) {
      return Vec.multiply(this, vec);
    }
  }, {
    key: "divide",
    value: function divide(vec) {
      return Vec.divide(this, vec);
    }
  }, {
    key: "subtract",
    value: function subtract(vec) {
      return Vec.subtract(this, vec);
    }
  }, {
    key: "dot",
    value: function dot(vec) {
      return _glMatrix.vec3.dot(this, vec);
    }
  }, {
    key: "normalize",
    value: function normalize() {
      _glMatrix.vec3.normalize(this, this);

      return this;
    }
  }]);

  return Vec;
}(_wrapNativeSuper(Array));

exports.Vec = Vec;

var Raycast =
/*#__PURE__*/
function (_Vec) {
  _inherits(Raycast, _Vec);

  function Raycast(camera, x, y) {
    var _this2;

    _classCallCheck(this, Raycast);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Raycast).call(this));
    var camPos = camera.worldPosition;
    var width = camera.sensor.width;
    var height = camera.sensor.height;
    _this2.origin = new Vec(camPos.x, camPos.y, camPos.z);
    _this2[0] = 2 * x / width - 1;
    _this2[1] = 1 - 2 * y / height;
    _this2[2] = 1;
    _this2[3] = 1;

    _this2.project(camera.projMatrix, camera.viewMatrix);

    return _this2;
  }

  _createClass(Raycast, [{
    key: "project",
    value: function project(projMatrix, viewMatrix) {
      var projInverse = _glMatrix.mat4.create();

      _glMatrix.mat4.invert(projInverse, projMatrix);

      _glMatrix.vec4.transformMat4(this, this, projInverse);

      var viewInverse = _glMatrix.mat4.create();

      _glMatrix.mat4.invert(viewInverse, viewMatrix);

      _glMatrix.vec4.transformMat4(this, this, viewInverse);

      _glMatrix.vec4.normalize(this, this);
    }
  }, {
    key: "distnace",
    value: function distnace(plane, normal) {
      var a = this.origin.add(plane).dot(normal);
      var b = this.dot(normal);
      return -(a / b);
    }
  }, {
    key: "hit",
    value: function hit(plane, normal) {
      var t = this.distnace(plane, normal);
      var pos = this.origin.add(this.multiply(new Vec(t, t, t)));

      if (t > 0 && t < 100000) {
        return {
          distance: t,
          position: pos
        };
      }

      return null;
    }
  }]);

  return Raycast;
}(Vec);

exports.Raycast = Raycast;

var Transform = function Transform() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$position = _ref.position,
      position = _ref$position === void 0 ? new Vec() : _ref$position,
      _ref$rotation = _ref.rotation,
      rotation = _ref$rotation === void 0 ? new Vec() : _ref$rotation,
      _ref$origin = _ref.origin,
      origin = _ref$origin === void 0 ? new Vec() : _ref$origin,
      _ref$scale = _ref.scale,
      scale = _ref$scale === void 0 ? 1 : _ref$scale;

  _classCallCheck(this, Transform);

  this.position = new Vec(position);
  this.rotation = new Vec(rotation);
  this.scale = scale;
  this.origin = new Vec(origin);
};

exports.Transform = Transform;
},{"gl-matrix":"../../node_modules/gl-matrix/esm/index.js"}],"../../res/textures/Rock_028_ROUGH.jpg":[function(require,module,exports) {
module.exports = "/Rock_028_ROUGH.97af7721.jpg";
},{}],"../../res/textures/Rock_028_NORM.jpg":[function(require,module,exports) {
module.exports = "/Rock_028_NORM.8ba3e1c2.jpg";
},{}],"../../src/materials/DefaultMaterial.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Material2 = require("./Material");

var _Texture = require("./Texture");

var _Resources = require("../Resources");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_Resources.Resources.add({
  'spec_map': require('../../res/textures/Rock_028_ROUGH.jpg'),
  'norm_map': require('../../res/textures/Rock_028_NORM.jpg')
}, false);

var DefaultMaterial =
/*#__PURE__*/
function (_Material) {
  _inherits(DefaultMaterial, _Material);

  function DefaultMaterial() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, DefaultMaterial);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(DefaultMaterial)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "specularMap", new _Texture.Texture(_Resources.Resources.get('spec_map')));

    _defineProperty(_assertThisInitialized(_this), "normalMap", new _Texture.Texture(_Resources.Resources.get('norm_map')));

    _defineProperty(_assertThisInitialized(_this), "specular", 3.33);

    _defineProperty(_assertThisInitialized(_this), "receiveShadows", true);

    _defineProperty(_assertThisInitialized(_this), "castShadows", true);

    return _this;
  }

  return DefaultMaterial;
}(_Material2.Material);

exports.default = DefaultMaterial;
},{"./Material":"../../src/materials/Material.js","./Texture":"../../src/materials/Texture.js","../Resources":"../../src/Resources.js","../../res/textures/Rock_028_ROUGH.jpg":"../../res/textures/Rock_028_ROUGH.jpg","../../res/textures/Rock_028_NORM.jpg":"../../res/textures/Rock_028_NORM.jpg"}],"../../src/scene/Geometry.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Geometry = void 0;

var _Math = require("../Math.js");

var _DefaultMaterial = _interopRequireDefault(require("../materials/DefaultMaterial.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFAULT_MATERIAL = new _DefaultMaterial.default();

var Geometry =
/*#__PURE__*/
function (_Transform) {
  _inherits(Geometry, _Transform);

  _createClass(Geometry, [{
    key: "buffer",
    get: function get() {
      this._buffer = this._buffer || this.createBuffer();
      return this._buffer;
    }
  }, {
    key: "vertecies",
    get: function get() {
      return this.vertArray || [];
    }
  }, {
    key: "indecies",
    get: function get() {
      return [];
    }
  }]);

  function Geometry() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Geometry);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Geometry).call(this, args));

    _defineProperty(_assertThisInitialized(_this), "_buffer", null);

    _this.instanced = false;
    _this.instances = 0;

    _this.onCreate(args);

    var _args$vertecies = args.vertecies,
        vertecies = _args$vertecies === void 0 ? null : _args$vertecies,
        _args$material = args.material,
        material = _args$material === void 0 ? DEFAULT_MATERIAL : _args$material,
        _args$hidden = args.hidden,
        hidden = _args$hidden === void 0 ? false : _args$hidden,
        _args$guide = args.guide,
        guide = _args$guide === void 0 ? false : _args$guide,
        _args$uv = args.uv,
        uv = _args$uv === void 0 ? [0, 0] : _args$uv,
        _args$drawmode = args.drawmode,
        drawmode = _args$drawmode === void 0 ? "TRIANGLES" : _args$drawmode,
        _args$id = args.id,
        id = _args$id === void 0 ? null : _args$id;
    _this.vertArray = vertecies;
    _this.material = material;
    _this.hidden = hidden;
    _this.guide = guide;
    _this.uv = uv;
    _this.drawmode = drawmode;
    _this.id = id;
    return _this;
  }

  _createClass(Geometry, [{
    key: "onCreate",
    value: function onCreate(args) {}
  }, {
    key: "createBuffer",
    value: function createBuffer() {
      return new VertexBuffer(this.vertecies, this.indecies, this.constructor.attributes, this.drawmode);
    }
  }]);

  return Geometry;
}(_Math.Transform);

exports.Geometry = Geometry;

_defineProperty(Geometry, "attributes", [{
  size: 3,
  attribute: "aPosition"
}, {
  size: 2,
  attribute: "aTexCoords"
}, {
  size: 3,
  attribute: "aNormal"
}]);

var VertexBuffer =
/*#__PURE__*/
function () {
  _createClass(VertexBuffer, [{
    key: "vertsPerElement",
    get: function get() {
      return this.vertecies.length / this.elements;
    }
  }, {
    key: "elements",
    get: function get() {
      var count = 0;

      for (var key in this.attributes) {
        count += this.attributes[key].size;
      }

      return count;
    }
  }]);

  function VertexBuffer(vertArray, indexArray, attributes, type) {
    _classCallCheck(this, VertexBuffer);

    this.vertecies = new Float32Array(vertArray);
    this.indecies = new Uint16Array(indexArray);
    this.attributes = attributes;
    this.type = type || "TRIANGLES";
  }

  return VertexBuffer;
}();
},{"../Math.js":"../../src/Math.js","../materials/DefaultMaterial.js":"../../src/materials/DefaultMaterial.js"}],"../../src/geo/Guide.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Guide = void 0;

var _PrimitiveMaterial = _interopRequireDefault(require("../materials/PrimitiveMaterial"));

var _Math = require("../Math");

var _Geometry2 = require("../scene/Geometry");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var DEFAULT_GUIDE_MATERIAL = new _PrimitiveMaterial.default();

var Guide =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Guide, _Geometry);

  function Guide() {
    _classCallCheck(this, Guide);

    return _possibleConstructorReturn(this, _getPrototypeOf(Guide).apply(this, arguments));
  }

  _createClass(Guide, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.guide = true;
      args.material = DEFAULT_GUIDE_MATERIAL;
      args.drawmode = "LINES";
    }
  }, {
    key: "vertecies",
    get: function get() {
      var s = this.scale * 10 || 10;

      var _ref = this.origin || new _Math.Vec(),
          x = _ref.x,
          y = _ref.y,
          z = _ref.z;

      return [x, y, z + s, 0, 1, 1, 1, 1, x, y, z + -s, 0, 1, 1, 1, 1, x, y + s, z, 0, 1, 1, 1, 1, x, y - s, z, 0, 1, 1, 1, 1, x + s, y, z, 0, 1, 1, 1, 1, x - s, y, z, 0, 1, 1, 1, 1];
    }
  }]);

  return Guide;
}(_Geometry2.Geometry);

exports.Guide = Guide;
},{"../materials/PrimitiveMaterial":"../../src/materials/PrimitiveMaterial.js","../Math":"../../src/Math.js","../scene/Geometry":"../../src/scene/Geometry.js"}],"../../src/geo/Grid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grid = void 0;

var _Guide2 = require("./Guide.js");

var _DefaultMaterial = _interopRequireDefault(require("./../materials/DefaultMaterial"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var DEFAULT_GRID_MATERIAL = new _DefaultMaterial.default();
DEFAULT_GRID_MATERIAL.castShadows = false;
DEFAULT_GRID_MATERIAL.receiveShadows = false;

var Grid =
/*#__PURE__*/
function (_Guide) {
  _inherits(Grid, _Guide);

  _createClass(Grid, [{
    key: "vertecies",
    get: function get() {
      return this.generate(this.size, this.count);
    }
  }]);

  function Grid(size, count) {
    var _this;

    _classCallCheck(this, Grid);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Grid).call(this));
    _this.size = size;
    _this.count = count;
    return _this;
  }

  _createClass(Grid, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.drawmode = "LINES"; // args.guide = true;

      args.material = DEFAULT_GRID_MATERIAL;
    }
  }, {
    key: "generate",
    value: function generate() {
      var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 14;
      var dataArray = [];
      var size = w * s / 2;

      for (var x = -s / 2; x <= s / 2; x++) {
        var color = [0.5, 0.5, 0.5];
        if (x == 0) color = [.15, .15, 1];
        dataArray.push.apply(dataArray, [w * x, 0, size, 0, 0].concat(_toConsumableArray(color), [w * x, 0, -size, 0, 0], _toConsumableArray(color)));
      }

      for (var z = -s / 2; z <= s / 2; z++) {
        var _color = [0.5, 0.5, 0.5];
        if (z == 0) _color = [1, .15, .15];
        dataArray.push.apply(dataArray, [size, 0, w * z, 0, 0].concat(_toConsumableArray(_color), [-size, 0, w * z, 0, 0], _toConsumableArray(_color)));
      }

      return dataArray;
    }
  }]);

  return Grid;
}(_Guide2.Guide);

exports.Grid = Grid;
},{"./Guide.js":"../../src/geo/Guide.js","./../materials/DefaultMaterial":"../../src/materials/DefaultMaterial.js"}],"../../res/models/cursor.obj":[function(require,module,exports) {
module.exports = "/cursor.021979eb.obj";
},{}],"../../src/geo/Cursor.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cursor = void 0;

var _Math = require("../Math");

var _Guide2 = require("./Guide");

var _Loader = require("../Loader");

var _Resources = require("../Resources");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

_Resources.Resources.add({
  'cursor_model': require('../../res/models/cursor.obj')
}, false);

var Cursor =
/*#__PURE__*/
function (_Guide) {
  _inherits(Cursor, _Guide);

  function Cursor() {
    _classCallCheck(this, Cursor);

    return _possibleConstructorReturn(this, _getPrototypeOf(Cursor).apply(this, arguments));
  }

  _createClass(Cursor, [{
    key: "onCreate",
    value: function onCreate(args) {
      _get(_getPrototypeOf(Cursor.prototype), "onCreate", this).call(this, args);

      args.drawmode = "TRIANGLES";
      args.id = 1;
      this.scale = 32;
      this.cursorVerts = _Loader.Loader.loadObjFile(_Resources.Resources.get('cursor_model'));
    }
  }, {
    key: "vertecies",
    get: function get() {
      var s = 0.75;

      var _ref = new _Math.Vec(),
          x = _ref.x,
          y = _ref.y,
          z = _ref.z;

      return [x + s, y, z, 0, 0, 0, 0, 1, x, y, z + s, 0, 0, 0, 0, 1, x, y, z, 0, 0, 0, 0, 1, x, y, z + s, 0, 0, 0, 1, 0, x, y + s, z, 0, 0, 0, 1, 0, x, y, z, 0, 0, 0, 1, 0, x, y, z, 0, 0, 1, 0, 0, x, y + s, z, 0, 0, 1, 0, 0, x + s, y, z, 0, 0, 1, 0, 0].concat(_toConsumableArray(this.cursorVerts));
    }
  }]);

  return Cursor;
}(_Guide2.Guide);

exports.Cursor = Cursor;
},{"../Math":"../../src/Math.js","./Guide":"../../src/geo/Guide.js","../Loader":"../../src/Loader.js","../Resources":"../../src/Resources.js","../../res/models/cursor.obj":"../../res/models/cursor.obj"}],"../../src/scene/Entity.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Entity = void 0;

var _Geometry2 = require("./Geometry");

var _Math = require("../Math");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Entity =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Entity, _Geometry);

  function Entity() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Entity);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Entity)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "velocity", new _Math.Vec());

    _defineProperty(_assertThisInitialized(_this), "traits", new Set());

    return _this;
  }

  _createClass(Entity, [{
    key: "onCreate",
    value: function onCreate(args) {}
  }, {
    key: "update",
    value: function update(ms) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.traits[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var trait = _step.value;
          trait(ms);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "addTrait",
    value: function addTrait(trait) {
      this.traits.add(trait);
    }
  }, {
    key: "removeTrait",
    value: function removeTrait(trait) {
      this.traits.delete(trait);
    }
  }, {
    key: "setPositionTo",
    value: function setPositionTo(transform) {
      this.position = transform.position;
      this.rotation = transform.rotation;
    }
  }]);

  return Entity;
}(_Geometry2.Geometry);

exports.Entity = Entity;
},{"./Geometry":"../../src/scene/Geometry.js","../Math":"../../src/Math.js"}],"../../src/scene/Camera.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Camera = void 0;

var _glMatrix = require("gl-matrix");

var _Math = require("../Math.js");

var _DefaultMaterial = _interopRequireDefault(require("../materials/DefaultMaterial.js"));

var _Entity2 = require("./Entity.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var DEFAULT_CAMERA_MATERIAL = new _DefaultMaterial.default();

var Camera =
/*#__PURE__*/
function (_Entity) {
  _inherits(Camera, _Entity);

  _createClass(Camera, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.drawmode = "LINE_STRIP";
      args.material = DEFAULT_CAMERA_MATERIAL;
    }
  }, {
    key: "vertecies",
    get: function get() {
      var s = 50 / this.scale;
      var vertArray = [-s, -s, 0, 0, 0, 0, 0, 0, s, -s, 0, 1, 0, 0, 0, 0, s, s, 0, 1, 1, 0, 0, 0, s, s, 0, 1, 1, 0, 0, 0, -s, s, 0, 0, 1, 0, 0, 0, -s, -s, 0, 0, 0, 0, 0, 0, s, s, 0, 1, 1, 0, 0, 0, s, s, s * 2, 1, 1, 0, 0, 0, -s, -s, s * 2, 0, 0, 0, 0, 0, s, -s, s * 2, 1, 0, 0, 0, 0, s, s, s * 2, 1, 1, 0, 0, 0, s, s, s * 2, 1, 1, 0, 0, 0, -s, s, s * 2, 0, 1, 0, 0, 0, -s, -s, s * 2, 0, 0, 0, 0, 0, -s / 2, -s / 2, -s, 0, 0, 0, 0, 0, s / 2, -s / 2, -s, 1, 0, 0, 0, 0, s / 2, s / 2, -s, 1, 1, 0, 0, 0, s / 2, s / 2, -s, 1, 1, 0, 0, 0, -s / 2, s / 2, -s, 0, 1, 0, 0, 0, -s / 2, -s / 2, -s, 0, 0, 0, 0, 0];
      return vertArray;
    }
  }]);

  function Camera() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Camera);

    var _args$fov = args.fov,
        fov = _args$fov === void 0 ? 50 : _args$fov,
        _args$scale = args.scale,
        scale = _args$scale === void 0 ? 0.004 : _args$scale,
        _args$farplane = args.farplane,
        farplane = _args$farplane === void 0 ? 350 : _args$farplane,
        _args$nearplane = args.nearplane,
        nearplane = _args$nearplane === void 0 ? 0.025 : _args$nearplane,
        _args$width = args.width,
        width = _args$width === void 0 ? 1280 : _args$width,
        _args$height = args.height,
        height = _args$height === void 0 ? 720 : _args$height;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Camera).call(this, args));
    _this.scale = scale;
    _this.fov = fov;
    _this.farplane = farplane;
    _this.nearplane = nearplane;
    _this.lookAt = new _Math.Vec(0, 0, 0);
    _this.projMatrix = _glMatrix.mat4.create();
    _this.viewMatrix = _glMatrix.mat4.create();
    _this.projViewMatrix = _glMatrix.mat4.create();
    _this.sensor = {
      width: width,
      height: height
    };

    var self = _assertThisInitialized(_this);

    _this.worldPosition = {
      get x() {
        return -self.position.x;
      },

      get y() {
        return -self.position.y;
      },

      get z() {
        return -self.position.z;
      }

    };
    return _this;
  }

  _createClass(Camera, [{
    key: "update",
    value: function update(ms) {
      _get(_getPrototypeOf(Camera.prototype), "update", this).call(this, ms);

      var projMatrix = this.projMatrix;
      var viewMatrix = this.viewMatrix;
      var camera = this;
      var ar = this.sensor.width / this.sensor.height;

      _glMatrix.mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);

      _glMatrix.mat4.lookAt(viewMatrix, _glMatrix.vec3.fromValues(0, 0, 0), camera.lookAt, _glMatrix.vec3.fromValues(0, 0, 0));

      _glMatrix.mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);

      _glMatrix.mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);

      _glMatrix.mat4.scale(viewMatrix, viewMatrix, _glMatrix.vec3.fromValues(camera.scale, camera.scale, camera.scale));

      _glMatrix.mat4.translate(viewMatrix, viewMatrix, camera.position);

      _glMatrix.mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
    }
  }]);

  return Camera;
}(_Entity2.Entity);

exports.Camera = Camera;
},{"gl-matrix":"../../node_modules/gl-matrix/esm/index.js","../Math.js":"../../src/Math.js","../materials/DefaultMaterial.js":"../../src/materials/DefaultMaterial.js","./Entity.js":"../../src/scene/Entity.js"}],"../../src/light/Spotlight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spotlight = void 0;

var _glMatrix = require("gl-matrix");

var _Camera2 = require("../scene/Camera");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Spotlight =
/*#__PURE__*/
function (_Camera) {
  _inherits(Spotlight, _Camera);

  function Spotlight() {
    _classCallCheck(this, Spotlight);

    return _possibleConstructorReturn(this, _getPrototypeOf(Spotlight).apply(this, arguments));
  }

  _createClass(Spotlight, [{
    key: "isLight",
    get: function get() {
      return true;
    } // update(dt) {
    // 	super.update(dt);
    // 	const ar = this.sensor.width / this.sensor.height;
    // 	mat4.perspective(this.projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
    // 	mat4.lookAt(
    // 		this.viewMatrix, 
    // 		vec3.fromValues(0, 0, 0),
    // 		vec3.fromValues(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z), 
    // 		vec3.fromValues(0, 1, 0)
    // 	);
    // 	mat4.scale(this.viewMatrix, this.viewMatrix, vec3.fromValues(
    // 		camera.scale, 
    // 		camera.scale, 
    // 		camera.scale,
    // 	));
    // 	mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(
    // 		camera.position.x,
    // 		camera.position.y,
    // 		camera.position.z,
    // 	));
    // 	mat4.rotateX(this.viewMatrix, this.viewMatrix, camera.rotation.x);
    // 	mat4.rotateY(this.viewMatrix, this.viewMatrix, camera.rotation.y);
    // 	mat4.rotateY(this.viewMatrix, this.viewMatrix, camera.rotation.z);
    // 	mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
    // }

  }]);

  return Spotlight;
}(_Camera2.Camera);

exports.Spotlight = Spotlight;
},{"gl-matrix":"../../node_modules/gl-matrix/esm/index.js","../scene/Camera":"../../src/scene/Camera.js"}],"../../src/scene/Scene.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scene = void 0;

var _Grid = require("../geo/Grid.js");

var _Math = require("../Math.js");

var _Cursor = require("../geo/Cursor");

var _Spotlight = require("../light/Spotlight.js");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Scene =
/*#__PURE__*/
function () {
  function Scene(camera) {
    _classCallCheck(this, Scene);

    _defineProperty(this, "objects", new Set());

    this.lightSources = new _Spotlight.Spotlight({
      fov: 90,
      position: new _Math.Vec(500, -2500, -1500),
      rotation: new _Math.Vec(0.8, 0.4, 0)
    });
    this.activeCamera = camera;
    this.grid = new _Grid.Grid(100, 12);
    this.curosr = new _Cursor.Cursor();
    this.clear();
  }

  _createClass(Scene, [{
    key: "add",
    value: function add(obj) {
      var _this = this;

      if (Array.isArray(obj)) {
        obj.forEach(function (o) {
          return _this.objects.add(o);
        });
      } else {
        this.objects.add(obj);
      }
    }
  }, {
    key: "remove",
    value: function remove(obj) {
      var _this2 = this;

      if (Array.isArray(obj)) {
        obj.forEach(function (o) {
          return _this2.objects.delete(o);
        });
      } else {
        this.objects.delete(obj);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.objects.clear();
    }
  }, {
    key: "update",
    value: function update(ms) {
      if (this.activeCamera) {
        this.activeCamera.update(ms);
      }

      if (this.lightSources) {
        this.lightSources.update(ms);
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;

          if (obj.update) {
            obj.update(ms);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "getRenderableObjects",
    value: function getRenderableObjects() {
      var arr = _toConsumableArray(this.objects).filter(function (obj) {
        return !obj.hidden;
      });

      if (!this.curosr.hidden) {
        arr.push(this.curosr);
      }

      if (!this.grid.hidden) {
        arr.push(this.grid);
      }

      return arr;
    }
  }]);

  return Scene;
}();

exports.Scene = Scene;
},{"../geo/Grid.js":"../../src/geo/Grid.js","../Math.js":"../../src/Math.js","../geo/Cursor":"../../src/geo/Cursor.js","../light/Spotlight.js":"../../src/light/Spotlight.js"}],"../../src/geo/Cube.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cube = void 0;

var _Geometry2 = require("../scene/Geometry");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Cube =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Cube, _Geometry);

  function Cube() {
    _classCallCheck(this, Cube);

    return _possibleConstructorReturn(this, _getPrototypeOf(Cube).apply(this, arguments));
  }

  _createClass(Cube, [{
    key: "onCreate",
    value: function onCreate(args) {
      this.vertsPerFace = 6;
      this.visible = {
        TOP: true,
        BOTTOM: true,
        LEFT: true,
        RIGHT: true,
        FRONT: true,
        BACK: true
      };
    }
  }, {
    key: "invisible",
    get: function get() {
      return !this.visible.TOP && !this.visible.BOTTOM && !this.visible.LEFT && !this.visible.RIGHT && !this.visible.FRONT && !this.visible.BACK;
    }
  }, {
    key: "vertecies",
    get: function get() {
      var vertArray = [];
      var faces = this.faces;
      var visibleFaces = [];

      for (var key in this.visible) {
        if (this.visible[key]) {
          visibleFaces.push(key);
        }
      }

      visibleFaces.forEach(function (face) {
        vertArray = vertArray.concat(faces[face]);
      });
      return vertArray;
    }
  }, {
    key: "faces",
    get: function get() {
      var s = 1;
      var w = 1;
      var h = 1;
      var u = this.uv[0];
      var v = this.uv[1];
      var x = 0;
      var y = 0;
      var z = 0;
      return {
        TOP: [s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, s * h + z, 0 + u, 1 + v, 0, 1, 0],
        BOTTOM: [-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, -s * h + z, 1 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0],
        LEFT: [-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, -s * h + y, s * w + z, 1 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1, -s * w + x, s * h + y, s * w + z, 0 + u, 1 + v, 0, 0, 1, -s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1],
        RIGHT: [s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, s * w + x, -s * h + y, -s * w + z, 1 + u, 0 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, -s * w + x, s * h + y, -s * w + z, 0 + u, 1 + v, 0, 0, -1],
        FRONT: [s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0],
        BACK: [-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, -1, 0, 0]
      };
    }
  }]);

  return Cube;
}(_Geometry2.Geometry);

exports.Cube = Cube;
},{"../scene/Geometry":"../../src/scene/Geometry.js"}],"../../src/geo/Emitter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Emitter = exports.Particle = void 0;

var _Geometry3 = require("../scene/Geometry");

var _DefaultMaterial = _interopRequireDefault(require("../materials/DefaultMaterial"));

var _Math = require("../Math");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var DEFAULT_GUIDE_MATERIAL = new _DefaultMaterial.default();

var Particle =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Particle, _Geometry);

  _createClass(Particle, [{
    key: "vertecies",
    get: function get() {
      var s = 20;

      var _this$position = _slicedToArray(this.position, 3),
          x = _this$position[0],
          y = _this$position[1],
          z = _this$position[2];

      var d = this.direction;
      return [x + 0, y + 0, z + 0, 0, 0, d[0], d[1], d[2], x + -s, y + 0, z + 0, 0, 0, d[0], d[1], d[2], x + -s, y + s, z + 0, 0, 0, d[0], d[1], d[2], x + -s, y + s, z, 0, 0, d[0], d[1], d[2], x + -s, y + 0, z, 0, 0, d[0], d[1], d[2], x + 0, y + 0, z + s, 0, 0, d[0], d[1], d[2], x + -s, y + s, z, 0, 0, d[0], d[1], d[2], x + 0, y + 0, z + s, 0, 0, d[0], d[1], d[2], x + 0, y + 0, z + 0, 0, 0, d[0], d[1], d[2], x + 0, y + 0, z + 0, 0, 0, d[0], d[1], d[2], x + 0, y + 0, z + s, 0, 0, d[0], d[1], d[2], x - s, y + 0, z + 0, 0, 0, d[0], d[1], d[2]];
    }
  }]);

  function Particle(origin) {
    var _this;

    _classCallCheck(this, Particle);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Particle).call(this));
    _this.base = origin;
    _this.age = 0;
    _this.position = new _Math.Vec();
    _this.direction = _Math.Vec.normal(_Math.Vec.add(_this.base.rotation, new _Math.Vec(Math.random() + 1 / 2 - 1, Math.random() + 1 / 2 - 1, Math.random() + 1 / 2 - 1)));
    return _this;
  }

  return Particle;
}(_Geometry3.Geometry);

exports.Particle = Particle;

var Emitter =
/*#__PURE__*/
function (_Geometry2) {
  _inherits(Emitter, _Geometry2);

  function Emitter() {
    _classCallCheck(this, Emitter);

    return _possibleConstructorReturn(this, _getPrototypeOf(Emitter).apply(this, arguments));
  }

  _createClass(Emitter, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.material = DEFAULT_GUIDE_MATERIAL;
      args.drawmode = "TRIANGLES";
      this.particle = new Particle(this);
      this.particles = [];
      this.instances = 1;
      this.instanced = true;
      this.rotation = new _Math.Vec(0, 0, 0);
      this.maxage = 10000;
    }
  }, {
    key: "update",
    value: function update(ms) {
      this.spawn(10);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.particles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var p = _step.value;
          p.position.x += p.direction.x * ms;
          p.position.y += p.direction.y * ms;
          p.position.z += p.direction.z * ms;
          p.age += ms;

          if (p.age > this.maxage * Math.random()) {
            this.particles.splice(this.particles.indexOf(p), 1);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "spawn",
    value: function spawn(amount) {
      for (var i = 0; i < amount; i++) {
        this.particles.push(new Particle(this));
      }
    }
  }, {
    key: "buffer",
    get: function get() {
      return this.createBuffer();
    }
  }, {
    key: "vertecies",
    get: function get() {
      var verts = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.particles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var p = _step2.value;
          var pverts = p.vertecies;
          verts.push.apply(verts, _toConsumableArray(pverts));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return verts;
    }
  }]);

  return Emitter;
}(_Geometry3.Geometry);

exports.Emitter = Emitter;
},{"../scene/Geometry":"../../src/scene/Geometry.js","../materials/DefaultMaterial":"../../src/materials/DefaultMaterial.js","../Math":"../../src/Math.js"}],"../../src/geo/Group.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Group = void 0;

var _Geometry2 = require("../scene/Geometry");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Group =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Group, _Geometry);

  function Group() {
    _classCallCheck(this, Group);

    return _possibleConstructorReturn(this, _getPrototypeOf(Group).apply(this, arguments));
  }

  _createClass(Group, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.objects = args.objects || [];
      this.objects = args.objects;
    }
  }, {
    key: "add",
    value: function add(geo) {
      this.objects.push(geo);
    }
  }, {
    key: "vertecies",
    get: function get() {
      var vertArray = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;
          vertArray.push.apply(vertArray, _toConsumableArray(obj.buffer.vertecies));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return vertArray;
    }
  }, {
    key: "indecies",
    get: function get() {
      var indexArray = [];
      var offset = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var obj = _step2.value;
          var indecies = obj.buffer.indecies.map(function (i) {
            return i + offset;
          });
          indexArray.push.apply(indexArray, _toConsumableArray(indecies));
          offset = obj.buffer.vertecies.length / obj.buffer.vertsPerElement;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return indexArray;
    }
  }]);

  return Group;
}(_Geometry2.Geometry);

exports.Group = Group;
},{"../scene/Geometry":"../../src/scene/Geometry.js"}],"../../src/geo/Plane.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Plane = void 0;

var _Geometry2 = require("../scene/Geometry.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Plane =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Plane, _Geometry);

  function Plane() {
    _classCallCheck(this, Plane);

    return _possibleConstructorReturn(this, _getPrototypeOf(Plane).apply(this, arguments));
  }

  _createClass(Plane, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.drawmoed = "TRIANGLES";
    }
  }, {
    key: "vertecies",
    get: function get() {
      var s = 1;
      return [-s, -s, 0, 0, 0, 0, 1, 0, s, -s, 0, 1, 0, 0, 1, 0, s, s, 0, 1, 1, 0, 1, 0, s, s, 0, 1, 1, 0, 1, 0, -s, s, 0, 0, 1, 0, 1, 0, -s, -s, 0, 0, 0, 0, 1, 0];
    }
  }]);

  return Plane;
}(_Geometry2.Geometry);

exports.Plane = Plane;
},{"../scene/Geometry.js":"../../src/scene/Geometry.js"}],"../../res/models/sphere.obj":[function(require,module,exports) {
module.exports = "/sphere.088f4791.obj";
},{}],"../../src/geo/Sphere.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sphere = void 0;

var _Geometry2 = require("../scene/Geometry.js");

var _Resources = require("../Resources.js");

var _Loader = require("../Loader.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

_Resources.Resources.add({
  'sphere_model': require('../../res/models/sphere.obj')
}, false);

var Sphere =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Sphere, _Geometry);

  function Sphere() {
    _classCallCheck(this, Sphere);

    return _possibleConstructorReturn(this, _getPrototypeOf(Sphere).apply(this, arguments));
  }

  _createClass(Sphere, [{
    key: "vertecies",
    get: function get() {
      return _Loader.Loader.loadObjFile(_Resources.Resources.get('sphere_model'));
    }
  }]);

  return Sphere;
}(_Geometry2.Geometry);

exports.Sphere = Sphere;
},{"../scene/Geometry.js":"../../src/scene/Geometry.js","../Resources.js":"../../src/Resources.js","../Loader.js":"../../src/Loader.js","../../res/models/sphere.obj":"../../res/models/sphere.obj"}],"../../src/geo/Terrain.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Terrain = void 0;

var _Geometry2 = require("../scene/Geometry");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Terrain =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Terrain, _Geometry);

  function Terrain() {
    _classCallCheck(this, Terrain);

    return _possibleConstructorReturn(this, _getPrototypeOf(Terrain).apply(this, arguments));
  }

  _createClass(Terrain, [{
    key: "onCreate",
    value: function onCreate() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$smoothness = _ref.smoothness,
          smoothness = _ref$smoothness === void 0 ? 0 : _ref$smoothness,
          _ref$resolution = _ref.resolution,
          resolution = _ref$resolution === void 0 ? 25 : _ref$resolution,
          _ref$height = _ref.height,
          height = _ref$height === void 0 ? 0 : _ref$height,
          _ref$size = _ref.size,
          size = _ref$size === void 0 ? 400 : _ref$size,
          _ref$seed = _ref.seed,
          seed = _ref$seed === void 0 ? Math.random() : _ref$seed;

      this.smoothness = smoothness;
      this.resolution = resolution;
      this.height = height;
      this.size = parseInt(size);
      this.seed = seed;
    }
  }, {
    key: "generate",
    value: function generate() {
      var size = this.size;
      var vertArray = [];
      var heightmap = this.heightMap(size, size);

      for (var x = 0; x < heightmap.length; x++) {
        for (var z = 0; z < heightmap[x].length; z++) {
          try {
            var res = this.resolution;
            var s = res / 2;
            var dz = res * z - res * heightmap.length / 2;
            var dx = res * x - res * heightmap[x].length / 2;
            var topl = heightmap[x - 1][z - 1];
            var topr = heightmap[x][z - 1];
            var botr = heightmap[x][z];
            var botl = heightmap[x - 1][z];
            var verts = [s + dx, botr, s + dz, 1 / size * x, 1 / size * z, s + dx, topr, -s + dz, 1 / size * x, 1 / size * z, -s + dx, topl, -s + dz, 1 / size * x, 1 / size * z, -s + dx, topl, -s + dz, 1 / size * x, 1 / size * z, -s + dx, botl, s + dz, 1 / size * x, 1 / size * z, s + dx, botr, s + dz, 1 / size * x, 1 / size * z];
            vertArray.push.apply(vertArray, verts);
          } catch (err) {}
        }
      }

      return vertArray;
    }
  }, {
    key: "heightMap",
    value: function heightMap(width, height) {
      var verts = new Array(width);

      for (var x = 0; x < width; x++) {
        if (!verts[x]) {
          verts[x] = new Array(height);
        }

        for (var y = 0; y < height; y++) {
          var noiseValue = 0;
          verts[x][y] = -noiseValue;
        }
      }

      return verts;
    }
  }]);

  return Terrain;
}(_Geometry2.Geometry);

exports.Terrain = Terrain;

_defineProperty(Terrain, "attributes", [{
  size: 3,
  attribute: "aPosition"
}, {
  size: 2,
  attribute: "aTexCoords"
}]);
},{"../scene/Geometry":"../../src/scene/Geometry.js"}],"../../src/geo/Vector.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vector = void 0;

var _DefaultMaterial = _interopRequireDefault(require("../materials/DefaultMaterial"));

var _Geometry2 = require("../scene/Geometry");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var DEFAULT_GUIDE_MATERIAL = new _DefaultMaterial.default();

var Vector =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Vector, _Geometry);

  function Vector() {
    _classCallCheck(this, Vector);

    return _possibleConstructorReturn(this, _getPrototypeOf(Vector).apply(this, arguments));
  }

  _createClass(Vector, [{
    key: "onCreate",
    value: function onCreate(args) {
      args.guide = true;
      args.material = DEFAULT_GUIDE_MATERIAL;
      args.drawmode = "LINE_STRIP";
      args.points = args.points || [];
      this.points = args.points;
      this.color = [1, 1, 1];
    }
  }, {
    key: "update",
    value: function update() {
      this._buffer = null;
    }
  }, {
    key: "vertecies",
    get: function get() {
      var vertArray = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var p = _step.value;
          var x = p.x,
              y = p.y,
              z = p.z;
          vertArray.push.apply(vertArray, [x, y, z, 0, 0].concat(_toConsumableArray(this.color)));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return vertArray;
    }
  }]);

  return Vector;
}(_Geometry2.Geometry);

exports.Vector = Vector;
},{"../materials/DefaultMaterial":"../../src/materials/DefaultMaterial.js","../scene/Geometry":"../../src/scene/Geometry.js"}],"../../src/geo/Voxel.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Voxel = void 0;

var _Cube2 = require("./Cube.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Voxel =
/*#__PURE__*/
function (_Cube) {
  _inherits(Voxel, _Cube);

  function Voxel() {
    _classCallCheck(this, Voxel);

    return _possibleConstructorReturn(this, _getPrototypeOf(Voxel).apply(this, arguments));
  }

  _createClass(Voxel, [{
    key: "faces",
    get: function get() {
      var s = this.scale;
      var w = 10;
      var h = 10;
      var u = this.uv[0];
      var v = this.uv[1];
      var x = this.position.x;
      var y = -this.position.y;
      var z = this.position.z;
      return {
        TOP: [s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, s * h + z, 0 + u, 1 + v, 0, 1, 0],
        BOTTOM: [-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, -s * h + z, 1 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0],
        LEFT: [-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, -s * h + y, s * w + z, 1 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1, -s * w + x, s * h + y, s * w + z, 0 + u, 1 + v, 0, 0, 1, -s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1],
        RIGHT: [s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, s * w + x, -s * h + y, -s * w + z, 1 + u, 0 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, -s * w + x, s * h + y, -s * w + z, 0 + u, 1 + v, 0, 0, -1],
        FRONT: [s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0],
        BACK: [-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, -1, 0, 0]
      };
    }
  }]);

  return Voxel;
}(_Cube2.Cube);

exports.Voxel = Voxel;
},{"./Cube.js":"../../src/geo/Cube.js"}],"../../src/geo/*.*":[function(require,module,exports) {
module.exports = {
  "Cube": {
    "js": require("./Cube.js")
  },
  "Emitter": {
    "js": require("./Emitter.js")
  },
  "Cursor": {
    "js": require("./Cursor.js")
  },
  "Grid": {
    "js": require("./Grid.js")
  },
  "Group": {
    "js": require("./Group.js")
  },
  "Guide": {
    "js": require("./Guide.js")
  },
  "Plane": {
    "js": require("./Plane.js")
  },
  "Sphere": {
    "js": require("./Sphere.js")
  },
  "Terrain": {
    "js": require("./Terrain.js")
  },
  "Vector": {
    "js": require("./Vector.js")
  },
  "Voxel": {
    "js": require("./Voxel.js")
  }
};
},{"./Cube.js":"../../src/geo/Cube.js","./Emitter.js":"../../src/geo/Emitter.js","./Cursor.js":"../../src/geo/Cursor.js","./Grid.js":"../../src/geo/Grid.js","./Group.js":"../../src/geo/Group.js","./Guide.js":"../../src/geo/Guide.js","./Plane.js":"../../src/geo/Plane.js","./Sphere.js":"../../src/geo/Sphere.js","./Terrain.js":"../../src/geo/Terrain.js","./Vector.js":"../../src/geo/Vector.js","./Voxel.js":"../../src/geo/Voxel.js"}],"../../src/camera/*.*":[function(require,module,exports) {
module.exports = {};
},{}],"../../src/light/Pointlight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pointlight = void 0;

var _DefaultMaterial = _interopRequireDefault(require("../materials/DefaultMaterial"));

var _Sphere2 = require("../geo/Sphere");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Pointlight =
/*#__PURE__*/
function (_Sphere) {
  _inherits(Pointlight, _Sphere);

  function Pointlight() {
    _classCallCheck(this, Pointlight);

    return _possibleConstructorReturn(this, _getPrototypeOf(Pointlight).apply(this, arguments));
  }

  _createClass(Pointlight, [{
    key: "onCreate",
    value: function onCreate(args) {
      _get(_getPrototypeOf(Pointlight.prototype), "onCreate", this).call(this, args);

      var _args$intensity = args.intensity,
          intensity = _args$intensity === void 0 ? 0.5 : _args$intensity,
          _args$color = args.color,
          color = _args$color === void 0 ? [1, 1, 1] : _args$color,
          _args$size = args.size,
          size = _args$size === void 0 ? 8 : _args$size;
      this.intensity = intensity;
      this.color = color;
      this.size = size;
      this.scale = 20;
      args.material = new _DefaultMaterial.default();
      args.material.diffuseColor = this.color;
      args.material.specular = 0;
      args.material.receiveShadows = false;
    }
  }, {
    key: "isLight",
    get: function get() {
      return true;
    }
  }]);

  return Pointlight;
}(_Sphere2.Sphere);

exports.Pointlight = Pointlight;
},{"../materials/DefaultMaterial":"../../src/materials/DefaultMaterial.js","../geo/Sphere":"../../src/geo/Sphere.js"}],"../../src/light/*.*":[function(require,module,exports) {
module.exports = {
  "Pointlight": {
    "js": require("./Pointlight.js")
  },
  "Spotlight": {
    "js": require("./Spotlight.js")
  }
};
},{"./Pointlight.js":"../../src/light/Pointlight.js","./Spotlight.js":"../../src/light/Spotlight.js"}],"../../src/Loader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Loader = void 0;

var _Material = require("./materials/Material");

var _Resources = require("./Resources");

var _Texture = require("./materials/Texture");

var _Logger = require("./Logger");

var _Scene = require("./scene/Scene");

var Geometry = _interopRequireWildcard(require("./geo/*.*"));

var Camera = _interopRequireWildcard(require("./camera/*.*"));

var Light = _interopRequireWildcard(require("./light/*.*"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var logger = new _Logger.Logger('Loader');

var Loader =
/*#__PURE__*/
function () {
  function Loader() {
    _classCallCheck(this, Loader);
  }

  _createClass(Loader, null, [{
    key: "loadScene",
    value: function loadScene(json, camera) {
      var objects = [].concat(_toConsumableArray(json.objects), _toConsumableArray(json.cameras));
      var scene = new _Scene.Scene(camera);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;
          var Category = Geometry;
          if (obj.type in Geometry) Category = Geometry;
          if (obj.type in Light) Category = Light;
          if (obj.type in Camera) Category = Camera;
          if (obj.type == 'Cursor' || obj.type == 'Grid') continue;
          var geo = new Category[obj.type].js[obj.type]();
          geo = Object.assign(geo, obj);
          scene.add(geo);

          if (obj.type in Camera) {
            scene.activeCamera = geo;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return scene;
    }
  }, {
    key: "saveScene",
    value: function saveScene(scene) {
      var objects = _toConsumableArray(scene.objects);

      var camera = scene.activeCamera;
      var json = {
        cameras: [{
          type: camera.constructor.name,
          position: camera.position,
          rotation: camera.rotation,
          fov: camera.fov,
          scale: camera.scale
        }],
        objects: _toConsumableArray(objects.map(function (obj) {
          return {
            type: obj.constructor.name,
            position: obj.position,
            rotation: obj.rotation,
            scale: obj.scale,
            id: obj.id
          };
        })),
        animation: []
      };
      return json;
    }
  }, {
    key: "loadObjFile",
    value: function loadObjFile(objFile) {
      var vertecies = [];
      var face = null;
      var fface = null;

      try {
        objFile.faces.forEach(function (f, i) {
          for (var _i = 0; _i < 3; _i++) {
            fface = f;
            face = f[_i];
            var vertex = objFile.vertecies[face[0] - 1];
            var uv = objFile.uvs[face[1] - 1];
            var normal = objFile.normals[face[2] - 1];

            if (vertex && uv && normal) {
              vertecies.push(vertex[0], vertex[1], vertex[2], uv[0], uv[1], normal[0], normal[1], normal[2]);
            }
          }

          if (f.length > 3) {
            [2, 3, 0].forEach(function (i) {
              face = f[i];
              var vertex = objFile.vertecies[face[0] - 1];
              var uv = objFile.uvs[face[1] - 1];
              var normal = objFile.normals[face[2] - 1];

              if (vertex && uv && normal) {
                vertecies.push(vertex[0], vertex[1], vertex[2], uv[0], uv[1], normal[0], normal[1], normal[2]);
              }
            });
          }
        });
      } catch (err) {
        console.error(face, fface);
        console.error(err);
      }

      return vertecies;
    }
  }, {
    key: "createMatFromJson",
    value: function createMatFromJson(name, json) {
      var mat = new _Material.Material(name);
      Object.assign(mat, json);

      if (json.texture) {
        var texImage = _Resources.Resources.get(json.texture);

        var texture = new _Texture.Texture(texImage);
        mat.texture = texture;

        if (!texImage) {
          logger.error('could not find texture on Material', name);
        }
      }

      if (json.specularMap) {
        var reflectionImage = _Resources.Resources.get(json.specularMap);

        var reflectionTexture = new _Texture.Texture(reflectionImage);
        mat.specularMap = reflectionTexture;

        if (!reflectionImage) {
          logger.error('could not find specularMap on Material', name);
        }
      }

      if (json.displacementMap) {
        var displacementImage = _Resources.Resources.get(json.displacementMap);

        var displacementMap = new _Texture.Texture(displacementImage);
        mat.displacementMap = displacementMap;

        if (!displacementImage) {
          logger.error('could not find displacementMap on Material', name);
        }
      }

      return mat;
    }
  }]);

  return Loader;
}();

exports.Loader = Loader;
},{"./materials/Material":"../../src/materials/Material.js","./Resources":"../../src/Resources.js","./materials/Texture":"../../src/materials/Texture.js","./Logger":"../../src/Logger.js","./scene/Scene":"../../src/scene/Scene.js","./geo/*.*":"../../src/geo/*.*","./camera/*.*":"../../src/camera/*.*","./light/*.*":"../../src/light/*.*"}],"../../src/renderer/GLShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLShader = void 0;

var _Texture = require("../materials/Texture");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GLShader =
/*#__PURE__*/
function () {
  function GLShader() {
    _classCallCheck(this, GLShader);

    _defineProperty(this, "_vertShader", null);

    _defineProperty(this, "_fragShader", null);

    _defineProperty(this, "_uniforms", null);

    _defineProperty(this, "_attributes", null);

    _defineProperty(this, "uniform", {});

    _defineProperty(this, "initialized", false);
  }

  _createClass(GLShader, [{
    key: "setUniforms",
    value: function setUniforms(renderer, attributes, target) {
      var uniforms = this._uniforms;
      var gl = renderer.gl;
      var textureSlots = 1;
      var textures = [];

      for (var key in attributes) {
        var opt = key;

        if (target != null) {
          opt = target + '.' + key;
        }

        var value = attributes[key];
        var uniform = uniforms[opt];

        if (Array.isArray(value)) {
          gl.uniform3fv(uniform, value);
        } else if (value instanceof _Texture.Texture) {
          renderer.prepareTexture(value);
          textures.push({
            texture: value,
            uniformloc: opt
          });
        } else {
          var type = _typeof(value);

          switch (type) {
            case 'number':
              gl.uniform1f(uniform, value);
              break;

            case 'boolean':
              gl.uniform1i(uniform, value);
              break;
          }
        }
      }

      for (var _i = 0, _textures = textures; _i < _textures.length; _i++) {
        var tex = _textures[_i];
        renderer.useTexture(tex.texture, tex.uniformloc, textureSlots);
        textureSlots++;
      }
    }
  }, {
    key: "vertexShader",
    get: function get() {
      return this._vertShader;
    }
  }, {
    key: "fragementShader",
    get: function get() {
      return this._fragShader;
    }
  }, {
    key: "uniforms",
    get: function get() {
      return this._uniforms;
    }
  }, {
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "source",
    get: function get() {
      return [this.constructor.vertexSource(), this.constructor.fragmentSource()];
    }
  }], [{
    key: "vertexSource",
    value: function vertexSource() {}
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {}
  }]);

  return GLShader;
}();

exports.GLShader = GLShader;
},{"../materials/Texture":"../../src/materials/Texture.js"}],"../../src/renderer/GL.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLContext = void 0;

var _GLShader = require("./GLShader");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GLContext =
/*#__PURE__*/
function () {
  _createClass(GLContext, [{
    key: "onCreate",
    value: function onCreate() {// on create method
    }
  }, {
    key: "enable",
    value: function enable(constant) {
      this.gl.enable(constant);
    }
  }, {
    key: "disable",
    value: function disable(constant) {
      this.gl.disable(constant);
    }
  }, {
    key: "width",
    get: function get() {
      return this.gl.canvas.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.gl.canvas.height;
    }
  }, {
    key: "aspectratio",
    get: function get() {
      return this.width / this.height;
    }
  }]);

  function GLContext(canvas) {
    _classCallCheck(this, GLContext);

    _defineProperty(this, "currentShader", null);

    _defineProperty(this, "framebuffers", new Map());

    _defineProperty(this, "bufferTextures", new Map());

    _defineProperty(this, "shaders", new Map());

    _defineProperty(this, "options", {
      DEPTH_TEST: true,
      CULL_FACE: true,
      BLEND: true // canvas sizes

    });

    if (!canvas) throw "GLContext: Err: no canvas";
    this.getContext(canvas);
    this.onCreate(); // enable gl options

    this.setOptions(this.options);
  }

  _createClass(GLContext, [{
    key: "setOptions",
    value: function setOptions(options) {
      for (var opt in options) {
        if (options[opt] === true) {
          this.gl.enable(this.gl[opt]);
        }
      }
    } // set viewport resolution

  }, {
    key: "viewport",
    value: function viewport(width, height) {
      this.gl.viewport(0, 0, width, height);
    } // set canvas and viewport resolution

  }, {
    key: "setResolution",
    value: function setResolution(width, height) {
      this.gl.canvas.width = width;
      this.gl.canvas.height = height;
      this.viewport(this.width, this.height);
    } // clear framebuffer

  }, {
    key: "clear",
    value: function clear() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    } // get webgl context from canvas

  }, {
    key: "getContext",
    value: function getContext(canvas) {
      this.canvas = canvas;
      var ctxtOpts = {
        alpha: false,
        desynchronized: true,
        preserveDrawingBuffer: true
      };
      this.gl = canvas.getContext("webgl2", ctxtOpts) || canvas.getContext("webgl", ctxtOpts);
      this.gl.cullFace(this.gl.BACK);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    } // use webgl shader

  }, {
    key: "useShader",
    value: function useShader(shader) {
      if (!shader.initialized) {
        this.prepareShader(shader);
      }

      this.gl.useProgram(shader.program);
      shader.setUniforms(this, shader.uniform);
      this.currentShader = shader;
    } // use webgl texture

  }, {
    key: "useTextureBuffer",
    value: function useTextureBuffer(gltexture, type, uniformStr, slot) {
      if (uniformStr) {
        this.gl.activeTexture(this.gl["TEXTURE" + slot]);
        this.gl.bindTexture(type, gltexture);
        this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
      } else {
        this.gl.bindTexture(type, gltexture);
      }
    } // use framebuffer

  }, {
    key: "useFramebuffer",
    value: function useFramebuffer(nameOrFBO) {
      if (this.framebuffers.has(nameOrFBO)) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.get(nameOrFBO));
      } else {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, nameOrFBO);
      }
    } // unbind framebuffer

  }, {
    key: "clearFramebuffer",
    value: function clearFramebuffer() {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    } // get framebuffer texture from cache

  }, {
    key: "getBufferTexture",
    value: function getBufferTexture(name) {
      return this.bufferTextures.get(name);
    } // initialize webgl shader

  }, {
    key: "prepareShader",
    value: function prepareShader(shader) {
      var gl = this.gl;

      if (shader instanceof _GLShader.GLShader) {
        if (shader.source) {
          shader._vertShader = this.compileShader(shader.source[0], gl.VERTEX_SHADER);
          shader._fragShader = this.compileShader(shader.source[1], gl.FRAGMENT_SHADER);
          shader.program = this.createProgram(shader._vertShader, shader._fragShader);
          shader._uniforms = this.getUniforms(shader.program);
          shader._attributes = this.getAttributes(shader.program);
          shader.initialized = true;
        }

        this.shaders.set(shader.name, shader);
        return shader.program;
      }
    } // get attributes from shader program

  }, {
    key: "getAttributes",
    value: function getAttributes(program) {
      var gl = this.gl;
      var attributes = {};
      var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

      for (var i = 0; i < numAttributes; ++i) {
        var name = gl.getActiveAttrib(program, i).name;
        attributes[name] = gl.getAttribLocation(program, name);
      }

      return attributes;
    } // get uniforms from shader program

  }, {
    key: "getUniforms",
    value: function getUniforms(program) {
      var gl = this.gl;
      var uniforms = {};
      var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

      for (var i = 0; i < numUniforms; ++i) {
        var name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }

      return uniforms;
    } // compile glsl shader

  }, {
    key: "compileShader",
    value: function compileShader(src, type) {
      var gl = this.gl;
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(src);
        throw new Error(gl.getShaderInfoLog(shader));
      }

      return shader;
    } // use vertex array object

  }, {
    key: "useVAO",
    value: function useVAO(VAO) {
      this.gl.bindVertexArray(VAO);
    } // create vertex array object

  }, {
    key: "createVAO",
    value: function createVAO() {
      var VAO = this.gl.createVertexArray();
      this.gl.bindVertexArray(VAO);
      return VAO;
    } // create webgl framebuffer objects

  }, {
    key: "createFramebuffer",
    value: function createFramebuffer(name, width, height) {
      var _this = this;

      var gl = this.gl;
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      this.framebuffers.set(name, fbo);
      var textures = {
        color: null,
        depth: null
      };
      return {
        get colorTexture() {
          return textures.color;
        },

        get depthTexture() {
          return textures.depth;
        },

        colorbuffer: function colorbuffer() {
          var renderTraget = _this.createBufferTexture(width, height);

          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTraget, 0);

          var depthTexture = _this.createDepthTexture(width, height);

          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
          textures.color = renderTraget;
          textures.depth = depthTexture;

          if (name) {
            _this.bufferTextures.set(name + '.depth', textures.depth);

            _this.bufferTextures.set(name, textures.color);
          }

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          return fbo;
        },
        depthbuffer: function depthbuffer() {
          var depthTexture = _this.createDepthTexture(width, height);

          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          textures.depth = depthTexture;

          if (name) {
            _this.bufferTextures.set(name, textures.depth);
          }

          return fbo;
        }
      };
    } // create shader program

  }, {
    key: "createProgram",
    value: function createProgram(vertShader, fragShader) {
      var gl = this.gl;
      var program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
      }

      return program;
    } // create framebuffer depth texture

  }, {
    key: "createDepthTexture",
    value: function createDepthTexture(w, h) {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      return texture;
    } // create framebuffer texture

  }, {
    key: "createBufferTexture",
    value: function createBufferTexture(w, h) {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      return texture;
    } // update webgl texture

  }, {
    key: "updateTextureBuffer",
    value: function updateTextureBuffer(texture, image) {
      var gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.bindTexture(gl.TEXTURE_2D, null);
    } // create webgl texture

  }, {
    key: "createTexture",
    value: function createTexture(image, noMipmap) {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

      if (image) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([0]));
      }

      if (!noMipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }

      gl.bindTexture(gl.TEXTURE_2D, null);
      return texture;
    } // prepare geometry buffers for draw

  }, {
    key: "initializeBuffersAndAttributes",
    value: function initializeBuffersAndAttributes(bufferInfo) {
      var gl = this.gl;
      var attributes = this.currentShader.attributes; // exit if verts are meptyy

      if (bufferInfo.vertecies.length < 1) return;
      var newbuffer = !bufferInfo.indexBuffer || !bufferInfo.vertexBuffer; // create new buffers

      if (newbuffer) {
        // bufferInfo.vao = this.createVAO();
        bufferInfo.indexBuffer = gl.createBuffer();
        bufferInfo.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indecies, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.vertexBuffer);
      }

      var bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;
      var lastAttrSize = 0;
      var bufferAttributes = bufferInfo.attributes;

      for (var i = 0; i < bufferInfo.attributes.length; i++) {
        gl.vertexAttribPointer(attributes[bufferAttributes[i].attribute], bufferAttributes[i].size, gl.FLOAT, false, bufferInfo.elements * bpe, lastAttrSize * bpe);
        gl.enableVertexAttribArray(attributes[bufferAttributes[i].attribute]);
        lastAttrSize += bufferAttributes[i].size;
      }
    }
  }]);

  return GLContext;
}();

exports.GLContext = GLContext;
},{"./GLShader":"../../src/renderer/GLShader.js"}],"../../res/shader/comp.fragment.shader":[function(require,module,exports) {
module.exports = "/comp.fragment.ec704667.shader";
},{}],"../../src/shader/FinalShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GLShader2 = require("../renderer/GLShader.js");

var _Resources = require("../Resources.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

_Resources.Resources.add({
  'comp.fs': require('../../res/shader/comp.fragment.shader')
}, false);

var FinalShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(FinalShader, _GLShader);

  function FinalShader() {
    _classCallCheck(this, FinalShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(FinalShader).apply(this, arguments));
  }

  _createClass(FinalShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return "#version 300 es\n\n        layout(location = 0) in vec3 aPosition;\n        layout(location = 1) in vec2 aTexCoords;\n\n        uniform float aspectRatio;\n\n        out vec2 vTexCoords;\n        \n        void main() {\n            gl_Position = vec4(aPosition, 1.0);\n            vTexCoords = aTexCoords;\n        }";
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return _Resources.Resources.get('comp.fs');
    }
  }]);

  return FinalShader;
}(_GLShader2.GLShader);

exports.default = FinalShader;
},{"../renderer/GLShader.js":"../../src/renderer/GLShader.js","../Resources.js":"../../src/Resources.js","../../res/shader/comp.fragment.shader":"../../res/shader/comp.fragment.shader"}],"../../res/shader/gbuffer.vertex.shader":[function(require,module,exports) {
module.exports = "/gbuffer.vertex.4d1e9fd6.shader";
},{}],"../../src/shader/ColorShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resources = require("../Resources.js");

var _GLShader2 = require("../renderer/GLShader.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

_Resources.Resources.add({
  'gbuffer.vs': require('../../res/shader/gbuffer.vertex.shader')
}, false);

var ColorShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(ColorShader, _GLShader);

  function ColorShader() {
    _classCallCheck(this, ColorShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(ColorShader).apply(this, arguments));
  }

  _createClass(ColorShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n            precision mediump float;\n            \n            in vec2 vTexCoords;\n            in vec3 vNormal;\n            in float id;\n            \n            struct Material {\n                sampler2D texture;\n                sampler2D specularMap;\n                sampler2D normalMap;\n                sampler2D displacementMap;\n                vec3 diffuseColor;\n                float specular;\n                float roughness;\n                float metallic;\n                float transparency;\n                float textureScale;\n                bool scaleUniform;\n                bool selected;\n            };\n            uniform Material material;\n            \n            out vec4 oFragColor;\n            \n            void main() {\n                vec2 imageSize = vec2(textureSize(material.texture, 0));\n                vec2 textureCoords = vTexCoords / (imageSize.x / material.textureScale);\n            \n                vec4 color = vec4(0.0);\n            \n                vec4 tcolor = texture(material.texture, textureCoords);\n                bool emptyTexture = (tcolor.r + tcolor.g + tcolor.b) == 0.0;\n            \n                if(emptyTexture) {\n                    color += vec4(material.diffuseColor, 1.0 - material.transparency);\n                } else {\n                    color += tcolor;\n                }\n            \n                oFragColor = vec4(color.rgb, 1.0 - material.transparency);\n            }\n        ";
    }
  }]);

  return ColorShader;
}(_GLShader2.GLShader);

exports.default = ColorShader;
},{"../Resources.js":"../../src/Resources.js","../renderer/GLShader.js":"../../src/renderer/GLShader.js","../../res/shader/gbuffer.vertex.shader":"../../res/shader/gbuffer.vertex.shader"}],"../../src/shader/PrimitiveShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GLShader2 = require("../renderer/GLShader");

var _Resources = require("../Resources.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var PickingShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(PickingShader, _GLShader);

  function PickingShader() {
    _classCallCheck(this, PickingShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(PickingShader).apply(this, arguments));
  }

  _createClass(PickingShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n        \n        precision mediump float;\n        \n        struct Material {\n            sampler2D texture;\n            sampler2D specularMap;\n            sampler2D normalMap;\n            sampler2D displacementMap;\n            vec3 diffuseColor;\n            float specular;\n            float roughness;\n            float metallic;\n            float transparency;\n            float textureScale;\n            bool scaleUniform;\n            bool selected;\n        };\n        uniform Material material;\n\n        in vec3 primitiveColor;\n        \n        out vec4 oFragColor;\n        \n        void main () {\n            oFragColor = vec4(primitiveColor, .75);\n\n            if(material.selected) {\n                oFragColor = oFragColor + vec4(0.33, 0.33, 0.33, 1.0);\n            }\n        }";
    }
  }]);

  return PickingShader;
}(_GLShader2.GLShader);

exports.default = PickingShader;
},{"../renderer/GLShader":"../../src/renderer/GLShader.js","../Resources.js":"../../src/Resources.js"}],"../../src/shader/MattShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resources = require("../Resources.js");

var _GLShader2 = require("../renderer/GLShader");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var MattShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(MattShader, _GLShader);

  function MattShader() {
    _classCallCheck(this, MattShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(MattShader).apply(this, arguments));
  }

  _createClass(MattShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n            precision mediump float;\n            \n            in float id;\n            \n            out vec4 oFragColor;\n            \n            void main () {\n                float c = id / 255.0;\n                oFragColor = vec4(c, c, c, 1.0);\n            }\n        ";
    }
  }]);

  return MattShader;
}(_GLShader2.GLShader);

exports.default = MattShader;
},{"../Resources.js":"../../src/Resources.js","../renderer/GLShader":"../../src/renderer/GLShader.js"}],"../../src/shader/NormalShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resources = require("../Resources.js");

var _GLShader2 = require("../renderer/GLShader.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var NormalShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(NormalShader, _GLShader);

  function NormalShader() {
    _classCallCheck(this, NormalShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(NormalShader).apply(this, arguments));
  }

  _createClass(NormalShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n            precision mediump float;\n            \n            struct Material {\n                sampler2D texture;\n                sampler2D specularMap;\n                sampler2D normalMap;\n                sampler2D displacementMap;\n                vec3 diffuseColor;\n                float specular;\n                float roughness;\n                float metallic;\n                float transparency;\n                float textureScale;\n                bool scaleUniform;\n                bool selected;\n            };\n            uniform Material material;\n\n            struct SceneProjection {\n                mat4 model;\n                mat4 view;\n                mat4 projection;\n            };\n            in SceneProjection sceneProjection;\n\n            in vec3 vNormal;\n            in vec2 vTexCoords;\n            \n            out vec4 oFragColor;\n            \n            void main() {\n                vec4 normal = vec4(vNormal, 1.0);\n                vec4 map = texture(material.normalMap, vTexCoords);\n                if(map.r > 0.0) {\n                    normal = normalize(map * 2.0 - 1.0);\n                }\n                oFragColor = vec4(normal.xyz, 1.0);\n            }\n        ";
    }
  }]);

  return NormalShader;
}(_GLShader2.GLShader);

exports.default = NormalShader;
},{"../Resources.js":"../../src/Resources.js","../renderer/GLShader.js":"../../src/renderer/GLShader.js"}],"../../src/shader/WorldShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resources = require("../Resources.js");

var _GLShader2 = require("../renderer/GLShader.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var WorldShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(WorldShader, _GLShader);

  function WorldShader() {
    _classCallCheck(this, WorldShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(WorldShader).apply(this, arguments));
  }

  _createClass(WorldShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n            precision mediump float;\n            \n            in vec4 vWorldPos;\n            out vec4 oFragColor;\n            \n            void main() {\n                oFragColor = vec4(vWorldPos.xyz * 0.015, 1.0);\n            }\n        ";
    }
  }]);

  return WorldShader;
}(_GLShader2.GLShader);

exports.default = WorldShader;
},{"../Resources.js":"../../src/Resources.js","../renderer/GLShader.js":"../../src/renderer/GLShader.js"}],"../../src/shader/UVShader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resources = require("../Resources.js");

var _GLShader2 = require("../renderer/GLShader.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var UVShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(UVShader, _GLShader);

  function UVShader() {
    _classCallCheck(this, UVShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(UVShader).apply(this, arguments));
  }

  _createClass(UVShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n            precision mediump float;\n            \n            in vec2 vTexCoords;\n            out vec4 oFragColor;\n            \n            void main() {\n                oFragColor = vec4(vTexCoords.xy, 1.0, 1.0);\n            }\n        ";
    }
  }]);

  return UVShader;
}(_GLShader2.GLShader);

exports.default = UVShader;
},{"../Resources.js":"../../src/Resources.js","../renderer/GLShader.js":"../../src/renderer/GLShader.js"}],"../../src/shader/SpecularShader .js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resources = require("../Resources.js");

var _GLShader2 = require("../renderer/GLShader.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var SpecularShader =
/*#__PURE__*/
function (_GLShader) {
  _inherits(SpecularShader, _GLShader);

  function SpecularShader() {
    _classCallCheck(this, SpecularShader);

    return _possibleConstructorReturn(this, _getPrototypeOf(SpecularShader).apply(this, arguments));
  }

  _createClass(SpecularShader, null, [{
    key: "vertexSource",
    value: function vertexSource() {
      return _Resources.Resources.get('gbuffer.vs');
    }
  }, {
    key: "fragmentSource",
    value: function fragmentSource() {
      return "#version 300 es\n            precision mediump float;\n            \n            struct Material {\n                sampler2D texture;\n                sampler2D specularMap;\n                sampler2D normalMap;\n                sampler2D displacementMap;\n                vec3 diffuseColor;\n                float specular;\n                float roughness;\n                float metallic;\n                float transparency;\n                float textureScale;\n                bool scaleUniform;\n                bool selected;\n            };\n            uniform Material material;\n\n            in vec2 vTexCoords;\n            \n            out vec4 oFragColor;\n            \n            void main() {\n                vec4 map = texture(material.specularMap, vTexCoords);\n                oFragColor = map;\n            }\n        ";
    }
  }]);

  return SpecularShader;
}(_GLShader2.GLShader);

exports.default = SpecularShader;
},{"../Resources.js":"../../src/Resources.js","../renderer/GLShader.js":"../../src/renderer/GLShader.js"}],"../../src/renderer/Renderer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RenderPass = exports.Renderer = void 0;

var _GL = require("../renderer/GL");

var _FinalShader = _interopRequireDefault(require("../shader/FinalShader"));

var _ColorShader = _interopRequireDefault(require("../shader/ColorShader"));

var _PrimitiveShader = _interopRequireDefault(require("../shader/PrimitiveShader"));

var _Logger = require("../Logger");

var _Config = _interopRequireDefault(require("../Config"));

var _glMatrix = require("gl-matrix");

var _Math = require("../Math");

var _MattShader = _interopRequireDefault(require("../shader/MattShader"));

var _Pointlight = require("../light/Pointlight");

var _NormalShader = _interopRequireDefault(require("./../shader/NormalShader"));

var _Geometry2 = require("../scene/Geometry");

var _WorldShader = _interopRequireDefault(require("./../shader/WorldShader"));

var _UVShader = _interopRequireDefault(require("./../shader/UVShader"));

var _SpecularShader = _interopRequireDefault(require("./../shader/SpecularShader "));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var logger = new _Logger.Logger('Renderer');

var Screen =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Screen, _Geometry);

  function Screen() {
    _classCallCheck(this, Screen);

    return _possibleConstructorReturn(this, _getPrototypeOf(Screen).apply(this, arguments));
  }

  _createClass(Screen, [{
    key: "vertecies",
    get: function get() {
      return [-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, -1, 1, 0, 0, 1, -1, -1, 0, 0, 0];
    }
  }]);

  return Screen;
}(_Geometry2.Geometry);

_defineProperty(Screen, "attributes", [{
  size: 3,
  attribute: "aPosition"
}, {
  size: 2,
  attribute: "aTexCoords"
}]);

var Renderer =
/*#__PURE__*/
function (_GLContext) {
  _inherits(Renderer, _GLContext);

  function Renderer() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Renderer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Renderer)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "background", [0.08, 0.08, 0.08, 1.0]);

    return _this;
  }

  _createClass(Renderer, [{
    key: "setScene",
    value: function setScene(scene) {
      this.scene = scene;
    }
  }, {
    key: "updateViewport",
    value: function updateViewport() {
      this.scene.activeCamera.sensor = {
        width: this.width,
        height: this.height
      };
    }
  }, {
    key: "onCreate",
    value: function onCreate() {
      this.renderTarget = new Screen();
      this.setResolution.apply(this, _toConsumableArray(Renderer.defaults.resolution));
      this.shadowMapSize = 3096;
      var renderRes = this.width;
      this.renderPasses = [new RenderPass(this, 'shadow', new _ColorShader.default(), this.aspectratio, this.shadowMapSize, true), new RenderPass(this, 'normal', new _NormalShader.default(), this.aspectratio, renderRes), new RenderPass(this, 'uv', new _UVShader.default(), this.aspectratio, renderRes), new RenderPass(this, 'spec', new _SpecularShader.default(), this.aspectratio, renderRes), new RenderPass(this, 'world', new _WorldShader.default(), this.aspectratio, renderRes), new RenderPass(this, 'color', new _ColorShader.default(), this.aspectratio, renderRes), new RenderPass(this, 'guides', new _PrimitiveShader.default(), this.aspectratio, renderRes), new RenderPass(this, 'id', new _MattShader.default(), this.aspectratio, renderRes)];
      this.compShader = new _FinalShader.default();
      this.readings = {};
      logger.log("Resolution set to ".concat(this.width, "x").concat(this.height));
    }
  }, {
    key: "draw",
    value: function draw() {
      if (!this.scene) return;
      var frameTime = performance.now();

      if (this.lastFrameTime) {
        // update textures
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.scene.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var geo = _step.value;

            if (geo.material && geo.material.animated) {
              this.updateTextureBuffer(geo.material.texture.gltexture, geo.material.texture.image);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.renderMultiPasses(this.renderPasses);
        this.compositePasses(this.renderPasses);
        this.frameTime = frameTime - this.lastFrameTime;
      }

      this.lastFrameTime = frameTime;
    }
  }, {
    key: "renderMultiPasses",
    value: function renderMultiPasses(passes) {
      var _this2 = this;

      var gl = this.gl;
      var camera = this.scene.activeCamera;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop = function _loop() {
          var pass = _step2.value;
          var cullDefault = gl.isEnabled(gl.CULL_FACE);
          pass.use();

          _this2.useShader(pass.shader);

          switch (pass.id) {
            case "shadow":
              _this2.drawScene(_this2.scene, _this2.scene.lightSources, function (obj) {
                return obj.material.castShadows;
              });

              break;

            case "guides":
              if (cullDefault) _this2.disable(gl.CULL_FACE);

              _this2.drawScene(_this2.scene, camera, function (obj) {
                return obj.guide;
              });

              if (cullDefault) _this2.enable(gl.CULL_FACE);
              break;

            case "id":
              if (cullDefault) _this2.disable(gl.CULL_FACE);

              _this2.drawScene(_this2.scene, camera, function (obj) {
                if (obj.id != null) {
                  gl.uniform1f(pass.shader.uniforms.geoid, obj.id);
                  return true;
                }

                return false;
              });

              _this2.disable(gl.DEPTH_TEST);

              var curosr = _this2.scene.curosr;
              gl.uniform1f(pass.shader.uniforms.geoid, curosr.id);

              _this2.drawMesh(curosr);

              _this2.enable(gl.DEPTH_TEST);

              if (cullDefault) _this2.enable(gl.CULL_FACE);
              break;

            default:
              _this2.drawScene(_this2.scene, camera, function (obj) {
                return !obj.guide;
              });

          }

          if (pass.id in _this2.readings) {
            var read = _this2.readings[pass.id];

            if (!read.value) {
              read.setValue(_this2.readPixels(read.x, read.y, 1, 1));
            }
          }
        };

        for (var _iterator2 = passes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.clearFramebuffer();
    }
  }, {
    key: "readPixelFromBuffer",
    value: function readPixelFromBuffer(x, y, buffer) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.readings[buffer] = {
          x: x,
          y: y,
          value: null,
          setValue: function setValue(value) {
            this.value = value;
            resolve(value);
          }
        };
      });
    }
  }, {
    key: "readPixels",
    value: function readPixels() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var w = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      var gl = this.gl;
      var pixels = new Uint8Array(w * h * 4);
      gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return pixels;
    }
  }, {
    key: "compositePasses",
    value: function compositePasses(passes) {
      var gl = this.gl;
      gl.clearColor.apply(gl, _toConsumableArray(this.background));
      this.clear();
      this.viewport(this.width, this.height);
      this.useShader(this.compShader);

      for (var i = 0; i < passes.length; i++) {
        var pass = passes[i];
        this.useTextureBuffer(pass.buffer, gl.TEXTURE_2D, pass.id + "Buffer", i);
      }

      this.useTextureBuffer(this.getBufferTexture('color.depth'), gl.TEXTURE_2D, 'depthBuffer', passes.length + 1);
      gl.uniformMatrix4fv(this.compShader.uniforms.lightProjViewMatrix, false, this.scene.lightSources.projViewMatrix);
      gl.uniform1i(this.compShader.uniforms.fog, this.fogEnabled);
      var lightCount = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.scene.objects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var light = _step3.value;

          if (light instanceof _Pointlight.Pointlight) {
            this.gl.uniform3fv(this.compShader.uniforms["lights[" + lightCount + "].position"], [light.position.x, light.position.y, light.position.z]);
            this.gl.uniform3fv(this.compShader.uniforms["lights[" + lightCount + "].color"], light.color);
            this.gl.uniform1f(this.compShader.uniforms["lights[" + lightCount + "].intensity"], light.intensity);
            this.gl.uniform1f(this.compShader.uniforms["lights[" + lightCount + "].size"], light.size);
            lightCount++;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.gl.uniform1i(this.compShader.uniforms.lightCount, lightCount);
      this.setupScene(this.compShader, this.scene.activeCamera);
      this.drawGeo(this.renderTarget);
      gl.clearColor(0, 0, 0, 0);
    } // give texture a .gltexture

  }, {
    key: "prepareTexture",
    value: function prepareTexture(texture) {
      if (!texture.gltexture) {
        texture.gltexture = this.createTexture(texture.image);
      }
    } // use a Texture

  }, {
    key: "useTexture",
    value: function useTexture(texture, uniformStr, slot) {
      var gltexture = texture ? texture.gltexture : null;
      var type = texture ? this.gl[texture.type] : null;
      this.useTextureBuffer(gltexture, type, uniformStr, slot);
    } // give material attributes to shader

  }, {
    key: "applyMaterial",
    value: function applyMaterial(shader, material) {
      shader.setUniforms(this, material, 'material');
    }
  }, {
    key: "setupGemoetry",
    value: function setupGemoetry(geo) {
      this.initializeBuffersAndAttributes(geo.buffer);
      geo.modelMatrix = geo.modelMatrix || _glMatrix.mat4.create();
      var modelMatrix = geo.modelMatrix;

      var position = _Math.Vec.add(geo.position, geo.origin);

      var rotation = geo.rotation;
      var scale = geo.scale;

      _glMatrix.mat4.identity(modelMatrix);

      _glMatrix.mat4.translate(modelMatrix, modelMatrix, position);

      _glMatrix.mat4.rotateX(modelMatrix, modelMatrix, rotation.x);

      _glMatrix.mat4.rotateY(modelMatrix, modelMatrix, rotation.y);

      _glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, rotation.z);

      _glMatrix.mat4.scale(modelMatrix, modelMatrix, new _Math.Vec(scale, scale, scale));

      this.gl.uniformMatrix4fv(this.currentShader.uniforms["scene.model"], false, modelMatrix);
    }
  }, {
    key: "setupScene",
    value: function setupScene(shader, camera) {
      this.gl.uniformMatrix4fv(shader.uniforms["scene.projection"], false, camera.projMatrix);
      this.gl.uniformMatrix4fv(shader.uniforms["scene.view"], false, camera.viewMatrix);
      this.gl.uniform3fv(shader.uniforms.cameraPosition, [camera.worldPosition.x, camera.worldPosition.y, camera.worldPosition.z]);
    }
  }, {
    key: "drawScene",
    value: function drawScene(scene, camera, filter) {
      var objects = scene.getRenderableObjects();
      var shader = this.currentShader;
      this.setupScene(shader, camera);
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = objects[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var obj = _step4.value;

          if (filter && filter(obj) || !filter) {
            this.drawMesh(obj);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: "drawMesh",
    value: function drawMesh(geo) {
      if (geo.material) {
        this.applyMaterial(this.currentShader, geo.material);

        if (geo.instanced) {
          this.drawGeoInstanced(geo);
        } else {
          this.drawGeo(geo);
        }
      }
    }
  }, {
    key: "drawGeoInstanced",
    value: function drawGeoInstanced(geo) {
      var gl = this.gl;
      var buffer = geo.buffer;
      var vertCount = buffer.vertecies.length / buffer.elements;
      this.setupGemoetry(geo);
      gl.drawArraysInstanced(gl[buffer.type], 0, vertCount, geo.instances);
    }
  }, {
    key: "drawGeo",
    value: function drawGeo(geo) {
      var gl = this.gl;
      var buffer = geo.buffer;
      this.setupGemoetry(geo);

      if (buffer.indecies.length > 0) {
        gl.drawElements(gl[buffer.type], buffer.indecies.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawArrays(gl[buffer.type], 0, buffer.vertecies.length / buffer.elements);
      }
    }
  }, {
    key: "renderCubemap",
    value: function renderCubemap(cubemap, camera) {
      var gl = this.gl;
      var initial = {
        rotation: new _Math.Vec(camera.rotation),
        position: new _Math.Vec(camera.position)
      };
      var shader = new _ColorShader.default();
      this.useShader(shader);
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

      for (var f = 0; f < 6; f++) {
        var target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + f;
        gl.texImage2D(target, 0, gl.RGBA, cubemap.width, cubemap.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }

      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      var faces = [{
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        rotation: new _Math.Vec(0, -90 / 180 * Math.PI, 0)
      }, {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        rotation: new _Math.Vec(0, 90 / 180 * Math.PI, 0)
      }, {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        rotation: new _Math.Vec(-90 / 180 * Math.PI, 0, 0)
      }, {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        rotation: new _Math.Vec(90 / 180 * Math.PI, 0, 0)
      }, {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        rotation: new _Math.Vec(0, 180 / 180 * Math.PI, 0)
      }, {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        rotation: new _Math.Vec(0, 0, 0)
      }];
      cubemap.gltexture = texture;
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      for (var _i = 0, _faces = faces; _i < _faces.length; _i++) {
        var face = _faces[_i];
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, face.target, texture, 0);
        camera.position.x = 0;
        camera.position.y = -650;
        camera.position.z = 0;
        camera.rotation.x = face.rotation.x;
        camera.rotation.y = face.rotation.y;
        camera.rotation.z = face.rotation.z;
        camera.fov = 75;
        camera.update();
        this.setResolution(cubemap.width, cubemap.height);
        this.updateViewport();
        this.clear();
        this.drawScene(this.scene, camera);
      }

      camera.position.x = initial.position.x;
      camera.position.y = initial.position.y;
      camera.position.z = initial.position.z;
      camera.rotation.x = initial.rotation.x;
      camera.rotation.y = initial.rotation.y;
      camera.rotation.z = initial.rotation.z;
      camera.fov = 90;
      this.setResolution(window.innerWidth, window.innerHeight);
      this.updateViewport();
    }
  }, {
    key: "gridEnabled",
    get: function get() {
      return _Config.default.global.getValue('drawGrid', true);
    }
  }, {
    key: "fogEnabled",
    get: function get() {
      return _Config.default.global.getValue('fogEnabled', true);
    }
  }]);

  return Renderer;
}(_GL.GLContext);

exports.Renderer = Renderer;

_defineProperty(Renderer, "defaults", {
  resolution: [window.innerWidth, window.innerHeight]
});

var RenderPass =
/*#__PURE__*/
function () {
  _createClass(RenderPass, [{
    key: "buffer",
    get: function get() {
      return this.renderer.getBufferTexture(this.id);
    }
  }, {
    key: "depthbuffer",
    get: function get() {
      return this.renderer.getBufferTexture(this.id + '.depth');
    }
  }]);

  function RenderPass(renderer, id, shader, ar, resolution, isDepthBuffer) {
    _classCallCheck(this, RenderPass);

    this.id = id;
    this.shader = shader;
    this.renderer = renderer;
    this.width = resolution;
    this.height = resolution / ar;
    this.fbo = null;

    if (isDepthBuffer) {
      this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
    } else {
      this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
    }
  }

  _createClass(RenderPass, [{
    key: "use",
    value: function use() {
      this.renderer.useFramebuffer(this.id);
      this.renderer.clear();
      this.renderer.viewport(this.width, this.height);
    }
  }]);

  return RenderPass;
}();

exports.RenderPass = RenderPass;
},{"../renderer/GL":"../../src/renderer/GL.js","../shader/FinalShader":"../../src/shader/FinalShader.js","../shader/ColorShader":"../../src/shader/ColorShader.js","../shader/PrimitiveShader":"../../src/shader/PrimitiveShader.js","../Logger":"../../src/Logger.js","../Config":"../../src/Config.js","gl-matrix":"../../node_modules/gl-matrix/esm/index.js","../Math":"../../src/Math.js","../shader/MattShader":"../../src/shader/MattShader.js","../light/Pointlight":"../../src/light/Pointlight.js","./../shader/NormalShader":"../../src/shader/NormalShader.js","../scene/Geometry":"../../src/scene/Geometry.js","./../shader/WorldShader":"../../src/shader/WorldShader.js","./../shader/UVShader":"../../src/shader/UVShader.js","./../shader/SpecularShader ":"../../src/shader/SpecularShader .js"}],"../../src/controlers/EntityControler.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityControler = void 0;

var _Entity = require("../scene/Entity");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EntityControler =
/*#__PURE__*/
function () {
  _createClass(EntityControler, null, [{
    key: "isMouseButton",
    value: function isMouseButton(e) {
      var mbutton;

      if (e.button != null) {
        if (e.buttons == 4) {
          mbutton = 2;
        } else {
          mbutton = e.buttons;
        }
      } else {
        mbutton = e.which;
      }

      return mbutton;
    }
  }]);

  function EntityControler(entity, viewport) {
    _classCallCheck(this, EntityControler);

    _defineProperty(this, "locked", false);

    if (!entity) throw "No entity";

    if (entity instanceof _Entity.Entity) {
      entity.addTrait(this.update.bind(this));
    }

    this.entity = entity;
    this.viewport = viewport;
    this.initKeyboard();
    this.initMouse();
  }

  _createClass(EntityControler, [{
    key: "update",
    value: function update(ms) {}
  }, {
    key: "lock",
    value: function lock() {
      this.locked = true;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.locked = false;
    }
  }, {
    key: "initKeyboard",
    value: function initKeyboard() {
      var _this = this;

      this.keyMap = new Map();
      window.addEventListener('keydown', function (e) {
        if (document.pointerLockElement != null) {
          e.preventDefault();

          _this.keyMap.set(e.key, true);
        }
      });
      window.addEventListener('keyup', function (e) {
        if (document.pointerLockElement != null) {
          e.preventDefault();
        }

        _this.keyMap.delete(e.key);
      });
    }
  }, {
    key: "checkKey",
    value: function checkKey(key) {
      if (!this.locked) {
        return this.keyMap.has(key);
      }

      return false;
    }
  }, {
    key: "initMouse",
    value: function initMouse() {}
  }]);

  return EntityControler;
}();

exports.EntityControler = EntityControler;
},{"../scene/Entity":"../../src/scene/Entity.js"}],"../../src/controlers/CursorController.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CursorControler = void 0;

var _EntityControler2 = require("./EntityControler");

var _Math = require("../Math");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CursorControler =
/*#__PURE__*/
function (_EntityControler) {
  _inherits(CursorControler, _EntityControler);

  function CursorControler() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, CursorControler);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(CursorControler)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "lastAction", {
      target: null,
      state: null,
      property: null
    });

    return _this;
  }

  _createClass(CursorControler, [{
    key: "initMouse",
    value: function initMouse() {
      var _this2 = this;

      var curosr = this.entity;
      var renderer = this.viewport.renderer;
      var camera = this.viewport.camera;
      var scene = this.viewport.scene;
      var moving = false;
      var hovering = false;
      var selected = null;
      var color = [0, 0, 0];

      var down = function down(e) {
        if (_EntityControler2.EntityControler.isMouseButton(e) == 1) {
          _this2.interaction(selected);

          if (hovering) {
            moving = selected == 1;
          }

          if (!moving) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = scene.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                if (obj.id == selected) {
                  _this2.viewport.setCursor(obj);

                  _this2.viewport.onselect(obj);

                  _this2.lastAction.target = curosr;
                  _this2.lastAction.property = 'position';
                  _this2.lastAction.state = new _Math.Vec(curosr.position);
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }
        }
      };

      var up = function up(e) {
        moving = false;
      };

      var startdelta = null;

      var move = function move(e) {
        test(e);

        if (moving) {
          var pos = _Math.Vec.multiply(curosr.position, new _Math.Vec(-1, -1, 1));

          var hitx = new _Math.Raycast(camera, e.x, e.y).hit(pos, new _Math.Vec(0, 1, 0)) || new _Math.Raycast(camera, e.x, e.y).hit(pos, new _Math.Vec(0, -1, 0));
          var hity = new _Math.Raycast(camera, e.x, e.y).hit(pos, new _Math.Vec(1, 0, 0)) || new _Math.Raycast(camera, e.x, e.y).hit(pos, new _Math.Vec(-1, 0, 0));
          if (!hitx && !hity) return;

          if (!startdelta) {
            startdelta = new _Math.Vec(hitx.position[0] - curosr.position[0], hity.position[1] - curosr.position[1], hitx.position[2] - curosr.position[2]);
          } else {
            var axis = color.indexOf(Math.max.apply(Math, _toConsumableArray(color)));

            if (axis == 1) {
              curosr.position[axis] = hity.position[axis] - startdelta[axis];
            } else {
              curosr.position[axis] = hitx.position[axis] - startdelta[axis];
            }
          }
        } else {
          startdelta = null;
        }
      };

      var test = function test(e) {
        var x = e.x;
        var y = _this2.viewport.renderer.height - e.y;

        if (!moving) {
          renderer.readPixelFromBuffer(x, y, 'id').then(function (value) {
            selected = value[0];
            hovering = selected == 1;
            _this2.entity.material.selected = hovering;
          });
          renderer.readPixelFromBuffer(x, y, 'guides').then(function (value) {
            color = value;
          });
        }
      };

      var keydown = function keydown(e) {
        if (e.ctrlKey) switch (e.key) {
          case "z":
            _this2.undo();

            break;
        }
      };

      this.viewport.addEventListener("contextmenu", function (e) {
        return e.preventDefault();
      });
      this.viewport.addEventListener("mousedown", function (e) {
        down(e);
      });
      this.viewport.addEventListener("mouseup", up);
      this.viewport.addEventListener("mousemove", move);
      window.addEventListener("keydown", keydown);
    }
  }, {
    key: "undo",
    value: function undo() {
      var action = this.lastAction;
      action.target[action.property][0] = action.state.x;
      action.target[action.property][1] = action.state.y;
      action.target[action.property][2] = action.state.z;
    }
  }, {
    key: "interaction",
    value: function interaction(objId) {}
  }]);

  return CursorControler;
}(_EntityControler2.EntityControler);

exports.CursorControler = CursorControler;
},{"./EntityControler":"../../src/controlers/EntityControler.js","../Math":"../../src/Math.js"}],"../../src/controlers/CameraControler.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CameraControler = void 0;

var _EntityControler2 = require("./EntityControler");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CameraControler =
/*#__PURE__*/
function (_EntityControler) {
  _inherits(CameraControler, _EntityControler);

  function CameraControler() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, CameraControler);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(CameraControler)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "sensivity", 0.0033);

    _defineProperty(_assertThisInitialized(_this), "speed", 20);

    return _this;
  }

  _createClass(CameraControler, [{
    key: "initMouse",
    value: function initMouse() {
      var _this2 = this;

      var entity = this.entity;

      var down = function down(e) {
        if (_EntityControler2.EntityControler.isMouseButton(e) == 2) {
          _this2.unlock();

          _this2.viewport.requestPointerLock();
        }
      };

      var move = function move(e) {
        if (document.pointerLockElement != null) {
          entity.rotation.y += e.movementX * _this2.sensivity;
          entity.rotation.x += e.movementY * _this2.sensivity;
          entity.rotation.x = entity.rotation.x % (Math.PI * 2);
          entity.rotation.y = entity.rotation.y % (Math.PI * 2);
          entity.rotation.x = Math.max(Math.min(entity.rotation.x, 1.5), -1.5);
        }
      };

      this.viewport.addEventListener("mousedown", down);
      this.viewport.addEventListener("mousemove", move);
    }
  }, {
    key: "up",
    value: function up() {
      var camera = this.entity;
      camera.position.y -= this.speed;
    }
  }, {
    key: "down",
    value: function down() {
      var camera = this.entity;
      camera.position.y += this.speed;
    }
  }, {
    key: "move",
    value: function move(dir) {
      var camera = this.entity;
      var speed = this.speed * dir;
      var a = -camera.rotation.y;
      var b = -camera.rotation.x;
      camera.position.x += speed * Math.sin(a);
      camera.position.z += speed * Math.cos(a);
      camera.position.y -= speed * Math.sin(b);
    }
  }, {
    key: "strafe",
    value: function strafe(dir) {
      var camera = this.entity;
      var speed = this.speed * dir;
      var a = camera.rotation.y;
      camera.position.z += speed * Math.sin(a);
      camera.position.x += speed * Math.cos(a);
    }
  }, {
    key: "update",
    value: function update() {
      if (this.checkKey("w")) this.move(1);
      if (this.checkKey("s")) this.move(-1);
      if (this.checkKey("a")) this.strafe(1);
      if (this.checkKey("d")) this.strafe(-1);
      if (this.checkKey("q")) this.up();
      if (this.checkKey("y")) this.down();
    }
  }, {
    key: "lock",
    value: function lock() {
      _get(_getPrototypeOf(CameraControler.prototype), "lock", this).call(this);

      document.exitPointerLock();
    }
  }]);

  return CameraControler;
}(_EntityControler2.EntityControler);

exports.CameraControler = CameraControler;
},{"./EntityControler":"../../src/controlers/EntityControler.js"}],"../../src/materials/Cubemap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cubemap = void 0;

var _Texture2 = require("./Texture");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Cubemap =
/*#__PURE__*/
function (_Texture) {
  _inherits(Cubemap, _Texture);

  function Cubemap() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Cubemap);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Cubemap)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "type", "TEXTURE_CUBE_MAP");

    _defineProperty(_assertThisInitialized(_this), "width", 1920);

    _defineProperty(_assertThisInitialized(_this), "height", 1920);

    _defineProperty(_assertThisInitialized(_this), "image", []);

    return _this;
  }

  return Cubemap;
}(_Texture2.Texture);

exports.Cubemap = Cubemap;
},{"./Texture":"../../src/materials/Texture.js"}],"../../Viewport.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Loader = require("./src/Loader.js");

var _Logger = require("./src/Logger.js");

var _Renderer = require("./src/renderer/Renderer");

var _Resources = require("./src/Resources.js");

var _Scene = require("./src/scene/Scene.js");

var _Math = require("./src/Math");

var _Scheduler = require("./src/Scheduler");

var _CursorController = require("./src/controlers/CursorController");

var _CameraControler = require("./src/controlers/CameraControler");

var _Camera = require("./src/scene/Camera.js");

var _Cubemap = require("./src/materials/Cubemap.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var logger = new _Logger.Logger('Viewport');
var nextFrame = 0,
    lastFrame = 0,
    accumulator = 0,
    tickrate = 128;

var Viewport =
/*#__PURE__*/
function (_HTMLElement) {
  _inherits(Viewport, _HTMLElement);

  _createClass(Viewport, [{
    key: "frameRate",
    get: function get() {
      return 1000 / this.renderer.frameTime;
    }
  }], [{
    key: "template",
    get: function get() {
      return "\n            <style>\n                :host {\n                    display: block;\n                }\n                canvas {\n                    width: 100%;\n                    height: 100%;\n                }\n                .item {\n                    width: 50px;\n                    height: 50px;\n                    background: grey;\n                    border-radius: 20%;\n                    position: relative;\n                    color: white;\n                    font-family: sans-serif;\n                    font-size: 14px;\n                    margin: 0 15px 25px 0;\n                }\n                .spacer {\n                    width: 1px;\n                    height: 50px;\n                    background: grey;\n                    margin: 0 15px 25px 0;\n                }\n                .item::after {\n                    content: attr(geo);\n                    position: absolute;\n                    top: 100%;\n                    left: 50%;\n                    margin-top: 5px;\n                    transform: translateX(-50%);\n                    opacity: 0.75;\n                }\n                .item:hover:before {\n                    content: \"\";\n                    position: absolute;\n                    top: -5px;\n                    left: -5px;\n                    right: -5px;\n                    bottom: -25px;\n                    background: white;\n                    opacity: 0.125;\n                }\n            </style>\n        ";
    }
  }]);

  function Viewport() {
    var _this;

    _classCallCheck(this, Viewport);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Viewport).call(this));

    _defineProperty(_assertThisInitialized(_this), "scheduler", new _Scheduler.Scheduler());

    _this.attachShadow({
      mode: 'open'
    });

    _this.root = _this.shadowRoot;
    _this.root.innerHTML = _this.constructor.template;
    _this.canvas = document.createElement('canvas');

    _this.root.appendChild(_this.canvas);

    _this.lastFrame = {};
    return _this;
  }

  _createClass(Viewport, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var _this2 = this;

      _Resources.Resources.load().then(function () {
        logger.log("resources loaded");

        _this2.init(_this2.canvas);

        logger.log("resources initialized");

        _this2.render();
      });
    }
  }, {
    key: "onRender",
    value: function onRender() {
      var width = this.canvas.clientWidth;
      var height = this.canvas.clientHeight;

      if (width != this.lastFrame.width || height != this.lastFrame.height) {
        this.renderer.setResolution(width, height);
        this.renderer.updateViewport();
      }

      this.lastFrame.width = width;
      this.lastFrame.height = height;
    }
  }, {
    key: "render",
    value: function render() {
      this.onRender();
      var currentFrame = performance.now();
      var delta = currentFrame - lastFrame;
      accumulator += delta;

      if (accumulator >= 1000 / tickrate) {
        accumulator = 0;
        this.scheduler.run(delta);
        this.scene.update(delta);
      }

      this.renderer.draw();
      lastFrame = currentFrame;
      nextFrame = requestAnimationFrame(this.render.bind(this));
    }
  }, {
    key: "init",
    value: function init(canvas) {
      var mats = _Resources.Resources.get('materials');

      for (var name in mats) {
        _Loader.Loader.createMatFromJson(name, mats[name]);
      }

      this.camera = new _Camera.Camera({
        fov: 90,
        position: new _Math.Vec(0, -400, -2500),
        rotation: new _Math.Vec(15, 0, 0)
      });
      this.scene = new _Scene.Scene(this.camera);
      this.renderer = new _Renderer.Renderer(canvas);
      this.renderer.setScene(this.scene);
      var controler = new _CameraControler.CameraControler(this.scene.activeCamera, canvas);
      var cursorControler = new _CursorController.CursorControler(this.scene.curosr, this);

      cursorControler.interaction = function (objID) {
        if (objID != 0) {
          controler.lock();
        } else {
          controler.unlock();
        }
      };

      this.dispatchEvent(new Event('load'));
      this.setCursor(_toConsumableArray(this.scene.objects)[this.scene.objects.size - 1]); // testing
      // setTimeout(() => {
      //     const cubemap = new Cubemap();
      //     this.renderer.renderCubemap(cubemap, this.scene.activeCamera);
      //     this.scene.cubemap = cubemap;
      // }, 0)
    }
  }, {
    key: "onselect",
    value: function onselect(objID) {}
  }, {
    key: "setCursor",
    value: function setCursor(obj) {
      if (obj) {
        this.scene.curosr.position = new _Math.Vec(obj.position);
        obj.position = this.scene.curosr.position;
      }
    }
  }]);

  return Viewport;
}(_wrapNativeSuper(HTMLElement));

exports.default = Viewport;
customElements.define('gl-viewport', Viewport);
module.exports = Viewport;
},{"./src/Loader.js":"../../src/Loader.js","./src/Logger.js":"../../src/Logger.js","./src/renderer/Renderer":"../../src/renderer/Renderer.js","./src/Resources.js":"../../src/Resources.js","./src/scene/Scene.js":"../../src/scene/Scene.js","./src/Math":"../../src/Math.js","./src/Scheduler":"../../src/Scheduler.js","./src/controlers/CursorController":"../../src/controlers/CursorController.js","./src/controlers/CameraControler":"../../src/controlers/CameraControler.js","./src/scene/Camera.js":"../../src/scene/Camera.js","./src/materials/Cubemap.js":"../../src/materials/Cubemap.js"}],"../../node_modules/@uncut/viewport-gui/components/UIElement.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UIElement = void 0;

class UIElement extends HTMLElement {
  static style() {
    return ``;
  }

  static template() {
    return ``;
  }

  constructor() {
    super();
    this.attachShadow({
      mode: "open"
    });
  }

  connectedCallback() {
    const styles = this.constructor.style(this.props);
    const template = this.constructor.template(this.props);
    this.shadowRoot.innerHTML = styles || "";
    this.shadowRoot.innerHTML += template || "";
  }

  getElement(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  getElements(selector) {
    return this.shadowRoot.querySelectorAll(selector);
  }

}

exports.UIElement = UIElement;
},{}],"../../node_modules/@uncut/viewport-gui/components/Menu.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Menu = void 0;

var _UIElement = require("./UIElement");

class Menu extends _UIElement.UIElement {
  static style() {
    return `
            <style>
                :host {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                }
            
                .menu-container {
                    background: #333;
                    border-radius: 3px;
                    padding: 4px 2px;
                }

                .menu-items {
                    display: flex;
                }

                .menu-item {
                    padding: 4px;
                    margin: 0 4px;
                    border-radius: 3px;
                    transition: .15s ease-out;
                    cursor: pointer;
                }

                .menu-item:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .menu-item:before {
                    content: "";
                    display: block;
                    width: 25px;
                    height: 25px;
                    background: #1c1c1c;
                    border-radius: 50%;
                    border-radius: 50%;
                }
            
            </style>
        `;
  }

  static template() {
    return `
            <div class="menu-container">
                <div class="menu-items">
                </div>
            </div>
        `;
  }

  createItem({
    name = "",
    onclick = null
  }) {
    const list = this.getElement('.menu-items');
    const item = document.createElement('div');
    item.onclick = onclick;
    item.title = name;
    item.className = "menu-item";
    list.appendChild(item);
  }

}

exports.Menu = Menu;
customElements.define('ui-menu', Menu);
},{"./UIElement":"../../node_modules/@uncut/viewport-gui/components/UIElement.js"}],"../../node_modules/@uncut/viewport-gui/components/UIWindow.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UIWindow = void 0;

var _UIElement = require("./UIElement");

class UIWindow extends _UIElement.UIElement {
  static style() {
    return `
            <style>
                :host {
                    display: block;
                    position: absolute;
                    top: var(--y);
                    left: var(--x);
                    width: var(--width);
                    height: var(--height);
                    background: #333;
                    font-family: sans-serif;
                    color: #eee;
                    border-radius: 3px;
                    overflow: hidden;
                    animation: show .1s;
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.33);
                    resize: both;
                }

                :host([dragging]) .content {
                    pointer-events: none;
                }

                :host([dragging]) .drag-bar {
                    background: #555;
                }

                :host([closing]) {
                    animation: hide .1s;
                }

                @keyframes show {
                    from { transform: scale(0); opacity: 0; }
                }

                @keyframes hide {
                    to { transform: scale(0); opacity: 0; }
                }

                .drag-bar {
                    position: relative;
                    background: #444;
                    width: 100%;
                    height: 24px;
                    user-select: none;
                    padding: 0 8px;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    user-select: none;
                }

                .title {
                    font-size: 12px;
                    opacity: 0.75;
                    pointer-events: none;
                }

                .drag {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                .close {
                    position: relative;
                    z-index: 1000;
                    display: block;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #333;
                    transition: background .1s ease-out;
                }

                .close:hover {
                    background: red;
                }
                .close:active {
                    transition-duration: 0s;
                    background: darkred;
                }

                .content {
                    font-size: 13px;
                    position: relative;
                    resize: both;
                    min-width: 150px;
                    min-height: 100px;
                    max-width: 100vw;
                    max-height: 100vh;
                }

            </style>
        `;
  }

  static template(props) {
    return `
            <div class="drag-bar">
                <span class="title">${props.title}</span>
                <span class="drag"></span>
                <span class="close"></span>
            </div>
            <div class="content">
                <slot></slot>
            </div>
        `;
  }

  get visible() {
    return this.parentElement != null;
  }

  constructor(props = {
    uid: null,
    title: null
  }) {
    super();
    this.props = props;
    this.id = props.uid;
    this.loadLayout();

    if (this.showing) {
      this.show();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const close = this.getElement('.close');
    close.addEventListener('click', () => this.hide());
    const bar = this.getElement('.drag-bar');
    const drag = this.getElement('.drag');
    let x = 0,
        y = 0;
    drag.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.setAttribute('dragging', '');
        const rect = bar.getBoundingClientRect();
        x = rect.x - e.x;
        y = rect.y - e.y;
      }
    });
    window.addEventListener('mouseup', e => {
      this.removeAttribute('dragging', '');
      this.saveLayout();
      x = 0;
      y = 0;
    });
    window.addEventListener('mousemove', e => {
      if (e.x + e.y !== 0 && x && y) {
        this.x = e.x + x;
        this.y = e.y + y;
        this.style.setProperty('--x', this.x + "px");
        this.style.setProperty('--y', this.y + "px");
      }
    });
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  hide() {
    this.setAttribute('closing', '');

    function hideAnim() {
      this.removeAttribute('closing');
      this.remove();
      this.removeEventListener('animationend', hideAnim);
    }

    this.addEventListener('animationend', hideAnim);
    this.showing = false;
    this.saveLayout();
  }

  show() {
    document.body.appendChild(this);
    this.showing = true;
    this.saveLayout();
  }

  saveLayout() {
    const layout = JSON.parse(localStorage.getItem('ui-layout')) || {};
    layout[this.id] = {
      x: this.x,
      y: this.y,
      showing: this.showing
    };
    localStorage.setItem('ui-layout', JSON.stringify(layout));
  }

  loadLayout() {
    const layout = JSON.parse(localStorage.getItem('ui-layout')) || {};

    if (layout[this.id]) {
      const win = layout[this.id];
      this.x = win.x;
      this.y = win.y;
      this.showing = win.showing;
      this.style.setProperty('--x', this.x + "px");
      this.style.setProperty('--y', this.y + "px");
    }
  }

}

exports.UIWindow = UIWindow;
customElements.define('ui-window', UIWindow);
},{"./UIElement":"../../node_modules/@uncut/viewport-gui/components/UIElement.js"}],"../../node_modules/@uncut/node-editor/src/Node.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeElement = exports.NodeParameter = exports.ParameterTypes = void 0;

function createHTMLElement(node, json) {
  const root = document.createElement(node);
  const atributes = Object.keys(json);

  for (let atr of atributes) {
    root[atr] = json[atr];
  }

  return root;
}

const userCursor = {
  lastNode: null,
  currentNode: null,
  history: []
};
const ParameterTypes = {
  NUMBER: 0,
  STRING: 1,
  COLOR: 2,
  VEC3: 3,
  SHADER: 5
};
exports.ParameterTypes = ParameterTypes;

class NodeParameter {
  get value() {
    let value = this.settings.default;

    switch (this.settings.type) {
      case ParameterTypes.NUMBER:
        value = Math.round(this.modifier(this.getInput() || 0) * 10000) / 10000;
        break;

      case ParameterTypes.VEC3:
        value = this.modifier(this.getInput() || this.innerValue || [0, 0, 0]);
        break;

      case ParameterTypes.COLOR:
        value = this.modifier(this.getInput() || [1, 1, 1]);
        break;

      default:
        value = this.modifier(this.getInput() || null);
        break;
    }

    this.emit(value);
    return value;
  }

  set value(val) {
    if (this._input) {
      this._input.value = val;
    }

    this.innerValue = val;
  }

  set onchange(f) {
    this.listeners.add(f);
  }

  emit(v) {
    for (let f of this.listeners) f(v);
  }

  constructor(title, config = {}) {
    this.title = title;
    this.listeners = new Set();
    this.keyframes = [];
    this.settings = {
      input: config.input === false ? false : true,
      output: config.output === false ? false : true,
      editable: config.editable === false ? false : true,
      default: config.default || 0,
      type: config.type || ParameterTypes.NUMBER
    };
    this.innerValue = this.settings.default;

    const element = this._render();

    this._element = element;
    this._input = element.querySelector(".value");

    if (this._input) {
      this._input.value = this.settings.default;
    }

    this.input = null;
    this.output = new Set();
  }

  modifier(value) {
    return value;
  }

  getInput() {
    let value = this.settings.default;

    if (this.input) {
      if (this._input) {
        this._input.value = this.input.value;
      }

      value = this.input.value;
    } else if (this._input) {
      value = this._input.valueAsNumber;
    }

    return value;
  }

  connect(nodePara) {
    if (nodePara && nodePara.settings.type == this.settings.type) {
      this.input = nodePara;
      nodePara.output.add(this);
      this.value = this.input.value;
    }
  }

  disconnect() {
    this.input.output.delete(this);
    this.input = null;
  }

  _render() {
    const root = document.createElement("parameter"); // input handle

    if (this.settings.input) {
      const leftHandle = createHTMLElement("span", {
        className: "handle left"
      });

      leftHandle.onmousedown = e => {
        userCursor.lastNode = this;
      };

      leftHandle.onmouseup = e => {
        if (userCursor.lastNode == this) {
          this.disconnect();
        }

        if (userCursor.currentNode && userCursor.lastNode && userCursor.currentNode !== userCursor.lastNode) {
          userCursor.currentNode.connect(userCursor.lastNode);
        }

        userCursor.currentNode = null;
      };

      leftHandle.onmouseenter = () => {
        userCursor.currentNode = this;
      };

      root.appendChild(leftHandle);
    } // output handle


    if (this.settings.output) {
      const rightHandle = createHTMLElement("span", {
        className: "handle right"
      });

      rightHandle.onmousedown = e => {
        userCursor.lastNode = this;
      };

      root.appendChild(rightHandle);
    } // title


    root.appendChild(createHTMLElement("span", {
      value: this.title,
      className: "title",
      innerText: this.title
    })); // ui input

    if (this.settings.editable) {
      const input = createHTMLElement("input", {
        type: "number",
        value: this.value,
        className: "value"
      });
      input.step = 0.00001;
      root.appendChild(input);
    }

    return root;
  }

}

exports.NodeParameter = NodeParameter;

class NodeElement {
  constructor() {
    this.title = "Node";
    this.parameters = {};
    this.element = this._render();
    const element = this.element;
    this.position = {
      get x() {
        return element.offsetLeft;
      },

      get y() {
        return element.offsetTop;
      },

      set x(val) {
        element.style.left = val + "px";
      },

      set y(val) {
        element.style.top = val + "px";
      }

    };
    this.setParameters(this.constructor.parameters);
    this.onCreate();
  }

  onCreate() {}

  delete() {
    for (let p in this.parameters) {
      const para = this.parameters[p];

      if (para.input && para.output) {
        for (let outPara of para.output) {
          outPara.connect(para.input);
        }
      } else if (para.output) {
        for (let outPara of para.output) {
          outPara.disconnect();
        }
      }
    }

    this.element.remove();
  }

  setParameters(paras) {
    const paraEle = this.element.querySelector(".parameters");
    paraEle.innerHTML = "";

    for (let para of paras) {
      this.parameters[para.title.toLocaleLowerCase()] = para;
      para.node = this;
      paraEle.appendChild(para._element);
    }
  }

  _render() {
    const ele = document.createElement("node");
    ele.className = "node-container";
    ele.tabIndex = 5;
    ele.innerHTML = `
			<node-title>${this.title}</node-title>
			<div class="parameters"></div>
		`;
    return ele;
  }

}

exports.NodeElement = NodeElement;
},{}],"../../node_modules/@uncut/node-editor/src/nodes/Color.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Color extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("r"), new _Node.NodeParameter("g"), new _Node.NodeParameter("b"), new _Node.NodeParameter("out", {
      input: false,
      editable: false,
      type: _Node.ParameterTypes.COLOR
    })];
  }

  constructor() {
    super();
    this.name = "Color";

    this.parameters.out.modifier = value => {
      return [this.parameters.r.value / 100, this.parameters.g.value / 100, this.parameters.b.value / 100];
    };
  }

}

exports.default = Color;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Shader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

const defaultShader = [`
attribute vec4 aPosition;
attribute vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uTime;

varying vec3 vColor;
varying vec3 vFragPos;
varying float vTime;

void main () {
	gl_PointSize = 2.5;

	vTime = uTime;

	vec4 pos = vec4(aPosition.x + 1000.0, aPosition.y, aPosition.z, 1.0);

	gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * pos;

	vFragPos = vec3(uModelMatrix * aPosition);
	
	vColor = aColor;
}

`, `
precision mediump float;

varying vec3 vColor;
varying vec3 vFragPos;

void main () {

  vec3 lightPos = vec3(400.0, 400.0, 400.0);
  vec3 lightDir = normalize(lightPos - vFragPos);
  vec3 lightColor = vec3(0.9, 0.9, 1.0);

  float ambientStrength = 0.25;
  vec3 ambient = ambientStrength * lightColor;

  vec3 norm = normalize(vec3(1.0, 1.0, 1.0));

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  vec3 result = (ambient + diffuse) * vColor;
  gl_FragColor = vec4(result, 1.0);
}

`];

class Shader extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("shader", {
      type: _Node.ParameterTypes.SHADER,
      editable: false,
      input: false
    })];
  }

  get vertexShader() {
    return this._vertShader || defaultShader[0];
  }

  get fragementShader() {
    return this._fragShader || defaultShader[1];
  }

  constructor() {
    super();
    this.name = "Shader";
    reloadShaderEditor(this.vertexShader, this.fragementShader);

    this.element.ondblclick = () => {
      openShaderEditor();
    };

    this.element.onclick = () => {
      reloadShaderEditor(this.vertexShader, this.fragementShader);
    };

    window.shaderEditorApplied = (vert, frag) => {
      this.shader = null;
      this._vertShader = vert;
      this._fragShader = frag;
    };

    this.parameters.shader.modifier = value => {
      return {
        vertexShader: this.vertexShader,
        fragementShader: this.fragementShader,
        cache: this.cache.bind(this),
        setUniforms: this.setUniforms.bind(this)
      };
    };
  }

  cache(gl) {
    if (!this.shader) {
      this.recompile(gl);
    }

    return this.shader;
  }

  recompile(gl) {
    console.log("[shader] recompiled");
    const vertexShader = compileShader(gl, this.vertexShader, gl.VERTEX_SHADER);
    const fragementShader = compileShader(gl, this.fragementShader, gl.FRAGMENT_SHADER);
    this.shader = createProgram(gl, vertexShader, fragementShader);
  }

  setUniforms(gl, program) {
    const uniforms = getUniforms(gl, program);
    gl.uniform1f(uniforms.uTime, performance.now());
  }

}

exports.default = Shader;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Translate.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Translate extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("x"), new _Node.NodeParameter("y"), new _Node.NodeParameter("z"), new _Node.NodeParameter("out", {
      input: false,
      editable: false,
      type: _Node.ParameterTypes.VEC3
    })];
  }

  constructor() {
    super();
    this.name = "Translate";

    this.parameters.out.modifier = value => {
      return [this.parameters.x.value, this.parameters.y.value, this.parameters.z.value];
    };
  }

}

exports.default = Translate;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/ValueNode.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class ValueNode extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("Value")];
  }

  constructor() {
    super();
    this.name = "Value";
  }

}

exports.default = ValueNode;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/TimerNode.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class TimerNode extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("Output")];
  }

  constructor() {
    super();
    this.name = "Timer";
    setInterval(() => {
      this.parameters.output._input.value = this.parameters.output.value + 1;
    }, 10);
  }

}

exports.default = TimerNode;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Time.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Time extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("time1", {
      editable: false,
      input: false
    }), new _Node.NodeParameter("time2", {
      editable: false,
      input: false
    })];
  }

  constructor() {
    super();
    this.name = "Time";
    const timeline = document.querySelector("ne-timeline");

    this.parameters.time1.modifier = value => {
      return timeline.getTimelineValue(timeline.keyframes[0]);
    };

    this.parameters.time2.modifier = value => {
      return timeline.getTimelineValue(timeline.keyframes[1]);
    };
  }

}

exports.default = Time;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/MultiplyNode.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class MultiplyNode extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("Ratio", {
      default: 2
    }), new _Node.NodeParameter("Output")];
  }

  constructor() {
    super();
    this.name = "Multiply";

    this.parameters.output.modifier = value => {
      return value * this.parameters.ratio.value;
    };
  }

}

exports.default = MultiplyNode;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Sin.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Sin extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("Output")];
  }

  constructor() {
    super();
    this.name = "Sin";

    this.parameters.output.modifier = value => {
      return Math.sin(value);
    };
  }

}

exports.default = Sin;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Cos.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Cos extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("Output")];
  }

  constructor() {
    super();
    this.name = "Cos";

    this.parameters.output.modifier = value => {
      return Math.cos(value);
    };
  }

}

exports.default = Cos;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Sum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Sum extends _Node.NodeElement {
  static get parameters() {
    return [new _Node.NodeParameter("Input1"), new _Node.NodeParameter("Input2"), new _Node.NodeParameter("Output", {
      input: false,
      editable: false
    })];
  }

  constructor() {
    super();
    this.name = "Sum";

    this.parameters.output.modifier = value => {
      return this.parameters.input1.value + this.parameters.input2.value;
    };
  }

}

exports.default = Sum;
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Plane.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Plane extends _Node.NodeElement {
  get x() {
    return this.parameters.position.value[0];
  }

  get y() {
    return this.parameters.position.value[1];
  }

  get z() {
    return this.parameters.position.value[2];
  }

  get rotX() {
    return this.parameters.rotation.value[0];
  }

  get rotY() {
    return this.parameters.rotation.value[1];
  }

  get rotZ() {
    return this.parameters.rotation.value[2];
  }

  get shader() {
    return this.parameters.shader.value;
  }

  static get parameters() {
    return [new _Node.NodeParameter("position", {
      type: _Node.ParameterTypes.VEC3,
      default: [0, 0, 0],
      editable: false
    }), new _Node.NodeParameter("rotation", {
      type: _Node.ParameterTypes.VEC3,
      default: [0, 0, 0],
      editable: false
    }), new _Node.NodeParameter("shader", {
      type: _Node.ParameterTypes.SHADER,
      editable: false
    })];
  }

  constructor() {
    super();
    this.name = "Plane";
    this.buffer = planebufferdata();
  }

}

exports.default = Plane;

function planebufferdata(w = 300, h = 300, s = 1) {
  return {
    type: "TRIANGLES",
    elements: 6,
    vertecies: new Float32Array([// 	x y z  u  v  //
    s * w, 0, s * h, 1, 1, 1, s * w, 0, -s * h, 1, 0, 1, -s * w, 0, -s * h, 0, 0, 1, s * w, 0, s * h, 1, 1, 1, -s * w, 0, -s * h, 0, 0, 1, -s * w, 0, s * h, 0, 1, 1]),
    attributes: [{
      size: 3,
      attribute: "aPosition"
    }, {
      size: 3,
      attribute: "aColor"
    }]
  };
}
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Cube.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Cube extends _Node.NodeElement {
  get x() {
    return this.parameters.position.value[0];
  }

  get y() {
    return this.parameters.position.value[1];
  }

  get z() {
    return this.parameters.position.value[2];
  }

  get rotX() {
    return this.parameters.rotation.value[0];
  }

  get rotY() {
    return this.parameters.rotation.value[1];
  }

  get rotZ() {
    return this.parameters.rotation.value[2];
  }

  get shader() {
    return this.parameters.shader.value;
  }

  static get parameters() {
    return [new _Node.NodeParameter("position", {
      type: _Node.ParameterTypes.VEC3,
      default: [0, 0, 0],
      editable: false
    }), new _Node.NodeParameter("rotation", {
      type: _Node.ParameterTypes.VEC3,
      default: [0, 0, 0],
      editable: false
    }), new _Node.NodeParameter("shader", {
      type: _Node.ParameterTypes.SHADER,
      editable: false
    })];
  }

  constructor() {
    super();
    this.name = "Cube";
    this.buffer = cubebufferdata();
  }

}

exports.default = Cube;

function cubebufferdata(w = 300, h = 300, s = 1) {
  return {
    type: "TRIANGLES",
    elements: 6,
    vertecies: new Float32Array([// x      y      z    r  g  b //
    s * w, 0 + s * w, s * h, 1, 1, 1, s * w, 0 + s * w, -s * h, 1, 1, 1, -s * w, 0 + s * w, -s * h, 1, 1, 1, s * w, 0 + s * w, s * h, 1, 1, 1, -s * w, 0 + s * w, -s * h, 1, 1, 1, -s * w, 0 + s * w, s * h, 1, 1, 1, s * w, 0 - s * w, s * h, 1, 1, 1, s * w, 0 - s * w, -s * h, 1, 1, 1, -s * w, 0 - s * w, -s * h, 1, 1, 1, s * w, 0 - s * w, s * h, 1, 1, 1, -s * w, 0 - s * w, -s * h, 1, 1, 1, -s * w, 0 - s * w, s * h, 1, 1, 1, s * w, s * h, 0 + s * w, 1, 1, 1, s * w, -s * h, 0 + s * w, 1, 1, 1, -s * w, -s * h, 0 + s * w, 1, 1, 1, s * w, s * h, 0 + s * w, 1, 1, 1, -s * w, -s * h, 0 + s * w, 1, 1, 1, -s * w, s * h, 0 + s * w, 1, 1, 1, s * w, s * h, 0 - s * w, 1, 1, 1, s * w, -s * h, 0 - s * w, 1, 1, 1, -s * w, -s * h, 0 - s * w, 1, 1, 1, s * w, s * h, 0 - s * w, 1, 1, 1, -s * w, -s * h, 0 - s * w, 1, 1, 1, -s * w, s * h, 0 - s * w, 1, 1, 1, 0 + s * w, s * w, s * h, 1, 1, 1, 0 + s * w, s * w, -s * h, 1, 1, 1, 0 + s * w, -s * w, -s * h, 1, 1, 1, 0 + s * w, s * w, s * h, 1, 1, 1, 0 + s * w, -s * w, -s * h, 1, 1, 1, 0 + s * w, -s * w, s * h, 1, 1, 1, 0 - s * w, s * w, s * h, 1, 1, 1, 0 - s * w, s * w, -s * h, 1, 1, 1, 0 - s * w, -s * w, -s * h, 1, 1, 1, 0 - s * w, s * w, s * h, 1, 1, 1, 0 - s * w, -s * w, -s * h, 1, 1, 1, 0 - s * w, -s * w, s * h, 1, 1, 1]),
    attributes: [{
      size: 3,
      attribute: "aPosition"
    }, {
      size: 3,
      attribute: "aColor"
    }]
  };
}
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/nodes/Emitter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = require("../Node.js");

class Emitter extends _Node.NodeElement {
  get x() {
    return 0;
  }

  get y() {
    return 0;
  }

  get z() {
    return 0;
  }

  get rotX() {
    return 0;
  }

  get rotY() {
    return 0;
  }

  get rotZ() {
    return 0;
  }

  get shader() {
    return this.parameters.shader.value;
  }

  static get parameters() {
    return [new _Node.NodeParameter("position", {
      type: _Node.ParameterTypes.VEC3,
      default: [0, 0, 0],
      editable: false
    }), new _Node.NodeParameter("density", {
      default: 50
    }), new _Node.NodeParameter("rate", {
      default: 100
    }), new _Node.NodeParameter("death", {
      default: 10
    }), new _Node.NodeParameter("speed", {
      default: 10
    }), new _Node.NodeParameter("color", {
      type: _Node.ParameterTypes.COLOR,
      default: [100, 100, 100],
      editable: false
    }), new _Node.NodeParameter("shader", {
      type: _Node.ParameterTypes.SHADER,
      editable: false
    }), new _Node.NodeParameter("wind", {
      type: _Node.ParameterTypes.VEC3,
      default: [0, 0, 0],
      editable: false
    })];
  }

  get buffer() {
    const verts = [];

    for (let i = 0; i < this.particles.length; i++) {
      verts.push(...this.particles[i].position, ...this.particles[i].color);
    }

    if (verts.length > 0) {
      return {
        type: "POINTS",
        elements: 6,
        vertecies: new Float32Array(verts),
        attributes: [{
          size: 3,
          attribute: "aPosition"
        }, {
          size: 3,
          attribute: "aColor"
        }]
      };
    }

    return null;
  }

  constructor() {
    super();
    this.name = "Emitter";
    this.particles = [];
    this.updateRate = 144;
    this.volume = 10000;

    const anim = () => {
      setTimeout(anim, 1000 / this.updateRate);
      this.update();
    };

    anim();
    this.lastEmit = 0;
  }

  emitt(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.parameters.position.value, this.parameters.speed.value, this.parameters.color.value));
    }

    this.lastEmit = performance.now();
  }

  update() {
    for (let p of this.particles) {
      const wind = this.parameters.wind.value;
      vec3.add(p.velocity, p.velocity, wind);
      const friciton = vec3.create();
      friciton[0] = 0.99;
      friciton[1] = 0.99;
      friciton[2] = 0.99;
      vec3.mul(p.velocity, p.velocity, friciton);
      p.position[0] += p.velocity[0];
      p.position[1] += p.velocity[1];
      p.position[2] += p.velocity[2];

      if (Math.max(Math.abs(p.velocity[0]), Math.abs(p.velocity[1]), Math.abs(p.velocity[2])) < this.parameters.death.value || Math.abs(p.position[0]) > this.volume || Math.abs(p.position[1]) > this.volume || Math.abs(p.position[2]) > this.volume) {
        this.particles.splice(this.particles.indexOf(p), 1);
      }
    }

    const delta = performance.now() - this.lastEmit;

    if (delta > this.parameters.rate.value) {
      this.emitt(this.parameters.density.value);
    }
  }

}

exports.default = Emitter;

class Particle {
  constructor(pos, speed = 0, color = [1, 1, 1]) {
    this.position = pos;
    this.velocity = vec3.create();
    vec3.random(this.velocity, speed + Math.random() * (speed * 2));
    this.color = color;
  }

}
},{"../Node.js":"../../node_modules/@uncut/node-editor/src/Node.js"}],"../../node_modules/@uncut/node-editor/src/framework.js":[function(require,module,exports) {
"use strict";

var _Color = _interopRequireDefault(require("./nodes/Color.js"));

var _Shader = _interopRequireDefault(require("./nodes/Shader.js"));

var _Translate = _interopRequireDefault(require("./nodes/Translate.js"));

var _ValueNode = _interopRequireDefault(require("./nodes/ValueNode.js"));

var _TimerNode = _interopRequireDefault(require("./nodes/TimerNode.js"));

var _Time = _interopRequireDefault(require("./nodes/Time.js"));

var _MultiplyNode = _interopRequireDefault(require("./nodes/MultiplyNode.js"));

var _Sin = _interopRequireDefault(require("./nodes/Sin.js"));

var _Cos = _interopRequireDefault(require("./nodes/Cos.js"));

var _Sum = _interopRequireDefault(require("./nodes/Sum.js"));

var _Plane = _interopRequireDefault(require("./nodes/Plane.js"));

var _Cube = _interopRequireDefault(require("./nodes/Cube.js"));

var _Emitter = _interopRequireDefault(require("./nodes/Emitter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.ne = {
  nodeTypes: {
    "Multiply": _MultiplyNode.default,
    Sin: _Sin.default,
    Cos: _Cos.default,
    Sum: _Sum.default,
    Translate: _Translate.default,
    Emitter: _Emitter.default,
    Cube: _Cube.default,
    Plane: _Plane.default,
    Color: _Color.default,
    Shader: _Shader.default,
    "Timer": _TimerNode.default,
    "Value": _ValueNode.default,
    Time: _Time.default
  },
  loadSavestate: jsonObj => {
    const json = {
      editor: jsonObj.editor || [],
      timeline: jsonObj.timeline || {
        keyframes: [[], []]
      }
    };
    loadEditor(json.editor);
    loadTimeline(json.timeline);

    function loadTimeline(json) {
      const timeline = document.querySelector("ne-timeline");
      timeline.update(json.keyframes);
    }

    function loadEditor(json) {
      editor.zoom = 1;

      for (let node of editor.nodes) {
        editor.remove(node);
      }

      for (let nodeData of json) {
        const node = editor.createNode(ne.nodeTypes[nodeData.type], nodeData.position.x, nodeData.position.y);

        for (let para in node.parameters) {
          if (nodeData.parameters[para]) {
            node.parameters[para].value = nodeData.parameters[para].value;
          } else {
            console.log("missing parameter", para);
          }
        }
      } // make connections


      const nodes = [...editor.nodes];
      nodes.forEach((node, n) => {
        for (let para in node.parameters) {
          if (json[n].parameters[para]) {
            const input = json[n].parameters[para].input;

            if (input) {
              const inputNode = nodes[input.node];

              if (inputNode) {
                const inputParameter = inputNode.parameters[input.parameter];
                node.parameters[para].connect(inputParameter);
              }
            }
          }
        }
      });
      editor.update();
      return true;
    }

    console.log("Savestate loaded");
  },
  saveSavestate: () => {
    // save timeline
    function saveTimeline() {
      const timeline = document.querySelector("ne-timeline");
      return {
        keyframes: timeline.keyframes
      };
    } // save editor


    function saveEditor() {
      let result = [];

      for (let node of editor.nodes) {
        const n = {
          type: node.title,
          position: {
            x: node.position.x,
            y: node.position.y
          },
          parameters: {}
        };

        for (let para in node.parameters) {
          n.parameters[para] = {
            value: node.parameters[para].value,
            input: null
          };

          if (node.parameters[para].input) {
            n.parameters[para].input = {
              node: [...editor.nodes].indexOf(node.parameters[para].input.node),
              parameter: node.parameters[para].input.title.toLowerCase()
            };
          }
        }

        result.push(n);
      }

      return result;
    }

    const timelineSave = saveTimeline();
    const saveState = {
      editor: saveEditor() || [],
      timeline: {
        keyframes: timelineSave.keyframes || [[], []]
      }
    };
    console.log(JSON.stringify(saveState));
    return saveState;
  }
};
},{"./nodes/Color.js":"../../node_modules/@uncut/node-editor/src/nodes/Color.js","./nodes/Shader.js":"../../node_modules/@uncut/node-editor/src/nodes/Shader.js","./nodes/Translate.js":"../../node_modules/@uncut/node-editor/src/nodes/Translate.js","./nodes/ValueNode.js":"../../node_modules/@uncut/node-editor/src/nodes/ValueNode.js","./nodes/TimerNode.js":"../../node_modules/@uncut/node-editor/src/nodes/TimerNode.js","./nodes/Time.js":"../../node_modules/@uncut/node-editor/src/nodes/Time.js","./nodes/MultiplyNode.js":"../../node_modules/@uncut/node-editor/src/nodes/MultiplyNode.js","./nodes/Sin.js":"../../node_modules/@uncut/node-editor/src/nodes/Sin.js","./nodes/Cos.js":"../../node_modules/@uncut/node-editor/src/nodes/Cos.js","./nodes/Sum.js":"../../node_modules/@uncut/node-editor/src/nodes/Sum.js","./nodes/Plane.js":"../../node_modules/@uncut/node-editor/src/nodes/Plane.js","./nodes/Cube.js":"../../node_modules/@uncut/node-editor/src/nodes/Cube.js","./nodes/Emitter.js":"../../node_modules/@uncut/node-editor/src/nodes/Emitter.js"}],"../../node_modules/@uncut/node-editor/src/Component.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Shortcuts = void 0;

if (!window.shortcuts) {
  window.shortcuts = new Map();
}

class Shortcuts {
  static map() {
    return window.shortcuts;
  }

}

exports.Shortcuts = Shortcuts;

class Component extends HTMLElement {
  static get style() {
    return ``;
  }

  static get template() {
    return `<slot></slot>`;
  }

  constructor() {
    super();
    this.attachShadow({
      mode: "open"
    });
    this.shadowRoot.innerHTML = this.constructor.style;
    this.shadowRoot.innerHTML += this.constructor.template;
    this.shortcutMap = Shortcuts.map();
    this.tabIndex = 0;
    this.addEventListener("keydown", e => {
      this.executeShortcut(e);
    });
  }

  mapShortcut(args = {
    key: null,
    description: "",
    action: null
  }) {
    this.shortcutMap.set(args.key.toLowerCase(), {
      key: args.key,
      exec: args.action,
      description: args.description
    });
  }

  executeShortcut(e) {
    if (this.shortcutMap.has(e.key.toLowerCase())) this.shortcutMap.get(e.key.toLowerCase()).exec(e);
  }

}

exports.default = Component;
},{}],"../../node_modules/@uncut/node-editor/src/Tabmenu.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Component = _interopRequireDefault(require("./Component.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Tabmenu extends _Component.default {
  static get style() {
    return `
            <style>
                .tabmenu {
                    position: absolute;
                    left: 20px;
                    top: 20px;
                }
                
                .tabmenu input {
                    padding: 8px 12px;
                    background: #1c1c1c;
                    color: #eee;
                    border: 1px solid #000000;
                    border-radius: 4px;
                    outline: none;
                }
                
                .tabmenu .options {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border-radius: 3px;
                }
                
                .tabmenu .tabmenu-item {
                    background: #1c1c1c;
                    padding: 7px 10px;
                    border-bottom: 1px solid #101010;
                    font-family: sans-serif;
                    color: #bdbdbd;
                    font-size: 14px;
                }
                
                .tabmenu .tabmenu-item:hover,
                .tabmenu .tabmenu-item[active] {
                    background: #1c1c1c;
                    background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
                }
            </style>
        `;
  }

  constructor(container, options, editor) {
    super();
    this.container = container;
    this.editor = editor;
    this.options = options;
    this.maxresults = 8;
    this.position = [0, 0];
    this.container.addEventListener("mousemove", e => {
      const bounds = this.container.getBoundingClientRect();
      this.position[0] = e.clientX - bounds.left;
      this.position[1] = e.clientY - bounds.top;
    });
    this.isopen = false;
    this.selected = 0;
    this.currentResults = []; // shortcuts

    this.mapShortcut({
      key: "Tab",
      description: "Open tab menu",
      action: e => {
        if (!this.isopen) {
          e.preventDefault();
          this.open(this.container, this.position[0], this.position[1]);
        }
      }
    });
  }

  open(container, x, y) {
    const ele = this.render();
    this.element = ele;
    container.appendChild(this.element);

    if (x && y) {
      ele.style.left = x + "px";
      ele.style.top = y + "px";
      ele.style.position = "absolute";
    }

    ele.querySelector("input").oninput = e => {
      this.search(e.target.value, Object.keys(this.options));
      this.selected = 0;
      this.renderItems(ele.querySelector(".options"), this.currentResults);
    };

    ele.querySelector("input").onkeydown = e => {
      if (e.key == "Escape") {
        this.close();
      } else if (e.key == "Enter") {
        this.submit();
      }

      if (e.key == "ArrowUp") {
        e.preventDefault();
        this.selected--;
      } else if (e.key == "ArrowDown") {
        e.preventDefault();
        this.selected++;
      }

      this.renderItems(ele.querySelector(".options"), this.currentResults);
    };

    this.isopen = true;
  }

  close() {
    if (this.element && this.isopen) {
      this.isopen = false;
      this.element.parentElement.focus();
      this.element.remove();
      this.element = null;
    }
  }

  submit() {
    if (this.isopen && this.currentResults[this.selected]) {
      const node = this.options[this.currentResults[this.selected]];
      this.editor.createNode(node, this.position[0], this.position[1]);
      this.close();
    }
  }

  search(str, options) {
    let result = [];

    if (str != "" && str.length >= 1) {
      for (let opt of options) {
        if (opt.toLowerCase().match(str.toLowerCase())) {
          result.push(opt);
        }

        if (result.length > this.maxresults) {
          break;
        }
      }
    }

    this.currentResults = result;
    return result;
  }

  renderItems(container, items = []) {
    container.innerHTML = "";

    for (let item of items) {
      const ele = document.createElement("span");
      ele.className = "tabmenu-item";
      ele.innerHTML = item;
      container.appendChild(ele);

      ele.onmousedown = () => {
        this.selected = items.indexOf(item);
        this.submit();
      };

      this.selected = this.selected % items.length;

      if (items.indexOf(item) == this.selected) {
        ele.setAttribute("active", "");
      }
    }
  }

  render(x, y) {
    const ele = document.createElement("div");
    ele.className = "tabmenu";
    const input = document.createElement("input");
    input.placeholder = "Search";
    input.tabIndex = 0;
    const list = document.createElement("div");
    list.className = "options";

    if (x && y) {
      ele.style.position = "absolute";
      ele.style.left = x + "px";
      ele.style.top = y + "px";
    }

    ele.innerHTML = this.constructor.style;
    ele.appendChild(input);
    ele.appendChild(list);
    this.shadowRoot.appendChild(ele);

    input.onblur = () => {
      this.close();
    };

    setTimeout(() => {
      input.focus();
    }, 10);
    return ele;
  }

}

exports.default = Tabmenu;
customElements.define('tab-menu', Tabmenu);
},{"./Component.js":"../../node_modules/@uncut/node-editor/src/Component.js"}],"../../node_modules/@uncut/node-editor/src/Editor.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Editor = void 0;

require("./framework.js");

var _Tabmenu = _interopRequireDefault(require("./Tabmenu.js"));

var _Component = _interopRequireDefault(require("./Component.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isMouseButton(e) {
  let mbutton;

  if (e.button != null) {
    if (e.buttons == 4) {
      mbutton = 2;
    } else {
      mbutton = e.buttons;
    }
  } else {
    mbutton = e.which;
  }

  return mbutton;
}

class Editor extends _Component.default {
  static get style() {
    return `
			<style>
				:host {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					overflow: hidden;
				}

				.node-canvas {
					grid-row: 2;
					grid-column: 1;
					will-change: transform;
					position: relative;
				}
				
				.node-container {
					transform-origin: -50% -50%;
					position: absolute;
					top: 0;
					left: 0;
				}
				
				.node-canvas svg {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					pointer-events: none;
					z-index: 0;
				}
				
				.node-canvas::before {
					position: absolute;
					content: "Press tab";
					top: 10px;
					left: 10px;
					opacity: 0.05;
					color: white;
					font-size: 16px;
					font-family: sans-serif;
					font-weight: bold;
					letter-spacing: 1px;
					text-transform: uppercase;
				}
				
				node {
					top: 200px;
					left: 200px;
					position: absolute;
					display: block;
					min-width: 200px;
					background: #333;
					border-radius: 5px;
					border: 1px solid transparent;
					transition: border-color .05s ease;
					font-family: sans-serif;
					font-size: .9em;
					box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
				}
				
				node:focus,
				node:hover {
					border-color: #0085ff57;
					outline: none;
				}
				
				node-title {
					display: block;
					color: rgb(150, 150, 150);
					padding: 5px 8px;
					user-select: none;
					margin-bottom: 2px;
				}
				
				parameter {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 0 10px;
					color: #eee;
					border-bottom: 1px solid #232323;
					position: relative;
					min-height: 25px;
					font-weight: 100;
					font-size: 13px;
					box-sizing: border-box;
				}
				
				parameter:last-child {
					border: none;
				}
				
				parameter .value {
					font-size: 12px;
					min-width: 50px;
					background: #232323;
					border: 1px solid #333;
					color: white;
					text-align: right;
					height: 22px;
					padding: 0px 5px;
					width: auto;
					margin-left: 20px;
					border-radius: 3px;
					-moz-appearance: textfield;
					appearance: textfield;
				}
				
				parameter .value::-webkit-inner-spin-button {
					-webkit-appearance: none;
				}
				
				parameter .handle {
					display: block;
					position: absolute;
					width: 10px;
					height: 10px;
					border-radius: 50%;
				}
				
				parameter .handle.left {
					left: 0;
					transform: translateX(-60%);
					background: #4b99d2;
				}
				
				parameter .handle.right {
					right: 0;
					transform: translateX(60%);
					background: #eeeeee;
				}
				
				parameter .handle:hover {
					filter: brightness(1.2);
				}
			</style>
		`;
  }

  static get template() {
    return `
			<svg class="connections" height="100%" width="100%" viewBox="0 0 100 100" style="stroke:rgb(199, 199, 199);stroke-width:3"></svg>
			<div class="node-container"></div>
			<slot></slot>
		`;
  }

  constructor() {
    super();
    this.addEventListener('contextmenu', e => e.preventDefault());
    this.view = {
      x: 0,
      y: 0
    };
    this.zoom = 1;
    this.nodes = new Set();
    this.selection = new Set();
    this.setup();
    this.controls(); // shortcuts

    this.mapShortcut({
      key: "Delete",
      description: "Delete Node",
      action: () => {
        for (let title of this.selection) {
          const node = this.findNodeByElement(title.parentNode);

          if (node) {
            this.remove(node);
          }
        }
      }
    });
  }

  connectedCallback() {
    const editor = document.querySelector("node-editor");
    window.editor = editor;
    ne.nodes = editor.nodes;
  }

  setup() {
    this.tabmenu = new _Tabmenu.default(this, ne.nodeTypes, this);
    window.addEventListener("resize", () => {
      this.update();
    });
    this.update();
  }

  findNodeByElement(ele) {
    for (let node of this.nodes) {
      if (node.element == ele) {
        return node;
      }
    }
  }

  createNode(type, x = 200, y = 100) {
    const node = new type();
    node.position.x = x;
    node.position.y = y;
    this.add(node);

    node.onremove = () => {
      this.remove(node);
    };

    return node;
  }

  add(node) {
    this.nodes.add(node);
    this.shadowRoot.querySelector(".node-container").appendChild(node.element);
    this.renderInputs();
  }

  remove(node) {
    node.delete();
    this.nodes.delete(node);
    this.renderInputs();
  }

  renderLine(_svg, x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("y2", y2);
    line.setAttribute("x2", x2);

    _svg.appendChild(line);

    return line;
  }

  renderInputs() {
    const _svg = this.shadowRoot.querySelector("svg");

    _svg.innerHTML = "<g></g>";

    for (let node of this.nodes) {
      for (let para in node.parameters) {
        const parameter = node.parameters[para];

        if (parameter.input) {
          const input = parameter._element;
          const output = parameter.input._element;
          const x1 = input.parentNode.parentNode.offsetLeft;
          const y1 = input.parentNode.parentNode.offsetTop + input.offsetHeight / 2 + input.offsetTop;
          const x2 = output.parentNode.parentNode.offsetLeft + output.offsetWidth;
          const y2 = output.parentNode.parentNode.offsetTop + output.offsetHeight / 2 + output.offsetTop;
          this.renderLine(this.shadowRoot.querySelector("svg g"), x1, y1, x2, y2);
        }
      }
    }

    this.shadowRoot.querySelector(".connections g").style.transform = `
			translate(${this.view.x}px, ${this.view.y}px) scale(${this.zoom})
		`;
    this.shadowRoot.querySelector(".connections g").style.transformOrigin = `calc(50% - ${this.view.x}px) calc(0% - ${this.view.y}px)`;
  }

  controls() {
    let moving = false;
    let lastEvent = null;
    let line = null;
    this.shadowRoot.addEventListener("wheel", e => {
      this.zoom = Math.min(Math.max(this.zoom - e.deltaY / 3000, 0.2), 1.5);
      this.update();
    });
    this.shadowRoot.addEventListener("mousedown", e => {
      moving = true;

      if (e.ctrlKey && this.selection.has(e.target)) {
        this.selection.delete(e.target);
      } else if (e.ctrlKey) {
        this.selection.add(e.target);
      } else if (!this.selection.has(e.target)) {
        this.selection.clear();
        this.selection.add(e.target);
      }

      if (e.target.classList.contains("handle")) {
        const _svg = this.shadowRoot.querySelector("svg");

        const box = _svg.getBoundingClientRect();

        line = this.renderLine(_svg, e.clientX - box.left, e.clientY - box.top, e.clientX - box.left, e.clientY - box.top);
      }
    });
    window.addEventListener("mouseup", e => {
      moving = false;

      if (e.target.localName != "node-title") {
        this.selection.clear();
      }

      this.update();
    });
    window.addEventListener("mousemove", e => {
      if (lastEvent && moving) {
        const deltaX = (e.x - lastEvent.x) / this.zoom;
        const deltaY = (e.y - lastEvent.y) / this.zoom;

        if (isMouseButton(e) == 1) {
          for (let target of this.selection) {
            if (target && target.localName == "node-title") {
              const node = target.parentNode;
              node.style.left = node.offsetLeft + deltaX + "px";
              node.style.top = node.offsetTop + deltaY + "px";
              this.update();
            }
          }

          if (line) {
            const _svg = this.shadowRoot.querySelector("svg");

            const box = _svg.getBoundingClientRect();

            line.setAttribute("x2", e.clientX - box.left);
            line.setAttribute("y2", e.clientY - box.top);
          }
        } else if (isMouseButton(e) == 2) {
          this.view.x += deltaX;
          this.view.y += deltaY;
          this.update();
        }
      }

      lastEvent = e;
    });
  }

  update() {
    this.shadowRoot.querySelector(".node-container").style.transform = `
			translate(${this.view.x}px, ${this.view.y}px) scale(${this.zoom})
		`;
    this.shadowRoot.querySelector(".node-container").style.transformOrigin = `calc(50% - ${this.view.x}px) calc(50% - ${this.view.y}px)`;
    this.shadowRoot.querySelector(".connections").setAttribute("viewBox", `
			${0} ${0} ${this.clientWidth} ${this.clientHeight}
		`);
    this.renderInputs();
  }

}

exports.Editor = Editor;
customElements.define("node-editor", Editor);
},{"./framework.js":"../../node_modules/@uncut/node-editor/src/framework.js","./Tabmenu.js":"../../node_modules/@uncut/node-editor/src/Tabmenu.js","./Component.js":"../../node_modules/@uncut/node-editor/src/Component.js"}],"../../node_modules/@uncut/node-editor/index.js":[function(require,module,exports) {
"use strict";

var _Editor = require("./src/Editor.js");

module.exports = _Editor.Editor;
},{"./src/Editor.js":"../../node_modules/@uncut/node-editor/src/Editor.js"}],"../../src/Test.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Config = _interopRequireDefault(require("./Config"));

var _Scheduler = require("./Scheduler");

var _Viewport = _interopRequireDefault(require("../Viewport"));

var _Resources = require("./Resources");

var _Math = require("./Math");

var _Menu = require("@uncut/viewport-gui/components/Menu");

var _UIWindow = require("@uncut/viewport-gui/components/UIWindow");

var _DefaultMaterial = _interopRequireDefault(require("./materials/DefaultMaterial"));

var geometry = _interopRequireWildcard(require("./geo/*.*"));

var lights = _interopRequireWildcard(require("./light/*.*"));

var _nodeEditor = _interopRequireDefault(require("@uncut/node-editor"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n            body {\n                margin: 0;\n                overflow: hidden;\n                background: black;\n            }\n            gl-viewport {\n                position: absolute;\n                top: 0;\n                left: 0;\n                width: 100vw;\n                height: 100vh;\n            }\n            span {\n                display: block;\n                padding: 5px 8px;\n                background: #1c1c1c;\n                margin-right: 10px;\n                opacity: 0.75;\n                border-radius: 4px;\n                min-width: 28px;\n                text-align: center;\n            }\n            #details {\n                display: flex;\n                position: fixed;\n                bottom: 10px;\n                left: 10px;\n                font-size: 14px;\n                font-family: sans-serif;\n                color: white;\n                z-index: 1000;\n                user-select: none;\n                width: 100%;\n            }\n        "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function css(strings) {
  var styles = document.createElement('style');
  styles.innerHTML = strings;
  return styles;
}

var Test =
/*#__PURE__*/
function () {
  function Test() {
    _classCallCheck(this, Test);
  }

  _createClass(Test, null, [{
    key: "viewportTest",
    value: function viewportTest() {
      var resources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments.length > 1 ? arguments[1] : undefined;

      _Resources.Resources.add(resources, false);

      window.addEventListener('DOMContentLoaded', function () {
        document.body.innerHTML = Test.template;
        document.head.appendChild(Test.styles);
        var viewport = new _Viewport.default();

        viewport.onload = function () {
          Test.initHelperTasks(viewport);
          Test.initUI(viewport);
          callback(viewport);
        };

        document.body.appendChild(viewport);
      });
    }
  }, {
    key: "initUI",
    value: function initUI(viewport) {
      var nodewindow = new _UIWindow.UIWindow({
        uid: "nodewindow",
        title: "Node Editor"
      });
      nodewindow.style.width = "700px";
      nodewindow.style.height = "300px";
      nodewindow.style.background = "#1c1c1c";
      nodewindow.innerHTML = "\n            <style>\n                node-editor {\n                    position: relative;\n                    outline: none;\n                }\n            </style>\n        ";
      nodewindow.appendChild(new _nodeEditor.default());
      var objwindow = new _UIWindow.UIWindow({
        uid: "objwindow",
        title: "Object Viewer"
      });
      objwindow.innerHTML = "\n            <div class=\"geo-name\"></div>\n        ";
      var createwin = new _UIWindow.UIWindow({
        uid: "createwin",
        title: "Create"
      });
      createwin.innerHTML = "\n            <div class=\"items\">\n                <div class=\"craete-item\" title=\"Cube\" geo=\"Cube\"></div>\n                <div class=\"craete-item\" title=\"Plane\" geo=\"Plane\"></div>\n                <div class=\"craete-item\" title=\"Pointlight\" light=\"Pointlight\"></div>\n                <style>\n                    .items {\n                        display: flex;\n                        flex-wrap: wrap;\n                        max-width: 168px;\n                    }\n                    .craete-item {\n                        width: 40px;\n                        height: 40px;\n                        color: white;\n                        background: #666;\n                        margin: 1px;\n                    }\n                    .craete-item:hover {\n                        background: #777;\n                    }\n                </stlye>\n            </div>\n        ";
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var item = _step.value;

          item.onclick = function () {
            var geo = item.getAttribute('geo');
            var Geometry = geometry[geo].js[geo];
            viewport.scene.add(new Geometry({
              metrial: new _DefaultMaterial.default(),
              scale: 100,
              id: Math.floor(Math.random() * 100)
            }));
          };
        };

        for (var _iterator = createwin.querySelectorAll('[geo]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop2 = function _loop2() {
          var item = _step2.value;

          item.onclick = function () {
            var light = item.getAttribute('light');
            var Light = lights[light].js[light];
            viewport.scene.add(new Light());
          };
        };

        for (var _iterator2 = createwin.querySelectorAll('[light]')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop2();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var properties = objwindow.querySelector('.geo-name');

      viewport.onselect = function (obj) {
        objwindow.getElement('.content').style.padding = "10px";
        properties.innerHTML = "<pre style=\"margin: 0\">\n" + "type: ".concat(obj.constructor.name, "\n") + "material: ".concat(obj.material.constructor.name, "\n") + "position: ".concat(obj.position, "\n") + "rotation: ".concat(obj.rotation, "\n") + "origin: ".concat(obj.origin, "\n") + "scale: ".concat(obj.scale, "\n") + "id: ".concat(obj.id, "\n") + "instanced: ".concat(obj.instanced, "\n") + "hidden: ".concat(obj.hidden, "\n") + '</pre>';
      };

      var menu = new _Menu.Menu();
      document.body.appendChild(menu);
      menu.createItem({
        name: "Create",
        onclick: function onclick() {
          createwin.toggle();
        }
      });
      menu.createItem({
        name: "Properties",
        onclick: function onclick() {
          objwindow.toggle();
        }
      });
      menu.createItem({
        name: "Node Editor",
        onclick: function onclick() {
          nodewindow.toggle();
        }
      });
    }
  }, {
    key: "initHelperTasks",
    value: function initHelperTasks(viewport) {
      var scheduler = viewport.scheduler;
      var camera = viewport.camera;
      var scene = viewport.scene;

      var savedPosition = _Config.default.global.getValue('camera');

      if (savedPosition) {
        camera.setPositionTo(new _Math.Transform(savedPosition));
      }

      var configTask = new _Scheduler.Task(_Scheduler.Scheduler.timer(100, function (dt) {
        _Config.default.global.setValue('camera', camera);

        details.innerHTML = "\n                <span>".concat(camera.position, "</span>\n                <span>").concat(camera.rotation, "</span>\n                <span>").concat(viewport.frameRate.toFixed(0), "</span>\n                <span>").concat(scene.curosr.position, "</span>\n            ");
        return false;
      }));
      scheduler.addTask(configTask);
    }
  }, {
    key: "styles",
    get: function get() {
      return css(_templateObject());
    }
  }, {
    key: "template",
    get: function get() {
      return "\n            <div id=\"details\"></div>\n        ";
    }
  }]);

  return Test;
}();

exports.default = Test;
},{"./Config":"../../src/Config.js","./Scheduler":"../../src/Scheduler.js","../Viewport":"../../Viewport.js","./Resources":"../../src/Resources.js","./Math":"../../src/Math.js","@uncut/viewport-gui/components/Menu":"../../node_modules/@uncut/viewport-gui/components/Menu.js","@uncut/viewport-gui/components/UIWindow":"../../node_modules/@uncut/viewport-gui/components/UIWindow.js","./materials/DefaultMaterial":"../../src/materials/DefaultMaterial.js","./geo/*.*":"../../src/geo/*.*","./light/*.*":"../../src/light/*.*","@uncut/node-editor":"../../node_modules/@uncut/node-editor/index.js"}],"../../res/models/desk_exploded.obj":[function(require,module,exports) {
module.exports = "/desk_exploded.4522909d.obj";
},{}],"main.js":[function(require,module,exports) {
"use strict";

var _Test = _interopRequireDefault(require("../../src/Test"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resources = {
  'desk': require('../../res/models/desk_exploded.obj')
};

_Test.default.viewportTest(resources, function (viewport) {});
},{"../../src/Test":"../../src/Test.js","../../res/models/desk_exploded.obj":"../../res/models/desk_exploded.obj"}],"C:/Users/tim/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57526" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/tim/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map