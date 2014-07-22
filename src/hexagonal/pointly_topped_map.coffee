AbstractMap = require './abstract_map.coffee'
Hexagon     = require './hexagon.coffee'
Point       = require './core/point.coffee'

class PointlyToppedMap extends AbstractMap
  _createSampleHexagon: (attributes) =>
    Hexagon.bySize attributes, position : { x: 0, y: 0 }, precision: @precision

  _expectedPositionInOffset: (row, col) =>
    xMod = if row % 2 isnt 0 then @_sample.vertices()[1].x else 0
    new Point
      x: @_round(xMod + @_round(@_sample.size().width * col))
      y: @_round(@_round(@_sample.size().height * 0.75) * row)

  _sharedVerticesFromNeighborsOfOffset: (row, col, vertices) =>
    @_sharedVerticesFromNeighbor vertices, @at(row, col - 1), 0: 2, 5: 3
    @_sharedVerticesFromNeighbor vertices, @at(row, col + 1), 2: 0, 3: 5
    if row % 2 is 0
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col - 1), 1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col + 1), 3: 1, 4: 0
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col),     2: 4, 1: 5
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col),     4: 2, 5: 1
    else
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col),     1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col),     3: 1, 4: 0
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col + 1), 2: 4, 1: 5
      @_sharedVerticesFromNeighbor vertices, @at(row + 1, col - 1), 4: 2, 5: 1

  _sharedEdgesFromNeighborsInOffset: (row, col, halfEdges) =>
    @_sharedEdgesFromNeighbor(halfEdges, @at(row, col - 1), 5: 2)
    @_sharedEdgesFromNeighbor(halfEdges, @at(row, col + 1), 2: 5)
    if row % 2 is 0
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col - 1), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col - 1), 3: 0)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 1: 4)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col), 4: 1)
    else
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col), 3: 0)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col + 1), 1: 4)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row + 1, col + 1), 4: 1)

  _newHexagon: (halfEdges) =>
    new Hexagon halfEdges, precision: @precision

module.exports = PointlyToppedMap
