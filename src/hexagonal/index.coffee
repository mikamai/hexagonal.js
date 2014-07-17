Hexagonal = {}

for ClassName, Class of require './core/index.coffee'
  Hexagonal[ClassName] = Class

Hexagonal.Hexagon = require './hexagon.coffee'

global.Hexagonal = module.exports = Hexagonal
