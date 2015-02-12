Preview = require('./preview')
Events = require('./events')

module.exports = class Crop

  constructor: ({
      @arena, @view, @img, @outline, url, @fixedWidth, @fixedHeight,
      @minViewWidth, @minViewHeight, @minViewRatio, @maxViewRatio, crop
      zoomStep, maxArea, @actions
    }) ->

      # CSS classes
      @loadingCssClass = 'crop-view--is-loading'
      @panningCssClass = 'crop-view--is-panning'
      @outlineCssClass = 'crop-outline--active'

      # State
      @isPanning = false
      @initialCrop = crop

      # Events
      @readyEvent = $.Callbacks('memory once')
      @changeEvent = $.Callbacks()

      # Confguration
      @zoomInStep = zoomStep
      @zoomOutStep = 1 / @zoomInStep

      @arenaWidth = @arena.width()
      @arenaHeight = @arena.height()

      # todo: consider to calculate maxArea with regards to the
      # maximum space an image can within the area. That should
      # be more reliable.
      @maxArea = (@arenaWidth * @arenaHeight) * maxArea if maxArea

      @preview = new Preview
        onReady: @onPreviewReady
        img: @img
        outline: @outline

      @setImage(url)


  setImage: (url) ->
    if @isInitialized
      @preview.reset()

    @isReady = false
    @view.addClass(@loadingCssClass)
    @preview.setImage({ url })


  onPreviewReady: ({ width, height }) =>
    if not @isInitialized
      @events = new Events
        parent: this
        view: @view
        actions: @actions

    @imageWidth = width
    @imageHeight = height
    @imageRatio = @imageWidth / @imageHeight

    @calcMaxMinDimensions()

    keepDimension = 'width' if @fixedWidth
    keepDimension = 'height' if @fixedHeight
    @setViewDimensions
      width: @imageWidth
      height: @imageHeight
      keepDimension: keepDimension

    # ready state
    @isReady = true
    @view.removeClass(@loadingCssClass)

    if not @isInitialized && @initialCrop?
      @setCrop(@initialCrop)
    else
      @zoomAllOut()
      @center()

    @isInitialized = true
    @readyEvent.fire()


  setCrop: ({ x, y, width, height }) ->
    if not @isReady
      this.on 'ready', =>
        @setCrop({ x, y, width, height })
      return

    @resize({ width, height })

    factor = @viewWidth / width
    previewWidth = @imageWidth * factor

    @zoom(width: previewWidth)
    @pan({ x: x * factor, y: y * factor })


  getCrop: ->
    factor =  @preview.width / @imageWidth
    crop =
      x: @preview.x / factor
      y: @preview.y / factor
      width: @viewWidth / factor
      height: @viewHeight / factor

    @roundCrop(crop)
    @validateCrop(crop)
    crop


  roundCrop: (crop) ->
    for name, value of crop
      crop[name] = Math.round(value)


  validateCrop: (crop) ->
    { x, y, width, height } = crop
    if x + width > @imageWidth
      crop.width = @imageWidth - x
    else if y + height > @imageHeight
      crop.height = @imageHeight - y

    crop


  setRatio: (ratio, keepDimension) ->
    if not @isReady
      this.on 'ready', =>
        @setRatio({ ratio, keepDimension })
      return

    ratio = @enforceValidRatio(ratio)

    if keepDimension == 'height'
      height = @viewHeight
      width = height * ratio
    else
      width = @viewWidth
      height = width / ratio

    @resizeFocusPoint = @getFocusPoint()
    @resize({ width, height })


  # Event handling
  # --------------

  onPan: (data) ->
    if not @isPanning
      @isPanning = true
      @arena.addClass(@panningCssClass)
      @outline.addClass(@outlineCssClass)

    newX = data.startX - data.dx
    newY = data.startY - data.dy
    @pan(x: newX, y: newY)


  onPanEnd: ->
    @isPanning = false
    @arena.removeClass(@panningCssClass)
    @outline.removeClass(@outlineCssClass)


  onDoubleClick: ({ pageX, pageY }) ->
    { left, top } = @view[0].getBoundingClientRect()
    viewX = pageX - left
    viewY = pageY - top
    @zoomIn({ viewX, viewY })


  onResize: ({ position, dx, dy }) ->
    if not @isResizing
      @isResizing = true
      @resizeFocusPoint = @getFocusPoint()

    if position in ['top', 'bottom']
      dy = 2 * dy # Because it's centered we need to change width by factor two
      @resize(width: @viewWidth, height: @viewHeight + dy, keepDimension: 'height')
    else if position in ['left', 'right']
      dx = 2 * dx
      @resize(width: @viewWidth + dx, height: @viewHeight, keepDimension: 'width')


  onResizeEnd: ->
    @isResizing = false
    @resizeFocusPoint = undefined


  resize: ({ width, height, keepDimension }) ->
    @setViewDimensions({ width, height, keepDimension })

    # Update view center of focus point
    if @resizeFocusPoint
      @resizeFocusPoint.viewX = @viewWidth / 2
      @resizeFocusPoint.viewY = @viewHeight / 2

    # Ensure dimensions and focus
    @zoom
      width: @preview.width
      height: @preview.height
      focusPoint: @resizeFocusPoint


  setViewDimensions: ({ width, height, keepDimension }) ->
    if @maxArea
      { width, height } = @enforceMaxArea({ width, height, keepDimension })

    { width, height } = @enforceViewDimensions({ width, height, keepDimension })

    @view.css(width: width, height: height)
    @viewWidth = width
    @viewHeight = height
    @viewRatio = width / height
    @fireChange()


  # Update view
  # -----------

  zoomAllOut: ->
    if @isWidthRestricting()
      @zoom(width: @viewWidth)
    else
      @zoom(height: @viewHeight)


  zoomIn: (params={}) ->
    if @isWidthRestricting()
      params.width = @preview.width * @zoomInStep
    else
      params.height = @preview.height * @zoomInStep

    @zoom(params)


  zoomOut: (params={}) ->
    if @isWidthRestricting()
      params.width = @preview.width * @zoomOutStep
    else
      params.height = @preview.height * @zoomOutStep

    @zoom(params)


  zoom: ({ width, height, viewX, viewY, focusPoint }) ->
    focusPoint ?= @getFocusPoint({ viewX, viewY })

    { width, height } = @enforceZoom({ width, height })
    if width?
      @preview.setWidth(width)
      @fireChange()
    else if height?
      @preview.setHeight(height)
      @fireChange()

    @focus(focusPoint)


  # returns {Object} e.g. percentX: 0.2, percentY: 0.5
  getFocusPoint: ({ viewX, viewY }={}) ->
    viewX ?= @viewWidth / 2
    viewY ?= @viewHeight / 2
    x = @preview.x + viewX
    y = @preview.y + viewY
    percentX = x / @preview.width
    percentY = y / @preview.height
    { percentX, percentY, viewX, viewY }


  focus: ({ percentX, percentY, viewX, viewY }) ->
    x = @preview.width * percentX
    y = @preview.height * percentY
    x = x - viewX
    y = y - viewY

    @pan({ x, y })


  center: ->
    newX = (@preview.width - @viewWidth) / 2
    newY = (@preview.height - @viewHeight) / 2
    @pan(x: newX, y: newY)


  # @param { Object }
  # - x {Number} pixel to pan to the left
  # - y {Number} pixels to pan to the top
  pan: (data) ->
    data = @enforceXy(data)
    @preview.pan(data.x, data.y)
    @fireChange()


  # Validations
  # -----------

  enforceXy: ({ x, y }) ->
    if x < 0
      x = 0
    else if x > @preview.width - @viewWidth
      x = @preview.width - @viewWidth

    if y < 0
      y = 0
    else if y > @preview.height - @viewHeight
      y = @preview.height - @viewHeight

    { x, y }


  enforceZoom: ({ width, height }) ->
    if width?
      if width > @imageWidth
        #  prevent zooming in past native image resolution
        return { width: @imageWidth }
      else if width < @viewWidth
        # prevent zooming out past covering the view completely
        return { width: @viewWidth }
    if height?
      if height > @imageHeight
        return { height: @imageHeight }
      else if height < @viewHeight
        return { height: @viewHeight }

    { width, height }


  calcMaxMinDimensions: ->
    @maxWidth = @min([@arenaWidth, @imageWidth])
    @maxHeight = @min([@arenaHeight, @imageHeight])
    @minWidth = @minViewWidth || 0
    @minHeight = @minViewHeight || 0

    @maxWidth = @minWidth = @fixedWidth if @fixedWidth
    @maxHeight = @minHeight = @fixedHeight if @fixedHeight


  areDimensionsValid: ({ width, height, keepDimension }) ->
    ratio = width / height

    invalid =
      width < @minWidth ||
      width > @maxWidth ||
      height < @minHeight ||
      height > @maxHeight ||
      ratio < @minViewRatio ||
      ratio > @maxViewRatio

    not invalid


  isValidRatio: (ratio) ->
    not (ratio < @minViewRatio || ratio > @maxViewRatio)


  enforceValidRatio: (ratio) ->
    return @minViewRatio if ratio < @minViewRatio
    return @maxViewRatio if ratio > @maxViewRatio
    ratio


  enforceViewDimensions: ({ width, height, keepDimension }) ->
    newWidth = @minWidth if width < @minWidth
    newWidth = @maxWidth if width > @maxWidth
    newHeight = @minHeight if height < @minHeight
    newHeight = @maxHeight if height > @maxHeight

    if keepDimension
      width = newWidth if newWidth
      height = newHeight if newHeight

      # check max/min ratios
      ratio = width / height
      if not @isValidRatio(ratio)
        ratio = @enforceValidRatio(ratio)
        { width, height } = @getRatioBox({ ratio: ratio, width, height, keepDimension })
        { width, height } = @centerAlign(@maxWidth, @maxHeight, ratio)

    else if newWidth || newHeight
      ratio = @enforceValidRatio(width / height)
      { width, height } = @centerAlign(@maxWidth, @maxHeight, ratio)

    { width, height }


  enforceMaxArea: ({ width, height, keepDimension }) ->
    ratio = width / height

    if keepDimension == 'width'
      height = @maxArea / width
      ratio = width / height
    else if keepDimension == 'height'
      width = @maxArea / height
      ratio = width / height
    else # keep ratio
      width = Math.sqrt(@maxArea * ratio)
      height = width / ratio

    if not @isValidRatio(ratio)
      ratio = @enforceValidRatio(ratio)
      width = Math.sqrt(@maxArea * ratio)
      height = width / ratio

    { width, height }


  # Calculations
  # ------------
  #
  # Ratio: width / height
  # Tall < 1 (Square) < Wide
  # (A ratio less than one is a tall image format and
  #  a ratio greater than one is a wide image format)

  # Check if the width or height is restricting
  isWidthRestricting: ->
    @viewRatio >= @imageRatio


  getRatioBox: ({ ratio, width, height, keepDimension }) ->
    if keepDimension == 'width' || not height?
      height = width / ratio
    else if keepDimension == 'height' || not width?
      width = height * ratio
    else
      height = width / ratio

    { width, height }


  centerAlign: (areaWidth, areaHeight, ratio) ->
    if ( areaWidth / areaHeight ) > ratio
      width = areaHeight * ratio
      x = (areaWidth - width) / 2
    else
      height = areaWidth / ratio
      y = (areaHeight - height) / 2

    # return
    x: x || 0
    y: y || 0
    width: width || areaWidth
    height: height || areaHeight


  min: (array) ->
    min = array[0]
    for number in array
      min = number if number < min

    return min


  # Events
  # ------

  on: (name, callback) ->
    this["#{ name }Event"].add(callback)


  off: (name, callback) ->
    this["#{ name }Event"].remove(callback)


  # Debounce change events so they are not fired more
  # than once per tick.
  fireChange: ->
    return if @changeDispatch?

    @changeDispatch = setTimeout =>
      @changeDispatch = undefined
      @changeEvent.fire(@getCrop())
    , 0


  # Development helpers
  # -------------------

  debug: ->
    r = (num) -> Math.round(num * 10) / 10

    obj =
      arena: "#{ r @arenaWidth }x#{ r @arenaHeight }"
      view: "#{ r @viewWidth }x#{ r @viewHeight }"
      image: "#{ r @imageWidth }x#{ r @imageHeight }"
      preview: "#{ r @preview.width }x#{ r @preview.height }"
      previewXy: "#{ r @preview.x }x#{ r @preview.y }"

    console.log(obj)
    return obj

