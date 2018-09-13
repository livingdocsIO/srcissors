module.exports = class Preview {

  constructor ({onReady, img, outline}) {
    this.onReady = onReady
    this.img = img
    this.outline = outline
    this.x = (this.y = 0)
    this.width = (this.height = 0)

    this.img.on('load', () => {
      this.updateImageDimensions()

      this.ratio = this.width / this.height
      this.originalWidth = this.width
      this.originalHeight = this.height
      this.scaleFactor = 1

      this.img.css({transformOrigin: '0 0 0'})
      if (this.outline) { this.outline.css({transformOrigin: '0 0 0'}) }

      this.onReady({width: this.width, height: this.height})
      this.img.show()
    })
  }

  setImage ({url}) {
    this.img.attr('src', url)
  }

  setWidth (width) {
    this.scale({width})
  }

  setHeight (height) {
    this.scale({height})
  }

  scale ({width, height}) {
    if (width) {
      height = width / this.ratio
    } else {
      width = height * this.ratio
    }

    this.scaleFactor = width / this.originalWidth

    this.transform(this.img)
    this.transform(this.outline)

    this.width = width
    this.height = height
  }

  transform ($elem) {
    if (!$elem) return
    $elem.css({transform: `scale(${this.scaleFactor}) translate(-${this.x / this.scaleFactor}px, -${this.y / this.scaleFactor}px)`})
  }

  updateImageDimensions () {
    this.width = this.img.width()
    this.height = this.img.height()
    if (this.outline) this.outline.css({width: `${this.width}px`, height: `${this.height}px`})
  }

  pan (x, y) {
    this.x = x
    this.y = y
    this.transform(this.img)
    this.transform(this.outline)
  }
}

