AbstractMap = require './abstract_map.coffee'
Hexagon     = require './hexagon.coffee'
Point       = require './core/point.coffee'
Size        = require './core/size.coffee'

class PointlyToppedMap extends AbstractMap
  size: =>
    new Size
      width: @_round(@cols * @_sample.size().width + @_sample.size().width / 2)
      height: @_round(@rows * @_sample.size().height)

  _calcHexagonSize: (attributes) =>
    if attributes.width? or attributes.height?
      {
        width: if attributes.width? then attributes.width / @cols
        height: if attributes.height? then (2 * attributes.height) / (2 * @rows + 1)
      }
    else
      throw new Error "Cannot Don't know how to create an hexagon!"

  _hexagonAttributes: (attributes) => attributes

  _expectedPositionInOffset: (row, col) =>
    xMod = if row % 2 isnt 0 then @_sample.vertices()[1].x else 0
    new Point
      x: @_round(xMod + @_round(@_sample.size().width * col))
      y: @_round(@_round(@_sample.size().height * 0.75) * row)

  _sharedVerticesFromNeighborsOfOffset: (row, col, vertices) =>
    @_sharedVerticesFromNeighbor vertices, @at(row, col - 1), 0: 2, 5: 3
    if row % 2 is 0
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col - 1), 1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col),     2: 4, 1: 5
    else
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col),     1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col + 1), 2: 4, 1: 5

  _sharedEdgesFromNeighborsInOffset: (row, col, halfEdges) =>
    @_sharedEdgesFromNeighbor(halfEdges, @at(row, col - 1), 5: 2)
    if row % 2 is 0
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col - 1), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 1: 4)
    else
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col + 1), 1: 4)

module.exports = PointlyToppedMap
