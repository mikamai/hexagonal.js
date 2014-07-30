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
        { type: null,   pos: new Point( 0, -1), src: 1, dest: 4 },
        { type: 'even', pos: new Point(-1,  0), src: 0, dest: 3 },
        { type: 'odd',  pos: new Point(-1,  0), src: 5, dest: 2 },
        { type: 'odd',  pos: new Point(-1, -1), src: 0, dest: 3 },
        { type: 'odd',  pos: new Point( 1, -1), src: 2, dest: 5 }
      ]
      odd: [
        { type: null,   pos: new Point( 0, -1), src: 1, dest: 4 },
        { type: 'even', pos: new Point(-1,  0), src: 5, dest: 2 },
        { type: 'even', pos: new Point(-1, -1), src: 0, dest: 3 },
        { type: 'even', pos: new Point( 1, -1), src: 2, dest: 5 },
        { type: 'odd',  pos: new Point(-1,  0), src: 0, dest: 3 }
      ]
    pointly:
      odd: [
        { type: null,   pos: new Point(-1,  0), src: 5, dest: 2 },
        { type: 'even', pos: new Point(-1, -1), src: 0, dest: 3 },
        { type: 'even', pos: new Point( 0, -1), src: 1, dest: 4 },
        { type: 'odd',  pos: new Point( 0, -1), src: 0, dest: 3 },
        { type: 'odd',  pos: new Point( 1, -1), src: 1, dest: 4 }
      ]
      even: [
        { type: null,   pos: new Point(-1,  0), src: 5, dest: 2 },
        { type: 'even', pos: new Point( 0, -1), src: 0, dest: 3 },
        { type: 'even', pos: new Point( 1, -1), src: 1, dest: 4 },
        { type: 'odd',  pos: new Point(-1, -1), src: 0, dest: 3 },
        { type: 'odd',  pos: new Point( 0, -1), src: 1, dest: 4 }
      ]

  constructor: (options = {}) ->
    @topMode = if options.flatTopped then 'flat' else 'pointly'
    @offsetLayout = options.offsetLayout ? 'odd'
    unless ['odd', 'even'].indexOf(@offsetLayout) >= 0
      throw new Error "Unknown offsetLayout. Allowed values: odd, even"

  isFlatTopped      : => @topMode is 'flat'
  isPointlyTopped   : => @topMode is 'pointly'
  isEvenOffsetLayout: => @offsetLayout is 'even'
  isOddOffsetLayout : => @offsetLayout is 'odd'

  buildMatrix: (attributes = {}) ->
    [rows, cols] = [attributes.rows, attributes.cols]
    @_sample = @_createSampleHexagon attributes.hexagon
    @matrix = new Array(rows)
    for j in [0...rows]
      @matrix[j] = new Array(cols)
      @matrix[j][i] = @_createHexagonInOffset(i, j) for i in [0...cols]
    @matrix

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
      y = if @_isShiftingRequired(i) then @_sample.vertices()[0].y else 0
      new Point(0, y).sum
        x: round(round(@_sample.size().width * 0.75) * i)
        y: round(@_sample.size().height * j)
    else
      x = if @_isShiftingRequired(j) then @_sample.vertices()[1].x else 0
      new Point(x, 0).sum
        x: round(@_sample.size().width * i)
        y: round(round(@_sample.size().height * 0.75) * j)

  _isShiftingRequired: (rel) ->
    (@isEvenOffsetLayout() and rel % 2 is 0) or (@isOddOffsetLayout() and rel % 2 isnt 0)

  _eachHalfEdgeFromSharedMappings: (i, j, callback) ->
    for mapping in @sharedHexagonEdges[@topMode][@offsetLayout]
      neighbor = @matrix[j + mapping.pos.y]?[i + mapping.pos.x]
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
      vertices[index] = new Vertex v.sum @_expectedPositionInOffset(i, j)
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
    @f = factory      = new HexagonMatrixFactory attributes
    for meth in ['isFlatTopped', 'isPointlyTopped', 'isEvenOffsetLayout', 'isOddOffsetLayout']
      @[meth] = factory[meth]
    @matrix = factory.buildMatrix
      rows: attributes.rows
      cols: attributes.cols
      hexagon: attributes.hexagon ? @_detectedHexagonSize(attributes)

  hexagons: ->
    return @_hexagons if @_hexagons?
    [rows, cols] = [@matrix.length, @matrix[0].length]
    @_hexagons = new Array(rows * cols)
    for row,j in @matrix
      @_hexagons[j * cols + i] = cell for cell,i in row
    @_hexagons
  firstHexagon: -> @hexagons()[0]
  lastHexagon: -> @hexagons()[@hexagons().length - 1]

  size: ->
    lastHexPos = @lastHexagon().position()
    @lastHexagon().size().sum width: lastHexPos.x, height: lastHexPos.y

  at: (i, j) -> @matrix[j]?[i]

  _detectedHexagonSize: (attributes) =>
    throw new Error "Cannot detect correct hexagon size" unless attributes.width? or attributes.height?
    [rows, cols, width, height] = [attributes.rows, attributes.cols, null, null]
    if attributes.width?
      divider = if @isFlatTopped() then 2 / (2 * cols + 1) else 1 / cols
      width = round attributes.width * divider
    if attributes.height?
      divider = if @isFlatTopped() then 1 / rows else 2 / (2 * rows + 1)
      height = round attributes.height * divider
    { width, height }

module.exports = Map
