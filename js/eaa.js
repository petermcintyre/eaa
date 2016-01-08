/*Replace tel: links with callto: so that it works with Skype
* Source:http://stackoverflow.com/questions/1164004/how-to-mark-up-phone-numbers*/
if (!jQuery.browser.mobile) {
    jQuery('body').on('click', 'a[href^="tel:"]', function() {
        jQuery(this).attr('href',
            jQuery(this).attr('href').replace(/^tel:/, 'callto:'));
    });
}