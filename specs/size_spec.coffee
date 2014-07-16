describe 'Size', ->
  Subject = Hexagonal.Size

  it 'is defined in the Hexagonal namespace', ->
    expect(Hexagonal.Size).not.toBeUndefined()

  describe 'constructor', ->
    it 'accepts width as option', ->
      expect(new Subject({width: 5}).width).toBe 5

    it 'accepts height as option', ->
      expect(new Subject({height: 5}).height).toBe 5

    it 'accepts width as parameter', ->
      expect(new Subject(5).width).toBe 5

    it 'accepts height as parameter', ->
      expect(new Subject(5, 6).height).toBe 6
