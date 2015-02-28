(function (App) {
    'use strict';

        /* global debug, APIEndpoint, EQ, Spinner */

    /**
     * Cards Carousel Component 
     *
     * It creates a carousel made out of card like items as seen on the Upcoming
     * Sessions widget. You can populate the slides in two ways; the first, you
     * can add them directly to the HTML markup; and the second way is to tell
     * the component where to get the JSON data from and the component will make
     * the slides for you.
     *
     * @dependencies
     *   + Modified version of OWL Carousel (fixes to allow non JSONP calls)
     *
     * @usage
     *
     * Loading slides via HTML markup:
     *
     * <div class="cards-carousel" data-component="cards-carousel">
     *     <div class="owl-carousel owl-theme">
     *         <div class="item">...</div>
     *         <div class="item">...</div>
     *         ...
     *         <div class="item">...</div>
     *     </div>
     * </div>
     *
     * Loading slides from JSON data:
     *
     *      <div class="cards-carousel" data-component="cards-carousel" data-json="upcoming-sessions.json">
     *          <div class="owl-carousel owl-theme"></div>
     *      </div>
     *
     * Cards Markup looks like this:
     *
     * <div class="item">
     *    <div class="h1">Mon 27</div>
     *    <div class="h2">January</div>
     *    <strong>7:00 PM</strong>
     *    <p>Joe @ Printing House</p>
     *
     *    <div class="jump-links">
     *          <a href="#" class="align-left">cancel</a>
     *          <a href="#" class="align-right">reschedule</a>
     *    </div>
     *
     *    <a href="#" class="ico-add">Add to Calendar</a>
     * </div>
     *
     * @param $el
     * @param options
     */
    App.Components['cards-carousel'] = function ($el, options) {
        var defaults = {
            navigation : false,
            itemsCustom : [
                [0, 1],
                [450, 1],
                [600, 1],
                [700, 1],
                [1000, 3],
                [1200, 3],
                [1400, 3],
                [1600, 3]
            ],
            jsonp : false, // custom EQ property to make owl carousel work with jsonp apis
            spinner: {
                lines: 13, // The number of lines to draw
                length: 7, // The length of each line
                width: 2, // The line thickness
                radius: 10, // The radius of the inner circle
                corners: 0, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#fff', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 52, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: '50%', // Top position relative to parent in px
                left: '50%' // Left position relative to parent in px
            }
        };

        var mock = null; //'/assets/js/mock-data'; // set to null for production
        var base = mock || APIEndpoint; //use '/assets/js/mockdata' for mock data or APIEndpoint for production
        var opts = $.extend(options, defaults);
        var json = $el.attr('data-json');
        var $owl = $el.find('.owl-carousel');
        var spinner = new Spinner(opts.spinner).spin($owl.parent()[0]);

        /**
         * templates
         *
         * Though the cards carousel look is not meant to change in overall look (e.g. its slides look like
         * cards, with one of two headings, a circle graphic and some unordered list links) the order in which
         * these items are render, might change (also, the API may be different). We split these differences,
         * into different partials. Feel free to create more partials as needed. I recommend using "myTrainer"
         * as the base partial sample as it is the simplest.
         *
         * @type {{selected: *, views: {myTrainer: Function, myInventory: Function, upcomingSessions: Function}}}
         */
        var templates = {
            selected: $el.attr('data-view') ? EQ.Helpers.str.toCamelCase($el.attr('data-view')) : null,
            views : {


                /**
                 * myTrainer
                 *
                 * This partial is used in /PersonalTraining
                 *
                 * @param data
                 */
                myTrainer: function (data) {
                    var str = '';
                    var arr = data.trainers;
                    var len = arr.length;
                    var itm = arr;

                    enableControls(data.trainers);

                    if (arr.length > 0) {
                        for (var i = 0; i < len; i++) {
                            str += '<div class="item">';
                            //str += '    <img src="http://dev-phoenix.equinox.com/cms/images/c27cb343-3257-43fe-997b-60cc753dce49/en-us/Club_Amenities_150x150_Kiehls%20copy.jpg?e8c59215fe856" class="circle" />';
                            str += '    <img src="/assets/images/pt-avatar.gif" class="circle" />';
                            str += '    <p>';
                            str += '        <strong>' + itm[i].name + '</strong>';

                            if (itm[i].tierName !== '') {
                                str += '    <span> ' + itm[i].tierName + '</span>';
                            }

                            str += '    </p>';
                            str += '    <ul>';

                            if (itm[i].phoneNumber !== '' && itm[i].phoneNumber !== null) {
                                str += '   <li><i class="icon-phone"></i>' + itm[i].phoneNumber + '</li>';
                            }

                            str += '       <li><a href="mailto:' + itm[i].emailAddress + '"><span class="icon-envelope"></span><span>' + itm[i].emailAddress + '</span></a></li>';
                            str += '    </ul>';
                            str += '</div>';
                        }
                    } else {
                        str += '<div class="h3">You have no trainer yet</div>';
                        debug('[CAROUSEL CARDS] Error: no items received from the API for "My Trainer" component');
                    }

                    render(str);
                },


                /**
                 * myInventory
                 *
                 * This partial is used in /PersonalTraining
                 *
                 * @param data
                 */
                myInventory: function (data) {
                    var str = '';
                    var arr = data.inventory;
                    var len = arr.length;
                    var itm = arr;

                    enableControls(data.inventory);

                    if (arr.length > 0) {
                        for (var i = 0; i < len; i++) {
                            var statusLabel = 'alert-status-' + getInventoryStatusLabel(itm[i].available);
                            var duration =  (itm[i].duration === 0) ? '&nbsp;' : '(' + itm[i].duration + ' min)';
                            var renewals = itm[i].isAutoRenewOn ? 'ON' : 'OFF';

                            str += '<div class="item">';
                            str += '    <div class="circle ' + statusLabel + '">';
                            str += '        <span>' + itm[i].tier + '<small>' + duration + '</small></span>';
                            str += '        <i>' + itm[i].available + '</i>';
                            str += '    </div>';

                            console.log('x', itm[i].isAutoRenewOn);
                            console.log('d', typeof itm[i].isAutoRenewOn);
                            if (itm[i].isAutoRenewOn !== null) {
                                str += '    <div class="auto-renew-info">';
                                str += '        <div>Auto renew: <strong>' + renewals + '</strong></div>';
                                str += '        <a href="/account/ptrenew">Edit</a>';
                                str += '    </div>';
                            }
                            str += '</div>';
                        }
                    } else {
                        debug('[CAROUSEL CARDS] Error: no items received from the API for "My Trainer" component');
                    }

                    if (arr.length < 2) {
                        $el.find('.total-available-count'); //.remove();
                    }

                    $el.find('.total-available-count span').text(data.totalAvailableCount);

                    render(str);
                },


                /**
                 * upcomingSessions
                 *
                 * This partial is used in /PersonalTraining as the hero of the page
                 *
                 * @param data
                 * @returns {string}
                 */
                upcomingSessions: function (data) {

                    var str  = '';
                    var arr  = data.sessions;
                    var len  = arr.length;
                    var itm  = arr;
                    var zone = '';


                    enableControls(data.sessions);

                    if (arr.length > 0) {
                        for (var i = 0; i < len; i++) {
                            str += '<div class="item">';
                            str += '    <div class="h1">' + itm[i].day + '</div>';
                            str += '    <div class="h2">' + itm[i].month + '</div>';
                            str += '    <p>';

                            if (itm[i].timeZone !== null) {
                                zone = ' ' + itm[i].timeZone;
                            }

                            str += '        <strong>' + itm[i].time + zone + '</strong>';
                            str +=          itm[i].trainerFirstName + ' @ ' + itm[i].facility;
                            str += '    </p>';
                            str += '    <ul class="inline-list">';
                            str += '        <li><a href="personal-training/schedule#cancel/' + itm[i].id + '" class="align-left"><span class="icon-close"></span><span>cancel</span></a></li>';

                            if (itm[i].canReschedule) {
                                str += '    <li><a href="personal-training/schedule#update/' + itm[i].id + '" class="align-right"><span class="icon-rotate"></span><span>reschedule</span></a></li>';
                            }

                            str += '    </ul>';
                            str += '    <ul>';
                            //
                            str += '        <li><a href="' + APIEndpoint + '/ME/CALENDAR/EVENTS/' + itm[i].id + '/EXPORT/ICS?exportType=AppointmentInstance" class="align-right"><span class="icon-export"></span><span>Export to Calendar</span></a></li>';
                            str += '    </ul>';
                            str += '</div>';
                        }

                        render(str);

                        // DPLAT-1939 adjust max-width if only two so we can center properly
                        if (arr.length === 2) {
                            //$el.find('.owl-carousel').css('max-width', '50%');
                            $el.find('.owl-carousel').css('max-width', '70%');
                            
                        } else if (arr.length < 2) {

                            if (EQ.Helpers.getDeviceSize() === 'small') {
                                $el.find('.owl-carousel').css('max-width', '75%');
                            } else {
                                $el.find('.owl-carousel').css('max-width', '35%');
                            }
                        }

                    } else {
                        str += '<a href="#" class="hero-cta">';
                        str += '    <span>';
                        str += '        <strong>Get Started</strong>';
                        str += '        <p>Your trainer is eager to workout with you</p>';
                        str += '    </span>';
                        str += '</a>';

                        destroyCarousel(); // there are no slides; therefore, no need for slideshow
                        $el.append(str);

                    }

                    // the bg image is really tall. Here we try to "clip it" (overflow it)
                    $el.on('owl.rendered', function () {
                        var padding = (EQ.Helpers.getDeviceSize() === 'small') ? 0 : 40;
                        var carouselHeight = $el.closest('.contents').height() + padding; //some extra padding
                        var options = $owl.data('owlCarousel');
                        var itemsSetting = options.options.items;
                        $el.closest('.carousel-hero').css('overflow', 'hidden').height(carouselHeight);

                        // align this damn carousel the ghetto way
                        if (arr.length === 1) {
                            $el.find('.icon-right-arrow').remove();
                            $el.find('.icon-left-arrow').remove();
                        } else if (arr.length < 4 && itemsSetting > 1) {

                            hideControls(data.sessions);

                        } else if (arr.length > 1 && itemsSetting === 1) {

                            showControls(data.sessions);

                        }
                    });

                    // continue adjusting carousel height to avoid long image gap
                    $(window).resize(function () {
                        $el.trigger('owl.rendered');
                    });

                    return str;
                }
            }
        };


        /**
         * getInventoryStatusLabel
         *
         * If a user has 0 sessions on their inventory, we give them a critical color indication; if
         * they have just one, we give them a warn indication; and if they have more than one we
         * display a default color status.
         *
         *  0 = error
         *  1 = warn
         *  2 = default
         *
         * @param levelNum Pass tier level
         * @returns {string}
         */
        function getInventoryStatusLabel(levelNum) {
            var level = '';

            if (levelNum === 0) {
                level = 0;
            } else if (levelNum < 4) {
                level = 1;
            } else if (levelNum > 3) {
                level = 2;
            }

            return level;
        }


        /**
         * enableControls
         *
         * To start with, we assume the controls are disabled. We enabled as soon as we
         * know that there is more than one item in the carousel. (Usually after the API
         * returns with the array, we check its length)
         *
         * @param items array of items we are going to render on the carousel
         */
        function enableControls(items) {
            if (items.length > 1) {
                $el.find('.icon-right-arrow').show('slow');
                $el.find('.icon-left-arrow').show('slow');
            } else {
                opts.navigation = false;
            }
        }


        /**
         *hideControls
         *
         * We're going to hide the controls when we have two or three items up on the screen
         * when the screen breaks into tablet and mobile we need to show the controls again
         * this function will hide the controls
         *
         * @param items array of items we are going to render on the carousel
         */
        function hideControls(items) {

            if (items.length > 1) {
                $el.find('.icon-right-arrow').css('visibility', 'hidden');
                $el.find('.icon-left-arrow').css('visibility', 'hidden');

            } else {
                opts.navigation = false;
            }
        }

        /**
         *showControls
         *
         * Lets show the controls when there is more than one item and we're only showing
         * one item at a time in tablet
         *
         *
         * @param items array of items we are going to render on the carousel
         */
        function showControls(items) {

            if (items.length > 1) {
                $el.find('.icon-right-arrow').css('visibility', 'visible');
                $el.find('.icon-left-arrow').css('visibility', 'visible');

            } else {
                opts.navigation = false;
            }
        }


        /**
         * destroyCarousel
         *
         * In some rare ocassions, depending on what the API returns, if the array return
         * does not have any items, we assume there is no slideshow to render and we render
         * something else instead and/or destroy this carousel
         */
        function destroyCarousel() {
            $el.empty();

        }


        /**
         * render
         *
         * At render time, we do a few things, first we hide the loading indicator; then
         * append the slides to the slideshow, and finally after a second, we destroy the
         * loading indicator.
         *
         * @todo move loading indicator to a global area and queue components instead
         * @param str
         */
        function render(str) {
            spinner.stop();

            $owl.append(str); // using append() instead of html() in case there are slides on already in it

            setTimeout(function () {
                $el.trigger('owl.rendered');
                spinner.stop();
            }, 1000);
        }


        /**
         * customDataSuccess
         *
         * This is the callback function for when the client side receives the JSON
         * back from the server.
         *
         * @private
         * @param data json object retrieved from the server
         */
        function customDataSuccess(data) {
            //console.warn('templates.selected :: ', templates.selected);
            if (templates.selected) {
                templates.views[templates.selected](data);
            } else {
                debug('[CAROUSEL CARDS] Error: no view defined');
            }
        }


        // no point to continue on if there are no slides
        if ($.trim($owl.html()) === '' && (!json || json === '')) {
            debug('[CAROUSEL CARDS] No slides in the carousel HTML nor any JSON provided to create some for you');
            return;
        }


        if (json) {
            opts.jsonPath = base + json;
            opts.jsonSuccess = customDataSuccess;
        }

        // if we pass this attribute assume it is a single slide carousel
        if ($el.attr('data-single-item')) {
            opts.singleItem = Boolean($el.attr('data-single-item'));
            //console.warn('!!!!!!!!!!!!!!! opts.singleItem', opts.singleItem);
            //console.log('data-view ::  ', $el.attr('data-view'));
            $el.addClass('single-item');
        } else {

            if (EQ.Helpers.getDeviceSize() === 'small') {
                opts.singleItem = true;
            } else {
                opts.singleItem = false;
            }
            //console.warn('opts.singleItem', opts.singleItem);
            //opts.items = 2;

        }





        // the upcoming sessions widget looks bad a small resolutions
        // if more than one slide so we just make it show one slide
        if (Modernizr.mq('only all and (max-width: 980px)')) {
 
            opts.setAsSingle = true;
            
        }


        // create carousel
        $owl.owlCarousel(opts);
        


        // trigger custom previous button
        $el.find('.icon-right-arrow').click(function (e) {
            e.preventDefault();
            $owl.trigger('owl.next');

        });


        // trigger custom next button
        $el.find('.icon-left-arrow').click(function (e) {
            e.preventDefault();
            $owl.trigger('owl.prev');

        });

    };

}(window.App));