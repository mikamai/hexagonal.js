@Hexagonal ?= {}

class Hexagonal.Point
  constructor: ->
    attributes = @_extractAttributes(arguments)
    @x = attributes.x ? 0
    @y = attributes.y ? 0

  isEqual: (other) ->
    @toPrimitive() is (other.toPrimitive() ? other)

  toPrimitive: => { x: @x, y: @y }

  sum: ->
    attributes = @_extractAttributes(arguments)
    new @constructor @x + attributes.x, @y + attributes.y

  sub: ->
    attributes = @_extractAttributes(arguments)
    new @constructor @x - attributes.x, @y - attributes.y

  _extractAttributes: (args) ->
    attributes = args[0] ? {}
    if typeof(attributes) is 'number' || args.length > 1
      attributes = { x: args[0], y: args[1] }
    attributes

class Hexagonal.Size
  constructor: ->
    attributes = arguments[0] ? {}
    if typeof(attributes) is 'number' || arguments.length > 1
      attributes = { width: arguments[0], height: arguments[1] }
    @width  = attributes.width ? 0
    @height = attributes.height ? 0

class Hexagonal.Vertex extends Hexagonal.Point
  constructor: ->
    super
    @edges = []

class Hexagonal.Edge
  constructor: (@va, @vb) ->
    unless @va? and @vb?
      throw new Error 'Two points have to be provided'
    v.edges.push @ for v in @vertices()

  vertices: -> [@va, @vb]

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
class Hexagonal.Hexagon
  dimensionCoeff: Math.sqrt(3) / 2

  constructor: (attributes = {}) ->
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

  vertices: => @_vertices

  edges: => @_edges

  center: => @_position.sum @_size.width / 2, @_size.height / 2

  position: => @_position

  size: => @_size

  _initUsingCenterAndRadius: (center, radius) ->
    center = new Hexagonal.Point center
    prevAngle = null
    vertices = []
    for index in [0...6]
      angle = 2 * Math.PI / 6 * (index + 0.5)
      vertices.push new Hexagonal.Vertex
        x: @_round(center.x + radius * Math.cos(angle))
        y: @_round(center.y + radius * Math.sin(angle))
    @_initUsingVertices vertices

  _initUsingPositionAndSize: (position, size) ->
    position = new Hexagonal.Point position
    unless size.width? or size.height?
      throw new Error "Size must be provided with width or height or both"
    size = @_desumedSize size.width, size.height
    @_initUsingVertices [
      new Hexagonal.Vertex(position.sum size.width,       size.height * 0.75),
      new Hexagonal.Vertex(position.sum size.width * 0.5, size.height),
      new Hexagonal.Vertex(position.sum 0,                size.height * 0.75),
      new Hexagonal.Vertex(position.sum 0,                size.height * 0.25),
      new Hexagonal.Vertex(position.sum size.width * 0.5, 0),
      new Hexagonal.Vertex(position.sum size.width,       size.height * 0.25)
    ]

  _desumedSize: (width, height) ->
    if width
      new Hexagonal.Size width, height ? @_round(width / @dimensionCoeff)
    else if height
      new Hexagonal.Size width ? @_round(height * @dimensionCoeff), height

  _initUsingVertices: (vertices) ->
    throw new Error 'You have to provide 6 vertices' if vertices.length isnt 6
    edges = (for vertex, index in vertices when index > 0
      new Hexagonal.Edge vertices[index - 1], vertex)
    edges.push new Hexagonal.Edge vertices[5], vertices[0]
    @_initUsingEdges(edges)

  _initUsingEdges: (@_edges) ->
    throw new Error 'You have to provide 6 edges' if @_edges.length isnt 6
    @_vertices = (edge.va for edge in @_edges)
    @_position = new Hexagonal.Point @_vertices[2].x, @_vertices[4].y
    @_size = new Hexagonal.Size @_vertices[0].x - @_position.x, @_vertices[1].y - @_position.y

  _round: (value) ->
    Math.round(value * 10) / 10
