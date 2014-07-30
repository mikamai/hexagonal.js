round = require('./util.coffee').round

class Size
  constructor: ->
    attributes = arguments[0] ? {}
    if typeof(attributes) is 'number' || arguments.length > 1
      attributes = { width: arguments[0], height: arguments[1] }
    @width  = attributes.width ? 0
    @height = attributes.height ? 0

  sum: ->
    attributes = @_extractAttributes(arguments)
    new @constructor round(@width + attributes.width), round(@height + attributes.height)

  isEqual: (other) -> @width is other.width && @height is other.height

  toPrimitive: => { width: @width, height: @height }

  toString: => "#{@constructor.name} (#{@width}, #{@height})"

  _extractAttributes: (args) ->
    attributes = args[0] ? {}
    if typeof(attributes) is 'number' || args.length > 1
      attributes = { width: args[0] ? 0, height: args[1] ? 0 }
    attributes

module.exports = Size
