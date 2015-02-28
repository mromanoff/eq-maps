(function (App) {
    'use strict';


    /* global debug, Backbone, _, moment, FB */

    /**
    * Models
    */

    var FBmodalClassModel = Backbone.Model.extend({
        defaults: {
            classname: '',
            classinstructor: '',
            classdate: '',
            clubname: '',
            classstudio: ''
        }
    });

    /**
    * Views
    */

    var SocialSharingContainerView = Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
        },
        events: {
            'click .icon-facebook': 'fbSharing',
            'click .icon-twitter': 'twSharing'
        },
        fbSharing: function (e) {

            e.preventDefault();

            switch (this.options.type) {
            case 'referrals':
                //omniture call for Facebook share
                window.tagData.workoutAction = window.tagData.workoutAction || {};
                window.tagData.workoutAction = {
                    'action': 'share-start',
                    'method': 'fb'
                };
                if (this.options) {
                    if (this.options.type === 'join-class') {
                        window.tagData.workoutAction.type = 'join';
                    } else if (this.options.type === 'share-class' || this.options.type === 'booked-class') {
                        window.tagData.workoutAction.type = 'class';
                    } else if (this.options.type === 'booked-pt-session') {
                        window.tagData.workoutAction.type = 'pt';
                    }
                }
                window.track('shareAction', window.tagData.workoutAction);
                break;
            default:
                window.tagData = window.tagData || {};
                window._satellite = window._satellite || {};
                window.tagData.refer = {
                    'action': 'refer-start',
                    'method': 'fb'
                };
                if (typeof window._satellite.track === 'function') {
                    window._satellite.track('referShare');
                }
                break;
            }

            switch (this.options.fbMode) {
            case 'share-dialog':
                FB.ui({
                    method: 'feed',
                    link: this.options.linkurl,
                    caption: 'Equinox.com',
                    description: 'Join equinox at ' + this.options.linkurl
                },
                    function (response) {
                        if (response) {
                            console.log('Posting completed.');
                        } else {
                            console.log('Error while posting.');
                        }
                    }
                );
                break;
            case 'share-summary':
                FB.ui({
                    method: 'feed',
                    link: this.options.linkurl,
                    name: this.options.name,
                    picture: this.options.picture,
                    caption: this.options.name,
                    description: 'I just rode ' + this.options.distance + ' in an Equinox Cycling Class. #EQRide'
                },
                    function (response) {
                        if (response) {
                            console.log('Posting completed.');
                        } else {
                            console.log('Error while posting.');
                        }
                    }
                );
                break;
            case 'share-milestone':
                FB.ui({
                    method: 'feed',
                    link: this.options.linkurl,
                    name: this.options.name,
                    picture: this.options.picture,
                    caption: 'EQUINOX',
                    description: this.options.fbBlurbCopy
                },
                    function (response) {
                        if (response) {
                            console.log('Posting completed.');
                        } else {
                            console.log('Error while posting.');
                        }
                    }
                );
                break;
            default:
                console.log('show dialog');
                if (!this.facebookSharingModalView) {
                    this.getToken(function (token) {
                        debug('FBT:', token, this.options);

                        this.facebookSharingModalView = new FBSharingModalView({
                            model: new FBmodalClassModel(this.options),
                            type: this.options.type
                        });
                        $('body').prepend(this.facebookSharingModalView.render().el);
                    }.bind(this));
                } else {
                    this.facebookSharingModalView.showModal();
                }
                break;
            }
        },
        getToken: function (callback) {
            FB.login(function (response) {
                if (response.status === 'connected') {
                    callback(response.authResponse.accessToken);
                }
            }, {
                scope: 'email,user_likes,publish_actions,user_friends'
            });
        },
        twSharing: function (e) {
            // TODO the twitterCases object maybe must be created on another place outside this method
            e.preventDefault();
            var twText,
                TwitterURL,
                twClassDate = moment(this.options.classdate).format('MMMM DD [at] h:mma'),
                twitterCases = {
                    'join': 'I just joined @Equinox ' + this.options.clubname + '! ' + this.options.linkurl + ' #EquinoxMadeMeDoIt',
                    'share-class': 'Check out ' + this.options.classname + ' at @Equinox ' + this.options.clubname + ' on ' + twClassDate + ' ' + this.options.linkurl + ' #EquinoxMadeMeDoIt',
                    'booked-class': 'I booked ' + this.options.classname + ' at @Equinox ' + this.options.clubname + ' on ' + twClassDate + ' ' + this.options.linkurl + ' #EquinoxMadeMeDoIt',
                    'checked-class': 'I’m at ' + this.options.classname + ' at @Equinox ' + this.options.clubname + '! ' + this.options.linkurl + ' #EquinoxMadeMeDoIt',
                    'booked-pt-session': 'I booked ' + this.options.classname + ' at @Equinox ' + this.options.clubname + ' on ' + twClassDate + ' ' + this.options.linkurl + ' #EquinoxMadeMeDoIt',
                    'referrals': this.options.sharecopy + ' ' + this.options.linkurl,
                    'share-summary': this.options.twCopy,
                    'share-milestone': this.options.twCopy + ' ' + this.options.linkurl
                };

            twText = twitterCases[this.options.type];
            TwitterURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(twText) + '&url=' + encodeURI(this.linkUrl);
            window.open(TwitterURL, 'twitter_share', 'location=no,menubar=no,scrollbars=no,toolbar=no,width=500px,height=240px');

            //omniture call for twitter share
            if (this.options.type !== 'referrals') {
                window.tagData.workoutAction = window.tagData.workoutAction || {};
                window.tagData.workoutAction = {
                    'action': 'share-start',
                    'method': 'twitter'
                };
                if (this.options) {
                    if (this.options.type === 'join-class') {
                        window.tagData.workoutAction.type = 'join';
                    } else if (this.options.type === 'share-class' || this.options.type === 'booked-class') {
                        window.tagData.workoutAction.type = 'class';
                    } else if (this.options.type === 'booked-pt-session') {
                        window.tagData.workoutAction.type = 'pt';
                    }
                }
                window.track('shareAction', window.tagData.workoutAction);
            } else {
                window.tagData = window.tagData || {};
                window._satellite = window._satellite || {};
                window.tagData.refer = {
                    'action': 'refer-start',
                    'method': 'twitter'
                };
                if (typeof window._satellite.track === 'function') {
                    window._satellite.track('referShare');
                }
            }
        },
        render: function () {
            debug('render social sharing');

            // TODO add this hidden to the dom or css
            // this.$el.find('.icon-facebook').addClass('hidden');

            if (this.options.type !== 'referrals') {
                this.options.linkurl = window.location.protocol + '//' + window.location.host + this.options.linkurl;
            }

            // On SDK Initiated
            App.Events.on('fbsdk:loaded', function () {
                // show button only if fb api is ready
                debug('FB READYYYYYYY');
                // that.$el.find('.icon-facebook').removeClass('hidden');
            });

            // Force event delegation?
            this.delegateEvents();

            return this;
        }
    });

    var FBSharingModalView = Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
            this.showModal();

        },
        model: FBmodalClassModel,
        template: _.template($('#fbSharingModalTemplate').html()),
        events: {
            'click .icon-close': 'hideModal',
            'submit form': 'share'
        },
        hideModal: function (e) {
            if (e) {
                e.preventDefault();
            }
            this.$el.addClass('hidden');
        },
        showModal: function () {
            this.$el.removeClass('hidden');
            // also clear the textbox
            this.$el.find('textarea').val('');
        },
        share: function (e) {
            e.preventDefault();
            var that = this,
                fbObject,
                fbEndPoint,
				textAreaVal = that.$el.find('textarea').val(),
                model = that.options.model,
                objectSharedWithFacebook = {},
                fbCases = {
                    'join-class': {
                        //'action': 'share',
                        'action': 'join',
                        'objectName': 'class'
                    },
                    'share-class': {
                        'action': 'share',
                        'objectName': 'class'
                    },
                    'booked-class': {
                        'action': 'book',
                        'objectName': 'class'
                    },
                    'checked-class': {
                        'action': 'checkin',
                        'objectName': 'class'
                    },
                    'booked-pt-session': {
                        'action': 'book',
                        'objectName': 'pt_session'
                    },
                    'share-summary': {
                        'action': 'share',
                        'objectName': 'summary'
                    }
                };

            if (this.options) {
                if (this.options.type === 'join') {
                    this.options.type = 'join-class';
                }
            }

            var fbObjectName = fbCases[this.options.type].objectName,
                fbActionName = fbCases[this.options.type].action;

            //todo add image to the share module
            fbObject = {
                'description': model.get('clubname'),
                'image': this.$el.find('img')[0].src,
                'title': model.get('classname'),
                'url': model.get('linkurl'),
                'type': window.EQ.social.namespace + ':' + fbObjectName
            };

            fbEndPoint = window.EQ.social.namespace + ':' + fbActionName;

            //this could use some rethinking
            // 
            objectSharedWithFacebook[fbObjectName] = fbObject;
            objectSharedWithFacebook['fb:explicitly_shared'] = true;
            if (textAreaVal !== '') {
                objectSharedWithFacebook.message = textAreaVal;
            }

            console.log('about to push', fbEndPoint, objectSharedWithFacebook);
            FB.api(
                'me/' + fbEndPoint,
                'post',
                objectSharedWithFacebook,
                function (response) {
                    // handle the response
                    debug('RESPONSE', response);
                    that.hideModal.call(that);
                }
            );
            ////omniture call for Facebook share
            //window.tagData.workoutAction = window.tagData.workoutAction || {};
            //window.tagData.workoutAction = {
            //    'action': 'share-start',
            //    'method': 'fb'
            //};
            //if (this.options) {
            //    if (this.options.type === 'join-class') {
            //        window.tagData.workoutAction.type = 'join';
            //    } else if (this.options.type === 'share-class' || this.options.type === 'booked-class') {
            //        window.tagData.workoutAction.type = 'class';
            //    } else if (this.options.type === 'booked-pt-session') {
            //        window.tagData.workoutAction.type = 'pt';
            //    }
            //}
            //window.track('shareAction', window.tagData.workoutAction);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    /**
    * Component Init.
    */

    var SocialSharing = {};

    SocialSharing.init = function ($el, options) {
        var data = _.extend(options, { el: $el });
        console.log(data);
        var socialSharingContainerView = new SocialSharingContainerView(data);
        socialSharingContainerView.render();
    };

    /**
    * Component Init.
    */

    App.Components.share = function ($el, options) {
        SocialSharing.init($el, options);
    };

}(window.App));