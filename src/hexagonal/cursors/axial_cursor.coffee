Point = require '../core/point.coffee'

class AxialCursor
  constructor: (mapOrCursor, args...)->
    if mapOrCursor.axialPosition
      @map = mapOrCursor.map
      @moveTo mapOrCursor.axialPosition()
    else
      @map = mapOrCursor
      @moveTo @_extractPoint(args)

  moveTo: ->
    @position = @_extractPoint(arguments)
    point = @_centerPoint().sum @position
    @hexagon = @map.matrix[point.y]?[point.x]

  axialPosition: -> @position

  cubePosition: ->
    { x: @position.x, y: -(@position.x + @position.y), z: @position.y}

  offsetPosition: ->
    @_centerPoint().sum @position

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
      else if obj.__position?
        new Point(obj.__position).sub @_centerPoint()

module.exports = AxialCursor
