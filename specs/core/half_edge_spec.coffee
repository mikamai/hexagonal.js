describe 'HalfEdge', ->
  Subject = Hexagonal.HalfEdge
  Edge    = Hexagonal.Edge
  Vertex  = Hexagonal.Vertex

  createEdge = -> new Edge [new Vertex(1,1), new Vertex(2,2)]

  subject = null
  beforeEach -> subject = new Subject createEdge()

  it 'constructor', ->
    it 'requires an edge', ->
      expect ->
        new Subject
      .toThrowError 'You have to provide an edge'

    it 'requires direction to be 1 or -1', ->
      expect ->
        new Subject createEdge(), -2
      .toThrowError 'Direction must be 1 or -1'

    it 'allows direction to be 1 or -1', ->
      for i in [-1,1]
        expect ->
          new Subject createEdge(), i
        .not.toThrowError()

    it 'adds itself to the edge halfedges collection', ->
      expect(subject.edge.halfEdges).toEqual [subject]

  describe '#vertices', ->
    describe 'when direction is 1', ->
      it 'returns the edge vertices collection', ->
        expect(new Subject(createEdge()).vertices()).toEqual [
          new Vertex(1,1),
          new Vertex(2,2)
        ]

    describe 'when direction is -1', ->
      it 'returns the reversed edge vertices collection', ->
        expect(new Subject(createEdge(), -1).vertices()).toEqual [
          new Vertex(2,2),
          new Vertex(1,1)
        ]
