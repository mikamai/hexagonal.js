Hexagon  = require './hexagon.coffee'
Point    = require './core/point.coffee'
Edge     = require './core/edge.coffee'
HalfEdge = require './core/half_edge.coffee'
Vertex   = require './core/vertex.coffee'
Size     = require './core/size.coffee'

round    = require('./core/util.coffee').round

class HexagonMatrixFactory
  sharedHexagonEdges:
    flat:
      even: [
        { type: null,   pos: {x:  0, y: -1}, src: 1, dest: 4 },
        { type: 'even', pos: {x: -1, y:  0}, src: 0, dest: 3 },
        { type: 'odd',  pos: {x: -1, y:  0}, src: 5, dest: 2 },
        { type: 'odd',  pos: {x: -1, y: -1}, src: 0, dest: 3 },
        { type: 'odd',  pos: {x:  1, y: -1}, src: 2, dest: 5 }
      ]
      odd: [
        { type: null,   pos: {x:  0, y: -1}, src: 1, dest: 4 },
        { type: 'even', pos: {x: -1, y:  0}, src: 5, dest: 2 },
        { type: 'even', pos: {x: -1, y: -1}, src: 0, dest: 3 },
        { type: 'even', pos: {x:  1, y: -1}, src: 2, dest: 5 },
        { type: 'odd',  pos: {x: -1, y:  0}, src: 0, dest: 3 }
      ]
    pointly:
      odd: [
        { type: null,   pos: {x: -1, y:  0}, src: 5, dest: 2 },
        { type: 'even', pos: {x: -1, y: -1}, src: 0, dest: 3 },
        { type: 'even', pos: {x:  0, y: -1}, src: 1, dest: 4 },
        { type: 'odd',  pos: {x:  0, y: -1}, src: 0, dest: 3 },
        { type: 'odd',  pos: {x:  1, y: -1}, src: 1, dest: 4 }
      ]
      even: [
        { type: null,   pos: {x: -1, y:  0}, src: 5, dest: 2 },
        { type: 'even', pos: {x:  0, y: -1}, src: 0, dest: 3 },
        { type: 'even', pos: {x:  1, y: -1}, src: 1, dest: 4 },
        { type: 'odd',  pos: {x: -1, y: -1}, src: 0, dest: 3 },
        { type: 'odd',  pos: {x:  0, y: -1}, src: 1, dest: 4 }
      ]

  constructor: (options = {}) ->
    @topMode      = options.topMode ? 'pointly'
    unless ['flat', 'pointly'].indexOf(@topMode) >= 0
      throw new Error "Unknown topMode. Allowed values: pointly, flat"
    @offsetLayout = options.offsetLayout ? 'odd'
    unless ['odd', 'even'].indexOf(@offsetLayout) >= 0
      throw new Error "Unknown offsetLayout. Allowed values: odd, even"

  at: (i, j) -> @hexagons[@_indexInOffset i, j]

  isFlatTopped      : => @topMode is 'flat'
  isPointlyTopped   : => @topMode is 'pointly'
  isEvenOffsetLayout: => @offsetLayout is 'even'
  isOddOffsetLayout : => @offsetLayout is 'odd'

  buildMatrix: (attributes = {}) ->
    [@rows, @cols] = [attributes.rows, attributes.cols]
    @_sample = @_createSampleHexagon attributes.hexagon
    @hexagons = new Array(@rows * @cols)
    for j in [0...@rows]
      for i in [0...@cols]
        @hexagons[@_indexInOffset(i, j)] = @_createHexagonInOffset(i, j)
    @hexagons

  _createSampleHexagon: (hexAttributes) =>
    options = { position: {x: 0, y: 0}, flatTopped: @isFlatTopped() }
    if hexAttributes.width? or hexAttributes.height?
      Hexagon.bySize hexAttributes, options
    else if hexAttributes.radius?
      Hexagon.byRadius hexAttributes.radius, options
    else
      throw new Error "Unknown hexagon directive. You have to pass the radius or at least one dimension"

  _createHexagonInOffset: (i, j) ->
    position = @_expectedPositionInOffset i, j
    halfEdges = @halfEdgesFromNeighborhood i, j
    new Hexagon halfEdges, flatTopped: @isFlatTopped()

  _expectedPositionInOffset: (i, j) ->
    if @isFlatTopped()
      yMod = if @_isShiftingRequired(i) then @_sample.vertices()[0].y else 0
      new Point
        x: round(round(@_sample.size().width * 0.75) * i)
        y: round(round(@_sample.size().height * j) + yMod)
    else
      xMod = if @_isShiftingRequired(j) then @_sample.vertices()[1].x else 0
      new Point
        x: round(xMod + round(@_sample.size().width * i))
        y: round(round(@_sample.size().height * 0.75) * j)

  _isShiftingRequired: (rel) ->
    (@isEvenOffsetLayout() and rel % 2 is 0) or (@isOddOffsetLayout() and rel % 2 isnt 0)

  _indexInOffset: (i, j) ->
    return null if i < 0 or j < 0 or i >= @cols or j >= @rows
    j * @cols + i

  _eachHalfEdgeFromSharedMappings: (i, j, callback) ->
    for mapping in @sharedHexagonEdges[@topMode][@offsetLayout]
      neighbor = @at i + mapping.pos.x, j + mapping.pos.y
      rel = if @isFlatTopped() then i else j
      continue if (mapping.type is 'odd' and rel % 2 is 0) or (mapping.type is 'even' and rel % 2 isnt 0)
      continue unless neighbor?
      callback(mapping.dest, neighbor.halfEdges[mapping.src])

  halfEdgesFromNeighborhood: (i, j) ->
    halfEdges = new Array(6)
    @_eachHalfEdgeFromSharedMappings i, j, (halfEdgeIdx, srcHalfEdge) ->
      halfEdges[halfEdgeIdx] ?= srcHalfEdge.opposite()
    vertices = null # do not fetch shared vertices until we really need them
    for halfEdge,index in halfEdges when not halfEdge?
      vertices ?= @verticesFromNeighborhood(i, j)
      halfEdges[index] = new HalfEdge new Edge vertices[index], vertices[index + 1] ? vertices[0]
    halfEdges

  verticesFromNeighborhood: (i, j) ->
    vertices = new Array(6)
    @_eachHalfEdgeFromSharedMappings i, j, (halfEdgeIdx, srcHalfEdge) ->
      vertices[halfEdgeIdx] ?= srcHalfEdge.vb()
      vertices[(halfEdgeIdx + 1) % vertices.length] ?= srcHalfEdge.va()
    for v, index in @_sample.vertices() when not vertices[index]?
      pos = @_expectedPositionInOffset i, j
      vertices[index] = new Vertex round(v.x + pos.x), round(v.y + pos.y)
    vertices

# Map
#
# @example
#   new Map cols: 10, rows: 10, hexagon: { width: 10 }
# @example
#   new Map cols: 10, rows: 10, hexagon: { radius: 10 }
# @example
#   new Map cols: 10, rows: 10, width: 500, height: 500
class Map
  constructor: (attributes = {}) ->
    @rows          = attributes.rows
    @cols          = attributes.cols
    @topMode       = attributes.flatTopped && 'flat' || 'pointly'
    @offsetLayout  = attributes.offsetLayout ? 'odd'
    factory = new HexagonMatrixFactory attributes
    factory.topMode = @topMode
    factory.offsetLayout = @offsetLayout
    @hexagons = factory.buildMatrix rows: @rows, cols: @cols, hexagon: attributes.hexagon ? @_calcHexagonSize(attributes)

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

  _indexInOffset: (row, col) ->
    return null if col < 0 or row < 0 or col >= @cols or row >= @rows
    row * @cols + col

module.exports = Map
