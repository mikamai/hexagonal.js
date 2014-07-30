# Hexagonal Map for JS

Hexagon and Hexagonal Maps management library written in Javascript.

## API

### The Hexagon object

An hexagon can be inscribed in a circle, so you can create one passing the
circumference radius and, optionally, the circumference center:

```coffeescript
# Regular hexagon inscribed in a circle with center in 5,5 and a radius of 10
hexagon = Hexagonal.Hexagon.byRadius 10, center: { x: 5, y: 5 }
```

You can create an hexagon with a given size:

```coffeescript
# Regular hexagon with a height of 10 and width of 10 * sqrt(3)/2
hexagon = Hexagonal.Hexagon.bySize { height: 10 }
# Hexagon with a width of 10 and a height of 5
hexagon = Hexagonal.Hexagon.bySize { width: 10, height: 5 }
```

Both the methods above will create the vertices collections.
But if you want you can create an hexagon passing your custom vertices:

```coffeescript
# A weird hexagonal polygon
vertices = (new Hexagonal.Vertex(i*5, i*10) for i in [0...6])
hexagon = Hexagonal.Hexagon.byVertices vertices
```

To each of the methods described above you can pass additional options to customize the hexagon:

- `flatTopped` (default: `false`) By default the hexagon is treated as _pointly topped_. If you want to have a _flat topped_ hexagon, set this value to `true`.
- `position` (default: `new Hexagonal.Point(0, 0)`) Set this if you want to place the hexagon in a specific position

### Hexagonal Map

```coffeescript
# map of 10x10 composed by regular hexagons with a width of 10
new Hexagonal.Map cols: 10, rows: 10, hexagon: { width: 10 }
# map of 10x10 composed by hexagons with a size of 2x3
new Hexagonal.Map cols: 10, rows: 10, hexagon: { width: 2, height: 3 }
# map of 10x10 composed by regular hexagons inscribed in a circumference with
# a radius of 10
new Hexagonal.Map cols: 10, rows: 10, hexagon: { radius: 10 }
# map of 10x10 with a total width of 500. The total width will be divided by
# cols to obtain each hexagon width
new Hexagonal.Map cols: 10, rows: 10, width: 500
# map of 10x10 with a total width of 500 and a total height of 500. The total
# width and height will be divided by cols and rows to obtain each hexagon size
new Hexagonal.Map cols: 10, rows: 10, width: 500, height: 500
```

Once you have the map, you can choose which Cursor you want to use to navigate it:

#### Offset Cursor

```coffeescript
map = new Hexagonal.Map rows: 5, cols: 5, hexagon: { radius: 5 }
cursor = new Hexagonal.Cursors.Offset map, 0, 0 # offset cursor, set in 0,0 (first hexagon)
cursor.moveTo 2, 2 # move to the center and returns the current hexagon
cursor.hexagon # => returns the current hexagon
```

#### Axial Cursor

```coffeescript
map = new Hexagonal.Map rows: 5, cols: 5, hexagon: { radius: 5 }
cursor = new Hexagonal.Cursors.Axial map, 0, 0 # offset cursor, set in 0,0 (map center)
cursor.moveTo 2, 2 # move to the last hexagon of the map and returns the current hexagon
cursor.hexagon # => returns the current hexagon
```

### Precision

To arginate floating point rounding errors each calculation in Hexagonal will be
rounded to 1 decimal digit. If you want to change it, you can set how many decimal
digits to use:

```coffeescript
Hexagonal.precision() # => 1
Hexagonal.Util.round(3.123) # => 3.1
Hexagonal.precision(2)
Hexagonal.Util.round(3.12) # => 3.12
```

## Tests

Use grunt to run tests and compile into javascript. Running grunt will:

1. compile [src/hexagonal/index.coffee](src/hexagonal/index.coffee) into `build/hexagonal.js` (via browserify)
2. compile `specs/**/*_spec.coffee` into `build/specs.js` and `specs/spec_helper.coffee` into `build/spec_helper.js`
3. run the test suite using jasmine + phantomjs
4. clean `build/specs.js` and `build/spec_helper.js`
