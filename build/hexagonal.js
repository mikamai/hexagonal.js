;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function(global){(function() {
  var Class, ClassName, Hexagonal, _ref;

  Hexagonal = {};

  _ref = require('./core/index.coffee');
  for (ClassName in _ref) {
    Class = _ref[ClassName];
    Hexagonal[ClassName] = Class;
  }

  Hexagonal.Hexagon = require('./hexagon.coffee');

  Hexagonal.Map = require('./map.coffee');

  Hexagonal.Cursors = require('./cursors/index.coffee');

  Hexagonal.precision = Hexagonal.Util.precision;

  Hexagonal.usingPrecision = function(precision, callback) {
    var oldPrecision;
    oldPrecision = Hexagonal.Util.precision();
    Hexagonal.Util.precision(precision);
    try {
      return callback();
    } finally {
      Hexagonal.Util.precision(oldPrecision);
    }
  };

  global.Hexagonal = module.exports = Hexagonal;

}).call(this);


})(window)
},{"./core/index.coffee":2,"./hexagon.coffee":3,"./map.coffee":4,"./cursors/index.coffee":5}],3:[function(require,module,exports){
(function() {
  var Edge, HalfEdge, Hexagon, Point, Size, Vertex, round,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('./core/point.coffee');

  Size = require('./core/size.coffee');

  Vertex = require('./core/vertex.coffee');

  Edge = require('./core/edge.coffee');

  HalfEdge = require('./core/half_edge.coffee');

  round = require('./core/util.coffee').round;

  Hexagon = (function() {
    Hexagon.sizeMultipliers = {
      pointly: [
        {
          x: 1,
          y: 0.75
        }, {
          x: 0.5,
          y: 1
        }, {
          x: 0,
          y: 0.75
        }, {
          x: 0,
          y: 0.25
        }, {
          x: 0.5,
          y: 0
        }, {
          x: 1,
          y: 0.25
        }
      ],
      flat: [
        {
          x: 1,
          y: 0.5
        }, {
          x: 0.75,
          y: 1
        }, {
          x: 0.25,
          y: 1
        }, {
          x: 0,
          y: 0.5
        }, {
          x: 0.25,
          y: 0
        }, {
          x: 0.75,
          y: 0
        }
      ]
    };

    Hexagon.dimensionCoeff = Math.sqrt(3) / 2;

    Hexagon.byRadius = function(radius, attributes) {
      var angle, angleMod, center, index, vertices, _i;
      if (attributes == null) {
        attributes = {};
      }
      center = new Point(attributes.center);
      vertices = [];
      for (index = _i = 0; _i < 6; index = ++_i) {
        angleMod = attributes.flatTopped ? 0 : 0.5;
        angle = 2 * Math.PI / 6 * (index + angleMod);
        vertices.push(new Vertex({
          x: round(center.x + radius * Math.cos(angle)),
          y: round(center.y + radius * Math.sin(angle))
        }));
      }
      return this.byVertices(vertices, attributes);
    };

    Hexagon._detectedSize = function(size, flatTopped) {
      var coeff, height, width, _ref;
      _ref = [size.width, size.height], width = _ref[0], height = _ref[1];
      coeff = flatTopped ? 1 / this.dimensionCoeff : this.dimensionCoeff;
      if (width) {
        return new Size(width, height != null ? height : round(width / coeff));
      } else if (height) {
        return new Size(round(height * coeff), height);
      }
    };

    Hexagon.bySize = function(size, attributes) {
      var multiplier, multipliers, vertices, _i, _len;
      if (attributes == null) {
        attributes = {};
      }
      if (!(((size != null ? size.width : void 0) != null) || ((size != null ? size.height : void 0) != null))) {
        throw new Error("Size must be provided with width or height or both");
      }
      size = this._detectedSize(size, attributes.flatTopped);
      multipliers = this.sizeMultipliers[attributes.flatTopped ? 'flat' : 'pointly'];
      vertices = [];
      for (_i = 0, _len = multipliers.length; _i < _len; _i++) {
        multiplier = multipliers[_i];
        vertices.push(new Vertex({
          x: round(size.width * multiplier.x),
          y: round(size.height * multiplier.y)
        }));
      }
      return this.byVertices(vertices, attributes);
    };

    Hexagon.byVertices = function(vertices, attributes) {
      var edges, index, nextVertex, vertex;
      if (attributes == null) {
        attributes = {};
      }
      if (vertices.length !== 6) {
        throw new Error('You have to provide 6 vertices');
      }
      edges = (function() {
        var _i, _len, _ref, _results;
        _results = [];
        for (index = _i = 0, _len = vertices.length; _i < _len; index = ++_i) {
          vertex = vertices[index];
          nextVertex = (_ref = vertices[index + 1]) != null ? _ref : vertices[0];
          _results.push(new Edge([vertex, nextVertex]));
        }
        return _results;
      })();
      return this.byEdges(edges, attributes);
    };

    Hexagon.byEdges = function(edges, attributes) {
      var edge, halfEdges;
      if (attributes == null) {
        attributes = {};
      }
      if (edges.length !== 6) {
        throw new Error('You have to provide 6 edges');
      }
      halfEdges = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = edges.length; _i < _len; _i++) {
          edge = edges[_i];
          _results.push(new HalfEdge(edge));
        }
        return _results;
      })();
      return new Hexagon(halfEdges, attributes);
    };

    function Hexagon(halfEdges, attributes) {
      var halfEdge, _i, _len, _ref;
      this.halfEdges = halfEdges;
      if (attributes == null) {
        attributes = {};
      }
      this.toPrimitive = __bind(this.toPrimitive, this);
      this.toString = __bind(this.toString, this);
      this.size = __bind(this.size, this);
      this.position = __bind(this.position, this);
      this.center = __bind(this.center, this);
      if (this.halfEdges.length !== 6) {
        throw new Error('You have to provide 6 halfedges');
      }
      this.topMode = attributes.flatTopped ? 'flat' : 'pointly';
      if (attributes.position != null) {
        this._setPosition(attributes.position);
      }
      _ref = this.halfEdges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        halfEdge = _ref[_i];
        halfEdge.hexagon = this;
      }
    }

    Hexagon.prototype.isFlatTopped = function() {
      return this.topMode === 'flat';
    };

    Hexagon.prototype.isPointlyTopped = function() {
      return this.topMode === 'pointly';
    };

    Hexagon.prototype.vertices = function() {
      var halfEdge, _i, _len, _ref, _results;
      _ref = this.halfEdges;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        halfEdge = _ref[_i];
        _results.push(halfEdge.va());
      }
      return _results;
    };

    Hexagon.prototype.edges = function() {
      var halfEdge, _i, _len, _ref, _results;
      _ref = this.halfEdges;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        halfEdge = _ref[_i];
        _results.push(halfEdge.edge);
      }
      return _results;
    };

    Hexagon.prototype.center = function() {
      return this.position().sum(this.size().width / 2, this.size().height / 2);
    };

    Hexagon.prototype.position = function(value) {
      if (value != null) {
        return this._setPosition(value);
      } else {
        return this._getPosition();
      }
    };

    Hexagon.prototype.size = function(value) {
      if (value != null) {
        return this._setSize(value);
      } else {
        return this._getSize();
      }
    };

    Hexagon.prototype.neighbors = function() {
      var halfEdge, neighbors, otherHalfEdge, _i, _len, _ref;
      neighbors = [];
      _ref = this.halfEdges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        halfEdge = _ref[_i];
        otherHalfEdge = halfEdge.otherHalfEdge();
        if ((otherHalfEdge != null) && neighbors.indexOf(otherHalfEdge.hexagon) < 0) {
          neighbors.push(otherHalfEdge.hexagon);
        }
      }
      return neighbors;
    };

    Hexagon.prototype.toString = function() {
      return "" + this.constructor.name + "(" + (this.position().toString()) + "; " + (this.size().toString()) + ")";
    };

    Hexagon.prototype.isEqual = function(other) {
      var index, v, _i, _len, _ref, _ref1, _ref2;
      if (this.vertices.length !== ((_ref = (_ref1 = other.vertices) != null ? _ref1.length : void 0) != null ? _ref : 0)) {
        return false;
      }
      _ref2 = this.vertices;
      for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
        v = _ref2[index];
        if (!v.isEqual(other.vertices[index])) {
          return false;
        }
      }
      return true;
    };

    Hexagon.prototype.toPrimitive = function() {
      var v, _i, _len, _ref, _results;
      _ref = this.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(v.toPrimitive());
      }
      return _results;
    };

    Hexagon.prototype._copyStartingVerticesFromEdges = function(attributes) {
      var edge, index, _base, _base1, _i, _len, _name, _ref, _results;
      if (attributes.vertices == null) {
        attributes.vertices = [];
      }
      _ref = attributes.edges;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        edge = _ref[index];
        if (!(edge != null)) {
          continue;
        }
        if ((_base = attributes.vertices)[index] == null) {
          _base[index] = edge.va;
        }
        _results.push((_base1 = attributes.vertices)[_name = index + 1] != null ? (_base1 = attributes.vertices)[_name = index + 1] : _base1[_name] = edge.vb);
      }
      return _results;
    };

    Hexagon.prototype._round = function(value) {
      return round(value);
    };

    Hexagon.prototype._getPosition = function() {
      var vertices, xVertexIdx;
      vertices = this.vertices();
      xVertexIdx = this.isFlatTopped() ? 3 : 2;
      return new Point(vertices[xVertexIdx].x, vertices[4].y);
    };

    Hexagon.prototype._setPosition = function(value) {
      var actual, vertex, _i, _len, _ref, _results;
      actual = this._getPosition();
      _ref = this.vertices();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        vertex.x = round(vertex.x - actual.x + value.x);
        _results.push(vertex.y = round(vertex.y - actual.y + value.y));
      }
      return _results;
    };

    Hexagon.prototype._getSize = function() {
      var vertices;
      vertices = this.vertices();
      return new Size({
        width: round(Math.abs(vertices[0].x - this.position().x)),
        height: round(Math.abs(vertices[1].y - this.position().y))
      });
    };

    Hexagon.prototype._setSize = function(value) {
      var index, multiplier, position, vertices, _i, _len, _ref, _results;
      position = this._getPosition();
      vertices = this.vertices();
      _ref = this.constructor.sizeMultipliers[this.topMode];
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        multiplier = _ref[index];
        vertices[index].x = round(position.x + value.width * multiplier.x);
        _results.push(vertices[index].y = round(position.y + value.height * multiplier.y));
      }
      return _results;
    };

    return Hexagon;

  })();

  module.exports = Hexagon;

}).call(this);


},{"./core/point.coffee":6,"./core/size.coffee":7,"./core/vertex.coffee":8,"./core/edge.coffee":9,"./core/half_edge.coffee":10,"./core/util.coffee":11}],4:[function(require,module,exports){
(function() {
  var Edge, HalfEdge, Hexagon, HexagonMatrixFactory, Map, Point, Size, Vertex, round,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Hexagon = require('./hexagon.coffee');

  Point = require('./core/point.coffee');

  Edge = require('./core/edge.coffee');

  HalfEdge = require('./core/half_edge.coffee');

  Vertex = require('./core/vertex.coffee');

  Size = require('./core/size.coffee');

  round = require('./core/util.coffee').round;

  HexagonMatrixFactory = (function() {
    HexagonMatrixFactory.prototype.sharedHexagonEdges = {
      flat: {
        even: [
          {
            type: null,
            pos: new Point(0, -1),
            src: 1,
            dest: 4
          }, {
            type: 'even',
            pos: new Point(-1, 0),
            src: 0,
            dest: 3
          }, {
            type: 'odd',
            pos: new Point(-1, 0),
            src: 5,
            dest: 2
          }, {
            type: 'odd',
            pos: new Point(-1, -1),
            src: 0,
            dest: 3
          }, {
            type: 'odd',
            pos: new Point(1, -1),
            src: 2,
            dest: 5
          }
        ],
        odd: [
          {
            type: null,
            pos: new Point(0, -1),
            src: 1,
            dest: 4
          }, {
            type: 'even',
            pos: new Point(-1, 0),
            src: 5,
            dest: 2
          }, {
            type: 'even',
            pos: new Point(-1, -1),
            src: 0,
            dest: 3
          }, {
            type: 'even',
            pos: new Point(1, -1),
            src: 2,
            dest: 5
          }, {
            type: 'odd',
            pos: new Point(-1, 0),
            src: 0,
            dest: 3
          }
        ]
      },
      pointly: {
        odd: [
          {
            type: null,
            pos: new Point(-1, 0),
            src: 5,
            dest: 2
          }, {
            type: 'even',
            pos: new Point(-1, -1),
            src: 0,
            dest: 3
          }, {
            type: 'even',
            pos: new Point(0, -1),
            src: 1,
            dest: 4
          }, {
            type: 'odd',
            pos: new Point(0, -1),
            src: 0,
            dest: 3
          }, {
            type: 'odd',
            pos: new Point(1, -1),
            src: 1,
            dest: 4
          }
        ],
        even: [
          {
            type: null,
            pos: new Point(-1, 0),
            src: 5,
            dest: 2
          }, {
            type: 'even',
            pos: new Point(0, -1),
            src: 0,
            dest: 3
          }, {
            type: 'even',
            pos: new Point(1, -1),
            src: 1,
            dest: 4
          }, {
            type: 'odd',
            pos: new Point(-1, -1),
            src: 0,
            dest: 3
          }, {
            type: 'odd',
            pos: new Point(0, -1),
            src: 1,
            dest: 4
          }
        ]
      }
    };

    function HexagonMatrixFactory(options) {
      var _ref;
      if (options == null) {
        options = {};
      }
      this._createSampleHexagon = __bind(this._createSampleHexagon, this);
      this.isOddOffsetLayout = __bind(this.isOddOffsetLayout, this);
      this.isEvenOffsetLayout = __bind(this.isEvenOffsetLayout, this);
      this.isPointlyTopped = __bind(this.isPointlyTopped, this);
      this.isFlatTopped = __bind(this.isFlatTopped, this);
      this.topMode = options.flatTopped ? 'flat' : 'pointly';
      this.offsetLayout = (_ref = options.offsetLayout) != null ? _ref : 'odd';
      if (!(['odd', 'even'].indexOf(this.offsetLayout) >= 0)) {
        throw new Error("Unknown offsetLayout. Allowed values: odd, even");
      }
    }

    HexagonMatrixFactory.prototype.isFlatTopped = function() {
      return this.topMode === 'flat';
    };

    HexagonMatrixFactory.prototype.isPointlyTopped = function() {
      return this.topMode === 'pointly';
    };

    HexagonMatrixFactory.prototype.isEvenOffsetLayout = function() {
      return this.offsetLayout === 'even';
    };

    HexagonMatrixFactory.prototype.isOddOffsetLayout = function() {
      return this.offsetLayout === 'odd';
    };

    HexagonMatrixFactory.prototype.buildMatrix = function(attributes) {
      var cols, i, j, rows, _i, _j, _ref;
      if (attributes == null) {
        attributes = {};
      }
      _ref = [attributes.rows, attributes.cols], rows = _ref[0], cols = _ref[1];
      this._sample = this._createSampleHexagon(attributes.hexagon);
      this.matrix = new Array(rows);
      for (j = _i = 0; 0 <= rows ? _i < rows : _i > rows; j = 0 <= rows ? ++_i : --_i) {
        this.matrix[j] = new Array(cols);
        for (i = _j = 0; 0 <= cols ? _j < cols : _j > cols; i = 0 <= cols ? ++_j : --_j) {
          this.matrix[j][i] = this._createHexagonInOffset(i, j);
        }
      }
      return this.matrix;
    };

    HexagonMatrixFactory.prototype._createSampleHexagon = function(hexAttributes) {
      var options;
      options = {
        position: {
          x: 0,
          y: 0
        },
        flatTopped: this.isFlatTopped()
      };
      if ((hexAttributes.width != null) || (hexAttributes.height != null)) {
        return Hexagon.bySize(hexAttributes, options);
      } else if (hexAttributes.radius != null) {
        return Hexagon.byRadius(hexAttributes.radius, options);
      } else {
        throw new Error("Unknown hexagon directive. You have to pass the radius or at least one dimension");
      }
    };

    HexagonMatrixFactory.prototype._createHexagonInOffset = function(i, j) {
      var halfEdges, position;
      position = this._expectedPositionInOffset(i, j);
      halfEdges = this.halfEdgesFromNeighborhood(i, j);
      return new Hexagon(halfEdges, {
        flatTopped: this.isFlatTopped()
      });
    };

    HexagonMatrixFactory.prototype._expectedPositionInOffset = function(i, j) {
      var x, y;
      if (this.isFlatTopped()) {
        y = this._isShiftingRequired(i) ? this._sample.vertices()[0].y : 0;
        return new Point(0, y).sum({
          x: round(round(this._sample.size().width * 0.75) * i),
          y: round(this._sample.size().height * j)
        });
      } else {
        x = this._isShiftingRequired(j) ? this._sample.vertices()[1].x : 0;
        return new Point(x, 0).sum({
          x: round(this._sample.size().width * i),
          y: round(round(this._sample.size().height * 0.75) * j)
        });
      }
    };

    HexagonMatrixFactory.prototype._isShiftingRequired = function(rel) {
      return (this.isEvenOffsetLayout() && rel % 2 === 0) || (this.isOddOffsetLayout() && rel % 2 !== 0);
    };

    HexagonMatrixFactory.prototype._eachHalfEdgeFromSharedMappings = function(i, j, callback) {
      var mapping, neighbor, rel, _i, _len, _ref, _ref1, _results;
      _ref = this.sharedHexagonEdges[this.topMode][this.offsetLayout];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mapping = _ref[_i];
        neighbor = (_ref1 = this.matrix[j + mapping.pos.y]) != null ? _ref1[i + mapping.pos.x] : void 0;
        rel = this.isFlatTopped() ? i : j;
        if ((mapping.type === 'odd' && rel % 2 === 0) || (mapping.type === 'even' && rel % 2 !== 0)) {
          continue;
        }
        if (neighbor == null) {
          continue;
        }
        _results.push(callback(mapping.dest, neighbor.halfEdges[mapping.src]));
      }
      return _results;
    };

    HexagonMatrixFactory.prototype.halfEdgesFromNeighborhood = function(i, j) {
      var halfEdge, halfEdges, index, vertices, _i, _len, _ref;
      halfEdges = new Array(6);
      this._eachHalfEdgeFromSharedMappings(i, j, function(halfEdgeIdx, srcHalfEdge) {
        return halfEdges[halfEdgeIdx] != null ? halfEdges[halfEdgeIdx] : halfEdges[halfEdgeIdx] = srcHalfEdge.opposite();
      });
      vertices = null;
      for (index = _i = 0, _len = halfEdges.length; _i < _len; index = ++_i) {
        halfEdge = halfEdges[index];
        if (!(halfEdge == null)) {
          continue;
        }
        if (vertices == null) {
          vertices = this.verticesFromNeighborhood(i, j);
        }
        halfEdges[index] = new HalfEdge(new Edge(vertices[index], (_ref = vertices[index + 1]) != null ? _ref : vertices[0]));
      }
      return halfEdges;
    };

    HexagonMatrixFactory.prototype.verticesFromNeighborhood = function(i, j) {
      var index, v, vertices, _i, _len, _ref;
      vertices = new Array(6);
      this._eachHalfEdgeFromSharedMappings(i, j, function(halfEdgeIdx, srcHalfEdge) {
        var _name;
        if (vertices[halfEdgeIdx] == null) {
          vertices[halfEdgeIdx] = srcHalfEdge.vb();
        }
        return vertices[_name = (halfEdgeIdx + 1) % vertices.length] != null ? vertices[_name = (halfEdgeIdx + 1) % vertices.length] : vertices[_name] = srcHalfEdge.va();
      });
      _ref = this._sample.vertices();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        v = _ref[index];
        if (vertices[index] == null) {
          vertices[index] = new Vertex(v.sum(this._expectedPositionInOffset(i, j)));
        }
      }
      return vertices;
    };

    return HexagonMatrixFactory;

  })();

  Map = (function() {
    function Map(attributes) {
      var factory, meth, _i, _len, _ref, _ref1;
      if (attributes == null) {
        attributes = {};
      }
      this._detectedHexagonSize = __bind(this._detectedHexagonSize, this);
      this.f = factory = new HexagonMatrixFactory(attributes);
      _ref = ['isFlatTopped', 'isPointlyTopped', 'isEvenOffsetLayout', 'isOddOffsetLayout'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        meth = _ref[_i];
        this[meth] = factory[meth];
      }
      this.matrix = factory.buildMatrix({
        rows: attributes.rows,
        cols: attributes.cols,
        hexagon: (_ref1 = attributes.hexagon) != null ? _ref1 : this._detectedHexagonSize(attributes)
      });
    }

    Map.prototype.hexagons = function() {
      var cell, cols, i, j, row, rows, _i, _j, _len, _len1, _ref, _ref1;
      if (this._hexagons != null) {
        return this._hexagons;
      }
      _ref = [this.matrix.length, this.matrix[0].length], rows = _ref[0], cols = _ref[1];
      this._hexagons = new Array(rows * cols);
      _ref1 = this.matrix;
      for (j = _i = 0, _len = _ref1.length; _i < _len; j = ++_i) {
        row = _ref1[j];
        for (i = _j = 0, _len1 = row.length; _j < _len1; i = ++_j) {
          cell = row[i];
          this._hexagons[j * cols + i] = cell;
        }
      }
      return this._hexagons;
    };

    Map.prototype.firstHexagon = function() {
      return this.hexagons()[0];
    };

    Map.prototype.lastHexagon = function() {
      return this.hexagons()[this.hexagons().length - 1];
    };

    Map.prototype.size = function() {
      var lastHexPos;
      lastHexPos = this.lastHexagon().position();
      return this.lastHexagon().size().sum({
        width: lastHexPos.x,
        height: lastHexPos.y
      });
    };

    Map.prototype.at = function(i, j) {
      var _ref;
      return (_ref = this.matrix[j]) != null ? _ref[i] : void 0;
    };

    Map.prototype._detectedHexagonSize = function(attributes) {
      var cols, divider, height, rows, width, _ref;
      if (!((attributes.width != null) || (attributes.height != null))) {
        throw new Error("Cannot detect correct hexagon size");
      }
      _ref = [attributes.rows, attributes.cols, null, null], rows = _ref[0], cols = _ref[1], width = _ref[2], height = _ref[3];
      if (attributes.width != null) {
        divider = this.isFlatTopped() ? 1 / ((cols - 1) * 0.75 + 1) : 2 / (2 * cols + 1);
        width = round(attributes.width * divider);
      }
      if (attributes.height != null) {
        divider = this.isFlatTopped() ? 2 / (2 * rows + 1) : 1 / ((rows - 1) * 0.75 + 1);
        height = round(attributes.height * divider);
      }
      return {
        width: width,
        height: height
      };
    };

    return Map;

  })();

  module.exports = Map;

}).call(this);


},{"./hexagon.coffee":3,"./core/point.coffee":6,"./core/edge.coffee":9,"./core/half_edge.coffee":10,"./core/vertex.coffee":8,"./core/size.coffee":7,"./core/util.coffee":11}],2:[function(require,module,exports){
(function() {
  var Edge, HalfEdge, Point, Point3D, Size, Util, Vertex;

  Point = require('./point.coffee');

  Size = require('./size.coffee');

  Vertex = require('./vertex.coffee');

  Edge = require('./edge.coffee');

  HalfEdge = require('./half_edge.coffee');

  Util = require('./util.coffee');

  Point3D = require('./point_3d.coffee');

  module.exports = {
    Point: Point,
    Size: Size,
    Edge: Edge,
    Vertex: Vertex,
    HalfEdge: HalfEdge,
    Util: Util,
    Point3D: Point3D
  };

}).call(this);


},{"./point.coffee":6,"./size.coffee":7,"./vertex.coffee":8,"./edge.coffee":9,"./half_edge.coffee":10,"./util.coffee":11,"./point_3d.coffee":12}],5:[function(require,module,exports){
(function() {
  module.exports = {
    OffsetCursor: require('./offset_cursor.coffee'),
    AxialCursor: require('./axial_cursor.coffee'),
    CubeCursor: require('./cube_cursor.coffee')
  };

}).call(this);


},{"./offset_cursor.coffee":13,"./axial_cursor.coffee":14,"./cube_cursor.coffee":15}],9:[function(require,module,exports){
(function() {
  var Edge,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Edge = (function() {
    function Edge() {
      this.toString = __bind(this.toString, this);
      this.toPrimitive = __bind(this.toPrimitive, this);
      this.isEqual = __bind(this.isEqual, this);
      var a, vertex, _i, _len, _ref, _ref1;
      this.vertices = arguments.length > 1 ? (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          a = arguments[_i];
          _results.push(a);
        }
        return _results;
      }).apply(this, arguments) : arguments[0];
      if (((_ref = this.vertices) != null ? _ref.length : void 0) !== 2) {
        throw new Error('You have to provide 2 vertices');
      }
      _ref1 = this.vertices;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        vertex = _ref1[_i];
        vertex.pushEdge(this);
      }
      this.halfEdges = [];
    }

    Edge.prototype.hexagons = function() {
      var halfEdge, _i, _len, _ref, _results;
      _ref = this.halfEdges;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        halfEdge = _ref[_i];
        _results.push(halfEdge.hexagon);
      }
      return _results;
    };

    Edge.prototype.isContainedIn = function(hexagon) {
      var hex, _i, _len, _ref;
      _ref = this.hexagons();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hex = _ref[_i];
        if (hex.isEqual(hexagon)) {
          return true;
        }
      }
      return false;
    };

    Edge.prototype.isEqual = function(other) {
      var index, vertex, _i, _len, _ref;
      _ref = this.vertices;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        vertex = _ref[index];
        if (!vertex.isEqual(other.vertices[index])) {
          return false;
        }
      }
      return true;
    };

    Edge.prototype.toPrimitive = function() {
      var v;
      return {
        vertices: (function() {
          var _i, _len, _ref, _results;
          _ref = this.vertices;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _results.push(v.toPrimitive());
          }
          return _results;
        }).call(this)
      };
    };

    Edge.prototype.toString = function() {
      return "" + this.constructor.name + "{" + (this.vertices[0].toString()) + ", " + (this.vertices[1].toString()) + "}";
    };

    return Edge;

  })();

  module.exports = Edge;

}).call(this);


},{}],10:[function(require,module,exports){
(function() {
  var HalfEdge,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  HalfEdge = (function() {
    function HalfEdge(edge, direction) {
      this.edge = edge;
      this.direction = direction != null ? direction : 1;
      this.opposite = __bind(this.opposite, this);
      this.toString = __bind(this.toString, this);
      this.toPrimitive = __bind(this.toPrimitive, this);
      this.isEqual = __bind(this.isEqual, this);
      if (this.edge == null) {
        throw new Error('You have to provide an edge');
      }
      if (this.direction !== 1 && this.direction !== -1) {
        throw new Error('Direction must be 1 or -1');
      }
      this.hexagon = null;
      this.edge.halfEdges.push(this);
    }

    HalfEdge.prototype.vertices = function() {
      if (this.direction === 1) {
        return this.edge.vertices;
      } else {
        return this.edge.vertices.slice(0).reverse();
      }
    };

    HalfEdge.prototype.va = function() {
      return this.vertices()[0];
    };

    HalfEdge.prototype.vb = function() {
      return this.vertices()[1];
    };

    HalfEdge.prototype.otherHalfEdge = function() {
      var halfEdge, _i, _len, _ref;
      _ref = this.edge.halfEdges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        halfEdge = _ref[_i];
        if (halfEdge !== this) {
          return halfEdge;
        }
      }
    };

    HalfEdge.prototype.isEqual = function(other) {
      return this.va().isEqual(other.va()) && this.vb().isEqual(other.vb());
    };

    HalfEdge.prototype.toPrimitive = function() {
      return {
        va: this.va().toPrimitive(),
        vb: this.vb().toPrimitive()
      };
    };

    HalfEdge.prototype.toString = function() {
      return "" + this.constructor.name + "{" + (this.va().toString()) + ", " + (this.vb().toString()) + "}";
    };

    HalfEdge.prototype.opposite = function() {
      return new HalfEdge(this.edge, this.direction === 1 ? -1 : 1);
    };

    return HalfEdge;

  })();

  module.exports = HalfEdge;

}).call(this);


},{}],11:[function(require,module,exports){
(function() {
  var precision;

  precision = 1;

  module.exports = {
    precision: function(value) {
      if (value != null) {
        return precision = value;
      } else {
        return precision;
      }
    },
    round: function(value) {
      var divider;
      if (precision != null) {
        divider = Math.pow(10, precision);
        return Math.round(value * divider) / divider;
      } else {
        return value;
      }
    }
  };

}).call(this);


},{}],6:[function(require,module,exports){
(function() {
  var Point, round,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  round = require('./util.coffee').round;

  Point = (function() {
    function Point() {
      this.toString = __bind(this.toString, this);
      this.toPrimitive = __bind(this.toPrimitive, this);
      var attributes, _ref, _ref1;
      attributes = this._extractAttributes(arguments);
      this.x = (_ref = attributes.x) != null ? _ref : 0;
      this.y = (_ref1 = attributes.y) != null ? _ref1 : 0;
    }

    Point.prototype.isEqual = function(other) {
      return this.x === other.x && this.y === other.y;
    };

    Point.prototype.toPrimitive = function() {
      return {
        x: this.x,
        y: this.y
      };
    };

    Point.prototype.toString = function() {
      return "" + this.constructor.name + "(" + this.x + ", " + this.y + ")";
    };

    Point.prototype.sum = function() {
      var attributes;
      attributes = this._extractAttributes(arguments);
      return new this.constructor(round(this.x + attributes.x), round(this.y + attributes.y));
    };

    Point.prototype.sub = function() {
      var attributes;
      attributes = this._extractAttributes(arguments);
      return new this.constructor(round(this.x - attributes.x), round(this.y - attributes.y));
    };

    Point.prototype._extractAttributes = function(args) {
      var attributes, _ref, _ref1, _ref2;
      attributes = (_ref = args[0]) != null ? _ref : {};
      if (typeof attributes === 'number' || args.length > 1) {
        attributes = {
          x: (_ref1 = args[0]) != null ? _ref1 : 0,
          y: (_ref2 = args[1]) != null ? _ref2 : 0
        };
      }
      return attributes;
    };

    return Point;

  })();

  module.exports = Point;

}).call(this);


},{"./util.coffee":11}],7:[function(require,module,exports){
(function() {
  var Size, round,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  round = require('./util.coffee').round;

  Size = (function() {
    function Size() {
      this.toString = __bind(this.toString, this);
      this.toPrimitive = __bind(this.toPrimitive, this);
      var attributes, _ref, _ref1, _ref2;
      attributes = (_ref = arguments[0]) != null ? _ref : {};
      if (typeof attributes === 'number' || arguments.length > 1) {
        attributes = {
          width: arguments[0],
          height: arguments[1]
        };
      }
      this.width = (_ref1 = attributes.width) != null ? _ref1 : 0;
      this.height = (_ref2 = attributes.height) != null ? _ref2 : 0;
    }

    Size.prototype.sum = function() {
      var attributes;
      attributes = this._extractAttributes(arguments);
      return new this.constructor(round(this.width + attributes.width), round(this.height + attributes.height));
    };

    Size.prototype.isEqual = function(other) {
      return this.width === other.width && this.height === other.height;
    };

    Size.prototype.toPrimitive = function() {
      return {
        width: this.width,
        height: this.height
      };
    };

    Size.prototype.toString = function() {
      return "" + this.constructor.name + " (" + this.width + ", " + this.height + ")";
    };

    Size.prototype._extractAttributes = function(args) {
      var attributes, _ref, _ref1, _ref2;
      attributes = (_ref = args[0]) != null ? _ref : {};
      if (typeof attributes === 'number' || args.length > 1) {
        attributes = {
          width: (_ref1 = args[0]) != null ? _ref1 : 0,
          height: (_ref2 = args[1]) != null ? _ref2 : 0
        };
      }
      return attributes;
    };

    return Size;

  })();

  module.exports = Size;

}).call(this);


},{"./util.coffee":11}],8:[function(require,module,exports){
(function() {
  var Point, Vertex,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Point = require('./point.coffee');

  Vertex = (function(_super) {
    __extends(Vertex, _super);

    function Vertex() {
      Vertex.__super__.constructor.apply(this, arguments);
      this.edges = [];
    }

    Vertex.prototype.pushEdge = function(edge) {
      return this.edges.push(edge);
    };

    return Vertex;

  })(Point);

  module.exports = Vertex;

}).call(this);


},{"./point.coffee":6}],12:[function(require,module,exports){
(function() {
  var Point, Point3D, round,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Point = require('./point.coffee');

  round = require('./util.coffee').round;

  Point3D = (function(_super) {
    __extends(Point3D, _super);

    function Point3D() {
      this.toString = __bind(this.toString, this);
      this.toPrimitive = __bind(this.toPrimitive, this);
      Point3D.__super__.constructor.apply(this, arguments);
      this.z = this._extractAttributes(arguments).z;
    }

    Point3D.prototype.isEqual = function(other) {
      return this.x === other.x && this.y === other.y && this.z === other.z;
    };

    Point3D.prototype.toPrimitive = function() {
      return {
        x: this.x,
        y: this.y,
        z: this.z
      };
    };

    Point3D.prototype.toString = function() {
      return "" + this.constructor.name + "(" + this.x + ", " + this.y + ", " + this.z + ")";
    };

    Point3D.prototype.sum = function() {
      var attributes;
      attributes = this._extractAttributes(arguments);
      return new this.constructor(round(this.x + attributes.x), round(this.y + attributes.y), round(this.z + attributes.z));
    };

    Point3D.prototype.sub = function() {
      var attributes;
      attributes = this._extractAttributes(arguments);
      return new this.constructor(round(this.x - attributes.x), round(this.y - attributes.y), round(this.z - attributes.z));
    };

    Point3D.prototype._extractAttributes = function(args) {
      var attributes, _ref, _ref1, _ref2, _ref3;
      attributes = (_ref = args[0]) != null ? _ref : {};
      if (typeof attributes === 'number' || args.length > 1) {
        attributes = {
          x: (_ref1 = args[0]) != null ? _ref1 : 0,
          y: (_ref2 = args[1]) != null ? _ref2 : 0,
          z: (_ref3 = args[2]) != null ? _ref3 : 0
        };
      }
      return attributes;
    };

    return Point3D;

  })(Point);

  module.exports = Point3D;

}).call(this);


},{"./point.coffee":6,"./util.coffee":11}],13:[function(require,module,exports){
(function() {
  var OffsetCursor, Point,
    __slice = [].slice;

  Point = require('../core/point.coffee');

  OffsetCursor = (function() {
    function OffsetCursor() {
      var args, mapOrCursor;
      mapOrCursor = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (mapOrCursor.offsetPosition) {
        this.map = mapOrCursor.map;
        this.moveTo(mapOrCursor.offsetPosition());
      } else {
        this.map = mapOrCursor;
        this.moveTo(this._extractOffset(args));
      }
    }

    OffsetCursor.prototype.moveTo = function() {
      var _ref;
      this.position = this._extractOffset(arguments);
      return this.hexagon = (_ref = this.map.matrix[this.position.y]) != null ? _ref[this.position.x] : void 0;
    };

    OffsetCursor.prototype.axialPosition = function() {
      return this.position.sub(this._centerPoint());
    };

    OffsetCursor.prototype.cubePosition = function() {
      var axial;
      axial = this.axialPosition();
      return {
        x: axial.x,
        y: -(axial.x + axial.y),
        z: axial.y
      };
    };

    OffsetCursor.prototype._centerPoint = function() {
      var centerY;
      if (this._center != null) {
        return this._center;
      }
      centerY = Math.round((this.map.matrix.length - 1) / 2);
      return this._center = new Point({
        x: Math.round((this.map.matrix[centerY].length - 1) / 2),
        y: centerY
      });
    };

    OffsetCursor.prototype._extractOffset = function(args) {
      var obj;
      if (args.length === 2) {
        return new Point(args[0], args[1]);
      } else {
        obj = args[0];
        if ((obj.x != null) || (obj.y != null)) {
          return obj;
        } else if ((obj.i != null) || (obj.j != null)) {
          return new Point(obj.i, obj.j);
        } else {
          throw new Error("Bad arg for @at. You can call .at(x, y), .at(x: x, y: y) or .at(i: x, j: y)");
        }
      }
    };

    return OffsetCursor;

  })();

  module.exports = OffsetCursor;

}).call(this);


},{"../core/point.coffee":6}],14:[function(require,module,exports){
(function() {
  var AxialCursor, Point,
    __slice = [].slice;

  Point = require('../core/point.coffee');

  AxialCursor = (function() {
    function AxialCursor() {
      var args, mapOrCursor;
      mapOrCursor = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (mapOrCursor.axialPosition) {
        this.map = mapOrCursor.map;
        this.moveTo(mapOrCursor.axialPosition());
      } else {
        this.map = mapOrCursor;
        this.moveTo(this._extractPoint(args));
      }
    }

    AxialCursor.prototype.moveTo = function() {
      var point, _ref;
      this.position = this._extractPoint(arguments);
      point = this._centerPoint().sum(this.position);
      return this.hexagon = (_ref = this.map.matrix[point.y]) != null ? _ref[point.x] : void 0;
    };

    AxialCursor.prototype.axialPosition = function() {
      return this.position;
    };

    AxialCursor.prototype.cubePosition = function() {
      return {
        x: this.position.x,
        y: -(this.position.x + this.position.y),
        z: this.position.y
      };
    };

    AxialCursor.prototype.offsetPosition = function() {
      return this._centerPoint().sum(this.position);
    };

    AxialCursor.prototype._centerPoint = function() {
      var centerY;
      if (this._center != null) {
        return this._center;
      }
      centerY = Math.round((this.map.matrix.length - 1) / 2);
      return this._center = new Point({
        x: Math.round((this.map.matrix[centerY].length - 1) / 2),
        y: centerY
      });
    };

    AxialCursor.prototype._extractPoint = function(args) {
      var obj;
      if (args.length === 2) {
        return new Point(args[0], args[1]);
      } else {
        obj = args[0];
        if ((obj.x != null) || (obj.y != null)) {
          return obj;
        } else {
          throw new Error("Bad arg for @at. You can call .at(x, y), .at(x: x, y: y)");
        }
      }
    };

    return AxialCursor;

  })();

  module.exports = AxialCursor;

}).call(this);


},{"../core/point.coffee":6}],15:[function(require,module,exports){
(function() {
  var CubeCursor, Point, Point3D,
    __slice = [].slice;

  Point = require('../core/point.coffee');

  Point3D = require('../core/point_3d.coffee');

  CubeCursor = (function() {
    function CubeCursor() {
      var args, mapOrCursor;
      mapOrCursor = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (mapOrCursor.cubePosition) {
        this.map = mapOrCursor.map;
        this.moveTo(mapOrCursor.cubePosition());
      } else {
        this.map = mapOrCursor;
        this.moveTo(this._extractPoint(args));
      }
    }

    CubeCursor.prototype.moveTo = function() {
      var point, _ref;
      this.position = this._extractPoint(arguments);
      point = this._centerPoint().sum(this.position);
      return this.hexagon = (_ref = this.map.matrix[point.z]) != null ? _ref[point.x] : void 0;
    };

    CubeCursor.prototype.axialPosition = function() {
      return new Point({
        x: this.position.x,
        y: this.position.z
      });
    };

    CubeCursor.prototype.offsetPosition = function() {
      var axial, center, _ref;
      _ref = [this._centerPoint(), this.axialPosition()], center = _ref[0], axial = _ref[1];
      return new Point({
        x: center.x + axial.x,
        y: center.z + axial.y
      });
    };

    CubeCursor.prototype._centerPoint = function() {
      var centerX, centerY;
      if (this._center != null) {
        return this._center;
      }
      centerY = Math.round((this.map.matrix.length - 1) / 2);
      centerX = Math.round((this.map.matrix[centerY].length - 1) / 2);
      return this._center = new Point3D({
        x: centerX,
        y: -centerY - centerX,
        z: centerY
      });
    };

    CubeCursor.prototype._extractPoint = function(args) {
      var obj;
      if (args.length === 3) {
        return new Point3D({
          x: args[0],
          y: args[1],
          z: args[2]
        });
      } else {
        obj = args[0];
        if ((obj.x != null) || (obj.y != null) || (obj.z != null)) {
          return obj;
        } else {
          throw new Error("Bad arg for @at. You can call .at(x, y, z), .at(x: x, y: y, z: z)");
        }
      }
    };

    return CubeCursor;

  })();

  module.exports = CubeCursor;

}).call(this);


},{"../core/point.coffee":6,"../core/point_3d.coffee":12}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvaGV4YWdvbi5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvbWFwLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jdXJzb3JzL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL2VkZ2UuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL3V0aWwuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvcG9pbnQuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvc2l6ZS5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvY29yZS92ZXJ0ZXguY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvcG9pbnRfM2QuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2N1cnNvcnMvb2Zmc2V0X2N1cnNvci5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvY3Vyc29ycy9heGlhbF9jdXJzb3IuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2N1cnNvcnMvY3ViZV9jdXJzb3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtDQUFBLEtBQUEsMkJBQUE7O0NBQUEsQ0FBQSxDQUFZLE1BQVo7O0NBRUE7Q0FBQSxNQUFBLFVBQUE7NkJBQUE7Q0FDRSxFQUF1QixDQUF2QixDQUFBLElBQVU7Q0FEWixFQUZBOztDQUFBLENBS0EsQ0FBb0IsSUFBcEIsRUFBUyxTQUFXOztDQUxwQixDQU1BLENBQUEsSUFBb0IsRUFBWCxLQUFXOztDQU5wQixDQU9BLENBQW9CLElBQXBCLEVBQVMsZUFBVzs7Q0FQcEIsQ0FTQSxDQUFzQixDQUFjLEtBQTNCOztDQVRULENBVUEsQ0FBMkIsS0FBQSxDQUFsQixLQUFUO0NBQ0UsT0FBQSxJQUFBO0NBQUEsRUFBZSxDQUFmLEtBQXdCLEdBQXhCO0NBQUEsR0FDQSxLQUFTO0NBQ1Q7Q0FDRSxPQUFBLEtBQUE7TUFERjtDQUdFLEdBQWMsRUFBZCxHQUFTLEdBQVQ7TUFOdUI7Q0FWM0IsRUFVMkI7O0NBVjNCLENBa0JBLENBQW1CLEdBQWIsQ0FBYSxFQUFuQjtDQWxCQTs7Ozs7O0FDQUE7Q0FBQSxLQUFBLDZDQUFBO0tBQUEsNkVBQUE7O0NBQUEsQ0FBQSxDQUFXLEVBQVgsRUFBVyxjQUFBOztDQUFYLENBQ0EsQ0FBVyxDQUFYLEdBQVcsYUFBQTs7Q0FEWCxDQUVBLENBQVcsR0FBWCxDQUFXLGVBQUE7O0NBRlgsQ0FHQSxDQUFXLENBQVgsR0FBVyxhQUFBOztDQUhYLENBSUEsQ0FBVyxJQUFBLENBQVgsaUJBQVc7O0NBSlgsQ0FNQSxDQUFXLEVBQVgsRUFBVyxhQUFBOztDQU5YLENBK0JNO0NBQ0osRUFDRSxDQURGLEdBQUMsUUFB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QTdCZjs7Q0FKRjs7Q0FBQSxDQTJDQSxDQUFpQixHQUFYLENBQU4sR0EzQ0E7Q0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiSGV4YWdvbmFsID0ge31cblxuZm9yIENsYXNzTmFtZSwgQ2xhc3Mgb2YgcmVxdWlyZSAnLi9jb3JlL2luZGV4LmNvZmZlZSdcbiAgSGV4YWdvbmFsW0NsYXNzTmFtZV0gPSBDbGFzc1xuXG5IZXhhZ29uYWwuSGV4YWdvbiA9IHJlcXVpcmUgJy4vaGV4YWdvbi5jb2ZmZWUnXG5IZXhhZ29uYWwuTWFwICAgICA9IHJlcXVpcmUgJy4vbWFwLmNvZmZlZSdcbkhleGFnb25hbC5DdXJzb3JzID0gcmVxdWlyZSAnLi9jdXJzb3JzL2luZGV4LmNvZmZlZSdcblxuSGV4YWdvbmFsLnByZWNpc2lvbiA9IEhleGFnb25hbC5VdGlsLnByZWNpc2lvblxuSGV4YWdvbmFsLnVzaW5nUHJlY2lzaW9uID0gKHByZWNpc2lvbiwgY2FsbGJhY2spIC0+XG4gIG9sZFByZWNpc2lvbiA9IEhleGFnb25hbC5VdGlsLnByZWNpc2lvbigpXG4gIEhleGFnb25hbC5VdGlsLnByZWNpc2lvbiBwcmVjaXNpb25cbiAgdHJ5XG4gICAgY2FsbGJhY2soKVxuICBmaW5hbGx5XG4gICAgSGV4YWdvbmFsLlV0aWwucHJlY2lzaW9uIG9sZFByZWNpc2lvblxuXG5nbG9iYWwuSGV4YWdvbmFsID0gbW9kdWxlLmV4cG9ydHMgPSBIZXhhZ29uYWxcbiIsIlBvaW50ICAgID0gcmVxdWlyZSAnLi9jb3JlL3BvaW50LmNvZmZlZSdcblNpemUgICAgID0gcmVxdWlyZSAnLi9jb3JlL3NpemUuY29mZmVlJ1xuVmVydGV4ICAgPSByZXF1aXJlICcuL2NvcmUvdmVydGV4LmNvZmZlZSdcbkVkZ2UgICAgID0gcmVxdWlyZSAnLi9jb3JlL2VkZ2UuY29mZmVlJ1xuSGFsZkVkZ2UgPSByZXF1aXJlICcuL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSdcblxucm91bmQgICAgPSByZXF1aXJlKCcuL2NvcmUvdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG4jIEhleGFnb25cbiNcbiMgQGV4YW1wbGUgQnVpbHQgdXNpbmcgUmFkaXVzXG4jICAgSGV4YWdvbi5ieVJhZGl1cyAyICMgYnVpbHQgd2l0aCByYWRpdXMgMiBhbmQgY2VudGVyIHBsYWNlZCBpbiB0aGUgb3JpZ2luXG4jICAgSGV4YWdvbi5ieVJhZGl1cyBjZW50ZXI6IHsgeDogMSwgeTogMiB9LCByYWRpdXM6IDJcbiNcbiMgQGV4YW1wbGUgQnVpbHQgdXNpbmcgVmVydGljZXNcbiMgICBIZXhhZ29uLmJ5VmVydGljZXMgW3YxLCB2MiwgdjMsIHY0LCB2NSwgdjZdXG4jXG4jIEBleGFtcGxlIEJ1aWx0IHVzaW5nIEVkZ2VzXG4jICAgSGV4YWdvbi5ieUVkZ2VzIFtlMSwgZTIsIGUzLCBlNCwgZTUsIGU2XVxuI1xuIyBAZXhhbXBsZSBCdWlsdCB1c2luZyBTaXplXG4jICAgSGV4YWdvbi5ieVNpemUgeyB3aWR0aDogMTAsIGhlaWdodDogMTAgfSAjIHdpdGggcG9zaXRpb24gcGxhY2VkIGluIHRoZSBvcmlnaW5cbiMgICBIZXhhZ29uLmJ5U2l6ZSB7IHdpZHRoOiAxMCB9LCAgcG9zaXRpb246IHsgeDogMSwgeTogMn0gIyBoZWlnaHQgd2lsbCBiZSBkZXRlY3RlZFxuIyAgIEhleGFnb24uYnlTaXplIHsgaGVpZ2h0OiAxMCB9LCBwb3NpdGlvbjogeyB4OiAxLCB5OiAyfSAjIHdpZHRoIHdpbGwgYmUgZGV0ZWN0ZWRcbiNcbiMgV2hlbiB5b3UgY3JlYXRlIGFuIGhleGFnb24geW91IHNob3VsZCBhbHdheXMgcGFzcyB0aGUgZmxhdFRvcHBlZCBvcHRpb24gc2V0IHRvIHRydWUgaWYgeW91IHdhbnRcbiMgdGhlIGhleGFnb24gdG8gYmUgaGFuZGxlZCBhcyBmbGF0IHRvcHBlZC5cbiNcbiMgQGV4YW1wbGVcbiMgICBIZXhhZ29uLmJ5U2l6ZSB7IHdpZHRoOiAxMCwgaGVpZ2h0OiAxMCB9ICMgY3JlYXRlcyBhIHBvaW50eSB0b3BwZWQgaGV4YWdvblxuIyAgIEhleGFnb24uYnlTaXplIHsgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwIH0sIGZsYXRUb3BwZWQ6IHRydWUgIyBjcmVhdGVzIGEgZmxhdCB0b3BwZWQgaGV4YWdvblxuY2xhc3MgSGV4YWdvblxuICBAc2l6ZU11bHRpcGxpZXJzOlxuICAgIHBvaW50bHk6IFtcbiAgICAgIHsgeDogMSwgICB5OiAwLjc1IH0sXG4gICAgICB7IHg6IDAuNSwgeTogMSB9LFxuICAgICAgeyB4OiAwLCAgIHk6IDAuNzUgfSxcbiAgICAgIHsgeDogMCwgICB5OiAwLjI1IH0sXG4gICAgICB7IHg6IDAuNSwgeTogMCB9LFxuICAgICAgeyB4OiAxLCAgIHk6IDAuMjUgfVxuICAgIF0sXG4gICAgZmxhdDogW1xuICAgICAgeyB4OiAxLCAgICB5OiAwLjUgfSxcbiAgICAgIHsgeDogMC43NSwgeTogMSB9LFxuICAgICAgeyB4OiAwLjI1LCB5OiAxIH0sXG4gICAgICB7IHg6IDAsICAgIHk6IDAuNSB9LFxuICAgICAgeyB4OiAwLjI1LCB5OiAwIH0sXG4gICAgICB7IHg6IDAuNzUsIHk6IDAgfVxuICAgIF1cbiAgQGRpbWVuc2lvbkNvZWZmOiBNYXRoLnNxcnQoMykgLyAyXG5cbiAgIyBDcmVhdGVzIGEgcmVndWxhciBIZXhhZ29uIGdpdmVuIGl0cyByYWRpdXNcbiAgIyBAcGFyYW0gcmFkaXVzIFtOdW1iZXJdIHJhZGl1cyBvZiB0aGUgY2lyY2xlIGluc2NyaWJpbmcgdGhlIGhleGFnb25cbiAgIyBAcGFyYW0gYXR0cmlidXRlcyBbSGFzaF0gT3B0aW9ucyB0byBwcm92aWRlOlxuICAjICAgY2VudGVyOiBjZW50ZXIgb2YgdGhlIGhleGFnb25cbiAgIyAgIGZsYXRUb3BwZWQ6IHdoZXRoZXIgdG8gY3JlYXRlIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlSYWRpdXM6IChyYWRpdXMsIGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQgYXR0cmlidXRlcy5jZW50ZXJcbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgZm9yIGluZGV4IGluIFswLi4uNl1cbiAgICAgIGFuZ2xlTW9kID0gaWYgYXR0cmlidXRlcy5mbGF0VG9wcGVkIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgYW5nbGUgICAgPSAyICogTWF0aC5QSSAvIDYgKiAoaW5kZXggKyBhbmdsZU1vZClcbiAgICAgIHZlcnRpY2VzLnB1c2ggbmV3IFZlcnRleFxuICAgICAgICB4OiByb3VuZChjZW50ZXIueCArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSlcbiAgICAgICAgeTogcm91bmQoY2VudGVyLnkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkpXG4gICAgQGJ5VmVydGljZXMgdmVydGljZXMsIGF0dHJpYnV0ZXNcblxuICBAX2RldGVjdGVkU2l6ZTogKHNpemUsIGZsYXRUb3BwZWQpIC0+XG4gICAgW3dpZHRoLCBoZWlnaHRdID0gW3NpemUud2lkdGgsIHNpemUuaGVpZ2h0XVxuICAgIGNvZWZmID0gaWYgZmxhdFRvcHBlZCB0aGVuIDEgLyBAZGltZW5zaW9uQ29lZmYgZWxzZSBAZGltZW5zaW9uQ29lZmZcbiAgICBpZiB3aWR0aFxuICAgICAgbmV3IFNpemUgd2lkdGgsIGhlaWdodCA/IHJvdW5kKHdpZHRoIC8gY29lZmYpXG4gICAgZWxzZSBpZiBoZWlnaHRcbiAgICAgIG5ldyBTaXplIHJvdW5kKGhlaWdodCAqIGNvZWZmKSwgaGVpZ2h0XG5cbiAgIyBDcmVhdGVzIGFuIEhleGFnb24gZ2l2ZW4gaXRzIHNpemVcbiAgIyBAcGFyYW0gc2l6ZSBbU2l6ZV0gU2l6ZSB0byB1c2UgdG8gY3JlYXRlIHRoZSBoZXhhZ29uXG4gICMgICBJZiBvbmUgb2YgdGhlIHNpemUgdmFsdWVzICh3aWR0aCBvciBoZWlnaHQpIGlzIG5vdCBzZXQsIGl0IHdpbGwgYmVcbiAgIyAgIGNhbGN1bGF0ZWQgdXNpbmcgdGhlIG90aGVyIHZhbHVlLCBnZW5lcmF0aW5nIGEgcmVndWxhciBoZXhhZ29uXG4gICMgQHBhcmFtIGF0dHJpYnV0ZXMgW0hhc2hdIE9wdGlvbnMgdG8gcHJvdmlkZTpcbiAgIyAgIGZsYXRUb3BwZWQ6IHdoZXRoZXIgdG8gY3JlYXRlIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlTaXplOiAoc2l6ZSwgYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIHVubGVzcyBzaXplPy53aWR0aD8gb3Igc2l6ZT8uaGVpZ2h0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiU2l6ZSBtdXN0IGJlIHByb3ZpZGVkIHdpdGggd2lkdGggb3IgaGVpZ2h0IG9yIGJvdGhcIlxuICAgIHNpemUgPSBAX2RldGVjdGVkU2l6ZSBzaXplLCBhdHRyaWJ1dGVzLmZsYXRUb3BwZWRcbiAgICBtdWx0aXBsaWVycyA9IEBzaXplTXVsdGlwbGllcnNbaWYgYXR0cmlidXRlcy5mbGF0VG9wcGVkIHRoZW4gJ2ZsYXQnIGVsc2UgJ3BvaW50bHknXVxuICAgIHZlcnRpY2VzID0gW11cbiAgICBmb3IgbXVsdGlwbGllciBpbiBtdWx0aXBsaWVyc1xuICAgICAgdmVydGljZXMucHVzaCBuZXcgVmVydGV4XG4gICAgICAgIHg6IHJvdW5kKHNpemUud2lkdGggICogbXVsdGlwbGllci54KVxuICAgICAgICB5OiByb3VuZChzaXplLmhlaWdodCAqIG11bHRpcGxpZXIueSlcbiAgICBAYnlWZXJ0aWNlcyB2ZXJ0aWNlcywgYXR0cmlidXRlc1xuXG4gICMgQ3JlYXRlcyBhbiBIZXhhZ29uIGdpdmVuIGl0cyB2ZXJ0aWNlc1xuICAjIEBwYXJhbSB2ZXJ0aWNlcyBbQXJyYXk8VmVydGV4Pl0gQ29sbGVjdGlvbiBvZiB2ZXJ0aWNlc1xuICAjICAgVmVydGljZXMgaGF2ZSB0byBiZSBvcmRlcmVkIGNsb2Nrd2lzZSBzdGFydGluZyBmcm9tIHRoZSBvbmUgYXRcbiAgIyAgIDAgZGVncmVlcyAoaW4gYSBmbGF0IHRvcHBlZCBoZXhhZ29uKSwgb3IgMzAgZGVncmVlcyAoaW4gYSBwb2ludGx5IHRvcHBlZCBoZXhhZ29uKVxuICAjIEBwYXJhbSBhdHRyaWJ1dGVzIFtIYXNoXSBPcHRpb25zIHRvIHByb3ZpZGU6XG4gICMgICBmbGF0VG9wcGVkOiB3aGV0aGVyIHRoaXMgaXMgYSBmbGF0IHRvcHBlZCBoZXhhZ29uIG9yIG5vdFxuICAjICAgcG9zaXRpb246IHBvc2l0aW9uIHRvIHNldCB3aGVuIHRoZSBoZXhhZ29uIGhhcyBiZWVuIGJ1aWx0XG4gIEBieVZlcnRpY2VzOiAodmVydGljZXMsIGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgJ1lvdSBoYXZlIHRvIHByb3ZpZGUgNiB2ZXJ0aWNlcycgaWYgdmVydGljZXMubGVuZ3RoIGlzbnQgNlxuICAgIGVkZ2VzID0gKGZvciB2ZXJ0ZXgsIGluZGV4IGluIHZlcnRpY2VzXG4gICAgICBuZXh0VmVydGV4ID0gdmVydGljZXNbaW5kZXggKyAxXSA/IHZlcnRpY2VzWzBdXG4gICAgICBuZXcgRWRnZSBbdmVydGV4LCBuZXh0VmVydGV4XSlcbiAgICBAYnlFZGdlcyBlZGdlcywgYXR0cmlidXRlc1xuXG4gICMgQ3JlYXRlcyBhbiBIZXhhZ29uIGdpdmVuIGl0cyBlZGdlc1xuICAjIEBwYXJhbSBlZGdlcyBbQXJyYXk8RWRnZT5dIENvbGxlY3Rpb24gb2YgZWRnZXNcbiAgIyAgIEVkZ2VzIGhhdmUgdG8gYmUgb3JkZXJlZCBjb3VudGVyY2xvY2t3aXNlIHN0YXJ0aW5nIGZyb20gdGhlIG9uZSB3aXRoXG4gICMgICB0aGUgZmlyc3QgdmVydGV4IGF0IDAgZGVncmVlcyAoaW4gYSBmbGF0IHRvcHBlZCBoZXhhZ29uKSxcbiAgIyAgIG9yIDMwIGRlZ3JlZXMgKGluIGEgcG9pbnRseSB0b3BwZWQgaGV4YWdvbilcbiAgIyBAcGFyYW0gYXR0cmlidXRlcyBbSGFzaF0gT3B0aW9ucyB0byBwcm92aWRlOlxuICAjICAgZmxhdFRvcHBlZDogd2hldGhlciB0aGlzIGlzIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlFZGdlczogKGVkZ2VzLCBhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yICdZb3UgaGF2ZSB0byBwcm92aWRlIDYgZWRnZXMnIGlmIGVkZ2VzLmxlbmd0aCBpc250IDZcbiAgICBoYWxmRWRnZXMgPSAobmV3IEhhbGZFZGdlKGVkZ2UpIGZvciBlZGdlIGluIGVkZ2VzKVxuICAgIG5ldyBIZXhhZ29uIGhhbGZFZGdlcywgYXR0cmlidXRlc1xuXG4gIGNvbnN0cnVjdG9yOiAoQGhhbGZFZGdlcywgYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIHRocm93IG5ldyBFcnJvciAnWW91IGhhdmUgdG8gcHJvdmlkZSA2IGhhbGZlZGdlcycgaWYgQGhhbGZFZGdlcy5sZW5ndGggaXNudCA2XG4gICAgQHRvcE1vZGUgICA9IGlmIGF0dHJpYnV0ZXMuZmxhdFRvcHBlZCB0aGVuICdmbGF0JyBlbHNlICdwb2ludGx5J1xuICAgIEBfc2V0UG9zaXRpb24gYXR0cmlidXRlcy5wb3NpdGlvbiBpZiBhdHRyaWJ1dGVzLnBvc2l0aW9uP1xuICAgIGhhbGZFZGdlLmhleGFnb24gPSBAIGZvciBoYWxmRWRnZSBpbiBAaGFsZkVkZ2VzXG5cbiAgaXNGbGF0VG9wcGVkOiAtPiBAdG9wTW9kZSBpcyAnZmxhdCdcblxuICBpc1BvaW50bHlUb3BwZWQ6IC0+IEB0b3BNb2RlIGlzICdwb2ludGx5J1xuXG4gIHZlcnRpY2VzOiAtPiAoaGFsZkVkZ2UudmEoKSBmb3IgaGFsZkVkZ2UgaW4gQGhhbGZFZGdlcylcblxuICBlZGdlczogLT4gKGhhbGZFZGdlLmVkZ2UgZm9yIGhhbGZFZGdlIGluIEBoYWxmRWRnZXMpXG5cbiAgY2VudGVyOiA9PiBAcG9zaXRpb24oKS5zdW0gQHNpemUoKS53aWR0aCAvIDIsIEBzaXplKCkuaGVpZ2h0IC8gMlxuXG4gIHBvc2l0aW9uOiAodmFsdWUpID0+IGlmIHZhbHVlPyB0aGVuIEBfc2V0UG9zaXRpb24odmFsdWUpIGVsc2UgQF9nZXRQb3NpdGlvbigpXG5cbiAgc2l6ZTogKHZhbHVlKSA9PiBpZiB2YWx1ZT8gdGhlbiBAX3NldFNpemUodmFsdWUpIGVsc2UgQF9nZXRTaXplKClcblxuICBuZWlnaGJvcnM6IC0+XG4gICAgbmVpZ2hib3JzID0gW11cbiAgICBmb3IgaGFsZkVkZ2UgaW4gQGhhbGZFZGdlc1xuICAgICAgb3RoZXJIYWxmRWRnZSA9IGhhbGZFZGdlLm90aGVySGFsZkVkZ2UoKVxuICAgICAgaWYgb3RoZXJIYWxmRWRnZT8gYW5kIG5laWdoYm9ycy5pbmRleE9mKG90aGVySGFsZkVkZ2UuaGV4YWdvbikgPCAwXG4gICAgICAgIG5laWdoYm9ycy5wdXNoIG90aGVySGFsZkVkZ2UuaGV4YWdvblxuICAgIG5laWdoYm9yc1xuXG4gIHRvU3RyaW5nOiA9PiBcIiN7QGNvbnN0cnVjdG9yLm5hbWV9KCN7QHBvc2l0aW9uKCkudG9TdHJpbmcoKX07ICN7QHNpemUoKS50b1N0cmluZygpfSlcIlxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHZlcnRpY2VzLmxlbmd0aCBpc250IChvdGhlci52ZXJ0aWNlcz8ubGVuZ3RoID8gMClcbiAgICBmb3IgdiwgaW5kZXggaW4gQHZlcnRpY2VzXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHYuaXNFcXVhbChvdGhlci52ZXJ0aWNlc1tpbmRleF0pXG4gICAgdHJ1ZVxuXG4gIHRvUHJpbWl0aXZlOiA9PiAodi50b1ByaW1pdGl2ZSgpIGZvciB2IGluIEB2ZXJ0aWNlcylcblxuICBfY29weVN0YXJ0aW5nVmVydGljZXNGcm9tRWRnZXM6IChhdHRyaWJ1dGVzKSAtPlxuICAgIGF0dHJpYnV0ZXMudmVydGljZXMgPz0gW11cbiAgICBmb3IgZWRnZSwgaW5kZXggaW4gYXR0cmlidXRlcy5lZGdlcyB3aGVuIGVkZ2U/XG4gICAgICBhdHRyaWJ1dGVzLnZlcnRpY2VzW2luZGV4XSAgICAgPz0gZWRnZS52YVxuICAgICAgYXR0cmlidXRlcy52ZXJ0aWNlc1tpbmRleCArIDFdID89IGVkZ2UudmJcblxuICBfcm91bmQ6ICh2YWx1ZSkgLT4gcm91bmQodmFsdWUpXG5cbiAgX2dldFBvc2l0aW9uOiAtPlxuICAgIHZlcnRpY2VzID0gQHZlcnRpY2VzKClcbiAgICB4VmVydGV4SWR4ID0gaWYgQGlzRmxhdFRvcHBlZCgpIHRoZW4gMyBlbHNlIDJcbiAgICBuZXcgUG9pbnQgdmVydGljZXNbeFZlcnRleElkeF0ueCwgdmVydGljZXNbNF0ueVxuXG4gIF9zZXRQb3NpdGlvbjogKHZhbHVlKSAtPlxuICAgIGFjdHVhbCA9IEBfZ2V0UG9zaXRpb24oKVxuICAgIGZvciB2ZXJ0ZXggaW4gQHZlcnRpY2VzKClcbiAgICAgIHZlcnRleC54ID0gcm91bmQodmVydGV4LnggLSBhY3R1YWwueCArIHZhbHVlLngpXG4gICAgICB2ZXJ0ZXgueSA9IHJvdW5kKHZlcnRleC55IC0gYWN0dWFsLnkgKyB2YWx1ZS55KVxuXG4gIF9nZXRTaXplOiAtPlxuICAgIHZlcnRpY2VzID0gQHZlcnRpY2VzKClcbiAgICBuZXcgU2l6ZVxuICAgICAgd2lkdGggOiByb3VuZCBNYXRoLmFicyh2ZXJ0aWNlc1swXS54IC0gQHBvc2l0aW9uKCkueClcbiAgICAgIGhlaWdodDogcm91bmQgTWF0aC5hYnModmVydGljZXNbMV0ueSAtIEBwb3NpdGlvbigpLnkpXG5cbiAgX3NldFNpemU6ICh2YWx1ZSkgLT5cbiAgICBwb3NpdGlvbiA9IEBfZ2V0UG9zaXRpb24oKVxuICAgIHZlcnRpY2VzID0gQHZlcnRpY2VzKClcbiAgICBmb3IgbXVsdGlwbGllciwgaW5kZXggaW4gQGNvbnN0cnVjdG9yLnNpemVNdWx0aXBsaWVyc1tAdG9wTW9kZV1cbiAgICAgIHZlcnRpY2VzW2luZGV4XS54ID0gcm91bmQocG9zaXRpb24ueCArIHZhbHVlLndpZHRoICogbXVsdGlwbGllci54KVxuICAgICAgdmVydGljZXNbaW5kZXhdLnkgPSByb3VuZChwb3NpdGlvbi55ICsgdmFsdWUuaGVpZ2h0ICogbXVsdGlwbGllci55KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhleGFnb25cbiIsIkhleGFnb24gID0gcmVxdWlyZSAnLi9oZXhhZ29uLmNvZmZlZSdcblBvaW50ICAgID0gcmVxdWlyZSAnLi9jb3JlL3BvaW50LmNvZmZlZSdcbkVkZ2UgICAgID0gcmVxdWlyZSAnLi9jb3JlL2VkZ2UuY29mZmVlJ1xuSGFsZkVkZ2UgPSByZXF1aXJlICcuL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSdcblZlcnRleCAgID0gcmVxdWlyZSAnLi9jb3JlL3ZlcnRleC5jb2ZmZWUnXG5TaXplICAgICA9IHJlcXVpcmUgJy4vY29yZS9zaXplLmNvZmZlZSdcblxucm91bmQgICAgPSByZXF1aXJlKCcuL2NvcmUvdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG5jbGFzcyBIZXhhZ29uTWF0cml4RmFjdG9yeVxuICBzaGFyZWRIZXhhZ29uRWRnZXM6XG4gICAgZmxhdDpcbiAgICAgIGV2ZW46IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMSwgZGVzdDogNCB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoLTEsICAwKSwgc3JjOiAwLCBkZXN0OiAzIH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDUsIGRlc3Q6IDIgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAyLCBkZXN0OiA1IH1cbiAgICAgIF1cbiAgICAgIG9kZDogW1xuICAgICAgICB7IHR5cGU6IG51bGwsICAgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDUsIGRlc3Q6IDIgfSxcbiAgICAgICAgeyB0eXBlOiAnZXZlbicsIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAyLCBkZXN0OiA1IH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDAsIGRlc3Q6IDMgfVxuICAgICAgXVxuICAgIHBvaW50bHk6XG4gICAgICBvZGQ6IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KC0xLCAgMCksIHNyYzogNSwgZGVzdDogMiB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoLTEsIC0xKSwgc3JjOiAwLCBkZXN0OiAzIH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCggMCwgLTEpLCBzcmM6IDEsIGRlc3Q6IDQgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH1cbiAgICAgIF1cbiAgICAgIGV2ZW46IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KC0xLCAgMCksIHNyYzogNSwgZGVzdDogMiB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAwLCBkZXN0OiAzIH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCggMSwgLTEpLCBzcmM6IDEsIGRlc3Q6IDQgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH1cbiAgICAgIF1cblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBAdG9wTW9kZSA9IGlmIG9wdGlvbnMuZmxhdFRvcHBlZCB0aGVuICdmbGF0JyBlbHNlICdwb2ludGx5J1xuICAgIEBvZmZzZXRMYXlvdXQgPSBvcHRpb25zLm9mZnNldExheW91dCA/ICdvZGQnXG4gICAgdW5sZXNzIFsnb2RkJywgJ2V2ZW4nXS5pbmRleE9mKEBvZmZzZXRMYXlvdXQpID49IDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gb2Zmc2V0TGF5b3V0LiBBbGxvd2VkIHZhbHVlczogb2RkLCBldmVuXCJcblxuICBpc0ZsYXRUb3BwZWQgICAgICA6ID0+IEB0b3BNb2RlIGlzICdmbGF0J1xuICBpc1BvaW50bHlUb3BwZWQgICA6ID0+IEB0b3BNb2RlIGlzICdwb2ludGx5J1xuICBpc0V2ZW5PZmZzZXRMYXlvdXQ6ID0+IEBvZmZzZXRMYXlvdXQgaXMgJ2V2ZW4nXG4gIGlzT2RkT2Zmc2V0TGF5b3V0IDogPT4gQG9mZnNldExheW91dCBpcyAnb2RkJ1xuXG4gIGJ1aWxkTWF0cml4OiAoYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIFtyb3dzLCBjb2xzXSA9IFthdHRyaWJ1dGVzLnJvd3MsIGF0dHJpYnV0ZXMuY29sc11cbiAgICBAX3NhbXBsZSA9IEBfY3JlYXRlU2FtcGxlSGV4YWdvbiBhdHRyaWJ1dGVzLmhleGFnb25cbiAgICBAbWF0cml4ID0gbmV3IEFycmF5KHJvd3MpXG4gICAgZm9yIGogaW4gWzAuLi5yb3dzXVxuICAgICAgQG1hdHJpeFtqXSA9IG5ldyBBcnJheShjb2xzKVxuICAgICAgQG1hdHJpeFtqXVtpXSA9IEBfY3JlYXRlSGV4YWdvbkluT2Zmc2V0KGksIGopIGZvciBpIGluIFswLi4uY29sc11cbiAgICBAbWF0cml4XG5cbiAgX2NyZWF0ZVNhbXBsZUhleGFnb246IChoZXhBdHRyaWJ1dGVzKSA9PlxuICAgIG9wdGlvbnMgPSB7IHBvc2l0aW9uOiB7eDogMCwgeTogMH0sIGZsYXRUb3BwZWQ6IEBpc0ZsYXRUb3BwZWQoKSB9XG4gICAgaWYgaGV4QXR0cmlidXRlcy53aWR0aD8gb3IgaGV4QXR0cmlidXRlcy5oZWlnaHQ/XG4gICAgICBIZXhhZ29uLmJ5U2l6ZSBoZXhBdHRyaWJ1dGVzLCBvcHRpb25zXG4gICAgZWxzZSBpZiBoZXhBdHRyaWJ1dGVzLnJhZGl1cz9cbiAgICAgIEhleGFnb24uYnlSYWRpdXMgaGV4QXR0cmlidXRlcy5yYWRpdXMsIG9wdGlvbnNcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIGhleGFnb24gZGlyZWN0aXZlLiBZb3UgaGF2ZSB0byBwYXNzIHRoZSByYWRpdXMgb3IgYXQgbGVhc3Qgb25lIGRpbWVuc2lvblwiXG5cbiAgX2NyZWF0ZUhleGFnb25Jbk9mZnNldDogKGksIGopIC0+XG4gICAgcG9zaXRpb24gPSBAX2V4cGVjdGVkUG9zaXRpb25Jbk9mZnNldCBpLCBqXG4gICAgaGFsZkVkZ2VzID0gQGhhbGZFZGdlc0Zyb21OZWlnaGJvcmhvb2QgaSwgalxuICAgIG5ldyBIZXhhZ29uIGhhbGZFZGdlcywgZmxhdFRvcHBlZDogQGlzRmxhdFRvcHBlZCgpXG5cbiAgX2V4cGVjdGVkUG9zaXRpb25Jbk9mZnNldDogKGksIGopIC0+XG4gICAgaWYgQGlzRmxhdFRvcHBlZCgpXG4gICAgICB5ID0gaWYgQF9pc1NoaWZ0aW5nUmVxdWlyZWQoaSkgdGhlbiBAX3NhbXBsZS52ZXJ0aWNlcygpWzBdLnkgZWxzZSAwXG4gICAgICBuZXcgUG9pbnQoMCwgeSkuc3VtXG4gICAgICAgIHg6IHJvdW5kKHJvdW5kKEBfc2FtcGxlLnNpemUoKS53aWR0aCAqIDAuNzUpICogaSlcbiAgICAgICAgeTogcm91bmQoQF9zYW1wbGUuc2l6ZSgpLmhlaWdodCAqIGopXG4gICAgZWxzZVxuICAgICAgeCA9IGlmIEBfaXNTaGlmdGluZ1JlcXVpcmVkKGopIHRoZW4gQF9zYW1wbGUudmVydGljZXMoKVsxXS54IGVsc2UgMFxuICAgICAgbmV3IFBvaW50KHgsIDApLnN1bVxuICAgICAgICB4OiByb3VuZChAX3NhbXBsZS5zaXplKCkud2lkdGggKiBpKVxuICAgICAgICB5OiByb3VuZChyb3VuZChAX3NhbXBsZS5zaXplKCkuaGVpZ2h0ICogMC43NSkgKiBqKVxuXG4gIF9pc1NoaWZ0aW5nUmVxdWlyZWQ6IChyZWwpIC0+XG4gICAgKEBpc0V2ZW5PZmZzZXRMYXlvdXQoKSBhbmQgcmVsICUgMiBpcyAwKSBvciAoQGlzT2RkT2Zmc2V0TGF5b3V0KCkgYW5kIHJlbCAlIDIgaXNudCAwKVxuXG4gIF9lYWNoSGFsZkVkZ2VGcm9tU2hhcmVkTWFwcGluZ3M6IChpLCBqLCBjYWxsYmFjaykgLT5cbiAgICBmb3IgbWFwcGluZyBpbiBAc2hhcmVkSGV4YWdvbkVkZ2VzW0B0b3BNb2RlXVtAb2Zmc2V0TGF5b3V0XVxuICAgICAgbmVpZ2hib3IgPSBAbWF0cml4W2ogKyBtYXBwaW5nLnBvcy55XT9baSArIG1hcHBpbmcucG9zLnhdXG4gICAgICByZWwgPSBpZiBAaXNGbGF0VG9wcGVkKCkgdGhlbiBpIGVsc2UgalxuICAgICAgY29udGludWUgaWYgKG1hcHBpbmcudHlwZSBpcyAnb2RkJyBhbmQgcmVsICUgMiBpcyAwKSBvciAobWFwcGluZy50eXBlIGlzICdldmVuJyBhbmQgcmVsICUgMiBpc250IDApXG4gICAgICBjb250aW51ZSB1bmxlc3MgbmVpZ2hib3I/XG4gICAgICBjYWxsYmFjayhtYXBwaW5nLmRlc3QsIG5laWdoYm9yLmhhbGZFZGdlc1ttYXBwaW5nLnNyY10pXG5cbiAgaGFsZkVkZ2VzRnJvbU5laWdoYm9yaG9vZDogKGksIGopIC0+XG4gICAgaGFsZkVkZ2VzID0gbmV3IEFycmF5KDYpXG4gICAgQF9lYWNoSGFsZkVkZ2VGcm9tU2hhcmVkTWFwcGluZ3MgaSwgaiwgKGhhbGZFZGdlSWR4LCBzcmNIYWxmRWRnZSkgLT5cbiAgICAgIGhhbGZFZGdlc1toYWxmRWRnZUlkeF0gPz0gc3JjSGFsZkVkZ2Uub3Bwb3NpdGUoKVxuICAgIHZlcnRpY2VzID0gbnVsbCAjIGRvIG5vdCBmZXRjaCBzaGFyZWQgdmVydGljZXMgdW50aWwgd2UgcmVhbGx5IG5lZWQgdGhlbVxuICAgIGZvciBoYWxmRWRnZSxpbmRleCBpbiBoYWxmRWRnZXMgd2hlbiBub3QgaGFsZkVkZ2U/XG4gICAgICB2ZXJ0aWNlcyA/PSBAdmVydGljZXNGcm9tTmVpZ2hib3Job29kKGksIGopXG4gICAgICBoYWxmRWRnZXNbaW5kZXhdID0gbmV3IEhhbGZFZGdlIG5ldyBFZGdlIHZlcnRpY2VzW2luZGV4XSwgdmVydGljZXNbaW5kZXggKyAxXSA/IHZlcnRpY2VzWzBdXG4gICAgaGFsZkVkZ2VzXG5cbiAgdmVydGljZXNGcm9tTmVpZ2hib3Job29kOiAoaSwgaikgLT5cbiAgICB2ZXJ0aWNlcyA9IG5ldyBBcnJheSg2KVxuICAgIEBfZWFjaEhhbGZFZGdlRnJvbVNoYXJlZE1hcHBpbmdzIGksIGosIChoYWxmRWRnZUlkeCwgc3JjSGFsZkVkZ2UpIC0+XG4gICAgICB2ZXJ0aWNlc1toYWxmRWRnZUlkeF0gPz0gc3JjSGFsZkVkZ2UudmIoKVxuICAgICAgdmVydGljZXNbKGhhbGZFZGdlSWR4ICsgMSkgJSB2ZXJ0aWNlcy5sZW5ndGhdID89IHNyY0hhbGZFZGdlLnZhKClcbiAgICBmb3IgdiwgaW5kZXggaW4gQF9zYW1wbGUudmVydGljZXMoKSB3aGVuIG5vdCB2ZXJ0aWNlc1tpbmRleF0/XG4gICAgICB2ZXJ0aWNlc1tpbmRleF0gPSBuZXcgVmVydGV4IHYuc3VtIEBfZXhwZWN0ZWRQb3NpdGlvbkluT2Zmc2V0KGksIGopXG4gICAgdmVydGljZXNcblxuIyBNYXBcbiNcbiMgQGV4YW1wbGVcbiMgICBuZXcgTWFwIGNvbHM6IDEwLCByb3dzOiAxMCwgaGV4YWdvbjogeyB3aWR0aDogMTAgfVxuIyBAZXhhbXBsZVxuIyAgIG5ldyBNYXAgY29sczogMTAsIHJvd3M6IDEwLCBoZXhhZ29uOiB7IHJhZGl1czogMTAgfVxuIyBAZXhhbXBsZVxuIyAgIG5ldyBNYXAgY29sczogMTAsIHJvd3M6IDEwLCB3aWR0aDogNTAwLCBoZWlnaHQ6IDUwMFxuY2xhc3MgTWFwXG4gIGNvbnN0cnVjdG9yOiAoYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIEBmID0gZmFjdG9yeSAgICAgID0gbmV3IEhleGFnb25NYXRyaXhGYWN0b3J5IGF0dHJpYnV0ZXNcbiAgICBmb3IgbWV0aCBpbiBbJ2lzRmxhdFRvcHBlZCcsICdpc1BvaW50bHlUb3BwZWQnLCAnaXNFdmVuT2Zmc2V0TGF5b3V0JywgJ2lzT2RkT2Zmc2V0TGF5b3V0J11cbiAgICAgIEBbbWV0aF0gPSBmYWN0b3J5W21ldGhdXG4gICAgQG1hdHJpeCA9IGZhY3RvcnkuYnVpbGRNYXRyaXhcbiAgICAgIHJvd3M6IGF0dHJpYnV0ZXMucm93c1xuICAgICAgY29sczogYXR0cmlidXRlcy5jb2xzXG4gICAgICBoZXhhZ29uOiBhdHRyaWJ1dGVzLmhleGFnb24gPyBAX2RldGVjdGVkSGV4YWdvblNpemUoYXR0cmlidXRlcylcblxuICBoZXhhZ29uczogLT5cbiAgICByZXR1cm4gQF9oZXhhZ29ucyBpZiBAX2hleGFnb25zP1xuICAgIFtyb3dzLCBjb2xzXSA9IFtAbWF0cml4Lmxlbmd0aCwgQG1hdHJpeFswXS5sZW5ndGhdXG4gICAgQF9oZXhhZ29ucyA9IG5ldyBBcnJheShyb3dzICogY29scylcbiAgICBmb3Igcm93LGogaW4gQG1hdHJpeFxuICAgICAgQF9oZXhhZ29uc1tqICogY29scyArIGldID0gY2VsbCBmb3IgY2VsbCxpIGluIHJvd1xuICAgIEBfaGV4YWdvbnNcbiAgZmlyc3RIZXhhZ29uOiAtPiBAaGV4YWdvbnMoKVswXVxuICBsYXN0SGV4YWdvbjogLT4gQGhleGFnb25zKClbQGhleGFnb25zKCkubGVuZ3RoIC0gMV1cblxuICBzaXplOiAtPlxuICAgIGxhc3RIZXhQb3MgPSBAbGFzdEhleGFnb24oKS5wb3NpdGlvbigpXG4gICAgQGxhc3RIZXhhZ29uKCkuc2l6ZSgpLnN1bSB3aWR0aDogbGFzdEhleFBvcy54LCBoZWlnaHQ6IGxhc3RIZXhQb3MueVxuXG4gIGF0OiAoaSwgaikgLT4gQG1hdHJpeFtqXT9baV1cblxuICBfZGV0ZWN0ZWRIZXhhZ29uU2l6ZTogKGF0dHJpYnV0ZXMpID0+XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiQ2Fubm90IGRldGVjdCBjb3JyZWN0IGhleGFnb24gc2l6ZVwiIHVubGVzcyBhdHRyaWJ1dGVzLndpZHRoPyBvciBhdHRyaWJ1dGVzLmhlaWdodD9cbiAgICBbcm93cywgY29scywgd2lkdGgsIGhlaWdodF0gPSBbYXR0cmlidXRlcy5yb3dzLCBhdHRyaWJ1dGVzLmNvbHMsIG51bGwsIG51bGxdXG4gICAgaWYgYXR0cmlidXRlcy53aWR0aD9cbiAgICAgIGRpdmlkZXIgPSBpZiBAaXNGbGF0VG9wcGVkKCkgdGhlbiAxIC8gKChjb2xzIC0gMSkgKiAwLjc1ICsgMSkgZWxzZSAyIC8gKDIgKiBjb2xzICsgMSlcbiAgICAgIHdpZHRoID0gcm91bmQgYXR0cmlidXRlcy53aWR0aCAqIGRpdmlkZXJcbiAgICBpZiBhdHRyaWJ1dGVzLmhlaWdodD9cbiAgICAgIGRpdmlkZXIgPSBpZiBAaXNGbGF0VG9wcGVkKCkgdGhlbiAyIC8gKDIgKiByb3dzICsgMSkgZWxzZSAxIC8gKChyb3dzIC0gMSkgKiAwLjc1ICsgMSlcbiAgICAgIGhlaWdodCA9IHJvdW5kIGF0dHJpYnV0ZXMuaGVpZ2h0ICogZGl2aWRlclxuICAgIHsgd2lkdGgsIGhlaWdodCB9XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwXG4iLCJQb2ludCAgICA9IHJlcXVpcmUgJy4vcG9pbnQuY29mZmVlJ1xuU2l6ZSAgICAgPSByZXF1aXJlICcuL3NpemUuY29mZmVlJ1xuVmVydGV4ICAgPSByZXF1aXJlICcuL3ZlcnRleC5jb2ZmZWUnXG5FZGdlICAgICA9IHJlcXVpcmUgJy4vZWRnZS5jb2ZmZWUnXG5IYWxmRWRnZSA9IHJlcXVpcmUgJy4vaGFsZl9lZGdlLmNvZmZlZSdcblV0aWwgICAgID0gcmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcblBvaW50M0QgID0gcmVxdWlyZSAnLi9wb2ludF8zZC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0geyBQb2ludCwgU2l6ZSwgRWRnZSwgVmVydGV4LCBIYWxmRWRnZSwgVXRpbCwgUG9pbnQzRCB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIE9mZnNldEN1cnNvcjogcmVxdWlyZSgnLi9vZmZzZXRfY3Vyc29yLmNvZmZlZScpXG4gIEF4aWFsQ3Vyc29yIDogcmVxdWlyZSgnLi9heGlhbF9jdXJzb3IuY29mZmVlJylcbiAgQ3ViZUN1cnNvciAgOiByZXF1aXJlKCcuL2N1YmVfY3Vyc29yLmNvZmZlZScpXG4iLCJjbGFzcyBFZGdlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEB2ZXJ0aWNlcyA9IGlmIGFyZ3VtZW50cy5sZW5ndGggPiAxIHRoZW4gKGEgZm9yIGEgaW4gYXJndW1lbnRzKSBlbHNlIGFyZ3VtZW50c1swXVxuICAgIHVubGVzcyBAdmVydGljZXM/Lmxlbmd0aCBpcyAyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgJ1lvdSBoYXZlIHRvIHByb3ZpZGUgMiB2ZXJ0aWNlcydcbiAgICB2ZXJ0ZXgucHVzaEVkZ2UgQCBmb3IgdmVydGV4IGluIEB2ZXJ0aWNlc1xuICAgIEBoYWxmRWRnZXMgPSBbXVxuXG4gIGhleGFnb25zOiAtPiAoaGFsZkVkZ2UuaGV4YWdvbiBmb3IgaGFsZkVkZ2UgaW4gQGhhbGZFZGdlcylcblxuICBpc0NvbnRhaW5lZEluOiAoaGV4YWdvbikgLT5cbiAgICByZXR1cm4gdHJ1ZSBmb3IgaGV4IGluIEBoZXhhZ29ucygpIHdoZW4gaGV4LmlzRXF1YWwgaGV4YWdvblxuICAgIGZhbHNlXG5cbiAgaXNFcXVhbDogKG90aGVyKSA9PlxuICAgIGZvciB2ZXJ0ZXgsIGluZGV4IGluIEB2ZXJ0aWNlc1xuICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyB2ZXJ0ZXguaXNFcXVhbChvdGhlci52ZXJ0aWNlc1tpbmRleF0pXG4gICAgdHJ1ZVxuXG4gIHRvUHJpbWl0aXZlOiA9PiB7IHZlcnRpY2VzOiAodi50b1ByaW1pdGl2ZSgpIGZvciB2IGluIEB2ZXJ0aWNlcykgfVxuXG4gIHRvU3RyaW5nOiA9PiBcIiN7QGNvbnN0cnVjdG9yLm5hbWV9eyN7QHZlcnRpY2VzWzBdLnRvU3RyaW5nKCl9LCAje0B2ZXJ0aWNlc1sxXS50b1N0cmluZygpfX1cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkZ2VcbiIsImNsYXNzIEhhbGZFZGdlXG4gIGNvbnN0cnVjdG9yOiAoQGVkZ2UsIEBkaXJlY3Rpb24gPSAxKSAtPlxuICAgIHRocm93IG5ldyBFcnJvciAnWW91IGhhdmUgdG8gcHJvdmlkZSBhbiBlZGdlJyB1bmxlc3MgQGVkZ2U/XG4gICAgaWYgQGRpcmVjdGlvbiBpc250IDEgYW5kIEBkaXJlY3Rpb24gaXNudCAtMVxuICAgICAgdGhyb3cgbmV3IEVycm9yICdEaXJlY3Rpb24gbXVzdCBiZSAxIG9yIC0xJ1xuICAgIEBoZXhhZ29uID0gbnVsbFxuICAgIEBlZGdlLmhhbGZFZGdlcy5wdXNoIEBcblxuICB2ZXJ0aWNlczogLT5cbiAgICBpZiBAZGlyZWN0aW9uIGlzIDFcbiAgICAgIEBlZGdlLnZlcnRpY2VzXG4gICAgZWxzZVxuICAgICAgQGVkZ2UudmVydGljZXMuc2xpY2UoMCkucmV2ZXJzZSgpXG5cbiAgdmE6IC0+IEB2ZXJ0aWNlcygpWzBdXG4gIHZiOiAtPiBAdmVydGljZXMoKVsxXVxuXG4gIG90aGVySGFsZkVkZ2U6IC0+XG4gICAgcmV0dXJuIGhhbGZFZGdlIGZvciBoYWxmRWRnZSBpbiBAZWRnZS5oYWxmRWRnZXMgd2hlbiBoYWxmRWRnZSBpc250IEBcblxuICBpc0VxdWFsOiAob3RoZXIpID0+IEB2YSgpLmlzRXF1YWwob3RoZXIudmEoKSkgYW5kIEB2YigpLmlzRXF1YWwob3RoZXIudmIoKSlcblxuICB0b1ByaW1pdGl2ZTogPT4geyB2YTogQHZhKCkudG9QcmltaXRpdmUoKSwgdmI6IEB2YigpLnRvUHJpbWl0aXZlKCkgfVxuXG4gIHRvU3RyaW5nOiA9PiBcIiN7QGNvbnN0cnVjdG9yLm5hbWV9eyN7QHZhKCkudG9TdHJpbmcoKX0sICN7QHZiKCkudG9TdHJpbmcoKX19XCJcblxuICBvcHBvc2l0ZTogPT4gbmV3IEhhbGZFZGdlKEBlZGdlLCBpZiBAZGlyZWN0aW9uIGlzIDEgdGhlbiAtMSBlbHNlIDEpXG5cbm1vZHVsZS5leHBvcnRzID0gSGFsZkVkZ2VcbiIsInByZWNpc2lvbiA9IDFcblxubW9kdWxlLmV4cG9ydHMgPVxuICBwcmVjaXNpb246ICh2YWx1ZSkgLT5cbiAgICBpZiB2YWx1ZT9cbiAgICAgIHByZWNpc2lvbiA9IHZhbHVlXG4gICAgZWxzZVxuICAgICAgcHJlY2lzaW9uXG5cbiAgcm91bmQ6ICh2YWx1ZSkgLT5cbiAgICBpZiBwcmVjaXNpb24/XG4gICAgICBkaXZpZGVyID0gTWF0aC5wb3cgMTAsIHByZWNpc2lvblxuICAgICAgTWF0aC5yb3VuZCh2YWx1ZSAqIGRpdmlkZXIpIC8gZGl2aWRlclxuICAgIGVsc2VcbiAgICAgIHZhbHVlXG4iLCJyb3VuZCA9IHJlcXVpcmUoJy4vdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG5jbGFzcyBQb2ludFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBhdHRyaWJ1dGVzID0gQF9leHRyYWN0QXR0cmlidXRlcyhhcmd1bWVudHMpXG4gICAgQHggPSBhdHRyaWJ1dGVzLnggPyAwXG4gICAgQHkgPSBhdHRyaWJ1dGVzLnkgPyAwXG5cbiAgaXNFcXVhbDogKG90aGVyKSAtPiBAeCBpcyBvdGhlci54IGFuZCBAeSBpcyBvdGhlci55XG5cbiAgdG9QcmltaXRpdmU6ID0+IHsgeDogQHgsIHk6IEB5IH1cblxuICB0b1N0cmluZzogPT4gXCIje0Bjb25zdHJ1Y3Rvci5uYW1lfSgje0B4fSwgI3tAeX0pXCJcblxuICBzdW06IC0+XG4gICAgYXR0cmlidXRlcyA9IEBfZXh0cmFjdEF0dHJpYnV0ZXMoYXJndW1lbnRzKVxuICAgIG5ldyBAY29uc3RydWN0b3Igcm91bmQoQHggKyBhdHRyaWJ1dGVzLngpLCByb3VuZChAeSArIGF0dHJpYnV0ZXMueSlcblxuICBzdWI6IC0+XG4gICAgYXR0cmlidXRlcyA9IEBfZXh0cmFjdEF0dHJpYnV0ZXMoYXJndW1lbnRzKVxuICAgIG5ldyBAY29uc3RydWN0b3Igcm91bmQoQHggLSBhdHRyaWJ1dGVzLngpLCByb3VuZChAeSAtIGF0dHJpYnV0ZXMueSlcblxuICBfZXh0cmFjdEF0dHJpYnV0ZXM6IChhcmdzKSAtPlxuICAgIGF0dHJpYnV0ZXMgPSBhcmdzWzBdID8ge31cbiAgICBpZiB0eXBlb2YoYXR0cmlidXRlcykgaXMgJ251bWJlcicgfHwgYXJncy5sZW5ndGggPiAxXG4gICAgICBhdHRyaWJ1dGVzID0geyB4OiBhcmdzWzBdID8gMCwgeTogYXJnc1sxXSA/IDAgfVxuICAgIGF0dHJpYnV0ZXNcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludFxuIiwicm91bmQgPSByZXF1aXJlKCcuL3V0aWwuY29mZmVlJykucm91bmRcblxuY2xhc3MgU2l6ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWzBdID8ge31cbiAgICBpZiB0eXBlb2YoYXR0cmlidXRlcykgaXMgJ251bWJlcicgfHwgYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgIGF0dHJpYnV0ZXMgPSB7IHdpZHRoOiBhcmd1bWVudHNbMF0sIGhlaWdodDogYXJndW1lbnRzWzFdIH1cbiAgICBAd2lkdGggID0gYXR0cmlidXRlcy53aWR0aCA/IDBcbiAgICBAaGVpZ2h0ID0gYXR0cmlidXRlcy5oZWlnaHQgPyAwXG5cbiAgc3VtOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBAX2V4dHJhY3RBdHRyaWJ1dGVzKGFyZ3VtZW50cylcbiAgICBuZXcgQGNvbnN0cnVjdG9yIHJvdW5kKEB3aWR0aCArIGF0dHJpYnV0ZXMud2lkdGgpLCByb3VuZChAaGVpZ2h0ICsgYXR0cmlidXRlcy5oZWlnaHQpXG5cbiAgaXNFcXVhbDogKG90aGVyKSAtPiBAd2lkdGggaXMgb3RoZXIud2lkdGggJiYgQGhlaWdodCBpcyBvdGhlci5oZWlnaHRcblxuICB0b1ByaW1pdGl2ZTogPT4geyB3aWR0aDogQHdpZHRoLCBoZWlnaHQ6IEBoZWlnaHQgfVxuXG4gIHRvU3RyaW5nOiA9PiBcIiN7QGNvbnN0cnVjdG9yLm5hbWV9ICgje0B3aWR0aH0sICN7QGhlaWdodH0pXCJcblxuICBfZXh0cmFjdEF0dHJpYnV0ZXM6IChhcmdzKSAtPlxuICAgIGF0dHJpYnV0ZXMgPSBhcmdzWzBdID8ge31cbiAgICBpZiB0eXBlb2YoYXR0cmlidXRlcykgaXMgJ251bWJlcicgfHwgYXJncy5sZW5ndGggPiAxXG4gICAgICBhdHRyaWJ1dGVzID0geyB3aWR0aDogYXJnc1swXSA/IDAsIGhlaWdodDogYXJnc1sxXSA/IDAgfVxuICAgIGF0dHJpYnV0ZXNcblxubW9kdWxlLmV4cG9ydHMgPSBTaXplXG4iLCJQb2ludCA9IHJlcXVpcmUgJy4vcG9pbnQuY29mZmVlJ1xuXG5jbGFzcyBWZXJ0ZXggZXh0ZW5kcyBQb2ludFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBlZGdlcyA9IFtdXG5cbiAgcHVzaEVkZ2U6IChlZGdlKSAtPlxuICAgIEBlZGdlcy5wdXNoIGVkZ2VcblxubW9kdWxlLmV4cG9ydHMgPSBWZXJ0ZXhcbiIsIlBvaW50ID0gcmVxdWlyZSAnLi9wb2ludC5jb2ZmZWUnXG5yb3VuZCA9IHJlcXVpcmUoJy4vdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG5jbGFzcyBQb2ludDNEIGV4dGVuZHMgUG9pbnRcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAeiA9IEBfZXh0cmFjdEF0dHJpYnV0ZXMoYXJndW1lbnRzKS56XG5cbiAgaXNFcXVhbDogKG90aGVyKSAtPiBAeCBpcyBvdGhlci54IGFuZCBAeSBpcyBvdGhlci55IGFuZCBAeiBpcyBvdGhlci56XG5cbiAgdG9QcmltaXRpdmU6ID0+IHsgeDogQHgsIHk6IEB5LCB6OiBAeiB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX0oI3tAeH0sICN7QHl9LCAje0B6fSlcIlxuXG4gIHN1bTogLT5cbiAgICBhdHRyaWJ1dGVzID0gQF9leHRyYWN0QXR0cmlidXRlcyhhcmd1bWVudHMpXG4gICAgbmV3IEBjb25zdHJ1Y3RvciByb3VuZChAeCArIGF0dHJpYnV0ZXMueCksIHJvdW5kKEB5ICsgYXR0cmlidXRlcy55KSwgcm91bmQoQHogKyBhdHRyaWJ1dGVzLnopXG5cbiAgc3ViOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBAX2V4dHJhY3RBdHRyaWJ1dGVzKGFyZ3VtZW50cylcbiAgICBuZXcgQGNvbnN0cnVjdG9yIHJvdW5kKEB4IC0gYXR0cmlidXRlcy54KSwgcm91bmQoQHkgLSBhdHRyaWJ1dGVzLnkpLCByb3VuZChAeiAtIGF0dHJpYnV0ZXMueilcblxuICBfZXh0cmFjdEF0dHJpYnV0ZXM6IChhcmdzKSAtPlxuICAgIGF0dHJpYnV0ZXMgPSBhcmdzWzBdID8ge31cbiAgICBpZiB0eXBlb2YoYXR0cmlidXRlcykgaXMgJ251bWJlcicgfHwgYXJncy5sZW5ndGggPiAxXG4gICAgICBhdHRyaWJ1dGVzID0geyB4OiBhcmdzWzBdID8gMCwgeTogYXJnc1sxXSA/IDAsIHo6IGFyZ3NbMl0gPyAwIH1cbiAgICBhdHRyaWJ1dGVzXG5cbm1vZHVsZS5leHBvcnRzID0gUG9pbnQzRFxuIiwiUG9pbnQgPSByZXF1aXJlICcuLi9jb3JlL3BvaW50LmNvZmZlZSdcblxuY2xhc3MgT2Zmc2V0Q3Vyc29yXG4gIGNvbnN0cnVjdG9yOiAobWFwT3JDdXJzb3IsIGFyZ3MuLi4pLT5cbiAgICBpZiBtYXBPckN1cnNvci5vZmZzZXRQb3NpdGlvblxuICAgICAgQG1hcCA9IG1hcE9yQ3Vyc29yLm1hcFxuICAgICAgQG1vdmVUbyBtYXBPckN1cnNvci5vZmZzZXRQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQG1hcCA9IG1hcE9yQ3Vyc29yXG4gICAgICBAbW92ZVRvIEBfZXh0cmFjdE9mZnNldChhcmdzKVxuXG4gIG1vdmVUbzogLT5cbiAgICBAcG9zaXRpb24gPSBAX2V4dHJhY3RPZmZzZXQoYXJndW1lbnRzKVxuICAgIEBoZXhhZ29uID0gQG1hcC5tYXRyaXhbQHBvc2l0aW9uLnldP1tAcG9zaXRpb24ueF1cblxuICBheGlhbFBvc2l0aW9uOiAtPlxuICAgIEBwb3NpdGlvbi5zdWIgQF9jZW50ZXJQb2ludCgpXG5cbiAgY3ViZVBvc2l0aW9uOiAtPlxuICAgIGF4aWFsID0gQGF4aWFsUG9zaXRpb24oKVxuICAgIHsgeDogYXhpYWwueCwgeTogLShheGlhbC54ICsgYXhpYWwueSksIHo6IGF4aWFsLnl9XG5cbiAgX2NlbnRlclBvaW50OiAtPlxuICAgIHJldHVybiBAX2NlbnRlciBpZiBAX2NlbnRlcj9cbiAgICBjZW50ZXJZID0gTWF0aC5yb3VuZCAoQG1hcC5tYXRyaXgubGVuZ3RoIC0gMSkgLyAyXG4gICAgQF9jZW50ZXIgPSBuZXcgUG9pbnRcbiAgICAgIHg6IE1hdGgucm91bmQgKEBtYXAubWF0cml4W2NlbnRlclldLmxlbmd0aCAtIDEpIC8gMlxuICAgICAgeTogY2VudGVyWVxuXG4gIF9leHRyYWN0T2Zmc2V0OiAoYXJncykgLT5cbiAgICBpZiBhcmdzLmxlbmd0aCBpcyAyXG4gICAgICBuZXcgUG9pbnQgYXJnc1swXSwgYXJnc1sxXVxuICAgIGVsc2VcbiAgICAgIG9iaiA9IGFyZ3NbMF1cbiAgICAgIGlmIG9iai54PyBvciBvYmoueT9cbiAgICAgICAgb2JqXG4gICAgICBlbHNlIGlmIG9iai5pPyBvciBvYmouaj9cbiAgICAgICAgbmV3IFBvaW50IG9iai5pLCBvYmoualxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJCYWQgYXJnIGZvciBAYXQuIFlvdSBjYW4gY2FsbCAuYXQoeCwgeSksIC5hdCh4OiB4LCB5OiB5KSBvciAuYXQoaTogeCwgajogeSlcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IE9mZnNldEN1cnNvclxuIiwiUG9pbnQgPSByZXF1aXJlICcuLi9jb3JlL3BvaW50LmNvZmZlZSdcblxuY2xhc3MgQXhpYWxDdXJzb3JcbiAgY29uc3RydWN0b3I6IChtYXBPckN1cnNvciwgYXJncy4uLiktPlxuICAgIGlmIG1hcE9yQ3Vyc29yLmF4aWFsUG9zaXRpb25cbiAgICAgIEBtYXAgPSBtYXBPckN1cnNvci5tYXBcbiAgICAgIEBtb3ZlVG8gbWFwT3JDdXJzb3IuYXhpYWxQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQG1hcCA9IG1hcE9yQ3Vyc29yXG4gICAgICBAbW92ZVRvIEBfZXh0cmFjdFBvaW50KGFyZ3MpXG5cbiAgbW92ZVRvOiAtPlxuICAgIEBwb3NpdGlvbiA9IEBfZXh0cmFjdFBvaW50KGFyZ3VtZW50cylcbiAgICBwb2ludCA9IEBfY2VudGVyUG9pbnQoKS5zdW0gQHBvc2l0aW9uXG4gICAgQGhleGFnb24gPSBAbWFwLm1hdHJpeFtwb2ludC55XT9bcG9pbnQueF1cblxuICBheGlhbFBvc2l0aW9uOiAtPiBAcG9zaXRpb25cblxuICBjdWJlUG9zaXRpb246IC0+XG4gICAgeyB4OiBAcG9zaXRpb24ueCwgeTogLShAcG9zaXRpb24ueCArIEBwb3NpdGlvbi55KSwgejogQHBvc2l0aW9uLnl9XG5cbiAgb2Zmc2V0UG9zaXRpb246IC0+XG4gICAgQF9jZW50ZXJQb2ludCgpLnN1bSBAcG9zaXRpb25cblxuICBfY2VudGVyUG9pbnQ6IC0+XG4gICAgcmV0dXJuIEBfY2VudGVyIGlmIEBfY2VudGVyP1xuICAgIGNlbnRlclkgPSBNYXRoLnJvdW5kIChAbWFwLm1hdHJpeC5sZW5ndGggLSAxKSAvIDJcbiAgICBAX2NlbnRlciA9IG5ldyBQb2ludFxuICAgICAgeDogTWF0aC5yb3VuZCAoQG1hcC5tYXRyaXhbY2VudGVyWV0ubGVuZ3RoIC0gMSkgLyAyXG4gICAgICB5OiBjZW50ZXJZXG5cbiAgX2V4dHJhY3RQb2ludDogKGFyZ3MpIC0+XG4gICAgaWYgYXJncy5sZW5ndGggaXMgMlxuICAgICAgbmV3IFBvaW50IGFyZ3NbMF0sIGFyZ3NbMV1cbiAgICBlbHNlXG4gICAgICBvYmogPSBhcmdzWzBdXG4gICAgICBpZiBvYmoueD8gb3Igb2JqLnk/XG4gICAgICAgIG9ialxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJCYWQgYXJnIGZvciBAYXQuIFlvdSBjYW4gY2FsbCAuYXQoeCwgeSksIC5hdCh4OiB4LCB5OiB5KVwiXG5cbm1vZHVsZS5leHBvcnRzID0gQXhpYWxDdXJzb3JcbiIsIlBvaW50ICAgPSByZXF1aXJlICcuLi9jb3JlL3BvaW50LmNvZmZlZSdcblBvaW50M0QgPSByZXF1aXJlICcuLi9jb3JlL3BvaW50XzNkLmNvZmZlZSdcblxuY2xhc3MgQ3ViZUN1cnNvclxuICBjb25zdHJ1Y3RvcjogKG1hcE9yQ3Vyc29yLCBhcmdzLi4uKS0+XG4gICAgaWYgbWFwT3JDdXJzb3IuY3ViZVBvc2l0aW9uXG4gICAgICBAbWFwID0gbWFwT3JDdXJzb3IubWFwXG4gICAgICBAbW92ZVRvIG1hcE9yQ3Vyc29yLmN1YmVQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQG1hcCA9IG1hcE9yQ3Vyc29yXG4gICAgICBAbW92ZVRvIEBfZXh0cmFjdFBvaW50KGFyZ3MpXG5cbiAgbW92ZVRvOiAtPlxuICAgIEBwb3NpdGlvbiA9IEBfZXh0cmFjdFBvaW50KGFyZ3VtZW50cylcbiAgICBwb2ludCA9IEBfY2VudGVyUG9pbnQoKS5zdW0gQHBvc2l0aW9uXG4gICAgQGhleGFnb24gPSBAbWFwLm1hdHJpeFtwb2ludC56XT9bcG9pbnQueF1cblxuICBheGlhbFBvc2l0aW9uOiAtPlxuICAgIG5ldyBQb2ludCB4OiBAcG9zaXRpb24ueCwgeTogQHBvc2l0aW9uLnpcblxuICBvZmZzZXRQb3NpdGlvbjogLT5cbiAgICBbY2VudGVyLCBheGlhbF0gPSBbQF9jZW50ZXJQb2ludCgpLCBAYXhpYWxQb3NpdGlvbigpXVxuICAgIG5ldyBQb2ludCB4OiBjZW50ZXIueCArIGF4aWFsLngsIHk6IGNlbnRlci56ICsgYXhpYWwueVxuXG4gIF9jZW50ZXJQb2ludDogLT5cbiAgICByZXR1cm4gQF9jZW50ZXIgaWYgQF9jZW50ZXI/XG4gICAgY2VudGVyWSA9IE1hdGgucm91bmQgKEBtYXAubWF0cml4Lmxlbmd0aCAtIDEpIC8gMlxuICAgIGNlbnRlclggPSBNYXRoLnJvdW5kIChAbWFwLm1hdHJpeFtjZW50ZXJZXS5sZW5ndGggLSAxKSAvIDJcbiAgICBAX2NlbnRlciA9IG5ldyBQb2ludDNEXG4gICAgICB4OiBjZW50ZXJYXG4gICAgICB5OiAtY2VudGVyWS1jZW50ZXJYXG4gICAgICB6OiBjZW50ZXJZXG5cbiAgX2V4dHJhY3RQb2ludDogKGFyZ3MpIC0+XG4gICAgaWYgYXJncy5sZW5ndGggaXMgM1xuICAgICAgbmV3IFBvaW50M0QgeDogYXJnc1swXSwgeTogYXJnc1sxXSwgejogYXJnc1syXVxuICAgIGVsc2VcbiAgICAgIG9iaiA9IGFyZ3NbMF1cbiAgICAgIGlmIG9iai54PyBvciBvYmoueT8gb3Igb2JqLno/XG4gICAgICAgIG9ialxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJCYWQgYXJnIGZvciBAYXQuIFlvdSBjYW4gY2FsbCAuYXQoeCwgeSwgeiksIC5hdCh4OiB4LCB5OiB5LCB6OiB6KVwiXG5cbm1vZHVsZS5leHBvcnRzID0gQ3ViZUN1cnNvclxuIl19
;