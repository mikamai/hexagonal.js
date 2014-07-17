beforeEach ->
  Hexagonal.Point::jasmineToString = Hexagonal.Point::toString
  jasmine.addCustomEqualityTester (actual, expected) ->
    toPrimitive = (o) ->
      return o unless o?
      return (toPrimitive(i) for i in o) if o instanceof Array
      return o.toPrimitive?() ? o
    actualPrimitive   = toPrimitive(actual)
    expectedPrimitive = toPrimitive(expected)
    jasmine.matchersUtil.equals actualPrimitive, expectedPrimitive
