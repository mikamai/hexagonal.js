Hexagonal = {}

for ClassName, Class of require './core/index.coffee'
  Hexagonal[ClassName] = Class

Hexagonal.Hexagon = require './hexagon.coffee'
Hexagonal.Map     = require './map.coffee'
Hexagonal.Cursors = require './cursors/index.coffee'

Hexagonal.precision = Hexagonal.Util.precision
Hexagonal.usingPrecision = (precision, callback) ->
  oldPrecision = Hexagonal.Util.precision()
  Hexagonal.Util.precision precision
  try
    callback()
  finally
    Hexagonal.Util.precision oldPrecision

global.Hexagonal = module.exports = Hexagonal
