!function(i,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports?exports.srcissors=t(require("jquery")):i.srcissors=t(i.jQuery)}(window,function(i){return function(i){var t={};function e(s){if(t[s])return t[s].exports;var h=t[s]={i:s,l:!1,exports:{}};return i[s].call(h.exports,h,h.exports,e),h.l=!0,h.exports}return e.m=i,e.c=t,e.d=function(i,t,s){e.o(i,t)||Object.defineProperty(i,t,{enumerable:!0,get:s})},e.r=function(i){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(i,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(i,"__esModule",{value:!0})},e.t=function(i,t){if(1&t&&(i=e(i)),8&t)return i;if(4&t&&"object"==typeof i&&i&&i.__esModule)return i;var s=Object.create(null);if(e.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:i}),2&t&&"string"!=typeof i)for(var h in i)e.d(s,h,function(t){return i[t]}.bind(null,h));return s},e.n=function(i){var t=i&&i.__esModule?function(){return i.default}:function(){return i};return e.d(t,"a",t),t},e.o=function(i,t){return Object.prototype.hasOwnProperty.call(i,t)},e.p="",e(e.s=1)}([function(t,e){t.exports=i},function(i,t,e){var s=e(0),h=e(2);i.exports={new:function(i){var t=i.arena,e=i.url,n=i.fixedWidth,a=i.fixedHeight,o=i.minWidth,r=i.minHeight,u=i.minRatio,c=i.maxRatio,l=i.maxArea,g=i.zoomStep,d=i.crop,v=i.actions,m=i.minResolution,w=i.surroundingImageOpacity,p=i.showSurroundingImage,f=(t=s(t)).find(".crop-view"),y=f.find(".crop-preview"),x=s("<img>");y.append(x);var k=f.find(".crop-outline");k.length||(k=void 0);var R={pan:!0,zoomOnDoubleClick:!0,resize:!0,resizeHorizontal:!n,resizeVertical:!a};return s.extend(R,v),null==g&&(g=1.25),null==o&&(o=50),null==r&&(r=50),new h({url:e,crop:d,arena:t,view:f,img:x,outline:k,showSurroundingImage:p,surroundingImageOpacity:w,fixedWidth:n,fixedHeight:a,minViewWidth:o,minViewHeight:r,minViewRatio:u,maxViewRatio:c,maxArea:l,zoomStep:g,actions:R,minResolution:m})}}},function(i,t,e){function s(i,t){for(var e=0;e<t.length;e++){var s=t[e];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(i,s.key,s)}}var h=e(0),n=e(3),a=e(4);i.exports=function(){"use strict";function i(t){var e=t.arena,s=t.view,a=t.img,o=t.outline,r=t.url,u=t.fixedWidth,c=t.fixedHeight,l=t.minViewWidth,g=t.minViewHeight,d=t.minViewRatio,v=t.maxViewRatio,m=t.crop,w=t.zoomStep,p=t.maxArea,f=t.actions,y=t.minResolution,x=t.surroundingImageOpacity,k=t.showSurroundingImage;!function(i,t){if(!(i instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),this.onPreviewReady=this.onPreviewReady.bind(this),this.arena=e,this.view=s,this.img=a,this.outline=o,this.fixedWidth=u,this.fixedHeight=c,this.minViewWidth=l,this.minViewHeight=g,this.minViewRatio=d,this.maxViewRatio=v,this.actions=f,this.minResolution=y,this.surroundingImageOpacity=x,this.loadingCssClass="crop-view--is-loading",this.panningCssClass="crop-view--is-panning",this.outlineCssClass="crop-outline--active",this.isPanning=!1,this.initialCrop=m,this.loadEvent=h.Callbacks(),this.changeEvent=h.Callbacks(),this.initializeReadyState(),this.zoomInStep=w,this.zoomOutStep=1/this.zoomInStep,this.arenaWidth=this.arena.width(),this.arenaHeight=this.arena.height(),p&&(this.maxArea=this.arenaWidth*this.arenaHeight*p),this.outline&&this.setSurroundingImageVisibility(k),this.preview=new n({onReady:this.onPreviewReady,img:this.img,outline:this.outline,opacity:this.surroundingImageOpacity}),this.setImage(r)}return function(i,t,e){t&&s(i.prototype,t),e&&s(i,e)}(i,[{key:"initializeReadyState",value:function(){this.isReady=!1,null!=this.readyEvent&&this.readyEvent.empty(),this.readyEvent=h.Callbacks("memory once")}},{key:"setImage",value:function(i){i!==this.preview.url&&(this.isInitialized&&this.preview.reset(),this.initializeReadyState(),this.view.addClass(this.loadingCssClass),this.preview.setImage({url:i}))}},{key:"setSurroundingImageVisibility",value:function(i){this.surroundingImageOpacity=parseFloat(this.surroundingImageOpacity||.2),"always"===i?this.outline.css("opacity",1):"panning"===i?this.outline.css("opacity",null):(this.outline.css("opacity",0),this.surroundingImageOpacity=0)}},{key:"reset",value:function(){this.isReady&&(this.resize({width:this.imageWidth,height:this.imageHeight}),this.zoomAllOut())}},{key:"onPreviewReady",value:function(i){var t,e=i.width,s=i.height;this.isInitialized||(this.events=new a({parent:this,view:this.view,actions:this.actions})),this.imageWidth=e,this.imageHeight=s,this.imageRatio=this.imageWidth/this.imageHeight;var h=this.imageWidth*this.imageHeight;if(this.minResolution&&this.minResolution>h&&delete this.minResolution,this.minResolution){var n=this.minResolution/(this.imageHeight*this.imageHeight);(!this.minViewRatio||this.minViewRatio<n)&&(this.minViewRatio=n);var o=this.imageWidth*this.imageWidth/this.minResolution;(!this.maxViewRatio||this.maxViewRatio>o)&&(this.maxViewRatio=o)}this.calcMaxMinDimensions(),this.fixedWidth&&(t="width"),this.fixedHeight&&(t="height"),this.setViewDimensions({width:this.imageWidth,height:this.imageHeight,keepDimension:t}),this.isReady=!0,this.view.removeClass(this.loadingCssClass),this.isInitialized||null==this.initialCrop?(this.zoomAllOut(),this.center()):this.setCrop(this.initialCrop),this.isInitialized=!0,this.readyEvent.fire(),this.loadEvent.fire()}},{key:"setCrop",value:function(i){var t=this,e=i.x,s=i.y,h=i.width,n=i.height;if(this.isReady){this.resize({width:h,height:n});var a=this.viewWidth/h,o=this.imageWidth*a;this.zoom({width:o}),this.pan({x:e*a,y:s*a})}else this.on("ready",function(){return t.setCrop({x:e,y:s,width:h,height:n})})}},{key:"getCrop",value:function(){var i=this.preview.width/this.imageWidth,t={x:this.preview.x/i,y:this.preview.y/i,width:this.viewWidth/i,height:this.viewHeight/i};return this.roundCrop(t),this.validateCrop(t),t}},{key:"roundCrop",value:function(i){for(var t in i){var e=i[t];i[t]=Math.round(e)}}},{key:"validateCrop",value:function(i){var t=i.x,e=i.y,s=i.width,h=i.height;return t+s>this.imageWidth?i.width=this.imageWidth-t:e+h>this.imageHeight&&(i.height=this.imageHeight-e),i}},{key:"setRatio",value:function(i,t){var e,s,h=this;if(this.isReady)return i=this.enforceValidRatio(i),"height"===t?s=(e=this.viewHeight)*i:e=(s=this.viewWidth)/i,this.resizeFocusPoint=this.getFocusPoint(),this.resize({width:s,height:e});this.on("ready",function(){return h.setRatio(i,t)})}},{key:"onPan",value:function(i){this.isPanning||(this.isPanning=!0,this.arena.addClass(this.panningCssClass),this.outline.addClass(this.outlineCssClass));var t=i.startX-i.dx,e=i.startY-i.dy;this.pan({x:t,y:e})}},{key:"onPanEnd",value:function(){return this.isPanning=!1,this.arena.removeClass(this.panningCssClass),this.outline.removeClass(this.outlineCssClass)}},{key:"onDoubleClick",value:function(i){var t=i.pageX,e=i.pageY,s=this.view[0].getBoundingClientRect(),h=t-s.left,n=e-s.top;this.zoomIn({viewX:h,viewY:n})}},{key:"onResize",value:function(i){var t=i.position,e=i.dx,s=i.dy;this.isResizing||(this.isResizing=!0,this.resizeFocusPoint=this.getFocusPoint()),["top","bottom"].includes(t)?(s*=2,this.resize({width:this.viewWidth,height:this.viewHeight+s,keepDimension:"height"})):["left","right"].includes(t)&&(e*=2,this.resize({width:this.viewWidth+e,height:this.viewHeight,keepDimension:"width"}))}},{key:"onResizeEnd",value:function(){this.isResizing=!1,this.resizeFocusPoint=void 0}},{key:"resize",value:function(i){var t=i.width,e=i.height,s=i.keepDimension;this.setViewDimensions({width:t,height:e,keepDimension:s}),this.resizeFocusPoint&&(this.resizeFocusPoint.viewX=this.viewWidth/2,this.resizeFocusPoint.viewY=this.viewHeight/2),this.zoom({width:this.preview.width,height:this.preview.height,focusPoint:this.resizeFocusPoint})}},{key:"setViewDimensions",value:function(i){var t=i.width,e=i.height,s=i.keepDimension;if(this.maxArea){var h=this.enforceMaxArea({width:t,height:e,keepDimension:s});t=h.width,e=h.height}var n=this.enforceViewDimensions({width:t,height:e,keepDimension:s});if(t=n.width,e=n.height,this.view.css({width:t,height:e}),this.viewWidth=t,this.viewHeight=e,this.viewRatio=t/e,this.minResolution){var a=Math.sqrt(this.minResolution*this.viewRatio),o=Math.sqrt(this.minResolution/this.viewRatio);this.maxImageWidth=this.viewWidth/a*this.imageWidth,this.maxImageHeight=this.viewHeight/o*this.imageHeight}this.fireChange()}},{key:"zoomAllOut",value:function(){this.isWidthRestricting()?this.zoom({width:this.viewWidth}):this.zoom({height:this.viewHeight})}},{key:"zoomIn",value:function(i){null==i&&(i={}),this.isWidthRestricting()?i.width=this.preview.width*this.zoomInStep:i.height=this.preview.height*this.zoomInStep,this.zoom(i)}},{key:"zoomOut",value:function(i){null==i&&(i={}),this.isWidthRestricting()?i.width=this.preview.width*this.zoomOutStep:i.height=this.preview.height*this.zoomOutStep,this.zoom(i)}},{key:"zoom",value:function(i){var t=i.width,e=i.height,s=i.viewX,h=i.viewY,n=i.focusPoint;null==n&&(n=this.getFocusPoint({viewX:s,viewY:h}));var a=this.enforceZoom({width:t,height:e});t=a.width,e=a.height,null!=t?(this.preview.setWidth(t),this.fireChange()):null!=e&&(this.preview.setHeight(e),this.fireChange()),this.focus(n)}},{key:"getFocusPoint",value:function(i){null==i&&(i={});var t=i,e=t.viewX,s=t.viewY;null==e&&(e=this.viewWidth/2),null==s&&(s=this.viewHeight/2);var h=this.preview.x+e,n=this.preview.y+s;return{percentX:h/this.preview.width,percentY:n/this.preview.height,viewX:e,viewY:s}}},{key:"focus",value:function(i){var t=i.percentX,e=i.percentY,s=i.viewX,h=i.viewY,n=this.preview.width*t,a=this.preview.height*e;n-=s,a-=h,this.pan({x:n,y:a})}},{key:"center",value:function(){var i=(this.preview.width-this.viewWidth)/2,t=(this.preview.height-this.viewHeight)/2;this.pan({x:i,y:t})}},{key:"pan",value:function(i){i=this.enforceXy(i),this.preview.pan(i.x,i.y),this.fireChange()}},{key:"enforceXy",value:function(i){var t=i.x,e=i.y;return t<0?t=0:t>this.preview.width-this.viewWidth&&(t=this.preview.width-this.viewWidth),e<0?e=0:e>this.preview.height-this.viewHeight&&(e=this.preview.height-this.viewHeight),{x:t,y:e}}},{key:"enforceZoom",value:function(i){var t=i.width,e=i.height;return null!=t&&this.maxImageWidth&&t>this.maxImageWidth?{width:this.maxImageWidth}:null!=t&&t<this.viewWidth?{width:this.viewWidth}:null!=e&&this.maxImageHeight&&e>this.maxImageHeight?{height:this.maxImageHeight}:null!=e&&e<this.viewHeight?{height:this.viewHeight}:{width:t,height:e}}},{key:"calcMaxMinDimensions",value:function(){this.maxWidth=this.min([this.arenaWidth,this.imageWidth]),this.maxHeight=this.min([this.arenaHeight,this.imageHeight]),this.minWidth=this.minViewWidth||0,this.minHeight=this.minViewHeight||0,this.fixedWidth&&(this.maxWidth=this.minWidth=this.fixedWidth),this.fixedHeight&&(this.maxHeight=this.minHeight=this.fixedHeight)}},{key:"areDimensionsValid",value:function(i){var t=i.width,e=i.height,s=(i.keepDimension,t/e);return!(t<this.minWidth||t>this.maxWidth||e<this.minHeight||e>this.maxHeight||s<this.minViewRatio||s>this.maxViewRatio)}},{key:"isValidRatio",value:function(i){return!(i<this.minViewRatio||i>this.maxViewRatio)}},{key:"enforceValidRatio",value:function(i){return i<this.minViewRatio?this.minViewRatio:i>this.maxViewRatio?this.maxViewRatio:i}},{key:"enforceViewDimensions",value:function(i){var t,e,s,h=i.width,n=i.height,a=i.keepDimension;if(h<this.minWidth&&(e=this.minWidth),h>this.maxWidth&&(e=this.maxWidth),n<this.minHeight&&(t=this.minHeight),n>this.maxHeight&&(t=this.maxHeight),a){if(e&&(h=e),t&&(n=t),s=h/n,!this.isValidRatio(s)){s=this.enforceValidRatio(s);var o=this.getRatioBox({ratio:s,width:h,height:n,keepDimension:a});if(h=o.width,n=o.height,h>this.arenaWidth||n>this.arenaHeight){var r=this.centerAlign(this.maxWidth,this.maxHeight,s);h=r.width,n=r.height}}}else if(e||t){s=this.enforceValidRatio(h/n);var u=this.centerAlign(this.maxWidth,this.maxHeight,s);h=u.width,n=u.height}return{width:h,height:n}}},{key:"enforceMaxArea",value:function(i){var t=i.width,e=i.height,s=i.keepDimension,h=t/e;return"width"===s?h=t/(e=this.maxArea/t):"height"===s?h=(t=this.maxArea/e)/e:e=(t=Math.sqrt(this.maxArea*h))/h,this.isValidRatio(h)||(h=this.enforceValidRatio(h),e=(t=Math.sqrt(this.maxArea*h))/h),{width:t,height:e}}},{key:"isWidthRestricting",value:function(){return this.viewRatio>=this.imageRatio}},{key:"getRatioBox",value:function(i){var t=i.ratio,e=i.width,s=i.height,h=i.keepDimension;return"width"===h||null==s?s=e/t:"height"===h||null==e?e=s*t:s=e/t,{width:e,height:s}}},{key:"centerAlign",value:function(i,t,e){var s,h,n,a;return i/t>e?n=(i-(h=t*e))/2:a=(t-(s=i/e))/2,{x:n||0,y:a||0,width:h||i,height:s||t}}},{key:"min",value:function(i){var t=i[0],e=!0,s=!1,h=void 0;try{for(var n,a=i[Symbol.iterator]();!(e=(n=a.next()).done);e=!0){var o=n.value;o<t&&(t=o)}}catch(i){s=!0,h=i}finally{try{e||null==a.return||a.return()}finally{if(s)throw h}}return t}},{key:"on",value:function(i,t){return this["".concat(i,"Event")].add(t)}},{key:"off",value:function(i,t){return this["".concat(i,"Event")].remove(t)}},{key:"fireChange",value:function(){var i=this;null==this.changeDispatch&&(this.changeDispatch=setTimeout(function(){i.changeDispatch=void 0,i.changeEvent.fire(i.getCrop())},0))}},{key:"debug",value:function(){var i=function(i){return Math.round(10*i)/10},t={arena:"".concat(i(this.arenaWidth),"x").concat(i(this.arenaHeight)),view:"".concat(i(this.viewWidth),"x").concat(i(this.viewHeight)),image:"".concat(i(this.imageWidth),"x").concat(i(this.imageHeight)),preview:"".concat(i(this.preview.width),"x").concat(i(this.preview.height)),previewXy:"".concat(i(this.preview.x),"x").concat(i(this.preview.y))};return console.log(t),t}}]),i}()},function(i,t,e){function s(i,t){for(var e=0;e<t.length;e++){var s=t[e];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(i,s.key,s)}}var h=e(0);i.exports=function(){"use strict";function i(t){var e=this,s=t.onReady,h=t.img,n=t.opacity,a=t.outline;!function(i,t){if(!(i instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),this.onReady=s,this.img=h,this.opacity=n,this.outline=a,this.x=this.y=0,this.width=this.height=0,this.img.on("load",function(){var i=e.img.width(),t=e.img.height();e.ratio=i/t,e.updateImageDimensions({width:i,height:t}),e.onReady({width:e.width,height:e.height}),e.img.show()})}return function(i,t,e){t&&s(i.prototype,t),e&&s(i,e)}(i,[{key:"setImage",value:function(i){var t=i.url;this.url=t,this.img.attr("src",this.url),this.outline&&this.setBackgroundImage({url:this.url})}},{key:"setBackgroundImage",value:function(i){var t=i.url;if(this.opacity>0){var e=h("<img>").css({opacity:this.opacity}).attr("src",t);this.outline.append(e)}}},{key:"reset",value:function(){this.url=void 0,this.x=this.y=0,this.width=this.height=0,this.img.attr("src",""),this.img.css({width:"",height:"",transform:""}),this.outline&&this.outline.css({transform:""}).html("")}},{key:"setWidth",value:function(i){this.img.css({width:"".concat(i,"px"),height:"auto"});var t=i/this.ratio;this.updateImageDimensions({width:i,height:t})}},{key:"setHeight",value:function(i){this.img.css({width:"auto",height:"".concat(i,"px")});var t=i*this.ratio;this.updateImageDimensions({width:t,height:i})}},{key:"updateImageDimensions",value:function(i){var t=i.width,e=i.height;this.width=t,this.height=e,this.outline&&this.outline.css({width:"".concat(this.width,"px"),height:"".concat(this.height,"px")})}},{key:"pan",value:function(i,t){this.x=i,this.y=t;var e=Math.round(this.x),s=Math.round(this.y);this.img.css({transform:"translate(-".concat(e,"px, -").concat(s,"px)")}),this.outline&&this.outline.css({transform:"translate(-".concat(e,"px, -").concat(s,"px)")})}}]),i}()},function(i,t,e){function s(i,t){for(var e=0;e<t.length;e++){var s=t[e];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(i,s.key,s)}}var h=e(0);i.exports=function(){"use strict";function i(t){var e=t.parent,s=t.view,h=(t.horizontal,t.vertical,t.actions);!function(i,t){if(!(i instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),this.parent=e,this.view=s,this.doubleClickThreshold=300,h.pan&&this.pan(),h.zoomOnDoubleClick&&this.doubleClick(),h.resize&&this.resizeView({horizontal:h.resizeHorizontal,vertical:h.resizeVertical}),this.preventBrowserDragDrop(),this.responsiveArena()}return function(i,t,e){t&&s(i.prototype,t),e&&s(i,e)}(i,[{key:"pan",value:function(){var i=this,t=h(document);this.view.on("mousedown.srcissors",function(e){var s={startX:i.parent.preview.x,startY:i.parent.preview.y};e.preventDefault(),t.on("mousemove.srcissors-pan",function(t){s.dx=t.pageX-e.pageX,s.dy=t.pageY-e.pageY,i.parent.onPan(s)}).on("mouseup.srcissors-pan",function(){t.off("mouseup.srcissors-pan"),t.off("mousemove.srcissors-pan"),null!=s.dx&&i.parent.onPanEnd()})})}},{key:"doubleClick",value:function(){var i,t=this;this.view.on("mousedown.srcissors",function(e){var s=(new Date).getTime();i&&i>s-t.doubleClickThreshold&&t.parent.onDoubleClick({pageX:e.pageX,pageY:e.pageY}),i=s})}},{key:"preventBrowserDragDrop",value:function(){this.view.on("dragstart.srcissors",function(){return!1})}},{key:"resizeView",value:function(i){var t=this,e=i.horizontal,s=i.vertical,n=h("<div>");n.addClass("resize-handler");var a=[];e&&(a=a.concat(["right","left"])),s&&(a=a.concat(["top","bottom"])),a.forEach(function(i){var e=n.clone();e.addClass("resize-handler-".concat(i)),e.on("mousedown.srcissors",t.getResizeMouseDown(i)),t.view.append(e)})}},{key:"getResizeMouseDown",value:function(i){var t=this,e=h(document);return function(s){var h=s.pageX,n=s.pageY;s.stopPropagation(),e.on("mousemove.srcissors-resize",function(e){var s,a;switch(i){case"top":case"bottom":a=e.pageY-n,"top"===i&&(a=-a),n=e.pageY;break;case"left":case"right":s=e.pageX-h,"left"===i&&(s=-s),h=e.pageX}t.parent.onResize({position:i,dx:s,dy:a})}).on("mouseup.srcissors-resize",function(){e.off("mouseup.srcissors-resize"),e.off("mousemove.srcissors-resize"),t.parent.onResizeEnd({position:i})})}}},{key:"responsiveArena",value:function(){}}]),i}()}])});
//# sourceMappingURL=srcissors.js.map