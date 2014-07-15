describe('Hexagon', function() {
  var Subject = Hexagonal.Hexagon;

  it('is defined in the Hexagonal namespace', function() {
    expect(Hexagonal.Hexagon).not.toBeUndefined();
  });

  describe('constructor', function() {
    it('accepts the width', function() {
      expect(new Subject({width: 10}).size().width).toBe(10);
    });

    it('accepts the height', function() {
      expect(new Subject({height: 20}).size().height).toBe(20);
    });

    describe('when both width and height are omitted', function() {
      it('throws an error', function() {
        expect(function() {
          new Subject
        }).toThrowError("You have to provide at least one dimension (width or height)");
      });
    });

    describe('when width is omitted', function() {
      it('width is desumed using the height value', function() {
        expect(new Subject({height: 20}).size().width).toBe(17.32050807568877);
      });
    });

    describe('when height is omitted', function() {
      it('height is desumed using the width value', function() {
        expect(new Subject({width: 10}).size().height).toBe(11.547005383792516);
      });
    });
  });

  describe('#position', function() {
    var subject;
    beforeEach(function() {
      subject = new Subject({width: 10});
    });

    it('is set to the origin by default', function() {
      expect(subject.position()).toEqual(new Hexagonal.Point());
    });

    it('can be set using x option in constructor', function() {
      subject = new Subject({width: 10, x: 10});
      expect(subject.position().x).toBe(10);
    });

    it('can be set using y option in constructor', function() {
      subject = new Subject({width: 10, y: 10});
      expect(subject.position().y).toBe(10);
    });
  });

  describe('#center', function() {
    var subject;
    beforeEach(function() {
      subject = new Subject({width: 10});
    });

    it('returns a point', function() {
      expect(subject.center().constructor).toEqual(Hexagonal.Point);
    });

    describe('when the Hexagon is built using no positioning attribute', function() {
      beforeEach(function() {
        subject = new Subject({width: 10});
      });

      it('is desumed using size and starting from the origin', function() {
        expect(subject.center()).toEqual(new Hexagonal.Point(5,5.773502691896258));
      });
    });

    describe('when the Hexagon is built using plain position', function() {
      beforeEach(function() {
        subject = new Subject({x: 5, y: 5, width: 10});
      });

      it('is desumed using position and size', function() {
        expect(subject.center()).toEqual(new Hexagonal.Point(10,10.773502691896258));
      });
    });

    describe('when the Hexagon is built using center position', function() {
      beforeEach(function() {
        subject = new Subject({width: 10, center: { x: 10, y: 10 }});
      });

      it('is equal to the given coordinates', function() {
        expect(subject.center()).toEqual(new Hexagonal.Point(10, 10));
      });
    });
  });
});
