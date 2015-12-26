(function () {
    function GodThere() {
        var self = this;
        this.initiatedTime = new Date();
        this.modes = {
            coding: location.href.length == 11,
            debugging: location.href.indexOf("localhost") > 0,
        };
        this.window = (function () {
            return {
                queryString: function (item) {
                    var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
                    return svalue ? svalue[1] : svalue;
                },
                allSuffixesImg: function (img, filename) {
                    var suffixes = ["jpg", "bmp", "gif", "png"];
                    var i = 0;
                    function assign() {
                        if (i === suffixes.length) {
                            return;
                        }
                        img.src = god.formatString("{0}.{1}", filename, suffixes[i] + "?r=" + Math.random());
                        i++;
                    };
                    img.onerror = assign;
                    assign();
                },
                toast: function (message, duration) {
                    if (!new String(message).length) return;
                    var Toast = function () {
                        this.p = document.createElement("p");
                        this.s = document.createElement("span");

                        this.p.className = "toast";
                        this.s.className = "toastInner";

                        this.p.appendChild(this.s);

                        this.showMessage = function (message, duration) {
                            this.s.innerHTML = message;
                            document.body.appendChild(this.p);
                            setTimeout(function (e) {
                                document.body.removeChild(e.p);
                            }, duration, this);
                        }
                    }
                    new Toast().showMessage(message, duration || 1024);
                },
            };
            return a;
        })();
        this.formatString = function () {
            if (arguments.length == 0)
                return null;
            var str = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        };
        this.formatTime = function (time) {
            time = time || new Date();
            return this.formatString("{0}/{1}/{2}", time.getHours(), time.getMinutes(), time.getSeconds());
        },
        this.getTypeName = function (obj) {
            if (typeof obj == "undefined") return undefined;
            var name = obj.constructor.toString().trim();
            var match = name.match(/[^\s]+?(?=\s*\()/);
            return match.length ? match[0] : "";
        };
        this.idIndexFile = (function () {
            function idIndexFileInner() {
                var self = this;
                //this.folder = this.format = "";
                //this.id = 0;
                //this.suffixes = [];
                //this.canceled = false;
                this.reset = function () {
                    self.folder = "";
                    self.format = "{0}_{1}";
                    self.id = 0;
                    self.suffixes = [];
                    this.canceled = true;
                    return self;
                };
                this.reset();
                this.initiate = function (folder, id, format, suffixes) {
                    this.folder = folder;
                    this.id = id;
                    if (typeof format === "string" && format.indexOf("{0}") > -1 && format.indexOf("{1}") > -1) {
                        this.format = format;
                    }
                    this.suffixes = [];
                    for (var i = 3; i < arguments.length; i++) {
                        this.suffixes.push(arguments[i]);
                    }
                    if (!self.suffixes.length) {
                        self.suffixes = ["jpg", "jpeg", "bmp", "png", "gif"];
                    }
                    this.canceled = false;
                    return this;
                };
                function iiData(index, suffixIndex, onSuccess, onFail, picture) {
                    this.index = index;
                    this.suffixIndex = suffixIndex;
                    this.onSuccess = onSuccess;
                    this.onFail = onFail;
                    this.id = 0;
                    this.folder = "";
                    this.format = "";
                    this.suffixes = [];
                    this.nextIndex = function (callback) {
                        this.index++;
                        this.suffixIndex = 0;
                        god.safeFunction(callback).execute(this);
                    };
                    this.nextSuffix = function (has, hasNot) {
                        var result = this.suffixIndex < this.suffixes.length - 1;
                        if (result) {
                            this.suffixIndex++;
                            god.safeFunction(has).execute(this);
                        } else {
                            god.safeFunction(hasNot).execute(this);
                        }
                        return result;
                    };
                    this.getPath = function () {
                        var prename = god.formatString(this.format, this.id, this.index);
                        var result = god.formatString("{0}/{1}.{2}", this.folder, prename, this.suffixes[this.suffixIndex]);
                        return result;
                    };
                }
                function create_iiData(oldArguments) {
                    if (god.getTypeName(oldArguments[0]) === "iiData") {
                        if (god.modes.coding) {
                            return new iiData();
                        }
                        return oldArguments[0];
                    }
                    var index, suffixIndex, onSuccess, onFail;
                    if (!oldArguments[1]) {
                        index = suffixIndex = 0;
                        onSuccess = oldArguments[0];
                    } else if (!oldArguments[2]) {
                        index = oldArguments[0];
                        suffixIndex = 0;
                        onSuccess = oldArguments[1];
                    } else {
                        index = oldArguments[0];
                        suffixIndex = oldArguments[1];
                        onSuccess = oldArguments[2];
                        onFail = oldArguments[3];
                    }
                    var result = new iiData(index, suffixIndex, onSuccess, onFail);
                    result.id = self.id;
                    result.folder = self.folder;
                    result.format = self.format;
                    result.suffixes = self.suffixes;
                    return result;
                }
                this.loadFiles = function (index, onSuccess, onFail) {
                    if (self.canceled) {
                        return;
                    }
                    var r = create_iiData(arguments);
                    $.ajax(r.getPath(), {
                        success: function () {
                            god.safeFunction(r.onSuccess).execute(r);
                            r.nextIndex(self.loadFiles);
                        },
                        error: function () {
                            r.nextSuffix(self.loadFiles, function () {
                                self.reset();
                                god.safeFunction(r.onFail).execute(r);
                            });
                        },
                    });
                };
                this.loadImgs = function (index, onSuccess, onFail) {
                    if (god.modes.coding) {
                        if (typeof index === "function") {
                            index(new Image());
                            onSuccess(new Image());
                        } else {
                            onSuccess(new Image());
                            onFail(new Image());
                        }
                    }
                    if (self.canceled) {
                        return;
                    }
                    var r = create_iiData(arguments);
                    var img = document.createElement("img");
                    img.onerror = function () {
                        r.nextSuffix(self.loadImgs, function () {
                            self.reset();
                            god.safeFunction(r.onFail).execute(r.index);
                        });
                    };
                    img.onload = function (e) {
                        god.safeFunction(r.onSuccess).execute(e.target);
                        r.nextIndex(self.loadImgs);
                    };
                    img.src = r.getPath();
                }
            }
            return new idIndexFileInner();
        })();
        this.request = (function () {
            function innerClass() {
                var innerUrl, innerData, serverMethod, serverMethodKey = "serverMethod";
                this.setUrl = function (url) {
                    innerUrl = url;
                    return this;
                }
                this.setServerMethodKey = function (key) {
                    serverMethodKey = key;
                }
                var requests = [];
                this.prepare = function (method, data, url) {
                    if (arguments.length > 0) {
                        serverMethod = arguments[0];
                    }
                    if (arguments.length > 1) {
                        innerData = arguments[1];
                    }
                    if (arguments.length > 2) {
                        innerUrl = arguments[2];
                    }
                    return this;
                };
                this.send = function (callback, tag) {
                    if (requests.indexOf(tag) > -1) {
                        return self.window.toast("正在获取数据，请稍候……");
                    }
                    if (typeof innerData === "object") {
                        if (serverMethodKey && serverMethod) {
                            innerData[serverMethodKey] = serverMethod;
                        }
                    }
                    if (tag) {
                        requests.push(tag)
                    }
                    var random = parseInt(Number.MAX_VALUE * Math.random());
                    $.ajax(self.formatString("{0}?random{1}={1}", innerUrl, random), {
                        data: innerData,
                        success: function (response) {
                            try {
                                callback && callback(response);
                            } catch (e) {
                                self.window.toast(e.message);
                            }
                        },
                        error: function (e) {

                        },
                        complete: function () {
                            requests.splice(requests.indexOf(tag), 1);
                            serverMethod = "";
                            innerData = {};
                        }
                    });
                }
            };
            return new innerClass();
        })();
        this.safeFunction = function (func, thisArg) {
            if (!thisArg) {
                thisArg = this.safeFunction.thisArg;
            }
            function safeFunctionInner() {
                this.execute = function () {
                    if (typeof func === "function") {
                        try {
                            func.call(thisArg, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                        } catch (e) {
                        }
                    }
                };
            }
            return new safeFunctionInner();
        };
        this.safeFunction.thisArg = window;
        this.removeItem = function (arr, filter) {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (filter.call(arr[i], i)) {
                    arr.splice(i, 1);
                }
            }
        };
    };
    this.god = new GodThere();
})();
document.head.innerHTML += '<style type="text/css">@keyframes slide2topPosition{to{bottom:256px;display:none;}}@keyframes slide2topColor{to{color:rgba(0,0,0,0);background-color:rgba(0,0,0,0);border-color:rgba(0,0,0,0);}}.toast,.toast_slide2top{bottom:0;position:fixed;width:100%;text-align:center;z-index:1111;animation:slide2topPosition 2s cubic-bezier(0,1,0.5,1) 1 normal;}.toast .toastInner,.toast_slide2top .toastInner{padding:5px;display:inline-block;background-color:#393939;color:#a4a4a4;border-radius:5px;animation:slide2topColor 2s ease 1 normal;}</style>';