describe 'Map', ->
  Subject = Hexagonal.Map
  Size    = Hexagonal.Size
  Point   = Hexagonal.Point
  subject = null

  it 'is defined in the Hexagonal namespace', ->
    expect(Subject).not.toBeUndefined()

  eachHexagon = (offsetCondition, callback) ->
    for hexagon, index in subject.hexagons
      [row, col] = [Math.floor(index / subject.cols), index % subject.cols]
      o = { r: row, c: col, i: index }
      callback(hexagon, o) if offsetCondition(o)

  itBehavesLikeAMap = (attributes) ->
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

  describe 'constructor', ->
    describe 'when flatTopped is false', ->
      itBehavesLikeAPointlyToppedMap = (attributes) ->
        attributes.flatTopped = false
        itBehavesLikeAMap attributes
        beforeEach -> subject = new Subject attributes

        it 'each hexagon in an even row has the expected position', ->
          eachHexagon ((o) -> o.r % 2 is 0), (hexagon, o) ->
            expect(hexagon.position()).toEqual new Point
              x: subject._round(o.c * hexagon.size().width),
              y: subject._round(o.r * subject._round(hexagon.size().height * 0.75))

        it 'each hexagon in an odd row has the expected position', ->
          eachHexagon ((o) -> o.r % 2 isnt 0), (hexagon, o) ->
            expect(hexagon.position()).toEqual new Point
              x: hexagon._round(o.c * hexagon.size().width + hexagon.size().width / 2),
              y: hexagon._round(o.r * hexagon._round(hexagon.size().height * 0.75))

        it 'each hexagon on the same row shares two vertices with the previous one', ->
          for hexagon, index in subject.hexagons when index % 5 > 0
            previousOne = subject.hexagons[index - 1]
            expect(hexagon.vertices()[2]).toBe previousOne.vertices()[0]
            expect(hexagon.vertices()[3]).toBe previousOne.vertices()[5]

        it 'each hexagon on the same row shares one edge with the previous one', ->
          for hexagon, index in subject.hexagons when index % 5 > 0
            previousOne = subject.hexagons[index - 1]
            expect(hexagon.halfEdges[2].edge).toBe previousOne.halfEdges[5].edge

        describe 'each hexagon in an odd row', ->
          it 'shares two vertices with its neighbor in -1/0', ->
            eachHexagon ((o) -> o.r % 2 isnt 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c
              expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
              expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

          it 'shares two vertices with its neighbor in -1/+1', ->
            eachHexagon ((o) -> o.r % 2 isnt 0 and o.c isnt subject.cols - 1), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c + 1
              expect(hexagon.vertices()[4]).toBe neighbor.vertices()[2]
              expect(hexagon.vertices()[5]).toBe neighbor.vertices()[1]

          it 'shares one edge with its neighbor in -1/0', ->
            eachHexagon ((o) -> o.r % 2 isnt 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c
              expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

          it 'shares one edge with its neighbor in -1/+1', ->
            eachHexagon ((o) -> o.r % 2 isnt 0 and o.c isnt subject.cols - 1), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c + 1
              expect(hexagon.halfEdges[4].edge).toBe neighbor.halfEdges[1].edge

        describe 'each hexagon in an even row', ->
          it 'shares two vertices with its neighbor in -1/-1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.r % 2 is 0 and o.c isnt 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c - 1
              expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
              expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

          it 'shares two vertices with its neighbor in -1/0', ->
            eachHexagon ((o) -> o.r is 0 and o.r % 2 isnt 0 and o.c isnt subject.cols - 1),
              (hexagon, o) ->
                neighbor = subject.at o.r - 1, o.c
                expect(hexagon.vertices()[4]).toBe neighbor.vertices()[2]
                expect(hexagon.vertices()[5]).toBe neighbor.vertices()[1]

          it 'shares one edge with its neighbor in -1/-1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.r % 2 is 0 and o.c isnt 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c - 1
              expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

          it 'shares one edge with its neighbor in -1/0', ->
            eachHexagon ((o) -> o.r isnt 0 and o.r % 2 is 0 and o.c isnt subject.cols - 1),
              (hexagon, o) ->
                neighbor = subject.at o.r - 1, o.c
                expect(hexagon.halfEdges[4].edge).toBe neighbor.halfEdges[1].edge

      describe 'and an invalid hexagon property is passed', ->
        it 'throws an error', ->
          expect ->
            new Subject hexagon: { asd: 'foo', bar: 'baz' }
          .toThrowError 'Unknown Hexagon properties: asd, bar'
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
            expect(subject.at(0, 0).size()).toEqual new Size 11, 15.7
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

        it 'each hexagon in an even column has the expected position', ->
          eachHexagon ((o) -> o.c % 2 is 0), (hexagon, o) ->
            expect(hexagon.position()).toEqual new Point
              x: subject._round(o.c * subject._round(0.75 * hexagon.size().width)),
              y: subject._round(o.r * hexagon.size().height)

        it 'each hexagon in an odd column has the expected position', ->
          eachHexagon ((o) -> o.c % 2 isnt 0), (hexagon, o) ->
            expect(hexagon.position()).toEqual new Point
              x: subject._round(o.c * subject._round(0.75 * hexagon.size().width)),
              y: subject._round(hexagon.size().height / 2 + subject._round(o.r * hexagon.size().height))

        it 'each hexagon on the same column shares two vertices with the previous one', ->
          eachHexagon ((o) -> o.r isnt 0), (hexagon, o) ->
            previousOne = subject.at o.r - 1, o.c
            expect(hexagon.vertices()[4]).toBe previousOne.vertices()[2]
            expect(hexagon.vertices()[5]).toBe previousOne.vertices()[1]

        it 'each hexagon on the same column shares one edge with the previous one', ->
          eachHexagon ((o) -> o.r isnt 0), (hexagon, o) ->
            previousOne = subject.at o.r - 1, o.c
            expect(hexagon.halfEdges[4].edge).toBe previousOne.halfEdges[1].edge

        describe 'each hexagon in an odd column', ->
          it 'shares two vertices with its neighbor in 0/-1', ->
            eachHexagon ((o) -> o.c % 2 isnt 0 and o.r isnt 0), (hexagon, o) ->
              neighbor = subject.at o.r, o.c - 1
              expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
              expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

          it 'shares one edge with its neighbor in 0/-1', ->
            eachHexagon ((o) -> o.c % 2 isnt 0 and o.r isnt 0), (hexagon, o) ->
              neighbor = subject.at o.r, o.c - 1
              expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

        describe 'each hexagon in an even col', ->
          it 'shares two vertices with its neighbor in -1/-1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.c isnt 0 and o.c % 2 is 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c - 1
              expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
              expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

          it 'shares two vertices with its neighbor in 0/-1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.c isnt 0 and o.c % 2 is 0), (hexagon, o) ->
              neighbor = subject.at o.r, o.c - 1
              expect(hexagon.vertices()[2]).toBe neighbor.vertices()[0]
              expect(hexagon.vertices()[3]).toBe neighbor.vertices()[5]

          it 'shares two vertices with its neighbor in -1/+1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.c isnt 4 and o.c % 2 is 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c + 1
              expect(hexagon.vertices()[0]).toBe neighbor.vertices()[2]
              expect(hexagon.vertices()[5]).toBe neighbor.vertices()[3]

          it 'shares one edge with its neighbor in -1/-1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.c isnt 0 and o.c % 2 is 0), (hexagon, o) ->
              neighbor = subject.at o.r - 1, o.c - 1
              expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

          it 'shares one edge with its neighbor in 0/-1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.c isnt 0 and o.c % 2 is 0), (hexagon, o) ->
              neighbor = subject.at o.r, o.c - 1
              expect(hexagon.halfEdges[2].edge).toBe neighbor.halfEdges[5].edge

          it 'shares one edge with its neighbor -1/+1', ->
            eachHexagon ((o) -> o.r isnt 0 and o.c isnt subject.cols - 1 and o.c % 2 is 0),
              (hexagon, o) ->
                neighbor = subject.at o.r - 1, o.c + 1
                expect(hexagon.halfEdges[5].edge).toBe neighbor.halfEdges[2].edge

      describe 'when an invalid hexagon property is passed', ->
        it 'throws an error', ->
          expect ->
            new Subject hexagon: { asd: 'foo', bar: 'baz' }, flatTopped: true
          .toThrowError 'Unknown Hexagon properties: asd, bar'
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
            expect(subject.at(0, 0).size()).toEqual new Size 10, 17
          itBehavesLikeAFlatToppedMap width: 55, height: 102, cols: 5, rows: 6

      describe '#size.width', ->
        it 'returns the total width of each hexagon', ->
          subject = new Subject hexagon: { width: 10 }, cols: 3, rows: 2, flatTopped: true
          expect(subject.size().width).toEqual 25

      describe '#size.height', ->
        it 'returns the total height of each hexagon plus half the height of an hexagon', ->
          subject = new Subject hexagon: { height: 10 }, cols: 2, rows: 3, flatTopped: true
          expect(subject.size().height).toEqual 35
