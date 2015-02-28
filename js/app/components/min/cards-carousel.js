(function(App) {
    "use strict";
    App.Components["cards-carousel"] = function($el, options) {
        var defaults = {
            navigation: false,
            itemsCustom: [ [ 0, 1 ], [ 450, 1 ], [ 600, 1 ], [ 700, 1 ], [ 1e3, 3 ], [ 1200, 3 ], [ 1400, 3 ], [ 1600, 3 ] ],
            jsonp: false,
            spinner: {
                lines: 13,
                length: 7,
                width: 2,
                radius: 10,
                corners: 0,
                rotate: 0,
                color: "#fff",
                speed: 1,
                trail: 52,
                shadow: false,
                hwaccel: false,
                className: "spinner",
                zIndex: 2e9,
                top: "50%",
                left: "50%"
            }
        };
        var mock = null;
        var base = mock || APIEndpoint;
        var opts = $.extend(options, defaults);
        var json = $el.attr("data-json");
        var $owl = $el.find(".owl-carousel");
        var spinner = new Spinner(opts.spinner).spin($owl.parent()[0]);
        var templates = {
            selected: $el.attr("data-view") ? EQ.Helpers.str.toCamelCase($el.attr("data-view")) : null,
            views: {
                myTrainer: function(data) {
                    var str = "";
                    var arr = data.trainers;
                    var len = arr.length;
                    var itm = arr;
                    enableControls(data.trainers);
                    if (arr.length > 0) {
                        for (var i = 0; i < len; i++) {
                            str += '<div class="item">';
                            str += '    <img src="/assets/images/pt-avatar.gif" class="circle" />';
                            str += "    <p>";
                            str += "        <strong>" + itm[i].name + "</strong>";
                            if (itm[i].tierName !== "") {
                                str += "    <span> " + itm[i].tierName + "</span>";
                            }
                            str += "    </p>";
                            str += "    <ul>";
                            if (itm[i].phoneNumber !== "" && itm[i].phoneNumber !== null) {
                                str += '   <li><i class="icon-phone"></i>' + itm[i].phoneNumber + "</li>";
                            }
                            str += '       <li><a href="mailto:' + itm[i].emailAddress + '"><span class="icon-envelope"></span><span>' + itm[i].emailAddress + "</span></a></li>";
                            str += "    </ul>";
                            str += "</div>";
                        }
                    } else {
                        str += '<div class="h3">You have no trainer yet</div>';
                        debug('[CAROUSEL CARDS] Error: no items received from the API for "My Trainer" component');
                    }
                    render(str);
                },
                myInventory: function(data) {
                    var str = "";
                    var arr = data.inventory;
                    var len = arr.length;
                    var itm = arr;
                    enableControls(data.inventory);
                    if (arr.length > 0) {
                        for (var i = 0; i < len; i++) {
                            var statusLabel = "alert-status-" + getInventoryStatusLabel(itm[i].available);
                            var duration = itm[i].duration === 0 ? "&nbsp;" : "(" + itm[i].duration + " min)";
                            var renewals = itm[i].isAutoRenewOn ? "ON" : "OFF";
                            str += '<div class="item">';
                            str += '    <div class="circle ' + statusLabel + '">';
                            str += "        <span>" + itm[i].tier + "<small>" + duration + "</small></span>";
                            str += "        <i>" + itm[i].available + "</i>";
                            str += "    </div>";
                            console.log("x", itm[i].isAutoRenewOn);
                            console.log("d", typeof itm[i].isAutoRenewOn);
                            if (itm[i].isAutoRenewOn !== null) {
                                str += '    <div class="auto-renew-info">';
                                str += "        <div>Auto renew: <strong>" + renewals + "</strong></div>";
                                str += '        <a href="/account/ptrenew">Edit</a>';
                                str += "    </div>";
                            }
                            str += "</div>";
                        }
                    } else {
                        debug('[CAROUSEL CARDS] Error: no items received from the API for "My Trainer" component');
                    }
                    if (arr.length < 2) {
                        $el.find(".total-available-count");
                    }
                    $el.find(".total-available-count span").text(data.totalAvailableCount);
                    render(str);
                },
                upcomingSessions: function(data) {
                    var str = "";
                    var arr = data.sessions;
                    var len = arr.length;
                    var itm = arr;
                    var zone = "";
                    enableControls(data.sessions);
                    if (arr.length > 0) {
                        for (var i = 0; i < len; i++) {
                            str += '<div class="item">';
                            str += '    <div class="h1">' + itm[i].day + "</div>";
                            str += '    <div class="h2">' + itm[i].month + "</div>";
                            str += "    <p>";
                            if (itm[i].timeZone !== null) {
                                zone = " " + itm[i].timeZone;
                            }
                            str += "        <strong>" + itm[i].time + zone + "</strong>";
                            str += itm[i].trainerFirstName + " @ " + itm[i].facility;
                            str += "    </p>";
                            str += '    <ul class="inline-list">';
                            str += '        <li><a href="personal-training/schedule#cancel/' + itm[i].id + '" class="align-left"><span class="icon-close"></span><span>cancel</span></a></li>';
                            if (itm[i].canReschedule) {
                                str += '    <li><a href="personal-training/schedule#update/' + itm[i].id + '" class="align-right"><span class="icon-rotate"></span><span>reschedule</span></a></li>';
                            }
                            str += "    </ul>";
                            str += "    <ul>";
                            str += '        <li><a href="' + APIEndpoint + "/ME/CALENDAR/EVENTS/" + itm[i].id + '/EXPORT/ICS?exportType=AppointmentInstance" class="align-right"><span class="icon-export"></span><span>Export to Calendar</span></a></li>';
                            str += "    </ul>";
                            str += "</div>";
                        }
                        render(str);
                        if (arr.length === 2) {
                            $el.find(".owl-carousel").css("max-width", "70%");
                        } else if (arr.length < 2) {
                            if (EQ.Helpers.getDeviceSize() === "small") {
                                $el.find(".owl-carousel").css("max-width", "75%");
                            } else {
                                $el.find(".owl-carousel").css("max-width", "35%");
                            }
                        }
                    } else {
                        str += '<a href="#" class="hero-cta">';
                        str += "    <span>";
                        str += "        <strong>Get Started</strong>";
                        str += "        <p>Your trainer is eager to workout with you</p>";
                        str += "    </span>";
                        str += "</a>";
                        destroyCarousel();
                        $el.append(str);
                    }
                    $el.on("owl.rendered", function() {
                        var padding = EQ.Helpers.getDeviceSize() === "small" ? 0 : 40;
                        var carouselHeight = $el.closest(".contents").height() + padding;
                        var options = $owl.data("owlCarousel");
                        var itemsSetting = options.options.items;
                        $el.closest(".carousel-hero").css("overflow", "hidden").height(carouselHeight);
                        if (arr.length === 1) {
                            $el.find(".icon-right-arrow").remove();
                            $el.find(".icon-left-arrow").remove();
                        } else if (arr.length < 4 && itemsSetting > 1) {
                            hideControls(data.sessions);
                        } else if (arr.length > 1 && itemsSetting === 1) {
                            showControls(data.sessions);
                        }
                    });
                    $(window).resize(function() {
                        $el.trigger("owl.rendered");
                    });
                    return str;
                }
            }
        };
        function getInventoryStatusLabel(levelNum) {
            var level = "";
            if (levelNum === 0) {
                level = 0;
            } else if (levelNum < 4) {
                level = 1;
            } else if (levelNum > 3) {
                level = 2;
            }
            return level;
        }
        function enableControls(items) {
            if (items.length > 1) {
                $el.find(".icon-right-arrow").show("slow");
                $el.find(".icon-left-arrow").show("slow");
            } else {
                opts.navigation = false;
            }
        }
        function hideControls(items) {
            if (items.length > 1) {
                $el.find(".icon-right-arrow").css("visibility", "hidden");
                $el.find(".icon-left-arrow").css("visibility", "hidden");
            } else {
                opts.navigation = false;
            }
        }
        function showControls(items) {
            if (items.length > 1) {
                $el.find(".icon-right-arrow").css("visibility", "visible");
                $el.find(".icon-left-arrow").css("visibility", "visible");
            } else {
                opts.navigation = false;
            }
        }
        function destroyCarousel() {
            $el.empty();
        }
        function render(str) {
            spinner.stop();
            $owl.append(str);
            setTimeout(function() {
                $el.trigger("owl.rendered");
                spinner.stop();
            }, 1e3);
        }
        function customDataSuccess(data) {
            if (templates.selected) {
                templates.views[templates.selected](data);
            } else {
                debug("[CAROUSEL CARDS] Error: no view defined");
            }
        }
        if ($.trim($owl.html()) === "" && (!json || json === "")) {
            debug("[CAROUSEL CARDS] No slides in the carousel HTML nor any JSON provided to create some for you");
            return;
        }
        if (json) {
            opts.jsonPath = base + json;
            opts.jsonSuccess = customDataSuccess;
        }
        if ($el.attr("data-single-item")) {
            opts.singleItem = Boolean($el.attr("data-single-item"));
            $el.addClass("single-item");
        } else {
            if (EQ.Helpers.getDeviceSize() === "small") {
                opts.singleItem = true;
            } else {
                opts.singleItem = false;
            }
        }
        if (Modernizr.mq("only all and (max-width: 980px)")) {
            opts.setAsSingle = true;
        }
        $owl.owlCarousel(opts);
        $el.find(".icon-right-arrow").click(function(e) {
            e.preventDefault();
            $owl.trigger("owl.next");
        });
        $el.find(".icon-left-arrow").click(function(e) {
            e.preventDefault();
            $owl.trigger("owl.prev");
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
