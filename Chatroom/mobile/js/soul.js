/// <reference path="god.js" />
/// <reference path="/Scripts/jquery-2.1.3.js" />
(function () {
    var url = "/Soul.ashx?serverMethod=",
        couples = [],
        properties = ["hisName", "hisData", "getPhoto", "ignoreHim", "register", "login", "logout", "updateData", "uploadPhoto", "resetTestData"];
    function Soul() {
        this.actions = {};
    }
    this.soul = new Soul();
    function assign(i) {
        var p = properties[i];
        this.actions[p] = p[0].toUpperCase() + p.substr(1);
        if (i === properties.length - 1) {
            return;
        }
        assign.call(this, i + 1);
    };
    assign.call(soul, 0);
    function Feeling(how, data, args) {
        var onSucess, onFail, onComplete,
            feeling = this,
            settings = {
                data: data
            };
        function getAjaxSettings(moreSettings) {
            if (onSucess) {
                settings.success = function (d) {
                    onSucess(d, args);
                };
            }
            if (onFail) {
                settings.error = function (d) {
                    onFail(d, args);
                };
            }
            if (onComplete) {
                settings.complete = function (d) {
                    onComplete(d, args);
                };
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
                feeling.start();
                return;
            }
            return feeling;
        }
        this.done = function (callback, now) {
            return setCallback(function () {
                onSucess = callback;
            }, now);
        };
        this.failed = function (callback, now) {
            return setCallback(function () {
                onFail = callback;
            }, now);
        };
        this.finished = function (callback) {
            return setCallback(function () {
                onComplete = callback;
            });
        };
        this.start = function (settings) {
            if (god.modes.coding) {
                onSucess({}, args) && onFail({}, args) && onComplete({}, args);
                return;
            }
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
    Soul.prototype.separate = function (id) {
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
    Soul.prototype.prepare = function (how, data, args) {
        //if (!this.hasOwnProperty(how[0].toLowerCase() + how.substr(1))) {
        if (this.actions[how] === "undefined") {
            return;
        }
        var feeling = new Feeling(how, data, args);
        return feeling;
    };
})();