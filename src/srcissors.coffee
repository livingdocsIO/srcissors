Preview = require('./preview')
Events = require('./events')

module.exports = window.srcissors =

  setup: ({ arena, view, url }) ->
    @arena = $(arena)
    @view = $(view)
    @img = @view.find('img')

    @arenaWidth = @arena.width()
    @arenaHeight = @arena.height()

    @minViewWidth = 100
    @minViewHeight = 100
    @minViewRatio = undefined
    @maxViewRatio = undefined
    @setViewDimensions(width: 300, height: 400)

    # @zoomStep = 25%
    @zoomInStep = 1.25 # 1.25 -> 125%
    @zoomOutStep = 1 / @zoomInStep
    @isPanning = false

    @preview = new Preview(onReady: $.proxy(this, 'onPreviewReady'), img: @img)
    @preview.setImage({ url })


  onPreviewReady: ({ width, height }) ->
    @events = new Events(this)

    @imageWidth = width
    @imageHeight = height
    @imageRatio = @imageWidth / @imageHeight

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

    newX = data.startX - data.dx
    newY = data.startY - data.dy
    @pan(x: newX, y: newY)


  onPanEnd: ->
    @isPanning = false
    @arena.removeClass('view-is-panning')


  onDoubleClick: ({ pageX, pageY }) ->
    { left, top } = @view[0].getBoundingClientRect()
    viewX = pageX - left
    viewY = pageY - top
    @zoomIn({ viewX, viewY })


  onResize: ({ position, dx, dy })->
    # console.log 'resize', arguments[0]
    if position in ['top', 'bottom']
      dy = 2 * dy # Because it's centered we need to change width by factor two
      @resize(width: @viewWidth, height: @viewHeight + dy)
    else if position in ['left', 'right']
      dx = 2 * dx
      @resize(width: @viewWidth + dx, height: @viewHeight)


  onResizeEnd: ->
    console.log 'resize end'


  resize: ({ width, height }) ->
    { width, height } = @enforceViewDimensions({ width, height })
    @setViewDimensions({ width, height })
    @zoom(width: @preview.width, height: @preview.height)


  setViewDimensions: ({ width, height })->
    @view.css(width: width, height: height)
    @viewWidth = width
    @viewHeight = height
    @viewRatio = @viewWidth / @viewHeight


  enforceViewDimensions: ({ width, height }) ->
    if width < @minViewWidth
      width = @minViewWidth
    else if width > @arenaWidth
      width = @arenaWidth

    if height < @minViewHeight
      height = @minViewHeight
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


  zoom: ({ width, height, viewX, viewY }) ->
    { width, height } = @enforceZoom({ width, height })

    viewX ?= @viewWidth / 2
    viewY ?= @viewHeight / 2
    focusPoint = @getFocusPoint({ viewX, viewY })

    if width?
      @preview.setWidth(width)
    else if height?
      @preview.setHeight(height)

    @focus
      percentX: focusPoint.percentX
      percentY: focusPoint.percentY
      viewX: viewX
      viewY: viewY


  # returns {Object} e.g. percentX: 0.2, percentY: 0.5
  getFocusPoint: ({ viewX, viewY }) ->
    x = @preview.x + viewX
    y = @preview.y + viewY
    percentX = x / @preview.width
    percentY = y / @preview.height
    { percentX, percentY }


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
        width = @imageWidth
      else if width < @viewWidth
        # prevent zooming out past covering the view completely
        width = @viewWidth
    if height?
      if height > @imageHeight
        height = @imageHeight
      else if height < @viewHeight
        height = @viewHeight

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


  # Development helpers
  # -------------------

  debug: ->
    arena: "#{ @arenaWidth }px :#{ @arenaHeight }px"
    imgage: "#{ @imageWidth }px :#{ @imageHeight }px"
    preview: "#{ @preview.width }px :#{ @preview.height }px"


