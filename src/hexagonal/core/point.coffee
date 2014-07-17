class Point
  constructor: ->
    attributes = @_extractAttributes(arguments)
    @x = attributes.x ? 0
    @y = attributes.y ? 0

  isEqual: (other) ->
    @toPrimitive() is (other.toPrimitive() ? other)

  toPrimitive: => { x: @x, y: @y }

  toString: => "#{@constructor.name} (#{@x}, #{@y})"

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

module.exports = Point
