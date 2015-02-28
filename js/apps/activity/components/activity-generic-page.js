define(function(require, exports, module){
    "use strict";

    if (!window.Backbone) require('backbone');

    var ActivityGenericPage = Backbone.View.extend({
            initialize: function (options) {
                this.options = options || {};
            },
            render: function() {
                $('#activity-app-page-list').hide();
                this.changePeriodPage(this.options.currentPeriod);
            },
            changePeriodPage: function (type) {
                this.destroyAllComponents();
                type === 'month' ? this.loadMonthComponents(): this.loadYearComponents();
            },
            close: function () {
                this.destroyAllComponents();
            },
            updateDate: function (date) {
                // If the date is a single year, like '2014' we need to add a month to complete the
                // format YYYY/MM
                if (date.indexOf('/') === -1) {
                    date = date + '/1';
                }

                // we add the 1 because the date coming has format YYYY/MM
                this.options.date = moment(date + '/1');
            }
        });

    module.exports = ActivityGenericPage;
});