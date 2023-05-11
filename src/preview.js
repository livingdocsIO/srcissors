'use strict'
const $ = require('jquery')

module.exports = class Preview {

  constructor ({onReady, img, opacity, outline}) {
    this.onReady = onReady
    this.img = img
    this.opacity = opacity
    this.outline = outline
    this.x = (this.y = 0)
    this.width = (this.height = 0)

    this.img.on('load', () => {
      const width = this.img.width()
      const height = this.img.height()
      this.ratio = width / height

      this.onReady({width, height})
      this.img.show()
    })
  }

  setImage ({url}) {
    this.url = url
    this.img.attr('src', this.url)
    if (this.outline) this.setBackgroundImage({url: this.url})
  }

  setBackgroundImage ({url}) {
    if (this.opacity > 0) {
      const bgImg = $('<img>').css({opacity: this.opacity}).attr('src', url)
      this.outline.append(bgImg)
    }
  }

  reset () {
    this.url = undefined
    this.x = (this.y = 0)
    this.width = (this.height = 0)
    this.img.attr('src', '')
    this.img.css({width: '', height: '', transform: ''})
    if (this.outline) this.outline.css({transform: ''}).html('')
  }

  setWidth (width) {
    this.img.css({width: `${width}px`, height: 'auto'})
    const height = width / this.ratio
    this.updateImageDimensions({width, height})
  }

  setHeight (height) {
    this.img.css({width: 'auto', height: `${height}px`})
    const width = height * this.ratio
    this.updateImageDimensions({width, height})
  }

  updateImageDimensions ({width, height}) {
    this.width = width
    this.height = height
    if (this.outline) this.outline.css({width: `${this.width}px`, height: `${this.height}px`})
  }

  pan (x1, y1) {
    // Without rounding some numbers would not be set to css.
    // e.g: '-5.14957320384e-14'
    this.x = x1
    this.y = y1
    const x = Math.round(this.x)
    const y = Math.round(this.y)
    this.img.css({transform: `translate(-${x}px, -${y}px)`})
    if (this.outline) this.outline.css({transform: `translate(-${x}px, -${y}px)`})
  }
}

