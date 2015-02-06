srcissors = require('../../src/srcissors')

template = """
  <div class="crop-arena">
    <div class="crop-view">

      <!-- image -->
      <div class="crop-preview"></div>

    </div>
  </div>
  """

describe 'srcissors', ->

  it 'creates a new instance', ->
    html = $(template)
    crop = srcissors.new
      arena: html

    expect(crop).to.exist


  describe 'with a 100x100 arena', ->

    beforeEach (done) ->
      @arena = $(template)
      @arena.css(width: 100, height: 100)
      $(document.body).append(@arena)

      # Crop a 400x300 image
      @crop = srcissors.new
        arena: @arena
        url: 'base/test/images/diagonal.jpg'
        fit: true
      @crop.on 'ready', done


    afterEach ->
      @arena.remove()


    it 'has initialized the image correctly', ->
      expect(@crop.imageWidth).to.equal(400)
      expect(@crop.imageHeight).to.equal(300)


    it 'fires a change event after ready', (done) ->
      @crop.on 'change', (crop) ->
        expect(crop).to.deep.equal
          x: 0
          y: 0
          width: 400
          height: 300

        done()


    describe 'zoom()', ->

      # Zoom a 400x300 image by factor 2 in an arena of 100x100
      # The view should keep the images aspect ratio and have a size of 100x75
      it 'zooms 2x into the center', (done) ->
        @crop.zoom(width: 200)
        @crop.on 'change', (crop) =>
          expect(crop).to.deep.equal
            x: 100
            y: 75
            width: 200
            height: 150

          done()


    describe 'setRatio()', ->

      it 'sets a square ratio', (done) ->
        @crop.setRatio(1)
        @crop.on 'change', (crop) =>
          expect(crop).to.deep.equal
            x: 50
            y: 0
            width: 300
            height: 300

          done()


  describe 'with a 100x200 arena', ->

    beforeEach (done) ->
      @arena = $(template)
      @arena.css(width: 100, height: 200)
      $(document.body).append(@arena)

      # Crop a 400x300 image
      @crop = srcissors.new
        arena: @arena
        url: 'base/test/images/diagonal.jpg'
        fit: true
      @crop.on 'ready', done


    afterEach ->
      @arena.remove()


    it 'has initialized the view correctly', ->
      expect(@crop.viewWidth).to.equal(100)
      expect(@crop.viewHeight).to.equal(75)


    describe 'setRatio()', ->

      it 'sets a square ratio', (done) ->
        @crop.setRatio(1)
        @crop.on 'change', (crop) =>
          @crop.debug()
          expect(crop).to.deep.equal
            x: 50
            y: 0
            width: 300
            height: 300

          done()

