class CubeCursor
  constructor: (mapOrCursor, args...)->
    if mapOrCursor.cubePosition
      @map = mapOrCursor.map
      @moveTo mapOrCursor.cubePosition()
    else
      @map = mapOrCursor
      @moveTo @_extractPoint(args)

  moveTo: ->
    @position = @_extractPoint(arguments)
    center = @_centerPoint()
    point = { x: center.x + @position.x, y: center.y + @position.y, z: center.z + @position.z }
    @hexagon = @map.matrix[point.z]?[point.x]

  axialPosition: ->
    { x: @position.x, y: @position.z }

  offsetPosition: ->
    [center, axial] = [@_centerPoint(), @axialPosition()]
    { x: center.x + axial.x, y: center.z + axial.y }

  _centerPoint: ->
    return @_center if @_center?
    centerY = Math.round (@map.matrix.length - 1) / 2
    centerX = Math.round (@map.matrix[centerY].length - 1) / 2
    @_center =
      x: centerX
      y: -centerY-centerX
      z: centerY

  _extractPoint: (args) ->
    if args.length is 3
      { x: args[0], y: args[1], z: args[2] }
    else
      obj = args[0]
      if obj.x? or obj.y? or obj.z?
        obj
      else
        throw new Error "Bad arg for @at. You can call .at(x, y, z), .at(x: x, y: y, z: z)"

module.exports = CubeCursor
