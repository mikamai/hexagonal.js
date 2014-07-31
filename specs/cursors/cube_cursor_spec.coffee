describe 'CubeCursor', ->
  Subject = Hexagonal.Cursors.CubeCursor
  map     = new Hexagonal.Map rows: 5, cols: 5, hexagon: { radius: 5 }

  it 'uses 0,0,0 as center', ->
    expect(new Subject(map, 0, 0, 0).hexagon).toBe map.matrix[2][2]

  it 'uses <cols / 2>,<-cols/2-rows/2>,<rows / 2>, as last hexagon', ->
    expect(new Subject(map, 2, -4, 2).hexagon).toBe map.lastHexagon()

  it 'uses <-cols / 2>,<cols/2+rows/2>,<-rows / 2> as first hexagon', ->
    expect(new Subject(map, -2, 4, -2).hexagon).toBe map.firstHexagon()

  it 'returns null if coordinates triple is not correct', ->
    subject = new Subject(map, -2, -4, -2)
    expect(subject.position).toBeNull()

  it 'allows a point to be passed', ->
    expect(new Subject(map, x: 2, y: -4, z: 2).hexagon).toBe map.lastHexagon()

  it 'throws an error if it cannot determine the argument', ->
    expect ->
      new Subject(map, 'asd')
    .toThrowError()

  it 'can be easily be converted into an offset cursor', ->
    subject = new Subject(map, x: 2, y: -4, z: 2)
    offset  = new Hexagonal.Cursors.OffsetCursor(map, subject.offsetPosition())
    expect(offset.hexagon).toBe subject.hexagon

  it 'can be easily be converted into an axial cursor', ->
    subject = new Subject(map, x: 2, y: -4, z: 2)
    offset  = new Hexagonal.Cursors.AxialCursor(map, subject.axialPosition())
    expect(offset.hexagon).toBe subject.hexagon
