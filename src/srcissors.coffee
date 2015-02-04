Crop = require('./crop')

module.exports = window.srcissors =

  new: ({ arena, view, url }) ->
    new Crop(arguments[0])
