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
        tablet: 940,
        mobile: 768
      },
      heights: {
        desktop: 550,
        tablet: 400,
        mobile: 250
      }
    };
    function Gallery(id, config) {
      if (config == null) {
        config = {};
      }
      this.on_fullscreen_change = __bind(this.on_fullscreen_change, this);
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
      $(document).on("click", ".fmg-thumbs-wrapper img", __bind(function(e) {
        var index;
        index = $(".fmg-thumbs-wrapper img").index(e.currentTarget);
        this.slide_to(index + 1);
        return false;
      }, this));
      if (!this.has_fullscreen()) {
        $(".fmg-fullscreen").remove();
      }
      $(document).on("click", ".fmg-fullscreen", __bind(function() {
        this.toggle_fullscreen();
        return false;
      }, this));
      $(document).on("click", ".fmg-toggle-thumbs", __bind(function() {
        this.wrapper.find(".fmg-thumbs").toggleClass("is-hidden");
        return false;
      }, this));
      $(document).on("click", ".fmg-toggle-captions", __bind(function() {
        this.wrapper.find(".fmg-captions").toggleClass("is-hidden");
        return false;
      }, this));
      $(document).keydown(__bind(function(e) {
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
      if (pos > this.count || pos < 1) {
        return false;
      }
      this.current = pos;
      slide_offset = -1 * this.gallery_width() * (this.current - 1);
      if (SETTINGS.thumbs) {
        thumb_offset = this.calc_thumb_offset();
      }
      this.load_slide_image();
      this.set_current_elements();
      this.set_navigation_hidden();
      this.offset_slide_image();
      this.update_caption_height();
      this.update_slide_count();
      this.slide_wrappers().each(function(i, e) {
        return $(e).css("left", "" + slide_offset + "px");
      });
      if (SETTINGS.thumbs) {
        this.thumb_wrapper().css("left", "" + thumb_offset + "px");
      }
      return window.location.hash = "#slide-" + this.current;
    };
    Gallery.prototype.resize = function(fullscreen) {
      var width;
      if (fullscreen == null) {
        fullscreen = false;
      }
      width = this.gallery_width();
      this.wrapper.addClass("is-resizing");
      if (this.resizing_timeout) {
        clearTimeout(this.resizing_timeout);
      }
      this.resizing_timeout = setTimeout(__bind(function() {
        return this.wrapper.removeClass("is-resizing");
      }, this), 100);
      this.wrapper.removeClass("fmg-gallery-tablet fmg-gallery-mobile fmg-gallery-fullscreen");
      if (fullscreen) {
        this.wrapper.addClass("fmg-gallery-fullscreen");
        this.wrapper.find(".fmg-viewport").height(this.wrapper.height());
      } else {
        if (width < SETTINGS.breakpoints.tablet && width >= SETTINGS.breakpoints.mobile) {
          this.wrapper.addClass("fmg-gallery-tablet");
        }
        if (width < SETTINGS.breakpoints.mobile) {
          this.wrapper.addClass("fmg-gallery-mobile");
        }
        this.wrapper.find(".fmg-viewport, .fmg-menu-item").removeAttr("style");
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
    Gallery.prototype.toggle_fullscreen = function() {
      var _ref;
      if ((_ref = this.full_screen_enabled) == null) {
        this.full_screen_enabled = false;
      }
      this.bind_fullscreen_change;
      if (this.full_screen_enabled) {
        return this.exit_fullscreen();
      } else {
        return this.enter_fullscreen();
      }
    };
    Gallery.prototype.enter_fullscreen = function() {
      var el;
      el = this.wrapper[0];
      document.onwebkitfullscreenchange = this.on_fullscreen_change;
      document.onmozfullscreenchange = this.on_fullscreen_change;
      document.onfullscreenchange = this.on_fullscreen_change;
      if (el.webkitRequestFullscreen) {
        return el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
      if (el.mozRequestFullScreen) {
        return el.mozRequestFullScreen();
      }
      return el.requestFullscreen();
    };
    Gallery.prototype.exit_fullscreen = function() {
      document.cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;
      return document.cancelFullScreen();
    };
    Gallery.prototype.on_fullscreen_change = function() {
      this.full_screen_enabled = !this.full_screen_enabled;
      this.loading(true);
      return setTimeout(__bind(function() {
        this.loading(false);
        return this.resize(this.full_screen_enabled);
      }, this), 200);
    };
    Gallery.prototype.has_fullscreen = function() {
      var _ref;
      return (_ref = typeof document.fullscreenEnabled === "undefined") != null ? _ref : {
        "true": false
      };
    };
    Gallery.prototype.gallery_width = function() {
      return this.wrapper.width();
    };
    Gallery.prototype.calc_thumb_offset = function() {
      var current, end, offset, per_slide, start;
      per_slide = current = 1;
      while ((per_slide + 1) * SETTINGS.thumb_width <= this.gallery_width()) {
        per_slide++;
      }
      while (current <= Math.ceil(this.count / per_slide)) {
        start = ((current - 1) * per_slide) + 1;
        end = current * per_slide;
        if (this.current >= start && this.current <= end) {
          break;
        }
        current++;
      }
      offset = SETTINGS.thumb_width * ((current - 1) * per_slide) * -1;
      this.load_thumb_images(start, end);
      return offset;
    };
    Gallery.prototype.offset_slide_image = function() {
      var diff, h, h_diff, image, scale, scaled_diff, scaled_image_height, viewport_height, w;
      viewport_height = this.wrapper.find(".fmg-viewport").height();
      image = this.wrapper.find(".fmg-slide:eq(" + (this.current - 1) + ") img");
      h = image.data("height");
      w = image.data("width");
      scale = this.gallery_width() / w;
      scaled_image_height = Math.round(scale * h);
      if (this.full_screen_enabled) {
        image.css("height", h);
        image.css("width", w);
        h_diff = viewport_height - h;
        scaled_diff = viewport_height - scaled_image_height;
        if (h_diff > 0) {
          image.css("margin-top", h_diff / 2);
        }
        if (h_diff < 0) {
          image.css("height", viewport_height).css("width", "");
        }
        if (scaled_diff < 0 && scale < 1) {
          return image.css("height", scaled_image_height);
        }
      } else if (scaled_image_height < viewport_height) {
        diff = viewport_height - scaled_image_height;
        image.css("margin-top", diff / 2);
        image.css("height", scaled_image_height);
        return image.css("width", "");
      } else {
        image.css("margin-top", "");
        image.css("height", "");
        return image.css("width", "");
      }
    };
    Gallery.prototype.update_slide_count = function() {
      this.wrapper.find(".fmg-count-current").text(this.current);
      return this.wrapper.find(".fmg-count-total").text(this.count);
    };
    Gallery.prototype.update_caption_height = function() {
      var caption_offset, captions, height;
      height = this.wrapper.find(".fmg-caption:eq(" + (this.current - 1) + ")").height();
      captions = this.wrapper.find(".fmg-captions");
      captions.not(".is-hidden").height(height);
      if (this.full_screen_enabled) {
        caption_offset = captions.hasClass("is-hidden") ? 5 : height + 5;
        return this.wrapper.find(".fmg-menu-item").css("bottom", caption_offset);
      }
    };
    Gallery.prototype.load_slide_image = function() {
      var image, src;
      image = this.wrapper.find(".fmg-slide:eq(" + (this.current - 1) + ") img");
      src = this.gallery_width() < SETTINGS.breakpoints.mobile && image.data("src-mobile") ? "src-mobile" : "src";
      if (this.full_screen_enabled && image.data("src-fullscreen")) {
        src = "src-fullscreen";
      }
      if (image.data("src-loaded") === src) {
        return;
      }
      image.attr("src", image.data(src));
      return image.data("src-loaded", src);
    };
    Gallery.prototype.load_thumb_images = function(start, end) {
      return this.wrapper.find(".fmg-thumbs img").each(__bind(function(i, e) {
        var image;
        i++;
        image = $(e);
        if (i >= start && i <= (end + 1) && !image.data("loaded")) {
          image.attr("src", image.data("src"));
          return image.data("loaded", true);
        }
      }, this));
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
    Gallery.prototype.loading = function(state) {
      if (state) {
        return this.wrapper.addClass("is-loading");
      } else {
        return this.wrapper.removeClass("is-loading");
      }
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
