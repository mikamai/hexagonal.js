describe 'Point3D', ->
  Subject = Hexagonal.Point3D

  it 'is defined in the Hexagonal namespace', ->
    expect(Hexagonal.Point3D).not.toBeUndefined()

  describe 'constructor', ->
    it 'accepts x coordinate as option', ->
      expect(new Subject({x: 5}).x).toBe 5

    it 'accepts y coordinate as option', ->
      expect(new Subject({y: 5}).y).toBe 5

    it 'accepts z coordinate as option', ->
      expect(new Subject({z: 5}).z).toBe 5

    it 'accepts x coordinate as parameter', ->
      expect(new Subject(5).x).toBe 5

    it 'accepts y coordinate as parameter', ->
      expect(new Subject(5, 6).y).toBe 6

    it 'accepts z coordinate as parameter', ->
      expect(new Subject(5, 6, 7).z).toBe 7

  describe '#sum', ->
    subject = null
    beforeEach -> subject = new Subject 5,1,-1

    it 'returns a new point', ->
      expect(subject.sum(1,1,1)).not.toEqual subject

    it 'returns as x the current x plus the given one', ->
      expect(subject.sum(1,1,1).x).toEqual 6

    it 'returns as y the current y plus the given one', ->
      expect(subject.sum(1,1,1).z).toEqual 0

    it 'accepts x, y and z as options', ->
      expect(subject.sum({x: 3, y: 3, z: 1}).z).toEqual 0

  describe '#sub', ->
    subject = null
    beforeEach -> subject = new Subject 5, 1, -1

    it 'returns a new point', ->
      expect(subject.sub(1,1,1)).not.toEqual subject

    it 'returns as x the current x minus the given one', ->
      expect(subject.sub(1,1,1).x).toEqual 4

    it 'returns as y the current y minus the given one', ->
      expect(subject.sub(1,1,1).y).toEqual 0

    it 'returns as z the current z minus the given one', ->
      expect(subject.sub(1,1,1).z).toEqual -2

    it 'accepts x, y and z as options', ->
      expect(subject.sub({x: 3, y: 3, z: 1}).x).toEqual 2
