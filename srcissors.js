(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Crop, Events, Preview,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Preview = require('./preview');

Events = require('./events');

module.exports = Crop = (function() {
  function Crop(_arg) {
    var crop, maxArea, url, zoomStep;
    this.arena = _arg.arena, this.view = _arg.view, this.img = _arg.img, this.outline = _arg.outline, url = _arg.url, this.fixedWidth = _arg.fixedWidth, this.fixedHeight = _arg.fixedHeight, this.minViewWidth = _arg.minViewWidth, this.minViewHeight = _arg.minViewHeight, this.minViewRatio = _arg.minViewRatio, this.maxViewRatio = _arg.maxViewRatio, crop = _arg.crop, zoomStep = _arg.zoomStep, maxArea = _arg.maxArea;
    this.onPreviewReady = __bind(this.onPreviewReady, this);
    this.loadingCssClass = 'crop-view--is-loading';
    this.panningCssClass = 'crop-view--is-panning';
    this.outlineCssClass = 'crop-outline--active';
    this.isPanning = false;
    this.initialCrop = crop;
    this.readyEvent = $.Callbacks('memory once');
    this.changeEvent = $.Callbacks();
    this.isReady = false;
    this.view.addClass(this.loadingCssClass);
    this.on('ready', (function(_this) {
      return function() {
        _this.isReady = true;
        return _this.view.removeClass(_this.loadingCssClass);
      };
    })(this));
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
    this.preview.setImage({
      url: url
    });
  }

  Crop.prototype.onPreviewReady = function(_arg) {
    var height, keepDimension, width;
    width = _arg.width, height = _arg.height;
    this.events = new Events({
      parent: this,
      view: this.view,
      horizontal: !this.fixedWidth,
      vertical: !this.fixedHeight
    });
    this.imageWidth = width;
    this.imageHeight = height;
    this.imageRatio = this.imageWidth / this.imageHeight;
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
    this.readyEvent.fire();
    if (this.initialCrop != null) {
      return this.setCrop(this.initialCrop);
    } else {
      this.zoomAllOut();
      return this.center();
    }
  };

  Crop.prototype.setCrop = function(_arg) {
    var factor, height, previewWidth, width, x, y;
    x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height;
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
    var name, value, _results;
    _results = [];
    for (name in crop) {
      value = crop[name];
      _results.push(crop[name] = Math.round(value));
    }
    return _results;
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
          return _this.setRatio({
            ratio: ratio,
            keepDimension: keepDimension
          });
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

  Crop.prototype.onDoubleClick = function(_arg) {
    var left, pageX, pageY, top, viewX, viewY, _ref;
    pageX = _arg.pageX, pageY = _arg.pageY;
    _ref = this.view[0].getBoundingClientRect(), left = _ref.left, top = _ref.top;
    viewX = pageX - left;
    viewY = pageY - top;
    return this.zoomIn({
      viewX: viewX,
      viewY: viewY
    });
  };

  Crop.prototype.onResize = function(_arg) {
    var dx, dy, position;
    position = _arg.position, dx = _arg.dx, dy = _arg.dy;
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

  Crop.prototype.resize = function(_arg) {
    var height, keepDimension, width;
    width = _arg.width, height = _arg.height, keepDimension = _arg.keepDimension;
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

  Crop.prototype.setViewDimensions = function(_arg) {
    var height, keepDimension, width, _ref, _ref1;
    width = _arg.width, height = _arg.height, keepDimension = _arg.keepDimension;
    if (this.maxArea) {
      _ref = this.enforceMaxArea({
        width: width,
        height: height,
        keepDimension: keepDimension
      }), width = _ref.width, height = _ref.height;
    }
    _ref1 = this.enforceViewDimensions({
      width: width,
      height: height,
      keepDimension: keepDimension
    }), width = _ref1.width, height = _ref1.height;
    this.view.css({
      width: width,
      height: height
    });
    this.viewWidth = width;
    this.viewHeight = height;
    this.viewRatio = width / height;
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

  Crop.prototype.zoom = function(_arg) {
    var focusPoint, height, viewX, viewY, width, _ref;
    width = _arg.width, height = _arg.height, viewX = _arg.viewX, viewY = _arg.viewY, focusPoint = _arg.focusPoint;
    if (focusPoint == null) {
      focusPoint = this.getFocusPoint({
        viewX: viewX,
        viewY: viewY
      });
    }
    _ref = this.enforceZoom({
      width: width,
      height: height
    }), width = _ref.width, height = _ref.height;
    if (width != null) {
      this.preview.setWidth(width);
      this.fireChange();
    } else if (height != null) {
      this.preview.setHeight(height);
      this.fireChange();
    }
    return this.focus(focusPoint);
  };

  Crop.prototype.getFocusPoint = function(_arg) {
    var percentX, percentY, viewX, viewY, x, y, _ref;
    _ref = _arg != null ? _arg : {}, viewX = _ref.viewX, viewY = _ref.viewY;
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

  Crop.prototype.focus = function(_arg) {
    var percentX, percentY, viewX, viewY, x, y;
    percentX = _arg.percentX, percentY = _arg.percentY, viewX = _arg.viewX, viewY = _arg.viewY;
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

  Crop.prototype.enforceXy = function(_arg) {
    var x, y;
    x = _arg.x, y = _arg.y;
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

  Crop.prototype.enforceZoom = function(_arg) {
    var height, width;
    width = _arg.width, height = _arg.height;
    if (width != null) {
      if (width > this.imageWidth) {
        return {
          width: this.imageWidth
        };
      } else if (width < this.viewWidth) {
        return {
          width: this.viewWidth
        };
      }
    }
    if (height != null) {
      if (height > this.imageHeight) {
        return {
          height: this.imageHeight
        };
      } else if (height < this.viewHeight) {
        return {
          height: this.viewHeight
        };
      }
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

  Crop.prototype.areDimensionsValid = function(_arg) {
    var height, invalid, keepDimension, ratio, width;
    width = _arg.width, height = _arg.height, keepDimension = _arg.keepDimension;
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

  Crop.prototype.enforceViewDimensions = function(_arg) {
    var height, keepDimension, newHeight, newWidth, ratio, width, _ref, _ref1, _ref2;
    width = _arg.width, height = _arg.height, keepDimension = _arg.keepDimension;
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
        _ref = this.getRatioBox({
          ratio: ratio,
          width: width,
          height: height,
          keepDimension: keepDimension
        }), width = _ref.width, height = _ref.height;
        _ref1 = this.centerAlign(this.maxWidth, this.maxHeight, ratio), width = _ref1.width, height = _ref1.height;
      }
    } else if (newWidth || newHeight) {
      ratio = this.enforceValidRatio(width / height);
      _ref2 = this.centerAlign(this.maxWidth, this.maxHeight, ratio), width = _ref2.width, height = _ref2.height;
    }
    return {
      width: width,
      height: height
    };
  };

  Crop.prototype.enforceMaxArea = function(_arg) {
    var height, keepDimension, ratio, width;
    width = _arg.width, height = _arg.height, keepDimension = _arg.keepDimension;
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

  Crop.prototype.getRatioBox = function(_arg) {
    var height, keepDimension, ratio, width;
    ratio = _arg.ratio, width = _arg.width, height = _arg.height, keepDimension = _arg.keepDimension;
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
    var min, number, _i, _len;
    min = array[0];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      number = array[_i];
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



},{"./events":2,"./preview":3}],2:[function(require,module,exports){
var Events;

module.exports = Events = (function() {
  function Events(_arg) {
    var horizontal, vertical;
    this.parent = _arg.parent, this.view = _arg.view, horizontal = _arg.horizontal, vertical = _arg.vertical;
    this.doubleClickThreshold = 300;
    this.pan();
    this.doubleClick();
    this.preventBrowserDragDrop();
    this.resizeView({
      horizontal: horizontal,
      vertical: vertical
    });
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
    return this.view.on('dragstart', function() {
      return false;
    });
  };

  Events.prototype.resizeView = function(_arg) {
    var $template, horizontal, positions, vertical;
    horizontal = _arg.horizontal, vertical = _arg.vertical;
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



},{}],3:[function(require,module,exports){
var Preview;

module.exports = Preview = (function() {
  function Preview(_arg) {
    this.onReady = _arg.onReady, this.img = _arg.img, this.outline = _arg.outline;
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

  Preview.prototype.setImage = function(_arg) {
    var url;
    url = _arg.url;
    return this.img.attr('src', url);
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

  Preview.prototype.updateImageDimensions = function(_arg) {
    var height, width;
    width = _arg.width, height = _arg.height;
    this.width = width;
    this.height = height;
    if (this.outline) {
      return this.outline.css({
        width: this.width + "px",
        height: this.height + "px"
      });
    }
  };

  Preview.prototype.pan = function(_at_x, _at_y) {
    var x, y;
    this.x = _at_x;
    this.y = _at_y;
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
var Crop;

Crop = require('./crop');

module.exports = window.srcissors = {
  "new": function(_arg) {
    var arena, crop, fixedHeight, fixedWidth, img, maxArea, maxRatio, minHeight, minRatio, minWidth, outline, preview, url, view, zoomStep;
    arena = _arg.arena, url = _arg.url, fixedWidth = _arg.fixedWidth, fixedHeight = _arg.fixedHeight, minWidth = _arg.minWidth, minHeight = _arg.minHeight, minRatio = _arg.minRatio, maxRatio = _arg.maxRatio, maxArea = _arg.maxArea, zoomStep = _arg.zoomStep, crop = _arg.crop;
    arena = $(arena);
    view = arena.find('.crop-view');
    preview = view.find('.crop-preview');
    img = $('<img>');
    preview.append(img);
    outline = view.find('.crop-outline');
    if (!outline.length) {
      outline = void 0;
    }
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
      zoomStep: zoomStep
    });
  }
};



},{"./crop":1}]},{},[4]);
