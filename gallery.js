(function() {
  var Gallery;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Gallery = (function() {
    var SETTINGS;
    SETTINGS = {
      thumbs: true,
      thumb_width: 150,
      captions: true,
      meta: true,
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
      this.loading(true);
      this.init_bindings();
      this.resize();
      this.loading(false);
    }
    Gallery.prototype.slide_wrappers = function() {
      return this.wrapper.find(".fmg-slides-wrapper, .fmg-captions-wrapper");
    };
    Gallery.prototype.thumb_wrapper = function() {
      return this.wrapper.find(".fmg-thumbs-wrapper").first();
    };
    Gallery.prototype.init_bindings = function() {
      $(document).on("click", ".fmg-viewport-nav-left", __bind(function() {
        this.slide_to(this.current - 1);
        return false;
      }, this));
      $(document).on("click", ".fmg-viewport-nav-right", __bind(function() {
        this.slide_to(this.current + 1);
        return false;
      }, this));
      $(document).keydown(__bind(function(e) {
        console.log(e);
        if (e.keyCode === 37) {
          this.slide_to(this.current - 1);
        }
        if (e.keyCode === 39) {
          return this.slide_to(this.current + 1);
        }
      }, this));
      return window.onresize = __bind(function() {
        return this.resize();
      }, this);
    };
    Gallery.prototype.slide_to = function(pos) {
      var slide_offset, thumb_offset;
      console.log("sliding to " + pos + " of " + this.count);
      if (pos > this.count || pos < 1) {
        return false;
      }
      slide_offset = -1 * this.gallery_width() * (pos - 1);
      thumb_offset = -1 * this.calc_thumb_offset(pos);
      this.slide_wrappers().each(function(i, e) {
        return $(e).css("left", "" + slide_offset + "px");
      });
      if (SETTINGS.thumbs) {
        this.thumb_wrapper().css("left", "" + thumb_offset + "px");
      }
      this.current = pos;
      this.set_current_elements();
      this.set_navigation_hidden();
      window.location.hash = pos === 1 ? "" : "#slide-" + pos;
      return console.log(slide_offset + " " + thumb_offset);
    };
    Gallery.prototype.resize = function() {
      var width;
      width = this.gallery_width();
      this.wrapper.addClass("is-resizing");
      if (this.resizing_timeout) {
        clearTimeout(this.resizing_timeout);
      }
      this.resizing_timeout = setTimeout(__bind(function() {
        return this.wrapper.removeClass("is-resizing");
      }, this), 100);
      if (width < SETTINGS.breakpoints.mobile) {
        this.wrapper.removeClass("fmg-gallery-tablet").addClass("fmg-gallery-mobile");
      } else if (width < SETTINGS.breakpoints.tablet) {
        this.wrapper.removeClass("fmg-gallery-mobile").addClass("fmg-gallery-tablet");
      } else {
        this.wrapper.removeClass("fmg-gallery-tablet fmg-gallery-mobile");
      }
      this.wrapper.find(".fmg-slide, .fmg-caption").each(function() {
        return $(this).width(width);
      });
      this.slide_wrappers().each(__bind(function(i, e) {
        return $(e).width(width * this.count);
      }, this));
      if (SETTINGS.thumbs) {
        this.thumb_wrapper().width(Math.ceil(SETTINGS.thumb_width * this.count));
      }
      return this.slide_to(this.current);
    };
    Gallery.prototype.loading = function(state) {
      if (state) {
        this.wrapper.addClass("is-loading");
      }
      if (!state) {
        return this.wrapper.removeClass("is-loading");
      }
    };
    Gallery.prototype.gallery_width = function() {
      return this.wrapper.width();
    };
    Gallery.prototype.calc_thumb_offset = function(pos) {
      var counter, end, max_slides, start;
      max_slides = Math.ceil((SETTINGS.thumb_width * this.count) / this.gallery_width());
      counter = 1;
      while (counter <= max_slides) {
        start = (this.count / max_slides) * (counter - 1);
        end = (this.count / max_slides) * counter;
        if (pos > start && pos <= end) {
          break;
        }
        counter++;
      }
      return this.gallery_width() * (counter - 1);
    };
    Gallery.prototype.set_current_elements = function() {
      var c;
      c = this.current - 1;
      this.wrapper.find(".fmg-slide,.fmg-caption,.fmg-thumbs img").removeClass("is-current");
      return this.wrapper.find(".fmg-slide:eq(" + c + "),.fmg-caption:eq(" + c + "),.fmg-thumbs img:eq(" + c + ")").addClass("is-current");
    };
    Gallery.prototype.set_navigation_hidden = function() {
      this.wrapper.find(".fmg-viewport-nav").removeClass("is-hidden");
      if (this.current === 1) {
        this.wrapper.find(".fmg-viewport-nav-left").addClass("is-hidden");
      }
      if (this.current === this.count) {
        return this.wrapper.find(".fmg-viewport-nav-right").addClass("is-hidden");
      }
    };
    Gallery.prototype.resolve_current = function() {
      if (window.location.hash === "" || window.location.hash.indexOf("#slide-") === -1) {
        return 1;
      }
      return parseInt(window.location.hash.split("#slide-", 2)[1]) || 1;
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
