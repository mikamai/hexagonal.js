describe('Point', function() {
  var Subject = Hexagonal.Point;

  it('is defined in the Hexagonal namespace', function() {
    expect(Hexagonal.Point).not.toBeUndefined();
  });

  describe('constructor', function() {
    it('accepts x coordinate as option', function() {
      expect(new Subject({x: 5}).x).toBe(5);
    });

    it('accepts y coordinate as option', function() {
      expect(new Subject({y: 5}).y).toBe(5);
    });

    it('accepts x coordinate as parameter', function() {
      expect(new Subject(5).x).toBe(5);
    });

    it('accepts y coordinate as parameter', function() {
      expect(new Subject(5, 6).y).toBe(6);
    });
  });

  describe('#sum', function() {
    var subject;

    beforeEach(function() {
      subject = new Subject(5,1);
    });

    it('returns a new point', function() {
      expect(subject.sum(1,1)).not.toEqual(subject);
    });

    it('returns as x the current x plus the given one', function() {
      expect(subject.sum(1,1).x).toEqual(6);
    });

    it('returns as y the current y plus the given one', function() {
      expect(subject.sum(1,1).y).toEqual(2);
    });

    it('accepts x and y as options', function() {
      expect(subject.sum({x: 3, y: 3}).x).toEqual(8);
    });
  });

  describe('#sub', function() {
    var subject;

    beforeEach(function() {
      subject = new Subject(5,1);
    });

    it('returns a new point', function() {
      expect(subject.sub(1,1)).not.toEqual(subject);
    });

    it('returns as x the current x plus the given one', function() {
      expect(subject.sub(1,1).x).toEqual(4);
    });

    it('returns as y the current y plus the given one', function() {
      expect(subject.sub(1,1).y).toEqual(0);
    });

    it('accepts x and y as options', function() {
      expect(subject.sub({x: 3, y: 3}).x).toEqual(2);
    });
  });
});
