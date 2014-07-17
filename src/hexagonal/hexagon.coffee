Point  = require './core/point.coffee'
Size   = require './core/size.coffee'
Vertex = require './core/vertex.coffee'
Edge   = require './core/edge.coffee'

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
# When you create an hexagon you should always pass the flatTop option set to true if you want
# the hexagon to be handled as flat topped.
#
# @example
#   new Hexagon size: { width: 10, height: 10 } # creates a pointy topped hexagon
#   new Hexagon size: { width: 10, height: 10 }, flatTop: true # creates a flat topped hexagon
#
# During its calculations, the Hexagon will round its values to one decimal digit by default.
# You can change this behavior passing a precisionRound attribute:
#
# @example
#   new Hexagon radius: 5, precisionRound: 0  # no decimal digits
#   new Hexagon radius: 5, precisionRound: 2  # two decimal digits
#   new Hexagon radius: 5, precisionRound: -1 # no rounding
class Hexagon
  dimensionCoeff: Math.sqrt(3) / 2
  precisionRound: 1

  constructor: (attributes = {}) ->
    @flatTop = !!attributes.flatTop
    @precisionRound = attributes.precisionRound
    @precisionRound = 1 unless typeof @precisionRound is 'number'
    if attributes.radius?
      @_initUsingCenterAndRadius(attributes.center, attributes.radius)
    else if attributes.vertices?
      @_initUsingVertices(attributes.vertices)
    else if attributes.edges?
      @_initUsingEdges(attributes.edges)
    else if attributes.size?
      @_initUsingPositionAndSize(attributes.position, attributes.size)
    else
      throw new Error "You can build an hexagon providing the radius, or the vertices collection, or the edges collection, or the size"

  center: => @position().sum @size().width / 2, @size().height / 2

  position: =>
    if @flatTop
      new Point @vertices[3].x, @vertices[4].y
    else
      new Point @vertices[2].x, @vertices[4].y

  size: =>
    new Size @vertices[0].x - @position().x, @vertices[1].y - @position().y

  _initUsingCenterAndRadius: (center, radius) ->
    center = new Point center
    prevAngle = null
    vertices = []
    for index in [0...6]
      angleMod = if @flatTop then 0 else 0.5
      angle = 2 * Math.PI / 6 * (index + angleMod)
      vertices.push new Vertex
        x: @_round(center.x + radius * Math.cos(angle))
        y: @_round(center.y + radius * Math.sin(angle))
    @_initUsingVertices vertices

  _initUsingPositionAndSize: (position, size) ->
    position = new Point position
    unless size.width? or size.height?
      throw new Error "Size must be provided with width or height or both"
    size = @_desumedSize size.width, size.height
    vertices = if @flatTop
      @_buildFlatToppedVertices(position, size)
    else
      @_buildPointyToppedVertices(position, size)
    @_initUsingVertices vertices

  _buildPointyToppedVertices: (position, size) ->
    [
      new Vertex(position.sum size.width,       size.height * 0.75),
      new Vertex(position.sum size.width * 0.5, size.height),
      new Vertex(position.sum 0,                size.height * 0.75),
      new Vertex(position.sum 0,                size.height * 0.25),
      new Vertex(position.sum size.width * 0.5, 0),
      new Vertex(position.sum size.width,       size.height * 0.25)
    ]

  _buildFlatToppedVertices: (position, size) ->
    [
      new Vertex(position.sum size.width,        size.height * 0.5),
      new Vertex(position.sum size.width * 0.75, size.height),
      new Vertex(position.sum size.width * 0.25, size.height),
      new Vertex(position.sum 0,                 size.height * 0.5),
      new Vertex(position.sum size.width * 0.25, 0),
      new Vertex(position.sum size.width * 0.75, 0)
    ]

  _desumedSize: (width, height) ->
    if width
      if @flatTop
        new Size width, height ? @_round(width * @dimensionCoeff)
      else
        new Size width, height ? @_round(width / @dimensionCoeff)
    else if height
      if @flatTop
        new Size @_round(height / @dimensionCoeff), height
      else
        new Size @_round(height * @dimensionCoeff), height

  _initUsingVertices: (vertices) ->
    throw new Error 'You have to provide 6 vertices' if vertices.length isnt 6
    edges = (for vertex, index in vertices when index > 0
      new Edge vertices[index - 1], vertex)
    edges.push new Edge vertices[5], vertices[0]
    @_initUsingEdges(edges)

  _initUsingEdges: (@edges) ->
    throw new Error 'You have to provide 6 edges' if @edges.length isnt 6
    @vertices = (edge.va for edge in @edges)

  _round: (value) ->
    return value if @precisionRound < 0
    precision = Math.pow 10, @precisionRound
    Math.round(value * precision) / precision

module.exports = Hexagon
