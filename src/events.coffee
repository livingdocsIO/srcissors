module.exports = class Events

  constructor: ({ @view }) ->
    @parent = arguments[0]
    @doubleClickThreshold = 300

    @pan()
    @doubleClick()
    @preventBrowserDragDrop()
    @resizeView()


  pan: ->
    $doc = $(document)
    @view.on 'mousedown.srcissors', (e1) =>
      panData =
        startX: @parent.preview.x
        startY: @parent.preview.y

      e1.preventDefault()

      $doc.on 'mousemove.srcissors-pan', (e2) =>
        panData.dx = e2.pageX - e1.pageX
        panData.dy = e2.pageY - e1.pageY
        @parent.onPan(panData)

      .on 'mouseup.srcissors-pan', =>
        $doc.off('mouseup.srcissors-pan')
        $doc.off('mousemove.srcissors-pan')

        # only trigger panEnd if pan has been called
        @parent.onPanEnd() if panData.dx?


  doubleClick: ->
    lastClick = undefined

    @view.on 'mousedown.srcissors', (event) =>
      now = new Date().getTime()
      if lastClick && lastClick > now - @doubleClickThreshold
        @parent.onDoubleClick(pageX: event.pageX, pageY: event.pageY)
      else
      lastClick = now


  preventBrowserDragDrop: ->
    @view.on('dragstart', -> return false)


  # Resize View
  # -----------

  resizeView: ->

    $template = $('<div>')
    $template.addClass('resize-handler')

    positions = ['top', 'right', 'bottom', 'left']
    positions.forEach (position) =>
      $handler = $template.clone()
      $handler.addClass("resize-handler-#{ position }")
      $handler.on 'mousedown.srcissors', @getResizeMouseDown(position)

      @view.append($handler)


  getResizeMouseDown: (position) ->
    $doc = $(document)

    (event) =>
      lastX = event.pageX
      lastY = event.pageY

      event.stopPropagation()

      $doc.on 'mousemove.srcissors-resize', (e2) =>
        switch position
          when 'top', 'bottom'
            dy = e2.pageY - lastY
            dy = -dy if position == 'top'
            lastY = e2.pageY
          when 'left', 'right'
            dx = e2.pageX - lastX
            dx = -dx if position == 'left'
            lastX = e2.pageX

        @parent.onResize({ position, dx, dy })

      .on 'mouseup.srcissors-resize', =>
        $doc.off('mouseup.srcissors-resize')
        $doc.off('mousemove.srcissors-resize')

        # only trigger panEnd if pan has been called
        @parent.onResizeEnd({ position })
