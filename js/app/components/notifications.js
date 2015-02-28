(function (global, App) {
    'use strict';

    /* global APIEndpoint, debug */

    var Backbone = global.Backbone,
        _ = global._;

    /**
    * Models
    */

    var Notification = Backbone.Model.extend({
        defaults: {
            description: '',
            type: 1
        }
    });

    /**
    * Collections
    */

    var NotificationsCollection = Backbone.Collection.extend({
        model: Notification,
        url: function () {
            var url = APIEndpoint + '/me/notifications?until=';
            return url;
        }
    });

    /**
    * Views Helpers
    */

    var NotificationSingleViewHelpers = {
        getColor: function () {
            return this.type === 1 ? 'red' : 'yellow';
        }
    };

    var NotificationMenuCounterSingleViewHelpers = Backbone.View.extend({
        el: '.full-wrapper .member-dropdown span.notification-count',
        updateNotificationCount: function (number) {
            var content = '';
            if (number !== 0) {
                content = '(' + number + ')';
            }
            this.$el.text(content);
        }
    });


    /**
    * Views
    */

    var NotificationListView = Backbone.View.extend({
        render: function () {
            var notificationMenuSingleView = new NotificationMenuCounterSingleViewHelpers(),
                notificationCounterView;

            notificationCounterView = new NotificationCounterSingleView({
                number: this.collection.length,
                menuViewCallback: (notificationMenuSingleView.updateNotificationCount).bind(notificationMenuSingleView)
            });
            notificationCounterView.render();

            this.collection.each(function (notification) {
                var notificationSingleView = new NotificationSingleView({
                    model: notification,
                    dismissCallback: (notificationCounterView.dismissNotification).bind(notificationCounterView)
                });
                this.$el.append(notificationSingleView.render().el);
            }, this);
            return this;
        }
    });

    var NotificationSingleView = Backbone.View.extend({
        template: _.template($('#notificationTemplate').html()),
        events: {
            'click a.close': 'dismiss'
        },
        initialize: function (options) {
            this.options = options || {};
        },
        getRenderData: function () {
            var data = this.model.toJSON();
            return _.extend(data, NotificationSingleViewHelpers);
        },
        render: function () {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        },
        dismiss: function (e) {
            var that = this;
            e.preventDefault();
            $.ajax({
                url: APIEndpoint + '/me/notifications/dismiss/' + this.model.get('id'),
                contentType: 'application/json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                }
            })
            .done(function (response) {
                debug('DISMISS', response);
                if (response) {
                    that.$el.find('.notification-container').addClass('closed');
                    that.options.dismissCallback();
                }
            })
            .fail(function () {
                debug('Server Error');
            });

        }
    });


    var NotificationCounterSingleView = Backbone.View.extend({
        el: '.full-wrapper .secondary-links span.notifications',
        initialize: function (options) {
            this.options = options || {};
        },
        dismissNotification: function () {
            this.options.number--;
            this.render();
        },
        render: function () {
            this.$el.text(this.options.number);
            if (this.options.number === 0) {
                this.$el.toggle();
            }
            this.options.menuViewCallback(this.options.number);

            return this;
        }
    });


    /**
    * Component Init.
    */

    App.Components.notifications = function ($el) {
        var notificationCollection = new NotificationsCollection();
        notificationCollection.fetch({
            'xhrFields': { 'withCredentials': true },
            'success': function (collection, response) {
                debug('[NOTIFICATIONS SERVICE OK]', response);
                var notificationListView = new NotificationListView({ collection: collection });
                $el.append(notificationListView.render().el);
            },
            'error': function () {
                debug('Server Error');
            }
        });
    };

} (window, window.App));