beforeEach ->
  for ClassName in ['Point', 'Hexagon', 'Edge', 'Size']
    Hexagonal[ClassName]::jasmineToString = Hexagonal[ClassName]::toString
  jasmine.addCustomEqualityTester (actual, expected) ->
    toPrimitive = (o) ->
      return o unless o?
      return (toPrimitive(i) for i in o) if o instanceof Array
      return o.toPrimitive?() ? o
    actualPrimitive   = toPrimitive(actual)
    expectedPrimitive = toPrimitive(expected)
    jasmine.matchersUtil.equals actualPrimitive, expectedPrimitive

itBehavesLikeAMap = (Subject, attributes) ->
  subject = null
  beforeEach -> subject = new Subject attributes

  it 'creates cols*rows hexagons', ->
    expect(subject.hexagons.length).toEqual 30

  it 'each item in the hexagons collection is filled with an hexagon', ->
    for hexagon in subject.hexagons
      throw new Error index unless hexagon?
      expect(hexagon.constructor.name).toEqual 'Hexagon'

  it 'each hexagon has the same size', ->
    firstHexagon = subject.hexagons[0]
    for hexagon, index in subject.hexagons when index > 0
      expect(hexagon.size()).toEqual firstHexagon.size()
