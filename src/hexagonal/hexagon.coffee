Point    = require './core/point.coffee'
Size     = require './core/size.coffee'
Vertex   = require './core/vertex.coffee'
Edge     = require './core/edge.coffee'
HalfEdge = require './core/half_edge.coffee'

round = (value, precision = 1) ->
  divider = Math.pow 10, precision
  Math.round(value * divider) / divider

# Hexagon
#
# @example Built using Radius
#   new Hexagon radius: 2 # built with radius 2 and center placed in the origin
#   new Hexagon center: { x: 1, y: 2 }, radius: 2
#
# @example Built using Vertices
#   new Hexagon vertices: [v1, v2, v3, v4, v5, v6]
#
# @example Built using Edges
#   new Hexagon edges: [e1, e2, e3, e4, e5, e6]
#
# @example Built using Size
#   new Hexagon size: { width: 10, height: 10 } # with position placed in the origin
#   new Hexagon position: { x: 1, y: 2}, size: { width: 10 } # height will be desumed
#   new Hexagon position: { x: 1, y: 2}, size: { height: 10 } # width will be desumed
#
# When you create an hexagon you should always pass the flatTopped option set to true if you want
# the hexagon to be handled as flat topped.
#
# @example
#   new Hexagon size: { width: 10, height: 10 } # creates a pointy topped hexagon
#   new Hexagon size: { width: 10, height: 10 }, flatTopped: true # creates a flat topped hexagon
#
# During its calculations, the Hexagon will round its values to one decimal digit by default.
# You can change this behavior passing a precisionRound attribute:
#
# @example
#   new Hexagon radius: 5, precisionRound: 0  # no decimal digits
#   new Hexagon radius: 5, precisionRound: 2  # two decimal digits
#   new Hexagon radius: 5, precisionRound: -1 # no rounding
class Hexagon
  @sizeMultipliers:
    pointly: [
      { x: 1,   y: 0.75 },
      { x: 0.5, y: 1 },
      { x: 0,   y: 0.75 },
      { x: 0,   y: 0.25 },
      { x: 0.5, y: 0 },
      { x: 1,   y: 0.25 }
    ],
    flat: [
      { x: 1,    y: 0.5 },
      { x: 0.75, y: 1 },
      { x: 0.25, y: 1 },
      { x: 0,    y: 0.5 },
      { x: 0.25, y: 0 },
      { x: 0.75, y: 0 }
    ]
  @dimensionCoeff: Math.sqrt(3) / 2

  # Creates a regular Hexagon given its radius
  # @param radius [Number] radius of the circle inscribing the hexagon
  # @param attributes [Hash] Options to provide:
  #   center: center of the hexagon
  #   flatTopped: whether to create a flat topped hexagon or not
  #   position: position to set when the hexagon has been built
  #   precision: Number of decimal digits to consider. Default is 1
  @byRadius: (radius, attributes = {}) ->
    center = new Point attributes.center
    vertices = []
    for index in [0...6]
      angleMod = if attributes.flatTopped then 0 else 0.5
      angle    = 2 * Math.PI / 6 * (index + angleMod)
      vertices.push new Vertex
        x: round(center.x + radius * Math.cos(angle), attributes.precision)
        y: round(center.y + radius * Math.sin(angle), attributes.precision)
    @byVertices vertices, attributes

  @_desumedSize: (size, flatTopped, precision) ->
    [width, height] = [size.width, size.height]
    coeff = if flatTopped then 1 / @dimensionCoeff else @dimensionCoeff
    if width
      new Size width, height ? round(width / coeff, precision)
    else if height
      new Size round(height * coeff, precision), height

  # Creates an Hexagon given its size
  # @param size [Size] Size to use to create the hexagon
  #   If one of the size values (width or height) is not set, it will be
  #   calculated using the other value, generating a regular hexagon
  # @param attributes [Hash] Options to provide:
  #   flatTopped: whether to create a flat topped hexagon or not
  #   position: position to set when the hexagon has been built
  #   precision: Number of decimal digits to consider. Default is 1
  @bySize: (size, attributes = {}) ->
    unless size?.width? or size?.height?
      throw new Error "Size must be provided with width or height or both"
    size = @_desumedSize size, attributes.flatTopped, attributes.precision
    multipliers = @sizeMultipliers[if attributes.flatTopped then 'flat' else 'pointly']
    vertices = []
    for multiplier in multipliers
      vertices.push new Vertex
        x: round(size.width  * multiplier.x, attributes.precision)
        y: round(size.height * multiplier.y, attributes.precision)
    @byVertices vertices, attributes

  # Creates an Hexagon given its vertices
  # @param vertices [Array<Vertex>] Collection of vertices
  #   Vertices have to be ordered clockwise starting from the one at
  #   0 degrees (in a flat topped hexagon), or 30 degrees (in a pointly topped hexagon)
  # @param attributes [Hash] Options to provide:
  #   flatTopped: whether this is a flat topped hexagon or not
  #   position: position to set when the hexagon has been built
  #   precision: Number of decimal digits to consider. Default is 1
  @byVertices: (vertices, attributes = {}) ->
    throw new Error 'You have to provide 6 vertices' if vertices.length isnt 6
    edges = (for vertex, index in vertices
      nextVertex = vertices[index + 1] ? vertices[0]
      new Edge [vertex, nextVertex])
    @byEdges edges, attributes

  # Creates an Hexagon given its edges
  # @param edges [Array<Edge>] Collection of edges
  #   Edges have to be ordered counterclockwise starting from the one with
  #   the first vertex at 0 degrees (in a flat topped hexagon),
  #   or 30 degrees (in a pointly topped hexagon)
  # @param attributes [Hash] Options to provide:
  #   flatTopped: whether this is a flat topped hexagon or not
  #   position: position to set when the hexagon has been built
  #   precision: Number of decimal digits to consider. Default is 1
  @byEdges: (edges, attributes = {}) ->
    throw new Error 'You have to provide 6 edges' if edges.length isnt 6
    halfEdges = (new HalfEdge(edge) for edge in edges)
    new Hexagon halfEdges, attributes

  precision: 1

  constructor: (@halfEdges, attributes = {}) ->
    throw new Error 'You have to provide 6 halfedges' if @halfEdges.length isnt 6
    @topMode   = if attributes.flatTopped then 'flat' else 'pointly'
    @precision = attributes.precision ? 1
    @_setPosition attributes.position if attributes.position?
    halfEdge.hexagon = @ for halfEdge in @halfEdges

  isFlatTopped: -> @topMode is 'flat'

  isPointlyTopped: -> @topMode is 'pointly'

  vertices: => (halfEdge.va() for halfEdge in @halfEdges)

  center: => @position().sum @size().width / 2, @size().height / 2

  position: (value) =>
    if value? then @_setPosition(value) else @_getPosition()

  size: (value) =>
    if value?
      @_setSize value
    else
      @_getSize()

  toString: => "#{@constructor.name} (#{@position().toString()}; #{@size().toString()})"

  isEqual: (other) ->
    return false if @vertices.length isnt (other.vertices?.length ? 0)
    for v, index in @vertices
      return false unless v.isEqual(other.vertices[index])
    true

  toPrimitive: => (v.toPrimitive() for v in @vertices)

  _copyStartingVerticesFromEdges: (attributes) ->
    attributes.vertices ?= []
    for edge, index in attributes.edges when edge?
      attributes.vertices[index]     ?= edge.va
      attributes.vertices[index + 1] ?= edge.vb

  _round: (value) -> round(value, @precision)

  _getPosition: ->
    vertices = @vertices()
    xVertexIdx = if @isFlatTopped() then 3 else 2
    new Point vertices[xVertexIdx].x, vertices[4].y

  _setPosition: (value) ->
    actual = @_getPosition()
    for vertex in @vertices()
      vertex.x = @_round(vertex.x - actual.x + value.x)
      vertex.y = @_round(vertex.y - actual.y + value.y)

  _getSize: ->
    vertices = @vertices()
    new Size
      width : @_round Math.abs(vertices[0].x - @position().x)
      height: @_round Math.abs(vertices[1].y - @position().y)

  _setSize: (value) ->
    position = @_getPosition()
    vertices = @vertices()
    for multiplier, index in @constructor.sizeMultipliers[@topMode]
      vertices[index].x = @_round(position.x + value.width * multiplier.x)
      vertices[index].y = @_round(position.y + value.height * multiplier.y)

module.exports = Hexagon
