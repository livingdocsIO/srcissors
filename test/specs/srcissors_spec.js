const $ = require('jquery')
const srcissors = require('../../src/srcissors')

const template = `\
<div class="crop-arena">
  <div class="crop-view">
    <div class="crop-outline"></div>

    <!-- image -->
    <div class="crop-preview"></div>

  </div>
</div>\
`

describe('srcissors', function () {

  it('creates a new instance', function () {
    const html = $(template)
    const crop = srcissors.new({
      arena: html})

    expect(crop).to.exist
  })

  describe('with a 100x100 arena', function () {

    beforeEach(function (done) {
      this.arena = $(template)
      this.arena.css({width: 100, height: 100})
      $(document.body).append(this.arena)

      // Crop a 400x300 image
      this.crop = srcissors.new({
        arena: this.arena,
        url: 'base/test/images/diagonal.jpg'
      })
      this.crop.on('ready', done)
    })

    afterEach(function () {
      this.arena.remove()
    })

    it('has initialized the image correctly', function () {
      expect(this.crop.imageWidth).to.equal(400)
      expect(this.crop.imageHeight).to.equal(300)
    })

    it('fires a change event after ready', function (done) {
      this.crop.on('change', function (crop) {
        expect(crop).to.deep.equal({
          x: 0,
          y: 0,
          width: 400,
          height: 300
        })

        done()
      })
    })

    describe('zoom()', () =>

      // Zoom a 400x300 image by factor 2 in an arena of 100x100
      // The view should keep the images aspect ratio and have a size of 100x75
      it('zooms 2x into the center', function (done) {
        this.crop.zoom({width: 200})
        this.crop.on('change', function (crop) {
          expect(crop).to.deep.equal({
            x: 100,
            y: 75,
            width: 200,
            height: 150
          })

          done()
        })
      })
    )

    describe('setRatio()', () =>

      it('sets a square ratio', function (done) {
        this.crop.setRatio(1)
        this.crop.on('change', function (crop) {
          expect(crop).to.deep.equal({
            x: 50,
            y: 0,
            width: 300,
            height: 300
          })

          done()
        })
      })
    )

    describe('setImage()', function () {

      beforeEach(function (done) {
        this.crop.on('load', done)

        // Set a different 300x400 image
        this.crop.setImage('base/test/images/berge.jpg')
      })

      it('sets the new image dimensions', function () {
        expect(this.crop.imageWidth).to.equal(300)
        expect(this.crop.imageHeight).to.equal(400)
      })
    })

    describe('reset()', () =>

      it('resets the zoom and ratio to the original', function () {
        this.crop.setRatio(1)
        this.crop.zoom({width: 200})
        this.crop.reset()
        expect(this.crop.getCrop()).to.deep.equal({
          x: 0,
          y: 0,
          width: 400,
          height: 300
        })
      })
    )
  })

  describe('with a 100x200 arena', function () {

    beforeEach(function (done) {
      this.arena = $(template)
      this.arena.css({width: 100, height: 200})
      $(document.body).append(this.arena)

      // Crop a 400x300 image
      this.crop = srcissors.new({
        arena: this.arena,
        url: 'base/test/images/diagonal.jpg'
      })
      this.crop.on('ready', done)
    })

    afterEach(function () {
      this.arena.remove()
    })

    it('has initialized the view correctly', function () {
      expect(this.crop.viewWidth).to.equal(100)
      expect(this.crop.viewHeight).to.equal(75)
    })

    describe('setRatio()', () =>

      it('sets a square ratio', function (done) {
        this.crop.setRatio(1)
        this.crop.on('change', function (crop) {
          expect(crop).to.deep.equal({
            x: 50,
            y: 0,
            width: 300,
            height: 300
          })

          done()
        })
      })
    )
  })

  describe('when it is loading the image', function () {

    beforeEach(function () {
      this.arena = $(template)
      this.arena.css({width: 100, height: 100})
      $(document.body).append(this.arena)

      // Crop a 400x300 image
      this.crop = srcissors.new({
        arena: this.arena,
        url: 'base/test/images/diagonal.jpg'
      })
    })

    afterEach(function () {
      this.arena.remove()
    })

    it('calls ready, load and change events', function (done) {
      let readyIsCalled = 0
      let loadIsCalled = 0
      let changeIsCalled = 0

      this.crop.on('ready', function () {
        readyIsCalled += 1
        expect(changeIsCalled).to.equal(0)
        expect(loadIsCalled).to.equal(0)
      })

      this.crop.on('load', function () {
        loadIsCalled += 1
        expect(readyIsCalled).to.equal(1)
        expect(changeIsCalled).to.equal(0)
      })

      this.crop.on('change', function (crop) {
        changeIsCalled += 1
        expect(loadIsCalled).to.equal(1)
        expect(readyIsCalled).to.equal(1)
        done()
      })
    })

    it('calling setCrop() before cropper is ready still works', function (done) {
      this.crop.setRatio(1)
      this.crop.on('ready', () => {
        const info = this.crop.getCrop()
        expect(info).to.deep.equal({
          x: 50,
          y: 0,
          width: 300,
          height: 300
        })

        done()
      })
    })
  })

  describe('with surrounding image always enabled', function () {

    beforeEach(function (done) {
      this.arena = $(template)
      this.arena.css({width: 100, height: 100})
      $(document.body).append(this.arena)

      // Crop a 400x300 image
      this.crop = srcissors.new({
        arena: this.arena,
        url: 'base/test/images/diagonal.jpg',
        showSurroundingImage: 'always',
        surroundingImageOpacity: 0.4
      })
      this.crop.on('ready', done)
    })

    afterEach(function () {
      this.arena.remove()
    })

    it('has initialized the crop outline background correctly', function () {
      const outline = this.arena.find('.crop-outline')
      const bgImg = outline.find('img')

      expect(bgImg.length).to.equal(1)
      expect(bgImg.get(0).style.opacity).to.equal('0.4')
      expect(outline.get(0).style.opacity).to.equal('1')
    })

    it('cleans up the crop outline when setting a different image', function () {
      this.crop.setImage('base/test/images/berge.jpg')

      const bgImg = this.arena.find('.crop-outline img')
      expect(bgImg.length).to.equal(1)
    })
  })

  describe('with surrounding image enabled when panning', function () {

    beforeEach(function (done) {
      this.arena = $(template)
      this.arena.css({width: 100, height: 100})
      $(document.body).append(this.arena)

      // Crop a 400x300 image
      this.crop = srcissors.new({
        arena: this.arena,
        url: 'base/test/images/diagonal.jpg',
        showSurroundingImage: 'panning'
      })
      this.crop.on('ready', done)
    })

    afterEach(function () {
      this.arena.remove()
    })

    it('has initialized the crop outline background correctly', function () {
      const outline = this.arena.find('.crop-outline')
      const bgImg = outline.find('img')

      expect(bgImg.length).to.equal(1)
      expect(bgImg.get(0).style.opacity).to.equal('0.2')
      expect(outline.get(0).style.opacity).to.equal('')
    })
  })

  describe('with surrounding image disabled by default', function () {

    beforeEach(function () {
      this.arena = $(template)
      this.arena.css({width: 100, height: 100})
      $(document.body).append(this.arena)
    })

    afterEach(function () {
      this.arena.remove()
    })

    it('omits the background image without surrounding image config', function (done) {
      this.crop = srcissors.new({
        arena: this.arena,
        url: 'base/test/images/diagonal.jpg'
      })
      this.crop.on('ready', done)

      const outline = this.arena.find('.crop-outline')
      const bgImg = outline.find('img')

      expect(bgImg.length).to.equal(0)
      expect(outline.get(0).style.opacity).to.equal('0')
    })
  })
})
