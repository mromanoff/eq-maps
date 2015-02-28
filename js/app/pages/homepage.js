(function (global, App) {
    'use strict';

    var Home = App.Pages.Home = {},
        $body = $('body'),
        $win = $(global);

    Home.fitElement = {
        currentTop: 0,
        currentPage: 0,
        hideTimeout: undefined,
        isSupported: function () {
            return false; // Softfix to remove the parallax.
            
            // var width = $win.width(),
            //     height = $win.height();

            // return width === 320 && height === 460 || //iPhone 5 iOS 7
            //         width === 1024 && height === 672 || //iPad iOS 6 Landscape
            //         width === 1024 && height === 692 || //iPad iOS 7 Landscape
            //         width === 1024 && height === 691 || //iPad 2 iOS 7 Landscape
            //         width === 768 && height === 927 || //iPad 2 Portrait
            //         width === 768 && height === 928; //iPad 3+ Portrait
        },
        isTouch: function () {
            //TODO: Fix this to work on MS devices.
            return 'undefined' !== typeof document.documentElement.ontouchstart;
        },
        bind: function () {
            var that = this;
            $win.on('orientationchange', function () {
                if (Home.fitElement.isTouch() && Home.fitElement.isSupported()) {
                    that.touchSupport(that.isSupported());
                }

                //Remove active, animating and closed-nav class.
                that.$el.removeClass('animating');
                that.$children.removeClass('active');
                $('.more-button').removeClass('hidden scrolling');

                if (Home.fitElement.isSupported() === false) {
                    $body.removeClass('closed-nav');
                    $body.addClass('no-snap');
                } else {
                    $body.addClass('closed-nav');
                    $body.removeClass('no-snap');
                }

                //Scroll to the top of the page without animating and set the current page to 0.
                if (Home.fitElement.isTouch() && Home.fitElement.isSupported()) {
                    that.currentPage = 0;
                    that.setScrollTop(0);
                }
                

                $('.elevator a').removeClass('selected');
                $('.elevator a').eq(0).addClass('selected');

                //Resresh Stellar.
                if ($('.page-wrapper').data('plugin_stellar')) {
                    $('.page-wrapper').data('plugin_stellar').refresh();
                }

                //If not initialized, start stellar.
                if (Home.fitElement.isTouch() && Home.fitElement.isSupported()) {
                    if ($('.page-wrapper').data('plugin_stellar') === undefined) {
                        $('.page-wrapper').stellar({
                            horizontalScrolling: false,
                            scrollProperty: 'transform',
                            positionProperty: 'transform',
                            hideDistantElements: false
                        });
                    }
                }

            });

            this.$el.on('webkitTransitionEnd transitionend', function (evt) {
                if (evt.target === that.$el[0]) {
                    that.$el.removeClass('animating');
                    $('.more-button').removeClass('scrolling');

                    Home.fitElement.hideTimeout = setTimeout(function () {
                        $('.elevator').addClass('hide');
                    }, 2000);
                }
            });

            // #DPLAT-725
            $('nav.main .full-wrapper').on('touchend', function (evt) {
                evt.stopPropagation();
            }).on('touchmove', function (evt) {
                evt.preventDefault();
            });

            //Generate Elevator Buttons.
            var elevetorLength = this.$children.length - 1;
            for (var i = 0; i < elevetorLength; i++) {

                var $elevatorCircle = $('<a href="#" class="elevator-button" data-index="' + i + '"><span class="inner"></span></a>');

                $('.elevator').append($elevatorCircle);
            }
            $('.elevator a').eq(0).addClass('selected');

            // // Position Elevator
            // $('.elevator').css('top', ($(window).height() / 2) - $('.elevator').height() / 2);

            // // Position Elevator on Resize
            // $(window).on('resize', function () {
            //     $('.elevator').css('top', ($(window).height() / 2) - $('.elevator').height() / 2);
            // });

            // Bind Elevator Buttons (for Explore button and others)
            $('.elevator-trigger').on('click', this.elevator);
            $('.elevator-button').on('click', this.elevator);

            $('.more-button-desktop').on('click', this.elevator);

            // More Button
            $('.more-button').on('click', function () {
                if (Home.fitElement.currentPage < Home.fitElement.$children.length - 2) {
                    Home.fitElement.currentPage++;
                    Home.fitElement.goTo();
                }
            });

        },
        init: function (selector, childrenSelector) {
            this.$el = $(selector);
            this.$children = this.$el.find(childrenSelector);

            this.$children = this.$children.filter(function (i, e) {
                return $(e).find('.no-snap').length === 0;
            });

            this.bind();

            if (this.isSupported()) {
                this.touchSupport(true);
            }
        },
        getScrollTop: function ($el) {
            $el = $el || this.$el;
            var computedTransform = $el.css('transform');
            return (computedTransform !== 'none' ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[5], 10) * -1 : 0);
        },
        setScrollTop: function (n) {
            this.maxScrollTop = this.$el.height() - this.$children.eq(0).height();
            if (n < 1) {
                if (n >= -this.maxScrollTop) {
                    this.$el.css('transform', 'translate3d(0, ' + n + 'px, 0)');
                }
            } else {
                this.$el.css('transform', 'translate3d(0, 0, 0)');
            }
        },
        goNext: function () {
            // Last page check
            if (this.currentPage === this.$children.length - 1) {
                return false;
            }

            this.currentPage++;
            this.goTo();

            return true;
        },
        goPrev: function () {
            // First page check
            if (this.currentPage === 0) {
                return false;
            }

            this.currentPage--;
            this.goTo();

            return true;
        },
        goTo: function () {
            var $page = this.$children.eq(this.currentPage),
                $el = this.$el;

            if (this.currentPage) {
                $body.removeClass('closed-nav');
            } else {
                $body.addClass('closed-nav');
            }

            // Clear current timeout
            clearTimeout(this.hideTimeout);

            // Update Elevator
            var $elevatorLinks = $('.elevator a'),
                $elevatorCurrent = $('.elevator a.selected'),
                $elevator = $('.elevator');

            $elevatorCurrent.removeClass('selected');
            $elevatorLinks.eq(this.currentPage).addClass('selected');

            $elevator.removeClass('hide');

            if ($page.find('.carousel').first().hasClass('black') === true || $page.find('.rich-content').first().hasClass('black') === true) {
                $elevator.addClass('black');
            } else {
                $elevator.removeClass('black');
            }

            // Upadate More Button
            $('.more-button').addClass('scrolling');
            $('.more-button').removeClass('hidden');

            // Scroll
            $el.addClass('animating');
            this.$children.removeClass('active');
            $page.addClass('active');

            if ($page.data('template') !== 'Footer') {
                this.setScrollTop(-$page.position().top);
            } else {
                $elevator.addClass('hide');
                this.setScrollTop(-($el.height() - this.$children.eq(0).height()));
            }

            // Define when the More Button should dissapear.
            if (this.currentPage >= 1) {
                $('.more-button').addClass('hidden');
            }

        },
        elevator: function (e) {
            e.preventDefault();
            if (Home.fitElement.isSupported() === true) {
                $('.elevator a').removeClass('selected');
                $('.elevator a').eq($(this).data('index')).addClass('selected');
                Home.fitElement.currentPage = +$(this).data('index');
                Home.fitElement.goTo();
            } else {
                var pos = $('.page-snap').eq($(this).data('index')).offset().top - $('nav.main').height();
                $('body').animate({scrollTop: pos});
            }
        }
    };

    Home.fitElement.touchSupport = (function (that) {
        var EVENT_START = 'touchstart',
            EVENT_MOVE = 'touchmove',
            EVENT_END = 'touchend',
            element,
            elementY,
            startY,
            startX,
            isHorizontal = false,
            dx,
            dy;

        var onTouchStart = function (evt) {
            if ($(evt.target).closest('.no-snap').length === 0 || $(evt.target).hasClass('no-snap').length === 0) {
                var touch = evt.touches[0];

                if (startY || that.$el.is('.animating')) {
                    evt.preventDefault();
                } else {
                    startY = touch.pageY;
                    startX = touch.pageX;
                    elementY = that.getScrollTop();
                    element.addEventListener(EVENT_MOVE, onTouchMove, false);
                    element.addEventListener(EVENT_END, onTouchEnd, false);
                }
            }
        };

        var onTouchMove = function (evt) {
            if ($(evt.target).closest('.no-snap').length === 0 || $(evt.target).hasClass('no-snap').length === 0) {
                var touch = evt.touches[0];
                dy = touch.pageY - startY;
                dx = touch.pageX - startX;
                isHorizontal = Math.abs(dx) > Math.abs(dy);

                if (!isHorizontal) {
                    evt.preventDefault();
                    that.setScrollTop(dy - elementY);
                }
            }
        };

        var onTouchEnd = function (evt) {
            if ($(evt.target).closest('.no-snap').length === 0 || $(evt.target).hasClass('no-snap').length === 0) {
                if (!isHorizontal && Math.abs(dy) > 10) {
                    if (dy < 0) {
                        that.goNext();
                    } else if (dy > 0) {
                        that.goPrev();
                    }
                } else {
                    that.setScrollTop(-elementY);
                }
                dy = null;
                startY = null;
                isHorizontal = false;
                element.removeEventListener(EVENT_MOVE, onTouchMove, false);
                element.removeEventListener(EVENT_END, onTouchEnd, false);
            }

        };

        return function (isActive) {
            element = that.$el[0];

            if (isActive) {
                element.addEventListener(EVENT_START, onTouchStart, false);
                if (that.currentPage) {
                    that.goTo();
                } else {
                    $body.addClass('closed-nav');
                    $body.scrollTop(0);
                }
                $body.addClass('page-snap-enabled');
            } else {
                that.setScrollTop(0);
                that.currentPage = 0;
                $body.removeClass('page-snap-enabled closed-nav');
                return element.removeEventListener(EVENT_START, onTouchStart, false);
            }
        };
    } (Home.fitElement));

    Home.omnitCall = function () {
        $('.search-menu li a').on('click', function () {
            var hrefVal = this.href.split('/')[this.href.split('/').length - 1];
            if (hrefVal === 'search') {
                window.tagData.searchLink = window.tagData.searchLink || {};
                window.tagData.searchLink = {
                    type: 'findaclass',
                    value: ''
                };
                window.track('clickClassSearchLink', window.tagData.searchLink);
            } else if (hrefVal === 'bookabike') {
                window.tagData.searchLink = window.tagData.searchLink || {};
                window.tagData.searchLink = {
                    type: 'bike',
                    value: ''
                };
                window.track('clickClassSearchLink', window.tagData.searchLink);
            }
        });
    };

    Home.init = function () {
        // Set the Splash Height to the window height.
        if (Home.fitElement.isSupported() === false) {
            $('.home-splash').height($(window).height() - $('nav.main').height());
        }

        Home.omnitCall();

        Home.fitElement.init('.page-wrapper', '.page-snap');

        if (Home.fitElement.isTouch() && Home.fitElement.isSupported()) {
            $('.page-wrapper').stellar({
                horizontalScrolling: false,
                scrollProperty: 'transform',
                positionProperty: 'transform',
                hideDistantElements: false
            });

            var isHome = $('.page-snap').data('template') === 'HomePageTopParallax';
            if (isHome) {
                $('.dtm-homepagetopparallax').addClass('active');
            }
        }

    };

} (window, window.App));