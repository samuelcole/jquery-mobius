(function ($) {
  function Mobius($elem, options) {
    this.$elem = $elem;
    this.xhr = false;
    this.paused = false;
    this.options = $.extend({}, {
      threshold: 500,
      trigger_next: 'scroll',
      // Default behavior is to append to $elem.
      load_next_after: false, // load after this element
      prepend_next: false, // prepend to $elem
      url: false
    }, options);
    this.current_page = 1;
    this.bind_events();
  }

  $.fn.mobius = function (options) {
    options = options || {};
    return $(this).each(function () {
      var mobius = $(this).data('mobius');
      if (!mobius) {
        mobius = new Mobius($(this), options);
        $(this).data('mobius', mobius);
      }
    });
  };


  $.extend(Mobius.prototype, {
    bind_events: function () {
      var _this = this;
      if (this.options.trigger_next === 'scroll') {
        $(window).scroll(function (e) {
          if (_this.paused) { return; }
          var window_position = $(window).scrollTop() + $(window).height(),
            element_top = _this.$elem.offset().top,
            element_height = _this.$elem.height(),
            element_position = window_position - element_top,
            threshold = element_height - _this.options.threshold,
            load_more = element_position > threshold;
          if (load_more) {
            _this.load_next();
          }
        });
      } else if (this.options.trigger_next.jquery) {
        this.options.trigger_next.click(function (e) {
          e.preventDefault();
          $(this).addClass('loading_next');
          _this.load_next();
        });
      }
    },
    pause: function () {
      this.paused = true;
    },
    play: function () {
      this.paused = false;
    },
    load_next: function () {
      var _this = this;
      this.load_page(this.current_page + 1, this.options.load_next_after, true);
    },
    load_page: function (page, $after, force_increment_current_page) {
      if (!$after || !$after.length) {
        $after = false;
      }
      var _this = this;
      if (!this.xhr) {
        this.$elem.trigger('mobius:loading_page');
        this.xhr = $.ajax({
          type: 'get',
          dataType: 'html',
          url: this.build_paged_url(page),
          success: function (data) {
            _this.xhr = false;
            var $html = $('<div>' + data + '</div>'),
              $children = $html.find('.mobius').children();
            if ($after) {
              $after.after($children);
            } else if (_this.options.prepend_next) {
              _this.$elem.prepend($children);
            } else {
              _this.$elem.append($children);
            }
            if (_this.options.trigger_next.jquery) {
              _this.options.trigger_next.removeClass('loading_next');
            }
            _this.$elem.trigger('mobius:loaded_page', [page, $children]);
            if (force_increment_current_page || !$after) {
              _this.current_page = page;
            }
          },
          error: function () {
            _this.xhr = false;
          }
        });
      }
    },
    build_paged_url: function (page) {
      var current = window.location.toString().replace(window.location.search, '').replace(window.location.hash, '');
      if (this.options.url) {
        current = this.options.url;
      }
      return (current + "?page=" + page);
    }
  });

}(jQuery));
