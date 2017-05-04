$ = require('jquery')

module.exports = class Preview

  constructor: ({ @onReady, @img, @opacity, @outline }) ->
    @x = @y = 0
    @width = @height = 0

    @img.on 'load', =>
      width = @img.width()
      height = @img.height()
      @ratio = width / height

      @updateImageDimensions({ width, height })
      @onReady(width: @width, height: @height)
      @img.show()


  setImage: ({ @url }) ->
    @img.attr('src', @url)
    @setBackgroundImage({url: @url}) if @outline

  
  setBackgroundImage: ({ url }) ->
    if @opacity > 0
      bg_img = $('<img>').css(opacity: @opacity).attr('src', url)
      @outline.append(bg_img)


  reset: ->
    @url = undefined
    @x = @y = 0
    @width = @height = 0
    @img.attr('src', '')
    @img.css(width: '', height: '', transform: '')
    @outline.css(transform: '').html('') if @outline


  setWidth: (width) ->
    @img.css(width: "#{ width }px", height: 'auto')
    height = width / @ratio
    @updateImageDimensions({ width, height })


  setHeight: (height) ->
    @img.css(width: 'auto', height: "#{ height }px")
    width = height * @ratio
    @updateImageDimensions({ width, height })


  updateImageDimensions: ({ width, height }) ->
    @width = width
    @height = height
    @outline.css(width: "#{ @width }px", height: "#{ @height }px") if @outline


  pan: (@x, @y) ->
    # Without rounding some numbers would not be set to css.
    # e.g: '-5.14957320384e-14'
    x = Math.round(@x)
    y = Math.round(@y)
    @img.css(transform: "translate(-#{ x }px, -#{ y }px)")
    @outline.css(transform: "translate(-#{ x }px, -#{ y }px)") if @outline

