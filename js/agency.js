/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

var page = $("html, body");

function stopScrollingPage(){
    page.stop("scroll");
}

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);

        page.on("scroll wheel DOMMouseScroll mousewheel touchmove", stopScrollingPage);

        page.stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
            },
            {
                duration: 1500,
                easing: 'easeInOutExpo',
                complete: function () {
                    page.off("scroll wheel DOMMouseScroll mousewheel touchmove", stopScrollingPage);
                },
                queue: "scroll"
            }
        ).dequeue("scroll");
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
/*$('body').scrollspy({
    target: '.navbar-fixed-top'
})*/

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});