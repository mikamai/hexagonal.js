Point = require './point.coffee'
round = require('./util.coffee').round

class Point3D extends Point
  constructor: ->
    super
    @z = @_extractAttributes(arguments).z

  isEqual: (other) -> @x is other.x and @y is other.y and @z is other.z

  toPrimitive: => { x: @x, y: @y, z: @z }

  toString: => "#{@constructor.name}(#{@x}, #{@y}, #{@z})"

  sum: ->
    attributes = @_extractAttributes(arguments)
    new @constructor round(@x + attributes.x), round(@y + attributes.y), round(@z + attributes.z)

  sub: ->
    attributes = @_extractAttributes(arguments)
    new @constructor round(@x - attributes.x), round(@y - attributes.y), round(@z - attributes.z)

  _extractAttributes: (args) ->
    attributes = args[0] ? {}
    if typeof(attributes) is 'number' || args.length > 1
      attributes = { x: args[0] ? 0, y: args[1] ? 0, z: args[2] ? 0 }
    attributes

module.exports = Point3D
