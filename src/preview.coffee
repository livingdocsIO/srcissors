module.exports = class Preview

  constructor: ({ @onReady, @img }) ->
    @x = @y = 0
    @width = @height = 0

    @img.on 'load', =>
      @updateImageDimensions()
      @onReady(width: @width, height: @height)
      @img.show()


  setImage: ({ url }) ->
    @img.attr('src', url)


  setWidth: (width) ->
    @img.css(width: "#{ width }px", height: 'auto')
    @updateImageDimensions()


  setHeight: (height) ->
    @img.css(width: 'auto', height: "#{ height }px")
    @updateImageDimensions()


  updateImageDimensions: ->
    @width = @img.width()
    @height = @img.height()


  pan: (@x, @y) ->
    @img.css(transform: "translate(-#{ @x }px, -#{ @y }px)")

