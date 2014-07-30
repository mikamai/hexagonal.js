class Edge
  constructor: ->
    @vertices = if arguments.length > 1 then (a for a in arguments) else arguments[0]
    unless @vertices?.length is 2
      throw new Error 'You have to provide 2 vertices'
    vertex.pushEdge @ for vertex in @vertices
    @halfEdges = []

  hexagons: -> (halfEdge.hexagon for halfEdge in @halfEdges)

  isContainedIn: (hexagon) ->
    return true for hex in @hexagons() when hex.isEqual hexagon
    false

  isEqual: (other) =>
    for vertex, index in @vertices
      return false unless vertex.isEqual(other.vertices[index])
    true

  toPrimitive: => { vertices: (v.toPrimitive() for v in @vertices) }

  toString: => "#{@constructor.name}{#{@vertices[0].toString()}, #{@vertices[1].toString()}}"

module.exports = Edge
