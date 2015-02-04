module.exports = class Preview

  constructor: ({ @onReady, @img, @outline }) ->
    @x = @y = 0
    @width = @height = 0

    @img.on 'load', =>
      @updateImageDimensions()

      @ratio = @width / @height
      @originalWidth = @width
      @originalHeight = @height
      @scaleFactor = 1

      @img.css(transformOrigin: '0 0 0')
      @outline.css(transformOrigin: '0 0 0') if @outline

      @onReady(width: @width, height: @height)
      @img.show()


  setImage: ({ url }) ->
    @img.attr('src', url)


  setWidth: (width) ->
    @scale({ width })


  setHeight: (height) ->
    @scale({ height })


  scale: ({ width, height }) ->
    if width
      height = width / @ratio
    else
      width = height * @ratio

    @scaleFactor = width / @originalWidth

    @transform(@img)
    @transform(@outline)

    @width = width
    @height = height


  transform: ($elem) ->
    return unless $elem
    $elem.css(transform: "scale(#{ @scaleFactor }) translate(-#{ @x / @scaleFactor }px, -#{ @y / @scaleFactor }px)")


  updateImageDimensions: ->
    @width = @img.width()
    @height = @img.height()
    @outline.css(width: "#{ @width }px", height: "#{ @height }px") if @outline


  pan: (@x, @y) ->
    @transform(@img)
    @transform(@outline)

