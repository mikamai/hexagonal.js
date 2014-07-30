Point = require '../core/point.coffee'

class OffsetCursor
  constructor: (@map, args...) ->
    @moveTo @_extractOffset(args)

  moveTo: ->
    offset = @_extractOffset(arguments)
    @hexagon = @map.matrix[offset.y]?[offset.x]

  _extractOffset: (args) ->
    if args.length is 2
      new Point args[0], args[1]
    else
      obj = args[0]
      if obj.x? or obj.y?
        obj
      else if obj.i? or obj.j?
        new Point obj.i, obj.j
      else
        throw new Error "Bad arg for @at. You can call .at(x, y), .at(x: x, y: y) or .at(i: x, j: y)"

module.exports = OffsetCursor
