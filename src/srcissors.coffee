Crop = require('./crop')

module.exports = window.srcissors =

  new: ({
    arena, url, fit, fixedWidth, fixedHeight, minWidth, minHeight,
    minRatio, maxRatio, maxArea, zoomStep
  }) ->
    arena = $(arena)
    view = arena.find('.crop-view')
    preview = view.find('.crop-preview')
    img = $('<img>')
    preview.append(img)
    outline = view.find('.crop-outline')
    outline = undefined if not outline.length

    zoomStep ?= 1.25

    minWidth ?= 50
    minHeight ?= 50

    if fixedWidth? || fixedHeight?
      fit = false

    new Crop
      url: url # {String}
      arena: arena # {jQuery Element}
      view: view # {jQuery Element}
      img: img # {jQuery Element}
      outline: outline # {jQuery Element or undefined}
      fit: fit # {Boolean}
      fixedWidth: fixedWidth # {Number} e.g. 300
      fixedHeight: fixedHeight # {Number} e.g. 500
      minViewWidth: minWidth # {Number} e.g. 100
      minViewHeight: minHeight # {Number} e.g. 100
      minViewRatio: minRatio # {Number} e.g. 1.5/2
      maxViewRatio: maxRatio # {Number} e.g. 2/1
      maxArea: maxArea # {Number} 0.8 -> max 80% of arena area are covered by the preview
      zoomStep: zoomStep # {Number} e.g. 1.25 -> 125%

