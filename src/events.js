'use strict'
const $ = require('jquery')

const getPageCoordinates = function (event) {
  if (event.type.includes('touch')) {
    return {
      pageX: event.originalEvent.changedTouches[0].pageX,
      pageY: event.originalEvent.changedTouches[0].pageY
    }
  }
  return {pageX: event.pageX, pageY: event.pageY}
}

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
    this.view.on('mousedown.srcissors touchstart.srcissors', (e1) => {
      const panData = {
        startX: this.parent.preview.x,
        startY: this.parent.preview.y
      }

      e1.preventDefault()
      $doc.on('mousemove.srcissors-pan touchmove.srcissors-pan', (e2) => {
        const {pageX, pageY} = getPageCoordinates(e2)
        const {pageX: prevPageX, pageY: prevPageY} = getPageCoordinates(e1)
        panData.dx = pageX - prevPageX
        panData.dy = pageY - prevPageY
        this.parent.onPan(panData)
      }).on('mouseup.srcissors-pan touchend.srcissors-pan', () => {
        $doc.off('mouseup.srcissors-pan touchend.srcissors-pan')
        $doc.off('mousemove.srcissors-pan touchmove.srcissors-pan')

        // only trigger panEnd if pan has been called
        if (panData.dx != null) this.parent.onPanEnd()
      })
    })
  }

  doubleClick () {
    let lastClick

    this.view.on('mousedown.srcissors touchstart.srcissors', event => {
      const now = new Date().getTime()
      if (lastClick && (lastClick > (now - this.doubleClickThreshold))) {
        this.parent.onDoubleClick(getPageCoordinates(event))
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
      $handler.on('mousedown.srcissors touchstart.srcissors', this.getResizeMouseDown(position))

      this.view.append($handler)
    })
  }

  getResizeMouseDown (position) {
    const $doc = $(document)

    return (event) => {
      let {pageX: lastX, pageY: lastY} = getPageCoordinates(event)
      event.stopPropagation()

      $doc.on('mousemove.srcissors-resize touchmove.srcissors-resize', e2 => {
        let dx, dy
        const {pageX, pageY} = getPageCoordinates(e2)
        switch (position) {
          case 'top': case 'bottom':
            dy = pageY - lastY
            if (position === 'top') { dy = -dy }
            lastY = pageY
            break
          case 'left': case 'right':
            dx = pageX - lastX
            if (position === 'left') { dx = -dx }
            lastX = pageX
            break
        }

        this.parent.onResize({position, dx, dy})
      }).on('mouseup.srcissors-resize touchend.srcissors-resize', () => {
        $doc.off('mouseup.srcissors-resize touchmove.srcissors-resize')
        $doc.off('mousemove.srcissors-resize touchend.srcissors-resize')

        // only trigger panEnd if pan has been called
        this.parent.onResizeEnd({position})
      })
    }
  }

  responsiveArena () {}
}

// $(window).on('resize', (event) => console.log 'on window resize')
