class HalfEdge
  constructor: (@edge, @direction = 1) ->
    throw new Error 'You have to provide an edge' unless @edge?
    if @direction isnt 1 and @direction isnt -1
      throw new Error 'Direction must be 1 or -1'
    @hexagon = null
    @edge.halfEdges.push @

  vertices: ->
    if @direction is 1
      @edge.vertices
    else
      @edge.vertices.slice(0).reverse()

  va: -> @vertices()[0]
  vb: -> @vertices()[1]

  otherHalfEdge: ->
    return halfEdge for halfEdge in @edge.halfEdges when halfEdge isnt @

  isEqual: (other) => @va().isEqual(other.va()) and @vb().isEqual(other.vb())

  toPrimitive: => { va: @va().toPrimitive(), vb: @vb().toPrimitive() }

  toString: => "#{@constructor.name}{#{@va().toString()}, #{@vb().toString()}}"

  opposite: => new HalfEdge(@edge, if @direction is 1 then -1 else 1)

module.exports = HalfEdge
