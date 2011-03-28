(function($) {
$.fn.mobius = function(options) {
  options = options || {};
  return $(this).each(function() {
    var mobius = $(this).data('mobius');
		if (!mobius) {
		  mobius = new Mobius($(this), options);
			$(this).data('mobius', mobius);
		}
  });
};

function Mobius($elem, options) {
  this.$elem = $elem;
  this.xhr = false;
  this.paused = false;
  this.options = $.extend({}, {
    threshold: 500
  }, options);
  this.current_page = 1;
  this.bind_events();
}

$.extend(Mobius.prototype, {
  bind_events: function () {
    var _this = this;
    $(document).scroll(function(e) {
      if(_this.paused) return;
      var window_position = $(window).scrollTop() + $(window).height();
      var element_top = _this.$elem.offset().top;
      var element_height = _this.$elem.height();
      var element_position = window_position - element_top;
      var threshold = element_height - _this.options.threshold;
      var load_more = element_position > threshold;
      if(load_more) _this.load_next();
    });
  },
  pause: function() {
    this.paused = true;
  },
  play: function() {
    this.paused = false;
  },
  load_next: function() {
    if(!this.xhr) {
      this.$elem.trigger('mobius:loading_page');
      this.xhr = $.ajax({
        type: 'get',
        dataType: 'html',
        url: this.build_paged_url(),
        success: function(data) {
          _this.xhr = false;
          var $html = $('<div>' + data + '</div>');
          _this.$elem.append($html.find('.mobius').children());
          _this.$elem.trigger('mobius:loaded_next');
        },
        error: function() {
          _this.xhr = false;
          this.current_page -= 1;
        }
      });
    }
  },
  build_paged_url: function() {
    var current = window.location.toString().replace(window.location.search, '');
    return(current + "?page=" + this.current_page);
  }
});

})(jQuery);
