describe 'Vertex', ->
  Subject = Hexagonal.Vertex

  it 'behaves like a point', ->
    subject = new Subject 3, 4
    point = new Subject 3, 4
    expect({x: subject.x, y: subject.y}).toEqual x: point.x, y: point.y

  describe '#edges', ->
    subject = null
    beforeEach -> subject = new Hexagonal.Vertex

    it 'is a normal collection', ->
      expect(subject.edges).toEqual []
