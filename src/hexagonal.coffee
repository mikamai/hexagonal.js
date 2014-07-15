@Hexagonal ?= {}

class Hexagonal.Point
  constructor: ->
    attributes = @_extractAttributes(arguments)
    @x = attributes.x ? 0
    @y = attributes.y ? 0

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

class Hexagonal.Hexagon
  dimensionCoeff: Math.sqrt(3) / 2

  constructor: (attributes = {}) ->
    @_size     = @_desumedSize attributes.width, attributes.height
    if attributes.center?
      @_center   = new Hexagonal.Point attributes.center
      @_position = @_desumedPositionFromCenter()
    else
      @_position = new Hexagonal.Point attributes.x, attributes.y
      @_center   = @_desumedCenterFromPosition()

  center: =>
    @_center

  position: =>
    @_position

  size: =>
    @_size

  _desumedSize: (width, height) ->
    if width
      new Hexagonal.Size width, width / @dimensionCoeff
    else if height
      new Hexagonal.Size height * @dimensionCoeff, height
    else
      throw new Error("You have to provide at least one dimension (width or height)")

  _desumedCenterFromPosition: ->
    @_position.sum @_size.width / 2, @_size.height / 2

  _desumedPositionFromCenter: ->
    @_center.sub @_size.width / 2, @_size.height / 2
