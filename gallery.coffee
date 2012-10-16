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
    # bind swipe event (hammer.js)

    # bind keypress event
    $(document).keydown (e) =>
      if e.keyCode == 37 then @slide_to(@current - 1)
      if e.keyCode == 39 then @slide_to(@current + 1)
    # bind resize event
    window.onresize = => @resize()
    
  slide_to: (pos) ->
    console.log("sliding to #{pos} of #{@count}")
    if pos > @count or pos < 1 then return false
    @current = pos
    slide_offset = -1 * @gallery_width() * (@current - 1)
    thumb_offset = @calc_thumb_offset()
    @load_slide_image()
    @set_current_elements()
    @set_navigation_hidden()
    @offset_slide_image()
    @slide_wrappers().each (i,e) -> $(e).css("left","#{slide_offset}px")
    @thumb_wrapper().css("left","#{thumb_offset}px") if SETTINGS.thumbs
    window.location.hash = "#slide-#{@current}"
  
  resize: ->
    width = @gallery_width()
    
    @wrapper.addClass("is-resizing")
    clearTimeout(@resizing_timeout) if @resizing_timeout
    @resizing_timeout = setTimeout(=> 
      @wrapper.removeClass("is-resizing")
    , 100)
       
    if width < SETTINGS.breakpoints.mobile
      @wrapper.removeClass("fmg-gallery-tablet").addClass("fmg-gallery-mobile")
    else if width < SETTINGS.breakpoints.tablet 
      @wrapper.removeClass("fmg-gallery-mobile").addClass("fmg-gallery-tablet")
    else
      @wrapper.removeClass("fmg-gallery-tablet fmg-gallery-mobile")
    
    @wrapper.find(".fmg-slide, .fmg-caption").each -> $(this).width(width)  
    @slide_wrappers().each (i,e) => $(e).width(width * @count)      
    @thumb_wrapper().width(Math.ceil(SETTINGS.thumb_width * @count)) if SETTINGS.thumbs
    @slide_to(@current)

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
    console.log(viewport_height, scaled_image_height)
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
# resize images based on width
# full screen
# bind to touch start on mobile
# add swipe gesture
# ability to hide captions
# ability to hide thumbs
# Audio slot in caption
# photo meta

# DONE ---- 
# only load images are they appear - DONE
# different images for desktop and mobile - DONE
# get basic styles in and content in - DONE 
# basic slide transition for one width - DONE
# distance to slide based on width of article - DONE
# basic slider transition for all widths - DONE
# all things slide at once - DONE
# DONE - resize listener