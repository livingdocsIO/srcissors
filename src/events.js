const $ = require('jquery')

module.exports = class Events {
  constructor ({parent, view, horizontal, vertical, actions}) {
    this.parent = parent
    this.view = view
    this.doubleClickThreshold = 300

    // setup events
    if (actions.pan) { this.pan() }
    if (actions.zoomOnDoubleClick) { this.doubleClick() }
    if (actions.resize) {
      this.resizeView({
        horizontal: actions.resizeHorizontal,
        vertical: actions.resizeVertical
      })
    }

    this.preventBrowserDragDrop()
    this.responsiveArena()
  }

  pan () {
    const $doc = $(document)
    this.view.on('mousedown.srcissors', (e1) => {
      const panData = {
        startX: this.parent.preview.x,
        startY: this.parent.preview.y
      }

      e1.preventDefault()
      $doc.on('mousemove.srcissors-pan', (e2) => {
        panData.dx = e2.pageX - e1.pageX
        panData.dy = e2.pageY - e1.pageY
        this.parent.onPan(panData)
      }).on('mouseup.srcissors-pan', () => {
        $doc.off('mouseup.srcissors-pan')
        $doc.off('mousemove.srcissors-pan')

        // only trigger panEnd if pan has been called
        if (panData.dx != null) this.parent.onPanEnd()
      })
    })
  }

  doubleClick () {
    let lastClick

    this.view.on('mousedown.srcissors', event => {
      const now = new Date().getTime()
      if (lastClick && (lastClick > (now - this.doubleClickThreshold))) {
        this.parent.onDoubleClick({pageX: event.pageX, pageY: event.pageY})
      }
      lastClick = now
    })
  }

  preventBrowserDragDrop () {
    this.view.on('dragstart.srcissors', () => false)
  }

  // Resize View
  // -----------

  resizeView ({horizontal, vertical}) {
    const $template = $('<div>')
    $template.addClass('resize-handler')

    let positions = []
    if (horizontal) positions = positions.concat(['right', 'left'])
    if (vertical) positions = positions.concat(['top', 'bottom'])

    positions.forEach(position => {
      const $handler = $template.clone()
      $handler.addClass(`resize-handler-${position}`)
      $handler.on('mousedown.srcissors', this.getResizeMouseDown(position))

      this.view.append($handler)
    })
  }

  getResizeMouseDown (position) {
    const $doc = $(document)

    return (event) => {
      let lastX = event.pageX
      let lastY = event.pageY

      event.stopPropagation()

      $doc.on('mousemove.srcissors-resize', e2 => {
        let dx, dy
        switch (position) {
          case 'top': case 'bottom':
            dy = e2.pageY - lastY
            if (position === 'top') { dy = -dy }
            lastY = e2.pageY
            break
          case 'left': case 'right':
            dx = e2.pageX - lastX
            if (position === 'left') { dx = -dx }
            lastX = e2.pageX
            break
        }

        this.parent.onResize({position, dx, dy})
      }).on('mouseup.srcissors-resize', () => {
        $doc.off('mouseup.srcissors-resize')
        $doc.off('mousemove.srcissors-resize')

        // only trigger panEnd if pan has been called
        this.parent.onResizeEnd({position})
      })
    }
  }

  responsiveArena () {}
}

// $(window).on('resize', (event) => console.log 'on window resize')
