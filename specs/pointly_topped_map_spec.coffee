describe 'PointlyToppedMap', ->
  Subject = Hexagonal.PointlyToppedMap
  Size    = Hexagonal.Size

  it 'is defined in the Hexagonal namespace', ->
    expect(Subject).not.toBeUndefined()

  itBehavesLikeAPointlyToppedMap = (Subject, attributes) ->
    itBehavesLikeAMap Subject, attributes

    subject = null
    beforeEach -> subject = new Subject attributes

    it 'each hexagon in an even row has the expected position', ->
      for hexagon, index in subject.hexagons
        [row, col] = [Math.floor(index / 5), index % 5]
        continue if row % 2 isnt 0
        expectedPosition = new Hexagonal.Point
          x: subject._round(col * hexagon.size().width),
          y: subject._round(row * subject._round(hexagon.size().height * 0.75))
        expect(hexagon.position()).toEqual expectedPosition

    it 'each hexagon in an odd row has the expected position', ->
      for hexagon, index in subject.hexagons
        [row, col] = [Math.floor(index / 5), index % 5]
        continue if row % 2 is 0
        expectedPosition = new Hexagonal.Point
          x: hexagon._round(col * hexagon.size().width + hexagon.size().width / 2),
          y: hexagon._round(row * hexagon._round(hexagon.size().height * 0.75))
        expect(hexagon.position()).toEqual expectedPosition

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
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip even rows
          continue if row % 2 is 0
          neighbor = subject.at row - 1, col
          expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
          expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

      it 'shares two vertices with its neighbor in -1/+1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip even rows and last item of odd rows
          continue if row % 2 is 0 or col is 4
          neighbor = subject.at row - 1, col + 1
          expect(hexagon.vertices()[4]).toBe neighbor.vertices()[2]
          expect(hexagon.vertices()[5]).toBe neighbor.vertices()[1]

      it 'shares one edge with its neighbor in -1/0', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip even rows
          continue if row % 2 is 0
          neighbor = subject.at row - 1, col
          expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

      it 'shares one edge with its neighbor in -1/+1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip even rows and last item of odd rows
          continue if row % 2 is 0 or col is 4
          neighbor = subject.at row - 1, col + 1
          expect(hexagon.halfEdges[4].edge).toBe neighbor.halfEdges[1].edge

    describe 'each hexagon in an even row', ->
      it 'shares two vertices with its neighbor in -1/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, odd rows and first item of even rows
          continue if row is 0 or row % 2 isnt 0 or col is 0
          neighbor = subject.at row - 1, col - 1
          expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
          expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

      it 'shares two vertices with its neighbor in -1/0', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, odd rows and last item of even rows
          continue if row is 0 or row % 2 isnt 0 or col is 4
          neighbor = subject.at row - 1, col
          expect(hexagon.vertices()[4]).toBe neighbor.vertices()[2]
          expect(hexagon.vertices()[5]).toBe neighbor.vertices()[1]

      it 'shares one edge with its neighbor in -1/-1', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, odd rows and first item of even rows
          continue if row is 0 or row % 2 isnt 0 or col is 0
          neighbor = subject.at row - 1, col - 1
          expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

      it 'shares one edge with its neighbor in -1/0', ->
        for hexagon, index in subject.hexagons
          [row, col] = [Math.floor(index / 5), index % 5]
          # skip the first row, odd rows and last items of even rows
          continue if row is 0 or row % 2 isnt 0 or col is 4
          neighbor = subject.at row - 1, col
          expect(hexagon.halfEdges[4].edge).toBe neighbor.halfEdges[1].edge

  describe 'constructor', ->
    describe 'and an invalid hexagon property is passed', ->
      it 'throws an error', ->
        expect ->
          new Subject hexagon: { asd: 'foo', bar: 'baz' }
        .toThrowError 'Unknown Hexagon properties: asd, bar'
    describe 'when cols and rows are provided', ->
      describe 'and only one hexagon dimension is passed', ->
        itBehavesLikeAPointlyToppedMap Subject, hexagon: { width: 10 }, cols: 5, rows: 6
      describe 'and both hexagon dimensions are passed', ->
        itBehavesLikeAPointlyToppedMap Subject, hexagon: { height: 10, width: 10 }, cols: 5, rows: 6
      describe 'and hexagon radius is passed', ->
        itBehavesLikeAPointlyToppedMap Subject, hexagon: { radius: 5 }, cols: 5, rows: 6
      describe 'and width and height are passed', ->
        it 'desumes each hexagon size', ->
          subject = new Subject width: 55, height: 102, cols: 5, rows: 6
          expect(subject.at(0, 0).size()).toEqual new Size 11, 15.7
        itBehavesLikeAPointlyToppedMap Subject, width: 55, height: 102, cols: 5, rows: 6

  describe '#size.width', ->
    it 'returns the total width of each hexagon plus half the width of an hexagon', ->
      subject = new Subject hexagon: { width: 10 }, rows: 2, cols: 3
      expect(subject.size().width).toEqual 35

  describe '#size.height', ->
    it 'returns the total height of each hexagon', ->
      subject = new Subject hexagon: { height: 10 }, cols: 2, rows: 3
      expect(subject.size().height).toEqual 30
