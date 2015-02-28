(function (global) {
    'use strict';
    //TODO: Split log out on Routes?
    /* global Crittercism, isDebugging, assemblyVersion, assemblyServer, EQ, Backbone, user, ZeroClipboard */

    var App = global.App = {};

    App.IS_DEV = location.hostname.indexOf('local') === 0;
    App.Pages = {};
    App.Components = {};
    App.Events = $({});

    App.Services = {
        findByGeo: '/ESB/FindFacilitiesByGeo'
    };

    App.Events.on('loaded', function () {

        var Router = Backbone.Router.extend({
            // Fixes for IIS unconventional routing.
            _routeToRegExp: function (route) {
                // Optional trailing slash
                route += '(/)';
                // This makes the Router case insensitive
                route = Backbone.Router.prototype._routeToRegExp.call(this, route);
                return new RegExp(route.source, 'i');
            },
            routes: {
                '': App.Pages.Home.init,
                'Join/Step1': App.Pages.Join.SelectClub.init,
                'Join/Step3': App.Pages.Join.MembershipPurchase.init,
                'Join/thank-you': App.Pages.Join.ThankYouPage.init,
                'Join/:facilityId': App.Pages.Join.SelectMembership.init,
                'Login': App.Pages.Login.init,
                'Help/ForgotPassword': App.Pages.Password.Forgot.init,
                'Help/Recover-Password/:token': App.Pages.Password.Reset.init,
                'Help/Change/UserName': App.Pages.User.ChangeUserName.init,
                'help/upgrade/spa-member': App.Pages.User.SpaMemberUpgrade.init,
                'Help/forgotUser': App.Pages.User.Forgot.init,
                'login/connect': App.Pages.ConnnectAccounts.init,
                'bookabike': App.Pages.Mock.Book.init,
                'bookabike/detail': App.Pages.Mock.Book.init,
                'Activate/start': App.Pages.Activate.init,
                'activate/email/:guid': App.Pages.OnBoarding.start,
                'Activate/verifyemail/:token': App.Pages.User.VerifyUserName.init,
                'activate/signin': App.Pages.SignIn.init,
                'activate/signin/facebook/email': App.Pages.SignIn.FacebookWithOutEmail.init,
                'activate/signin/equinox': App.Pages.CreateAccount.init,
                //'clubs': App.Pages.Clubs.init,
                //'modules/clubslanding': App.Pages.Clubs.init,
                //'Regions/:region': App.Pages.Clubs.init,
                //'Clubs/:club': App.Pages.Facilities.init,
                'clubs/:region': App.Pages.Clubs.init,
                'clubs/:region/:club': App.Pages.Club.init,
                'clubs/:region/:subregion/:club': App.Pages.Club.init,
                'questionnaire/:step': App.Pages.OnBoarding.init,
                'groupfitness': App.Pages.GroupFitness.init,
                'groupfitness/customworkouts': App.Pages.CustomWorkout.init,
                'groupfitness/:id': App.Pages.ClassDetail.init,
                'activity/workouts/:id': App.Pages.WorkoutSummary.init,
                'activity/:shareid/classes/:classinstanceid' : App.Pages.WorkoutSummaryShared.init,
                'activity/workout/add-custom(/)': App.Pages.AddCustomWorkout.init,
                'activity/workout/add-custom/:id': App.Pages.AddCustomWorkout.init,
                'notifications': App.Pages.Notifications.init,
                'rewards': App.Pages.Rewards.init,
                'personal-training/schedule-equifit': App.Pages.ScheduleEquifit.init,
                'patch/cycling': App.Pages.CyclingPatch.init,
                'groupfitness/:id/leaderboard': App.Pages.Leaderboard.init
            }
        });

        App.Router = new Router();

        Backbone.history.start({
            hashChange: false,
            pushState: true
        });

        $.ajaxSetup({
            cache: false
        });

        if (!isDebugging) {
            console.log = function () {}; // no-op console.log (For stray logs)
            Crittercism.init({
                appId: '525628e8a7928a3b36000003',
                appVersion: assemblyVersion + ' ' + assemblyServer
            });
        } else {
            // Mock for Crittercism no debug mode
            var mock = function () {
                return this;
            };
            global.Crittercism = {
                logHandledException: mock,
                leaveBreadcrumb: mock,
                setUsername: mock,
                setValue: mock
            };
        }

        // Page scroll for data-hash
        App.loadComponent('page-scroll');

        // AJAX Check to redirect if session expired while the user had the browser open
        $(document).ajaxError(function (e, xhr) {
            // If the user variable is defined (meaning the user was logged in)
            // but the status is 401, we can assume that the session expired
            if (user !== null && xhr.status === 401) {
                location.href = '/login?ReturnUrl=' + window.location.pathname;
            }
        });

        if (user === null) {
            // Invalidate favs localStorage cache if user is null
            EQ.Helpers.user.invalidateFavoritesCache();
        }

        // Config ZeroClipboard
        ZeroClipboard.config({
            swfPath: '/assets/ZeroClipboard.swf',
            moviePath: '/assets/ZeroClipboard.swf',
            zIndex: 800,
            forceHandCursor: true
        });

        $('input, textarea').placeholder();

    });
}(window));
