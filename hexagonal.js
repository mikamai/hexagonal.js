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
  var Edge, HalfEdge, Point, Size, Util, Vertex;

  Point = require('./point.coffee');

  Size = require('./size.coffee');

  Vertex = require('./vertex.coffee');

  Edge = require('./edge.coffee');

  HalfEdge = require('./half_edge.coffee');

  Util = require('./util.coffee');

  module.exports = {
    Point: Point,
    Size: Size,
    Edge: Edge,
    Vertex: Vertex,
    HalfEdge: HalfEdge,
    Util: Util
  };

}).call(this);


},{"./point.coffee":6,"./size.coffee":7,"./vertex.coffee":8,"./edge.coffee":9,"./half_edge.coffee":10,"./util.coffee":11}],5:[function(require,module,exports){
(function() {
  module.exports = {
    OffsetCursor: require('./offset_cursor.coffee'),
    AxialCursor: require('./axial_cursor.coffee')
  };

}).call(this);


},{"./offset_cursor.coffee":12,"./axial_cursor.coffee":13}],9:[function(require,module,exports){
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
      divider = Math.pow(10, precision);
      return Math.round(value * divider) / divider;
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


},{"./point.coffee":6}],13:[function(require,module,exports){
(function() {
  var AxialCursor, Point,
    __slice = [].slice;

  Point = require('../core/point.coffee');

  AxialCursor = (function() {
    function AxialCursor() {
      var args, map;
      map = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.map = map;
      this.moveTo(this._extractPoint(args));
    }

    AxialCursor.prototype.moveTo = function() {
      var point, _ref;
      point = this._centerPoint().sum(this._extractPoint(arguments));
      return this.hexagon = (_ref = this.map.matrix[point.y]) != null ? _ref[point.x] : void 0;
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


},{"../core/point.coffee":6}],12:[function(require,module,exports){
(function() {
  var OffsetCursor, Point,
    __slice = [].slice;

  Point = require('../core/point.coffee');

  OffsetCursor = (function() {
    function OffsetCursor() {
      var args, map;
      map = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.map = map;
      this.moveTo(this._extractOffset(args));
    }

    OffsetCursor.prototype.moveTo = function() {
      var offset, _ref;
      offset = this._extractOffset(arguments);
      return this.hexagon = (_ref = this.map.matrix[offset.y]) != null ? _ref[offset.x] : void 0;
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


},{"../core/point.coffee":6}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvaGV4YWdvbi5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvbWFwLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jdXJzb3JzL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL2VkZ2UuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvaGFsZl9lZGdlLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25hbC9jb3JlL3V0aWwuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvcG9pbnQuY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2NvcmUvc2l6ZS5jb2ZmZWUiLCIvVXNlcnMvZ2F3YWluZS9kZXYvZ2F3YWluZS9oZXhfbWFwL3NyYy9oZXhhZ29uYWwvY29yZS92ZXJ0ZXguY29mZmVlIiwiL1VzZXJzL2dhd2FpbmUvZGV2L2dhd2FpbmUvaGV4X21hcC9zcmMvaGV4YWdvbmFsL2N1cnNvcnMvYXhpYWxfY3Vyc29yLmNvZmZlZSIsIi9Vc2Vycy9nYXdhaW5lL2Rldi9nYXdhaW5lL2hleF9tYXAvc3JjL2hleGFnb25h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O0NBQ0ksQ0FBTyxDQUFKLENBQVQsQ0FBQSxZQUFBO01BSE4sSUFBQTtDQUtFLEdBQVUsQ0FBQSxXQUFBLDZEQUFBO1VBVGQ7UUFEYztDQVBoQixJQU9nQjs7Q0FQaEI7O0NBSEY7O0NBQUEsQ0FzQkEsQ0FBaUIsR0FBWCxDQUFOLEtBdEJBO0NBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIkhleGFnb25hbCA9IHt9XG5cbmZvciBDbGFzc05hbWUsIENsYXNzIG9mIHJlcXVpcmUgJy4vY29yZS9pbmRleC5jb2ZmZWUnXG4gIEhleGFnb25hbFtDbGFzc05hbWVdID0gQ2xhc3NcblxuSGV4YWdvbmFsLkhleGFnb24gPSByZXF1aXJlICcuL2hleGFnb24uY29mZmVlJ1xuSGV4YWdvbmFsLk1hcCAgICAgPSByZXF1aXJlICcuL21hcC5jb2ZmZWUnXG5IZXhhZ29uYWwuQ3Vyc29ycyA9IHJlcXVpcmUgJy4vY3Vyc29ycy9pbmRleC5jb2ZmZWUnXG5cbkhleGFnb25hbC5wcmVjaXNpb24gPSBIZXhhZ29uYWwuVXRpbC5wcmVjaXNpb25cbkhleGFnb25hbC51c2luZ1ByZWNpc2lvbiA9IChwcmVjaXNpb24sIGNhbGxiYWNrKSAtPlxuICBvbGRQcmVjaXNpb24gPSBIZXhhZ29uYWwuVXRpbC5wcmVjaXNpb24oKVxuICBIZXhhZ29uYWwuVXRpbC5wcmVjaXNpb24gcHJlY2lzaW9uXG4gIHRyeVxuICAgIGNhbGxiYWNrKClcbiAgZmluYWxseVxuICAgIEhleGFnb25hbC5VdGlsLnByZWNpc2lvbiBvbGRQcmVjaXNpb25cblxuZ2xvYmFsLkhleGFnb25hbCA9IG1vZHVsZS5leHBvcnRzID0gSGV4YWdvbmFsXG4iLCJQb2ludCAgICA9IHJlcXVpcmUgJy4vY29yZS9wb2ludC5jb2ZmZWUnXG5TaXplICAgICA9IHJlcXVpcmUgJy4vY29yZS9zaXplLmNvZmZlZSdcblZlcnRleCAgID0gcmVxdWlyZSAnLi9jb3JlL3ZlcnRleC5jb2ZmZWUnXG5FZGdlICAgICA9IHJlcXVpcmUgJy4vY29yZS9lZGdlLmNvZmZlZSdcbkhhbGZFZGdlID0gcmVxdWlyZSAnLi9jb3JlL2hhbGZfZWRnZS5jb2ZmZWUnXG5cbnJvdW5kICAgID0gcmVxdWlyZSgnLi9jb3JlL3V0aWwuY29mZmVlJykucm91bmRcblxuIyBIZXhhZ29uXG4jXG4jIEBleGFtcGxlIEJ1aWx0IHVzaW5nIFJhZGl1c1xuIyAgIEhleGFnb24uYnlSYWRpdXMgMiAjIGJ1aWx0IHdpdGggcmFkaXVzIDIgYW5kIGNlbnRlciBwbGFjZWQgaW4gdGhlIG9yaWdpblxuIyAgIEhleGFnb24uYnlSYWRpdXMgY2VudGVyOiB7IHg6IDEsIHk6IDIgfSwgcmFkaXVzOiAyXG4jXG4jIEBleGFtcGxlIEJ1aWx0IHVzaW5nIFZlcnRpY2VzXG4jICAgSGV4YWdvbi5ieVZlcnRpY2VzIFt2MSwgdjIsIHYzLCB2NCwgdjUsIHY2XVxuI1xuIyBAZXhhbXBsZSBCdWlsdCB1c2luZyBFZGdlc1xuIyAgIEhleGFnb24uYnlFZGdlcyBbZTEsIGUyLCBlMywgZTQsIGU1LCBlNl1cbiNcbiMgQGV4YW1wbGUgQnVpbHQgdXNpbmcgU2l6ZVxuIyAgIEhleGFnb24uYnlTaXplIHsgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwIH0gIyB3aXRoIHBvc2l0aW9uIHBsYWNlZCBpbiB0aGUgb3JpZ2luXG4jICAgSGV4YWdvbi5ieVNpemUgeyB3aWR0aDogMTAgfSwgIHBvc2l0aW9uOiB7IHg6IDEsIHk6IDJ9ICMgaGVpZ2h0IHdpbGwgYmUgZGV0ZWN0ZWRcbiMgICBIZXhhZ29uLmJ5U2l6ZSB7IGhlaWdodDogMTAgfSwgcG9zaXRpb246IHsgeDogMSwgeTogMn0gIyB3aWR0aCB3aWxsIGJlIGRldGVjdGVkXG4jXG4jIFdoZW4geW91IGNyZWF0ZSBhbiBoZXhhZ29uIHlvdSBzaG91bGQgYWx3YXlzIHBhc3MgdGhlIGZsYXRUb3BwZWQgb3B0aW9uIHNldCB0byB0cnVlIGlmIHlvdSB3YW50XG4jIHRoZSBoZXhhZ29uIHRvIGJlIGhhbmRsZWQgYXMgZmxhdCB0b3BwZWQuXG4jXG4jIEBleGFtcGxlXG4jICAgSGV4YWdvbi5ieVNpemUgeyB3aWR0aDogMTAsIGhlaWdodDogMTAgfSAjIGNyZWF0ZXMgYSBwb2ludHkgdG9wcGVkIGhleGFnb25cbiMgICBIZXhhZ29uLmJ5U2l6ZSB7IHdpZHRoOiAxMCwgaGVpZ2h0OiAxMCB9LCBmbGF0VG9wcGVkOiB0cnVlICMgY3JlYXRlcyBhIGZsYXQgdG9wcGVkIGhleGFnb25cbmNsYXNzIEhleGFnb25cbiAgQHNpemVNdWx0aXBsaWVyczpcbiAgICBwb2ludGx5OiBbXG4gICAgICB7IHg6IDEsICAgeTogMC43NSB9LFxuICAgICAgeyB4OiAwLjUsIHk6IDEgfSxcbiAgICAgIHsgeDogMCwgICB5OiAwLjc1IH0sXG4gICAgICB7IHg6IDAsICAgeTogMC4yNSB9LFxuICAgICAgeyB4OiAwLjUsIHk6IDAgfSxcbiAgICAgIHsgeDogMSwgICB5OiAwLjI1IH1cbiAgICBdLFxuICAgIGZsYXQ6IFtcbiAgICAgIHsgeDogMSwgICAgeTogMC41IH0sXG4gICAgICB7IHg6IDAuNzUsIHk6IDEgfSxcbiAgICAgIHsgeDogMC4yNSwgeTogMSB9LFxuICAgICAgeyB4OiAwLCAgICB5OiAwLjUgfSxcbiAgICAgIHsgeDogMC4yNSwgeTogMCB9LFxuICAgICAgeyB4OiAwLjc1LCB5OiAwIH1cbiAgICBdXG4gIEBkaW1lbnNpb25Db2VmZjogTWF0aC5zcXJ0KDMpIC8gMlxuXG4gICMgQ3JlYXRlcyBhIHJlZ3VsYXIgSGV4YWdvbiBnaXZlbiBpdHMgcmFkaXVzXG4gICMgQHBhcmFtIHJhZGl1cyBbTnVtYmVyXSByYWRpdXMgb2YgdGhlIGNpcmNsZSBpbnNjcmliaW5nIHRoZSBoZXhhZ29uXG4gICMgQHBhcmFtIGF0dHJpYnV0ZXMgW0hhc2hdIE9wdGlvbnMgdG8gcHJvdmlkZTpcbiAgIyAgIGNlbnRlcjogY2VudGVyIG9mIHRoZSBoZXhhZ29uXG4gICMgICBmbGF0VG9wcGVkOiB3aGV0aGVyIHRvIGNyZWF0ZSBhIGZsYXQgdG9wcGVkIGhleGFnb24gb3Igbm90XG4gICMgICBwb3NpdGlvbjogcG9zaXRpb24gdG8gc2V0IHdoZW4gdGhlIGhleGFnb24gaGFzIGJlZW4gYnVpbHRcbiAgQGJ5UmFkaXVzOiAocmFkaXVzLCBhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgY2VudGVyID0gbmV3IFBvaW50IGF0dHJpYnV0ZXMuY2VudGVyXG4gICAgdmVydGljZXMgPSBbXVxuICAgIGZvciBpbmRleCBpbiBbMC4uLjZdXG4gICAgICBhbmdsZU1vZCA9IGlmIGF0dHJpYnV0ZXMuZmxhdFRvcHBlZCB0aGVuIDAgZWxzZSAwLjVcbiAgICAgIGFuZ2xlICAgID0gMiAqIE1hdGguUEkgLyA2ICogKGluZGV4ICsgYW5nbGVNb2QpXG4gICAgICB2ZXJ0aWNlcy5wdXNoIG5ldyBWZXJ0ZXhcbiAgICAgICAgeDogcm91bmQoY2VudGVyLnggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkpXG4gICAgICAgIHk6IHJvdW5kKGNlbnRlci55ICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpKVxuICAgIEBieVZlcnRpY2VzIHZlcnRpY2VzLCBhdHRyaWJ1dGVzXG5cbiAgQF9kZXRlY3RlZFNpemU6IChzaXplLCBmbGF0VG9wcGVkKSAtPlxuICAgIFt3aWR0aCwgaGVpZ2h0XSA9IFtzaXplLndpZHRoLCBzaXplLmhlaWdodF1cbiAgICBjb2VmZiA9IGlmIGZsYXRUb3BwZWQgdGhlbiAxIC8gQGRpbWVuc2lvbkNvZWZmIGVsc2UgQGRpbWVuc2lvbkNvZWZmXG4gICAgaWYgd2lkdGhcbiAgICAgIG5ldyBTaXplIHdpZHRoLCBoZWlnaHQgPyByb3VuZCh3aWR0aCAvIGNvZWZmKVxuICAgIGVsc2UgaWYgaGVpZ2h0XG4gICAgICBuZXcgU2l6ZSByb3VuZChoZWlnaHQgKiBjb2VmZiksIGhlaWdodFxuXG4gICMgQ3JlYXRlcyBhbiBIZXhhZ29uIGdpdmVuIGl0cyBzaXplXG4gICMgQHBhcmFtIHNpemUgW1NpemVdIFNpemUgdG8gdXNlIHRvIGNyZWF0ZSB0aGUgaGV4YWdvblxuICAjICAgSWYgb25lIG9mIHRoZSBzaXplIHZhbHVlcyAod2lkdGggb3IgaGVpZ2h0KSBpcyBub3Qgc2V0LCBpdCB3aWxsIGJlXG4gICMgICBjYWxjdWxhdGVkIHVzaW5nIHRoZSBvdGhlciB2YWx1ZSwgZ2VuZXJhdGluZyBhIHJlZ3VsYXIgaGV4YWdvblxuICAjIEBwYXJhbSBhdHRyaWJ1dGVzIFtIYXNoXSBPcHRpb25zIHRvIHByb3ZpZGU6XG4gICMgICBmbGF0VG9wcGVkOiB3aGV0aGVyIHRvIGNyZWF0ZSBhIGZsYXQgdG9wcGVkIGhleGFnb24gb3Igbm90XG4gICMgICBwb3NpdGlvbjogcG9zaXRpb24gdG8gc2V0IHdoZW4gdGhlIGhleGFnb24gaGFzIGJlZW4gYnVpbHRcbiAgQGJ5U2l6ZTogKHNpemUsIGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICB1bmxlc3Mgc2l6ZT8ud2lkdGg/IG9yIHNpemU/LmhlaWdodD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlNpemUgbXVzdCBiZSBwcm92aWRlZCB3aXRoIHdpZHRoIG9yIGhlaWdodCBvciBib3RoXCJcbiAgICBzaXplID0gQF9kZXRlY3RlZFNpemUgc2l6ZSwgYXR0cmlidXRlcy5mbGF0VG9wcGVkXG4gICAgbXVsdGlwbGllcnMgPSBAc2l6ZU11bHRpcGxpZXJzW2lmIGF0dHJpYnV0ZXMuZmxhdFRvcHBlZCB0aGVuICdmbGF0JyBlbHNlICdwb2ludGx5J11cbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgZm9yIG11bHRpcGxpZXIgaW4gbXVsdGlwbGllcnNcbiAgICAgIHZlcnRpY2VzLnB1c2ggbmV3IFZlcnRleFxuICAgICAgICB4OiByb3VuZChzaXplLndpZHRoICAqIG11bHRpcGxpZXIueClcbiAgICAgICAgeTogcm91bmQoc2l6ZS5oZWlnaHQgKiBtdWx0aXBsaWVyLnkpXG4gICAgQGJ5VmVydGljZXMgdmVydGljZXMsIGF0dHJpYnV0ZXNcblxuICAjIENyZWF0ZXMgYW4gSGV4YWdvbiBnaXZlbiBpdHMgdmVydGljZXNcbiAgIyBAcGFyYW0gdmVydGljZXMgW0FycmF5PFZlcnRleD5dIENvbGxlY3Rpb24gb2YgdmVydGljZXNcbiAgIyAgIFZlcnRpY2VzIGhhdmUgdG8gYmUgb3JkZXJlZCBjbG9ja3dpc2Ugc3RhcnRpbmcgZnJvbSB0aGUgb25lIGF0XG4gICMgICAwIGRlZ3JlZXMgKGluIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiksIG9yIDMwIGRlZ3JlZXMgKGluIGEgcG9pbnRseSB0b3BwZWQgaGV4YWdvbilcbiAgIyBAcGFyYW0gYXR0cmlidXRlcyBbSGFzaF0gT3B0aW9ucyB0byBwcm92aWRlOlxuICAjICAgZmxhdFRvcHBlZDogd2hldGhlciB0aGlzIGlzIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiBvciBub3RcbiAgIyAgIHBvc2l0aW9uOiBwb3NpdGlvbiB0byBzZXQgd2hlbiB0aGUgaGV4YWdvbiBoYXMgYmVlbiBidWlsdFxuICBAYnlWZXJ0aWNlczogKHZlcnRpY2VzLCBhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yICdZb3UgaGF2ZSB0byBwcm92aWRlIDYgdmVydGljZXMnIGlmIHZlcnRpY2VzLmxlbmd0aCBpc250IDZcbiAgICBlZGdlcyA9IChmb3IgdmVydGV4LCBpbmRleCBpbiB2ZXJ0aWNlc1xuICAgICAgbmV4dFZlcnRleCA9IHZlcnRpY2VzW2luZGV4ICsgMV0gPyB2ZXJ0aWNlc1swXVxuICAgICAgbmV3IEVkZ2UgW3ZlcnRleCwgbmV4dFZlcnRleF0pXG4gICAgQGJ5RWRnZXMgZWRnZXMsIGF0dHJpYnV0ZXNcblxuICAjIENyZWF0ZXMgYW4gSGV4YWdvbiBnaXZlbiBpdHMgZWRnZXNcbiAgIyBAcGFyYW0gZWRnZXMgW0FycmF5PEVkZ2U+XSBDb2xsZWN0aW9uIG9mIGVkZ2VzXG4gICMgICBFZGdlcyBoYXZlIHRvIGJlIG9yZGVyZWQgY291bnRlcmNsb2Nrd2lzZSBzdGFydGluZyBmcm9tIHRoZSBvbmUgd2l0aFxuICAjICAgdGhlIGZpcnN0IHZlcnRleCBhdCAwIGRlZ3JlZXMgKGluIGEgZmxhdCB0b3BwZWQgaGV4YWdvbiksXG4gICMgICBvciAzMCBkZWdyZWVzIChpbiBhIHBvaW50bHkgdG9wcGVkIGhleGFnb24pXG4gICMgQHBhcmFtIGF0dHJpYnV0ZXMgW0hhc2hdIE9wdGlvbnMgdG8gcHJvdmlkZTpcbiAgIyAgIGZsYXRUb3BwZWQ6IHdoZXRoZXIgdGhpcyBpcyBhIGZsYXQgdG9wcGVkIGhleGFnb24gb3Igbm90XG4gICMgICBwb3NpdGlvbjogcG9zaXRpb24gdG8gc2V0IHdoZW4gdGhlIGhleGFnb24gaGFzIGJlZW4gYnVpbHRcbiAgQGJ5RWRnZXM6IChlZGdlcywgYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgIHRocm93IG5ldyBFcnJvciAnWW91IGhhdmUgdG8gcHJvdmlkZSA2IGVkZ2VzJyBpZiBlZGdlcy5sZW5ndGggaXNudCA2XG4gICAgaGFsZkVkZ2VzID0gKG5ldyBIYWxmRWRnZShlZGdlKSBmb3IgZWRnZSBpbiBlZGdlcylcbiAgICBuZXcgSGV4YWdvbiBoYWxmRWRnZXMsIGF0dHJpYnV0ZXNcblxuICBjb25zdHJ1Y3RvcjogKEBoYWxmRWRnZXMsIGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgJ1lvdSBoYXZlIHRvIHByb3ZpZGUgNiBoYWxmZWRnZXMnIGlmIEBoYWxmRWRnZXMubGVuZ3RoIGlzbnQgNlxuICAgIEB0b3BNb2RlICAgPSBpZiBhdHRyaWJ1dGVzLmZsYXRUb3BwZWQgdGhlbiAnZmxhdCcgZWxzZSAncG9pbnRseSdcbiAgICBAX3NldFBvc2l0aW9uIGF0dHJpYnV0ZXMucG9zaXRpb24gaWYgYXR0cmlidXRlcy5wb3NpdGlvbj9cbiAgICBoYWxmRWRnZS5oZXhhZ29uID0gQCBmb3IgaGFsZkVkZ2UgaW4gQGhhbGZFZGdlc1xuXG4gIGlzRmxhdFRvcHBlZDogLT4gQHRvcE1vZGUgaXMgJ2ZsYXQnXG5cbiAgaXNQb2ludGx5VG9wcGVkOiAtPiBAdG9wTW9kZSBpcyAncG9pbnRseSdcblxuICB2ZXJ0aWNlczogLT4gKGhhbGZFZGdlLnZhKCkgZm9yIGhhbGZFZGdlIGluIEBoYWxmRWRnZXMpXG5cbiAgZWRnZXM6IC0+IChoYWxmRWRnZS5lZGdlIGZvciBoYWxmRWRnZSBpbiBAaGFsZkVkZ2VzKVxuXG4gIGNlbnRlcjogPT4gQHBvc2l0aW9uKCkuc3VtIEBzaXplKCkud2lkdGggLyAyLCBAc2l6ZSgpLmhlaWdodCAvIDJcblxuICBwb3NpdGlvbjogKHZhbHVlKSA9PiBpZiB2YWx1ZT8gdGhlbiBAX3NldFBvc2l0aW9uKHZhbHVlKSBlbHNlIEBfZ2V0UG9zaXRpb24oKVxuXG4gIHNpemU6ICh2YWx1ZSkgPT4gaWYgdmFsdWU/IHRoZW4gQF9zZXRTaXplKHZhbHVlKSBlbHNlIEBfZ2V0U2l6ZSgpXG5cbiAgbmVpZ2hib3JzOiAtPlxuICAgIG5laWdoYm9ycyA9IFtdXG4gICAgZm9yIGhhbGZFZGdlIGluIEBoYWxmRWRnZXNcbiAgICAgIG90aGVySGFsZkVkZ2UgPSBoYWxmRWRnZS5vdGhlckhhbGZFZGdlKClcbiAgICAgIGlmIG90aGVySGFsZkVkZ2U/IGFuZCBuZWlnaGJvcnMuaW5kZXhPZihvdGhlckhhbGZFZGdlLmhleGFnb24pIDwgMFxuICAgICAgICBuZWlnaGJvcnMucHVzaCBvdGhlckhhbGZFZGdlLmhleGFnb25cbiAgICBuZWlnaGJvcnNcblxuICB0b1N0cmluZzogPT4gXCIje0Bjb25zdHJ1Y3Rvci5uYW1lfSgje0Bwb3NpdGlvbigpLnRvU3RyaW5nKCl9OyAje0BzaXplKCkudG9TdHJpbmcoKX0pXCJcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB2ZXJ0aWNlcy5sZW5ndGggaXNudCAob3RoZXIudmVydGljZXM/Lmxlbmd0aCA/IDApXG4gICAgZm9yIHYsIGluZGV4IGluIEB2ZXJ0aWNlc1xuICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyB2LmlzRXF1YWwob3RoZXIudmVydGljZXNbaW5kZXhdKVxuICAgIHRydWVcblxuICB0b1ByaW1pdGl2ZTogPT4gKHYudG9QcmltaXRpdmUoKSBmb3IgdiBpbiBAdmVydGljZXMpXG5cbiAgX2NvcHlTdGFydGluZ1ZlcnRpY2VzRnJvbUVkZ2VzOiAoYXR0cmlidXRlcykgLT5cbiAgICBhdHRyaWJ1dGVzLnZlcnRpY2VzID89IFtdXG4gICAgZm9yIGVkZ2UsIGluZGV4IGluIGF0dHJpYnV0ZXMuZWRnZXMgd2hlbiBlZGdlP1xuICAgICAgYXR0cmlidXRlcy52ZXJ0aWNlc1tpbmRleF0gICAgID89IGVkZ2UudmFcbiAgICAgIGF0dHJpYnV0ZXMudmVydGljZXNbaW5kZXggKyAxXSA/PSBlZGdlLnZiXG5cbiAgX3JvdW5kOiAodmFsdWUpIC0+IHJvdW5kKHZhbHVlKVxuXG4gIF9nZXRQb3NpdGlvbjogLT5cbiAgICB2ZXJ0aWNlcyA9IEB2ZXJ0aWNlcygpXG4gICAgeFZlcnRleElkeCA9IGlmIEBpc0ZsYXRUb3BwZWQoKSB0aGVuIDMgZWxzZSAyXG4gICAgbmV3IFBvaW50IHZlcnRpY2VzW3hWZXJ0ZXhJZHhdLngsIHZlcnRpY2VzWzRdLnlcblxuICBfc2V0UG9zaXRpb246ICh2YWx1ZSkgLT5cbiAgICBhY3R1YWwgPSBAX2dldFBvc2l0aW9uKClcbiAgICBmb3IgdmVydGV4IGluIEB2ZXJ0aWNlcygpXG4gICAgICB2ZXJ0ZXgueCA9IHJvdW5kKHZlcnRleC54IC0gYWN0dWFsLnggKyB2YWx1ZS54KVxuICAgICAgdmVydGV4LnkgPSByb3VuZCh2ZXJ0ZXgueSAtIGFjdHVhbC55ICsgdmFsdWUueSlcblxuICBfZ2V0U2l6ZTogLT5cbiAgICB2ZXJ0aWNlcyA9IEB2ZXJ0aWNlcygpXG4gICAgbmV3IFNpemVcbiAgICAgIHdpZHRoIDogcm91bmQgTWF0aC5hYnModmVydGljZXNbMF0ueCAtIEBwb3NpdGlvbigpLngpXG4gICAgICBoZWlnaHQ6IHJvdW5kIE1hdGguYWJzKHZlcnRpY2VzWzFdLnkgLSBAcG9zaXRpb24oKS55KVxuXG4gIF9zZXRTaXplOiAodmFsdWUpIC0+XG4gICAgcG9zaXRpb24gPSBAX2dldFBvc2l0aW9uKClcbiAgICB2ZXJ0aWNlcyA9IEB2ZXJ0aWNlcygpXG4gICAgZm9yIG11bHRpcGxpZXIsIGluZGV4IGluIEBjb25zdHJ1Y3Rvci5zaXplTXVsdGlwbGllcnNbQHRvcE1vZGVdXG4gICAgICB2ZXJ0aWNlc1tpbmRleF0ueCA9IHJvdW5kKHBvc2l0aW9uLnggKyB2YWx1ZS53aWR0aCAqIG11bHRpcGxpZXIueClcbiAgICAgIHZlcnRpY2VzW2luZGV4XS55ID0gcm91bmQocG9zaXRpb24ueSArIHZhbHVlLmhlaWdodCAqIG11bHRpcGxpZXIueSlcblxubW9kdWxlLmV4cG9ydHMgPSBIZXhhZ29uXG4iLCJIZXhhZ29uICA9IHJlcXVpcmUgJy4vaGV4YWdvbi5jb2ZmZWUnXG5Qb2ludCAgICA9IHJlcXVpcmUgJy4vY29yZS9wb2ludC5jb2ZmZWUnXG5FZGdlICAgICA9IHJlcXVpcmUgJy4vY29yZS9lZGdlLmNvZmZlZSdcbkhhbGZFZGdlID0gcmVxdWlyZSAnLi9jb3JlL2hhbGZfZWRnZS5jb2ZmZWUnXG5WZXJ0ZXggICA9IHJlcXVpcmUgJy4vY29yZS92ZXJ0ZXguY29mZmVlJ1xuU2l6ZSAgICAgPSByZXF1aXJlICcuL2NvcmUvc2l6ZS5jb2ZmZWUnXG5cbnJvdW5kICAgID0gcmVxdWlyZSgnLi9jb3JlL3V0aWwuY29mZmVlJykucm91bmRcblxuY2xhc3MgSGV4YWdvbk1hdHJpeEZhY3RvcnlcbiAgc2hhcmVkSGV4YWdvbkVkZ2VzOlxuICAgIGZsYXQ6XG4gICAgICBldmVuOiBbXG4gICAgICAgIHsgdHlwZTogbnVsbCwgICBwb3M6IG5ldyBQb2ludCggMCwgLTEpLCBzcmM6IDEsIGRlc3Q6IDQgfSxcbiAgICAgICAgeyB0eXBlOiAnZXZlbicsIHBvczogbmV3IFBvaW50KC0xLCAgMCksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoLTEsICAwKSwgc3JjOiA1LCBkZXN0OiAyIH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCgtMSwgLTEpLCBzcmM6IDAsIGRlc3Q6IDMgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KCAxLCAtMSksIHNyYzogMiwgZGVzdDogNSB9XG4gICAgICBdXG4gICAgICBvZGQ6IFtcbiAgICAgICAgeyB0eXBlOiBudWxsLCAgIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMSwgZGVzdDogNCB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoLTEsICAwKSwgc3JjOiA1LCBkZXN0OiAyIH0sXG4gICAgICAgIHsgdHlwZTogJ2V2ZW4nLCBwb3M6IG5ldyBQb2ludCgtMSwgLTEpLCBzcmM6IDAsIGRlc3Q6IDMgfSxcbiAgICAgICAgeyB0eXBlOiAnZXZlbicsIHBvczogbmV3IFBvaW50KCAxLCAtMSksIHNyYzogMiwgZGVzdDogNSB9LFxuICAgICAgICB7IHR5cGU6ICdvZGQnLCAgcG9zOiBuZXcgUG9pbnQoLTEsICAwKSwgc3JjOiAwLCBkZXN0OiAzIH1cbiAgICAgIF1cbiAgICBwb2ludGx5OlxuICAgICAgb2RkOiBbXG4gICAgICAgIHsgdHlwZTogbnVsbCwgICBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDUsIGRlc3Q6IDIgfSxcbiAgICAgICAgeyB0eXBlOiAnZXZlbicsIHBvczogbmV3IFBvaW50KC0xLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoIDAsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCggMCwgLTEpLCBzcmM6IDAsIGRlc3Q6IDMgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KCAxLCAtMSksIHNyYzogMSwgZGVzdDogNCB9XG4gICAgICBdXG4gICAgICBldmVuOiBbXG4gICAgICAgIHsgdHlwZTogbnVsbCwgICBwb3M6IG5ldyBQb2ludCgtMSwgIDApLCBzcmM6IDUsIGRlc3Q6IDIgfSxcbiAgICAgICAgeyB0eXBlOiAnZXZlbicsIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMCwgZGVzdDogMyB9LFxuICAgICAgICB7IHR5cGU6ICdldmVuJywgcG9zOiBuZXcgUG9pbnQoIDEsIC0xKSwgc3JjOiAxLCBkZXN0OiA0IH0sXG4gICAgICAgIHsgdHlwZTogJ29kZCcsICBwb3M6IG5ldyBQb2ludCgtMSwgLTEpLCBzcmM6IDAsIGRlc3Q6IDMgfSxcbiAgICAgICAgeyB0eXBlOiAnb2RkJywgIHBvczogbmV3IFBvaW50KCAwLCAtMSksIHNyYzogMSwgZGVzdDogNCB9XG4gICAgICBdXG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgQHRvcE1vZGUgPSBpZiBvcHRpb25zLmZsYXRUb3BwZWQgdGhlbiAnZmxhdCcgZWxzZSAncG9pbnRseSdcbiAgICBAb2Zmc2V0TGF5b3V0ID0gb3B0aW9ucy5vZmZzZXRMYXlvdXQgPyAnb2RkJ1xuICAgIHVubGVzcyBbJ29kZCcsICdldmVuJ10uaW5kZXhPZihAb2Zmc2V0TGF5b3V0KSA+PSAwXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIG9mZnNldExheW91dC4gQWxsb3dlZCB2YWx1ZXM6IG9kZCwgZXZlblwiXG5cbiAgaXNGbGF0VG9wcGVkICAgICAgOiA9PiBAdG9wTW9kZSBpcyAnZmxhdCdcbiAgaXNQb2ludGx5VG9wcGVkICAgOiA9PiBAdG9wTW9kZSBpcyAncG9pbnRseSdcbiAgaXNFdmVuT2Zmc2V0TGF5b3V0OiA9PiBAb2Zmc2V0TGF5b3V0IGlzICdldmVuJ1xuICBpc09kZE9mZnNldExheW91dCA6ID0+IEBvZmZzZXRMYXlvdXQgaXMgJ29kZCdcblxuICBidWlsZE1hdHJpeDogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICBbcm93cywgY29sc10gPSBbYXR0cmlidXRlcy5yb3dzLCBhdHRyaWJ1dGVzLmNvbHNdXG4gICAgQF9zYW1wbGUgPSBAX2NyZWF0ZVNhbXBsZUhleGFnb24gYXR0cmlidXRlcy5oZXhhZ29uXG4gICAgQG1hdHJpeCA9IG5ldyBBcnJheShyb3dzKVxuICAgIGZvciBqIGluIFswLi4ucm93c11cbiAgICAgIEBtYXRyaXhbal0gPSBuZXcgQXJyYXkoY29scylcbiAgICAgIEBtYXRyaXhbal1baV0gPSBAX2NyZWF0ZUhleGFnb25Jbk9mZnNldChpLCBqKSBmb3IgaSBpbiBbMC4uLmNvbHNdXG4gICAgQG1hdHJpeFxuXG4gIF9jcmVhdGVTYW1wbGVIZXhhZ29uOiAoaGV4QXR0cmlidXRlcykgPT5cbiAgICBvcHRpb25zID0geyBwb3NpdGlvbjoge3g6IDAsIHk6IDB9LCBmbGF0VG9wcGVkOiBAaXNGbGF0VG9wcGVkKCkgfVxuICAgIGlmIGhleEF0dHJpYnV0ZXMud2lkdGg/IG9yIGhleEF0dHJpYnV0ZXMuaGVpZ2h0P1xuICAgICAgSGV4YWdvbi5ieVNpemUgaGV4QXR0cmlidXRlcywgb3B0aW9uc1xuICAgIGVsc2UgaWYgaGV4QXR0cmlidXRlcy5yYWRpdXM/XG4gICAgICBIZXhhZ29uLmJ5UmFkaXVzIGhleEF0dHJpYnV0ZXMucmFkaXVzLCBvcHRpb25zXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBoZXhhZ29uIGRpcmVjdGl2ZS4gWW91IGhhdmUgdG8gcGFzcyB0aGUgcmFkaXVzIG9yIGF0IGxlYXN0IG9uZSBkaW1lbnNpb25cIlxuXG4gIF9jcmVhdGVIZXhhZ29uSW5PZmZzZXQ6IChpLCBqKSAtPlxuICAgIHBvc2l0aW9uID0gQF9leHBlY3RlZFBvc2l0aW9uSW5PZmZzZXQgaSwgalxuICAgIGhhbGZFZGdlcyA9IEBoYWxmRWRnZXNGcm9tTmVpZ2hib3Job29kIGksIGpcbiAgICBuZXcgSGV4YWdvbiBoYWxmRWRnZXMsIGZsYXRUb3BwZWQ6IEBpc0ZsYXRUb3BwZWQoKVxuXG4gIF9leHBlY3RlZFBvc2l0aW9uSW5PZmZzZXQ6IChpLCBqKSAtPlxuICAgIGlmIEBpc0ZsYXRUb3BwZWQoKVxuICAgICAgeSA9IGlmIEBfaXNTaGlmdGluZ1JlcXVpcmVkKGkpIHRoZW4gQF9zYW1wbGUudmVydGljZXMoKVswXS55IGVsc2UgMFxuICAgICAgbmV3IFBvaW50KDAsIHkpLnN1bVxuICAgICAgICB4OiByb3VuZChyb3VuZChAX3NhbXBsZS5zaXplKCkud2lkdGggKiAwLjc1KSAqIGkpXG4gICAgICAgIHk6IHJvdW5kKEBfc2FtcGxlLnNpemUoKS5oZWlnaHQgKiBqKVxuICAgIGVsc2VcbiAgICAgIHggPSBpZiBAX2lzU2hpZnRpbmdSZXF1aXJlZChqKSB0aGVuIEBfc2FtcGxlLnZlcnRpY2VzKClbMV0ueCBlbHNlIDBcbiAgICAgIG5ldyBQb2ludCh4LCAwKS5zdW1cbiAgICAgICAgeDogcm91bmQoQF9zYW1wbGUuc2l6ZSgpLndpZHRoICogaSlcbiAgICAgICAgeTogcm91bmQocm91bmQoQF9zYW1wbGUuc2l6ZSgpLmhlaWdodCAqIDAuNzUpICogailcblxuICBfaXNTaGlmdGluZ1JlcXVpcmVkOiAocmVsKSAtPlxuICAgIChAaXNFdmVuT2Zmc2V0TGF5b3V0KCkgYW5kIHJlbCAlIDIgaXMgMCkgb3IgKEBpc09kZE9mZnNldExheW91dCgpIGFuZCByZWwgJSAyIGlzbnQgMClcblxuICBfZWFjaEhhbGZFZGdlRnJvbVNoYXJlZE1hcHBpbmdzOiAoaSwgaiwgY2FsbGJhY2spIC0+XG4gICAgZm9yIG1hcHBpbmcgaW4gQHNoYXJlZEhleGFnb25FZGdlc1tAdG9wTW9kZV1bQG9mZnNldExheW91dF1cbiAgICAgIG5laWdoYm9yID0gQG1hdHJpeFtqICsgbWFwcGluZy5wb3MueV0/W2kgKyBtYXBwaW5nLnBvcy54XVxuICAgICAgcmVsID0gaWYgQGlzRmxhdFRvcHBlZCgpIHRoZW4gaSBlbHNlIGpcbiAgICAgIGNvbnRpbnVlIGlmIChtYXBwaW5nLnR5cGUgaXMgJ29kZCcgYW5kIHJlbCAlIDIgaXMgMCkgb3IgKG1hcHBpbmcudHlwZSBpcyAnZXZlbicgYW5kIHJlbCAlIDIgaXNudCAwKVxuICAgICAgY29udGludWUgdW5sZXNzIG5laWdoYm9yP1xuICAgICAgY2FsbGJhY2sobWFwcGluZy5kZXN0LCBuZWlnaGJvci5oYWxmRWRnZXNbbWFwcGluZy5zcmNdKVxuXG4gIGhhbGZFZGdlc0Zyb21OZWlnaGJvcmhvb2Q6IChpLCBqKSAtPlxuICAgIGhhbGZFZGdlcyA9IG5ldyBBcnJheSg2KVxuICAgIEBfZWFjaEhhbGZFZGdlRnJvbVNoYXJlZE1hcHBpbmdzIGksIGosIChoYWxmRWRnZUlkeCwgc3JjSGFsZkVkZ2UpIC0+XG4gICAgICBoYWxmRWRnZXNbaGFsZkVkZ2VJZHhdID89IHNyY0hhbGZFZGdlLm9wcG9zaXRlKClcbiAgICB2ZXJ0aWNlcyA9IG51bGwgIyBkbyBub3QgZmV0Y2ggc2hhcmVkIHZlcnRpY2VzIHVudGlsIHdlIHJlYWxseSBuZWVkIHRoZW1cbiAgICBmb3IgaGFsZkVkZ2UsaW5kZXggaW4gaGFsZkVkZ2VzIHdoZW4gbm90IGhhbGZFZGdlP1xuICAgICAgdmVydGljZXMgPz0gQHZlcnRpY2VzRnJvbU5laWdoYm9yaG9vZChpLCBqKVxuICAgICAgaGFsZkVkZ2VzW2luZGV4XSA9IG5ldyBIYWxmRWRnZSBuZXcgRWRnZSB2ZXJ0aWNlc1tpbmRleF0sIHZlcnRpY2VzW2luZGV4ICsgMV0gPyB2ZXJ0aWNlc1swXVxuICAgIGhhbGZFZGdlc1xuXG4gIHZlcnRpY2VzRnJvbU5laWdoYm9yaG9vZDogKGksIGopIC0+XG4gICAgdmVydGljZXMgPSBuZXcgQXJyYXkoNilcbiAgICBAX2VhY2hIYWxmRWRnZUZyb21TaGFyZWRNYXBwaW5ncyBpLCBqLCAoaGFsZkVkZ2VJZHgsIHNyY0hhbGZFZGdlKSAtPlxuICAgICAgdmVydGljZXNbaGFsZkVkZ2VJZHhdID89IHNyY0hhbGZFZGdlLnZiKClcbiAgICAgIHZlcnRpY2VzWyhoYWxmRWRnZUlkeCArIDEpICUgdmVydGljZXMubGVuZ3RoXSA/PSBzcmNIYWxmRWRnZS52YSgpXG4gICAgZm9yIHYsIGluZGV4IGluIEBfc2FtcGxlLnZlcnRpY2VzKCkgd2hlbiBub3QgdmVydGljZXNbaW5kZXhdP1xuICAgICAgdmVydGljZXNbaW5kZXhdID0gbmV3IFZlcnRleCB2LnN1bSBAX2V4cGVjdGVkUG9zaXRpb25Jbk9mZnNldChpLCBqKVxuICAgIHZlcnRpY2VzXG5cbiMgTWFwXG4jXG4jIEBleGFtcGxlXG4jICAgbmV3IE1hcCBjb2xzOiAxMCwgcm93czogMTAsIGhleGFnb246IHsgd2lkdGg6IDEwIH1cbiMgQGV4YW1wbGVcbiMgICBuZXcgTWFwIGNvbHM6IDEwLCByb3dzOiAxMCwgaGV4YWdvbjogeyByYWRpdXM6IDEwIH1cbiMgQGV4YW1wbGVcbiMgICBuZXcgTWFwIGNvbHM6IDEwLCByb3dzOiAxMCwgd2lkdGg6IDUwMCwgaGVpZ2h0OiA1MDBcbmNsYXNzIE1hcFxuICBjb25zdHJ1Y3RvcjogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICBAZiA9IGZhY3RvcnkgICAgICA9IG5ldyBIZXhhZ29uTWF0cml4RmFjdG9yeSBhdHRyaWJ1dGVzXG4gICAgZm9yIG1ldGggaW4gWydpc0ZsYXRUb3BwZWQnLCAnaXNQb2ludGx5VG9wcGVkJywgJ2lzRXZlbk9mZnNldExheW91dCcsICdpc09kZE9mZnNldExheW91dCddXG4gICAgICBAW21ldGhdID0gZmFjdG9yeVttZXRoXVxuICAgIEBtYXRyaXggPSBmYWN0b3J5LmJ1aWxkTWF0cml4XG4gICAgICByb3dzOiBhdHRyaWJ1dGVzLnJvd3NcbiAgICAgIGNvbHM6IGF0dHJpYnV0ZXMuY29sc1xuICAgICAgaGV4YWdvbjogYXR0cmlidXRlcy5oZXhhZ29uID8gQF9kZXRlY3RlZEhleGFnb25TaXplKGF0dHJpYnV0ZXMpXG5cbiAgaGV4YWdvbnM6IC0+XG4gICAgcmV0dXJuIEBfaGV4YWdvbnMgaWYgQF9oZXhhZ29ucz9cbiAgICBbcm93cywgY29sc10gPSBbQG1hdHJpeC5sZW5ndGgsIEBtYXRyaXhbMF0ubGVuZ3RoXVxuICAgIEBfaGV4YWdvbnMgPSBuZXcgQXJyYXkocm93cyAqIGNvbHMpXG4gICAgZm9yIHJvdyxqIGluIEBtYXRyaXhcbiAgICAgIEBfaGV4YWdvbnNbaiAqIGNvbHMgKyBpXSA9IGNlbGwgZm9yIGNlbGwsaSBpbiByb3dcbiAgICBAX2hleGFnb25zXG4gIGZpcnN0SGV4YWdvbjogLT4gQGhleGFnb25zKClbMF1cbiAgbGFzdEhleGFnb246IC0+IEBoZXhhZ29ucygpW0BoZXhhZ29ucygpLmxlbmd0aCAtIDFdXG5cbiAgc2l6ZTogLT5cbiAgICBsYXN0SGV4UG9zID0gQGxhc3RIZXhhZ29uKCkucG9zaXRpb24oKVxuICAgIEBsYXN0SGV4YWdvbigpLnNpemUoKS5zdW0gd2lkdGg6IGxhc3RIZXhQb3MueCwgaGVpZ2h0OiBsYXN0SGV4UG9zLnlcblxuICBhdDogKGksIGopIC0+IEBtYXRyaXhbal0/W2ldXG5cbiAgX2RldGVjdGVkSGV4YWdvblNpemU6IChhdHRyaWJ1dGVzKSA9PlxuICAgIHRocm93IG5ldyBFcnJvciBcIkNhbm5vdCBkZXRlY3QgY29ycmVjdCBoZXhhZ29uIHNpemVcIiB1bmxlc3MgYXR0cmlidXRlcy53aWR0aD8gb3IgYXR0cmlidXRlcy5oZWlnaHQ/XG4gICAgW3Jvd3MsIGNvbHMsIHdpZHRoLCBoZWlnaHRdID0gW2F0dHJpYnV0ZXMucm93cywgYXR0cmlidXRlcy5jb2xzLCBudWxsLCBudWxsXVxuICAgIGlmIGF0dHJpYnV0ZXMud2lkdGg/XG4gICAgICBkaXZpZGVyID0gaWYgQGlzRmxhdFRvcHBlZCgpIHRoZW4gMSAvICgoY29scyAtIDEpICogMC43NSArIDEpIGVsc2UgMiAvICgyICogY29scyArIDEpXG4gICAgICB3aWR0aCA9IHJvdW5kIGF0dHJpYnV0ZXMud2lkdGggKiBkaXZpZGVyXG4gICAgaWYgYXR0cmlidXRlcy5oZWlnaHQ/XG4gICAgICBkaXZpZGVyID0gaWYgQGlzRmxhdFRvcHBlZCgpIHRoZW4gMiAvICgyICogcm93cyArIDEpIGVsc2UgMSAvICgocm93cyAtIDEpICogMC43NSArIDEpXG4gICAgICBoZWlnaHQgPSByb3VuZCBhdHRyaWJ1dGVzLmhlaWdodCAqIGRpdmlkZXJcbiAgICB7IHdpZHRoLCBoZWlnaHQgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFxuIiwiUG9pbnQgICAgPSByZXF1aXJlICcuL3BvaW50LmNvZmZlZSdcblNpemUgICAgID0gcmVxdWlyZSAnLi9zaXplLmNvZmZlZSdcblZlcnRleCAgID0gcmVxdWlyZSAnLi92ZXJ0ZXguY29mZmVlJ1xuRWRnZSAgICAgPSByZXF1aXJlICcuL2VkZ2UuY29mZmVlJ1xuSGFsZkVkZ2UgPSByZXF1aXJlICcuL2hhbGZfZWRnZS5jb2ZmZWUnXG5VdGlsICAgICA9IHJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0geyBQb2ludCwgU2l6ZSwgRWRnZSwgVmVydGV4LCBIYWxmRWRnZSwgVXRpbCB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIE9mZnNldEN1cnNvcjogcmVxdWlyZSgnLi9vZmZzZXRfY3Vyc29yLmNvZmZlZScpXG4gIEF4aWFsQ3Vyc29yIDogcmVxdWlyZSgnLi9heGlhbF9jdXJzb3IuY29mZmVlJylcbiIsImNsYXNzIEVkZ2VcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHZlcnRpY2VzID0gaWYgYXJndW1lbnRzLmxlbmd0aCA+IDEgdGhlbiAoYSBmb3IgYSBpbiBhcmd1bWVudHMpIGVsc2UgYXJndW1lbnRzWzBdXG4gICAgdW5sZXNzIEB2ZXJ0aWNlcz8ubGVuZ3RoIGlzIDJcbiAgICAgIHRocm93IG5ldyBFcnJvciAnWW91IGhhdmUgdG8gcHJvdmlkZSAyIHZlcnRpY2VzJ1xuICAgIHZlcnRleC5wdXNoRWRnZSBAIGZvciB2ZXJ0ZXggaW4gQHZlcnRpY2VzXG4gICAgQGhhbGZFZGdlcyA9IFtdXG5cbiAgaGV4YWdvbnM6IC0+IChoYWxmRWRnZS5oZXhhZ29uIGZvciBoYWxmRWRnZSBpbiBAaGFsZkVkZ2VzKVxuXG4gIGlzQ29udGFpbmVkSW46IChoZXhhZ29uKSAtPlxuICAgIHJldHVybiB0cnVlIGZvciBoZXggaW4gQGhleGFnb25zKCkgd2hlbiBoZXguaXNFcXVhbCBoZXhhZ29uXG4gICAgZmFsc2VcblxuICBpc0VxdWFsOiAob3RoZXIpID0+XG4gICAgZm9yIHZlcnRleCwgaW5kZXggaW4gQHZlcnRpY2VzXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHZlcnRleC5pc0VxdWFsKG90aGVyLnZlcnRpY2VzW2luZGV4XSlcbiAgICB0cnVlXG5cbiAgdG9QcmltaXRpdmU6ID0+IHsgdmVydGljZXM6ICh2LnRvUHJpbWl0aXZlKCkgZm9yIHYgaW4gQHZlcnRpY2VzKSB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX17I3tAdmVydGljZXNbMF0udG9TdHJpbmcoKX0sICN7QHZlcnRpY2VzWzFdLnRvU3RyaW5nKCl9fVwiXG5cbm1vZHVsZS5leHBvcnRzID0gRWRnZVxuIiwiY2xhc3MgSGFsZkVkZ2VcbiAgY29uc3RydWN0b3I6IChAZWRnZSwgQGRpcmVjdGlvbiA9IDEpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yICdZb3UgaGF2ZSB0byBwcm92aWRlIGFuIGVkZ2UnIHVubGVzcyBAZWRnZT9cbiAgICBpZiBAZGlyZWN0aW9uIGlzbnQgMSBhbmQgQGRpcmVjdGlvbiBpc250IC0xXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgJ0RpcmVjdGlvbiBtdXN0IGJlIDEgb3IgLTEnXG4gICAgQGhleGFnb24gPSBudWxsXG4gICAgQGVkZ2UuaGFsZkVkZ2VzLnB1c2ggQFxuXG4gIHZlcnRpY2VzOiAtPlxuICAgIGlmIEBkaXJlY3Rpb24gaXMgMVxuICAgICAgQGVkZ2UudmVydGljZXNcbiAgICBlbHNlXG4gICAgICBAZWRnZS52ZXJ0aWNlcy5zbGljZSgwKS5yZXZlcnNlKClcblxuICB2YTogLT4gQHZlcnRpY2VzKClbMF1cbiAgdmI6IC0+IEB2ZXJ0aWNlcygpWzFdXG5cbiAgb3RoZXJIYWxmRWRnZTogLT5cbiAgICByZXR1cm4gaGFsZkVkZ2UgZm9yIGhhbGZFZGdlIGluIEBlZGdlLmhhbGZFZGdlcyB3aGVuIGhhbGZFZGdlIGlzbnQgQFxuXG4gIGlzRXF1YWw6IChvdGhlcikgPT4gQHZhKCkuaXNFcXVhbChvdGhlci52YSgpKSBhbmQgQHZiKCkuaXNFcXVhbChvdGhlci52YigpKVxuXG4gIHRvUHJpbWl0aXZlOiA9PiB7IHZhOiBAdmEoKS50b1ByaW1pdGl2ZSgpLCB2YjogQHZiKCkudG9QcmltaXRpdmUoKSB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX17I3tAdmEoKS50b1N0cmluZygpfSwgI3tAdmIoKS50b1N0cmluZygpfX1cIlxuXG4gIG9wcG9zaXRlOiA9PiBuZXcgSGFsZkVkZ2UoQGVkZ2UsIGlmIEBkaXJlY3Rpb24gaXMgMSB0aGVuIC0xIGVsc2UgMSlcblxubW9kdWxlLmV4cG9ydHMgPSBIYWxmRWRnZVxuIiwicHJlY2lzaW9uID0gMVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHByZWNpc2lvbjogKHZhbHVlKSAtPlxuICAgIGlmIHZhbHVlP1xuICAgICAgcHJlY2lzaW9uID0gdmFsdWVcbiAgICBlbHNlXG4gICAgICBwcmVjaXNpb25cblxuICByb3VuZDogKHZhbHVlKSAtPlxuICAgIGRpdmlkZXIgPSBNYXRoLnBvdyAxMCwgcHJlY2lzaW9uXG4gICAgTWF0aC5yb3VuZCh2YWx1ZSAqIGRpdmlkZXIpIC8gZGl2aWRlclxuIiwicm91bmQgPSByZXF1aXJlKCcuL3V0aWwuY29mZmVlJykucm91bmRcblxuY2xhc3MgUG9pbnRcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgYXR0cmlidXRlcyA9IEBfZXh0cmFjdEF0dHJpYnV0ZXMoYXJndW1lbnRzKVxuICAgIEB4ID0gYXR0cmlidXRlcy54ID8gMFxuICAgIEB5ID0gYXR0cmlidXRlcy55ID8gMFxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT4gQHggaXMgb3RoZXIueCBhbmQgQHkgaXMgb3RoZXIueVxuXG4gIHRvUHJpbWl0aXZlOiA9PiB7IHg6IEB4LCB5OiBAeSB9XG5cbiAgdG9TdHJpbmc6ID0+IFwiI3tAY29uc3RydWN0b3IubmFtZX0oI3tAeH0sICN7QHl9KVwiXG5cbiAgc3VtOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBAX2V4dHJhY3RBdHRyaWJ1dGVzKGFyZ3VtZW50cylcbiAgICBuZXcgQGNvbnN0cnVjdG9yIHJvdW5kKEB4ICsgYXR0cmlidXRlcy54KSwgcm91bmQoQHkgKyBhdHRyaWJ1dGVzLnkpXG5cbiAgc3ViOiAtPlxuICAgIGF0dHJpYnV0ZXMgPSBAX2V4dHJhY3RBdHRyaWJ1dGVzKGFyZ3VtZW50cylcbiAgICBuZXcgQGNvbnN0cnVjdG9yIHJvdW5kKEB4IC0gYXR0cmlidXRlcy54KSwgcm91bmQoQHkgLSBhdHRyaWJ1dGVzLnkpXG5cbiAgX2V4dHJhY3RBdHRyaWJ1dGVzOiAoYXJncykgLT5cbiAgICBhdHRyaWJ1dGVzID0gYXJnc1swXSA/IHt9XG4gICAgaWYgdHlwZW9mKGF0dHJpYnV0ZXMpIGlzICdudW1iZXInIHx8IGFyZ3MubGVuZ3RoID4gMVxuICAgICAgYXR0cmlidXRlcyA9IHsgeDogYXJnc1swXSA/IDAsIHk6IGFyZ3NbMV0gPyAwIH1cbiAgICBhdHRyaWJ1dGVzXG5cbm1vZHVsZS5leHBvcnRzID0gUG9pbnRcbiIsInJvdW5kID0gcmVxdWlyZSgnLi91dGlsLmNvZmZlZScpLnJvdW5kXG5cbmNsYXNzIFNpemVcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1swXSA/IHt9XG4gICAgaWYgdHlwZW9mKGF0dHJpYnV0ZXMpIGlzICdudW1iZXInIHx8IGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICBhdHRyaWJ1dGVzID0geyB3aWR0aDogYXJndW1lbnRzWzBdLCBoZWlnaHQ6IGFyZ3VtZW50c1sxXSB9XG4gICAgQHdpZHRoICA9IGF0dHJpYnV0ZXMud2lkdGggPyAwXG4gICAgQGhlaWdodCA9IGF0dHJpYnV0ZXMuaGVpZ2h0ID8gMFxuXG4gIHN1bTogLT5cbiAgICBhdHRyaWJ1dGVzID0gQF9leHRyYWN0QXR0cmlidXRlcyhhcmd1bWVudHMpXG4gICAgbmV3IEBjb25zdHJ1Y3RvciByb3VuZChAd2lkdGggKyBhdHRyaWJ1dGVzLndpZHRoKSwgcm91bmQoQGhlaWdodCArIGF0dHJpYnV0ZXMuaGVpZ2h0KVxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT4gQHdpZHRoIGlzIG90aGVyLndpZHRoICYmIEBoZWlnaHQgaXMgb3RoZXIuaGVpZ2h0XG5cbiAgdG9QcmltaXRpdmU6ID0+IHsgd2lkdGg6IEB3aWR0aCwgaGVpZ2h0OiBAaGVpZ2h0IH1cblxuICB0b1N0cmluZzogPT4gXCIje0Bjb25zdHJ1Y3Rvci5uYW1lfSAoI3tAd2lkdGh9LCAje0BoZWlnaHR9KVwiXG5cbiAgX2V4dHJhY3RBdHRyaWJ1dGVzOiAoYXJncykgLT5cbiAgICBhdHRyaWJ1dGVzID0gYXJnc1swXSA/IHt9XG4gICAgaWYgdHlwZW9mKGF0dHJpYnV0ZXMpIGlzICdudW1iZXInIHx8IGFyZ3MubGVuZ3RoID4gMVxuICAgICAgYXR0cmlidXRlcyA9IHsgd2lkdGg6IGFyZ3NbMF0gPyAwLCBoZWlnaHQ6IGFyZ3NbMV0gPyAwIH1cbiAgICBhdHRyaWJ1dGVzXG5cbm1vZHVsZS5leHBvcnRzID0gU2l6ZVxuIiwiUG9pbnQgPSByZXF1aXJlICcuL3BvaW50LmNvZmZlZSdcblxuY2xhc3MgVmVydGV4IGV4dGVuZHMgUG9pbnRcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAZWRnZXMgPSBbXVxuXG4gIHB1c2hFZGdlOiAoZWRnZSkgLT5cbiAgICBAZWRnZXMucHVzaCBlZGdlXG5cbm1vZHVsZS5leHBvcnRzID0gVmVydGV4XG4iLCJQb2ludCA9IHJlcXVpcmUgJy4uL2NvcmUvcG9pbnQuY29mZmVlJ1xuXG5jbGFzcyBBeGlhbEN1cnNvclxuICBjb25zdHJ1Y3RvcjogKEBtYXAsIGFyZ3MuLi4pIC0+XG4gICAgQG1vdmVUbyBAX2V4dHJhY3RQb2ludChhcmdzKVxuXG4gIG1vdmVUbzogLT5cbiAgICBwb2ludCA9IEBfY2VudGVyUG9pbnQoKS5zdW0gQF9leHRyYWN0UG9pbnQoYXJndW1lbnRzKVxuICAgIEBoZXhhZ29uID0gQG1hcC5tYXRyaXhbcG9pbnQueV0/W3BvaW50LnhdXG5cbiAgX2NlbnRlclBvaW50OiAtPlxuICAgIHJldHVybiBAX2NlbnRlciBpZiBAX2NlbnRlcj9cbiAgICBjZW50ZXJZID0gTWF0aC5yb3VuZCAoQG1hcC5tYXRyaXgubGVuZ3RoIC0gMSkgLyAyXG4gICAgQF9jZW50ZXIgPSBuZXcgUG9pbnRcbiAgICAgIHg6IE1hdGgucm91bmQgKEBtYXAubWF0cml4W2NlbnRlclldLmxlbmd0aCAtIDEpIC8gMlxuICAgICAgeTogY2VudGVyWVxuXG4gIF9leHRyYWN0UG9pbnQ6IChhcmdzKSAtPlxuICAgIGlmIGFyZ3MubGVuZ3RoIGlzIDJcbiAgICAgIG5ldyBQb2ludCBhcmdzWzBdLCBhcmdzWzFdXG4gICAgZWxzZVxuICAgICAgb2JqID0gYXJnc1swXVxuICAgICAgaWYgb2JqLng/IG9yIG9iai55P1xuICAgICAgICBvYmpcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQmFkIGFyZyBmb3IgQGF0LiBZb3UgY2FuIGNhbGwgLmF0KHgsIHkpLCAuYXQoeDogeCwgeTogeSlcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aWFsQ3Vyc29yXG4iLCJQb2ludCA9IHJlcXVpcmUgJy4uL2NvcmUvcG9pbnQuY29mZmVlJ1xuXG5jbGFzcyBPZmZzZXRDdXJzb3JcbiAgY29uc3RydWN0b3I6IChAbWFwLCBhcmdzLi4uKSAtPlxuICAgIEBtb3ZlVG8gQF9leHRyYWN0T2Zmc2V0KGFyZ3MpXG5cbiAgbW92ZVRvOiAtPlxuICAgIG9mZnNldCA9IEBfZXh0cmFjdE9mZnNldChhcmd1bWVudHMpXG4gICAgQGhleGFnb24gPSBAbWFwLm1hdHJpeFtvZmZzZXQueV0/W29mZnNldC54XVxuXG4gIF9leHRyYWN0T2Zmc2V0OiAoYXJncykgLT5cbiAgICBpZiBhcmdzLmxlbmd0aCBpcyAyXG4gICAgICBuZXcgUG9pbnQgYXJnc1swXSwgYXJnc1sxXVxuICAgIGVsc2VcbiAgICAgIG9iaiA9IGFyZ3NbMF1cbiAgICAgIGlmIG9iai54PyBvciBvYmoueT9cbiAgICAgICAgb2JqXG4gICAgICBlbHNlIGlmIG9iai5pPyBvciBvYmouaj9cbiAgICAgICAgbmV3IFBvaW50IG9iai5pLCBvYmoualxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJCYWQgYXJnIGZvciBAYXQuIFlvdSBjYW4gY2FsbCAuYXQoeCwgeSksIC5hdCh4OiB4LCB5OiB5KSBvciAuYXQoaTogeCwgajogeSlcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IE9mZnNldEN1cnNvclxuIl19
;