/// <reference path="god.js" />
/// <reference path="/Scripts/jquery-2.1.3.js" />
(function () {
    var url = "/LovePark.ashx?serverMethod=",
        couples = [],
        properties = ["hisData", "getPhoto", "register", "login", "logout", "updateData", "uploadPhoto"];
    function LovePark() {
        this.actions = {};
    }
    window.park = new LovePark();
    function assign(i) {
        var p = properties[i];
        Object.defineProperty(this, p, {
            get: function () {
                return p[0].toUpperCase() + p.substr(1);
            }
        });
        this.actions[p] = p;
        if (i === properties.length - 1) {
            return;
        }
        assign.call(this, i + 1);
    };
    assign.call(park, 0);
    function Feeling(how, data) {
        var onSucess, onFail, onComplete,
            feeling = this,
            settings = {
                data: data
            };
        function getAjaxSettings(moreSettings) {
            if (onSucess) {
                settings.success = onSucess;
            }
            if (onFail) {
                settings.error = onFail;
            }
            if (onComplete) {
                settings.complete = onComplete;
            }
            for (var i in moreSettings) {
                if (!settings.hasOwnProperty(i)) {
                    settings[i] = moreSettings[i];
                }
            }
            return settings;
        }
        function setCallback(action, now) {
            action();
            if (now) {
                feeling.love();
                return;
            }
            return feeling;
        }
        this.onMarried = function (callback, now) {
            return setCallback(function () {
                onSucess = callback;
            }, now);
        };
        this.onBrokeUp = function (callback, now) {
            return setCallback(function () {
                onFail = callback;
            }, now);
        };
        this.onWhatever = function (callback) {
            return setCallback(function () {
                onComplete = callback;
            });
        };
        this.love = function (settings) {
            var request = $.ajax(url + how, getAjaxSettings(settings));
            var id = Math.random();
            couples.push({ id: id, request: request });
            return id;
        };
        if (god.modes.coding) {
            setCallback.call(this, god.emptyFunction, true);
        }
    }
    if (god.modes.coding) {
        couples.push({ id: 1, request: $.ajax() });
    }
    LovePark.prototype.forget = function (id) {
        if (id === -1) {
            for (var i = 0; i < couples.length; i++) {
                couples[i].request.abort();
            }
            delete couples;
            couples = [];
        }
        var find = couples.filter(function (e) {
            return e.id === id || god.modes.coding;
        });
        if (!find.length) {
            return;
        }
        find[0].request.abort();
        couples.splice(couples.indexOf(find), 1);
    };
    LovePark.prototype.meet = function (how, data) {
        if (!this.hasOwnProperty(how)) {
            return;
        }
        var feeling = new Feeling(how, data);
        return feeling;
    };
})();
//park.meet(park.getData).onMarried().onBrokeUp().onWhatever().love();