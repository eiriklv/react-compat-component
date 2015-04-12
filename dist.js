"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _React = require("react");

var _React2 = _interopRequireWildcard(_React);

var _invariant = require("react/lib/invariant");

var _invariant2 = _interopRequireWildcard(_invariant);

var _assign = require("object-assign");

var _assign2 = _interopRequireWildcard(_assign);

// Helper to mirror keys as values
function keyMirror(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = key;
    }
  }
  return obj;
}

// React lifecycle methods that can be defined multiple times
var multiFunctions = keyMirror({
  componentWillReceiveProps: null,
  componentWillMount: null,
  componentDidMount: null,
  componentWillUpdate: null,
  componentDidUpdate: null,
  componentWillUnmount: null
});

var CompatComponent = (function (_React$Component) {
  function CompatComponent() {
    var _this = this;

    for (var _len = arguments.length, arrs = Array(_len), _key = 0; _key < _len; _key++) {
      arrs[_key] = arguments[_key];
    }

    _classCallCheck(this, CompatComponent);

    _get(Object.getPrototypeOf(CompatComponent.prototype), "constructor", this).apply(this, arrs);

    // Make sure the mixins array is assigned
    if (!this.mixins) {
      this.mixins = [];
    }

    // Importing mixins from the getMixins method
    if (typeof this.getMixins === "function") {
      var _getMixins = this.getMixins();
      if (this.mixins.length > 0) {
        this.mixins = this.mixins.concat(_getMixins);
      } else {
        this.mixins = _getMixins;
      }
    }

    if (!this.propTypes) {
      this.propTypes = {};
    }

    // Importing propTypes from the getPropTypes method
    if (typeof this.getPropTypes === "function") {
      var _getPropTypes = this.getPropTypes();
      for (var key in _getPropTypes) {
        this.propTypes[key] = _getPropTypes[key];
      }
    }

    if (!this.defaultProps) {
      this.defaultProps = {};
    }

    if (typeof this.getDefaultProps === "function") {
      var _getDefaultProps = this.getDefaultProps();
      for (var key in _getDefaultProps) {
        this.defaultProps[key] = _getDefaultProps[key];
      }
    }

    this.getDOMNode = function () {
      return _React2["default"].findDOMNode(_this);
    };

    this._mixinImports = {};
    this._prePropsMixinFunctions();

    // Reintroduce getInitialState() method
    var state = {};
    if (typeof this.getInitialState === "function") {
      state = this.getInitialState();
    }

    // Merge state with the mixins' getInitialState() output
    var arr = this.mixins.map(function (mixin) {
      if (typeof mixin.getInitialState === "function") {
        return mixin.getInitialState();
      } else {
        return {};
      }
    });
    this.state = _assign2["default"].apply(undefined, _toConsumableArray(arr).concat([state]));

    this._bindFunctions();
  }

  _inherits(CompatComponent, _React$Component);

  _createClass(CompatComponent, [{
    key: "_bindFunctions",

    // Reintroduce autobinding
    value: function _bindFunctions() {
      var _this2 = this;

      var childFunc = Object.getOwnPropertyNames(this.constructor.prototype);
      childFunc.forEach(function (func) {
        if (typeof _this2[func] === "function") {
          _this2[func] = _this2[func].bind(_this2);
        }
      });
    }
  }, {
    key: "_prePropsMixinFunctions",

    // Import the mixins' properties
    value: function _prePropsMixinFunctions() {
      var _this3 = this;

      this.mixins.reverse().forEach(function (mixin) {
        Object.keys(mixin).forEach(function (property) {
          if (property === "propTypes") {
            _this3.propTypes = _assign2["default"](mixin.propTypes || {}, _this3.propTypes || {});
          } else if (property === "getDefaultProps" && typeof mixin.getDefaultProps === "function") {
            _this3.defaultProps = _assign2["default"](mixin.getDefaultProps.call(_this3), _this3.defaultProps || {});
          } else if (property === "statics") {
            _this3.statics = _assign2["default"](mixin.statics, _this3.statics || {});
          } else if (property === "getInitialState") {} else if (typeof mixin[property] === "function") {
            if (multiFunctions[property]) {
              if (!_this3._mixinImports.hasOwnProperty(property)) {
                _this3._mixinImports[property] = [];

                // Save the existing method in the parent class to the
                // "holding" array
                if (typeof _this3[property] === "function") {
                  _this3._mixinImports[property].push(_this3[property].bind(_this3));
                }

                // Overwrite the method to call all methods in the "holding" array
                _this3[property] = function () {
                  var _this4 = this;

                  this._mixinImports[property].forEach(function (func) {
                    func.call(_this4);
                  });
                };
              }

              // Push the mixin's method into the "holding" array
              _this3._mixinImports[property].push(mixin[property].bind(_this3));
            } else {
              // Check whether methods here can be imported, as they're supposed
              // to only be defined once
              _invariant2["default"](!!_this3[property], "You are attempting to redefine '$(property)' on your component. " + "This conflict may be due to a mixin.");
              _this3[property] = mixin[property];
            }
          }
        });
      });
    }
  }]);

  return CompatComponent;
})(_React2["default"].Component);

exports.CompatComponent = CompatComponent;

// This gets handled after the super call in the constructor
// method to make props usable in f.e. getInitialState()
