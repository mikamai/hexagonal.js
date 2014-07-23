describe 'FlatToppedMap', ->
  Subject = Hexagonal.FlatToppedMap
  Size    = Hexagonal.Size

  it 'is defined in the Hexagonal namespace', ->
    expect(Subject).not.toBeUndefined()

  itBehavesLikeAFlatToppedMap = (Subject, attributes) ->
    itBehavesLikeAMap Subject, attributes
    subject = null
    beforeEach -> subject = new Subject attributes

    it 'each hexagon in an even column has the expected position', ->
      for hexagon, index in subject.hexagons
        [row, col] = [Math.floor(index / 5), index % 5]
        continue if col % 2 isnt 0
        expectedPosition = new Hexagonal.Point
          x: subject._round(col * subject._round(0.75 * hexagon.size().width)),
          y: subject._round(row * hexagon.size().height)
        expect(hexagon.position()).toEqual expectedPosition

    it 'each hexagon in an odd column has the expected position', ->
      for hexagon, index in subject.hexagons
        [row, col] = [Math.floor(index / 5), index % 5]
        continue if col % 2 is 0
        expectedPosition = new Hexagonal.Point
          x: subject._round(col * subject._round(0.75 * hexagon.size().width)),
          y: subject._round(hexagon.size().height / 2 + subject._round(row * hexagon.size().height))
        expect(hexagon.position()).toEqual expectedPosition

    it 'each hexagon on the same column shares two vertices with the previous one', ->
      for hexagon, index in subject.hexagons
        [row, col] = [Math.floor(index / 5), index % 5]
        continue if row is 0
        previousOne = subject.at row - 1, col
        expect(hexagon.vertices()[4]).toBe previousOne.vertices()[2]
        expect(hexagon.vertices()[5]).toBe previousOne.vertices()[1]

    it 'each hexagon on the same column shares one edge with the previous one', ->
      for hexagon, index in subject.hexagons
        [row, col] = [Math.floor(index / 5), index % 5]
        continue if row is 0
        previousOne = subject.at row - 1, col
        expect(hexagon.halfEdges[4].edge).toBe previousOne.halfEdges[1].edge

    describe 'each hexagon in an odd column', ->
      it 'shares two vertices with its neighbor in 0/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip even cols and first row
          continue if col % 2 is 0 or row is 0
          neighbor = subject.at row, col - 1
          unless hexagon.vertices()[4] is neighbor.vertices()[0]
            throw new Error 'asd'
          expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
          expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

      it 'shares one edge with its neighbor in 0/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip even cols and first row
          continue if col % 2 is 0 or row is 0
          neighbor = subject.at row, col - 1
          expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

    describe 'each hexagon in an even col', ->
      it 'shares two vertices with its neighbor in -1/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, the first column and odd cols
          continue if row is 0 or col is 0 or col % 2 isnt 0
          neighbor = subject.at row - 1, col - 1
          expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
          expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

      it 'shares two vertices with its neighbor in 0/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, the first col and odd cols
          continue if row is 0 or col is 0 or col % 2 isnt 0
          neighbor = subject.at row, col - 1
          expect(hexagon.vertices()[2]).toBe neighbor.vertices()[0]
          expect(hexagon.vertices()[3]).toBe neighbor.vertices()[5]

      it 'shares two vertices with its neighbor in -1/+1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, the last col and odd cols
          continue if row is 0 or col is 4 or col % 2 isnt 0
          neighbor = subject.at row - 1, col + 1
          expect(hexagon.vertices()[0]).toBe neighbor.vertices()[2]
          expect(hexagon.vertices()[5]).toBe neighbor.vertices()[3]

      it 'shares one edge with its neighbor in -1/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, the first col and odd cols
          continue if row is 0 or col is 0 or col % 2 isnt 0
          neighbor = subject.at row - 1, col - 1
          expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

      it 'shares one edge with its neighbor in 0/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, the first col and odd cols
          continue if row is 0 or col is 0 or col % 2 isnt 0
          neighbor = subject.at row, col - 1
          expect(hexagon.halfEdges[2].edge).toBe neighbor.halfEdges[5].edge

      it 'shares one edge with its neighbor -1/+1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, the last col and odd cols
          continue if row is 0 or col is 4 or col % 2 isnt 0
          neighbor = subject.at row - 1, col + 1
          expect(hexagon.halfEdges[5].edge).toBe neighbor.halfEdges[2].edge

  describe 'constructor', ->
    describe 'when an invalid hexagon property is passed', ->
      it 'throws an error', ->
        expect ->
          new Subject hexagon: { asd: 'foo', bar: 'baz' }
        .toThrowError 'Unknown Hexagon properties: asd, bar'
    describe 'when cols and rows are provided', ->
      describe 'and only one hexagon dimension is passed', ->
        itBehavesLikeAFlatToppedMap Subject, hexagon: { height: 10 }, cols: 5, rows: 6
      describe 'and both hexagon dimensions are passed', ->
        itBehavesLikeAFlatToppedMap Subject, hexagon: { height: 10, width: 10 }, cols: 5, rows: 6
      describe 'and hexagon radius is passed', ->
        itBehavesLikeAFlatToppedMap Subject, hexagon: { radius: 5 }, cols: 5, rows: 6
      describe 'and width and height are passed', ->
        it 'desumes each hexagon size', ->
          subject = new Subject width: 55, height: 102, cols: 5, rows: 6
          expect(subject.at(0, 0).size()).toEqual new Size 10, 17
        itBehavesLikeAFlatToppedMap Subject, width: 55, height: 102, cols: 5, rows: 6

  describe '#size.width', ->
    it 'returns the total width of each hexagon', ->
      subject = new Subject hexagon: { width: 10 }, cols: 2, rows: 2
      expect(subject.size().width).toEqual 20

  describe '#size.height', ->
    it 'returns the total height of each hexagon plus half the height of an hexagon', ->
      subject = new Subject hexagon: { height: 10 }, cols: 2, rows: 3
      expect(subject.size().height).toEqual 35
