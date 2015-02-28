define(function (require, exports, module) {
    'use strict';

    var Forms = require('backbone.forms');
    var DateSelectTemplate = require('text!core/templates/forms/date_select.tpl');
    var Core = require('core/app');

    /**
     * Expiration Date Editor
     *
     * turns our custom date select elements into Backbone-form friendly selects
     *
     * @public
     */
    Backbone.Form.editors.ExpirationDate = Backbone.Form.editors.Date.extend({
        events: {
            'change': 'updateFancySelect'
        },

        /**
         * updateFancySelect
         *
         * Update both, the fake dropdown and the hidden input field (the one
         * the server is actually expecting) to the new set value of the real
         * dropdown
         */
        updateFancySelect: function() {
            var $month = this.$month.find('option:selected');
            var $year  = this.$year.find('option:selected');
            var $date  = this.$date.find('option:selected');
            var date   = new Date($year.val(), $month.val(), $date.val());
            var value  = this.formatDate(date);

            this.$date.prev('.option').text($date.text());
            this.$month.prev('.option').text($month.text());
            this.$year.prev('.option').text($year.text());

            // update hidden input value
            $('#'+this.id).val(value);

            this.model.set(this.key, value);
        },

        /**
         * setDefaultValues
         *
         * Sets the fake dropdown text as well as set the model to the new date
         */
        setDefaultValues: function() {
            var $date = $( this.$date.find('option')[0] );
            var $month = $( this.$month.find('option')[0] );
            var $year  = $( this.$year.find('option')[0] );
            var date   = new Date($year.val(), $month.val());
            var value  = this.formatDate(date);

            if(this.$date.val()) {
                this.$date.prev('.option').text( $date.text() );
            }

            if(this.$month.val()) {
                this.$month.prev('.option').text( $month.text() );
            }

            if(this.$year.val()) {
                this.$year.prev('.option').text( $year.val() );
            }

            this.model.set(this.key, value);
        },

        /**
         * formatDate
         *
         * Format date as ISO8601 which is what the server is expecting
         *
         * @param date
         * @returns {*}
         */
        formatDate: function(date) {
            return Core.utils.jsDateToISO8601(date.toString());
        },

        /**
         * render
         *
         * Eh, something something, inject hidden input field then, call
         * the setDefaultValues to update the fake dropdown.
         *
         * @returns {Backbone.Form.editors.ExpirationDate}
         */
        render: function() {
            var value, date,
                options = this.options,
                schema = this.schema;

            if (typeof options.schema.showMonthNames !== 'undefined') {
                options.showMonthNames = options.schema.showMonthNames;
            } else {
                console.log('using default showMonthName');
            }

            var datesOptions = _.map(_.range(1, 32), function(date) {
                return '<option value="'+date+'">' + date + '</option>';
            });
console.log('options', options)
            var monthsOptions = _.map(_.range(0, 12), function(month) {
                var value = (options.showMonthNames)
                    ? options.monthNames[month]
                    : (month + 1);

                return '<option value="'+month+'">' + value + '</option>';
            });

            var yearRange = (schema.yearStart < schema.yearEnd)
                ? _.range(schema.yearStart, schema.yearEnd + 1)
                : _.range(schema.yearStart, schema.yearEnd - 1, -1);

            var yearsOptions = _.map(yearRange, function(year) {
                return '<option value="'+year+'">' + year + '</option>';
            });

            //Render the selects
            var $el = $($.trim(this.template({
                dates: datesOptions.join(''),
                months: monthsOptions.join(''),
                years: yearsOptions.join('')
            })));

            //Store references to selects
            this.$date = $el.find('[data-type="date"]');
            this.$month = $el.find('[data-type="month"]');
            this.$year = $el.find('[data-type="year"]');

            var date  = new Date(this.$year.val(), this.$month.val());
            var value = this.formatDate(date);

            //Create the hidden field to store values in case POSTed to server
            this.$hidden = $('<input type="hidden" name="'+this.key+'" value="'+value+'" />');

            $el.append(this.$hidden);

            if(options.schema.showDays) {
                $el.find('.date').show()
            }

            //Remove the wrapper tag
            this.setElement($el);

            this.$el.find('.fancy-select').addClass(this.options.schema.theme || 'white');

            this.$el.find('input:hidden').attr('id', this.id);

            if (this.hasFocus) this.trigger('blur', this);

            this.setDefaultValues();

            return this;
        },
    }, {
        template: _.template(DateSelectTemplate, null, Backbone.Form.templateSettings)
    });

});