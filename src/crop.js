const $ = require('jquery')
const Preview = require('./preview')
const Events = require('./events')

module.exports = class Crop {
  constructor ({
    arena, view, img, outline, url, fixedWidth, fixedHeight,
    minViewWidth, minViewHeight, minViewRatio, maxViewRatio, originalSize, crop,
    zoomStep, maxArea, actions, minResolution, surroundingImageOpacity,
    showSurroundingImage
  }) {
    // CSS classes
    this.onPreviewReady = this.onPreviewReady.bind(this)
    this.arena = arena
    this.view = view
    this.img = img
    this.outline = outline
    this.fixedWidth = fixedWidth
    this.fixedHeight = fixedHeight
    this.minViewWidth = minViewWidth
    this.minViewHeight = minViewHeight
    this.minViewRatio = minViewRatio
    this.maxViewRatio = maxViewRatio
    this.originalSize = originalSize
    this.actions = actions
    this.minResolution = minResolution
    this.surroundingImageOpacity = surroundingImageOpacity
    this.loadingCssClass = 'crop-view--is-loading'
    this.panningCssClass = 'crop-view--is-panning'
    this.outlineCssClass = 'crop-outline--active'

    // State
    this.isPanning = false
    this.initialCrop = crop

    // Events
    this.loadEvent = $.Callbacks()
    this.changeEvent = $.Callbacks()

    // Sets up the ready event and state
    this.initializeReadyState()

    // Confguration
    this.zoomInStep = zoomStep
    this.zoomOutStep = 1 / this.zoomInStep

    this.arenaWidth = this.arena.width()
    this.arenaHeight = this.arena.height()

    // todo: consider to calculate maxArea with regards to the
    // maximum space an image can within the area. That should
    // be more reliable.
    if (maxArea) this.maxArea = (this.arenaWidth * this.arenaHeight) * maxArea

    if (this.outline) this.setSurroundingImageVisibility(showSurroundingImage)

    this.preview = new Preview({
      onReady: this.onPreviewReady,
      img: this.img,
      outline: this.outline,
      opacity: this.surroundingImageOpacity
    })

    this.setImage(url)
  }

  initializeReadyState () {
    this.isReady = false
    if (this.readyEvent != null) {
      this.readyEvent.empty()
    }
    this.readyEvent = $.Callbacks('memory once')
  }

  setImage (url) {
    if (url === this.preview.url) return

    if (this.isInitialized) this.preview.reset()
    this.initializeReadyState()
    this.view.addClass(this.loadingCssClass)
    this.preview.setImage({url})
  }

  setSurroundingImageVisibility (visibility) {
    // visibility: always|panning|never
    // override opacity in crop-outline--active css class
    this.surroundingImageOpacity = parseFloat(this.surroundingImageOpacity || 0.2)

    if (visibility === 'always') {
      this.outline.css('opacity', 1.0)
    } else if (visibility === 'panning') {
      this.outline.css('opacity', null)
    } else { // 'never' default
      this.outline.css('opacity', 0)
      this.surroundingImageOpacity = 0
    }
  }

  reset () {
    if (!this.isReady) return

    this.resize({width: this.imageWidth, height: this.imageHeight})
    this.zoomAllOut()
  }

  onPreviewReady (previewImageSize) {
    this.checkRatio(previewImageSize)
    const {width, height} = this.originalSize || previewImageSize

    // console.log(this.originalSize, previewImageSize, {width, height})
    this.preview.updateImageDimensions({width, height})

    let keepDimension
    if (!this.isInitialized) {
      this.events = new Events({
        parent: this,
        view: this.view,
        actions: this.actions
      })
    }

    this.imageWidth = width
    this.imageHeight = height
    this.imageRatio = this.imageWidth / this.imageHeight
    const imageResolution = this.imageWidth * this.imageHeight

    if (this.minResolution && (this.minResolution > imageResolution)) {
      // If the minimal required resolution is bigger than the actual image
      // resolution, we ignore the configuration
      delete this.minResolution
    }

    if (this.minResolution) {
      // For any given image resolution with a minimal required resolution
      // we can calculate both, a minimal resolution and a maximal resolution
      const minRatioForResolution = this.minResolution / (this.imageHeight * this.imageHeight)
      if (!this.minViewRatio || (this.minViewRatio < minRatioForResolution)) {
        this.minViewRatio = minRatioForResolution
      }
      const maxRatioForResolution = (this.imageWidth * this.imageWidth) / this.minResolution
      if (!this.maxViewRatio || (this.maxViewRatio > maxRatioForResolution)) {
        this.maxViewRatio = maxRatioForResolution
      }
    }

    this.calcMaxMinDimensions()

    if (this.fixedWidth) { keepDimension = 'width' }
    if (this.fixedHeight) { keepDimension = 'height' }
    this.setViewDimensions({
      width: this.imageWidth,
      height: this.imageHeight,
      keepDimension
    })

    // ready state
    this.isReady = true
    this.view.removeClass(this.loadingCssClass)

    if (!this.isInitialized && (this.initialCrop != null)) {
      this.setCrop(this.initialCrop)
    } else {
      this.zoomAllOut()
      this.center()
    }

    this.isInitialized = true
    this.readyEvent.fire()
    this.loadEvent.fire()
  }

  setCrop ({x, y, width, height}) {
    if (!this.isReady) {
      this.on('ready', () => this.setCrop({x, y, width, height}))
      return
    }

    this.resize({width, height})

    const factor = this.viewWidth / width
    const previewWidth = this.imageWidth * factor

    this.zoom({width: previewWidth})
    this.pan({x: x * factor, y: y * factor})
  }

  getCrop () {
    const factor = this.preview.width / this.imageWidth
    const crop = {
      x: this.preview.x / factor,
      y: this.preview.y / factor,
      width: this.viewWidth / factor,
      height: this.viewHeight / factor
    }

    this.roundCrop(crop)
    this.validateCrop(crop)
    return crop
  }

  roundCrop (crop) {
    for (const name in crop) {
      const value = crop[name]
      crop[name] = Math.round(value)
    }
  }

  validateCrop (crop) {
    const {x, y, width, height} = crop
    if ((x + width) > this.imageWidth) {
      crop.width = this.imageWidth - x
    } else if ((y + height) > this.imageHeight) {
      crop.height = this.imageHeight - y
    }

    return crop
  }

  setRatio (ratio, keepDimension) {
    let height, width
    if (!this.isReady) {
      this.on('ready', () => this.setRatio(ratio, keepDimension))
      return
    }

    ratio = this.enforceValidRatio(ratio)

    if (keepDimension === 'height') {
      height = this.viewHeight
      width = height * ratio
    } else {
      width = this.viewWidth
      height = width / ratio
    }

    this.resizeFocusPoint = this.getFocusPoint()
    return this.resize({width, height})
  }

  // Event handling
  // --------------

  onPan (data) {
    if (!this.isPanning) {
      this.isPanning = true
      this.arena.addClass(this.panningCssClass)
      this.outline.addClass(this.outlineCssClass)
    }

    const newX = data.startX - data.dx
    const newY = data.startY - data.dy
    this.pan({x: newX, y: newY})
  }

  onPanEnd () {
    this.isPanning = false
    this.arena.removeClass(this.panningCssClass)
    return this.outline.removeClass(this.outlineCssClass)
  }

  onDoubleClick ({pageX, pageY}) {
    const {left, top} = this.view[0].getBoundingClientRect()
    const viewX = pageX - left
    const viewY = pageY - top
    this.zoomIn({viewX, viewY})
  }

  onResize ({position, dx, dy}) {
    if (!this.isResizing) {
      this.isResizing = true
      this.resizeFocusPoint = this.getFocusPoint()
    }

    if (['top', 'bottom'].includes(position)) {
      dy = 2 * dy // Because it's centered we need to change width by factor two
      this.resize({width: this.viewWidth, height: this.viewHeight + dy, keepDimension: 'height'})
    } else if (['left', 'right'].includes(position)) {
      dx = 2 * dx
      this.resize({width: this.viewWidth + dx, height: this.viewHeight, keepDimension: 'width'})
    }
  }

  onResizeEnd () {
    this.isResizing = false
    this.resizeFocusPoint = undefined
  }

  resize ({width, height, keepDimension}) {
    this.setViewDimensions({width, height, keepDimension})

    // Update view center of focus point
    if (this.resizeFocusPoint) {
      this.resizeFocusPoint.viewX = this.viewWidth / 2
      this.resizeFocusPoint.viewY = this.viewHeight / 2
    }

    // Ensure dimensions and focus
    this.zoom({
      width: this.preview.width,
      height: this.preview.height,
      focusPoint: this.resizeFocusPoint
    })
  }

  setViewDimensions ({width, height, keepDimension}) {
    if (this.maxArea) {
      ({width, height} = this.enforceMaxArea({width, height, keepDimension}))
    }

    ({width, height} = this.enforceViewDimensions({width, height, keepDimension}))

    this.view.css({width, height})
    this.viewWidth = width
    this.viewHeight = height
    this.viewRatio = width / height

    if (this.minResolution) {
      const minZoomPixelWidth = Math.sqrt(this.minResolution * this.viewRatio)
      const minZoomPixelHeight = Math.sqrt(this.minResolution / this.viewRatio)
      this.maxImageWidth = (this.viewWidth / minZoomPixelWidth) * this.imageWidth
      this.maxImageHeight = (this.viewHeight / minZoomPixelHeight) * this.imageHeight
    }

    this.fireChange()
  }

  // Update view
  // -----------

  zoomAllOut () {
    if (this.isWidthRestricting()) {
      this.zoom({width: this.viewWidth})
    } else {
      this.zoom({height: this.viewHeight})
    }
  }

  zoomIn (params) {
    if (params == null) { params = {} }
    if (this.isWidthRestricting()) {
      params.width = this.preview.width * this.zoomInStep
    } else {
      params.height = this.preview.height * this.zoomInStep
    }

    this.zoom(params)
  }

  zoomOut (params) {
    if (params == null) { params = {} }
    if (this.isWidthRestricting()) {
      params.width = this.preview.width * this.zoomOutStep
    } else {
      params.height = this.preview.height * this.zoomOutStep
    }

    this.zoom(params)
  }

  zoom ({width, height, viewX, viewY, focusPoint}) {
    if (focusPoint == null) { focusPoint = this.getFocusPoint({viewX, viewY}) }

    ({width, height} = this.enforceZoom({width, height}))
    if (width != null) {
      this.preview.setWidth(width)
      this.fireChange()
    } else if (height != null) {
      this.preview.setHeight(height)
      this.fireChange()
    }

    this.focus(focusPoint)
  }

  // returns {Object} e.g. percentX: 0.2, percentY: 0.5
  getFocusPoint (param) {
    if (param == null) { param = {} }
    let {viewX, viewY} = param
    if (viewX == null) { viewX = this.viewWidth / 2 }
    if (viewY == null) { viewY = this.viewHeight / 2 }
    const x = this.preview.x + viewX
    const y = this.preview.y + viewY
    const percentX = x / this.preview.width
    const percentY = y / this.preview.height
    return {percentX, percentY, viewX, viewY}
  }

  focus ({percentX, percentY, viewX, viewY}) {
    let x = this.preview.width * percentX
    let y = this.preview.height * percentY
    x = x - viewX
    y = y - viewY

    this.pan({x, y})
  }

  center () {
    const newX = (this.preview.width - this.viewWidth) / 2
    const newY = (this.preview.height - this.viewHeight) / 2
    this.pan({x: newX, y: newY})
  }

  // @param { Object }
  // - x {Number} pixel to pan to the left
  // - y {Number} pixels to pan to the top
  pan (data) {
    data = this.enforceXy(data)
    this.preview.pan(data.x, data.y)
    this.fireChange()
  }

  // Validations
  // -----------

  enforceXy ({x, y}) {
    if (x < 0) {
      x = 0
    } else if (x > (this.preview.width - this.viewWidth)) {
      x = this.preview.width - this.viewWidth
    }

    if (y < 0) {
      y = 0
    } else if (y > (this.preview.height - this.viewHeight)) {
      y = this.preview.height - this.viewHeight
    }

    return {x, y}
  }

  enforceZoom ({width, height}) {

    if ((width != null) && this.maxImageWidth && (width > this.maxImageWidth)) {
      // prevent zooming in past the required resolution defined by minResolution
      return {width: this.maxImageWidth}
    }

    if ((width != null) && (width < this.viewWidth)) {
      // prevent zooming out past covering the view completely
      return {width: this.viewWidth}
    }

    if ((height != null) && this.maxImageHeight && (height > this.maxImageHeight)) {
      // prevent zooming in past the required resolution defined by minResolution
      return {height: this.maxImageHeight}
    }

    if ((height != null) && (height < this.viewHeight)) {
      // prevent zooming out past covering the view completely
      return {height: this.viewHeight}
    }

    return {width, height}
  }

  calcMaxMinDimensions () {
    this.maxWidth = this.min([this.arenaWidth, this.imageWidth])
    this.maxHeight = this.min([this.arenaHeight, this.imageHeight])
    this.minWidth = this.minViewWidth || 0
    this.minHeight = this.minViewHeight || 0

    if (this.fixedWidth) this.maxWidth = (this.minWidth = this.fixedWidth)
    if (this.fixedHeight) this.maxHeight = (this.minHeight = this.fixedHeight)
  }

  areDimensionsValid ({width, height, keepDimension}) {
    const ratio = width / height

    const invalid =
      (width < this.minWidth) ||
      (width > this.maxWidth) ||
      (height < this.minHeight) ||
      (height > this.maxHeight) ||
      (ratio < this.minViewRatio) ||
      (ratio > this.maxViewRatio)

    return !invalid
  }

  isValidRatio (ratio) {
    return !((ratio < this.minViewRatio) || (ratio > this.maxViewRatio))
  }

  enforceValidRatio (ratio) {
    if (ratio < this.minViewRatio) return this.minViewRatio
    if (ratio > this.maxViewRatio) return this.maxViewRatio
    return ratio
  }

  enforceViewDimensions ({width, height, keepDimension}) {
    let newHeight, newWidth, ratio
    if (width < this.minWidth) newWidth = this.minWidth
    if (width > this.maxWidth) newWidth = this.maxWidth
    if (height < this.minHeight) newHeight = this.minHeight
    if (height > this.maxHeight) newHeight = this.maxHeight

    if (keepDimension) {
      if (newWidth) width = newWidth
      if (newHeight) height = newHeight

      // check max/min ratios
      ratio = width / height
      if (!this.isValidRatio(ratio)) {
        ratio = this.enforceValidRatio(ratio);
        ({width, height} = this.getRatioBox({ratio, width, height, keepDimension}))
        if ((width > this.arenaWidth) || (height > this.arenaHeight)) {
          ({width, height} = this.centerAlign(this.maxWidth, this.maxHeight, ratio))
        }
      }

    } else if (newWidth || newHeight) {
      ratio = this.enforceValidRatio(width / height);
      ({width, height} = this.centerAlign(this.maxWidth, this.maxHeight, ratio))
    }

    return {width, height}
  }

  enforceMaxArea ({width, height, keepDimension}) {
    let ratio = width / height

    if (keepDimension === 'width') {
      height = this.maxArea / width
      ratio = width / height
    } else if (keepDimension === 'height') {
      width = this.maxArea / height
      ratio = width / height
    } else { // keep ratio
      width = Math.sqrt(this.maxArea * ratio)
      height = width / ratio
    }

    if (!this.isValidRatio(ratio)) {
      ratio = this.enforceValidRatio(ratio)
      width = Math.sqrt(this.maxArea * ratio)
      height = width / ratio
    }

    return {width, height}
  }

  checkRatio (previewImageSize) {
    if (this.originalSize) {
      const expectedRatio = this.originalSize.width / this.originalSize.height
      const actualRatio = previewImageSize.width / previewImageSize.height
      const percentageChange = ((actualRatio - expectedRatio) / expectedRatio) * 100
      if (Math.abs(percentageChange) > 1) {
        throw new Error(`srcissors: Displayed image has a different image ratio than the ` +
                        `one configured in 'originalRatio': ${expectedRatio} vs ${actualRatio}`)
      }
    }
  }

  // Calculations
  // ------------
  //
  // Ratio: width / height
  // Tall < 1 (Square) < Wide
  // (A ratio less than one is a tall image format and
  //  a ratio greater than one is a wide image format)

  // Check if the width or height is restricting
  isWidthRestricting () {
    return this.viewRatio >= this.imageRatio
  }

  getRatioBox ({ratio, width, height, keepDimension}) {
    if ((keepDimension === 'width') || (height == null)) {
      height = width / ratio
    } else if ((keepDimension === 'height') || (width == null)) {
      width = height * ratio
    } else {
      height = width / ratio
    }

    return {width, height}
  }

  centerAlign (areaWidth, areaHeight, ratio) {
    let height, width, x, y
    if ((areaWidth / areaHeight) > ratio) {
      width = areaHeight * ratio
      x = (areaWidth - width) / 2
    } else {
      height = areaWidth / ratio
      y = (areaHeight - height) / 2
    }

    // return
    return {
      x: x || 0,
      y: y || 0,
      width: width || areaWidth,
      height: height || areaHeight
    }
  }

  min (array) {
    let min = array[0]
    for (const number of array) {
      if (number < min) min = number
    }

    return min
  }

  // Events
  // ------

  on (name, callback) {
    return this[`${name}Event`].add(callback)
  }

  off (name, callback) {
    return this[`${name}Event`].remove(callback)
  }

  // Debounce change events so they are not fired more
  // than once per tick.
  fireChange () {
    if (this.changeDispatch != null) return

    this.changeDispatch = setTimeout(() => {
      this.changeDispatch = undefined
      this.changeEvent.fire(this.getCrop())
    }, 0)
  }

  // Development helpers
  // -------------------

  debug () {
    const r = num => Math.round(num * 10) / 10

    const obj = {
      arena: `${r(this.arenaWidth)}x${r(this.arenaHeight)}`,
      view: `${r(this.viewWidth)}x${r(this.viewHeight)}`,
      image: `${r(this.imageWidth)}x${r(this.imageHeight)}`,
      preview: `${r(this.preview.width)}x${r(this.preview.height)}`,
      previewXy: `${r(this.preview.x)}x${r(this.preview.y)}`
    }

    console.log(obj) // eslint-disable-line no-console
    return obj
  }
}
