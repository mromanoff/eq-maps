(function (App) {
    'use strict';
    /* global user, _ */

    App.Components.navigation = function ($el) {
        var handleUIWebView = function () {
            if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Version)/i.test(navigator.userAgent) && navigator.userAgent.indexOf('CriOS') === -1) {
                //assume we have one body element just in case
                $('body:first').addClass('uiwebview');
            }
        },
        linksContainer = $('.links-wrapper'),
        userLinks = $('.secondary-links', linksContainer),
        userInfo = $('.user', userLinks),
        userName = $('.user-name', userInfo),
        userImage = $('.user-image', userInfo),
        profileImage;

        if (user) {
            if (user.ProfilePictureUrl) {
                profileImage = user.ProfilePictureUrl;
                $('img', userImage).attr('src', profileImage).addClass('rounded');
            }
            userName.text(user.FirstName + ' ' + user.LastName);
        }

        userName.removeClass('hidden');
        userImage.removeClass('hidden');

        $('.menu-login.logged-in', $el).on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('member-dropdown-open');
            $('.member-dropdown.member-desktop', $el).slideToggle(300);
        });

        // On click outside of the menu
        $(document).on('click', function (e) {
            if ($(e.target).closest($('.menu-login.logged-in', $el)).length === 1) {
                return true;
            } else {
                $('.menu-login.logged-in', $el).removeClass('member-dropdown-open');
                $('.member-dropdown.member-desktop', $el).slideUp();
            }
        });


        // Lead Popup Event Binding
        if (!$('html').hasClass('lead-popup-event-attached')) {
            $(document).on('click', 'a[href]', function (e) {
                var $target = $(e.target);

                var href = $target.attr('href');
                href = href ? href.replace('/', '').replace('#', '') : '';
                href = $.trim(href);

                if (href === 'leadpopup') {
                    e.preventDefault();
                    e.stopPropagation();

                    $el.find('.icon-close').trigger('click');

                    App.Pages.Leads.PopupInit();
                }
            });

            $('#visitUs-btn').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $target = $(e.target);

                var href = $target.attr('href');
                href = href ? href.replace('/', '').replace('#', '') : '';
                href = $.trim(href);

                if (href === 'schedule-a-visit' && window.showLeadPopUp === 'True') {
                    App.Pages.Leads.PopupInit();
                } else if ($('#lead-page-wrapper').is(':visible')) {
                    App.Pages.Leads.common.scrollWindow(App.Pages.Leads.PAGE_LEAD);
                    App.Pages.Leads.PageInit();
                }
            });

            if ($('#lead-page-wrapper').is(':visible')) {
                App.Pages.Leads.PageInit();
            }
            
            $('html').addClass('lead-popup-event-attached');
        }


        $el.find('.menu').on('click', function (e) {
            // Fix for moving the background
            $('html').addClass('noscroll');

            e.preventDefault();

            $(this).toggleClass('is-hidden');
            $('nav.main-transparent .icon-close').toggleClass('is-hidden');

            $('nav.main').addClass('open-links');
        });

        $el.find('.icon-close').on('click', function (e) {
            $('html').removeClass('noscroll');

            e.preventDefault();

            $(this).toggleClass('is-hidden');
            $('nav.main-transparent .menu').toggleClass('is-hidden');

            $('nav.main').removeClass('open-links');

            $('body').off('touchmove');
        });

        $(window).on('resize', _.throttle(function () {
            $('html').removeClass('noscroll');

            $el.find('.icon-close').addClass('is-hidden');
            $('nav.main-transparent .menu').removeClass('is-hidden');

            $('nav.main').removeClass('open-links');

            $('body').off('touchmove');
        }, 1000));


        // On Scroll, make the nav translucent.
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $('nav.main').height()) {
                $('nav.main').addClass('active');
            } else {
                $('nav.main').removeClass('active');
            }
        });

        // fix for ipad position fixed on keyboard focus

        var isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
        $('input').on('focus', function () {
            if ($(window).width() <= 1024 && isIOS) {
                $('nav.main').css({ position: 'absolute', top: 0 });
            }
        });

        $('input').on('blur', function () {
            if ($(window).width() <= 1024 && isIOS) {
                $('nav.main').css({ position: 'fixed' });
            }
        });

        handleUIWebView();

    };


}(window.App));
