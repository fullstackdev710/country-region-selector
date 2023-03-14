jQuery(function ($) {
  $(".other-ways-menu").on("click", function (e) {
    e.preventDefault();

    var link = $(this);
    var menu = link.next(".other-ways-content");
    if (link.hasClass("open")) {
      link.removeClass("open");
      menu.slideUp("fast");
    } else {
      link.addClass("open");
      menu.slideDown("fast");
    }
  });
});
