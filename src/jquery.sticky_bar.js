(function($) {

$.fn.sticky_bar = function(options) {
  options = options || {};
  return $(this).each(function() {
    var sticky_bar = $(this).data('mobius');
		if (!sticky_bar) {
		  sticky_bar = new StickyBar($(this), options);
			$(this).data('stickybar', StickyBar);
		}
  });
};

function StickyBar($elem, options) {
  this.$elem = $elem;
  this.options = $.extend({}, {
    adjust_on: 'mobius:loaded_next scroll',
    parent: $elem.parent()
  }, options);
  this.last_scroll_top = 0;
  this.last_up = false;
  this.fixed = false;
  this.original_top = $elem.offset().top;
  this.update_window_larger_then_elem();
  this.bind_events();
}

$.extend(StickyBar.prototype, {
  bind_events: function () {
    var _this = this;
    $(window).resize(function() {
      _this.update_window_larger_then_elem();
    });

    $(document).bind(this.options.adjust_on, function(e) {
      var scroll_top = $(window).scrollTop();
      var scroll_bottom = scroll_top + $(window).height();
      var element_top = _this.$elem.offset().top;
      var element_bottom = element_top + _this.$elem.height();
      var $parent = _this.options.parent;
      var parent_bottom = $parent.offset().top + $parent.height();
      var actual_scroll = e.type == 'scroll';

      //direction
      var up = true;
      if(scroll_top > _this.last_scroll_top) up = false;
      var changed_direction = false;
      if(up != _this.last_up) changed_direction = true;

      // if we are scrolled above the original elements top position, put it
      // back how it was.
      if(scroll_top < _this.original_top) {
        _this.fixed = false;
        _this.$elem.css('position', 'static');
        _this.$elem.css('top', 'auto');
      // else if the window is smaller then the element and we are beneath the
      // parent's bottom, lock it to the bottom position.
      } else if(!_this.window_larger_then_elem && (scroll_bottom > parent_bottom)) {
        _this.fixed = false;
        _this.$elem.css('position', 'absolute');
        _this.$elem.css('top', parent_bottom - _this.$elem.outerHeight());
      // else if the window is larger then the element and the element would
      // fall beneath the footer, lock it to the bottom position.
      } else if(_this.window_larger_then_elem && (scroll_top + _this.$elem.height() > parent_bottom)) {
        _this.fixed = false;
        _this.$elem.css('position', 'absolute');
        _this.$elem.css('top', parent_bottom - _this.$elem.outerHeight());
      // else if we haven't changed direction or this isn't a real scroll
      // event.
      } else if(!changed_direction || !actual_scroll) {
        // if the object isn't fixed yet, fix it to the top or bottom
        if(!_this.fixed) {
          // if the window is larger then the elem, or (this isn't an actual
          // scroll or we're going up, and the element is above the top of the
          // screen, fix it to the top.
          if(_this.window_larger_then_elem || ((!actual_scroll || up) && (scroll_top < element_top))) {
            _this.fixed = true;
            _this.$elem.css('position', 'fixed');
            _this.$elem.css('top', 0);
          }
          // else if this isn't an actual scroll or we're going down, and the
          // element is below the bottom of the screen, fix it at the bottom.
          else if ((!actual_scroll || !up) && (scroll_bottom > element_bottom)) {
            _this.fixed = true;
            _this.$elem.css('position', 'fixed');
            _this.$elem.css('top', 0 - (_this.$elem.height() - $(window).height()));
          }
        }
      // else if (we are not above the header or footer, and we have changed
      // direction), position it absolute at the place it currently is.
      } else if(!_this.window_larger_then_elem) {
        _this.fixed = false;
        _this.$elem.css('position', 'absolute');
        _this.$elem.css('top', element_top );
        _this.$elem.css('bottom', 'auto');
      }

      _this.last_scroll_top = scroll_top;
      _this.last_up = up;
    });
  },
  update_window_larger_then_elem: function() {
    this.window_larger_then_elem = $(window).height() > this.$elem.height();
  }
});

})(jQuery);
