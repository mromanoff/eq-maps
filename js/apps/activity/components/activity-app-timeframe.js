define(function(require, exports, module){
    "use strict";
    var ActivityAppTimeframe = function( $elementToAppendTo, options) {

        var DateSelector = require('components/date-selector');

        /**
        * Views
        */
        var activityAppTimeframeView = Backbone.View.extend({
            className: 'activity-app-timeframe-select',
            template: _.template($('#activityAppTimeframe').html()),
            events: {
                'click .addWeightButton': 'openWeightOverlay'
            },
            initialize: function (options) {
                this.options = options || {};
                this.dateSelectors = {};
                this.currentMonthAndYear = moment().format('YYYY/M');
                this.currentYear = moment().format('YYYY');
                this.periodType = 'month'
            },
            render: function () {
                this.$el.html(this.template());
                this.createDateSelector('month');
                this.createDateSelector('year');
                this.selectPeriodType(this.periodType, true);

                return this;
            },
            openWeightOverlay: function (e) {
                e.preventDefault();

                Backbone.Events.trigger('log-weight-overlay:open');
            },
            createDateSelector: function (type) {
                var $dateSelector = this.$el.find('.' + type + '.dateSelectorBox'),
                    date_selector,
                    self = this,
                    values = [],
                    currentYearOnLoop = "";

                var thisYear = moment().year();

                if (type === 'year') {
                    for (var y = thisYear; y >= 2012 && y >= thisYear - 5; y--) {
                        values.push({ value: y, name: y, selected: y == self.currentYear });
                    }
                } else {
                    // Create month array to populate the month selector
                    for (var date = moment(); date.format('YYYY') > 2011; date.add(-1, 'M')) {
                        var month = date.month() + 1;
                        var value = date.format('YYYY/M');

                        if (currentYearOnLoop !== date.format('YYYY')) {
                            // If it is a new year, add to the selector values as a separator
                            currentYearOnLoop = date.format('YYYY');
                            values.push({
                                value: '',
                                name: currentYearOnLoop,
                                isSeparator: true
                            });
                        }

                        values.push({
                            value: value,
                            name: date.format('MMMM'),
                            selected: value == self.currentMonthAndYear
                        });
                    };
                }

                // Create date selector
                date_selector = new DateSelector($dateSelector, {
                    type: type,
                    valuesToShow: values,
                    initialYear: new Date().getYear(),
                    onDateSelectedCallback: function(d) {
                        self.updateCurrentDate(d, type);
                    },
                    disabledCallback: function (typeClicked) {
                        self.selectPeriodType(typeClicked);
                    }
                });

                this.dateSelectors[type] = date_selector;
            },
            selectPeriodType: function (type, avoidCallback) {
                // first disable all selectors
                this.dateSelectors['month'].disable();
                this.dateSelectors['year'].disable();
                this.dateSelectors[type].enable();
                !avoidCallback && this.options.changePeriodTypeCallback && this.options.changePeriodTypeCallback(type, type == 'year' ? this.currentYear : this.currentMonthAndYear);
            },
            updateCurrentDate: function (d, type, avoidCallback) {
                var newDate;

                if (type === 'year') {
                    var dateParts = this.currentMonthAndYear.split('/'),
                        currentMonth = dateParts[1];

                    if (parseInt(this.currentYear, 10) !== parseInt(d, 10)) {
                        this.currentYear = d.toString();
                        this.currentMonthAndYear = this.currentYear + '/' + currentMonth;
                        this.dateSelectors['month'].destroy();
                        this.createDateSelector('month');
                        //this.selectPeriodType(type);
                    }

                    newDate = moment(currentMonth + '/1/' + this.currentYear);

                } else {
                    newDate = moment(d.split('/')[0] + '/' + d.split('/')[1] + '/1');
                }

                !avoidCallback && this.options.selectedDateCallback && this.options.selectedDateCallback(newDate, type);
            },
            updateBoxesVisibility: function (type, pageType) {
                var $yearBox = this.$el.find('.year.dateSelectorBox'),
                    $addActivityButton = this.$el.find('.addActivityButton'),
                    $addWeightButton = this.$el.find('.addWeightButton');

                $yearBox.toggleClass('hidden', type === 'month');

                switch (pageType) {
                    case 'WORKOUTS' :
                        $addActivityButton.removeClass('hidden');
                        $addWeightButton.addClass('hidden');
                        break;
                    case 'WEIGHT' :
                        $addWeightButton.removeClass('hidden');
                        $addActivityButton.addClass('hidden');
                        break;
                    default:
                        $addActivityButton.addClass('hidden');
                        $addWeightButton.addClass('hidden');
                        break;
                }
            },
            setDate: function (date, periodType) {
                if (periodType === 'year') {
                    this.dateSelectors['year'].setDate(date.format('YYYY'));
                } else {
                    this.dateSelectors['month'].setDate(date.format('YYYY/M'));
                }
            },
            close: function () {
                this.remove();
                delete this.$el;
                delete this.el;
            }
        });

        /**
        * Render module and return public interface
        */
        var activityAppTimeframeComponent = new activityAppTimeframeView(options);
        $elementToAppendTo.append(activityAppTimeframeComponent.render().el);

        var api = {
            'destroy' : function () {
                activityAppTimeframeComponent.close();
            },
            'updateBoxesVisibility': function (type, pageType) {
                activityAppTimeframeComponent.updateBoxesVisibility(type, pageType);
            },
            'setDate': function (date, periodType) {
                activityAppTimeframeComponent.setDate(date, periodType);
            },
            'getElement': function () {
                return activityAppTimeframeComponent.$el;
            },
            'selectPeriodType': function (type, avoidCallback) {
                activityAppTimeframeComponent.selectPeriodType(type, avoidCallback);
            }
        };

        return api;
    };

    module.exports = ActivityAppTimeframe;
});