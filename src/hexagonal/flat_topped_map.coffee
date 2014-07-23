AbstractMap = require './abstract_map.coffee'
Hexagon     = require './hexagon.coffee'
Point       = require './core/point.coffee'
Size        = require './core/size.coffee'

class FlatToppedMap extends AbstractMap
  size: =>
    new Size
      width : @_round(@cols * @_sample.size().width)
      height: @_round(@rows * @_sample.size().height + @_sample.size().height / 2)

  _calcHexagonSize: (attributes) =>
    if attributes.width? or attributes.height?
      {
        width: if attributes.width? then (2 * attributes.width) / (2 * @cols + 1)
        height: if attributes.height? then attributes.height / @rows
      }
    else
      throw new Error "Cannot Don't know how to create an hexagon!"

  _hexagonAttributes: (attributes) =>
    attributes.flatTop ?= true
    attributes

  _expectedPositionInOffset: (row, col) =>
    yMod = if col % 2 isnt 0 then @_sample.vertices()[0].y else 0
    new Point
      x: @_round(@_round(@_sample.size().width * 0.75) * col)
      y: @_round(@_round(@_sample.size().height * row) + yMod)

  _sharedVerticesFromNeighborsOfOffset: (row, col, vertices) =>
    @_sharedVerticesFromNeighbor vertices, @at(row - 1, col), 1: 5, 2: 4
    if col % 2 is 0
      @_sharedVerticesFromNeighbor vertices, @at(row, col - 1), 0: 2, 5: 3
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col - 1), 1: 3, 0: 4
      @_sharedVerticesFromNeighbor vertices, @at(row - 1, col + 1), 2: 0, 3: 5
    else
      @_sharedVerticesFromNeighbor vertices, @at(row, col - 1), 1: 3, 0: 4

  _sharedEdgesFromNeighborsInOffset: (row, col, halfEdges) =>
    @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col), 1: 4)
    if col % 2 is 0
      @_sharedEdgesFromNeighbor(halfEdges, @at(row, col - 1), 5: 2)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col - 1), 0: 3)
      @_sharedEdgesFromNeighbor(halfEdges, @at(row - 1, col + 1), 2: 5)
    else
      @_sharedEdgesFromNeighbor(halfEdges, @at(row, col - 1), 0: 3)

module.exports = FlatToppedMap
