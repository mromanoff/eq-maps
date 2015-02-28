window.track = function (directCall, data) {

    console.log('Tracking data:', data);

    window.TagData = data;
    _satellite.track(directCall);
    window.TagData = {};
};