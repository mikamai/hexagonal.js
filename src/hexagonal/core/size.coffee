class Size
  constructor: ->
    attributes = arguments[0] ? {}
    if typeof(attributes) is 'number' || arguments.length > 1
      attributes = { width: arguments[0], height: arguments[1] }
    @width  = attributes.width ? 0
    @height = attributes.height ? 0

module.exports = Size
