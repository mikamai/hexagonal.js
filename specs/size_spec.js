describe('Size', function() {
  var Subject = Hexagonal.Size;

  it('is defined in the Hexagonal namespace', function() {
    expect(Hexagonal.Size).not.toBeUndefined();
  });

  describe('constructor', function() {
    it('accepts width as option', function() {
      expect(new Subject({width: 5}).width).toBe(5);
    });

    it('accepts height as option', function() {
      expect(new Subject({height: 5}).height).toBe(5);
    });

    it('accepts width as parameter', function() {
      expect(new Subject(5).width).toBe(5);
    });

    it('accepts height as parameter', function() {
      expect(new Subject(5, 6).height).toBe(6);
    });
  });
});
