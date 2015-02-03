module.exports = class Events

  constructor: ({ @view }) ->
    @parent = arguments[0]
    @doubleClickThreshold = 300

    @pan()
    @doubleClick()
    @preventBrowserDragDrop()


  pan: ->
    $doc = $(document)
    @view.on 'mousedown.srcissors', (e1) =>
      panData =
        startX: @parent.preview.x
        startY: @parent.preview.y

      e1.preventDefault()

      $doc.on 'mousemove.srcissors', (e2) =>
        panData.dx = e2.pageX - e1.pageX
        panData.dy = e2.pageY - e1.pageY
        @parent.onPan(panData)

      .on 'mouseup.srcissors', () =>
        $doc.off('mouseup.srcissors')
        $doc.off('mousemove.srcissors')

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

