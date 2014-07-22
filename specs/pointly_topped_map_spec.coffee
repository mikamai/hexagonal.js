describe 'PointlyToppedMap', ->
  Subject = Hexagonal.PointlyToppedMap

  it 'is defined in the Hexagonal namespace', ->
    expect(Subject).not.toBeUndefined()

  describe 'constructor', ->
    describe 'when cols and rows are provided', ->
      subject = null
      beforeEach -> subject = new Subject hexagon: { width: 10 }, cols: 5, rows: 6

      it 'creates cols*rows hexagons', ->
        expect(subject.hexagons().length).toEqual 30

      it 'each item in the hexagons collection is filled with an hexagon', ->
        for hexagon in subject.hexagons()
          throw new Error index unless hexagon?
          expect(hexagon.constructor.name).toEqual 'Hexagon'

      it 'each hexagon has the same size', ->
        firstHexagon = subject.hexagons()[0]
        for hexagon, index in subject.hexagons() when index > 0
          expect(hexagon.size()).toEqual firstHexagon.size()

      it 'each hexagon in an even row has the expected position', ->
        for hexagon, index in subject.hexagons()
          [row, col] = [Math.floor(index / 5), index % 5]
          continue if row % 2 isnt 0
          expectedPosition = new Hexagonal.Point
            x: subject._round(col * hexagon.size().width),
            y: subject._round(row * subject._round(hexagon.size().height * 0.75))
          expect(hexagon.position()).toEqual expectedPosition

      it 'each hexagon in an odd row has the expected position', ->
        for hexagon, index in subject.hexagons()
          [row, col] = [Math.floor(index / 5), index % 5]
          continue if row % 2 is 0
          expectedPosition = new Hexagonal.Point
            x: hexagon._round(col * hexagon.size().width + hexagon.size().width / 2),
            y: hexagon._round(row * hexagon._round(hexagon.size().height * 0.75))
          expect(hexagon.position()).toEqual expectedPosition

      it 'each hexagon on the same row shares two vertices with the previous one', ->
        for hexagon, index in subject.hexagons() when index % 5 > 0
          previousOne = subject.hexagons()[index - 1]
          expect(hexagon.vertices()[2]).toBe previousOne.vertices()[0]
          expect(hexagon.vertices()[3]).toBe previousOne.vertices()[5]

      it 'each hexagon on the same row shares one edge with the previous one', ->
        for hexagon, index in subject.hexagons() when index % 5 > 0
          previousOne = subject.hexagons()[index - 1]
          expect(hexagon.halfEdges[2].edge).toBe previousOne.halfEdges[5].edge

      describe 'each hexagon in an odd row', ->
        it 'shares two vertices with its neighbor in -1/0', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip even rows
            continue if row % 2 is 0
            neighbor = subject.at row - 1, col
            expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
            expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

        it 'shares two vertices with its neighbor in -1/+1', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip even rows and last item of odd rows
            continue if row % 2 is 0 or col is 4
            neighbor = subject.at row - 1, col + 1
            expect(hexagon.vertices()[4]).toBe neighbor.vertices()[2]
            expect(hexagon.vertices()[5]).toBe neighbor.vertices()[1]

        it 'shares one edge with its neighbor in -1/0', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip even rows
            continue if row % 2 is 0
            neighbor = subject.at row - 1, col
            expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

        it 'shares one edge with its neighbor in -1/+1', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip even rows and last item of odd rows
            continue if row % 2 is 0 or col is 4
            neighbor = subject.at row - 1, col + 1
            expect(hexagon.halfEdges[4].edge).toBe neighbor.halfEdges[1].edge

      describe 'each hexagon in an even row', ->
        it 'shares two vertices with its neighbor in -1/-1', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip the first row, odd rows and first item of even rows
            continue if row is 0 or row % 2 isnt 0 or col is 0
            neighbor = subject.at row - 1, col - 1
            expect(hexagon.vertices()[3]).toBe neighbor.vertices()[1]
            expect(hexagon.vertices()[4]).toBe neighbor.vertices()[0]

        it 'shares two vertices with its neighbor in -1/0', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip the first row, odd rows and last item of even rows
            continue if row is 0 or row % 2 isnt 0 or col is 4
            neighbor = subject.at row - 1, col
            expect(hexagon.vertices()[4]).toBe neighbor.vertices()[2]
            expect(hexagon.vertices()[5]).toBe neighbor.vertices()[1]

        it 'shares one edge with its neighbor in -1/-1', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip the first row, odd rows and first item of even rows
            continue if row is 0 or row % 2 isnt 0 or col is 0
            neighbor = subject.at row - 1, col - 1
            expect(hexagon.halfEdges[3].edge).toBe neighbor.halfEdges[0].edge

        it 'shares one edge with its neighbor in -1/0', ->
          for hexagon, index in subject.hexagons()
            [row, col] = [Math.floor(index / 5), index % 5]
            # skip the first row, odd rows and last items of even rows
            continue if row is 0 or row % 2 isnt 0 or col is 4
            neighbor = subject.at row - 1, col
            expect(hexagon.halfEdges[4].edge).toBe neighbor.halfEdges[1].edge
