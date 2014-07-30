Point = require '../core/point.coffee'

class AxialCursor
  constructor: (@map, args...) ->
    @moveTo @_extractPoint(args)

  moveTo: ->
    point = @_centerPoint().sum @_extractPoint(arguments)
    @hexagon = @map.matrix[point.y]?[point.x]

  _centerPoint: ->
    return @_center if @_center?
    centerY = Math.round (@map.matrix.length - 1) / 2
    @_center = new Point
      x: Math.round (@map.matrix[centerY].length - 1) / 2
      y: centerY

  _extractPoint: (args) ->
    if args.length is 2
      new Point args[0], args[1]
    else
      obj = args[0]
      if obj.x? or obj.y?
        obj
      else
        throw new Error "Bad arg for @at. You can call .at(x, y), .at(x: x, y: y)"

module.exports = AxialCursor
