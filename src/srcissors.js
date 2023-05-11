'use strict'
const $ = require('jquery')
const Crop = require('./crop')

module.exports = {
  new ({
    arena, url, fixedWidth, fixedHeight, minWidth, minHeight,
    minRatio, maxRatio, maxArea, originalSize, zoomStep, crop, actions, minResolution,
    surroundingImageOpacity, showSurroundingImage
  }) {
    arena = $(arena)
    const view = arena.find('.crop-view')
    const preview = view.find('.crop-preview')
    const img = $('<img>')
    preview.append(img)
    let outline = view.find('.crop-outline')
    if (!outline.length) { outline = undefined }

    const allowedActions = {
      pan: true,
      zoomOnDoubleClick: true,
      resize: true,
      resizeHorizontal: !fixedWidth,
      resizeVertical: !fixedHeight
    }

    $.extend(allowedActions, actions)

    if (zoomStep == null) { zoomStep = 1.25 }

    if (minWidth == null) { minWidth = 50 }
    if (minHeight == null) { minHeight = 50 }

    return new Crop({
      url, // {String}
      crop, // {Object} Set an inital crop. This is the same as calling setCrop()
      arena, // {jQuery Element}
      view, // {jQuery Element}
      img, // {jQuery Element}
      outline, // {jQuery Element or undefined}
      showSurroundingImage, // {String} always|panning|never
      surroundingImageOpacity, // {Number} e.g. in the 0.0 - 1.0 range
      fixedWidth, // {Number} e.g. 300
      fixedHeight, // {Number} e.g. 500
      minViewWidth: minWidth, // {Number} e.g. 100
      minViewHeight: minHeight, // {Number} e.g. 100
      minViewRatio: minRatio, // {Number} e.g. 1.5/2
      maxViewRatio: maxRatio, // {Number} e.g. 2/1
      maxArea, // {Number} 0.8 -> max 80% of arena area are covered by the preview
      originalSize, // {Object} Original image size, can be used to display a downscaled
                    // version of the image in the cropping interface, but use the original
                    // size for crop attributes; e.g. {width: 4000, height: 3000}
      zoomStep, // {Number} e.g. 1.25 -> 125%
      actions: allowedActions,
      minResolution
    })
  }
}
