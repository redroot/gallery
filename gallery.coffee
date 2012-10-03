class Gallery
  SETTINGS = 
    transition:   "slide",
    breakpoints:  
      tablet: 960
      mobile: 768

  constructor: (id, config={}) ->
    @wrapper     = $(id)
    @current     = @resolve_current()
    @count       = @wrapper.find(".fmg-slide").length
    @init_bindings()
    @resize()
  
  init_bindings: -> 
    # bind clicks events
    # bind keypress event
    # bind resize event
    window.onresize = => @resize()
    
    
  slide_to: (pos) ->
    console.log("sliding to " + pos)
    # slide all elements to this positon
    # get the current width and update the slider accordingly
  
  resize: ->
    width = @gallery_width()
    
    if width < SETTINGS.breakpoints.mobile
      console.log("to mobile")
      @wrapper.removeClass("fmg-gallery-tablet").addClass("fmg-gallery-mobile")
    else if width < SETTINGS.breakpoints.tablet 
      @wrapper.removeClass("fmg-gallery-mobile").addClass("fmg-gallery-tablet")
    else
      @wrapper.removeClass("fmg-gallery-tablet fmg-gallery-mobile")
    
    @wrapper.find(".fmg-slide, .fmg-caption").each ->
      $(this).width(width)    
    @wrapper.find(".fmg-slides-wrapper, .fmg-captions-wrapper").each (i,e) =>
      $(e).width(width * @count)      
    @wrapper.find(".fmg-thumbs-wrapper").width(Math.ceil(150 * @count))
    @slide_to(@current)

  gallery_width: ->
    @wrapper.width()  
    
  resolve_current: ->
    # from hash
    0 
  
  add_listener: (event,fn) ->
    @events or= []
    @events[event] = [] unless @events[event]
    @events[event].push(fn)
  
  trigger: (event,args) ->
    (cb(args) for cb in @events[event]) if @events[event]
  
  

new Gallery("#gallery_one")

# TODO ----------------
# DONE - get basic styles in and content in 
# basic slide transition for one width
# distance to slide based on width of article
# resize images based on width
# basic slider transition for all widths
# all things slide at once
# only load images are they appear
# different images for desktop and mobile
# full screen
# DONE - resize listener
# ability to hide captions
# ability to hide thumbs
# thumb meta