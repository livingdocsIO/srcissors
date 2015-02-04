Preview = require('./preview')
Events = require('./events')

module.exports = class Crop

  constructor: ({
      @arena, @view, @img, @outline, url, @fit, @fixedWidth, @fixedHeight,
      @maxAreaRatio, @minViewWidth, @minViewHeight, @minViewRatio, @maxViewRatio,
      zoomStep
    }) ->

      # State
      @isPanning = false

      # Confguration
      @zoomInStep = zoomStep
      @zoomOutStep = 1 / @zoomInStep

      @arenaWidth = @arena.width()
      @arenaHeight = @arena.height()

      @preview = new Preview
        onReady: @onPreviewReady
        img: @img
        outline: @outline

      @preview.setImage({ url })


  onPreviewReady: ({ width, height }) =>
    @events = new Events
      parent: this
      view: @view
      horizontal: !@fixedWidth
      vertical: !@fixedHeight

    @imageWidth = width
    @imageHeight = height
    @imageRatio = @imageWidth / @imageHeight

    @width = @imageWidth if not @width
    @height = @imageHeight if not @height

    keepDimension = undefined
    if @fixedWidth
      @width = @fixedWidth
      keepDimension = 'width'
    if @fixedHeight
      @height = @fixedHeight
      keepDimension = 'height'

    @setViewDimensions
      width: @width
      height: @height
      keepDimension: keepDimension

    @zoomAllOut()
    @center()


  getCrop: ->
    # calculate crop info from preview (factor in zoom!)


  # Event handling
  # --------------

  onPan: (data) ->
    if not @isPanning
      @isPanning = true
      @arena.addClass('view-is-panning')
      @outline.addClass('image-outline-active')

    newX = data.startX - data.dx
    newY = data.startY - data.dy
    @pan(x: newX, y: newY)


  onPanEnd: ->
    @isPanning = false
    @arena.removeClass('view-is-panning')
    @outline.removeClass('image-outline-active')


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
    @resizeFocusPoint.viewX = @viewWidth / 2
    @resizeFocusPoint.viewY = @viewHeight / 2

    # Ensure dimensions and focus
    @zoom
      width: @preview.width
      height: @preview.height
      focusPoint: @resizeFocusPoint


  setViewDimensions: ({ width, height, keepDimension }) ->
    if @fit
      { width, height } = @fitView({ width, height, keepDimension })
      { width, height } = @enforceMaxArea({ width, height, keepDimension }) if @maxAreaRatio
    else if @fixedWidth || @fixedHeight
      { width, height } = @enforceFixedDimension({ width, height })

    { width, height } = @enforceMaxMinRatio({ width, height, keepDimension })
    { width, height } = @enforceViewDimensions({ width, height })
    @view.css(width: width, height: height)
    @viewWidth = width
    @viewHeight = height
    @viewRatio = width / height


  enforceViewDimensions: ({ width, height }) ->
    if width < @minViewWidth
      width = @minViewWidth
    else if width > @imageWidth
      width = @imageWidth
    else if width > @arenaWidth
      width = @arenaWidth

    if height < @minViewHeight
      height = @minViewHeight
    else if height > @imageHeight
      height = @imageHeight
    else if height > @arenaHeight
      height = @arenaHeight

    { width, height }


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
    else if height?
      @preview.setHeight(height)

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


  calculateMaxArea: ->
    if @maxAreaRatio
      { width, height } = @centerAlign(@arenaWidth, @arenaHeight, @maxAreaRatio)
      maxArea = width * height
      return maxArea


  enforceFixedDimension: ({ width, height, keepDimension }) ->
    if @fixedWidth
      { width, height } = @setRatio(ratio: width / height, width: @fixedWidth)
    else if @fixedHeight
      { width, height } = @setRatio(ratio: width / height, height: @fixedHeight)

    { width, height }


  enforceMaxMinRatio: ({ width, height, keepDimension }) ->
    ratio = width / height
    if @minViewRatio && ratio < @minViewRatio
      if @fixedWidth
        { width, height } = @setRatio(ratio: @minViewRatio, width: @fixedWidth)
      else if @fixedHeight
        { width, height } = @setRatio(ratio: @minViewRatio, height: @fixedHeight)
      else if @fit
        { width, height } = @centerAlign(@arenaWidth, @arenaHeight, @minViewRatio)
      else
        { width, height } = @setRatio({ ratio: @minViewRatio, width, height, keepDimension })
    else if @maxViewRatio && ratio > @maxViewRatio
      if @fixedWidth
        { width, height } = @setRatio(ratio: @maxViewRatio, width: @fixedWidth)
      else if @fixedHeight
        { width, height } = @setRatio(ratio: @maxViewRatio, height: @fixedHeight)
      else if @fit
        { width, height } = @centerAlign(@arenaWidth, @arenaHeight, @maxViewRatio)
      else
        { width, height } = @setRatio({ ratio: @maxViewRatio, width, height, keepDimension })

    { width, height }


  setRatio: ({ ratio, width, height, keepDimension }) ->
    if keepDimension == 'width' || not height?
      height = width / ratio
    else if keepDimension == 'height' || not width?
      width = height * ratio
    else
      width = height * ratio

    { width, height }


  enforceMaxArea: ({ width, height, keepDimension }) ->
    ratio = width / height
    maxArea = @calculateMaxArea()
    if maxArea && width * height > maxArea
      if keepDimension == 'width'
        height = maxArea / width
      else if keepDimension == 'height'
        width = maxArea / height
      else # keep ratio
        width = Math.sqrt(maxArea * ratio)
        height = width / ratio

    { width, height }


  fitView: ({ width, height, keepDimension }) ->
    if keepDimension == 'width'
      height = @arenaHeight
    else if keepDimension == 'height'
      width = @arenaWidth
    else
      ratio = width / height
      { width, height } = @centerAlign(@arenaWidth, @arenaHeight, ratio)

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


  # Development helpers
  # -------------------

  debug: ->
    arena: "#{ @arenaWidth }px :#{ @arenaHeight }px"
    view: "#{ @viewWidth }px :#{ @viewHeight }px"
    imgage: "#{ @imageWidth }px :#{ @imageHeight }px"
    preview: "#{ @preview.width }px :#{ @preview.height }px"


