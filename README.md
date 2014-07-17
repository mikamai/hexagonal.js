# Hexagonal Map for JS

Use grunt to run tests and compile into javascript. Running grunt will:

1. compile [src/hexagonal/index.coffee](src/hexagonal/index.coffee) into `build/hexagonal.js` (via browserify)
2. compile `specs/**/*_spec.coffee` into `build/specs.js` and `specs/spec_helper.coffee` into `build/spec_helper.js`
3. run the test suite using jasmine + phantomjs
4. clean `build/specs.js` and `build/spec_helper.js`
