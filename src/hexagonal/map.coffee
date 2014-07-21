Hexagon  = require './hexagon.coffee'
Point    = require './core/point.coffee'
Edge     = require './core/edge.coffee'
HalfEdge = require './core/half_edge.coffee'
Vertex   = require './core/vertex.coffee'

# Map
#
# @example
#   new Map cols: 10, rows: 10, hexagon: { width: 10 }
class Map
  constructor: (attributes = {}) ->
    [@rows, @cols] = [attributes.rows, attributes.cols]
    @precision = attributes.precision ? 1
    @_sample = Hexagon.bySize attributes.hexagon,
      position : { x: 0, y: 0 }
      precision: @precision
    @_hexagons = new Array(@rows * @cols)
    for row in [0...@rows]
      for col in [0...@cols]
        @_hexagons[@_indexInOffset(row, col)] = @_createHexagonInOffset(row, col)
    delete @_sample
    
  hexagons: -> @_hexagons

  at: (row, col) -> @_hexagons[@_indexInOffset row, col]

  _round: (value) ->
    divider = Math.pow 10, @precision
    Math.round(value * divider) / divider

  _expectedPositionInOffset: (row, col) ->
    xMod = if row % 2 isnt 0 then @_sample.vertices()[1].x else 0
    new Point
      x: @_round(xMod + @_round(@_sample.size().width * col))
      y: @_round(@_round(@_sample.size().height * 0.75) * row)

  _indexInOffset: (row, col) ->
    return null if col < 0 or row < 0 or col >= @cols or row >= @rows
    row * @cols + col

  _verticesForOffset: (row, col) ->
    vertices = new Array 6
    @_sharedVerticesFromNeighborsOfOffset(row, col, vertices)
    @_createMissingVerticesInOffset(row, col, vertices)
    vertices

  _createHexagonInOffset: (row, col) ->
    position = @_expectedPositionInOffset row, col
    halfEdges = new Array 6
    @_sharedEdgesFromNeighborsInOffset(row, col, halfEdges)
    @_createMissingHalfEdgesInOffset(row, col, halfEdges)
    new Hexagon halfEdges, precision: @precision

  _sharedVerticesFromNeighborsOfOffset: (row, col, vertices) ->
    @_sharedVerticesFromNeighbor vertices, @at(row, col - 1), 0: 2, 5: 3
    @_sharedVerticesFromNeighbor vertices, @at(row, col + 1), 2: 0, 3: 5
    if row % 2 is 0
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col - 1), 1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col), 2: 4, 1: 5
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col - 1), 3: 1, 4: 0
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col), 4: 2, 5: 1
    else
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col), 1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col + 1), 2: 4, 1: 5
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col), 3: 1, 4: 0
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col + 1), 4: 2, 5: 1

  _sharedVerticesFromNeighbor: (vertices, neighbor, mapping) ->
    return unless neighbor?
    neighborVertices = neighbor.vertices()
    for source, dest of mapping
      vertices[dest] ?= neighborVertices[~~source]

  _createMissingVerticesInOffset: (row, col, vertices) ->
    position = @_expectedPositionInOffset row, col
    for v, index in @_sample.vertices()
      vertices[index] ?= new Vertex
        x: @_round(v.x + position.x)
        y: @_round(v.y + position.y)

  _sharedEdgesFromNeighborsInOffset: (row, col, halfEdges) ->
    @_sharedEdgesFromNeighbor(halfEdges, @at(row, col - 1), 5: 2)
    @_sharedEdgesFromNeighbor(halfEdges, @at(row, col + 1), 2: 5)
    if row % 2 is 0
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col - 1), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col - 1), 3: 0)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 1: 4)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col), 4: 1)
    else
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col), 3: 0)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col + 1), 1: 4)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col + 1), 4: 1)

  _sharedEdgesFromNeighbor: (halfEdges, hexagon, mapping) ->
    return unless hexagon?
    neighborHalfEdges = hexagon.halfEdges
    for source, dest of mapping
      halfEdges[dest] ?= neighborHalfEdges[~~source].opposite()

  _createMissingHalfEdgesInOffset: (row, col, halfEdges) ->
    vertices = @_verticesForOffset(row, col)
    for vertex, index in vertices when not halfEdges[index]?
      nextVertex = vertices[index + 1] ? vertices[0]
      halfEdges[index] = new HalfEdge(new Edge vertex, nextVertex)

module.exports = Map
