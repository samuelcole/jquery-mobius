(function ($) {
  function Mobius($elem, options) {
    this.$elem = $elem;
    this.xhr = false;
    this.paused = options.paused || false;
    this.options = $.extend({}, {
      threshold: 500,
      trigger_next: 'scroll',
      // Default behavior is to append to $elem.
      load_next_after: false, // load after this element
      prepend_next: false, // prepend to $elem
      extra_params: {},
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
      if (typeof this.options.trigger_next === 'string') {
        $(window).bind(this.options.trigger_next, function () {
          _this.check_for_more();
        });
        _this.check_for_more();
      } else if (this.options.trigger_next.jquery) {
        this.options.trigger_next.click(function (e) {
          e.preventDefault();
          $(this).addClass('loading_next');
          _this.load_next();
        });
      }
    },
    clear_extra_params: function () {
      this.options.extra_params = {};
    },
    add_param: function (key, value) {
      var new_params = {};
      new_params[key] = value;

      $.extend(this.options.extra_params, new_params);
    },
    pause: function () {
      this.paused = true;
    },
    play: function () {
      this.paused = false;
    },
    check_for_more: function () {
      if (this.paused) { return; }
      var window_position = $(window).scrollTop() + $(window).height(),
        element_top = this.$elem.offset().top,
        element_height = this.$elem.height(),
        element_position = window_position - element_top,
        threshold = element_height - this.options.threshold,
        load_more = element_position > threshold;
      if (load_more) {
        this.load_next();
      }
    },
    load_next: function () {
      this.load_page(this.current_page + 1, this.options.load_next_after, true);
    },
    load_page: function (page, $after, force_increment_current_page) {
      var page_int = parseInt(page, 10),
        _this = this;

      if (isNaN(page_int)) {
        // this is a bug that sometimes happens on iOS devices, let's defend
        // against it.
        return;
      }

      if (!$after || !$after.length) {
        $after = false;
      }


      if (!this.xhr) {
        this.$elem.trigger('mobius:loading_page');
        this.xhr = $.ajax({
          type: 'get',
          dataType: 'html',
          url: this.build_paged_url(page_int),
          success: function (data) {
            _this.xhr = false;
            var $html = $('<div>' + data + '</div>'),
              $children = $html.find('.mobius').children();
            if (!$children.length) {
              _this.$elem.trigger('mobius:error', ['No mobius found in page #' + page_int + '.']);
              return;
            }
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
            _this.$elem.trigger('mobius:loaded_page', [page_int, $children]);
            if (force_increment_current_page || !$after) {
              _this.current_page = page_int;
            }
          },
          error: function () {
            _this.xhr = false;
          }
        });
      }
    },
    build_paged_url: function (page) {
      var current =
        window.location.toString().replace(window.location.search, '').replace(window.location.hash, ''),
        extra_params_string = $.param(this.options.extra_params),
        hash_RE = /(.*)#$/;
      //omit any extraneous hash
      if (hash_RE.test(current)) {
        current = hash_RE.exec(current)[1];
      }
      if (extra_params_string) {
        extra_params_string = '&' + extra_params_string;
      }
      if (this.options.url) {
        current = this.options.url;
      }
      return (current.toString() + "?page=" + page + extra_params_string);
    }
  });

}(jQuery));
