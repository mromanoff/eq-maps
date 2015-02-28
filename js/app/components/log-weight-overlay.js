(function (App) {
    'use strict';

    /*global EQ, Backbone, _, debug, APIEndpoint, user*/

    // Inject Overlay Template
    var overlayTemplate = '' +
        '<div class="automatic-calories-container">' +
            '<a href="#" class="icon-close close-overlay"></a>' +
            '<div class="personal-info-container">' +
                '<p>Please enter your current weight:</p>' +
                '<div class="module-container personal-info">' +
                    '<div class="loader"></div>' +
                '</div>' +
            '</div>' +
            '<button class="button box small black log-weight">Save changes</button>' +
            '<button class="button box small white cancel-weight">Cancel</button>' +
        '</div>';

    var profileInfoTemplate = '' +
            '<div class="half-container weight right single" data-value="<%= weight.weight %>">' +
                '<div class="info">' +
                    '<h3><%= weight.weight %><span class="suffix"><%= weight.weightUnit %></span></h3>' +
                    '<div class="empty hidden"><span></span></div>' +
                    '<span>Weight</span>' +
                '</div>' +
                '<div class="edit">' +
                    '<div class="input-container">' +
                        '<input type="text" name="weight" placeholder="<%= weight.weight %>" maxlength="4">' +
                        '<label class="suffix"><%= weight.weightUnit %></label>' +
                        '<span>Weight</span>' +
                    '</div>' +
                '</div>';

    App.Components['log-weight-overlay'] = function ($el) {
        $el.addClass('log-weight-overlay');

        var ProfileInfoView = Backbone.View.extend({
            events: {
                'keyup .weight input': 'numericInput'
            },
            template: _.template(profileInfoTemplate),
            numericInput: function (e) {
                $(e.currentTarget).val($(e.currentTarget).val().replace(/[^0-9\.]/g, ''));
            },
            editMode: function () {
                this.$el.find('.info').hide();
                this.$el.find('.edit').show();

                this.$el.find('.save-info').css('display', 'inline-block');
            },
            validateData: function (profile) {
                console.log(profile);

                if (profile.weight === null || profile.weight === 0 || profile.weight === '') {
                    this.$el.find('.weight .edit input').addClass('error');
                } else {
                    this.$el.find('.weight .edit input').removeClass('error');
                }

                return this.$el.find('.error').length === 0;

            },
            saveInfo: function (cb, cberror) {
                var self = this,
                    unit;

                unit = (this.savedData.height.heightUnit === 'in') ? 'Imperial' : 'Metric';

                var profile = {
                    weight: parseInt(self.$el.find('.weight input').val(), 10) || self.$el.find('.weight').data('value')
                };

                // Validate before sending
                if (self.validateData(profile) === true) {
                    // Saved data callback
                    if (cb && typeof cb === 'function') {
                        cb(profile); // Send profile to ACCE Enable callback

                        // Update saved profile data to lazily re render.
                        self.savedData.weight.weight = (profile.weight !== '') ? profile.weight : self.savedData.weight.weight;
                        
                        self.$el.find('.editable .info').show();
                        self.$el.find('.editable .edit').hide();
                        self.$el.find('.edit-info').css('display', 'inline-block');
                        self.$el.find('.save-info').hide();

                        self.render(self.savedData);
                    }
                } else {
                    console.log('error', cberror);
                    if (cberror && typeof cberror === 'function') {
                        cberror();
                    }
                }
            },
            initialize: function () {
                var self = this;
                this.listenTo(Backbone.Events, 'log-weight-overlay:save-info', function (cb, cberror) {
                    self.saveInfo(cb, cberror);
                });
            },
            render: function (data) {
                var self = this,
                    ENDPOINT = APIEndpoint + '/me',
                    loaderAndError;
                
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find('.loader'), {
                    errorTitle: 'Error'
                });

                self.$el.find('.half-container').remove();

                loaderAndError.showLoader();

                if (data) {
                    loaderAndError.hideLoader();
                    self.$el.prepend(self.template(data));

                    if (!self.savedData.weight.weight) {
                        self.$el.find('.weight .empty').removeClass('hidden');
                        self.$el.find('.weight h3').addClass('hidden');
                    }
                } else {
                    $.ajax({
                        type: 'GET',
                        url: ENDPOINT,
                        contentType: 'application/json',
                        xhrFields: { 'withCredentials': true },
                        dataType: 'json',
                        success: function (data) {
                            var profileImage;

                            self.savedData = data.profile;

                            debug('DATA LOADED', self.savedData);

                            if (user && user.FacebookId) {
                                profileImage = '//graph.facebook.com/' +
                                                user.FacebookId +
                                                '/picture?width=160&height=160';
                            } else if (self.savedData.profilePictureUrl) {
                                profileImage = self.savedData.profilePictureUrl;
                            }

                            loaderAndError.hideLoader();

                            self.$el.prepend(self.template(self.savedData));

                            //Show empty values and set defaults
                            if (!self.savedData.weight.weight) {
                                self.savedData.weight.weight = 0;
                                self.$el.find('.weight .empty').removeClass('hidden');
                                self.$el.find('.weight h3').addClass('hidden');
                                self.$el.find('.weight .edit input').attr('placeholder', '0');
                            }
                            self.$el.find('.edit-info').css('display', 'inline-block');

                            // Edit mode by default
                            self.editMode();

                            // Fire 'loaded' event.
                            self.trigger('loaded');

                        },
                        error: function (d) {
                            debug('server error', d.responseJSON);
                            loaderAndError.showError();
                        }
                    });
                }
            }
        });

        var OverlayView = Backbone.View.extend({
            template: _.template(overlayTemplate),
            events: {
                'click .close-overlay': 'closeView',
                'click .log-weight': 'logWeight',
                'click .cancel-weight': 'cancelWeight'
            },
            setCallback: function (cb) {
                this.overlayCallback = cb;
            },
            logWeight: function (e) {
                e.preventDefault();

                var self = this,
                    loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find('.log-weight'), {
                        errorTitle: 'Error saving settings.',
                        type: 'button'
                    });

                loaderAndError.showLoader();

                Backbone.Events.trigger('log-weight-overlay:save-info', function (profile) {

                    var profileData = {
                        'weight': profile.weight
                    };

                    EQ.Helpers.putService('/v1/me/profile', profileData).done(function () {
                        loaderAndError.hideLoader();
                        if (self.overlayCallback && typeof self.overlayCallback === 'function') {
                            self.overlayCallback('on');
                        }
                        Backbone.Events.trigger('log-weight-overlay:close');
                        window.location.reload();
                    }).fail(function () {
                        loaderAndError.showError();
                    });
                }, function () {
                    loaderAndError.hideLoader();
                });
            },
            cancelWeight: function (e) {
                e.preventDefault();
                var self = this;

                if (self.overlayCallback && typeof self.overlayCallback === 'function') {
                    self.overlayCallback('off');
                }
                Backbone.Events.trigger('log-weight-overlay:close');
            },
            enableSave: function () {
                this.$el.find('button').fadeIn();
            },
            closeView: function (e) {
                e.preventDefault();
                Backbone.Events.trigger('log-weight-overlay:close');
            },
            render: function () {
                var self = this;

                this.setElement(this.template({}));

                this.$el.find('button').hide();

                var profileInfoView = new ProfileInfoView({
                    el: this.$el.find('.personal-info')
                });

                profileInfoView.render();

                this.listenTo(this, 'remove', profileInfoView.remove);
                this.listenTo(profileInfoView, 'loaded', self.enableSave);

                return this;
            }
        });

        var overlayView = new OverlayView();

        Backbone.Events.on('log-weight-overlay:open', function (cb) {
            if (cb && typeof cb === 'function') {
                overlayView.setCallback(cb);
            }
            $el.html(overlayView.render().el);
            $el.addClass('open');
        });
        Backbone.Events.on('log-weight-overlay:close', function () {
            overlayView.remove();
            $el.removeClass('open');
        });

    };

}(window.App));