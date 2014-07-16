describe 'Edge', ->
  Subject = Hexagonal.Edge

  describe 'constructor', ->
    it 'throws an error if no vertex is given', ->
      expect(-> new Subject).toThrowError('Two points have to be provided')

    it 'throws an error if only one vertex is given', ->
      expect(-> new Subject).toThrowError('Two points have to be provided')

    it 'does not throw any error if two vertices are given', ->
      expect ->
        new Subject new Hexagonal.Vertex, new Hexagonal.Vertex
      .not.toThrowError()

  describe '#vertices', ->
    it 'throws both points', ->
      subject = new Subject new Hexagonal.Vertex(1,1), new Hexagonal.Vertex(2,2)
      expect(subject.vertices()).toEqual [subject.va, subject.vb]

  describe 'when a new edge is built', ->
    it 'adds itself to the first vertex', ->
      subject = new Subject new Hexagonal.Vertex, new Hexagonal.Vertex
      expect(subject.va.edges).toEqual [subject]

    it 'adds itself to the last vertex', ->
      subject = new Subject new Hexagonal.Vertex, new Hexagonal.Vertex
      expect(subject.vb.edges).toEqual [subject]
