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
      var halfEdges, hexagon, position;
      position = this._expectedPositionInOffset(i, j);
      halfEdges = this.halfEdgesFromNeighborhood(i, j);
      hexagon = new Hexagon(halfEdges, {
        flatTopped: this.isFlatTopped()
      });
      hexagon.__map = this;
      hexagon.__position = {
        x: i,
        y: j
      };
      return hexagon;
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
    AxialCursor: require('./axial_cursor.coffee')
  };

}).call(this);


},{"./offset_cursor.coffee":13,"./axial_cursor.coffee":14}],9:[function(require,module,exports){
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
        } else if (obj.__position != null) {
          return obj.__position;
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
        } else if (obj.__position != null) {
          return new Point(obj.__position).sub(this._centerPoint());
        }
      }
    };

    return AxialCursor;

  })();

  module.exports = AxialCursor;

}).call(this);


},{"../core/point.coffee":6}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvaGV4YWdvbi5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvbWFwLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jdXJzb3JzL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL2VkZ2UuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL3V0aWwuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvcG9pbnQuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvc2l6ZS5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvY29yZS92ZXJ0ZXguY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvcG9pbnRfM2QuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2N1cnNvcnMvb2Zmc2V0X2N1cnNvci5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvY3Vyc29ycy9heGlhbF9jdXJzb3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtDQUFBLEtBQUEsMkJBQUE7O0NBQUEsQ0FBQSxDQUFZLE1BQVo7O0NBRUE7Q0FBQSxNQUFBLFVBQUE7NkJBQUE7Q0FDRSxFQUF1QixDQUF2QixDQUFBLElBQVU7Q0FEWixFQUZBOztDQUFBLENBS0EsQ0FBb0IsSUFBcEIsRUFBUyxTQUFXOztDQUxwQixDQU1BLENBQUEsSUFBb0IsRUFBWCxLQUFXOztDQU5wQixDQU9BLENBQW9CLElBQXBCLEVBQVMsZUFBVzs7Q0FQcEIsQ0FTQSxDQUFzQixDQUFjLEtBQTNCOztDQVRULENBVUEsQ0FBMkIsS0FBQSxDQUFsQixLQUFUO0NBQ0UsT0FBQSxJQUFBO0NBQUEsRUFBZSxDQUFmLEtBQXdCLEdBQXhCO0NBQUEsR0FDQSxLQUFTO0NBQ1Q7Q0FDRSxPQUFBLEtBQUE7TUFERjtDQUdFLEdBQWMsRUFBZCxHQUFTLEdBQVQ7TUFOdUI7Q0FWM0IsRUFVMkI7O0NBVjNCLENBa0JBLENBQW1CLEdBQWIsQ0FBYSxFQUFuQjtDQWxCQTs7Ozs7O0FDQUE7Q0FBQSxLQUFBLDZDQUFBO0tBQUEsNkVBQUE7O0NBQUEsQ0FBQSxDQUFXLEVBQVgsRUFBVyxjQUFBOztDQUFYLENBQ0EsQ0FBVyxDQUFYLEdBQVcsYUFBQTs7Q0FEWCxDQUVBLENBQVcsR0FBWCxDQUFXLGVBQUE7O0NBRlgsQ0FHQSxDQUFXLENBQVgsR0FBVyxhQUFBOztDQUhYLENBSUEsQ0FBVyxJQUFBLENBQVgsaUJBQVc7O0NBSlgsQ0FNQSxDQUFXLEVBQVgsRUFBVyxhQUFBOztDQU5YLENBK0JNO0NBQ0osRUFDRSxDQURGLEdBQUMsUUFBRDtDQUNFLENBQVMsSUFBVCxDQUFBO1NBQ0U7Q0FBQSxDQUFLLFFBQUg7Q0FBRixDQUFhLEVBQWIsTUFBVTtFQUNWLFFBRk87Q0FFUCxD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QUFBO0NBQUEsR0FBbUIsRUFBbkIsY0FBQTtDQUFBLEdBQVEsR0FBUixRQUFPO1FBQVA7Q0FBQSxFQUNVLENBQUksQ0FBSixDQUFWLENBQUE7Q0FDQyxFQUFjLENBQWQsQ0FBYyxFQUFmLE1BQUE7Q0FDRSxDQUFHLENBQWdCLENBQVosQ0FBSixDQUF3QixDQUFBLENBQTNCO0NBQUEsQ0FDRyxLQURILENBQ0E7Q0FMVSxPQUdHO0NBeEJqQixJQXFCYzs7Q0FyQmQsRUE0QmUsQ0FBQSxLQUFDLElBQWhCO0NBQ0UsRUFBQSxPQUFBO0NBQUEsR0FBRyxDQUFlLENBQWxCO0NBQ1ksQ0FBUyxFQUFmLENBQUEsVUFBQTtNQUROLEVBQUE7Q0FHRSxFQUFBLENBQVcsSUFBWDtDQUNBLEdBQUcsSUFBSCxPQUFHO0NBQUgsZ0JBQ0U7SUFDTSxFQUZSLElBQUEsWUFBQTtDQUdZLEVBQUcsQ0FBVCxDQUFBLEtBQUEsRUFBMEIsS0FBMUI7VUFQUjtRQURhO0NBNUJmLElBNEJlOztDQTVCZjs7Q0FIRjs7Q0FBQSxDQXlDQSxDQUFpQixHQUFYLENBQU4sSUF6Q0E7Q0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiSGV4YWdvbmFsID0ge31cblxuZm9yIENsYXNzTmFtZSwgQ2xhc3Mgb2YgcmVxdWlyZSAnLi9jb3JlL2luZGV4LmNvZmZlZSdcbiAgSGV4YWdvbmFsW0NsYXNzTmFtZV0gPSBDbGFzc1xuXG5IZXhhZ29uYWwuSGV4YWdvbiA9IHJlcXVpcmUgJy4vaGV4YWdvbi5jb2ZmZWUnXG5IZXhhZ29uYWwuTWFwICAgICA9IHJlcXVpcmUgJy4vbWFwLmNvZmZlZSdcbkhleGFnb25hbC5DdXJzb3JzID0gcmVxdWlyZSAnLi9jdXJzb3JzL2luZGV4LmNvZmZlZSdcblxuSGV4YWdvbmFsLnByZWNpc2lvbiA9IEhleGFnb25hbC5VdGlsLnByZWNpc2lvblxuSGV4YWdvbmFsLnVzaW5nUHJlY2lzaW9uID0gKHByZWNpc2lvbiwgY2FsbGJhY2spIC0+XG4gIG9sZFByZWNpc2lvbiA9IEhleGFnb25hbC5VdGlsLnByZWNpc2lvbigpXG4gIEhleGFnb25hbC5VdGlsLnByZWNpc2lvbiBwcmVjaXNpb25cbiAgdHJ5XG4gICAgY2FsbGJhY2soKVxuICBmaW5hbGx5XG4gICAgSGV4YWdvbmFsLlV0aWwucHJlY2lzaW9uIG9sZFByZWNpc2lvblxuXG5nbG9iYWwuSGV4YWdvbmFsID0gbW9kdWxlLmV4cG9ydHMgPSBIZXhhZ29uYWxcbiIsIlBvaW50ICAgID0gcmVxdWlyZSAnLi9jb3JlL3BvaW50LmNvZmZlZSdcblNpemUgICAgID0gcmVxdWlyZSAnLi9jb3JlL3NpemUuY29mZmVlJ1xuVmVydGV4ICAgPSByZXF1aXJlICcuL2NvcmUvdmVydGV4LmNvZmZlZSdcbkVkZ2UgICAgID0gcmVxdWlyZSAnLi9jb3JlL2VkZ2UuY29mZmVlJ1xuSGFsZkVkZ2UgPSByZXF1aXJlICcuL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSdcblxucm91bmQgICAgPSByZXF1aXJlKCcuL2NvcmUvdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG4jIEhleGFnb25cbiNcbiMgQGV4YW1wbGUgQnVpbHQgdXNpbmcgUmFkaXVzXG4jICAgSGV4YWdvbi5ieVJhZGl1cyAyICMgYnVpbHQgd2l0aCByYWRpdXMgMiBhbmQgY2VudGVyIHBsYWNlZCBpbiB0aGUgb3JpZ2luXG4jICAgSGV4YWdvbi5ieVJhZGl1cyBjZW50ZXI6IHsgeDogMSwgeTogMiB9LCByYWRpdXM6IDJcbiNcbiMgQGV4YW1wbGUgQnVpbHQgdXNpbmcgVmVydGljZXNcbiMgICBIZXhhZ29uLmJ5VmVydGljZXMgW3YxLCB2MiwgdjMsIHY0LCB2NSwgdjZdXG4jXG4jIEBleGFtcGxlIEJ1aWx0IHVzaW5nIEVkZ2VzXG4jICAgSGV4YWdvbi5ieUVkZ2VzIFtlMSwgZTIsIGUzLCBlNCwgZTUsIGU2XVxuI1xuIyBAZXhhbXBsZSBCdWlsdCB1c2luZyBTaXplXG4jICAgSGV4YWdvbi5ieVNpemUgeyB3aWR0aDogMTAsIGhlaWdodDogMTAgfSAjIHdpdGggcG9zaXRpb24gcGxhY2VkIGluIHRoZSBvcmlnaW5cbiMgICBIZXhhZ29uLmJ5U2l6ZSB7IHdpZHRoOiAxMCB9LCAgcG9zaXRpb246IHsgeDogMSwgeTogMn0gIyBoZWlnaHQgd2lsbCBiZSBkZXRlY3RlZFxuIyAgIEhleGFnb24uYnlTaXplIHsgaGVpZ2h0OiAxMCB9LCBwb3NpdGlvbjogeyB4OiAxLCB5OiAyfSAjIHdpZHRoIHdpbGwgYmUgZGV0ZWN0ZWRcbiNcbiMgV2hlbiB5b3UgY3JlYXRlIGFuIGhleGFnb24geW91IHNob3VsZCBhbHdheXMgcGFzcyB0aGUgZmxhdFRvcHBlZCBvcHRpb24gc2V0IHRvIHRydWUgaWYgeW91IHdhbnRcbiMgdGhlIGhleGFnb24gdG8gYmUgaGFuZGxlZCBhcyBmbGF0IHRvcHBlZC5cbiNcbiMgQGV4YW1wbGVcbiMgICBIZXhhZ29uLmJ5U2l6ZSB7IHdpZHRoOiAxMCwgaGVpZ2h0OiAxMCB9ICMgY3JlYXRlcyBhIHBvaW50eSB0b3BwZWQgaGV4YWdvblxuIyAgIEhleGFnb24uYnlTaXplIHsgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwIH0sIGZsYXRUb3BwZWQ6IHRydWUgIyBjcmVhdGVzIGEgZmxhdCB0b3BwZWQgaGV4YWdvblxuY2xhc3MgSGV4YWdvblxuICBAc2l6ZU11bHRpcGxpZXJzOlxuICAgIHBvaW50bHk6IFtcbiAgICAgIHsgeDogMSwgICB5OiAwLjc1IH0sXG4gICAgICB7IHg6IDAuNSwgeTogMSB9LFxuICAgICAgeyB4OiAwLCAgIHk6IDAuNzUgfSxcbiAgICAgIHsgeDogMCwgICB5OiAwLjI1IH0sXG4gICAgICB7IHg6IDAuNSwgeTogMCB9LFxuICAgICAgeyB4OiAxLCAgIHk6IDAuMjUgfVxuICAgIF0sXG4gICAgZmxhdDogW1xuICAgICAgeyB4OiAxLCAgICB5OiAwLjUgfSxcbiAgICAgIHsgeDogMC43NSwgeTogMSB9LFxuICAgICAgeyB4OiAwLjI1LCB5OiAxIH0sXG4gICAgICB7IHg6IDAsICAgIHk6IDAuNSB9LFxuICAgICAgeyB4OiAwLjI1LCB5OiAwIH0sXG4gICAgICB7IHg6IDAuNzUsIHk6IDAgfVxuICAgIF1cbiAgQGRpbWVuc2lvbkNvZWZmOiBNYXRoLnNxcnQoMykgLyAyXG5cbiAgIyBDcmVhdGVzIGEgcmVndWxhciBIZXhhZ29uIGdpdmVuIGl0cyByYWRpdXNcbiAgIyBAcGFyYW0gcmFkaXVzIFtOdW1iZXJdIHJhZGl1cyBvZiB0aGUgY2lyY2xlIGluc2NyaWJpbmcgdGhlIGhleGFnb25cbiAgIyBAcGFyYW0gYXR0cmlidXRlcyBbSGFzaF0gT3B0aW9ucyB0byBwcm92aWRlOlxuICAjICAgY2VudGVyOiBjZW50ZXIgb2YgdGhlIGhleGFnb25cbiAgIyAgIGZsYXRUb3BwZWQ6IHdoZXRoZXIgdG8gY3JlYXRlIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlSYWRpdXM6IChyYWRpdXMsIGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQgYXR0cmlidXRlcy5jZW50ZXJcbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgZm9yIGluZGV4IGluIFswLi4uNl1cbiAgICAgIGFuZ2xlTW9kID0gaWYgYXR0cmlidXRlcy5mbGF0VG9wcGVkIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgYW5nbGUgICAgPSAyICogTWF0aC5QSSAvIDYgKiAoaW5kZXggKyBhbmdsZU1vZClcbiAgICAgIHZlcnRpY2VzLnB1c2ggbmV3IFZlcnRleFxuICAgICAgICB4OiByb3VuZChjZW50ZXIueCArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSlcbiAgICAgICAgeTogcm91bmQoY2VudGVyLnkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkpXG4gICAgQGJ5VmVydGljZXMgdmVydGljZXMsIGF0dHJpYnV0ZXNcblxuICBAX2RldGVjdGVkU2l6ZTogKHNpemUsIGZsYXRUb3BwZWQpIC0+XG4gICAgW3dpZHRoLCBoZWlnaHRdID0gW3NpemUud2lkdGgsIHNpemUuaGVpZ2h0XVxuICAgIGNvZWZmID0gaWYgZmxhdFRvcHBlZCB0aGVuIDEgLyBAZGltZW5zaW9uQ29lZmYgZWxzZSBAZGltZW5zaW9uQ29lZmZcbiAgICBpZiB3aWR0aFxuICAgICAgbmV3IFNpemUgd2lkdGgsIGhlaWdodCA/IHJvdW5kKHdpZHRoIC8gY29lZmYpXG4gICAgZWxzZSBpZiBoZWlnaHRcbiAgICAgIG5ldyBTaXplIHJvdW5kKGhlaWdodCAqIGNvZWZmKSwgaGVpZ2h0XG5cbiAgIyBDcmVhdGVzIGFuIEhleGFnb24gZ2l2ZW4gaXRzIHNpemVcbiAgIyBAcGFyYW0gc2l6ZSBbU2l6ZV0gU2l6ZSB0byB1c2UgdG8gY3JlYXRlIHRoZSBoZXhhZ29uXG4gICMgICBJZiBvbmUgb2YgdGhlIHNpemUgdmFsdWVzICh3aWR0aCBvciBoZWlnaHQpIGlzIG5vdCBzZXQsIGl0IHdpbGwgYmVcbiAgIyAgIGNhbGN1bGF0ZWQgdXNpbmcgdGhlIG90aGVyIHZhbHVlLCBnZW5lcmF0aW5nIGEgcmVndWxhciBoZXhhZ29uXG4gICMgQHBhcmFtIGF0dHJpYnV0ZXMgW0hhc2hdIE9wdGlvbnMgdG8gcHJvdmlkZTpcbiAgIyAgIGZsYXRUb3BwZWQ6IHdoZXRoZXIgdG8gY3JlYXRlIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlTaXplOiAoc2l6ZSwgYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIHVubGVzcyBzaXplPy53aWR0aD8gb3Igc2l6ZT8uaGVpZ2h0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiU2l6ZSBtdXN0IGJlIHByb3ZpZGVkIHdpdGggd2lkdGggb3IgaGVpZ2h0IG9yIGJvdGhcIlxuICAgIHNpemUgPSBAX2RldGVjdGVkU2l6ZSBzaXplLCBhdHRyaWJ1dGVzLmZsYXRUb3BwZWRcbiAgICBtdWx0aXBsaWVycyA9IEBzaXplTXVsdGlwbGllcnNbaWYgYXR0cmlidXRlcy5mbGF0VG9wcGVkIHRoZW4gJ2ZsYXQnIGVsc2UgJ3BvaW50bHknXVxuICAgIHZlcnRpY2VzID0gW11cbiAgICBmb3IgbXVsdGlwbGllciBpbiBtdWx0aXBsaWVyc1xuICAgICAgdmVydGljZXMucHVzaCBuZXcgVmVydGV4XG4gICAgICAgIHg6IHJvdW5kKHNpemUud2lkdGggICogbXVsdGlwbGllci54KVxuICAgICAgICB5OiByb3VuZChzaXplLmhlaWdodCAqIG11bHRpcGxpZXIueSlcbiAgICBAYnlWZXJ0aWNlcyB2ZXJ0aWNlcywgYXR0cmlidXRlc1xuXG4gICMgQ3JlYXRlcyBhbiBIZXhhZ29uIGdpdmVuIGl0cyB2ZXJ0aWNlc1xuICAjIEBwYXJhbSB2ZXJ0aWNlcyBbQXJyYXk8VmVydGV4Pl0gQ29sbGVjdGlvbiBvZiB2ZXJ0aWNlc1xuICAjICAgVmVydGljZXMgaGF2ZSB0byBiZSBvcmRlcmVkIGNsb2Nrd2lzZSBzdGFydGluZyBmcm9tIHRoZSBvbmUgYXRcbiAgIyAgIDAgZGVncmVlcyAoaW4gYSBmbGF0IHRvcHBlZCBoZXhhZ29uKSwgb3IgMzAgZGVncmVlcyAoaW4gYSBwb2ludGx5IHRvcHBlZCBoZXhhZ29uKVxuICAjIEBwYXJhbSBhdHRyaWJ1dGVzIFtIYXNoXSBPcHRpb25zIHRvIHByb3ZpZGU6XG4gICMgICBmbGF0VG9wcGVkOiB3aGV0aGVyIHRoaXMgaXMgYSBmbGF0IHRvcHBlZCBoZXhhZ29uIG9yIG5vdFxuICAjICAgcG9zaXRpb246IHBvc2l0aW9uIHRvIHNldCB3aGVuIHRoZSBoZXhhZ29uIGhhcyBiZWVuIGJ1aWx0XG4gIEBieVZlcnRpY2VzOiAodmVydGljZXMsIGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgJ1lvdSBoYXZlIHRvIHByb3ZpZGUgNiB2ZXJ0aWNlcycgaWYgdmVydGljZXMubGVuZ3RoIGlzbnQgNlxuICAgIGVkZ2VzID0gKGZvciB2ZXJ0ZXgsIGluZGV4IGluIHZlcnRpY2VzXG4gICAgICBuZXh0VmVydGV4ID0gdmVydGljZXNbaW5kZXggKyAxXSA/IHZlcnRpY2VzWzBdXG4gICAgICBuZXcgRWRnZSBbdmVydGV4LCBuZXh0VmVydGV4XSlcbiAgICBAYnlFZGdlcyBlZGdlcywgYXR0cmlidXRlc1xuXG4gICMgQ3JlYXRlcyBhbiBIZXhhZ29uIGdpdmVuIGl0cyBlZGdlc1xuICAjIEBwYXJhbSBlZGdlcyBbQXJyYXk8RWRnZT5dIENvbGxlY3Rpb24gb2YgZWRnZXNcbiAgIyAgIEVkZ2VzIGhhdmUgdG8gYmUgb3JkZXJlZCBjb3VudGVyY2xvY2t3aXNlIHN0YXJ0aW5nIGZyb20gdGhlIG9uZSB3aXRoXG4gICMgICB0aGUgZmlyc3QgdmVydGV4IGF0IDAgZGVncmVlcyAoaW4gYSBmbGF0IHRvcHBlZCBoZXhhZ29uKSxcbiAgIyAgIG9yIDMwIGRlZ3JlZXMgKGluIGEgcG9pbnRseSB0b3BwZWQgaGV4YWdvbilcbiAgIyBAcGFyYW0gYXR0cmlidXRlcyBbSGFzaF0gT3B0aW9ucyB0byBwcm92aWRlOlxuICAjICAgZmxhdFRvcHBlZDogd2hldGhlciB0aGlzIGlzIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlFZGdlczogKGVkZ2VzLCBhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yICdZb3UgaGF2ZSB0byBwcm92aWRlIDYgZWRnZXMnIGlmIGVkZ2VzLmxlbmd0aCBpc250IDZcbiAgICBoYWxmRWRnZXMgPSAobmV3IEhhbGZFZGdlKGVkZ2UpIGZvciBlZGdlIGluIGVkZ2VzKVxuICAgIG5ldyBIZXhhZ29uIGhhbGZFZGdlcywgYXR0cmlidXRlc1xuXG4gIGNvbnN0cnVjdG9yOiAoQGhhbGZFZGdlcywgYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIHRocm93IG5ldyBFcnJvciAnWW91IGhhdmUgdG8gcHJvdmlkZSA2IGhhbGZlZGdlcycgaWYgQGhhbGZFZGdlcy5sZW5ndGggaXNudCA2XG4gICAgQHRvcE1vZGUgICA9IGlmIGF0dHJpYnV0ZXMuZmxhdFRvcHBlZCB0aGVuICdmbGF0JyBlbHNlICdwb2ludGx5J1xuICAgIEBfc2V0UG9zaXRpb24gYXR0cmlidXRlcy5wb3NpdGlvbiBpZiBhdHRyaWJ1dGVzLnBvc2l0aW9uP1xuICAgIGhhbGZFZGdlLmhleGFnb24gPSBAIGZvciBoYWxmRWRnZSBpbiBAaGFsZkVkZ2VzXG5cbiAgaXNGbGF0VG9wcGVkOiAtPiBAdG9wTW9kZSBpcyAnZmxhdCdcblxuICBpc1BvaW50bHlUb3BwZWQ6IC0+IEB0b3BNb2RlIGlzICdwb2ludGx5J1xuXG4gIHZlcnRpY2VzOiAtPiAoaGFsZkVkZ2UudmEoKSBmb3IgaGFsZkVkZ2UgaW4gQGhhbGZFZGdlcylcblxuICBlZGdlczogLT4gKGhhbGZFZGdlLmVkZ2UgZm9yIGhhbGZFZGdlIGluIEBoYWxmRWRnZXMpXG5cbiAgY2VudGVyOiA9PiBAcG9zaXRpb24oKS5zdW0gQHNpemUoKS53aWR0aCAvIDIsIEBzaXplKCkuaGVpZ2h0IC8gMlxuXG4gIHBvc2l0aW9uOiAodmFsdWUpID0+IGlmIHZhbHVlPyB0aGVuIEBfc2V0UG9zaXRpb24odmFsdWUpIGVsc2UgQF9nZXRQb3NpdGlvbigpXG5cbiAgc2l6ZTogKHZhbHVlKSA9PiBpZiB2YWx1ZT8gdGhlbiBAX3NldFNpemUodmFsdWUpIGVsc2UgQF9nZXRTaXplKClcblxuICBuZWlnaGJvcnM6IC0+XG4gICAgbmVpZ2hib3JzID0gW11cbiAgICBmb3IgaGFsZkVkZ2UgaW4gQGhhbGZFZGdlc1xuICAgICAgb3RoZXJIYWxmRWRnZSA9IGhhbGZFZGdlLm90aGVySGFsZkVkZ2UoKVxuICAgICAgaWYgb3RoZXJIYWxmRWRnZT8gYW5kIG5laWdoYm9ycy5pbmRleE9mKG90aGVySGFsZkVkZ2UuaGV4YWdvbikgPCAwXG4gICAgICAgIG5laWdoYm9ycy5wdXNoIG90aGVySGFsZkVkZ2UuaGV4YWdvblxuICAgIG5laWdoYm9yc1xuXG4gIHRvU3RyaW5nOiA9PiBcIiN7QGNvbnN0cnVjdG9yLm5hbWV9KCN7QHBvc2l0aW9uKCkudG9TdHJpbmcoKX07ICN7QHNpemUoKS50b1N0cmluZygpfSlcIlxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHZlcnRpY2VzLmxlbmd0aCBpc250IChvdGhlci52ZXJ0aWNlcz8ubGVuZ3RoID8gMClcbiAgICBmb3IgdiwgaW5kZXggaW4gQHZlcnRpY2VzXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHYuaXNFcXVhbChvdGhlci52ZXJ0aWNlc1tpbmRleF0pXG4gICAgdHJ1ZVxuXG4gIHRvUHJpbWl0aXZlOiA9PiAodi50b1ByaW1pdGl2ZSgpIGZvciB2IGluIEB2ZXJ0aWNlcylcblxuICBfY29weVN0YXJ0aW5nVmVydGljZXNGcm9tRWRnZXM6IChhdHRyaWJ1dGVzKSAtPlxuICAgIGF0dHJpYnV0ZXMudmVydGljZXMgPz0gW11cbiAgICBmb3IgZWRnZSwgaW5kZXggaW4gYXR0cmlidXRlcy5lZGdlcyB3aGVuIGVkZ2U/XG4gICAgICBhdHRyaWJ1dGVzLnZlcnRpY2VzW2luZGV4XSAgICAgPz0gZWRnZS52YVxuICAgICAgYXR0cmlidXRlcy52ZXJ0aWNlc1tpbmRleCArIDFdID89IGVkZ2UudmJcblxuICBfcm91bmQ6ICh2YWx1ZSkgLT4gcm91bmQodmFsdWUpXG5cbiAgX2dldFBvc2l0aW9uOiAtPlxuICAgIHZlcnRpY2VzID0gQHZlcnRpY2VzKClcbiAgICB4VmVydGV4SWR4ID0gaWYgQGlzRmxhdFRvcHBlZCgpIHRoZW4gMyBlbHNlIDJcbiAgICBuZXcgUG9pbnQgdmVydGljZXNbeFZlcnRleElkeF0ueCwgdmVydGljZXNbNF0ueVxuXG4gIF9zZXRQb3NpdGlvbjogKHZhbHVlKSAtPlxuICAgIGFjdHVhbCA9IEBfZ2V0UG9zaXRpb24oKVxuICAgIGZvciB2ZXJ0ZXggaW4gQHZlcnRpY2VzKClcbiAgICAgIHZlcnRleC54ID0gcm91bmQodmVydGV4LnggLSBhY3R1YWwueCArIHZhbHVlLngpXG4gICAgICB2ZXJ0ZXgueSA9IHJvdW5kKHZlcnRleC55IC0gYWN0dWFsLnkgKyB2YWx1ZS55KVxuXG4gIF9nZXRTaXplOiAtPlxuICAgIHZlcnRpY2VzID0gQHZlcnRpY2VzKClcbiAgICBuZXcgU2l6ZVxuICAgICAgd2lkdGggOiByb3VuZCBNYXRoLmFicyh2ZXJ0aWNlc1swXS54IC0gQHBvc2l0aW9uKCkueClcbiAgICAgIGhlaWdodDogcm91bmQgTWF0aC5hYnModmVydGljZXNbMV0ueSAtIEBwb3NpdGlvbigpLnkpXG5cbiAgX3NldFNpemU6ICh2YWx1ZSkgLT5cbiAgICBwb3NpdGlvbiA9IEBfZ2V0UG9zaXRpb24oKVxuICAgIHZlcnRpY2VzID0gQHZlcnRpY2VzKClcbiAgICBmb3IgbXVsdGlwbGllciwgaW5kZXggaW4gQGNvbnN0cnVjdG9yLnNpemVNdWx0aXBsaWVyc1tAdG9wTW9kZV1cbiAgICAgIHZlcnRpY2VzW2luZGV4XS54ID0gcm91bmQocG9zaXRpb24ueCArIHZhbHVlLndpZHRoICogbXVsdGlwbGllci54KVxuICAgICAgdmVydGljZXNbaW5kZXhdLnkgPSByb3VuZChwb3NpdGlvbi55ICsgdmFsdWUuaGVpZ2h0ICogbXVsdGlwbGllci55KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhleGFnb25cbiIsIkhleGFnb24gID0gcmVxdWlyZSAnLi9oZXhhZ29uLmNvZmZlZSdcblBvaW50ICAgID0gcmVxdWlyZSAnLi9jb3JlL3BvaW50LmNvZmZlZSdcbkVkZ2UgICAgID0gcmVxdWlyZSAnLi9jb3JlL2VkZ2UuY29mZmVlJ1xuSGFsZkVkZ2UgPSByZXF1aXJlICcuL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSdcblZlcnRleCAgID0gcmVxdWlyZSAnLi9jb3JlL3ZlcnRleC5jb2ZmZWUnXG5TaXplICAgICA9IHJlcXVpcmUgJy4vY29yZS9zaXplLmNvZmZlZSdcblxucm91bmQgICAgPSByZXF1aXJlKCcuL2NvcmUvdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG5jbGFzcyBIZXhhZ29uTWF0cml4RmFjdG9yeVxuICBzaGFyZWRIZXhhZ29uRWRnZXM6XG4gICAgZmxhdDpcbiAgICAgIGV2ZW46IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMSwgZGVzdDogNCB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoLTEsICAwKSwgc3JjOiAwLCBkZXN0OiAzIH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDUsIGRlc3Q6IDIgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAyLCBkZXN0OiA1IH1cbiAgICAgIF1cbiAgICAgIG9kZDogW1xuICAgICAgICB7IHR5cGU6IG51bGwsICAgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDUsIGRlc3Q6IDIgfSxcbiAgICAgICAgeyB0eXBlOiAnZXZlbicsIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAyLCBkZXN0OiA1IH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDAsIGRlc3Q6IDMgfVxuICAgICAgXVxuICAgIHBvaW50bHk6XG4gICAgICBvZGQ6IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KC0xLCAgMCksIHNyYzogNSwgZGVzdDogMiB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoLTEsIC0xKSwgc3JjOiAwLCBkZXN0OiAzIH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCggMCwgLTEpLCBzcmM6IDEsIGRlc3Q6IDQgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH1cbiAgICAgIF1cbiAgICAgIGV2ZW46IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KC0xLCAgMCksIHNyYzogNSwgZGVzdDogMiB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAwLCBkZXN0OiAzIH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCggMSwgLTEpLCBzcmM6IDEsIGRlc3Q6IDQgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH1cbiAgICAgIF1cblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBAdG9wTW9kZSA9IGlmIG9wdGlvbnMuZmxhdFRvcHBlZCB0aGVuICdmbGF0JyBlbHNlICdwb2ludGx5J1xuICAgIEBvZmZzZXRMYXlvdXQgPSBvcHRpb25zLm9mZnNldExheW91dCA/ICdvZGQnXG4gICAgdW5sZXNzIFsnb2RkJywgJ2V2ZW4nXS5pbmRleE9mKEBvZmZzZXRMYXlvdXQpID49IDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gb2Zmc2V0TGF5b3V0LiBBbGxvd2VkIHZhbHVlczogb2RkLCBldmVuXCJcblxuICBpc0ZsYXRUb3BwZWQgICAgICA6ID0+IEB0b3BNb2RlIGlzICdmbGF0J1xuICBpc1BvaW50bHlUb3BwZWQgICA6ID0+IEB0b3BNb2RlIGlzICdwb2ludGx5J1xuICBpc0V2ZW5PZmZzZXRMYXlvdXQ6ID0+IEBvZmZzZXRMYXlvdXQgaXMgJ2V2ZW4nXG4gIGlzT2RkT2Zmc2V0TGF5b3V0IDogPT4gQG9mZnNldExheW91dCBpcyAnb2RkJ1xuXG4gIGJ1aWxkTWF0cml4OiAoYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIFtyb3dzLCBjb2xzXSA9IFthdHRyaWJ1dGVzLnJvd3MsIGF0dHJpYnV0ZXMuY29sc11cbiAgICBAX3NhbXBsZSA9IEBfY3JlYXRlU2FtcGxlSGV4YWdvbiBhdHRyaWJ1dGVzLmhleGFnb25cbiAgICBAbWF0cml4ID0gbmV3IEFycmF5KHJvd3MpXG4gICAgZm9yIGogaW4gWzAuLi5yb3dzXVxuICAgICAgQG1hdHJpeFtqXSA9IG5ldyBBcnJheShjb2xzKVxuICAgICAgQG1hdHJpeFtqXVtpXSA9IEBfY3JlYXRlSGV4YWdvbkluT2Zmc2V0KGksIGopIGZvciBpIGluIFswLi4uY29sc11cbiAgICBAbWF0cml4XG5cbiAgX2NyZWF0ZVNhbXBsZUhleGFnb246IChoZXhBdHRyaWJ1dGVzKSA9PlxuICAgIG9wdGlvbnMgPSB7IHBvc2l0aW9uOiB7eDogMCwgeTogMH0sIGZsYXRUb3BwZWQ6IEBpc0ZsYXRUb3BwZWQoKSB9XG4gICAgaWYgaGV4QXR0cmlidXRlcy53aWR0aD8gb3IgaGV4QXR0cmlidXRlcy5oZWlnaHQ/XG4gICAgICBIZXhhZ29uLmJ5U2l6ZSBoZXhBdHRyaWJ1dGVzLCBvcHRpb25zXG4gICAgZWxzZSBpZiBoZXhBdHRyaWJ1dGVzLnJhZGl1cz9cbiAgICAgIEhleGFnb24uYnlSYWRpdXMgaGV4QXR0cmlidXRlcy5yYWRpdXMsIG9wdGlvbnNcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIGhleGFnb24gZGlyZWN0aXZlLiBZb3UgaGF2ZSB0byBwYXNzIHRoZSByYWRpdXMgb3IgYXQgbGVhc3Qgb25lIGRpbWVuc2lvblwiXG5cbiAgX2NyZWF0ZUhleGFnb25Jbk9mZnNldDogKGksIGopIC0+XG4gICAgcG9zaXRpb24gPSBAX2V4cGVjdGVkUG9zaXRpb25Jbk9mZnNldCBpLCBqXG4gICAgaGFsZkVkZ2VzID0gQGhhbGZFZGdlc0Zyb21OZWlnaGJvcmhvb2QgaSwgalxuICAgIGhleGFnb24gPSBuZXcgSGV4YWdvbiBoYWxmRWRnZXMsIGZsYXRUb3BwZWQ6IEBpc0ZsYXRUb3BwZWQoKVxuICAgIGhleGFnb24uX19tYXAgPSBAXG4gICAgaGV4YWdvbi5fX3Bvc2l0aW9uID0ge3g6IGksIHk6IGp9XG4gICAgaGV4YWdvblxuXG4gIF9leHBlY3RlZFBvc2l0aW9uSW5PZmZzZXQ6IChpLCBqKSAtPlxuICAgIGlmIEBpc0ZsYXRUb3BwZWQoKVxuICAgICAgeSA9IGlmIEBfaXNTaGlmdGluZ1JlcXVpcmVkKGkpIHRoZW4gQF9zYW1wbGUudmVydGljZXMoKVswXS55IGVsc2UgMFxuICAgICAgbmV3IFBvaW50KDAsIHkpLnN1bVxuICAgICAgICB4OiByb3VuZChyb3VuZChAX3NhbXBsZS5zaXplKCkud2lkdGggKiAwLjc1KSAqIGkpXG4gICAgICAgIHk6IHJvdW5kKEBfc2FtcGxlLnNpemUoKS5oZWlnaHQgKiBqKVxuICAgIGVsc2VcbiAgICAgIHggPSBpZiBAX2lzU2hpZnRpbmdSZXF1aXJlZChqKSB0aGVuIEBfc2FtcGxlLnZlcnRpY2VzKClbMV0ueCBlbHNlIDBcbiAgICAgIG5ldyBQb2ludCh4LCAwKS5zdW1cbiAgICAgICAgeDogcm91bmQoQF9zYW1wbGUuc2l6ZSgpLndpZHRoICogaSlcbiAgICAgICAgeTogcm91bmQocm91bmQoQF9zYW1wbGUuc2l6ZSgpLmhlaWdodCAqIDAuNzUpICogailcblxuICBfaXNTaGlmdGluZ1JlcXVpcmVkOiAocmVsKSAtPlxuICAgIChAaXNFdmVuT2Zmc2V0TGF5b3V0KCkgYW5kIHJlbCAlIDIgaXMgMCkgb3IgKEBpc09kZE9mZnNldExheW91dCgpIGFuZCByZWwgJSAyIGlzbnQgMClcblxuICBfZWFjaEhhbGZFZGdlRnJvbVNoYXJlZE1hcHBpbmdzOiAoaSwgaiwgY2FsbGJhY2spIC0+XG4gICAgZm9yIG1hcHBpbmcgaW4gQHNoYXJlZEhleGFnb25FZGdlc1tAdG9wTW9kZV1bQG9mZnNldExheW91dF1cbiAgICAgIG5laWdoYm9yID0gQG1hdHJpeFtqICsgbWFwcGluZy5wb3MueV0/W2kgKyBtYXBwaW5nLnBvcy54XVxuICAgICAgcmVsID0gaWYgQGlzRmxhdFRvcHBlZCgpIHRoZW4gaSBlbHNlIGpcbiAgICAgIGNvbnRpbnVlIGlmIChtYXBwaW5nLnR5cGUgaXMgJ29kZCcgYW5kIHJlbCAlIDIgaXMgMCkgb3IgKG1hcHBpbmcudHlwZSBpcyAnZXZlbicgYW5kIHJlbCAlIDIgaXNudCAwKVxuICAgICAgY29udGludWUgdW5sZXNzIG5laWdoYm9yP1xuICAgICAgY2FsbGJhY2sobWFwcGluZy5kZXN0LCBuZWlnaGJvci5oYWxmRWRnZXNbbWFwcGluZy5zcmNdKVxuXG4gIGhhbGZFZGdlc0Zyb21OZWlnaGJvcmhvb2Q6IChpLCBqKSAtPlxuICAgIGhhbGZFZGdlcyA9IG5ldyBBcnJheSg2KVxuICAgIEBfZWFjaEhhbGZFZGdlRnJvbVNoYXJlZE1hcHBpbmdzIGksIGosIChoYWxmRWRnZUlkeCwgc3JjSGFsZkVkZ2UpIC0+XG4gICAgICBoYWxmRWRnZXNbaGFsZkVkZ2VJZHhdID89IHNyY0hhbGZFZGdlLm9wcG9zaXRlKClcbiAgICB2ZXJ0aWNlcyA9IG51bGwgIyBkbyBub3QgZmV0Y2ggc2hhcmVkIHZlcnRpY2VzIHVudGlsIHdlIHJlYWxseSBuZWVkIHRoZW1cbiAgICBmb3IgaGFsZkVkZ2UsaW5kZXggaW4gaGFsZkVkZ2VzIHdoZW4gbm90IGhhbGZFZGdlP1xuICAgICAgdmVydGljZXMgPz0gQHZlcnRpY2VzRnJvbU5laWdoYm9yaG9vZChpLCBqKVxuICAgICAgaGFsZkVkZ2VzW2luZGV4XSA9IG5ldyBIYWxmRWRnZSBuZXcgRWRnZSB2ZXJ0aWNlc1tpbmRleF0sIHZlcnRpY2VzW2luZGV4ICsgMV0gPyB2ZXJ0aWNlc1swXVxuICAgIGhhbGZFZGdlc1xuXG4gIHZlcnRpY2VzRnJvbU5laWdoYm9yaG9vZDogKGksIGopIC0+XG4gICAgdmVydGljZXMgPSBuZXcgQXJyYXkoNilcbiAgICBAX2VhY2hIYWxmRWRnZUZyb21TaGFyZWRNYXBwaW5ncyBpLCBqLCAoaGFsZkVkZ2VJZHgsIHNyY0hhbGZFZGdlKSAtPlxuICAgICAgdmVydGljZXNbaGFsZkVkZ2VJZHhdID89IHNyY0hhbGZFZGdlLnZiKClcbiAgICAgIHZlcnRpY2VzWyhoYWxmRWRnZUlkeCArIDEpICUgdmVydGljZXMubGVuZ3RoXSA/PSBzcmNIYWxmRWRnZS52YSgpXG4gICAgZm9yIHYsIGluZGV4IGluIEBfc2FtcGxlLnZlcnRpY2VzKCkgd2hlbiBub3QgdmVydGljZXNbaW5kZXhdP1xuICAgICAgdmVydGljZXNbaW5kZXhdID0gbmV3IFZlcnRleCB2LnN1bSBAX2V4cGVjdGVkUG9zaXRpb25Jbk9mZnNldChpLCBqKVxuICAgIHZlcnRpY2VzXG5cbiMgTWFwXG4jXG4jIEBleGFtcGxlXG4jICAgbmV3IE1hcCBjb2xzOiAxMCwgcm93czogMTAsIGhleGFnb246IHsgd2lkdGg6IDEwIH1cbiMgQGV4YW1wbGVcbiMgICBuZXcgTWFwIGNvbHM6IDEwLCByb3dzOiAxMCwgaGV4YWdvbjogeyByYWRpdXM6IDEwIH1cbiMgQGV4YW1wbGVcbiMgICBuZXcgTWFwIGNvbHM6IDEwLCByb3dzOiAxMCwgd2lkdGg6IDUwMCwgaGVpZ2h0OiA1MDBcbmNsYXNzIE1hcFxuICBjb25zdHJ1Y3RvcjogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICBAZiA9IGZhY3RvcnkgICAgICA9IG5ldyBIZXhhZ29uTWF0cml4RmFjdG9yeSBhdHRyaWJ1dGVzXG4gICAgZm9yIG1ldGggaW4gWydpc0ZsYXRUb3BwZWQnLCAnaXNQb2ludGx5VG9wcGVkJywgJ2lzRXZlbk9mZnNldExheW91dCcsICdpc09kZE9mZnNldExheW91dCddXG4gICAgICBAW21ldGhdID0gZmFjdG9yeVttZXRoXVxuICAgIEBtYXRyaXggPSBmYWN0b3J5LmJ1aWxkTWF0cml4XG4gICAgICByb3dzOiBhdHRyaWJ1dGVzLnJvd3NcbiAgICAgIGNvbHM6IGF0dHJpYnV0ZXMuY29sc1xuICAgICAgaGV4YWdvbjogYXR0cmlidXRlcy5oZXhhZ29uID8gQF9kZXRlY3RlZEhleGFnb25TaXplKGF0dHJpYnV0ZXMpXG5cbiAgaGV4YWdvbnM6IC0+XG4gICAgcmV0dXJuIEBfaGV4YWdvbnMgaWYgQF9oZXhhZ29ucz9cbiAgICBbcm93cywgY29sc10gPSBbQG1hdHJpeC5sZW5ndGgsIEBtYXRyaXhbMF0ubGVuZ3RoXVxuICAgIEBfaGV4YWdvbnMgPSBuZXcgQXJyYXkocm93cyAqIGNvbHMpXG4gICAgZm9yIHJvdyxqIGluIEBtYXRyaXhcbiAgICAgIEBfaGV4YWdvbnNbaiAqIGNvbHMgKyBpXSA9IGNlbGwgZm9yIGNlbGwsaSBpbiByb3dcbiAgICBAX2hleGFnb25zXG4gIGZpcnN0SGV4YWdvbjogLT4gQGhleGFnb25zKClbMF1cbiAgbGFzdEhleGFnb246IC0+IEBoZXhhZ29ucygpW0BoZXhhZ29ucygpLmxlbmd0aCAtIDFdXG5cbiAgc2l6ZTogLT5cbiAgICBsYXN0SGV4UG9zID0gQGxhc3RIZXhhZ29uKCkucG9zaXRpb24oKVxuICAgIEBsYXN0SGV4YWdvbigpLnNpemUoKS5zdW0gd2lkdGg6IGxhc3RIZXhQb3MueCwgaGVpZ2h0OiBsYXN0SGV4UG9zLnlcblxuICBfZGV0ZWN0ZWRIZXhhZ29uU2l6ZTogKGF0dHJpYnV0ZXMpID0+XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiQ2Fubm90IGRldGVjdCBjb3JyZWN0IGhleGFnb24gc2l6ZVwiIHVubGVzcyBhdHRyaWJ1dGVzLndpZHRoPyBvciBhdHRyaWJ1dGVzLmhlaWdodD9cbiAgICBbcm93cywgY29scywgd2lkdGgsIGhlaWdodF0gPSBbYXR0cmlidXRlcy5yb3dzLCBhdHRyaWJ1dGVzLmNvbHMsIG51bGwsIG51bGxdXG4gICAgaWYgYXR0cmlidXRlcy53aWR0aD9cbiAgICAgIGRpdmlkZXIgPSBpZiBAaXNGbGF0VG9wcGVkKCkgdGhlbiAxIC8gKChjb2xzIC0gMSkgKiAwLjc1ICsgMSkgZWxzZSAyIC8gKDIgKiBjb2xzICsgMSlcbiAgICAgIHdpZHRoID0gcm91bmQgYXR0cmlidXRlcy53aWR0aCAqIGRpdmlkZXJcbiAgICBpZiBhdHRyaWJ1dGVzLmhlaWdodD9cbiAgICAgIGRpdmlkZXIgPSBpZiBAaXNGbGF0VG9wcGVkKCkgdGhlbiAyIC8gKDIgKiByb3dzICsgMSkgZWxzZSAxIC8gKChyb3dzIC0gMSkgKiAwLjc1ICsgMSlcbiAgICAgIGhlaWdodCA9IHJvdW5kIGF0dHJpYnV0ZXMuaGVpZ2h0ICogZGl2aWRlclxuICAgIHsgd2lkdGgsIGhlaWdodCB9XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwXG4iLCJQb2ludCAgICA9IHJlcXVpcmUgJy4vcG9pbnQuY29mZmVlJ1xuU2l6ZSAgICAgPSByZXF1aXJlICcuL3NpemUuY29mZmVlJ1xuVmVydGV4ICAgPSByZXF1aXJlICcuL3ZlcnRleC5jb2ZmZWUnXG5FZGdlICAgICA9IHJlcXVpcmUgJy4vZWRnZS5jb2ZmZWUnXG5IYWxmRWRnZSA9IHJlcXVpcmUgJy4vaGFsZl9lZGdlLmNvZmZlZSdcblV0aWwgICAgID0gcmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcblBvaW50M0QgID0gcmVxdWlyZSAnLi9wb2ludF8zZC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0geyBQb2ludCwgU2l6ZSwgRWRnZSwgVmVydGV4LCBIYWxmRWRnZSwgVXRpbCwgUG9pbnQzRCB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIE9mZnNldEN1cnNvcjogcmVxdWlyZSgnLi9vZmZzZXRfY3Vyc29yLmNvZmZlZScpXG4gIEF4aWFsQ3Vyc29yIDogcmVxdWlyZSgnLi9heGlhbF9jdXJzb3IuY29mZmVlJylcbiAgIyBDdWJlQ3Vyc29yICA6IHJlcXVpcmUoJy4vY3ViZV9jdXJzb3IuY29mZmVlJylcbiIsImNsYXNzIEVkZ2VcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHZlcnRpY2VzID0gaWYgYXJndW1lbnRzLmxlbmd0aCA+IDEgdGhlbiAoYSBmb3IgYSBpbiBhcmd1bWVudHMpIGVsc2UgYXJndW1lbnRzWzBdXG4gICAgdW5sZXNzIEB2ZXJ0aWNlcz8ubGVuZ3RoIGlzIDJcbiAgICAgIHRocm93IG5ldyBFcnJvciAnWW91IGhhdmUgdG8gcHJvdmlkZSAyIHZlcnRpY2VzJ1xuICAgIHZlcnRleC5wdXNoRWRnZSBAIGZvciB2ZXJ0ZXggaW4gQHZlcnRpY2VzXG4gICAgQGhhbGZFZGdlcyA9IFtdXG5cbiAgaGV4YWdvbnM6IC0+IChoYWxmRWRnZS5oZXhhZ29uIGZvciBoYWxmRWRnZSBpbiBAaGFsZkVkZ2VzKVxuXG4gIGlzQ29udGFpbmVkSW46IChoZXhhZ29uKSAtPlxuICAgIHJldHVybiB0cnVlIGZvciBoZXggaW4gQGhleGFnb25zKCkgd2hlbiBoZXguaXNFcXVhbCBoZXhhZ29uXG4gICAgZmFsc2VcblxuICBpc0VxdWFsOiAob3RoZXIpID0+XG4gICAgZm9yIHZlcnRleCwgaW5kZXggaW4gQHZlcnRpY2VzXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHZlcnRleC5pc0VxdWFsKG90aGVyLnZlcnRpY2VzW2luZGV4XSlcbiAgICB0cnVlXG5cbiAgdG9QcmltaXRpdmU6ID0+IHsgdmVydGljZXM6ICh2LnRvUHJpbWl0aXZlKCkgZm9yIHYgaW4gQHZlcnRpY2VzKSB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX17I3tAdmVydGljZXNbMF0udG9TdHJpbmcoKX0sICN7QHZlcnRpY2VzWzFdLnRvU3RyaW5nKCl9fVwiXG5cbm1vZHVsZS5leHBvcnRzID0gRWRnZVxuIiwiY2xhc3MgSGFsZkVkZ2VcbiAgY29uc3RydWN0b3I6IChAZWRnZSwgQGRpcmVjdGlvbiA9IDEpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yICdZb3UgaGF2ZSB0byBwcm92aWRlIGFuIGVkZ2UnIHVubGVzcyBAZWRnZT9cbiAgICBpZiBAZGlyZWN0aW9uIGlzbnQgMSBhbmQgQGRpcmVjdGlvbiBpc250IC0xXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgJ0RpcmVjdGlvbiBtdXN0IGJlIDEgb3IgLTEnXG4gICAgQGhleGFnb24gPSBudWxsXG4gICAgQGVkZ2UuaGFsZkVkZ2VzLnB1c2ggQFxuXG4gIHZlcnRpY2VzOiAtPlxuICAgIGlmIEBkaXJlY3Rpb24gaXMgMVxuICAgICAgQGVkZ2UudmVydGljZXNcbiAgICBlbHNlXG4gICAgICBAZWRnZS52ZXJ0aWNlcy5zbGljZSgwKS5yZXZlcnNlKClcblxuICB2YTogLT4gQHZlcnRpY2VzKClbMF1cbiAgdmI6IC0+IEB2ZXJ0aWNlcygpWzFdXG5cbiAgb3RoZXJIYWxmRWRnZTogLT5cbiAgICByZXR1cm4gaGFsZkVkZ2UgZm9yIGhhbGZFZGdlIGluIEBlZGdlLmhhbGZFZGdlcyB3aGVuIGhhbGZFZGdlIGlzbnQgQFxuXG4gIGlzRXF1YWw6IChvdGhlcikgPT4gQHZhKCkuaXNFcXVhbChvdGhlci52YSgpKSBhbmQgQHZiKCkuaXNFcXVhbChvdGhlci52YigpKVxuXG4gIHRvUHJpbWl0aXZlOiA9PiB7IHZhOiBAdmEoKS50b1ByaW1pdGl2ZSgpLCB2YjogQHZiKCkudG9QcmltaXRpdmUoKSB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX17I3tAdmEoKS50b1N0cmluZygpfSwgI3tAdmIoKS50b1N0cmluZygpfX1cIlxuXG4gIG9wcG9zaXRlOiA9PiBuZXcgSGFsZkVkZ2UoQGVkZ2UsIGlmIEBkaXJlY3Rpb24gaXMgMSB0aGVuIC0xIGVsc2UgMSlcblxubW9kdWxlLmV4cG9ydHMgPSBIYWxmRWRnZVxuIiwicHJlY2lzaW9uID0gMVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHByZWNpc2lvbjogKHZhbHVlKSAtPlxuICAgIGlmIHZhbHVlP1xuICAgICAgcHJlY2lzaW9uID0gdmFsdWVcbiAgICBlbHNlXG4gICAgICBwcmVjaXNpb25cblxuICByb3VuZDogKHZhbHVlKSAtPlxuICAgIGlmIHByZWNpc2lvbj9cbiAgICAgIGRpdmlkZXIgPSBNYXRoLnBvdyAxMCwgcHJlY2lzaW9uXG4gICAgICBNYXRoLnJvdW5kKHZhbHVlICogZGl2aWRlcikgLyBkaXZpZGVyXG4gICAgZWxzZVxuICAgICAgdmFsdWVcbiIsInJvdW5kID0gcmVxdWlyZSgnLi91dGlsLmNvZmZlZScpLnJvdW5kXG5cbmNsYXNzIFBvaW50XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBAX2V4dHJhY3RBdHRyaWJ1dGVzKGFyZ3VtZW50cylcbiAgICBAeCA9IGF0dHJpYnV0ZXMueCA/IDBcbiAgICBAeSA9IGF0dHJpYnV0ZXMueSA/IDBcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+IEB4IGlzIG90aGVyLnggYW5kIEB5IGlzIG90aGVyLnlcblxuICB0b1ByaW1pdGl2ZTogPT4geyB4OiBAeCwgeTogQHkgfVxuXG4gIHRvU3RyaW5nOiA9PiBcIiN7QGNvbnN0cnVjdG9yLm5hbWV9KCN7QHh9LCAje0B5fSlcIlxuXG4gIHN1bTogLT5cbiAgICBhdHRyaWJ1dGVzID0gQF9leHRyYWN0QXR0cmlidXRlcyhhcmd1bWVudHMpXG4gICAgbmV3IEBjb25zdHJ1Y3RvciByb3VuZChAeCArIGF0dHJpYnV0ZXMueCksIHJvdW5kKEB5ICsgYXR0cmlidXRlcy55KVxuXG4gIHN1YjogLT5cbiAgICBhdHRyaWJ1dGVzID0gQF9leHRyYWN0QXR0cmlidXRlcyhhcmd1bWVudHMpXG4gICAgbmV3IEBjb25zdHJ1Y3RvciByb3VuZChAeCAtIGF0dHJpYnV0ZXMueCksIHJvdW5kKEB5IC0gYXR0cmlidXRlcy55KVxuXG4gIF9leHRyYWN0QXR0cmlidXRlczogKGFyZ3MpIC0+XG4gICAgYXR0cmlidXRlcyA9IGFyZ3NbMF0gPyB7fVxuICAgIGlmIHR5cGVvZihhdHRyaWJ1dGVzKSBpcyAnbnVtYmVyJyB8fCBhcmdzLmxlbmd0aCA+IDFcbiAgICAgIGF0dHJpYnV0ZXMgPSB7IHg6IGFyZ3NbMF0gPyAwLCB5OiBhcmdzWzFdID8gMCB9XG4gICAgYXR0cmlidXRlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50XG4iLCJyb3VuZCA9IHJlcXVpcmUoJy4vdXRpbC5jb2ZmZWUnKS5yb3VuZFxuXG5jbGFzcyBTaXplXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbMF0gPyB7fVxuICAgIGlmIHR5cGVvZihhdHRyaWJ1dGVzKSBpcyAnbnVtYmVyJyB8fCBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgYXR0cmlidXRlcyA9IHsgd2lkdGg6IGFyZ3VtZW50c1swXSwgaGVpZ2h0OiBhcmd1bWVudHNbMV0gfVxuICAgIEB3aWR0aCAgPSBhdHRyaWJ1dGVzLndpZHRoID8gMFxuICAgIEBoZWlnaHQgPSBhdHRyaWJ1dGVzLmhlaWdodCA/IDBcblxuICBzdW06IC0+XG4gICAgYXR0cmlidXRlcyA9IEBfZXh0cmFjdEF0dHJpYnV0ZXMoYXJndW1lbnRzKVxuICAgIG5ldyBAY29uc3RydWN0b3Igcm91bmQoQHdpZHRoICsgYXR0cmlidXRlcy53aWR0aCksIHJvdW5kKEBoZWlnaHQgKyBhdHRyaWJ1dGVzLmhlaWdodClcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+IEB3aWR0aCBpcyBvdGhlci53aWR0aCAmJiBAaGVpZ2h0IGlzIG90aGVyLmhlaWdodFxuXG4gIHRvUHJpbWl0aXZlOiA9PiB7IHdpZHRoOiBAd2lkdGgsIGhlaWdodDogQGhlaWdodCB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX0gKCN7QHdpZHRofSwgI3tAaGVpZ2h0fSlcIlxuXG4gIF9leHRyYWN0QXR0cmlidXRlczogKGFyZ3MpIC0+XG4gICAgYXR0cmlidXRlcyA9IGFyZ3NbMF0gPyB7fVxuICAgIGlmIHR5cGVvZihhdHRyaWJ1dGVzKSBpcyAnbnVtYmVyJyB8fCBhcmdzLmxlbmd0aCA+IDFcbiAgICAgIGF0dHJpYnV0ZXMgPSB7IHdpZHRoOiBhcmdzWzBdID8gMCwgaGVpZ2h0OiBhcmdzWzFdID8gMCB9XG4gICAgYXR0cmlidXRlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpemVcbiIsIlBvaW50ID0gcmVxdWlyZSAnLi9wb2ludC5jb2ZmZWUnXG5cbmNsYXNzIFZlcnRleCBleHRlbmRzIFBvaW50XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGVkZ2VzID0gW11cblxuICBwdXNoRWRnZTogKGVkZ2UpIC0+XG4gICAgQGVkZ2VzLnB1c2ggZWRnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlcnRleFxuIiwiUG9pbnQgPSByZXF1aXJlICcuL3BvaW50LmNvZmZlZSdcbnJvdW5kID0gcmVxdWlyZSgnLi91dGlsLmNvZmZlZScpLnJvdW5kXG5cbmNsYXNzIFBvaW50M0QgZXh0ZW5kcyBQb2ludFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEB6ID0gQF9leHRyYWN0QXR0cmlidXRlcyhhcmd1bWVudHMpLnpcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+IEB4IGlzIG90aGVyLnggYW5kIEB5IGlzIG90aGVyLnkgYW5kIEB6IGlzIG90aGVyLnpcblxuICB0b1ByaW1pdGl2ZTogPT4geyB4OiBAeCwgeTogQHksIHo6IEB6IH1cblxuICB0b1N0cmluZzogPT4gXCIje0Bjb25zdHJ1Y3Rvci5uYW1lfSgje0B4fSwgI3tAeX0sICN7QHp9KVwiXG5cbiAgc3VtOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBAX2V4dHJhY3RBdHRyaWJ1dGVzKGFyZ3VtZW50cylcbiAgICBuZXcgQGNvbnN0cnVjdG9yIHJvdW5kKEB4ICsgYXR0cmlidXRlcy54KSwgcm91bmQoQHkgKyBhdHRyaWJ1dGVzLnkpLCByb3VuZChAeiArIGF0dHJpYnV0ZXMueilcblxuICBzdWI6IC0+XG4gICAgYXR0cmlidXRlcyA9IEBfZXh0cmFjdEF0dHJpYnV0ZXMoYXJndW1lbnRzKVxuICAgIG5ldyBAY29uc3RydWN0b3Igcm91bmQoQHggLSBhdHRyaWJ1dGVzLngpLCByb3VuZChAeSAtIGF0dHJpYnV0ZXMueSksIHJvdW5kKEB6IC0gYXR0cmlidXRlcy56KVxuXG4gIF9leHRyYWN0QXR0cmlidXRlczogKGFyZ3MpIC0+XG4gICAgYXR0cmlidXRlcyA9IGFyZ3NbMF0gPyB7fVxuICAgIGlmIHR5cGVvZihhdHRyaWJ1dGVzKSBpcyAnbnVtYmVyJyB8fCBhcmdzLmxlbmd0aCA+IDFcbiAgICAgIGF0dHJpYnV0ZXMgPSB7IHg6IGFyZ3NbMF0gPyAwLCB5OiBhcmdzWzFdID8gMCwgejogYXJnc1syXSA/IDAgfVxuICAgIGF0dHJpYnV0ZXNcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludDNEXG4iLCJQb2ludCA9IHJlcXVpcmUgJy4uL2NvcmUvcG9pbnQuY29mZmVlJ1xuXG5jbGFzcyBPZmZzZXRDdXJzb3JcbiAgY29uc3RydWN0b3I6IChtYXBPckN1cnNvciwgYXJncy4uLiktPlxuICAgIGlmIG1hcE9yQ3Vyc29yLm9mZnNldFBvc2l0aW9uXG4gICAgICBAbWFwID0gbWFwT3JDdXJzb3IubWFwXG4gICAgICBAbW92ZVRvIG1hcE9yQ3Vyc29yLm9mZnNldFBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAbWFwID0gbWFwT3JDdXJzb3JcbiAgICAgIEBtb3ZlVG8gQF9leHRyYWN0T2Zmc2V0KGFyZ3MpXG5cbiAgbW92ZVRvOiAtPlxuICAgIEBwb3NpdGlvbiA9IEBfZXh0cmFjdE9mZnNldChhcmd1bWVudHMpXG4gICAgQGhleGFnb24gPSBAbWFwLm1hdHJpeFtAcG9zaXRpb24ueV0/W0Bwb3NpdGlvbi54XVxuXG4gIGF4aWFsUG9zaXRpb246IC0+XG4gICAgQHBvc2l0aW9uLnN1YiBAX2NlbnRlclBvaW50KClcblxuICBjdWJlUG9zaXRpb246IC0+XG4gICAgYXhpYWwgPSBAYXhpYWxQb3NpdGlvbigpXG4gICAgeyB4OiBheGlhbC54LCB5OiAtKGF4aWFsLnggKyBheGlhbC55KSwgejogYXhpYWwueX1cblxuICBfY2VudGVyUG9pbnQ6IC0+XG4gICAgcmV0dXJuIEBfY2VudGVyIGlmIEBfY2VudGVyP1xuICAgIGNlbnRlclkgPSBNYXRoLnJvdW5kIChAbWFwLm1hdHJpeC5sZW5ndGggLSAxKSAvIDJcbiAgICBAX2NlbnRlciA9IG5ldyBQb2ludFxuICAgICAgeDogTWF0aC5yb3VuZCAoQG1hcC5tYXRyaXhbY2VudGVyWV0ubGVuZ3RoIC0gMSkgLyAyXG4gICAgICB5OiBjZW50ZXJZXG5cbiAgX2V4dHJhY3RPZmZzZXQ6IChhcmdzKSAtPlxuICAgIGlmIGFyZ3MubGVuZ3RoIGlzIDJcbiAgICAgIG5ldyBQb2ludCBhcmdzWzBdLCBhcmdzWzFdXG4gICAgZWxzZVxuICAgICAgb2JqID0gYXJnc1swXVxuICAgICAgaWYgb2JqLng/IG9yIG9iai55P1xuICAgICAgICBvYmpcbiAgICAgIGVsc2UgaWYgb2JqLmk/IG9yIG9iai5qP1xuICAgICAgICBuZXcgUG9pbnQgb2JqLmksIG9iai5qXG4gICAgICBlbHNlIGlmIG9iai5fX3Bvc2l0aW9uP1xuICAgICAgICBvYmouX19wb3NpdGlvblxuXG5tb2R1bGUuZXhwb3J0cyA9IE9mZnNldEN1cnNvclxuIiwiUG9pbnQgPSByZXF1aXJlICcuLi9jb3JlL3BvaW50LmNvZmZlZSdcblxuY2xhc3MgQXhpYWxDdXJzb3JcbiAgY29uc3RydWN0b3I6IChtYXBPckN1cnNvciwgYXJncy4uLiktPlxuICAgIGlmIG1hcE9yQ3Vyc29yLmF4aWFsUG9zaXRpb25cbiAgICAgIEBtYXAgPSBtYXBPckN1cnNvci5tYXBcbiAgICAgIEBtb3ZlVG8gbWFwT3JDdXJzb3IuYXhpYWxQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQG1hcCA9IG1hcE9yQ3Vyc29yXG4gICAgICBAbW92ZVRvIEBfZXh0cmFjdFBvaW50KGFyZ3MpXG5cbiAgbW92ZVRvOiAtPlxuICAgIEBwb3NpdGlvbiA9IEBfZXh0cmFjdFBvaW50KGFyZ3VtZW50cylcbiAgICBwb2ludCA9IEBfY2VudGVyUG9pbnQoKS5zdW0gQHBvc2l0aW9uXG4gICAgQGhleGFnb24gPSBAbWFwLm1hdHJpeFtwb2ludC55XT9bcG9pbnQueF1cblxuICBheGlhbFBvc2l0aW9uOiAtPiBAcG9zaXRpb25cblxuICBjdWJlUG9zaXRpb246IC0+XG4gICAgeyB4OiBAcG9zaXRpb24ueCwgeTogLShAcG9zaXRpb24ueCArIEBwb3NpdGlvbi55KSwgejogQHBvc2l0aW9uLnl9XG5cbiAgb2Zmc2V0UG9zaXRpb246IC0+XG4gICAgQF9jZW50ZXJQb2ludCgpLnN1bSBAcG9zaXRpb25cblxuICBfY2VudGVyUG9pbnQ6IC0+XG4gICAgcmV0dXJuIEBfY2VudGVyIGlmIEBfY2VudGVyP1xuICAgIGNlbnRlclkgPSBNYXRoLnJvdW5kIChAbWFwLm1hdHJpeC5sZW5ndGggLSAxKSAvIDJcbiAgICBAX2NlbnRlciA9IG5ldyBQb2ludFxuICAgICAgeDogTWF0aC5yb3VuZCAoQG1hcC5tYXRyaXhbY2VudGVyWV0ubGVuZ3RoIC0gMSkgLyAyXG4gICAgICB5OiBjZW50ZXJZXG5cbiAgX2V4dHJhY3RQb2ludDogKGFyZ3MpIC0+XG4gICAgaWYgYXJncy5sZW5ndGggaXMgMlxuICAgICAgbmV3IFBvaW50IGFyZ3NbMF0sIGFyZ3NbMV1cbiAgICBlbHNlXG4gICAgICBvYmogPSBhcmdzWzBdXG4gICAgICBpZiBvYmoueD8gb3Igb2JqLnk/XG4gICAgICAgIG9ialxuICAgICAgZWxzZSBpZiBvYmouX19wb3NpdGlvbj9cbiAgICAgICAgbmV3IFBvaW50KG9iai5fX3Bvc2l0aW9uKS5zdWIgQF9jZW50ZXJQb2ludCgpXG5cbm1vZHVsZS5leHBvcnRzID0gQXhpYWxDdXJzb3JcbiJdfQ==
;