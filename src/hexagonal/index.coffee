Hexagonal = {}

for ClassName, Class of require './core/index.coffee'
  Hexagonal[ClassName] = Class

Hexagonal.Hexagon          = require './hexagon.coffee'
Hexagonal.AbstractMap      = require './abstract_map.coffee'
Hexagonal.PointlyToppedMap = require './pointly_topped_map.coffee'
Hexagonal.FlatToppedMap    = require './flat_topped_map.coffee'

global.Hexagonal = module.exports = Hexagonal
