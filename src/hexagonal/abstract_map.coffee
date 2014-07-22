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
    @_sample = @_createSampleHexagon attributes.hexagon
    @_hexagons = new Array(@rows * @cols)
    for row in [0...@rows]
      for col in [0...@cols]
        @_hexagons[@_indexInOffset(row, col)] = @_createHexagonInOffset(row, col)

  hexagons: -> @_hexagons

  at: (row, col) -> @_hexagons[@_indexInOffset row, col]

  _createSampleHexagon: (attributes) =>
    throw new Error 'method not implemented'

  _round: (value) ->
    divider = Math.pow 10, @precision
    Math.round(value * divider) / divider

  _expectedPositionInOffset: (row, col) ->
    throw new Error 'method not implemented'

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
    @_newHexagon halfEdges

  _sharedVerticesFromNeighborsOfOffset: (row, col, vertices) ->
    throw new Error 'method not implemented'

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
    throw new Error 'method not implemented'

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

  _newHexagon: (halfEdges) ->
    throw new Error 'method not implemented'

module.exports = Map
