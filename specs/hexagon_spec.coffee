describe 'Hexagon', ->
  Subject  = Hexagonal.Hexagon
  Edge     = Hexagonal.Edge
  Vertex   = Hexagonal.Vertex
  Point    = Hexagonal.Point
  Size     = Hexagonal.Size
  HalfEdge = Hexagonal.HalfEdge

  it 'is defined in the Hexagonal namespace', ->
    expect(Hexagonal.Hexagon).not.toBeUndefined()

  describe '::byRadius', ->
    it 'creates an hexagon', ->
      subject = Subject.byRadius(10, center: { x: 1, y: 1 })
      expect(subject.vertices()).toEqual [
        new Vertex( 9.7,  6),
        new Vertex( 1,    11),
        new Vertex(-7.7,  6),
        new Vertex(-7.7, -4),
        new Vertex( 1,   -9),
        new Vertex( 9.7, -4)
      ]

    it 'uses the origin if no center is provided', ->
      expect(Subject.byRadius(10).center()).toEqual new Point 0, 0

    describe 'when flatTopped is true', ->
      it 'creates another type of vertices collection', ->
        subject = Subject.byRadius 10, center: { x: 1, y: 1 }, flatTopped: true
        expect(subject.vertices()).toEqual [
          new Vertex( 11,  1),
          new Vertex( 6,   9.7),
          new Vertex(-4,   9.7),
          new Vertex(-9,   1),
          new Vertex(-4,  -7.7),
          new Vertex( 6,  -7.7)
        ]

  describe '::bySize', ->
    it 'uses the origin as position if no position is provided', ->
      expect(Subject.bySize(width: 5).position()).toEqual new Point 0, 0

    it 'throws an error if size is not in the correct format', ->
      expect(-> Subject.bySize 5).toThrowError "Size must be provided with width or height or both"

    it 'uses the provided size', ->
      expect(Subject.bySize(width: 1, height: 2).size()).toEqual new Size 1, 2

    it 'continues initing as if vertices were passed', ->
      spyOn(Subject, 'byVertices').and.callThrough()
      subject = Subject.bySize width: 2, height: 2
      expect(Subject.byVertices).toHaveBeenCalled()

    it 'generates vertices using position and size', ->
      subject = Subject.bySize { width: 2, height: 2 }, position: { x: 1, y: 0 }
      expect(subject.vertices()).toEqual [
        new Vertex(3, 1.5), new Vertex(2, 2),
        new Vertex(1, 1.5), new Vertex(1, 0.5),
        new Vertex(2, 0),   new Vertex(3, 0.5)
      ]

    describe 'when flatTopped is true', ->
      it 'generates vertices in another way', ->
        subject = Subject.bySize { width: 2, height: 2 }, position: { x: 1, y: 0 }, flatTopped: true
        expect(subject.vertices()).toEqual [
          new Vertex(3,   1),
          new Vertex(2.5, 2),
          new Vertex(1.5, 2),
          new Vertex(1,   1),
          new Vertex(1.5, 0),
          new Vertex(2.5, 0)
        ]

    describe 'when only width is provided in size', ->
      describe 'and flatTopped is false', ->
        it 'desumes height multiplying width by a coefficient', ->
          expect(Subject.bySize(width: 1).size()).toEqual new Size 1, 1.2
      describe 'and flatTopped is true', ->
        it 'desumes height dividing width by a coefficient', ->
          expect(Subject.bySize({ width: 1 }, flatTopped: true).size()).toEqual new Size 1, 0.9

    describe 'when only height is provided in size', ->
      describe 'and flatTopped is false', ->
        it 'desumes width dividing height by a coefficient', ->
          expect(Subject.bySize(height: 1).size()).toEqual new Size 0.9, 1
      describe 'and flatTopped is true', ->
        it 'desumes width multiplying height by a coefficient', ->
          expect(Subject.bySize({ height: 1 }, flatTopped: true).size()).toEqual new Size 1.2, 1

  describe '::byVertices', ->
    vertices = null
    beforeEach ->
      vertices = (new Vertex(p) for p in Subject.sizeMultipliers.pointly)

    it 'throws an error if the vertices attribute has not 6 items', ->
      expect(-> Subject.byVertices vertices.slice(1)).toThrowError 'You have to provide 6 vertices'

    it 'desumes edges using the provided vertices', ->
      expect(Subject.byVertices(vertices).halfEdges).toEqual [
        new HalfEdge(new Edge [vertices[0], vertices[1]]),
        new HalfEdge(new Edge [vertices[1], vertices[2]]),
        new HalfEdge(new Edge [vertices[2], vertices[3]]),
        new HalfEdge(new Edge [vertices[3], vertices[4]]),
        new HalfEdge(new Edge [vertices[4], vertices[5]]),
        new HalfEdge(new Edge [vertices[5], vertices[0]])
      ]

  describe '::byEdges', ->
    edges = null
    beforeEach ->
      vertices = (new Vertex(p) for p in Subject.sizeMultipliers.pointly)
      edges = (for v, index in vertices
        nextOne = vertices[index + 1] ? vertices[0]
        new Edge [v, nextOne])

    it 'throws an error if the edges attribute has not 6 items', ->
      expect(-> Subject.byEdges edges.slice(1)).toThrowError 'You have to provide 6 edges'

    it 'creates an halfedge per given edge', ->
      subject = Subject.byEdges(edges)
      for halfEdge, index in subject.halfEdges
        expect(halfEdge.direction).toBe 1
        expect(halfEdge.edge).toEqual edges[index]

  describe 'constructor', ->
    halfEdges = null
    beforeEach ->
      halfEdges = [
        new HalfEdge(new Edge(new Vertex(0.75, 0.75), new Vertex(0.5,  1))),
        new HalfEdge(new Edge(new Vertex(0.5,  1),    new Vertex(0.25, 0.75))),
        new HalfEdge(new Edge(new Vertex(0.25, 0.75), new Vertex(0.25, 0.25))),
        new HalfEdge(new Edge(new Vertex(0.25, 0.25), new Vertex(0.5,  0))),
        new HalfEdge(new Edge(new Vertex(0.5,  0),    new Vertex(0.75, 0.25))),
        new HalfEdge(new Edge(new Vertex(0.75, 0.25), new Vertex(0.75, 0.75)))
      ]

    it 'throws an error if the halfEdges attribute has not 6 items', ->
      expect(-> new Subject(halfEdges.slice(1))).toThrowError 'You have to provide 6 halfedges'

    it 'uses the provided halfedges attribute', ->
      expect(new Subject(halfEdges).halfEdges).toEqual(halfEdges)

    it 'maps the vertices through the halfEdges', ->
      expect(new Subject(halfEdges).vertices()).toEqual (e.va() for e in halfEdges)

    it 'adds itself to each provided halfEdge', ->
      subject = new Subject halfEdges
      for halfEdge in subject.halfEdges
        expect(halfEdge.hexagon).toEqual subject

  describe '#neighbors', ->
    [subject, other] = [null, null]
    beforeEach ->
      subject = Subject.bySize { width: 10 }, position: { x: 5, y: 7 }
      other = Subject.byEdges subject.edges()

    it 'returns a collection', ->
      expect(subject.neighbors().constructor).toBe Array

    it 'returns a list with other hexagons using an edge', ->
      expect(subject.neighbors()).toEqual [other]

  describe '#position', ->
    subject = null
    beforeEach -> subject = Subject.bySize { width: 10 }, position: { x: 5, y: 7 }

    it 'returns a point', ->
      expect(subject.position().constructor).toEqual(Hexagonal.Point)

    describe 'when flatTopped is false', ->
      it 'returns the third vertex x and the fifth vertex y', ->
        subject.vertices()[2].x = 100
        subject.vertices()[4].y = 200
        expect(subject.position()).toEqual new Point(100, 200)

    describe 'when flatTopped is true', ->
      beforeEach -> subject.topMode = 'flat'
      it 'returns the fourth vertex x and the fifth vertex y', ->
        subject.vertices()[3].x = 100
        subject.vertices()[4].y = 200
        expect(subject.position()).toEqual new Point(100, 200)

    describe 'when a value is given', ->
      it 'sets the position changing all vertices', ->
        subject.position x: 100, y: 100
        expect(subject.vertices()).toEqual [
          new Vertex(110, 108.6),
          new Vertex(105, 111.5),
          new Vertex(100, 108.6),
          new Vertex(100, 102.9),
          new Vertex(105, 100),
          new Vertex(110, 102.9)
        ]

  describe '#center', ->
    subject = null
    beforeEach -> subject = Subject.bySize width: 10

    it 'returns a point', ->
      expect(subject.center().constructor).toEqual Hexagonal.Point

    it 'is desumed using position and size', ->
      subject = Subject.bySize { width: 2, height: 2}, position: { x: 1, y: 2 }
      expect(subject.center()).toEqual new Point 2, 3

  describe '#size', ->
    it 'returns a size', ->
      subject = Subject.bySize width: 10
      expect(subject.size().constructor).toEqual Hexagonal.Size

    it 'is desumed using the first vertex x and the position', ->
      subject = Subject.bySize width: 10
      spyOn(subject, 'position').and.returnValue x: 10, y: 10
      subject.vertices()[0].x = 100
      expect(subject.size().width).toEqual 90

    it 'is desumed using the second vertex y and the position', ->
      subject = Subject.bySize width: 10
      spyOn(subject, 'position').and.returnValue x: 10, y: 10
      subject.vertices()[1].y = 100
      expect(subject.size().height).toEqual 90

    it 'changes vertices', ->
      subject = Subject.bySize width: 10
      subject.size width: 20, height: 15
      expect(subject.vertices()).toEqual [
        new Vertex(20, 11.3),
        new Vertex(10, 15),
        new Vertex(0,  11.3),
        new Vertex(0,  3.8),
        new Vertex(10, 0),
        new Vertex(20, 3.8)
      ]

  it 'correctly uses precision', ->
    expect(Subject.bySize(width: 5).size().height).toBe 5.8
    Hexagonal.usingPrecision 3, ->
      expect(Subject.bySize(width: 5).size().height).toBe 5.774
