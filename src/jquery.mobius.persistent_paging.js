(function ($) {

  function replace_hash(new_hash) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, new_hash);
    } else {
      window.location.replace(new_hash);
    }
  }

  $.fn.persistent_paging = function (options) {
    options = options || {};
    return $(this).each(function () {
      // Persistant paging

      var $mobius = $(this),
        // loaded pages is an array of pages, that should be formatted:
        // [page_number, offset_top, $page_div]
        loaded_pages = [ [1, 0, $mobius.find('.page')] ],
        // below is the current page (item from the array above) we are on
        below = [],
        // last_below is a page number
        last_below = false,
        mobius = $mobius.data('mobius'),
        page_RE = /^#p(\d*)/,
        match = page_RE.exec(window.location.hash);

      if (match && (parseInt(match[1], 10) !== 1)) {
        $mobius.one('mobius:loaded_page', function (e, page, $contents) {
          $.scrollTo($contents.offset().top + 70);
        });
        mobius.load_page(parseInt(match[1], 10));
      }

      function recalculate_page_offsets() {
        var result = [];
        $.each(loaded_pages, function () {
          result.push([ this[0], this[2].offset().top, this[2]]);
        });
        loaded_pages = result;
      }

      $mobius.bind('mobius:loaded_page', function (e, page, $contents) {
        var missing = [],
          found,
          i;

        loaded_pages.push([page, false, $contents]);
        recalculate_page_offsets();

        function compare_for_found() {
          if (this[0] === i) {
            found = true;
            return false; //break
          }
        }

        for (i = 1; i <= loaded_pages[loaded_pages.length - 1][0]; i += 1) {
          found = false;
          $.each(loaded_pages, compare_for_found);
          if (!found) {
            missing.push(i);
          }
        }
        if (!missing.length) {
          $mobius.find('div.missing').remove();
        } else {
          $.each(missing, function () {
            var closest_page_above = loaded_pages[0],
              missing_page_number = parseInt(this, 10),
              $missing = $([]),
              missing_pages = [],
              $loading = $([]),
              $load_more = $([]);

            $.each(loaded_pages, function () {
              if ((this[0] > closest_page_above[0]) && (this[0] < missing_page_number)) {
                closest_page_above = this;
              }
            });

            $missing = closest_page_above[2].next('.missing');

            if ($missing.length) {
              missing_pages = $missing.data('missing_pages');
              if ($.inArray(missing_page_number, missing_pages) === -1) {
                missing_pages.push(missing_page_number);
                $missing.data('missing_pages', missing_pages);
              }
            } else {
              $missing = $mobius.siblings('.missing').clone();
              $loading = $missing.find('.loading');
              $load_more = $missing.find('.load_more');
              $missing.data('missing_pages', [ missing_page_number ]);
              $missing.find('a').click(function (e) {
                var missing_pages = $missing.data('missing_pages'),
                  load_page = missing_pages.pop();

                e.preventDefault();

                if (missing_pages.length) {
                  $missing.data('missing_pages', missing_pages);
                }

                $load_more.addClass('loading');
                mobius.load_page(load_page, $missing);
                $mobius.one('mobius:loaded_page', function () {
                  $load_more.removeClass('loading');
                });
              });
              closest_page_above[2].after($missing);
              $loading.hide();
              $missing.show();
            }
          });
        }
      });
      $(document).scroll(function () {
        var window_position = $(window).scrollTop();
        $.each(loaded_pages, function () {
          var bottom_position = this[1];
          if (window_position > bottom_position) {
            below = this;
          }
        });
        if (below[0] !== last_below) {
          replace_hash('#p' + below[0]);
          $(document).trigger('infinite_scroll:scrolled_to', [below[0]]);
          last_below = below[0];
        }
      });
    });
  };

}(jQuery));
