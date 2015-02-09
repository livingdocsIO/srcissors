# srcissors

Image cropping for responsive images.
(~4kB minified and gzipped)

### Js

```javascript
// Initialize srcissors
var cropper = srcissors.new({
  arena: $('.crop-arena'),
  url: "/images/diagonal.jpg",
  fixedWidth: 300,
  minRatio: 1/1.5,
  maxRatio: 1.5/1
});

// Set a crop
cropper.setCrop({
  x: 1096,
  y: 461,
  width: 700,
  height: 500
})

// Get the current crop
cropper.getCrop();

// Set a ratio
cropper.setRatio(4/3);

// Listen for events
cropper.on('ready', function() {
    // your code
});

cropper.on('change', function(crop) {
    var x, y, width, height;
    x = crop.x;
    y = crop.y;
    width = crop.width;
    height = crop.height;
});


```


### Configuration Options

| Parameter | Type |  |
|---------------|-------------|--------------------------------|
| `arena` | jQuery element |  |
| `url` | String | Url of the image to load |
| `crop` | Object {x, y, width, height} | Initial crop. The same as calling `setCrop()` |
| `fixedWidth`, `fixedHeight` | Number | Will fix the preview width and only allow for resizes in the other axis. |
| `minWidth`, `minHeight` | Number | Minimum widht or height the preview can be. |
| `minRatio`, `maxRatio` |  Number | Prohibit extreme image ratios with these settings. |
| `maxArea` | Number | e.g. `0.8` means max 80% of the area will be covered by the image. This makes for smoth transitions between wide and tall image formats. |
| `zoomStep` | Number | e.g. `1.25` means every zoom will enlarge the preview by 25%. |


### HTML

This is the basic HTML used by srcissors in the examples. The zoom controls are not needed by the script and you need create the click events for zooming yourself. Have a look at how it can be done in `examples/index.html`.

There are also more setups for you to look at in `examples/fit-to-area.html` and `examples/small-image.html`.

```html
<div class="crop-arena">
  <div class="crop-view">
    <!-- Outline -->
    <div class="crop-outline"></div>

    <!-- zoom controls -->
    <div class="top-left">
        <div class="crop-zoom-controls crop-zoom-controls--outside">
          <a class="icon-zoom icon-zoom-in" href="#" title="Zoom in"></a>
          <a class="icon-zoom icon-zoom-out" href="#" title="Zoom out"></a>
        </div>
    </div>

    <!-- image -->
    <div class="crop-preview clip-content cover-all"></div>

  </div>
</div>
```


### Css

All the UI elements are styled with CSS. Just start with the CSS from `examples/css/srcissors.css`.


### Development

```bash
# Watch for changes and fire up a webserver with livereload
grunt dev

# Run the tests with karma
grunt test

# Run tests and build scrissors.js and scrissors.min.js
grunt build
```


---
---
---

#### Licence

Copyright (c) 2015 upfront GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License (LGPL) as
published by the Free Software Foundation, either version 3 of the License, 
or (at your option) any later version.
