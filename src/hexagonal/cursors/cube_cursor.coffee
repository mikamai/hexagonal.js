Point   = require '../core/point.coffee'
Point3D = require '../core/point_3d.coffee'

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
    if @position.y is -(@position.x + @position.z)
      center = @_centerPoint()
      @hexagon = @map.matrix[@position.z + center.y]?[@position.x + center.x]
    else
      @position = @hexagon = null

  axialPosition: ->
    new Point x: @position.x, y: @position.z

  offsetPosition: ->
    [center, axial] = [@_centerPoint(), @axialPosition()]
    new Point x: center.x + axial.x, y: center.y + axial.y

  _centerPoint: ->
    return @_center if @_center?
    centerY = Math.round (@map.matrix.length - 1) / 2
    centerX = Math.round (@map.matrix[centerY].length - 1) / 2
    @_center = new Point centerX, centerY

  _extractPoint: (args) ->
    if args.length is 3
      new Point3D x: args[0], y: args[1], z: args[2]
    else
      obj = args[0]
      if obj.x? or obj.y? or obj.z?
        obj
      else if obj.__position
        center = @_centerPoint()
        [q, r] = [obj.__position.x - center.x, obj.__position.y - center.y]
        [x, z] = [null, null]
        if @map.isFlatTopped()
          x = q
          z = if @map.isOddOffsetLayout()
            r - (q - (q & 1)) / 2
          else
            r - (q + (q & 1)) / 2
        else
          z = r
          x = if @map.isOddOffsetLayout()
            q - (r - (r & 1)) / 2
          else
            q - (r + (r & 1)) / 2
        { x, z, y: - (x + z) }

module.exports = CubeCursor
