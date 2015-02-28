(function (global, App) {
    'use strict';

    /* global EQ, debug */

    App.Components['nearest-club'] = function () {
        EQ.Geo.getLatLng(function () {
            EQ.Geo.getNearestClub(function (club) {
                debug('[GetNearestClub] ', club);

                // Move the location a little bit to create some margin.
                var shiftedLatitude = +club.Latitude + 0.02000;

                EQ.Helpers.setPositionGetter(club);

                EQ.Maps.Load(function () {
                    var nearestMap = new EQ.Maps.Map($('#map')[0], shiftedLatitude, club.Longitude);
                    nearestMap.fit([club], -3);
                    nearestMap.freeze();
                });

                var address = '';
                var city = '';
                var phone = club.Telephone === 'N/A' ? '' : club.Telephone;

                //TODO: Backend needs to improve address
                /*if (club.GoogleAddress !== '') {
                    var splitAddress = club.GoogleAddress.split(',');
                    address = splitAddress[0] || '';
                    city = splitAddress[1] + ',' + splitAddress[2];
                }
                else {
                    //address = club.Address;
                    //city = club.Region;
                }*/

                /* DPLAT-5394 */
                if (club.Address !== '') {
                    address = club.Address || '';
                    city = club.City + ',' + club.Region + ' '  + club.Zip;
                }

				// create tel: attribute.
				var formatedValue = phone.replace(/\./g, '');
				var phoneLink = 'tel:' + formatedValue;
                // Bind the Club data to the view.
                $('.nearest-map')
                    .find('.club-name').text(club.ClubName).end()
                    .find('.address').text(address || '').end()
                    .find('.city').text(city || '').end()
                    .find('.phone').attr('href', phoneLink || '#').text(phone || '');

                //Bind Link to Club Detail
                $('.learn-more').attr('href', '/clubs/' + club.ShortName);

            });
        }, function () {
            // Hide Map if the user denied GEO.
            $('.nearest-map').slideUp(function () {
                $(this).remove();
            });
        });

    };


}(window, window.App));