Crop = require('./crop')

module.exports = window.srcissors =

  new: ({
    arena, view, url, fit, fixedWidth, fixedHeight, minViewWidth, minViewHeight,
    minViewRatio, maxViewRatio, maxAreaRatio
  }) ->
    arena = $(arena)
    view = $(view)
    img = view.find('img')
    outline = view.find('.image-outline')
    outline = undefined if not outline.length

    if fixedWidth? || fixedHeight?
      fit = false

    new Crop
      url: url
      arena: arena
      view: view
      img: img
      outline: outline
      fit: fit


  # configurations
  # --------------
  #
  # Fixed Width or Height:
  # fixedWidth: 300
  # fit: false
  # minViewWidth: 100
  # minViewHeight: 100
  # minViewRatio: 1 / 2
  # maxViewRatio: 2 / 1
  #
  # Dynamic fit:
  # fit: true
  # maxAreaRatio: 3 / 4
