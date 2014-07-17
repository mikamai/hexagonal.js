Point = require './point.coffee'

class Vertex extends Point
  constructor: ->
    super
    @edges = []

module.exports = Vertex
