(function (global, App) {
    'use strict';

    /* global debug */

    var Mock = App.Pages.Mock = {},
        _ = global._;

    Mock.Book = {};
   
    /**
    * Book a Bike Mock Screen
    */

    Mock.Book.init = function () {
        debug('[Mock.Book] Init');
        Mock.Book.bind();
        //Mock.Book.drawMap();
    };

    Mock.Book.bind = function () {

        // Showing active state of filter
        $('.bike-filters > li > a').on('click', function () {
            $(this).addClass('active');
            $(this).find('input').focus();
        });
        // Toggles active class on dropdown
        $('.bike-filters ul li a').on('click', function () {
            $(this).toggleClass('active');
        });
        // Clears value of input
        $('.remove-filter').on('click', function (e) {
            e.stopPropagation();
            $(this).prev().val('');
            $('.bike-filters li a.active').removeClass('active');
        });

        // Adds/removes filter boxes when clicking on each filter on the dropdown
        $('.bike-filters .checkbox').on('change', function () {
            var label = $(this).find('.label').text(),
                icon = $(this).closest('ul[data-icon]').attr('data-icon'),
                $filter = $('<li data-filter="' + label + '" class="' + icon + '"><span>' + label + '</span></li>');
            
            if ($(this).hasClass('checked')) {
                $filter.appendTo('.added-filters');
            } else {
                $('.added-filters li[data-filter="' + label + '"]').remove();
            }
        });
    };

    Mock.Book.drawMap = function () {
        var $map = $('.bikes-graphic'),
            mapWidth = $map.width(),
            mapHeight,
            jsonData = Mock.Book.jsonMap,
            mapProportion = jsonData.layout.width / mapWidth,
            bikes = jsonData.layout.bikes,
            doors = jsonData.layout.doors;

        mapHeight = Math.floor((mapWidth * jsonData.layout.heigth) / jsonData.layout.width);

        _.each(bikes, function (bike) {
            Mock.Book.drawBike(bike, mapProportion);
        });

        _.each(doors, function (door) {
            Mock.Book.drawDoor(door, mapProportion);
        });
    };

    Mock.Book.drawBike = function (bike, mapProportion) {
        var $map = $('.bikes-graphic'),
            $bike = $('<div class="bike">' + bike.localId + '</div>'),
            bikeLeft = Math.floor(bike.studioGridX / mapProportion),
            bikeTop = Math.floor(bike.studioGridY / mapProportion);

        $map.append($bike);
        $bike.css({'top' : bikeTop + 'px', 'left' : bikeLeft + 'px'});

        if (bike.isDisabled === true) {
            $bike.addClass('unavailable');
        }

        if (bike.reserved === true) {
            $bike.addClass('selected');
        }

    };

    Mock.Book.drawDoor = function (door, mapProportion) {
        var $map = $('.bikes-graphic'),
            $door = $('<div class="door icon-door"></div>'),
            doorLeft = Math.floor(door.studioGridX / mapProportion),
            doorTop = Math.floor(door.studioGridY / mapProportion);

        $map.append($door);
        $door.css({'top' : doorTop + 'px', 'left' : doorLeft + 'px'});

    };

    Mock.Book.jsonMap = {
        'reservation': {
            'result': null
        },
        'layout': {
            'clubId': 113,
            'clubName': '50th St. @ Broadway',
            'heigth': 475,
            'width': 925,
            'id': 104,
            'name': 'Cycling Studio',
            'bikes': [
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 145,
                    'studioGridX': 320,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1415,
                    'isDisabled': false,
                    'localId': 1,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 90,
                    'studioGridX': 320,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1416,
                    'isDisabled': false,
                    'localId': 2,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 35,
                    'studioGridX': 320,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1417,
                    'isDisabled': false,
                    'localId': 3,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 145,
                    'studioGridX': 420,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1418,
                    'isDisabled': false,
                    'localId': 4,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 90,
                    'studioGridX': 420,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1419,
                    'isDisabled': false,
                    'localId': 5,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 35,
                    'studioGridX': 420,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1420,
                    'isDisabled': false,
                    'localId': 6,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 145,
                    'studioGridX': 515,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 1421,
                    'isDisabled': false,
                    'localId': 7,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 90,
                    'studioGridX': 515,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2747,
                    'isDisabled': false,
                    'localId': 8,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 35,
                    'studioGridX': 515,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2839,
                    'isDisabled': false,
                    'localId': 9,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 140,
                    'studioGridX': 690,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2840,
                    'isDisabled': false,
                    'localId': 10,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 195,
                    'studioGridX': 690,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2841,
                    'isDisabled': false,
                    'localId': 11,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 250,
                    'studioGridX': 690,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2842,
                    'isDisabled': false,
                    'localId': 12,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 305,
                    'studioGridX': 690,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2843,
                    'isDisabled': false,
                    'localId': 13,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 360,
                    'studioGridX': 690,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2844,
                    'isDisabled': false,
                    'localId': 14,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 415,
                    'studioGridX': 690,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2845,
                    'isDisabled': false,
                    'localId': 15,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 195,
                    'studioGridX': 605,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2846,
                    'isDisabled': false,
                    'localId': 16,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 250,
                    'studioGridX': 605,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2847,
                    'isDisabled': false,
                    'localId': 17,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 305,
                    'studioGridX': 605,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2848,
                    'isDisabled': false,
                    'localId': 18,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 360,
                    'studioGridX': 605,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2849,
                    'isDisabled': false,
                    'localId': 19,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 415,
                    'studioGridX': 605,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2850,
                    'isDisabled': false,
                    'localId': 20,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 480,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2851,
                    'isDisabled': false,
                    'localId': 21,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 415,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2852,
                    'isDisabled': false,
                    'localId': 22,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 350,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2853,
                    'isDisabled': false,
                    'localId': 23,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 290,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2854,
                    'isDisabled': false,
                    'localId': 24,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 230,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2855,
                    'isDisabled': false,
                    'localId': 25,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 165,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2856,
                    'isDisabled': false,
                    'localId': 26,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 410,
                    'studioGridX': 55,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2857,
                    'isDisabled': false,
                    'localId': 27,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 300,
                    'studioGridX': 445,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 2858,
                    'isDisabled': false,
                    'localId': 28,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 300,
                    'studioGridX': 330,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 3160,
                    'isDisabled': false,
                    'localId': 29,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 300,
                    'studioGridX': 260,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 3612,
                    'isDisabled': false,
                    'localId': 30,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 300,
                    'studioGridX': 190,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 3613,
                    'isDisabled': false,
                    'localId': 31,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 300,
                    'studioGridX': 120,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 3614,
                    'isDisabled': false,
                    'localId': 32,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 300,
                    'studioGridX': 55,
                    'gridItemTypeId': 1,
                    'gridItemType': 'Bike',
                    'gridItemImage': 'bike.jpg',
                    'reservableEquipId': 3615,
                    'isDisabled': false,
                    'localId': 33,
                    'equipmentName': 'Bike',
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': 1
                }
            ],
            'doors': [
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 35,
                    'studioGridX': 695,
                    'gridItemTypeId': 5,
                    'gridItemType': 'Door - Bottom Left',
                    'gridItemImage': 'doorBL.gif',
                    'reservableEquipId': null,
                    'isDisabled': null,
                    'localId': null,
                    'equipmentName': null,
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': null
                },
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 85,
                    'studioGridX': 695,
                    'gridItemTypeId': 5,
                    'gridItemType': 'Door - Bottom Left',
                    'gridItemImage': 'doorBL.gif',
                    'reservableEquipId': null,
                    'isDisabled': null,
                    'localId': null,
                    'equipmentName': null,
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': null
                }
            ],
            'instructors': [
                {
                    'clubId': 113,
                    'studioId': 104,
                    'studioGridY': 55,
                    'studioGridX': 100,
                    'gridItemTypeId': 2,
                    'gridItemType': 'Instructor',
                    'gridItemImage': 'instructor.gif',
                    'reservableEquipId': null,
                    'isDisabled': null,
                    'localId': null,
                    'equipmentName': null,
                    'reserved': false,
                    'reservedByUserSecId': null,
                    'equipmentId': null
                }
            ]
        },
        'strikes': {
            'count': 0,
            'expiresOn': '2014-02-22T06:05:34.9173881-05:00'
        }
    };

} (window, window.App));