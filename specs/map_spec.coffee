describe 'Map', ->
  Subject = Hexagonal.Map
  Size    = Hexagonal.Size
  Point   = Hexagonal.Point
  round   = Hexagonal.Util.round
  subject = null

  it 'is defined in the Hexagonal namespace', ->
    expect(Subject).not.toBeUndefined()

  eachHexagon = (offsetCondition, callback) ->
    for hexagon, index in subject.hexagons
      [row, col] = [Math.floor(index / subject.cols), index % subject.cols]
      o = { r: row, c: col, i: index }
      callback(hexagon, o) if offsetCondition(o)

  sharedVerticesCheck = (point, destVertices, sourceVertices) ->
    (hexagon, o) ->
      neighbor = subject.matrix[o.r + (point.r ? 0)][o.c + (point.c ? 0)]
      [vertices, nVertices] = [hexagon.vertices(), neighbor.vertices()]
      for destVertexIdx, index in destVertices
        srcVertexIdx = sourceVertices[index]
        expect(vertices[destVertexIdx]).toBe nVertices[srcVertexIdx]

  sharedEdgeCheck = (point, destEdgeIdx, srcEdgeIdx) ->
    (hexagon, o) ->
      neighbor = subject.matrix[o.r + (point.r ? 0)][o.c + (point.c ? 0)]
      [halfEdges, nHalfEdges] = [hexagon.halfEdges, neighbor.halfEdges]
      expect(halfEdges[destEdgeIdx].edge).toBe nHalfEdges[srcEdgeIdx].edge

  eachHexSharesEdgeAndVertices = (checker, point, destEdge, sourceEdge) ->
    pointS = "#{point.c ? 0}/#{point.r ? 0}"
    it "shares two vertices with its neighbor in #{pointS}", ->
      [destVertices, sourceVertices] = [[destEdge, destEdge + 1], [sourceEdge + 1, sourceEdge]]
      for pairs in [destVertices, sourceVertices]
        pairs[i] = 0 for pair, i in pairs when pair > 5
      eachHexagon checker, sharedVerticesCheck(point, destVertices, sourceVertices)
    it "shares one edge with its neighbor in #{pointS}", ->
      eachHexagon checker, sharedEdgeCheck(point, destEdge, sourceEdge)

  itBehavesLikeAMap = (attributes) ->
    beforeEach -> subject = new Subject attributes

    it 'creates cols*rows hexagons', ->
      expect(subject.hexagons().length).toEqual 30
    it 'each item in the hexagons collection is filled with an hexagon', ->
      for hexagon in subject.hexagons
        throw new Error index unless hexagon?
        expect(hexagon.constructor.name).toEqual 'Hexagon'
    it 'each hexagon has the same size', ->
      firstHexagon = subject.hexagons[0]
      for hexagon, index in subject.hexagons when index > 0
        expect(hexagon.size()).toEqual firstHexagon.size()

  describe 'constructor', ->
    describe 'when flatTopped is false', ->
      itBehavesLikeAPointlyToppedMap = (attributes) ->
        attributes.flatTopped = false
        itBehavesLikeAMap attributes
        beforeEach -> subject = new Subject attributes

        describe 'and offsetLayout is "odd"', ->
          beforeEach ->
            attributes.offsetLayout = 'odd'
            subject = new Subject attributes

          it 'each hexagon in an even row is at the expected position', ->
            eachHexagon ((o) -> o.r % 2 is 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * hexagon.size().width),
                y: round(o.r * round(hexagon.size().height * 0.75))

          it 'each hexagon in an odd row is moved right by half its height', ->
            eachHexagon ((o) -> o.r % 2 isnt 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * hexagon.size().width + hexagon.size().width / 2),
                y: round(o.r * round(hexagon.size().height * 0.75))

          eachHexSharesEdgeAndVertices ((o) -> o.c > 0), {c: -1}, 2, 5

          describe 'each hexagon in an odd row', ->
            eachHexSharesEdgeAndVertices ((o) -> o.r % 2 isnt 0), {r: -1}, 3, 0
            eachHexSharesEdgeAndVertices ((o) -> o.r % 2 isnt 0 and o.c < subject.cols - 1), {r: -1, c: 1}, 4, 1

          describe 'each hexagon in an even row', ->
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.r % 2 is 0 and o.c > 0), {r: -1, c: -1}, 3, 0
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.r % 2 is 0), {r: -1}, 4, 1

        describe 'and offsetLayout is "even"', ->
          beforeEach ->
            attributes.offsetLayout = 'even'
            subject = new Subject attributes

          it 'each hexagon in an odd row is at the expected position', ->
            eachHexagon ((o) -> o.r % 2 isnt 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * hexagon.size().width),
                y: round(o.r * round(hexagon.size().height * 0.75))

          it 'each hexagon in an even row is moved right by half its height', ->
            eachHexagon ((o) -> o.r % 2 is 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * hexagon.size().width + hexagon.size().width / 2),
                y: round(o.r * round(hexagon.size().height * 0.75))

          eachHexSharesEdgeAndVertices ((o) -> o.c > 0), {c: -1}, 2, 5

          describe 'each hexagon in an odd row', ->
            eachHexSharesEdgeAndVertices ((o) -> o.r % 2 isnt 0 and o.c > 0), {r: -1, c: -1}, 3, 0
            eachHexSharesEdgeAndVertices ((o) -> o.r % 2 isnt 0), {r: -1}, 4, 1

          describe 'each hexagon in an even row', ->
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.r % 2 is 0), {r: -1}, 3, 0
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.r % 2 is 0 and o.c < subject.cols - 1),
              {r: -1, c: 1}, 4, 1

      describe 'and an invalid hexagon property is passed', ->
        it 'throws an error', ->
          expect ->
            new Subject hexagon: { asd: 'foo', bar: 'baz' }
          .toThrowError "Unknown hexagon directive. You have to pass the radius or at least one dimension"
      describe 'when cols and rows are provided', ->
        describe 'and only one hexagon dimension is passed', ->
          itBehavesLikeAPointlyToppedMap hexagon: { width: 10 }, cols: 5, rows: 6
        describe 'and both hexagon dimensions are passed', ->
          itBehavesLikeAPointlyToppedMap hexagon: { height: 10, width: 10 }, cols: 5, rows: 6
        describe 'and hexagon radius is passed', ->
          itBehavesLikeAPointlyToppedMap hexagon: { radius: 5 }, cols: 5, rows: 6
        describe 'and width and height are passed', ->
          it 'detects each hexagon size', ->
            subject = new Subject width: 55, height: 102, cols: 5, rows: 6
            expect(subject.matrix[0][0].size()).toEqual new Size 10, 21.5
          itBehavesLikeAPointlyToppedMap width: 55, height: 102, cols: 5, rows: 6

      describe '#size.width', ->
        it 'returns the total width of each hexagon plus half the width of an hexagon', ->
          subject = new Subject hexagon: { width: 10 }, rows: 2, cols: 3
          expect(subject.size().width).toEqual 35

      describe '#size.height', ->
        it 'returns the total height of each hexagon', ->
          subject = new Subject hexagon: { height: 10 }, cols: 2, rows: 3
          expect(subject.size().height).toEqual 25

    describe 'when flatTopped is true', ->
      itBehavesLikeAFlatToppedMap = (attributes) ->
        attributes.flatTopped = true
        itBehavesLikeAMap attributes
        subject = null
        beforeEach -> subject = new Subject attributes

        describe 'and offsetLayout is "odd"', ->
          beforeEach ->
            attributes.offsetLayout = 'odd'
            subject = new Subject attributes

          it 'each hexagon in an even column is at the expected position', ->
            eachHexagon ((o) -> o.c % 2 is 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * round(0.75 * hexagon.size().width)),
                y: round(o.r * hexagon.size().height)

          it 'each hexagon in an odd column is moved bottom by half its height', ->
            eachHexagon ((o) -> o.c % 2 isnt 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * round(0.75 * hexagon.size().width)),
                y: round(hexagon.size().height / 2 + round(o.r * hexagon.size().height))

          eachHexSharesEdgeAndVertices ((o) -> o.r > 0), {r: -1}, 4, 1

          describe 'each hexagon in an odd column', ->
            eachHexSharesEdgeAndVertices ((o) -> o.c % 2 isnt 0), {c: -1}, 3, 0

          describe 'each hexagon in an even col', ->
            eachHexSharesEdgeAndVertices ((o) -> o.c > 0 and o.c % 2 is 0), {c: -1}, 2, 5
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.c > 0 and o.c % 2 is 0),
              {r: -1, c: -1}, 3, 0
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.c < subject.cols - 1 and o.c % 2 is 0),
              {r: -1, c: 1}, 5, 2

        describe 'and offsetLayout is "even"', ->
          beforeEach ->
            attributes.offsetLayout = 'even'
            subject = new Subject attributes

          it 'each hexagon in an odd column is at the expected position', ->
            eachHexagon ((o) -> o.c % 2 isnt 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * round(0.75 * hexagon.size().width)),
                y: round(o.r * hexagon.size().height)

          it 'each hexagon in an even column is moved bottom by half its height', ->
            eachHexagon ((o) -> o.c % 2 is 0), (hexagon, o) ->
              expect(hexagon.position()).toEqual new Point
                x: round(o.c * round(0.75 * hexagon.size().width)),
                y: round(hexagon.size().height / 2 + round(o.r * hexagon.size().height))

          eachHexSharesEdgeAndVertices ((o) -> o.r > 0), {r: -1}, 4, 1

          describe 'each hexagon in an odd column', ->
            eachHexSharesEdgeAndVertices ((o) -> o.c % 2 > 0), {c: -1}, 2, 5
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.c % 2 isnt 0), {r: -1, c: -1}, 3, 0
            eachHexSharesEdgeAndVertices ((o) -> o.r > 0 and o.c < subject.cols - 1 and o.c % 2 isnt 0),
              {r: -1, c: 1}, 5, 2

          describe 'each hexagon in an even col', ->
            eachHexSharesEdgeAndVertices ((o) -> o.c > 0 and o.c % 2 is 0), {c: -1}, 3, 0

      describe 'when an invalid hexagon property is passed', ->
        it 'throws an error', ->
          expect ->
            new Subject hexagon: { asd: 'foo', bar: 'baz' }, flatTopped: true
          .toThrowError "Unknown hexagon directive. You have to pass the radius or at least one dimension"
      describe 'when cols and rows are provided', ->
        describe 'and only one hexagon dimension is passed', ->
          itBehavesLikeAFlatToppedMap hexagon: { height: 10 }, cols: 5, rows: 6, flatTopped: true
        describe 'and both hexagon dimensions are passed', ->
          itBehavesLikeAFlatToppedMap hexagon: { height: 10, width: 10 }, cols: 5, rows: 6, flatTopped: true
        describe 'and hexagon radius is passed', ->
          itBehavesLikeAFlatToppedMap hexagon: { radius: 5 }, cols: 5, rows: 6, flatTopped: true
        describe 'and width and height are passed', ->
          it 'detects each hexagon size', ->
            subject = new Subject width: 55, height: 102, cols: 5, rows: 6, flatTopped: true
            expect(subject.matrix[0][0].size()).toEqual new Size 13.8, 15.7
          itBehavesLikeAFlatToppedMap width: 55, height: 102, cols: 5, rows: 6

      describe '#size.width', ->
        it 'returns the total width of each hexagon', ->
          subject = new Subject hexagon: { width: 10 }, cols: 3, rows: 2, flatTopped: true
          expect(subject.size().width).toEqual 25

      describe '#size.height', ->
        it 'returns the total height of each hexagon plus half the height of an hexagon', ->
          subject = new Subject hexagon: { height: 10 }, cols: 2, rows: 3, flatTopped: true
          expect(subject.size().height).toEqual 35
