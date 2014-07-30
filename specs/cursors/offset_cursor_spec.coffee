describe 'OffsetCursor', ->
  Subject = Hexagonal.Cursors.OffsetCursor
  map     = new Hexagonal.Map rows: 5, cols: 5, hexagon: { radius: 5 }

  it 'uses 0,0 as first hexagon', ->
    expect(new Subject(map, 0, 0).hexagon).toBe map.firstHexagon()

  it 'uses <cols>,<rows> as last hexagon', ->
    expect(new Subject(map, 4, 4).hexagon).toBe map.lastHexagon()

  it 'uses the first coordinate as x', ->
    expect(new Subject(map, 1, 0).hexagon).toBe map.hexagons()[1]

  it 'uses the last coordinate as y', ->
    expect(new Subject(map, 0, 1).hexagon).toBe map.hexagons()[5]

  it 'allows a point to be passed', ->
    expect(new Subject(map, x: 2, y: 1).hexagon).toBe map.hexagons()[7]

  it 'allows i and j to be passed', ->
    expect(new Subject(map, i: 2, j: 1).hexagon).toBe map.hexagons()[7]

  it 'throws an error if it cannot determine the argument', ->
    expect ->
      new Subject(map, 'asd')
    .toThrowError()

  it 'can be easily be converted into a cube cursor', ->
    subject = new Subject(map, 4, 4)
    offset  = new Hexagonal.Cursors.CubeCursor(map, subject.cubePosition())
    expect(offset.hexagon).toBe subject.hexagon

  it 'can be easily be converted into an axial cursor', ->
    subject = new Subject(map, 4, 4)
    offset  = new Hexagonal.Cursors.AxialCursor(map, subject.axialPosition())
    expect(offset.hexagon).toBe subject.hexagon
