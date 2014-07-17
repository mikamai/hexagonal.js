class Edge
  constructor: (@va, @vb) ->
    unless @va? and @vb?
      throw new Error 'Two points have to be provided'
    v.edges.push @ for v in @vertices()

  vertices: -> [@va, @vb]

module.exports = Edge
