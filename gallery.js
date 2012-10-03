(function() {
  var Gallery;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Gallery = (function() {
    var SETTINGS;
    SETTINGS = {
      transition: "slide",
      breakpoints: {
        tablet: 960,
        mobile: 768
      }
    };
    function Gallery(id, config) {
      if (config == null) {
        config = {};
      }
      this.wrapper = $(id);
      this.current = this.resolve_current();
      this.count = this.wrapper.find(".fmg-slide").length;
      this.init_bindings();
      this.resize();
    }
    Gallery.prototype.init_bindings = function() {
      return window.onresize = __bind(function() {
        return this.resize();
      }, this);
    };
    Gallery.prototype.slide_to = function(pos) {
      return console.log("sliding to " + pos);
    };
    Gallery.prototype.resize = function() {
      var width;
      width = this.gallery_width();
      if (width < SETTINGS.breakpoints.mobile) {
        console.log("to mobile");
        this.wrapper.removeClass("fmg-gallery-tablet").addClass("fmg-gallery-mobile");
      } else if (width < SETTINGS.breakpoints.tablet) {
        this.wrapper.removeClass("fmg-gallery-mobile").addClass("fmg-gallery-tablet");
      } else {
        this.wrapper.removeClass("fmg-gallery-tablet fmg-gallery-mobile");
      }
      this.wrapper.find(".fmg-slide, .fmg-caption").each(function() {
        return $(this).width(width);
      });
      this.wrapper.find(".fmg-slides-wrapper, .fmg-captions-wrapper").each(__bind(function(i, e) {
        return $(e).width(width * this.count);
      }, this));
      this.wrapper.find(".fmg-thumbs-wrapper").width(Math.ceil(150 * this.count));
      return this.slide_to(this.current);
    };
    Gallery.prototype.gallery_width = function() {
      return this.wrapper.width();
    };
    Gallery.prototype.resolve_current = function() {
      return 0;
    };
    Gallery.prototype.add_listener = function(event, fn) {
      this.events || (this.events = []);
      if (!this.events[event]) {
        this.events[event] = [];
      }
      return this.events[event].push(fn);
    };
    Gallery.prototype.trigger = function(event, args) {
      var cb, _i, _len, _ref, _results;
      if (this.events[event]) {
        _ref = this.events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cb = _ref[_i];
          _results.push(cb(args));
        }
        return _results;
      }
    };
    return Gallery;
  })();
  new Gallery("#gallery_one");
}).call(this);
