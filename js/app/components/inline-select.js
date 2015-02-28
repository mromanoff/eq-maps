(function (App) {
    'use strict';

    /**
     * Inline select module handler.
     * Add [data-select-defualt-club="true"] to select the default club in club dropdown
     */
    App.Components['inline-select'] = function ($el, type) {

        function selectDefaultFacility(options) {
            var arr = [];
            $.each(options, function () {
                if (parseInt($(this).data('facility-id'), 10) === parseInt(window.user.FacilityId, 10)) {
                    return arr.push($(this).attr('selected', 'selected')[0]);
                }
                arr.push($(this)[0]);
            });
            options = arr;
            return $el.find('select').append(options);
        }
        
        if (type === 'clubslist') {
            /* global allRegionsData, EQ */
            // Get all clubs
            var handleCommingSoonClub = $el.data('handle-comming-soon-club');
            var options = allRegionsData.reduce(function (prev, nextRegion) {
                return prev.concat(EQ.Helpers.getAllFacilities(nextRegion));
                // Sort alphabetically ascendent
            }, []).sort(function (a, b) {
                return a.ClubName < b.ClubName ? -1 : 1;
                // Map to <option>
            }).map(function (club) {
                if (handleCommingSoonClub && club.IsAvailableOnline && club.IsPresale === false) {
                    return makeOptions(club);
                } else if (!handleCommingSoonClub) {
                    return makeOptions(club);
                }
                

            });
            var dataSelectDefaultClub = $el.data('select-defualt-club');
            if (dataSelectDefaultClub) {
                selectDefaultFacility(options);
            } else {
                $el.find('select').append(options);
            }

            var $selectedValue = $('#selectedValue', $el);
            
            if ($selectedValue.length > 0 && $selectedValue.val() !== '') {
                $el.find('select option[value="' + $selectedValue.val() + '"]').attr('selected', 'selected');
            }
        }

        function makeOptions(club) {
            return '<option data-facility-id="' + club.Id + '" value="' + club.ClubID + '">' + club.ClubName + '</option>';
        }

        var $optionPlaceholder = $el.find('span.option');

        // Set the initial option.
        $optionPlaceholder.text($el.find('option:selected').text());

        $el.find('select').on('change', function (e) {
            console.log(e, $el.find('option:selected').text());
            $optionPlaceholder.removeClass('open');
            // lets deprecate this damn thing shall we? add data-skip=true
            // to use the new jquery plugin selectWrapper instead.
            if (!$(this).attr('data-skip')) {
                $optionPlaceholder.text($el.find('option:selected').text());
                // Pass the event to the wrapper.
                $el.trigger('change', e);
                // Remove focus from select
                setTimeout(function () {
                    $el.find('select').blur();
                }, 1);
            }
        });

        // Do not touch this.

        $el.find('select').on('click', function () {
            $optionPlaceholder.addClass('open');

            $el.find('select').on('mouseup', function () {
                $el.find('select').off('mouseup');
                setTimeout(function () {
                    $el.find('select').blur();
                }, 1);
            });
        });

        $el.find('select').on('blur', function () {
            $optionPlaceholder.removeClass('open');
            $el.find('select').off('mouseup');
        });

        /* */
    };

}(window.App));