Point = require '../core/point.coffee'

class OffsetCursor
  constructor: (mapOrCursor, args...)->
    if mapOrCursor.offsetPosition
      @map = mapOrCursor.map
      @moveTo mapOrCursor.offsetPosition()
    else
      @map = mapOrCursor
      @moveTo @_extractOffset(args)

  moveTo: ->
    @position = @_extractOffset(arguments)
    @hexagon = @map.matrix[@position.y]?[@position.x]

  axialPosition: ->
    @position.sub @_centerPoint()

  cubePosition: ->
    axial = @axialPosition()
    { x: axial.x, y: -(axial.x + axial.y), z: axial.y}

  _centerPoint: ->
    return @_center if @_center?
    centerY = Math.round (@map.matrix.length - 1) / 2
    @_center = new Point
      x: Math.round (@map.matrix[centerY].length - 1) / 2
      y: centerY

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
