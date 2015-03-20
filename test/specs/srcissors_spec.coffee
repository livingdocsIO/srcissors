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


    describe 'setImage()', ->

      beforeEach (done) ->
        @crop.on 'load', done

        # Set a different 300x400 image
        @crop.setImage('base/test/images/berge.jpg')


      it 'sets the new image dimensions', ->
        expect(@crop.imageWidth).to.equal(300)
        expect(@crop.imageHeight).to.equal(400)


    describe 'reset()', ->

      it 'resets the zoom and ratio to the original', ->
        @crop.setRatio(1)
        @crop.zoom(width: 200)
        @crop.reset()
        expect(@crop.getCrop()).to.deep.equal
          x: 0
          y: 0
          width: 400
          height: 300


  describe 'with a 100x200 arena', ->

    beforeEach (done) ->
      @arena = $(template)
      @arena.css(width: 100, height: 200)
      $(document.body).append(@arena)

      # Crop a 400x300 image
      @crop = srcissors.new
        arena: @arena
        url: 'base/test/images/diagonal.jpg'
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
          expect(crop).to.deep.equal
            x: 50
            y: 0
            width: 300
            height: 300

          done()


  describe 'when it is loading the image', ->

    beforeEach ->
      @arena = $(template)
      @arena.css(width: 100, height: 100)
      $(document.body).append(@arena)

      # Crop a 400x300 image
      @crop = srcissors.new
        arena: @arena
        url: 'base/test/images/diagonal.jpg'


    afterEach ->
      @arena.remove()


    it 'calls ready, load and change events', (done) ->
      readyIsCalled = 0
      loadIsCalled = 0
      changeIsCalled = 0

      @crop.on 'ready', =>
        readyIsCalled += 1
        expect(changeIsCalled).to.equal(0)
        expect(loadIsCalled).to.equal(0)

      @crop.on 'load', =>
        loadIsCalled += 1
        expect(readyIsCalled).to.equal(1)
        expect(changeIsCalled).to.equal(0)

      @crop.on 'change', (crop) =>
        changeIsCalled += 1
        expect(loadIsCalled).to.equal(1)
        expect(readyIsCalled).to.equal(1)
        done()


    it 'calling setCrop() before cropper is ready still works', (done) ->
      @crop.setRatio(1)
      @crop.on 'ready', =>
        info = @crop.getCrop()
        expect(info).to.deep.equal
          x: 50
          y: 0
          width: 300
          height: 300

        done()
