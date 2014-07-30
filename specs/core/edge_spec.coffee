describe 'Edge', ->
  Subject = Hexagonal.Edge
  Vertex = Hexagonal.Vertex
  Hexagon = Hexagonal.Hexagon

  describe 'constructor', ->
    it 'throws an error if no vertex is given', ->
      expect(-> new Subject).toThrowError('You have to provide 2 vertices')

    it 'throws an error if only one vertex is given', ->
      expect(-> new Subject [new Vertex]).toThrowError('You have to provide 2 vertices')

    it 'does not throw any error if two vertices are given', ->
      expect ->
        new Subject [new Vertex, new Vertex]
      .not.toThrowError()

    it 'adds itself to each vertex', ->
      subject = new Subject [new Vertex, new Vertex]
      for vertex in subject.vertices
        expect(vertex.edges).toEqual [subject]

  describe '#vertices', ->
    it 'throws both points', ->
      subject = new Subject [new Vertex(1,1), new Vertex(2,2)]
      expect(subject.vertices).toEqual [new Vertex(1,1), new Vertex(2,2)]

  describe '#isContainedIn', ->
    subject = null
    beforeEach -> subject = new Subject [new Vertex, new Vertex]

    it 'returns true if the edge is contained in an hexagon through #halfEdges', ->
      hexagon = Hexagon.byRadius 5
      subject.halfEdges.push hexagon.halfEdges[0]
      expect(subject.isContainedIn(hexagon)).toBe true

  describe '#hexagons', ->
    it 'returns the hexagon collection through #halfEdges', ->
      subject = new Subject [new Vertex, new Vertex]
      hexagon = Hexagon.byRadius 5
      subject.halfEdges.push hexagon.halfEdges[0]
      expect(subject.hexagons()).toEqual [hexagon]
