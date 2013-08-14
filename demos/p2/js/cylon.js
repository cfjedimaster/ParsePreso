Zepto(function($) {
   window.cylon = window.cylon || {};

   $(document).on("touchend", "a", function(e) {
      e.preventDefault();
      var page = $(this).parent("div[data-class='page']");
      var location = e.currentTarget.href;
      cylon.loadPage(location);
   });

   $(document).on("touchend", "*[data-url]", function(e) {
      e.preventDefault();
      var url = $(this).data("url");
      cylon.loadPage(url);
   });

   window.cylon.loadPage = function(u) {
      //assumes you've loaded one page, safe?
      var page = $("div[data-class='page']");

      $.get(u, function(res,code) {
         $("div[data-class='page']").replaceWith(res);
         var newPage = $("div[data-class='page']");
         var id = newPage.attr("id");
         if(id) {
            newPage.trigger("pageload", {"page":id});
         }
      });

   }

});