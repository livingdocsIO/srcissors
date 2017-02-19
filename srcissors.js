(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var $, Crop, Events, Preview,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Preview = require('./preview');

Events = require('./events');

module.exports = Crop = (function() {
  function Crop(arg) {
    var crop, maxArea, url, zoomStep;
    this.arena = arg.arena, this.view = arg.view, this.img = arg.img, this.outline = arg.outline, url = arg.url, this.fixedWidth = arg.fixedWidth, this.fixedHeight = arg.fixedHeight, this.minViewWidth = arg.minViewWidth, this.minViewHeight = arg.minViewHeight, this.minViewRatio = arg.minViewRatio, this.maxViewRatio = arg.maxViewRatio, crop = arg.crop, zoomStep = arg.zoomStep, maxArea = arg.maxArea, this.actions = arg.actions, this.minResolution = arg.minResolution;
    this.onPreviewReady = bind(this.onPreviewReady, this);
    this.loadingCssClass = 'crop-view--is-loading';
    this.panningCssClass = 'crop-view--is-panning';
    this.outlineCssClass = 'crop-outline--active';
    this.isPanning = false;
    this.initialCrop = crop;
    this.loadEvent = $.Callbacks();
    this.changeEvent = $.Callbacks();
    this.initializeReadyState();
    this.zoomInStep = zoomStep;
    this.zoomOutStep = 1 / this.zoomInStep;
    this.arenaWidth = this.arena.width();
    this.arenaHeight = this.arena.height();
    if (maxArea) {
      this.maxArea = (this.arenaWidth * this.arenaHeight) * maxArea;
    }
    this.preview = new Preview({
      onReady: this.onPreviewReady,
      img: this.img,
      outline: this.outline
    });
    this.setImage(url);
  }

  Crop.prototype.initializeReadyState = function() {
    var ref;
    this.isReady = false;
    if ((ref = this.readyEvent) != null) {
      ref.empty();
    }
    return this.readyEvent = $.Callbacks('memory once');
  };

  Crop.prototype.setImage = function(url) {
    if (url === this.preview.url) {
      return;
    }
    if (this.isInitialized) {
      this.preview.reset();
    }
    this.initializeReadyState();
    this.view.addClass(this.loadingCssClass);
    return this.preview.setImage({
      url: url
    });
  };

  Crop.prototype.reset = function() {
    if (!this.isReady) {
      return;
    }
    this.resize({
      width: this.imageWidth,
      height: this.imageHeight
    });
    return this.zoomAllOut();
  };

  Crop.prototype.onPreviewReady = function(arg) {
    var height, imageResolution, keepDimension, maxRatioForResolution, minRatioForResolution, width;
    width = arg.width, height = arg.height;
    if (!this.isInitialized) {
      this.events = new Events({
        parent: this,
        view: this.view,
        actions: this.actions
      });
    }
    this.imageWidth = width;
    this.imageHeight = height;
    this.imageRatio = this.imageWidth / this.imageHeight;
    imageResolution = this.imageWidth * this.imageHeight;
    if (this.minResolution && this.minResolution > imageResolution) {
      delete this.minResolution;
    }
    if (this.minResolution) {
      minRatioForResolution = this.minResolution / (this.imageHeight * this.imageHeight);
      if (!this.minViewRatio || this.minViewRatio < minRatioForResolution) {
        this.minViewRatio = minRatioForResolution;
      }
      maxRatioForResolution = (this.imageWidth * this.imageWidth) / this.minResolution;
      if (!this.maxViewRatio || this.maxViewRatio > maxRatioForResolution) {
        this.maxViewRatio = maxRatioForResolution;
      }
    }
    this.calcMaxMinDimensions();
    if (this.fixedWidth) {
      keepDimension = 'width';
    }
    if (this.fixedHeight) {
      keepDimension = 'height';
    }
    this.setViewDimensions({
      width: this.imageWidth,
      height: this.imageHeight,
      keepDimension: keepDimension
    });
    this.isReady = true;
    this.view.removeClass(this.loadingCssClass);
    if (!this.isInitialized && (this.initialCrop != null)) {
      this.setCrop(this.initialCrop);
    } else {
      this.zoomAllOut();
      this.center();
    }
    this.isInitialized = true;
    this.readyEvent.fire();
    return this.loadEvent.fire();
  };

  Crop.prototype.setCrop = function(arg) {
    var factor, height, previewWidth, width, x, y;
    x = arg.x, y = arg.y, width = arg.width, height = arg.height;
    if (!this.isReady) {
      this.on('ready', (function(_this) {
        return function() {
          return _this.setCrop({
            x: x,
            y: y,
            width: width,
            height: height
          });
        };
      })(this));
      return;
    }
    this.resize({
      width: width,
      height: height
    });
    factor = this.viewWidth / width;
    previewWidth = this.imageWidth * factor;
    this.zoom({
      width: previewWidth
    });
    return this.pan({
      x: x * factor,
      y: y * factor
    });
  };

  Crop.prototype.getCrop = function() {
    var crop, factor;
    factor = this.preview.width / this.imageWidth;
    crop = {
      x: this.preview.x / factor,
      y: this.preview.y / factor,
      width: this.viewWidth / factor,
      height: this.viewHeight / factor
    };
    this.roundCrop(crop);
    this.validateCrop(crop);
    return crop;
  };

  Crop.prototype.roundCrop = function(crop) {
    var name, results, value;
    results = [];
    for (name in crop) {
      value = crop[name];
      results.push(crop[name] = Math.round(value));
    }
    return results;
  };

  Crop.prototype.validateCrop = function(crop) {
    var height, width, x, y;
    x = crop.x, y = crop.y, width = crop.width, height = crop.height;
    if (x + width > this.imageWidth) {
      crop.width = this.imageWidth - x;
    } else if (y + height > this.imageHeight) {
      crop.height = this.imageHeight - y;
    }
    return crop;
  };

  Crop.prototype.setRatio = function(ratio, keepDimension) {
    var height, width;
    if (!this.isReady) {
      this.on('ready', (function(_this) {
        return function() {
          return _this.setRatio(ratio, keepDimension);
        };
      })(this));
      return;
    }
    ratio = this.enforceValidRatio(ratio);
    if (keepDimension === 'height') {
      height = this.viewHeight;
      width = height * ratio;
    } else {
      width = this.viewWidth;
      height = width / ratio;
    }
    this.resizeFocusPoint = this.getFocusPoint();
    return this.resize({
      width: width,
      height: height
    });
  };

  Crop.prototype.onPan = function(data) {
    var newX, newY;
    if (!this.isPanning) {
      this.isPanning = true;
      this.arena.addClass(this.panningCssClass);
      this.outline.addClass(this.outlineCssClass);
    }
    newX = data.startX - data.dx;
    newY = data.startY - data.dy;
    return this.pan({
      x: newX,
      y: newY
    });
  };

  Crop.prototype.onPanEnd = function() {
    this.isPanning = false;
    this.arena.removeClass(this.panningCssClass);
    return this.outline.removeClass(this.outlineCssClass);
  };

  Crop.prototype.onDoubleClick = function(arg) {
    var left, pageX, pageY, ref, top, viewX, viewY;
    pageX = arg.pageX, pageY = arg.pageY;
    ref = this.view[0].getBoundingClientRect(), left = ref.left, top = ref.top;
    viewX = pageX - left;
    viewY = pageY - top;
    return this.zoomIn({
      viewX: viewX,
      viewY: viewY
    });
  };

  Crop.prototype.onResize = function(arg) {
    var dx, dy, position;
    position = arg.position, dx = arg.dx, dy = arg.dy;
    if (!this.isResizing) {
      this.isResizing = true;
      this.resizeFocusPoint = this.getFocusPoint();
    }
    if (position === 'top' || position === 'bottom') {
      dy = 2 * dy;
      return this.resize({
        width: this.viewWidth,
        height: this.viewHeight + dy,
        keepDimension: 'height'
      });
    } else if (position === 'left' || position === 'right') {
      dx = 2 * dx;
      return this.resize({
        width: this.viewWidth + dx,
        height: this.viewHeight,
        keepDimension: 'width'
      });
    }
  };

  Crop.prototype.onResizeEnd = function() {
    this.isResizing = false;
    return this.resizeFocusPoint = void 0;
  };

  Crop.prototype.resize = function(arg) {
    var height, keepDimension, width;
    width = arg.width, height = arg.height, keepDimension = arg.keepDimension;
    this.setViewDimensions({
      width: width,
      height: height,
      keepDimension: keepDimension
    });
    if (this.resizeFocusPoint) {
      this.resizeFocusPoint.viewX = this.viewWidth / 2;
      this.resizeFocusPoint.viewY = this.viewHeight / 2;
    }
    return this.zoom({
      width: this.preview.width,
      height: this.preview.height,
      focusPoint: this.resizeFocusPoint
    });
  };

  Crop.prototype.setViewDimensions = function(arg) {
    var height, keepDimension, minZoomPixelHeight, minZoomPixelWidth, ref, ref1, width;
    width = arg.width, height = arg.height, keepDimension = arg.keepDimension;
    if (this.maxArea) {
      ref = this.enforceMaxArea({
        width: width,
        height: height,
        keepDimension: keepDimension
      }), width = ref.width, height = ref.height;
    }
    ref1 = this.enforceViewDimensions({
      width: width,
      height: height,
      keepDimension: keepDimension
    }), width = ref1.width, height = ref1.height;
    this.view.css({
      width: width,
      height: height
    });
    this.viewWidth = width;
    this.viewHeight = height;
    this.viewRatio = width / height;
    if (this.minResolution) {
      minZoomPixelWidth = Math.sqrt(this.minResolution * this.viewRatio);
      minZoomPixelHeight = Math.sqrt(this.minResolution / this.viewRatio);
      this.maxImageWidth = (this.viewWidth / minZoomPixelWidth) * this.imageWidth;
      this.maxImageHeight = (this.viewHeight / minZoomPixelHeight) * this.imageHeight;
    }
    return this.fireChange();
  };

  Crop.prototype.zoomAllOut = function() {
    if (this.isWidthRestricting()) {
      return this.zoom({
        width: this.viewWidth
      });
    } else {
      return this.zoom({
        height: this.viewHeight
      });
    }
  };

  Crop.prototype.zoomIn = function(params) {
    if (params == null) {
      params = {};
    }
    if (this.isWidthRestricting()) {
      params.width = this.preview.width * this.zoomInStep;
    } else {
      params.height = this.preview.height * this.zoomInStep;
    }
    return this.zoom(params);
  };

  Crop.prototype.zoomOut = function(params) {
    if (params == null) {
      params = {};
    }
    if (this.isWidthRestricting()) {
      params.width = this.preview.width * this.zoomOutStep;
    } else {
      params.height = this.preview.height * this.zoomOutStep;
    }
    return this.zoom(params);
  };

  Crop.prototype.zoom = function(arg) {
    var focusPoint, height, ref, viewX, viewY, width;
    width = arg.width, height = arg.height, viewX = arg.viewX, viewY = arg.viewY, focusPoint = arg.focusPoint;
    if (focusPoint == null) {
      focusPoint = this.getFocusPoint({
        viewX: viewX,
        viewY: viewY
      });
    }
    ref = this.enforceZoom({
      width: width,
      height: height
    }), width = ref.width, height = ref.height;
    if (width != null) {
      this.preview.setWidth(width);
      this.fireChange();
    } else if (height != null) {
      this.preview.setHeight(height);
      this.fireChange();
    }
    return this.focus(focusPoint);
  };

  Crop.prototype.getFocusPoint = function(arg) {
    var percentX, percentY, ref, viewX, viewY, x, y;
    ref = arg != null ? arg : {}, viewX = ref.viewX, viewY = ref.viewY;
    if (viewX == null) {
      viewX = this.viewWidth / 2;
    }
    if (viewY == null) {
      viewY = this.viewHeight / 2;
    }
    x = this.preview.x + viewX;
    y = this.preview.y + viewY;
    percentX = x / this.preview.width;
    percentY = y / this.preview.height;
    return {
      percentX: percentX,
      percentY: percentY,
      viewX: viewX,
      viewY: viewY
    };
  };

  Crop.prototype.focus = function(arg) {
    var percentX, percentY, viewX, viewY, x, y;
    percentX = arg.percentX, percentY = arg.percentY, viewX = arg.viewX, viewY = arg.viewY;
    x = this.preview.width * percentX;
    y = this.preview.height * percentY;
    x = x - viewX;
    y = y - viewY;
    return this.pan({
      x: x,
      y: y
    });
  };

  Crop.prototype.center = function() {
    var newX, newY;
    newX = (this.preview.width - this.viewWidth) / 2;
    newY = (this.preview.height - this.viewHeight) / 2;
    return this.pan({
      x: newX,
      y: newY
    });
  };

  Crop.prototype.pan = function(data) {
    data = this.enforceXy(data);
    this.preview.pan(data.x, data.y);
    return this.fireChange();
  };

  Crop.prototype.enforceXy = function(arg) {
    var x, y;
    x = arg.x, y = arg.y;
    if (x < 0) {
      x = 0;
    } else if (x > this.preview.width - this.viewWidth) {
      x = this.preview.width - this.viewWidth;
    }
    if (y < 0) {
      y = 0;
    } else if (y > this.preview.height - this.viewHeight) {
      y = this.preview.height - this.viewHeight;
    }
    return {
      x: x,
      y: y
    };
  };

  Crop.prototype.enforceZoom = function(arg) {
    var height, width;
    width = arg.width, height = arg.height;
    if ((width != null) && this.maxImageWidth && width > this.maxImageWidth) {
      return {
        width: this.maxImageWidth
      };
    }
    if ((width != null) && width < this.viewWidth) {
      return {
        width: this.viewWidth
      };
    }
    if ((height != null) && this.maxImageHeight && height > this.maxImageHeight) {
      return {
        height: this.maxImageHeight
      };
    }
    if ((height != null) && height < this.viewHeight) {
      return {
        height: this.viewHeight
      };
    }
    return {
      width: width,
      height: height
    };
  };

  Crop.prototype.calcMaxMinDimensions = function() {
    this.maxWidth = this.min([this.arenaWidth, this.imageWidth]);
    this.maxHeight = this.min([this.arenaHeight, this.imageHeight]);
    this.minWidth = this.minViewWidth || 0;
    this.minHeight = this.minViewHeight || 0;
    if (this.fixedWidth) {
      this.maxWidth = this.minWidth = this.fixedWidth;
    }
    if (this.fixedHeight) {
      return this.maxHeight = this.minHeight = this.fixedHeight;
    }
  };

  Crop.prototype.areDimensionsValid = function(arg) {
    var height, invalid, keepDimension, ratio, width;
    width = arg.width, height = arg.height, keepDimension = arg.keepDimension;
    ratio = width / height;
    invalid = width < this.minWidth || width > this.maxWidth || height < this.minHeight || height > this.maxHeight || ratio < this.minViewRatio || ratio > this.maxViewRatio;
    return !invalid;
  };

  Crop.prototype.isValidRatio = function(ratio) {
    return !(ratio < this.minViewRatio || ratio > this.maxViewRatio);
  };

  Crop.prototype.enforceValidRatio = function(ratio) {
    if (ratio < this.minViewRatio) {
      return this.minViewRatio;
    }
    if (ratio > this.maxViewRatio) {
      return this.maxViewRatio;
    }
    return ratio;
  };

  Crop.prototype.enforceViewDimensions = function(arg) {
    var height, keepDimension, newHeight, newWidth, ratio, ref, ref1, ref2, width;
    width = arg.width, height = arg.height, keepDimension = arg.keepDimension;
    if (width < this.minWidth) {
      newWidth = this.minWidth;
    }
    if (width > this.maxWidth) {
      newWidth = this.maxWidth;
    }
    if (height < this.minHeight) {
      newHeight = this.minHeight;
    }
    if (height > this.maxHeight) {
      newHeight = this.maxHeight;
    }
    if (keepDimension) {
      if (newWidth) {
        width = newWidth;
      }
      if (newHeight) {
        height = newHeight;
      }
      ratio = width / height;
      if (!this.isValidRatio(ratio)) {
        ratio = this.enforceValidRatio(ratio);
        ref = this.getRatioBox({
          ratio: ratio,
          width: width,
          height: height,
          keepDimension: keepDimension
        }), width = ref.width, height = ref.height;
        if (width > this.arenaWidth || height > this.arenaHeight) {
          ref1 = this.centerAlign(this.maxWidth, this.maxHeight, ratio), width = ref1.width, height = ref1.height;
        }
      }
    } else if (newWidth || newHeight) {
      ratio = this.enforceValidRatio(width / height);
      ref2 = this.centerAlign(this.maxWidth, this.maxHeight, ratio), width = ref2.width, height = ref2.height;
    }
    return {
      width: width,
      height: height
    };
  };

  Crop.prototype.enforceMaxArea = function(arg) {
    var height, keepDimension, ratio, width;
    width = arg.width, height = arg.height, keepDimension = arg.keepDimension;
    ratio = width / height;
    if (keepDimension === 'width') {
      height = this.maxArea / width;
      ratio = width / height;
    } else if (keepDimension === 'height') {
      width = this.maxArea / height;
      ratio = width / height;
    } else {
      width = Math.sqrt(this.maxArea * ratio);
      height = width / ratio;
    }
    if (!this.isValidRatio(ratio)) {
      ratio = this.enforceValidRatio(ratio);
      width = Math.sqrt(this.maxArea * ratio);
      height = width / ratio;
    }
    return {
      width: width,
      height: height
    };
  };

  Crop.prototype.isWidthRestricting = function() {
    return this.viewRatio >= this.imageRatio;
  };

  Crop.prototype.getRatioBox = function(arg) {
    var height, keepDimension, ratio, width;
    ratio = arg.ratio, width = arg.width, height = arg.height, keepDimension = arg.keepDimension;
    if (keepDimension === 'width' || (height == null)) {
      height = width / ratio;
    } else if (keepDimension === 'height' || (width == null)) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
    return {
      width: width,
      height: height
    };
  };

  Crop.prototype.centerAlign = function(areaWidth, areaHeight, ratio) {
    var height, width, x, y;
    if ((areaWidth / areaHeight) > ratio) {
      width = areaHeight * ratio;
      x = (areaWidth - width) / 2;
    } else {
      height = areaWidth / ratio;
      y = (areaHeight - height) / 2;
    }
    return {
      x: x || 0,
      y: y || 0,
      width: width || areaWidth,
      height: height || areaHeight
    };
  };

  Crop.prototype.min = function(array) {
    var i, len, min, number;
    min = array[0];
    for (i = 0, len = array.length; i < len; i++) {
      number = array[i];
      if (number < min) {
        min = number;
      }
    }
    return min;
  };

  Crop.prototype.on = function(name, callback) {
    return this[name + "Event"].add(callback);
  };

  Crop.prototype.off = function(name, callback) {
    return this[name + "Event"].remove(callback);
  };

  Crop.prototype.fireChange = function() {
    if (this.changeDispatch != null) {
      return;
    }
    return this.changeDispatch = setTimeout((function(_this) {
      return function() {
        _this.changeDispatch = void 0;
        return _this.changeEvent.fire(_this.getCrop());
      };
    })(this), 0);
  };

  Crop.prototype.debug = function() {
    var obj, r;
    r = function(num) {
      return Math.round(num * 10) / 10;
    };
    obj = {
      arena: (r(this.arenaWidth)) + "x" + (r(this.arenaHeight)),
      view: (r(this.viewWidth)) + "x" + (r(this.viewHeight)),
      image: (r(this.imageWidth)) + "x" + (r(this.imageHeight)),
      preview: (r(this.preview.width)) + "x" + (r(this.preview.height)),
      previewXy: (r(this.preview.x)) + "x" + (r(this.preview.y))
    };
    console.log(obj);
    return obj;
  };

  return Crop;

})();



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./events":2,"./preview":3}],2:[function(require,module,exports){
(function (global){
var $, Events;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

module.exports = Events = (function() {
  function Events(arg) {
    var actions, horizontal, vertical;
    this.parent = arg.parent, this.view = arg.view, horizontal = arg.horizontal, vertical = arg.vertical, actions = arg.actions;
    this.doubleClickThreshold = 300;
    if (actions.pan) {
      this.pan();
    }
    if (actions.zoomOnDoubleClick) {
      this.doubleClick();
    }
    if (actions.resize) {
      this.resizeView({
        horizontal: actions.resizeHorizontal,
        vertical: actions.resizeVertical
      });
    }
    this.preventBrowserDragDrop();
    this.responsiveArena();
  }

  Events.prototype.pan = function() {
    var $doc;
    $doc = $(document);
    return this.view.on('mousedown.srcissors', (function(_this) {
      return function(e1) {
        var panData;
        panData = {
          startX: _this.parent.preview.x,
          startY: _this.parent.preview.y
        };
        e1.preventDefault();
        return $doc.on('mousemove.srcissors-pan', function(e2) {
          panData.dx = e2.pageX - e1.pageX;
          panData.dy = e2.pageY - e1.pageY;
          return _this.parent.onPan(panData);
        }).on('mouseup.srcissors-pan', function() {
          $doc.off('mouseup.srcissors-pan');
          $doc.off('mousemove.srcissors-pan');
          if (panData.dx != null) {
            return _this.parent.onPanEnd();
          }
        });
      };
    })(this));
  };

  Events.prototype.doubleClick = function() {
    var lastClick;
    lastClick = void 0;
    return this.view.on('mousedown.srcissors', (function(_this) {
      return function(event) {
        var now;
        now = new Date().getTime();
        if (lastClick && lastClick > now - _this.doubleClickThreshold) {
          _this.parent.onDoubleClick({
            pageX: event.pageX,
            pageY: event.pageY
          });
        } else {

        }
        return lastClick = now;
      };
    })(this));
  };

  Events.prototype.preventBrowserDragDrop = function() {
    return this.view.on('dragstart.srcissors', function() {
      return false;
    });
  };

  Events.prototype.resizeView = function(arg) {
    var $template, horizontal, positions, vertical;
    horizontal = arg.horizontal, vertical = arg.vertical;
    $template = $('<div>');
    $template.addClass('resize-handler');
    positions = [];
    if (horizontal) {
      positions = positions.concat(['right', 'left']);
    }
    if (vertical) {
      positions = positions.concat(['top', 'bottom']);
    }
    return positions.forEach((function(_this) {
      return function(position) {
        var $handler;
        $handler = $template.clone();
        $handler.addClass("resize-handler-" + position);
        $handler.on('mousedown.srcissors', _this.getResizeMouseDown(position));
        return _this.view.append($handler);
      };
    })(this));
  };

  Events.prototype.getResizeMouseDown = function(position) {
    var $doc;
    $doc = $(document);
    return (function(_this) {
      return function(event) {
        var lastX, lastY;
        lastX = event.pageX;
        lastY = event.pageY;
        event.stopPropagation();
        return $doc.on('mousemove.srcissors-resize', function(e2) {
          var dx, dy;
          switch (position) {
            case 'top':
            case 'bottom':
              dy = e2.pageY - lastY;
              if (position === 'top') {
                dy = -dy;
              }
              lastY = e2.pageY;
              break;
            case 'left':
            case 'right':
              dx = e2.pageX - lastX;
              if (position === 'left') {
                dx = -dx;
              }
              lastX = e2.pageX;
          }
          return _this.parent.onResize({
            position: position,
            dx: dx,
            dy: dy
          });
        }).on('mouseup.srcissors-resize', function() {
          $doc.off('mouseup.srcissors-resize');
          $doc.off('mousemove.srcissors-resize');
          return _this.parent.onResizeEnd({
            position: position
          });
        });
      };
    })(this);
  };

  Events.prototype.responsiveArena = function() {};

  return Events;

})();



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
var Preview;

module.exports = Preview = (function() {
  function Preview(arg) {
    this.onReady = arg.onReady, this.img = arg.img, this.outline = arg.outline;
    this.x = this.y = 0;
    this.width = this.height = 0;
    this.img.on('load', (function(_this) {
      return function() {
        var height, width;
        width = _this.img.width();
        height = _this.img.height();
        _this.ratio = width / height;
        _this.updateImageDimensions({
          width: width,
          height: height
        });
        _this.onReady({
          width: _this.width,
          height: _this.height
        });
        return _this.img.show();
      };
    })(this));
  }

  Preview.prototype.setImage = function(arg) {
    this.url = arg.url;
    return this.img.attr('src', this.url);
  };

  Preview.prototype.reset = function() {
    this.url = void 0;
    this.x = this.y = 0;
    this.width = this.height = 0;
    this.img.attr('src', '');
    this.img.css({
      width: '',
      height: '',
      transform: ''
    });
    if (this.outline) {
      return this.outline.css({
        transform: ''
      });
    }
  };

  Preview.prototype.setWidth = function(width) {
    var height;
    this.img.css({
      width: width + "px",
      height: 'auto'
    });
    height = width / this.ratio;
    return this.updateImageDimensions({
      width: width,
      height: height
    });
  };

  Preview.prototype.setHeight = function(height) {
    var width;
    this.img.css({
      width: 'auto',
      height: height + "px"
    });
    width = height * this.ratio;
    return this.updateImageDimensions({
      width: width,
      height: height
    });
  };

  Preview.prototype.updateImageDimensions = function(arg) {
    var height, width;
    width = arg.width, height = arg.height;
    this.width = width;
    this.height = height;
    if (this.outline) {
      return this.outline.css({
        width: this.width + "px",
        height: this.height + "px"
      });
    }
  };

  Preview.prototype.pan = function(x1, y1) {
    var x, y;
    this.x = x1;
    this.y = y1;
    x = Math.round(this.x);
    y = Math.round(this.y);
    this.img.css({
      transform: "translate(-" + x + "px, -" + y + "px)"
    });
    if (this.outline) {
      return this.outline.css({
        transform: "translate(-" + x + "px, -" + y + "px)"
      });
    }
  };

  return Preview;

})();



},{}],4:[function(require,module,exports){
(function (global){
var $, Crop;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Crop = require('./crop');

module.exports = window.srcissors = {
  "new": function(arg) {
    var actions, allowedActions, arena, crop, fixedHeight, fixedWidth, img, maxArea, maxRatio, minHeight, minRatio, minResolution, minWidth, outline, preview, url, view, zoomStep;
    arena = arg.arena, url = arg.url, fixedWidth = arg.fixedWidth, fixedHeight = arg.fixedHeight, minWidth = arg.minWidth, minHeight = arg.minHeight, minRatio = arg.minRatio, maxRatio = arg.maxRatio, maxArea = arg.maxArea, zoomStep = arg.zoomStep, crop = arg.crop, actions = arg.actions, minResolution = arg.minResolution;
    arena = $(arena);
    view = arena.find('.crop-view');
    preview = view.find('.crop-preview');
    img = $('<img>');
    preview.append(img);
    outline = view.find('.crop-outline');
    if (!outline.length) {
      outline = void 0;
    }
    allowedActions = {
      pan: true,
      zoomOnDoubleClick: true,
      resize: true,
      resizeHorizontal: !fixedWidth,
      resizeVertical: !fixedHeight
    };
    $.extend(allowedActions, actions);
    if (zoomStep == null) {
      zoomStep = 1.25;
    }
    if (minWidth == null) {
      minWidth = 50;
    }
    if (minHeight == null) {
      minHeight = 50;
    }
    return new Crop({
      url: url,
      crop: crop,
      arena: arena,
      view: view,
      img: img,
      outline: outline,
      fixedWidth: fixedWidth,
      fixedHeight: fixedHeight,
      minViewWidth: minWidth,
      minViewHeight: minHeight,
      minViewRatio: minRatio,
      maxViewRatio: maxRatio,
      maxArea: maxArea,
      zoomStep: zoomStep,
      actions: allowedActions,
      minResolution: minResolution
    });
  }
};



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./crop":1}]},{},[4]);
