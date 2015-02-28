define(function(require, exports, module){
	"use strict";
	var DateSelector = function($element, options) {
		var $dom = $element,
			$option,
			$selected,
			$current,
			$overlay,
			api,
			DateSelectorView,
			date_selector,
			option_open = false,
			current_date = options.currentDate || moment(),
			type = options.type || '',
			valuesToShow = options.valuesToShow || [],
			on_date_selected = options.onDateSelectedCallback || [],
			disabled_callback = options.disabledCallback || [],
			currentYearToShow = options.initialYear || '',
			first_activity = moment().startOf('month').subtract(1, 'year'),
            disabled_label = options.type,
			today_date = moment();

		/**
	    * Views
	    */
		DateSelectorView = Backbone.View.extend({
			className: 'dateSelector',
			template: _.template($('#dateSelector').html()),
			render: function () {
				this.$el.html(this.template());
            	return this;
			},
			enable: function () {
				this.$el.removeClass('disabled');
			},
			disable: function () {
				this.$el.addClass('disabled');
			},
			isDisabled: function () {
				return this.$el.hasClass('disabled');
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			}
		});

		var init = function() {
			render.init();
			render.date();
			render.option_drawer();
			$selected = $option.find('li a[data-date="' + current_date.clone().startOf('month') + '"]');
			$selected.addClass('selected');
			$option.on('click', 'li a', events.date_selected);
			$dom.find('.timeframe-select-current').click(events.toggle_options);
			$overlay.click(events.toggle_options);
		};
		
		var render = {
			init : function() {

				date_selector = new DateSelectorView();
				$dom.append(date_selector.render().el);

				$overlay = $('<div class="timeframe-select-overlay"></div>');

				$dom.after($overlay).find('.timeframe-select-current').append('<div class="disabled-label">' + disabled_label + '</div>');
				$current = $dom.find('.timeframe-select-current-name');
				$option = $dom.find('.timeframe-select-options');
			},
			date : function(str) {
                $current.text(str || utils.get_date_title(current_date));
			},
			option_drawer : function() {
				if (!valuesToShow) {
					var year = first_activity.format('YYYY'),
					curr_date = first_activity.clone().startOf('month'),
					max_date = today_date.endOf('month'),
					format;
					do {
						$option.prepend( render.option_drawer_item(curr_date) );
						curr_date.add('M', 1);
					} while (curr_date.isBefore(max_date));
				} else {
					_.each(valuesToShow, function (item) {
						if (item.selected) {
							render.date(item.name);
						}
						$option.append( render.custom_option_drawer_item(item) );
					});
				}
			},
			option_drawer_item : function(d) {
				return '<li class="timeframe-select-option"><a href="javascript:;" data-date="' + d.valueOf() + '">' + utils.get_date_title(d) + '</a></li>';
			},
			custom_option_drawer_item : function(item) {
				if (item.isSeparator) {
					return '<li class="timeframe-select-option separator">' + item.name + '</li>';
				} else {
					return '<li class="timeframe-select-option"><a href="javascript:;" class="' + (item.selected ? 'selected' : '') + '" data-value="'+ item.value +'">' + item.name + '</a></li>';
				}
			}
		};
		
		var events = {
			date_selected : function(e) {
				$selected = $(this);
				$selected.parent().siblings().find('a').removeClass('selected');
				$selected.addClass('selected');

				current_date = moment($selected.data('date'));

				render.date(valuesToShow ? $selected.text() : null);

				events.toggle_options();
				on_date_selected(valuesToShow ? $selected.data('value') : current_date);
			},
			toggle_options : function() {
				if (!date_selector.isDisabled()) {
					!option_open ? events.openOptionsOverlay() : events.closeOptionsOverlay();
				} else {
					disabled_callback && disabled_callback(type);
				}
			},
			openOptionsOverlay: function () {
				$dom.addClass('open');
				$option.slideDown();
				$overlay.show();
				option_open = true;
			},
			closeOptionsOverlay: function () {
				$option.slideUp();
				$dom.removeClass('open');
				$overlay.hide();
				option_open = false;
			},
			setDate: function (value) {
				$option.find('li a').removeClass('selected');
				$selected = $option.find('li a[data-value="' + value + '"]');
				$selected.addClass('selected');
				render.date($selected.text());
			}
		}
		
		var utils = {
			get_date_title : function(d) {
			    console.log(today_date.format("YYYY"), d.format("YYYY"));
				if (today_date.format("YYYY") == d.format("YYYY")) {
					return d.format('MMMM');
				} else {
					return d.format('MMMM YYYY');
				}
				return '';
			}
		}
		
		api = {
			'enable' : function () {
				date_selector.enable();
			},
			'disable' : function () {
				date_selector.disable();
				events.closeOptionsOverlay();
			},
			'setDate': function (value) {
				events.setDate(value);
			},
			'updateYear': function (value) {
				currentYearToShow = value;
				render.date($selected.text());
			},
			'destroy' : function () {
				date_selector.close();
			},
		};

		init();

		return api;
	};
	module.exports = DateSelector;
});