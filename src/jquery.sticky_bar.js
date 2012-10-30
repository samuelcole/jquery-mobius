(function ($) {

  function StickyBar($elem, options) {
    this.$elem = $elem;
    this.options = $.extend({}, {
      adjust_on: 'mobius:loaded_page scroll resize sticky_bar:position load',
      parent: $elem.parent(),
      attach_to: 'top',
      lock_to_bottom: true
    }, options);
    this.paused = false;
    this.last_scroll_top = 0;
    this.last_up = false;
    this.fixed = false;
    this.original_top = $elem.offset().top;
    this.original_bottom = this.original_top + $elem.height();
    this.update_window_larger_then_elem();
    this.attach_to_top = this.options.attach_to === 'top';
    this.attach_to_bottom = !this.attach_to_top;
    this.bind_events();
    //resize on load
    this.reposition();
  }

  $.fn.sticky_bar = function (options) {
    options = options || {};
    return $(this).each(function () {
      var sticky_bar = $(this).data('mobius');
      if (!sticky_bar) {
        sticky_bar = new StickyBar($(this), options);
        $(this).data('stickybar', sticky_bar);
      }
    });
  };


  $.extend(StickyBar.prototype, {
    bind_events: function () {
      var _this = this;

      $(window).resize(function () {
        _this.update_window_larger_then_elem();
      });

      $(document).bind('shifted', function () {
        // reset so that we can measure
        _this.fixed = false;
        _this.$elem.css('position', 'static');
        _this.$elem.css('top', 'auto');
        _this.$elem.css('bottom', 'auto');

        _this.original_top = _this.$elem.offset().top;
        _this.original_bottom = _this.original_top + _this.$elem.height();
        
        _this.reposition();
      });

      $(window).bind(this.options.adjust_on, function (e) {
        if (!_this.paused) {
          _this.reposition(e);
        }
      });
      
      this.$elem.bind('sticky_bar:fix_to_bottom', function (e) {
        _this.fixed = true;
        _this.$elem.css('position', 'fixed');
        _this.$elem.css('top', -(_this.$elem.height() - $(window).height()));
      });

      this.$elem.bind('sticky_bar:pause', function (e) {
        _this.paused = true;
      });

      this.$elem.bind('sticky_bar:unpause', function (e) {
        _this.paused = false;
      });
    },

    update_window_larger_then_elem: function () {
      this.window_larger_then_elem = $(window).height() > this.$elem.height();
    },

    reposition: function (e) {
      var _this = this,
        scroll_top = $(window).scrollTop(),
        scroll_bottom = scroll_top + $(window).height(),
        element_top = _this.$elem.offset().top,
        element_bottom = element_top + _this.$elem.height(),
        $parent = _this.options.parent,
        parent_bottom = $parent.offset().top + $parent.height(),
        actual_scroll = e && e.type === 'scroll',
        was_fixed = this.fixed,

      //direction
        up = scroll_top > _this.last_scroll_top ? false : true,
        changed_direction = up !== _this.last_up ? true : false;
      
      // if we are scrolled above the original elements top position, put it
      // back how it was.
      if (
        (_this.attach_to_top &&
          (scroll_top < _this.original_top)) ||
          (_this.attach_to_bottom &&
          (scroll_bottom > _this.original_bottom))
      ) {
        _this.fixed = false;
        _this.$elem.css('position', 'static');
        _this.$elem.css('top', 'auto');
        _this.$elem.css('bottom', 'auto');
      // else if the window is smaller then the element and we are beneath the
      // parent's bottom, lock it to the bottom position.
      } else if (
        _this.options.lock_to_bottom && 
          (!_this.window_larger_then_elem && (scroll_bottom > parent_bottom))
      ) {
        _this.fixed = false;
        _this.$elem.css('position', 'absolute');
        _this.$elem.css('top', parent_bottom - _this.$elem.outerHeight());
      // else if the window is larger then the element and the element's bottom would
      // fall beneath the footer, lock it to the bottom position.
      } else if (
        _this.options.lock_to_bottom && (
          _this.window_larger_then_elem &&
          (scroll_top + _this.$elem.height() > parent_bottom)
        )
      ) {
        _this.fixed = false;
        _this.$elem.css('position', 'absolute');
        _this.$elem.css('top', parent_bottom - _this.$elem.outerHeight());
      // else if we haven't changed direction or this isn't a real scroll
      // event.
      } else if (!changed_direction || !actual_scroll) {
        // if the object isn't fixed yet, fix it to the top or bottom
        if (!_this.fixed) {
          if (_this.attach_to_top) {
            // if the window is larger then the elem, or (this isn't an actual
            // scroll or we're going up, and the element is above the top of the
            // screen, fix it to the top.
            if (
              _this.window_larger_then_elem ||
                ((!actual_scroll || up) && (scroll_top < element_top))
            ) {
              _this.fixed = true;
              _this.$elem.css('position', 'fixed');
              _this.$elem.css('top', 0);
            // else if this isn't an actual scroll or we're going down, and the
            // element is below the bottom of the screen, fix it at the bottom.
            } else if ((!actual_scroll || !up) && (scroll_bottom > element_bottom)) {
              _this.fixed = true;
              _this.$elem.css('position', 'fixed');
              _this.$elem.css('top', -(_this.$elem.height() - $(window).height()));
            }
          } else {
            // if the window is larger then the elem, or (this isn't an actual
            // scroll or we're going up, and the element is above the top of the
            // screen, fix it to the top.
            if (
              _this.window_larger_then_elem ||
                ((!actual_scroll || !up) && (scroll_bottom > element_bottom))
            ) {
              _this.fixed = true;
              _this.$elem.css('position', 'fixed');
              _this.$elem.css('bottom', 0);
            }
          }
        }
      // else if (we are not above the header or footer, and we have changed
      // direction), position it absolute at the place it currently is.
      } else if (!_this.window_larger_then_elem) {
        _this.fixed = false;
        _this.$elem.css('position', 'absolute');
        _this.$elem.css('top', element_top);
        _this.$elem.css('bottom', 'auto');
      }

      if (_this.was_fixed !== _this.fixed) {
        _this.$elem.trigger('sticky_bar:fixed_changed', [ _this.fixed ]);
      }

      _this.last_scroll_top = scroll_top;
      _this.last_up = up;
    }
  });

}(jQuery));

