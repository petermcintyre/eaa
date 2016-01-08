'use strict';

// DOM Ready
$(function() {

    // Avoid `console` errors in browsers that lack a console.
    var method;
    var noop = function () {};
    var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

            // Only stub undefined methods.
            if (!console[method]) {
              console[method] = noop;
          }
      }

    // Extend jQuery .on() & .bind() handlers with delay argument, for smooth resizing
    // Usage = .on('resize', function(){}, 100);
    (function($) {
      var bindings = { on: $.fn.on, bind: $.fn.bind };
      $.each(bindings, function(k){
        $.fn[k] = function () {
          var args = [].slice.call(arguments),
            delay = args.pop(),
            fn = args.pop(),
            timer;

          args.push(function () {
            var self = this,
              arg = arguments;
            clearTimeout(timer);
            timer = setTimeout(function(){
              fn.apply(self, [].slice.call(arg));
            }, delay);
          });

          return bindings[k].apply(this, isNaN(delay) ? arguments : args);
        };
      });
    })(jQuery);

    // Animate all anchors
    $('a[href*=#]:not([href=#])').click(function() {
      if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top - 30
          }, 300);
          return false;
        }

      }
    });

  });

/*eslint no-unused-vars: 0 */
'use strict';

// Constants
var AMOUNT_INPUT = '.amount__input',
    CHARITY_SELECT = '.charities';

/**
 * Fetch URL parameters
 * @return {object} All paramaters from the URL
 */
function getParams() {
  var params = {};

  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		params[key] = value;
	});

	return params;
}

/**
 * Get a charity from JSON data
 * @param  {object} charities Object with property charities
 * @param  {string} id        ID of charity
 * @return {object}           Charity data
 */
function getCharity(data, id) {
  var charities = data.charities,
      index;

  index = charities.map(function(charity) {
    return charity.id;
  }).indexOf(id);

  return index === -1 ? false : charities[index];
}

/**
 * Set input values
 * @param  {object} params URL parameters
 */
function setValues(params) {
  if (params.amount) {
    $(AMOUNT_INPUT).val(params.amount);
  }

  if (params.charity) {
    $('.charities [data-id="' + params.charity + '"]').trigger('click');
  }
}

/**
 * Get JSON data and store it in a cache if it's already been fetched
 * @param  {function} callback Callback to perform on data
 */
var getData = (function() {
  var cache;

  return function(callback) {
    if (cache) {
      callback(cache);
      return;
    }

    $.getJSON('json/charities.json', function(data) {
      cache = data;
      callback(data);
    })
    .fail(function(data, textStatus, error) {
      console.error('Could not load charities.json, status: ' + textStatus + ', error: ' + error);
    });
  };
})();

/**
 * Build charity selector(s) based on JSON data
 * @param  {object} data   JSON data containing charities
 * @param  {string} select jQuery selector of charities <select>
 */
function buildSelector(data) {
  var toolbar = CHARITY_SELECT + '--toolbar',
      titlebar = CHARITY_SELECT + '--titlebar';

  // Append charities
  data.charities.forEach(function(charity){
    $(toolbar).append('<option class="charities__charity" value="' + charity.id + '" data-icon="&#x' + charity.logo + ';">' + charity.name);
    $(titlebar).append('<span class="charities__charity charities__charity--titlebar" data-id="' + charity.id + '" data-icon="&#x' + charity.logo + ';">' + charity.name + '</span>');
  });

  // Replace the default select
  var select = $(toolbar).dropkick({
    mobile: true,
    change: function(){
      $(toolbar).trigger('input');
    }
  });

  $(CHARITY_SELECT + ' .dk-option').each(function(i){
    $(this).attr('data-icon', $(CHARITY_SELECT + ' option').eq(i).attr('data-icon') );
  });

  // Sync the selects
  $('.charities__charity').click(function(){
    var id = $(this).data('id') || $(this).data('value'),
        titleSelected = $('.charities__charity--titlebar[data-id="' + id + '"]');

    $(titleSelected).siblings().removeClass('charities__charity--selected');
    $(titleSelected).addClass('charities__charity--selected');

    if ($(this).hasClass('charities__charity--titlebar')){
      select.dropkick('select', id);
    }

  });

  // Sync the inputs
  $(AMOUNT_INPUT).on('input', function() {
    var val = $(this).val();

    if ($(this).hasClass('amount__input--titlebar')){
      $(AMOUNT_INPUT + '--toolbar').val(val);
    } else {
      $(AMOUNT_INPUT + '--titlebar').val(val);
    }
  });
}

/**
 * Calculate the impact results
 * @param  {object} charity JSON object containing charity data
 * @param  {number} amount  Amount donated to charity
 * @return {array}          Impacts from donation
 */
function calcImpact(charity, amount) {
  var impacts = [],
      overhead,
      usableDonation,
      exchangeRate,
      localisedAmount;

  // localise the input
  if (typeof geoplugin_currencyConverter === 'function') {
    exchangeRate = 1 / geoplugin_currencyConverter(1, false);
    localisedAmount = amount * exchangeRate;
  } else {
    localisedAmount = amount;
  }

  // Calculate usable donation
  overhead = 1.0 - charity.overhead;
  usableDonation = overhead * localisedAmount;

  charity.pricePoints.forEach(function(pricePoint){

    if (usableDonation >= pricePoint.price) {
      var n = Math.floor(usableDonation / pricePoint.price);

      impacts.push({
        amount: n,
        text: n === 1 ? pricePoint.text.single : pricePoint.text.plural,
        icon: pricePoint.iconURL,
        joiner: pricePoint.joiner || false,
        color: pricePoint.color
      });

    } else {
      impacts.push({
        amount: '',
				text: 'Want to make a bigger difference? Increase your donation!',
				icon: pricePoint.iconURL,
        joiner: false,
        color: pricePoint.color
      });
    }

  });

  return impacts;
}

/**
 * Write outputted data to the DOM
 * @param  {object} charity   JSON object containing charity data
 * @param  {array} impacts    Array of objects containing impact values
 * @param  {object} elements  jQuery selectors to write to
 */
function writeCharity(charity, elements){

  // Write charity info
  $(elements.organization).html(charity.organization);
  $(elements.numbers).html(charity.numbers);
  $(elements.recommendation).html(charity.recommendation);

  // Write link hrefs to DOM
  $(elements.donate).attr('href', charity.donateURL);
  $(elements.info).attr('href', charity.infoURL);
}

/**
 * Writes individual result outputs to the DOM
 * @param  {object} charity   JSON object containing charity data
 * @param  {array} impacts   Array of objects containing impact values
 * @param  {object} elements  jQuery selectors to write to
 */
function writeResults(charity, impacts, elements){

  var currencySymbol = '$',
      currencyCode = 'USD';

  if (typeof geoplugin_currencySymbol === 'function') {
    currencySymbol = geoplugin_currencySymbol();
    currencyCode = geoplugin_currencyCode()
  };

  // Write intro text
  $(elements.intro).html('Your <strong>' + currencySymbol + $(AMOUNT_INPUT).val() + ' ' + currencyCode + '</strong> donation to <strong>' + charity.name + '</strong> can:');

  // Start with a fresh slate
  $(elements.results).empty();

  // Write impacts
  impacts.forEach(function(impact, i){
    var impactText = impact.text,
        resultHTML,
        result,
        joiner;

    resultHTML = '<div class="result"><img class="result__icon" src="' + impact.icon + '" /></div>';
    impactText = impactText.replace(/[*]/, '<strong>' + impact.amount.toString() + '</strong>');
    result = '<p class="result__content" data-color="' + impact.color + '">' + impactText + '</p>';
    joiner = '<span class="result__joiner">' + impact.joiner + '</span>';

    // Check if last result was null, then stop
    if (i > 0 && impacts[i - 1].amount === '') {
      return;
    }

    // Check if we're overwriting a results or creating new ones
    if ($('.result').eq(i).length){
      $('.result').eq(i).replaceWith(resultHTML);
    } else {
      $(elements.results).append(resultHTML);
    }

    // Check if we're replacing or adding the result
    if ($('.result').eq(i).children('.result__content').length){
      $('.result').eq(i).children('.result__content').replaceWith(result);
    } else {
      $('.result').eq(i).append(result);
    }

    // Add the joiner, if it exists
    if (impact.joiner) {
      // Check if we're replacing or adding it
      if ($('.result').eq(i).children('.result__joiner').length){
        $('.result').eq(i).children('.result__joiner').replaceWith(joiner);
      } else {
        $('.result').eq(i).append(joiner);
      }
    }
  });
}

/*eslint block-scoped-var: 0, no-undef: 0 */
'use strict';

// DOM Ready
$(function(){

  // Toolbar scroll
  console.log($('.ic-content').waypoint);
  $('.ic-content').waypoint(function(direction){
    if (direction === 'down') {
      $('.toolbar').addClass('toolbar--scroll');
    } else {
      $('.toolbar').removeClass('toolbar--scroll');
    }
  }, {
    offset: 100
  });

  // Build the charity selectors
  getData(function(data){
    var params = getParams();
    buildSelector(data);
    setValues(params);
  });

  // Localise currency symbol
  var currencySymbol = '$';
  if (typeof geoplugin_currencySymbol === 'function') {
    $('<textarea />').html(geoplugin_currencySymbol()).text();
  }
  $('.amount').attr('data-currency', currencySymbol);

  // Run the impact calc
  getData(function(data){
    var charity,
        impacts,
        amount,
        select,
        elements;

    amount = AMOUNT_INPUT + '--toolbar';
    select = 'select' + CHARITY_SELECT;

    // Map out the selectors we're using
    elements = {
      intro: '#intro-text',
      results: '#results',
      organization: '#organization-content',
      numbers: '#numbers-content',
      recommendation: '#recommendation-content',
      donate: '#donate',
      learnMore: '#learnmore',
      info: '#learnmore'
    };

    // Set up helper functions
    var processAll = function() {
      // Fetch the individual charity
      charity = getCharity(data, $(select).val());

      // Calculate the impacts
      impacts = calcImpact(charity, $(amount).val());

      // Write to the DOM
      writeCharity(charity, elements);
      writeResults(charity, impacts, elements);
    };

    var processResult = function() {
      // Fetch data
      charity = getCharity(data, $(select).val());
      impacts = calcImpact(charity, $(amount).val());

      // Write to the DOM
      writeResults(charity, impacts, elements);
    };


    // Update the whole calc if charity changes
    $(select).on('input', function() {
      // Only run if we have both values
      if ($(amount).val() && $(select).val()) {
        // Do the swaparoo
        if ($('.placeholder').css('display') !== 'none'){
          $('.placeholder').fadeOut(150, function(){
            processAll();
            $('.ic-output').fadeIn(150);
            $('html, body').animate({ scrollTop: $('.ic-content').offset.top - 80 }, 300);
          });
        } else {
          $('.ic-output').fadeOut(150, function(){
            processAll();
            $(this).fadeIn(150);
          });
        }

      }
    });

    // Only update result if amount changes
    $(AMOUNT_INPUT).on('input', function() {

      // Only run if we have both values
      if ($(amount).val() && $(select).val()) {

        // Do the swaparoo
        if ($('.placeholder').css('display') !== 'none'){
          $('.placeholder').fadeOut(150, function(){
            processAll();
            $('.ic-output').fadeIn(150);
            $('html, body').animate({ scrollTop: $('.ic-content').offset().top - 80 }, 300);
          });
        } else {
          processResult();
        }

      }
    });

  });

});
