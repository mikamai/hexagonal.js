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
    point = @_centerPoint().sum @position
    @hexagon = @map.matrix[point.z]?[point.x]

  axialPosition: ->
    new Point x: @position.x, y: @position.z

  offsetPosition: ->
    [center, axial] = [@_centerPoint(), @axialPosition()]
    new Point x: center.x + axial.x, y: center.z + axial.y

  _centerPoint: ->
    return @_center if @_center?
    centerY = Math.round (@map.matrix.length - 1) / 2
    centerX = Math.round (@map.matrix[centerY].length - 1) / 2
    @_center = new Point3D
      x: centerX
      y: -centerY-centerX
      z: centerY

  _extractPoint: (args) ->
    if args.length is 3
      new Point3D x: args[0], y: args[1], z: args[2]
    else
      obj = args[0]
      if obj.x? or obj.y? or obj.z?
        obj
      else if obj.__position
        center = @_centerPoint()
        axial = new Point(obj.__position).sub {x: center.x, y: center.z}
        { x: axial.x, y: -(axial.x + axial.y), z: axial.y}

module.exports = CubeCursor
