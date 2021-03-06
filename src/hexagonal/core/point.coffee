round = require('./util.coffee').round

class Point
  constructor: ->
    attributes = @_extractAttributes(arguments)
    @x = attributes.x ? 0
    @y = attributes.y ? 0

  isEqual: (other) -> @x is other.x and @y is other.y

  toPrimitive: => { x: @x, y: @y }

  toString: => "#{@constructor.name}(#{@x}, #{@y})"

  sum: ->
    attributes = @_extractAttributes(arguments)
    new @constructor round(@x + attributes.x), round(@y + attributes.y)

  sub: ->
    attributes = @_extractAttributes(arguments)
    new @constructor round(@x - attributes.x), round(@y - attributes.y)

  _extractAttributes: (args) ->
    attributes = args[0] ? {}
    if typeof(attributes) is 'number' || args.length > 1
      attributes = { x: args[0] ? 0, y: args[1] ? 0 }
    attributes

module.exports = Point
