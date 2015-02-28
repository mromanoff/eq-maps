(function (global, App) {
    'use strict';

    /* global debug, EQ */

    /**
    * Views 
    */

    var endpoint = {
        CLASS_GAMES : function (classInstanceID, shareID) { return '/v3/classes/' + classInstanceID + '/users/' + shareID + '/games'; }
    };

    var ActivityCyclingGameCardView = Backbone.View.extend({
        tagName: 'ul',
        className: 'result-item',
        template: _.template($('#cyclingDetailGameCardTemplate').html()),
        initialize: function (card) {
            this.card = card || {};
        },
        render: function () {
            this.$el.html(this.template(this.card));
            return this;
        },
        close: function () {
            this.remove();
            delete this.$el;
            delete this.el;
        },
        getTypeId: function () {
            return this.card.typeId;
        }
    });

    App.Components['activity-cycling-game-card'] = function ($el, options) {

        // Gets the game card data for the class
        var xhrGameCards = EQ.Helpers.getService(endpoint.CLASS_GAMES(options.classInstanceId, options.shareId));

        $.when(xhrGameCards).done(function (data) {

            debug('xhrGameCards', data);

            var $resultContainer = $('.results-module .results-container');
            var cardsArray = [];

            if (data.games.length) {
                _.each(data.games, function (card) {
                    $.extend(card, {performer: '', personal: '', personalval: '', total: '', totalval: ''});
                    switch (card.typeId) {
                    case 1: //IGNITE
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/Ignite_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/Ignite_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/Ignite_Desktop.jpg';

                        card.performer = 'YOUR MAX WATTS: ' + card.maxWatts;
                        break;
                    case 2: //POWER PAIRS
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/PowerPin_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/PowerPin_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/PowerPin_Desktop.jpg';

                        card.performer = EQ.Helpers.ordinate(card.team.teamRank).full;
                        card.personal = 'YOU: ';
                        card.personalval = EQ.Helpers.numbers.trimDecimals(card.totalDistance) + 'MI';
                        card.total = 'TEAM: ';
                        card.totalval = EQ.Helpers.numbers.trimDecimals(card.team.totalDistance) + 'MI';
                        break;
                    case 3: //HEATWAVE
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/HeatWave_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/HeatWave_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/HeatWave_Desktop.jpg';

                        card.performer = 'WON ' + card.roundsWon + '/' + card.rounds.length;
                        card.personal = 'YOUR BEST AVG WATTS: ';
                        card.personalval = card.highestAvgWattsFromRounds;
                        break;
                    case 4: //FIRE UP
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/FireUp_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/FireUp_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/FireUp_Desktop.jpg';

                        card.performer = 'BEST RANK: ' + EQ.Helpers.ordinate(card.bestRoundRank).full;
                        card.personal = 'YOUR BEST AVG WATTS: ';
                        card.personalval = card.avgWatts;
                        break;
                    case 5: //THREE PEAKS
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/ThreePeaks_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/ThreePeaks_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/ThreePeaks_Desktop.jpg';

                        card.performer = EQ.Helpers.ordinate(card.team.teamRank).full;
                        card.personal = 'YOUR BEST ROUND: ';
                        card.personalval = EQ.Helpers.numbers.trimDecimals(card.bestTotalDistanceFromRounds) + 'MI';
                        card.total = 'YOUR TOTAL DISTANCE: ';
                        card.totalval = EQ.Helpers.numbers.trimDecimals(card.totalDistance) + 'MI';
                        break;
                    case 6: //AVALANCHE
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/Avalanche_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/Avalanche_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/Avalanche_Desktop.jpg';

                        card.performer = card.team.hasTeamWon ? 'WINNER' : 'LOSER';
                        card.personal = 'YOU: ';
                        card.personalval = EQ.Helpers.numbers.trimDecimals(card.totalAvalancheCircles) + ' CIRCLES (' + EQ.Helpers.numbers.trimDecimals(card.totalDistance) + 'MI)';
                        card.total = 'TEAM: ';
                        card.totalval = EQ.Helpers.numbers.trimDecimals(card.team.totalAvalancheCircles) + ' CIRCLES (' + EQ.Helpers.numbers.trimDecimals(card.team.totalDistance) + 'MI)';
                        break;
                    case 7: //SUMMIT PUSH
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/SummerPush_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/SummerPush_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/SummerPush_Desktop.jpg';

                        card.performer = card.team.hasTeamWon ? 'CHAMPION' : EQ.Helpers.ordinate(card.team.teamRank).full;
                        card.personal = 'YOU: ';
                        card.personalval = EQ.Helpers.numbers.trimDecimals(card.totalDistance) + 'MI';
                        card.total = 'TEAM: ';
                        card.totalval = EQ.Helpers.numbers.trimDecimals(card.team.averageDistance) + 'MI';
                        break;
                    case 8: //TOUR DE FORCE
                        card.smallImageUrl = '../../../assets/images/activity/cycling-detail/Mobile/RaceTrack_Mobile.jpg';
                        card.mediumImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/RaceTrack_Desktop.jpg';
                        card.largeImageUrl = '../../../assets/images/activity/cycling-detail/Desktop/RaceTrack_Desktop.jpg';

                        card.performer = card.team.hasTeamWon ? 'CHAMPION' : EQ.Helpers.ordinate(card.team.teamRank).full;
                        card.personal = 'YOU: ';
                        card.personalval = EQ.Helpers.numbers.trimDecimals(card.totalDistance) + 'MI';
                        card.total = 'TEAM: ';
                        card.totalval = EQ.Helpers.numbers.trimDecimals(card.team.totalDistance) + 'MI';
                        break;
                    }

                    var gameCardComponent = new ActivityCyclingGameCardView(card);
                    
                    $resultContainer.append(gameCardComponent.render().el);

                    cardsArray.push(gameCardComponent);
                });
                
                //If there are 4 cards, that means we have the replacement cards for either Ignite or Summit Push, thus we remove them.
                if (cardsArray.length === 4) {
                    _.each(cardsArray, function (c) {
                        if (c.getTypeId() === 1 || c.getTypeId() === 7) {
                            c.close();
                        }
                    });
                }

                // Init carousel
                App.loadComponent('owl-slider', $resultContainer, {
                    autoHeight : false,
                    singleItem: false,
                    items: 3,
                    setAsSingle: true,
                    itemsDesktop: [2700, 3],
                    itemsMobile: [768, 1]
                });

                //Shows the full element
                $el.removeClass('hidden');
            }
        });
    };

} (window, window.App));
