describe 'Hexagon', ->
  Subject = Hexagonal.Hexagon
  Edge    = Hexagonal.Edge
  Vertex  = Hexagonal.Vertex
  Point   = Hexagonal.Point
  Size    = Hexagonal.Size

  it 'is defined in the Hexagonal namespace', ->
    expect(Hexagonal.Hexagon).not.toBeUndefined()

  describe 'constructor', ->
    describe 'when radius is provided', ->
      it 'creates the vertices collection', ->
        subject = new Subject(center: { x: 0.5, y: 0.5 }, radius: 10)
        expect(subject.vertices()).toEqual [
          new Vertex(x: 9.2, y: 5.5),
          new Vertex(x: 0.5, y: 10.5),
          new Vertex(x:-8.2, y: 5.5),
          new Vertex(x:-8.2, y:-4.5),
          new Vertex(x: 0.5, y:-9.5),
          new Vertex(x: 9.2, y:-4.5)
        ]

      it 'continue initing as if vertices were passed', ->
        spyOn(Subject.prototype, '_initUsingVertices').and.callThrough()
        subject = new Subject center: { x: 0.5, y: 0.5 }, radius: 10
        expect(subject._initUsingVertices).toHaveBeenCalled()

      it 'uses the origin if no center is provided', ->
        expect(new Subject(radius: 10).center()).toEqual new Point 0, 0

    describe 'when vertices attribute is provided', ->
      vertices = null
      beforeEach ->
        vertices = [
          new Vertex(0.75, 0.75),
          new Vertex(0.5,  1),
          new Vertex(0.25, 0.75),
          new Vertex(0.25, 0.25),
          new Vertex(0.5,  0),
          new Vertex(0.75, 0.25)
        ]

      it 'throws an error if the vertices attribute has not 6 items', ->
        expect(-> new Subject(vertices: vertices.slice(1))).toThrowError 'You have to provide 6 vertices'

      it 'uses the provided vertices', ->
        expect(new Subject({vertices}).vertices()).toEqual vertices

      it 'desumes edges using the provided vertices', ->
        expect(new Subject({vertices}).edges()).toEqual [
          new Edge(vertices[0], vertices[1]),
          new Edge(vertices[1], vertices[2]),
          new Edge(vertices[2], vertices[3]),
          new Edge(vertices[3], vertices[4]),
          new Edge(vertices[4], vertices[5]),
          new Edge(vertices[5], vertices[0])
        ]

      it 'continues initing as if edges were provided', ->
        spyOn(Subject.prototype, '_initUsingEdges').and.callThrough()
        subject = new Subject({vertices})
        expect(subject._initUsingEdges).toHaveBeenCalled()

    describe 'when edges attribute is provided', ->
      edges = null
      beforeEach ->
        edges = [
          new Edge(new Vertex(0.75, 0.75), new Vertex(0.5,  1)),
          new Edge(new Vertex(0.5,  1),    new Vertex(0.25, 0.75)),
          new Edge(new Vertex(0.25, 0.75), new Vertex(0.25, 0.25)),
          new Edge(new Vertex(0.25, 0.25), new Vertex(0.5,  0)),
          new Edge(new Vertex(0.5,  0),    new Vertex(0.75, 0.25)),
          new Edge(new Vertex(0.75, 0.25), new Vertex(0.75, 0.75))
        ]

      it 'throws an error if the edges attribute has not 6 items', ->
        expect(-> new Subject(edges: edges.slice(1))).toThrowError 'You have to provide 6 edges'

      it 'uses the provided edges attribute', ->
        expect(new Subject({edges}).edges()).toEqual(edges)

      it 'maps the vertices through the edges', ->
        expect(new Subject({edges}).vertices()).toEqual (e.va for e in edges)

      it 'desumes the position from the edges', ->
        expect(new Subject({edges}).position()).toEqual new Point(0.25, 0)

      it 'desumes the size from the edges', ->
        expect(new Subject({edges}).size()).toEqual new Size(0.5, 1)

      it 'sets vertices attribute passing from edges', ->
        expect(new Subject({edges}).vertices().length).toBe 6

    describe 'when size is provided', ->
      it 'uses the origin as position if no position is provided', ->
        expect(new Subject(size: { width: 5 }).position()).toEqual new Point 0, 0

      it 'throws an error if size is not in the correct format', ->
        expect(-> new Subject size: 5).toThrowError "Size must be provided with width or height or both"

      it 'uses the provided size', ->
        expect(new Subject(size: { width: 1, height: 2}).size()).toEqual new Size 1, 2

      describe 'when only width is provided in size', ->
        it 'desumes the height', ->
          expect(new Subject(size: { width: 1 }).size()).toEqual new Size 1, 1.2

      describe 'when only height is provided in size', ->
        it 'desumes the width', ->
          expect(new Subject(size: { height: 1 }).size()).toEqual new Size 0.9, 1

      it 'continues initing as if vertices were passed', ->
        spyOn(Subject.prototype, '_initUsingVertices').and.callThrough()
        subject = new Subject size: { width: 2, height: 2 }
        expect(subject._initUsingVertices).toHaveBeenCalled()

      it 'generates vertices using position and size', ->
        subject = new Subject position: { x: 1, y: 0 }, size: { width: 2, height: 2 }
        expect(subject.vertices()).toEqual [
          new Vertex(3, 1.5), new Vertex(2, 2),
          new Vertex(1, 1.5), new Vertex(1, 0.5),
          new Vertex(2, 0), new Vertex(3, 0.5)
        ]

    describe 'when no right attribute is given', ->
      it 'throws an error', ->
        expect(-> new Subject).toThrowError "You can build an hexagon providing the radius, or the vertices collection, or the edges collection, or the size"

  describe '#position', ->
    subject = null
    beforeEach -> subject = new Subject size: { width: 10 }, position: { x: 5, y: 7 }

    it 'returns a point', ->
      expect(subject.position().constructor).toEqual(Hexagonal.Point)

  describe '#center', ->
    subject = null
    beforeEach -> subject = new Subject size: { width: 10 }

    it 'returns a point', ->
      expect(subject.center().constructor).toEqual Hexagonal.Point

    it 'is desumed from the position', ->
      subject = new Subject position: { x: 1, y: 2 }, size: { width: 2, height: 2}
      expect(subject.center()).toEqual new Point 2, 3

  describe '#size', ->
    it 'returns a size', ->
      subject = new Subject size: { width: 10 }
      expect(subject.size().constructor).toEqual Hexagonal.Size
