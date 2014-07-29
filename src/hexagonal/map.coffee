Hexagon  = require './hexagon.coffee'
Point    = require './core/point.coffee'
Edge     = require './core/edge.coffee'
HalfEdge = require './core/half_edge.coffee'
Vertex   = require './core/vertex.coffee'
Size     = require './core/size.coffee'

# Map
#
# @example
#   new Map cols: 10, rows: 10, hexagon: { width: 10 }
# @example
#   new Map cols: 10, rows: 10, hexagon: { radius: 10 }
# @example
#   new Map cols: 10, rows: 10, width: 500, height: 500
class Map
  sharedHexagonEdges:
    flat:
      even: [
        [ null,       {x:  0, y: -1}, 1: 4 ],
        [ 'even-col', {x: -1, y:  0}, 0: 3 ],
        [ 'odd-col',  {x: -1, y:  0}, 5: 2 ],
        [ 'odd-col',  {x: -1, y: -1}, 0: 3 ],
        [ 'odd-col',  {x:  1, y: -1}, 2: 5 ]
      ]
      odd: [
        [ null,       {x:  0, y: -1}, 1: 4 ],
        [ 'even-col', {x: -1, y:  0}, 5: 2 ],
        [ 'even-col', {x: -1, y: -1}, 0: 3 ],
        [ 'even-col', {x:  1, y: -1}, 2: 5 ],
        [ 'odd-col',  {x: -1, y:  0}, 0: 3 ]
      ]
    pointly:
      odd: [
        [ null,       {x: -1, y:  0}, 5: 2 ],
        [ 'even-row', {x: -1, y: -1}, 0: 3 ],
        [ 'even-row', {x:  0, y: -1}, 1: 4 ],
        [ 'odd-row',  {x:  0, y: -1}, 0: 3 ],
        [ 'odd-row',  {x:  1, y: -1}, 1: 4 ]
      ]
      even: [
        [ null,       {x: -1, y:  0}, 5: 2 ],
        [ 'even-row', {x:  0, y: -1}, 0: 3 ],
        [ 'even-row', {x:  1, y: -1}, 1: 4 ],
        [ 'odd-row',  {x: -1, y: -1}, 0: 3 ],
        [ 'odd-row',  {x:  0, y: -1}, 1: 4 ]
      ]

  constructor: (attributes = {}) ->
    @rows          = attributes.rows
    @cols          = attributes.cols
    @topMode       = attributes.flatTopped && 'flat' || 'pointly'
    @offsetLayout  = attributes.offsetLayout ? 'odd'
    @precision     = attributes.precision ? 1
    @_sample       = @_createSampleHexagon attributes.hexagon ? @_calcHexagonSize(attributes)
    @_createHexagons()

  size: ->
    lastHex = @hexagons[@hexagons.length - 1]
    [lastHexPos, lastHexSize] = [lastHex.position(), lastHex.size()]
    new Size lastHexPos.x + lastHexSize.width, lastHexPos.y + lastHexSize.height

  at: (row, col) -> @hexagons[@_indexInOffset row, col]

  isFlatTopped: => @topMode is 'flat'

  isPointlyTopped: => @topMode is 'pointly'

  isEvenOffsetLayout: => @offsetLayout is 'even'

  isOddOffsetLayout: => @offsetLayout is 'odd'

  _calcHexagonSize: (attributes) =>
    if attributes.width? or attributes.height?
      if @isFlatTopped()
        {
          width : if attributes.width?  then (2 * attributes.width) / (2 * @cols + 1)
          height: if attributes.height? then attributes.height / @rows
        }
      else
        {
          width : if attributes.width?  then attributes.width / @cols
          height: if attributes.height? then (2 * attributes.height) / (2 * @rows + 1)
        }
    else
      throw new Error "Cannot detect the correct size of the hexagon!"

  _createSampleHexagon: (attributes) =>
    options =
      position  : { x: 0, y: 0 }
      precision : @precision
      flatTopped: @isFlatTopped()
    if attributes.width? or attributes.height?
      Hexagon.bySize attributes, options
    else if attributes.radius?
      Hexagon.byRadius attributes.radius, options
    else
      givenKeys = (key for key of attributes).join ', '
      throw new Error "Unknown Hexagon properties: #{givenKeys}"

  _round: (value) ->
    divider = Math.pow 10, @precision
    Math.round(value * divider) / divider

  _expectedPositionInOffset: (row, col) ->
    if @isFlatTopped()
      yMod = if @_isShiftingRequiredInOffset(col) then @_sample.vertices()[0].y else 0
      new Point
        x: @_round(@_round(@_sample.size().width * 0.75) * col)
        y: @_round(@_round(@_sample.size().height * row) + yMod)
    else
      xMod = if @_isShiftingRequiredInOffset(row) then @_sample.vertices()[1].x else 0
      new Point
        x: @_round(xMod + @_round(@_sample.size().width * col))
        y: @_round(@_round(@_sample.size().height * 0.75) * row)

  _isShiftingRequiredInOffset: (rel) ->
    (@isEvenOffsetLayout() and rel % 2 is 0) or (@isOddOffsetLayout() and rel % 2 isnt 0)

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
    new Hexagon halfEdges, precision: @precision, flatTopped: @isFlatTopped()

  _sharedVerticesFromNeighborsOfOffset: (row, col, vertices) ->
    for sharedVertex in @sharedHexagonEdges[@topMode][@offsetLayout]
      [type, neighbor, mapping] = sharedVertex
      continue if type is 'odd-row' and row % 2 is 0
      continue if type is 'even-row' and row % 2 isnt 0
      continue if type is 'odd-col' and col % 2 is 0
      continue if type is 'even-col' and col % 2 isnt 0
      [rRow, rCol] = [row + neighbor.y, col + neighbor.x]
      @_sharedVerticesFromNeighbor vertices, @at(rRow, rCol), mapping

  _sharedVerticesFromNeighbor: (vertices, neighbor, mapping) ->
    return unless neighbor?
    neighborEdges = neighbor.halfEdges
    for source, dest of mapping
      halfEdge = neighbor.halfEdges[~~source]
      vertices[dest] ?= halfEdge.vb()
      dest = -1 if dest + 1 >= vertices.length
      vertices[dest + 1] ?= halfEdge.va()

  _createMissingVerticesInOffset: (row, col, vertices) ->
    position = @_expectedPositionInOffset row, col
    for v, index in @_sample.vertices()
      vertices[index] ?= new Vertex
        x: @_round(v.x + position.x)
        y: @_round(v.y + position.y)

  _sharedEdgesFromNeighborsInOffset: (row, col, halfEdges) ->
    for sharedEdge in @sharedHexagonEdges[@topMode][@offsetLayout]
      [type, neighbor, mapping] = sharedEdge
      continue if type is 'odd-row' and row % 2 is 0
      continue if type is 'even-row' and row % 2 isnt 0
      continue if type is 'odd-col' and col % 2 is 0
      continue if type is 'even-col' and col % 2 isnt 0
      [rRow, rCol] = [row + neighbor.y, col + neighbor.x]
      @_sharedEdgesFromNeighbor halfEdges, @at(rRow, rCol), mapping

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

  _createHexagons: ->
    @hexagons = new Array(@rows * @cols)
    for row in [0...@rows]
      for col in [0...@cols]
        @hexagons[@_indexInOffset(row, col)] = @_createHexagonInOffset(row, col)

module.exports = Map
