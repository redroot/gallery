class Gallery
  SETTINGS = 
    thumbs:       true
    thumb_width:  150
    captions:     true
    meta:         true
    breakpoints:  
      tablet: 940
      mobile: 768
    heights:
      desktop: 550
      tablet: 400
      mobile: 250

  constructor: (id, config={}) ->
    @wrapper     = $(id)
    @current     = @resolve_current()
    @count       = @wrapper.find(".fmg-slide").length
    @loading(true)
    @init_bindings()
    @resize()
    @loading(false)
    
  slide_wrappers: -> @wrapper.find(".fmg-slides-wrapper, .fmg-captions-wrapper")
  thumb_wrapper: -> @wrapper.find(".fmg-thumbs-wrapper").first()
  
  init_bindings: -> 
    # bind clicks events
    $(document).on "click", ".fmg-viewport-nav-left", => 
      @slide_to(@current - 1)
      false
    $(document).on "click", ".fmg-viewport-nav-right", => 
      @slide_to(@current + 1)
      false
    
    # bind thumb click
    $(document).on "click", ".fmg-thumbs-wrapper img", (e) =>
      index = $(".fmg-thumbs-wrapper img").index(e.currentTarget);
      @slide_to(index + 1);
      false
      
    # bind full screen events
    $(".fmg-fullscreen").remove() unless @has_fullscreen();
    $(document).on "click", ".fmg-fullscreen", =>
      @toggle_fullscreen()
      false
      
    # bind thumbs toggle
    $(document).on "click", ".fmg-toggle-thumbs", =>
      @wrapper.find(".fmg-thumbs").toggleClass("is-hidden")
      false
    
    # bind swipe event (hammer.js)

    # bind keypress event
    $(document).keydown (e) =>
      if e.keyCode == 37 then @slide_to(@current - 1)
      if e.keyCode == 39 then @slide_to(@current + 1)
      
    # bind resize event
    window.onresize = => @resize()
    
  slide_to: (pos) ->
    if pos > @count or pos < 1 then return false
    @current = pos
    slide_offset = -1 * @gallery_width() * (@current - 1)
    thumb_offset = @calc_thumb_offset() if SETTINGS.thumbs
    @load_slide_image()
    @set_current_elements()
    @set_navigation_hidden()
    @offset_slide_image()
    @slide_wrappers().each (i,e) -> $(e).css("left","#{slide_offset}px")
    @thumb_wrapper().css("left","#{thumb_offset}px") if SETTINGS.thumbs
    window.location.hash = "#slide-#{@current}"
  
  resize: (fullscreen=false)->
    width = @gallery_width()
    
    @wrapper.addClass("is-resizing")
    clearTimeout(@resizing_timeout) if @resizing_timeout
    @resizing_timeout = setTimeout(=> 
      @wrapper.removeClass("is-resizing")
    , 100)
    
    @wrapper.removeClass("fmg-gallery-tablet fmg-gallery-mobile fmg-gallery-fullscreen")
    @wrapper.addClass("fmg-gallery-fullscreen") if fullscreen
    @wrapper.addClass("fmg-gallery-tablet") if width < SETTINGS.breakpoints.tablet and width >= SETTINGS.breakpoints.mobile
    @wrapper.addClass("fmg-gallery-mobile") if width < SETTINGS.breakpoints.mobile
 
    @wrapper.find(".fmg-slide, .fmg-caption").each -> $(this).width(width)  
    @slide_wrappers().each (i,e) => $(e).width(width * @count)      
    @thumb_wrapper().width(Math.ceil(SETTINGS.thumb_width * @count)) if SETTINGS.thumbs
    @slide_to(@current)
      

  toggle_fullscreen: ->
    @full_screen_enabled ?= false
    @bind_fullscreen_change
    if @full_screen_enabled
      @exit_fullscreen()
    else
      @enter_fullscreen()
      
  enter_fullscreen: ->
    el = @wrapper[0]
    el.onwebkitfullscreenchange = @on_fullscreen_change
    el.onmozfullscreenchange = @on_fullscreen_change
    el.onfullscreenchange = @on_onfullscreen_change
    return el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) if el.webkitRequestFullscreen
    return el.mozRequestFullScreen() if el.mozRequestFullScreen
    el.requestFullscreen()
    
  exit_fullscreen: ->
    document.cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen
    document.cancelFullScreen();
      
  on_fullscreen_change: =>
    @full_screen_enabled = !@full_screen_enabled
    console.log("fullscreen changing to #{@full_screen_enabled}")
    @loading(true)
    setTimeout =>
      @loading(false)
      @resize(@full_screen_enabled)
    , 200
    
      
  has_fullscreen: ->
    return typeof document.fullscreenEnabled == "undefined" ? true : false

  gallery_width: ->
    @wrapper.width()  
    
  calc_thumb_offset: -> 
    per_slide = current = 1
    per_slide++ while (per_slide + 1) * SETTINGS.thumb_width <= @gallery_width()
    while current <= Math.ceil(@count / per_slide)
      start = ((current - 1) * per_slide) + 1 
      end = current * per_slide
      if @current >= start and @current <= end then break
      current++
    offset = SETTINGS.thumb_width * ((current - 1) * per_slide) * -1
    @load_thumb_images(start,end)
    offset
    
  offset_slide_image: ->
    viewport_height = @wrapper.find(".fmg-viewport").height()
    image = @wrapper.find(".fmg-slide:eq(#{@current-1}) img")
    h = image.data("height")
    w = image.data("width")
    scale = @gallery_width() / w
    scaled_image_height = Math.round(scale * h)
    if scaled_image_height < viewport_height
      diff = viewport_height - scaled_image_height
      image.css("margin-top",diff/2)
      image.css("height", scaled_image_height) 
  
  load_slide_image: ->
    image = @wrapper.find(".fmg-slide:eq(#{@current-1}) img")
    src = if @gallery_width() < SETTINGS.breakpoints.mobile then "src-mobile" else "src"
    if image.data("loaded-#{src}") then return
    image.attr("src",image.data(src))
    image.data("loaded-#{src}",true)
  
  load_thumb_images: (start,end) ->
    @wrapper.find(".fmg-thumbs img").each (i,e) =>
      i++ # match up to start/end indexing
      image = $(e)
      if i >= start and i <= (end + 1) and !image.data("loaded")
        image.attr("src",image.data("src"))
        image.data("loaded", true)
    
  set_current_elements: ->
    c = @current - 1 
    @wrapper.find(".fmg-slide,.fmg-caption,.fmg-thumbs img").removeClass("is-current")
    @wrapper.find(".fmg-slide:eq(#{c}),.fmg-caption:eq(#{c}),.fmg-thumbs img:eq(#{c})").addClass("is-current")
    
  set_navigation_hidden: ->
    @wrapper.find(".fmg-viewport-nav").removeClass("is-hidden")
    if @current == 1 then @wrapper.find(".fmg-viewport-nav-left").addClass("is-hidden") 
    if @current == @count then @wrapper.find(".fmg-viewport-nav-right").addClass("is-hidden") 
    
  resolve_current: ->
    if(window.location.hash == "" || window.location.hash.indexOf("#slide-") == -1) then return 1
    parseInt(window.location.hash.split("#slide-",2)[1]) || 1;
  
  loading: (state) ->
    if state  then @wrapper.addClass("is-loading")
    if !state then @wrapper.removeClass("is-loading")
  
  add_listener: (event,fn) ->
    @events or= []
    @events[event] = [] unless @events[event]
    @events[event].push(fn)
  
  trigger: (event,args) ->
    (cb(args) for cb in @events[event]) if @events[event]
  
new Gallery("#gallery_one")

# TODO ----------------
# full screen
# bind to touch start on mobile
# add swipe gesture
# make thumbs optional
# make captions optional
# ability to hide captions
# ability to hide thumbs
# Audio slot in caption
# photo meta
# bug onresize to large
# pre-post slide

# DONE ---- 
# resize images based on width - DONE
# only load images are they appear - DONE
# different images for desktop and mobile - DONE
# get basic styles in and content in - DONE 
# basic slide transition for one width - DONE
# distance to slide based on width of article - DONE
# basic slider transition for all widths - DONE
# all things slide at once - DONE
# DONE - resize listener