Point = require './point.coffee'

class Vertex extends Point
  constructor: ->
    super
    @edges = []

  pushEdge: (edge) ->
    @edges.push edge

module.exports = Vertex
