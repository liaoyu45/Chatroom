/// <reference path="/Scripts/knockout-3.3.0.js" />
/// <reference path="/Scripts/jquery-2.1.3.js" />
/// <reference path="/Scripts/jquery.signalR-2.2.0.js" />
/// <reference path="/Scripts/knockout-3.3.0.debug.js" /> 
/// <reference path="god.js" />
/// <reference path="/Scripts/jquery.mobile-1.4.5.js" />
/// <reference path="/hubs.js" />
god.request.setUrl("/LoveShop.ashx");
function Message(words, sender, reciever, whisper) {
    this.id = parseInt(Math.random() * 100000000);
    this.sent = ko.observable(false);
    this.words = words;
    this.sender = sender;
    this.reciever = reciever;
    this.whisper = !!whisper;
    this.mine = !sender;
    this.time = new Date();
    this.photo = ko.observable();
    this.timeText = god.formatTime(this.time);
    this.data = { id: this.id, words: this.words, sender: 0, reciever: 0, whisper: whisper };
    if (this.sender) {
        this.data.sender = this.sender.id;
    }
    if (this.reciever) {
        this.data.reciever = this.reciever.id;
    }
}
Message.prototype.words = "";
Message.prototype.time = god.initiatedTime;
Message.prototype.sender = 0;
Message.prototype.reciever = 0;
Message.prototype.mine = true;
Message.prototype.timeText = "";
Message.prototype.data = {};
function Man(id, name, ahwc) {
    var self = this;
    this.id = id;
    this.name = name;
    this.ahwc = ahwc;
    this.displayName = god.formatString("{0}（{1}）", name, ahwc);
    this.enterTime = new Date();
    this.notices = ko.observable(0);
    this.hasNoticedMe = ko.observable(true);
    this.whisper = ko.observable(false);
    this.conversation = ko.observableArray();
    this.lastTime = ko.observable(god.initiatedTime);
    this.timeText = ko.computed(function () {
        return god.formatTime(this.lastTime());
    }, this);
    this.lastWords = ko.observable("");
    this.photo = ko.observable("");
    god.idIndexFile.initiate("/photos", this.id).loadImgs(function (e) {
        self.photo(e.src);
    }, function () {
        self.photo("hi.jpg");
    });
    this.addMessage = function (message, notice) {
        if (god.modes.coding) {
            message = new Message();
        }
        this.conversation.push(message);
        this.lastTime(message.time);
        this.lastWords(message.words);
    };
    if (god.modes.coding) {
        this.id(0);
        this.name("");
        this.conversation([new Message()]);
    }
}
Man.prototype.id = 0;
Man.prototype.name = "";
Man.prototype.ahwc = "";
function BearChaser(id, key, url) {
    if (god.modes.coding) {
        this.men([new Man()]);
        this.husbear(new Man());
        this.noises([new Message()]);
        this.allMyWords([new Message()]);
    }
    god.safeFunction.thisArg = this;
    var lonelyBoy = this;
    this.getMan = function (id) {
        if (god.modes.coding) {
            return new Man();
        }
        for (var i = 0; i < this.men().length; i++) {
            if (lonelyBoy.men()[i].id == id)
                return lonelyBoy.men()[i];
        }
    };
    this.isHusbear = function (him) {
        return lonelyBoy.husbear() === him;
    };
    this.menInContact = ko.computed(function () {
        if (god.modes.coding) {
            return [new Man()];
        }
        return lonelyBoy.men().filter(function (m) {
            return m.lastTime() != god.initiatedTime;
        });
    });
    if (god.modes.coding) {
        this.menInContact = ko.observableArray([new Man()]);
    }
    function onMessage(sender, words, whisper) {
        sender = lonelyBoy.getMan(sender);
        var message = new Message(words, sender, null, whisper);
        sender.addMessage(message, true);
        sender.notices(sender.notices() + 1);
        god.safeFunction(lonelyBoy.onMessageGot).execute(sender, message);
    }
    function onNoise(sender, reciever, words) {
        sender = lonelyBoy.getMan(sender);
        reciever = lonelyBoy.getMan(reciever);
        var noise = new Message(words, sender, reciever);
        lonelyBoy.noises.push(noise);
        god.safeFunction(lonelyBoy.onNoiseGot).execute(noise);
    }
    function enter(data) {
        var again = lonelyBoy.men().some(function (m) {
            return m.id === data.id;
        });
        if (again) {
            return;
        }
        var man = new Man(data.id, data.name, data.ahwc);
        lonelyBoy.men.push(man);
        return man;
    }
    function onMember(data, online) {
        var man = (online ? enter : leave)(data);
        god.safeFunction(lonelyBoy.onMemberMoved).execute(man, online);
    }
    function leave(data) {
        if (lonelyBoy.husbear() && lonelyBoy.husbear().id === data.id) {
            god.safeFunction(lonelyBoy.onHusbearLeaving).execute(lonelyBoy.husbear());
            lonelyBoy.husbear(null);
        }
        lonelyBoy.noises.remove(function (m) {
            return m.data.sender === data.id || m.data.reciever === data.id;
        });
        lonelyBoy.allMyWords.remove(function (w) {
            return w.data.reciever === data.id;
        });
        var man = lonelyBoy.men.remove(function (m) {
            if (god.modes.coding) return true;
            return m.id === data.id;
        })[0];
        return man;
    }
    function onMembersListting(data) {
        enter(data);
    }
    function onSent(messageId, sent) {
        var msg = lonelyBoy.allMyWords().filter(function (e) {
            if (god.modes.coding) {
                return true;
            }
            return e.id === messageId;
        })[0];
        msg.sent(sent);
        if (msg.data.reciever) {
            lonelyBoy.getMan(msg.data.reciever).addMessage(msg, false);
        }
        if (!msg.whisper) {
            lonelyBoy.noises.push(msg);
        }
        god.safeFunction(lonelyBoy.onMessageSent).execute(msg);
    }
    function onIgnored(him, willing) {
        var focusing = false;
        if (lonelyBoy.husbear() && lonelyBoy.husbear().id === him) {
            lonelyBoy.husbear(null);
            focusing = true;
        }
        var basterd = lonelyBoy.men.remove(function (m) {
            return m.id === him;
        })[0];
        lonelyBoy.noises.remove(function (n) {
            return n.data.sender === him || n.data.reciever === him;
        });
        lonelyBoy.allMyWords.remove(function (w) {
            return w.data.reciever === him;
        });
        god.safeFunction(lonelyBoy.onBasterdIgnored).execute(basterd.name, willing, focusing);
    }
    this.forget = function () {
        lonelyBoy.husbear(null);
    };
    this.tryToLove = function (man) {
        if (lonelyBoy.men().indexOf(man) < 0) {
            god.safeFunction(lonelyBoy.onHusbearLeft).execute(man);
            return;
        }
        if (lonelyBoy.husbear() === man) {
            return;
        }
        lonelyBoy.husbear(man);
        lonelyBoy.husbear().notices(0);
        god.safeFunction(lonelyBoy.onFascinating).execute(man);
    };
    this.shouting = ko.computed(function () {
        var all = lonelyBoy.noises();
        if (all.length === 0) {
            return false;
        }
        return all[all.length - 1].mine;
    });
    this.allNoticesCount = ko.computed(function () {
        var result = 0;
        for (var i = 0; i < lonelyBoy.men().length; i++) {
            result += lonelyBoy.men()[i].notices();
        }
        return result;
    });
    this.clearNotices = function () {
        for (var i = 0; i < lonelyBoy.men().length; i++) {
            lonelyBoy.haveNoticedHim(lonelyBoy.men()[i], true);
        }
    };
    this.haveNoticedHim = function (man, inBatch) {
        if (!man) {
            man = lonelyBoy.husbear();
        }
        if (!man) {
            return;
        }
        man.notices(0);
        god.safeFunction(lonelyBoy.onNoticesCleared).execute(man, inBatch);
    };
    this.speak = this.shout = this.ignore = this.exit = function () { };
    $.connection.hub.qs = { id: id, key: key };
    if (url) {
        $.connection.hub.url = url;
    }
    var menhub = $.connection.menhub;
    menhub.client.onMessage = onMessage;
    menhub.client.onSent = onSent;
    menhub.client.onMember = onMember;
    menhub.client.onMembersListting = onMembersListting;
    menhub.client.onNoise = onNoise;
    menhub.client.onIgnored = onIgnored;
    $.connection.hub.start().done(function () {
        lonelyBoy.speak = function () {
            var words = lonelyBoy.words().trim();
            if (!words) {
                god.safeFunction(lonelyBoy.onSilent).execute();
                return;
            }
            lonelyBoy.words("");
            var man = lonelyBoy.husbear();
            var whisper = !!man && man.whisper();
            var msg = new Message(words, null, man, whisper);
            lonelyBoy.allMyWords.push(msg);
            menhub.server.speak(msg.data).done(function () {
                console.log();
            });
        };
        lonelyBoy.shout = function () {
            if (!!this.husbear()) {
                this.husbear().whisper(false);
            }
            lonelyBoy.speak();
        };
        lonelyBoy.ignore = function (basterd) {
            var him = basterd || lonelyBoy.husbear();
            if (!him) {
                return;
            }
            if (god.safeFunction(lonelyBoy.OnIgnoring).execute(him)) {
                return;
            }
            if (him === lonelyBoy.husbear()) {
                lonelyBoy.husbear(null);
            }
            var id = him.id;
            var data = {
                basterd: id
            };
            if (god.modes.debugging) {
                data.fucker = god.window.queryString("id");
            }
            god.request.prepare("IgnoreHim", data).send(function () {
                menhub.server.ignore(id);
            });
        };
        lonelyBoy.exit = function () {
            menhub.server.exit();
            localStorage.removeItem("id");
            localStorage.removeItem("key");
        };
    }).fail(function (e) {
        alert("服务器异常！");
    });
}
BearChaser.prototype.husbear = ko.observable();
BearChaser.prototype.noises = ko.observableArray();
BearChaser.prototype.allNoticesCount = ko.observable(0);
BearChaser.prototype.words = ko.observable("");
BearChaser.prototype.conversations = ko.observableArray();
BearChaser.prototype.allMyWords = ko.observableArray();

BearChaser.prototype.men = ko.observableArray();
BearChaser.prototype.menInContact = ko.observableArray();

BearChaser.prototype.onFascinating = null;
BearChaser.prototype.onHusbearLeft = null;
BearChaser.prototype.onNoiseGot = null;
BearChaser.prototype.onMessageGot = null;
BearChaser.prototype.onMessageSent = null;
BearChaser.prototype.onMemberMoved = null;
BearChaser.prototype.onHusbearLeaving = null;
BearChaser.prototype.onSilent = null;
BearChaser.prototype.onNoticesCleared = null;
BearChaser.prototype.OnIgnoring = null;
BearChaser.prototype.onBasterdIgnored = null;
BearChaser.prototype.onExit = null;
if (god.modes.coding) {
    ko.applyBindings(new BearChaser());
}
if (god.modes.debugging) {
    BearChaser.prototype.debug = function () {
        console.log();
    };
}