(function (global, App) {
    'use strict';

    /* global APIEndpoint, debug, Backbone, _, ZeroClipboard, EQ */

    /**
     * Models
     */

    var Link = Backbone.Model.extend({
        defaults: {
            url : ''
        }
    });

    var Friend = Backbone.Model.extend({
        defaults: {
            empty: false,
            firstName: '',
            lastName: '',
            earned: 0,
            imageUrl: '',
            image: {
                url: '',
                fbID: ''
            }
        }
    });

    var Referred = Backbone.Model.extend({
        defaults: {
            firstName: '',
            lastName: '',
            statusCode: 'invited'
        }
    });


    /**
     * Collections
     */

    var FriendsCollection = Backbone.Collection.extend({
        model: Friend
    });

    var ReferredCollection = Backbone.Collection.extend({
        model: Referred
    });


    /**
     * Views
     */

    var ReferAFriendView = Backbone.View.extend({
        el: '.refer-friend .share',
        initialize: function (options) {
            this.options = options || {};
        },
        render: function () {
            var referByEmail,
                referByLink;

            App.loadComponent('share',
                this.$el.find('.icons'),
                {
                    'type': 'referrals',
                    'fbMode': 'share-dialog',
                    'linkurl': this.model.get('url'),
                    'sharecopy': this.$el.data('sharecopy')
                }
            );

            referByEmail = new ReferByEmail({
                ref: $('.icon-email', this.$el)
            });
            referByLink = new ReferByLink({
                model: this.model,
                ref: $('.icon-chain', this.$el)
            });

            referByLink.render();

            $('.icon-email', this.$el).on('click', function () {

                if (!$('.email-a-friend').is(':visible')) {
                    window.tagData = window.tagData || {};
                    window._satellite = window._satellite || {};
                    window.tagData.refer = {
                        'action': 'refer-start',
                        'method': 'email'
                    };
                    if (typeof window._satellite.track === 'function') {
                        window._satellite.track('referShare');
                    }
                }
                if (referByLink.options.lock) {
                    referByLink.toggle(this);
                }
                referByEmail.toggle(this);
            });
            $('.icon-chain', this.$el).on('click', function () {
                window.tagData = window.tagData || {};
                window._satellite = window._satellite || {};
                window.tagData.refer = {
                    'action': 'refer-start',
                    'method': 'url'
                };
                if (typeof window._satellite.track === 'function') {
                    window._satellite.track('referShare');
                }
                if (referByEmail.options.lock) {
                    referByEmail.toggle(this);
                }
                referByLink.toggle(this);
            });

            return this;
        }
    });

    var ReferByEmail  = Backbone.View.extend({
        el: '.email-a-friend',
        events: {
            'click .icon-close': 'toggle',
            'click #submit-button': 'send'
        },
        initialize: function (options) {
            this.options = options || {};
            this.options.lock = false;
        },
        toggle: function () {
            this.$el.toggle();
            this.options.lock = !this.options.lock;
            $(this.options.ref).toggleClass('active');
            $('.thank-you').addClass('hidden');
            $('.email-a-friend-main').removeClass('hidden');
            $('.is-error').addClass('hidden');
        },
        send: function (e) {
            e.preventDefault();
            var referalForm = $('form', this.$el),
                self = this;
            if (referalForm.data('publicMethods').isValid()) {
                referalForm.data('publicMethods').sendAjaxRequest({
                    'firstName': 'first-name',
                    'lastName': 'last-name',
                    'email': 'email'
                },
                function (data) {
                    debug('FORM RESPONSE', data);
                    $('.email-a-friend-main').addClass('hidden');
                    $('.email-a-friend-inputs').removeClass('hidden');

                    $('#first-name', self.$el).val('');
                    $('#last-name', self.$el).val('');
                    $('#email', self.$el).val('');
                    $('.thank-you').removeClass('hidden');
                    $('.email-a-friend-main').addClass('hidden');

                    window.tagData.refer = {
                        'action': 'refer-complete',
                        'method': 'email'
                    };
                    if (typeof window._satellite.track === 'function') {
                        window._satellite.track('referShare');
                    }

                    Referrals.init('', true);
                });
            }

        },
        render: function () {
            return this;
        }
    });

    var ReferByLink  = Backbone.View.extend({
        el: '.share-link',
        initialize: function (options) {
            this.options = options || {};
            this.options.lock = false;
        },
        toggle: function () {
            this.$el.toggle();
            this.options.lock = !this.options.lock;
            $(this.options.ref).toggleClass('active');
        },
        render: function () {
            var url = this.model.get('url'),
                zClient;

            $('.link', this.$el).text(url);
            $('.link', this.$el).attr('data-clipboard-text', url);

            zClient = new ZeroClipboard($('.link', this.$el));

            return this;
        }
    });

    var FriendsView = Backbone.View.extend({
        render: function () {
            var count = 0,
                friends = [],
                maxItems = 5;
                //earned = 0;

            this.$el.html('');
            console.log('collection', this.collection);
            this.collection.each(function (friend) {
                if (count < maxItems) {
                    var friendsSingleView;
                    //earned += friend.get('earned');
                    //friend.set('earned', earned);
                    friendsSingleView = new FriendsSingleView({ model: friend });
                    friends.push(friendsSingleView.render().el);
                }
                count++;
            }, this);

            while (count < maxItems) {
                var emptyModel,
                    emptySingleView;

                emptyModel = new Friend({ empty: true, counter: count + 1 });
                emptySingleView = new FriendsSingleView({ model: emptyModel });
                friends.push(emptySingleView.render().el);
                count++;
            }
            console.log(friends);
            this.$el.append(friends);

            return this;
        }
    });

    var FriendsSingleView = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#referralFriendTemplate').html()),
        render: function () {
            var imgUrl,
                image = this.model.get('image');
            imgUrl = 'https://graph.facebook.com/' + (image.fbID === null ? '' : image.fbID) + '/picture?type=small';
            this.model.set('imageUrl', imgUrl);
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

    var ReferralsView = Backbone.View.extend({
        render: function () {
            var referrals = [],
                noReferralsMsg = $('.no-referred-msg', this.$el).removeClass('hidden');

            this.$el.html('');
            this.collection.each(function (referral) {
                var referalsSingleView = new ReferalsSingleView({ model: referral });
                referrals.push(referalsSingleView.render().el);
            }, this);

            if (referrals.length === 0) {
                referrals.push(noReferralsMsg);
            }

            this.$el.append(referrals);

            return this;
        }
    });

    var ReferalsSingleView = Backbone.View.extend({
        tagName: 'li',
        render: function () {
            var fullName = this.model.get('firstName') + ' ' + this.model.get('lastName'),
                status = this.model.get('statusCode'),
                nameEl = $(document.createElement('strong'));

            nameEl.text(fullName);

            this.$el.append(nameEl).append(' (' + status + ')');

            return this;
        }
    });

    var Referrals = {};

    Referrals.init = function ($el, update) {
        var self = this,
            link,
            friendsCollection,
            referredCollection,
            referAFriendView,
            friendsView,
            referralsView,
            loaders;

        debug('INIT REFERRALS');


        update = update || false;

        if (!update) {
            self.el = $el;

            // Init currency component
            App.loadComponent('local-currency', $el.find('span.currency'));

            loaders = EQ.Helpers.loaderAndErrorHandler(self.el.find('.loader-container'));
            loaders.showLoader();
        }

        $.ajax(APIEndpoint + '/me/referrals', {
            type: 'GET',
            xhrFields: {
                withCredentials: true
            }
        })
        .done(function (data) {
            if (!update) {
                loaders.hideLoader();
            }

            friendsCollection = new FriendsCollection(data.friends);
            referredCollection = new ReferredCollection(data.referred);


            friendsView = new FriendsView({
                collection: friendsCollection,
                el: self.el.find('.invited-friends')
            });
            referralsView = new ReferralsView({
                collection: referredCollection,
                el: self.el.find('.referred-friends')
            });

            friendsView.render();
            referralsView.render();


            if (!update) {
                link = new Link({ url: data.referredUrl });
                referAFriendView = new ReferAFriendView({ model: link });

                referAFriendView.render();
            }
        })
        .fail(function () {
            debug('Server Error');
            if (!update) {
                loaders.showError();
            }
        });
    };


    /**
     * Component Init
     */

    App.Components.referrals = function ($el) {
        Referrals.init($el);
    };

} (window, window.App));