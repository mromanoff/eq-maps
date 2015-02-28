(function (global, App) {
    'use strict';
    /* global APIEndpoint, Backgrid */
    var CustomWorkout = App.Pages.CustomWorkout = {};

    CustomWorkout.init = function () {
        console.log('---------Calling from custom workout page');

        var customworkouturl = APIEndpoint + '/classes/Customworkouts';

        var CustomWorkoutModel = Backbone.Model.extend({});

        var CustomWorkoutCollection = Backbone.PageableCollection.extend({
            model: CustomWorkoutModel,
            url: customworkouturl,
            mode: 'client', // page entirely on the client side
            state: {
                pageSize: 15
            }
        });

        var columns = [
            {
                name: 'workoutDate',
                label: 'DATE',
                editable: false,
                cell: 'string'
            }, {
                name: 'workoutTime',
                label: 'TIME',
                editable: false,
                cell: 'string'
            }, {
                name: 'name',
                label: 'WORKOUT',
                editable: false,
                cell: 'string'
            }, {
                name: 'calories',
                label: 'CALORIES',
                editable: false,
                cell: 'string'
            }, {
                name: 'description',
                label: 'NOTES',
                editable: false,
                cell: 'string'
            }
        ];

        var customWorkoutCollection = new CustomWorkoutCollection();
        customWorkoutCollection.fetch({
            'xhrFields': { 'withCredentials': true },
            'success': function () {
                var grid = new Backgrid.Grid({
                    columns: columns,
                    collection: customWorkoutCollection
                });

                $('#customWorkoutData').append(grid.render().el);

                var paginator = new Backgrid.Extension.Paginator({
                    collection: customWorkoutCollection
                });

                $('#customWorkoutData').append(paginator.render().el);
            },
            'error': function () {
                $('#customWorkoutData').html('Failed to load data');
            }
        });
    };

}(window, window.App));