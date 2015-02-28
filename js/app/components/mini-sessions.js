(function (App) {
    'use strict';
	/* global APIEndpoint, _, moment */

    /**
     * Creates a bar chart component from the given options
     * @param  {jQuery Object}      Component object reference
     * @param  {JSON Object}        Data to create the chart
     *
     *   OPTIONS Object
     *
     *      info {Boolean}                   Specifies if more information should be displayed
     *      scalce {int}                     Specifies the scale for the numbers
     *      data {Object} {STRING: NUMBER}   Each bar specific information compound by name string and a percentage value
     *
     *      Example:
     *          {"info": true,"scale":100, "data": {"strength": 100, "cardio": 100, "flexibility": 25}
     */
	App.Components['mini-sessions'] = function ($el) {
		var $container = $el.find('.mini-sessions'),
			$header = $container.find('h6'),
			$sessionList = $container.find('.session-list'),
			$spinner = $container.find('.spinner'),
			DATE = moment(),
			categories = [{
				'id' : 'CheckIn',
				'name' : 'Visit',
				'blackImage' :  '/assets/images/activity/icons/visits_black.png',
				'whiteIcon' : '/assets/images/activity/icons/visits_white.png',
				'count' : 0
			}];
		
		var init = function () {
			$container.height($el.parent().parent().height());
			$header.text(DATE.format('MMMM'));
			ajax.loadCategories();
		};
		
		var render = {
			list : function () {
				$spinner.hide();
				var template = [
					'<div class="session-list-item">',
					'<span class="session-list-icon"></span>',
					'<span class="session-list-count"></span>',
					'<span class="session-list-name"></span>',
					'</div>'
				].join('');
				for (var i = 0; i < categories.length; i++) {
					var $listItem = $(template),
						bgUrl = categories[i].blackImage,
						countValue = categories[i].count;
					if (categories[i].count === 0) {
						countValue = '&ndash;';
						$listItem.addClass('empty');
					}
					$listItem.find('.session-list-icon').css({'background-image' : 'url(' + bgUrl + ')'});
					$listItem.find('.session-list-count').html(countValue);
					$listItem.find('.session-list-name').text(categories[i].name);
					$sessionList.append($listItem);
				}
			}
		};
		
		var ajax = {
			loadCategories : function () {
				var url = APIEndpoint + '/classes/categories';
				console.info('loading from service: ', url);
				$.ajax({
					type: 'GET',
					url: url,
					contentType: 'application/json',
					xhrFields: { 'withCredentials': true },
					dataType: 'json',
					success: function (d) {
						utils.formatCategoriesData(d);
						ajax.loadSessions();
					},
					error: function (d) {
						console.warn(d);
					}
				});
			},
			loadSessions : function () {
				var url = APIEndpoint + '/me/sessions/' + DATE.format('YYYY/M');
				console.info('loading from service: ', url);
				$.ajax({
					type: 'GET',
					url: url,
					contentType: 'application/json',
					xhrFields: { 'withCredentials': true },
					dataType: 'json',
					success: function (d) {
						utils.formatSessionsData(d);
						render.list();
					},
					error: function (d) {
						console.warn(d);
					}
				});
			}
		};
		
		var utils = {
			formatCategoriesData : function (raw) {
				for (var i = 0; i < raw.length; i++) {
					var blackImage = raw[i].mobileIconImage1Url || '',
						whiteImage = raw[i].mobileIconImage2Url || '',
						id = raw[i].categoryId || '';
					if (blackImage === '') {
						blackImage = '/assets/images/activity/icons/empty_black.png';
					}
					if (whiteImage === '') {
						whiteImage = '/assets/images/activity/icons/empty_white.png';
					}
					var cat = {
						'id' : parseInt(id, 10),
						'name' : raw[i].categoryName || '',
						'blackImage' : blackImage,
						'whiteIcon' : whiteImage,
						'count' : 0
					};
					if (!_.find(categories, { 'id' : cat.id })) {
						if (cat.name === 'Pilates' || cat.name === 'Pool Programs' || cat.name === 'Cardio') {
							continue;
						}
						categories.push(cat);
					}
				}
			},
			formatSessionsData : function (raw) {
				for (var i = 0; i < raw.length; i++) {
					var id = raw[i].categoryId || raw[i].category || false,
						cat = _.find(categories, { 'id' : id });
					if (cat) {
						cat.count++;
					}
				}
				categories.sort(function (a, b) {
					return b.count - a.count;
				});
			}
		};
		
		
		init();
	};


}(window.App));