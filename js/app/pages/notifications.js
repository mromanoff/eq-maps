(function (global, App) {
    'use strict';

    /* global APIEndpoint, debug, Backbone, _, moment */

    App.Pages.Notifications = {};

    var Notifications = App.Pages.Notifications;


    /**
     * Models
     */

    var Notification = Backbone.Model.extend({
        defaults: {
            description: '',
            time: moment().format('h:hh A'),
            type: 0
        }
    });


    /**
     * Collections
     */

    var NotificationsCollection = Backbone.Collection.extend({
        model: Notification
    });


    /**
     * Views
     */

    var NotificationsListView = Backbone.View.extend({
        render: function () {
            var notificationCount = $('.notifications-container h2 .count', this.$el),
                notificationsList = $('.notifications', this.$el),
                notificationsGroupView;
                //listNotifications = [];

            notificationsGroupView = new NotificationsGroupView({ collection: this.collection });
/*

            this.collection.each(function (notificationGroup) {
                notificationsGroupView = new NotificationsGroupView({ collection: notificationGroup });
                listNotifications.push(notificationsGroupView.render().el);
            });
            notificationsList.prepend(listNotifications);
*/
            notificationsList.prepend(notificationsGroupView.render().el);

            notificationCount.text(this.collection.length);

            return this;
        }
    });

    var NotificationsGroupView = Backbone.View.extend({
        className: 'notification-group',
        template: _.template($('#notificationsGroupView').html()),
        render: function () {
            var that = this;

            this.$el.html(this.template({date: 'today'}));

            this.collection.each(function (notification) {
                var notificationItem = new NotificationSingleView({ model: notification });
                that.$el.find('.notification-list').append(notificationItem.render().el);
            });

            return this;
        }
    });

    var NotificationSingleView = Backbone.View.extend({
        tagName: 'li',
        className: 'notification',
        template: _.template($('#notificationSingleView').html()),
        render: function () {
            var type = this.model.get('type'),
                colorClass = (type === 1 ? 'red' : 'yellow'),
                time = moment(this.model.get('date')).format('h:hh A');

            this.model.set('time', time);

            this.$el.addClass(colorClass);

            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });


    Notifications.init = function () {
        var notificationsPage = $('.notifications-page'),
            endDate = moment().subtract('days', 2);

        $.ajax({
            type: 'GET',
            url: APIEndpoint + '/me/notifications?until=' + endDate.format('YYYY-MM-DD'),
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (notifications) {
                var notificationCollection,
                    notificationListView;

                debug('[NOTIFICATIONS SERVICE OK]', notifications);

                $.each(notifications, function (index, notification) {
                    if (moment().isSame(moment(notification.date).format('YYYY-MM-DD'))) {
                        console.log(index);
                    }
                    console.log(moment());
                    console.log(notification.date);
                });

                notificationCollection = new NotificationsCollection(notifications);

                notificationListView = new NotificationsListView({
                    collection: notificationCollection,
                    el: notificationsPage
                });

                notificationListView.render();

            },
            error: function (d) {
                debug('server error', d.responseJSON);
            }
        });

    };

} (window, window.App));