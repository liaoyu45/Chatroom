/// <reference path="/Scripts/knockout-3.3.0.js" />
/// <reference path="/Scripts/jquery-2.1.3.js" />
/// <reference path="/Scripts/jquery.signalR-2.2.0.js" />
/// <reference path="/Scripts/knockout-3.3.0.debug.js" /> 
/// <reference path="god.js" />
/// <reference path="soul.js" />
/// <reference path="menhub.js" />
/// <reference path="/Scripts/jquery.mobile-1.4.5.js" />
/// <reference path="/hubs.js" />
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
function Man(id, loaded) {
    var self = this;
    this.id = id;
    this.data = ko.observable({ ahwc: "", introduce: "", taste: "", filter: "" });
    this.name = ko.observable();
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
    god.safeFunction(this.onLoading, this).execute();
    soul.prepare(soul.actions.hisName, { him: id }).done(function () {
        self.name(name);
        god.safeFunction(loaded).execute();
    });
    if (god.modes.coding) {
        this.conversation([new Message()]);
    }
}
Man.prototype.onLoading = null;
Man.prototype.OnLoaded = null;

function BearChaser(id, key, url) {
    this.husbear = ko.observable();
    this.noises = ko.observableArray();
    this.unreadNoises = ko.observable(0);
    this.allNoticesCount = ko.observable(0);
    this.words = ko.observable("");
    this.conversations = ko.observableArray();
    this.allMyWords = ko.observableArray();
    this.men = ko.observableArray();
    this.menInContact = ko.observableArray();
    function refreshMenInContact(id, deleting) {
        var man = lonelyBoy.getMan(id);
        if (!man) {
            return;
        }
        var exists = lonelyBoy.menInContact().some(function (m) {
            return m.id === id;
        });
        if (exists) {
            if (deleting) {
                lonelyBoy.menInContact.remove(man);
            }
        } else {
            if (!deleting) {
                lonelyBoy.menInContact.push(man);
            }
        }
    }
    function currentMan() {
        return lonelyBoy.husbear();
    }
    function isHusbearId(id) {
        return lonelyBoy.husbear() && lonelyBoy.husbear().id === id;
    }
    if (god.modes.coding) {
        this.men([new Man()]);
        this.husbear(new Man());
        this.noises([new Message()]);
        this.allMyWords([new Message()]);
        this.menInContact = ko.observableArray([new Man()]);
    }
    var lonelyBoy = this;
    this.getMan = function (id) {
        if (god.modes.coding) {
            return new Man();
        }
        for (var i = 0; i < lonelyBoy.men().length; i++) {
            if (lonelyBoy.men()[i].id == id)
                return lonelyBoy.men()[i];
        }
    };
    this.isHusbear = function (him) {
        return lonelyBoy.husbear() === him;
    };
    this.clearUnreadNoises = function () {
        lonelyBoy.unreadNoises(0);
    };
    this.forget = function () {
        lonelyBoy.husbear(null);
    };
    this.tryToLove = function (man) {
        if (god.modes.coding) {
            man = new Man();
        }
        if (lonelyBoy.men().indexOf(man) < 0) {
            god.safeFunction(lonelyBoy.onHusbearLeft).execute(man);
            return;
        }
        if (lonelyBoy.husbear() === man) {
            return;
        }
        lonelyBoy.husbear(man);
        lonelyBoy.husbear().notices(0);
        god.safeFunction(lonelyBoy.onTryingToLove).execute(man);
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
            lonelyBoy.men()[i].notices(0);
        }
    };
    this.speak = this.shout = this.ignore = this.exit = god.emptyFunction;
    function onMessage(sender, words, whisper) {
        refreshMenInContact(sender, false);
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
        lonelyBoy.unreadNoises(lonelyBoy.unreadNoises() + 1);
        god.safeFunction(lonelyBoy.onNoiseGot).execute(noise);
    }
    function enter(id) {
        var again = lonelyBoy.men().some(function (m) {
            return m.id === id;
        });
        if (again) {
            return;
        }
        var man = new Man(id, function () {
            lonelyBoy.men.push(man);
            god.safeFunction(lonelyBoy.onMemberMoved).execute(man, true);
        });
        return man;
    }
    function onMember(id, online) {
        (online ? enter : leave)(id);
    }
    function someoneHasLeft(id) {
        if (isHusbearId(id)) {
            lonelyBoy.forget();
        }
        refreshMenInContact(id, true);
        lonelyBoy.noises.remove(function (m) {
            return m.data.sender === id || m.data.reciever === id;
        });
        lonelyBoy.allMyWords.remove(function (w) {
            return w.data.reciever === id;
        });
        lonelyBoy.men.remove(function (m) {
            if (god.modes.coding) return true;
            return m.id === id;
        })[0];
    }
    function leave(id) {
        if (isHusbearId(id)) {
            god.safeFunction(lonelyBoy.onHusbearLeaving).execute(lonelyBoy.husbear());
        } else {
            god.safeFunction(lonelyBoy.onMemberMoved).execute(man, false);
        }
        someoneHasLeft(id);
    }
    function onMembersListting(id) {
        enter(id);
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
            refreshMenInContact(msg.data.reciever, true);
            var reciever = lonelyBoy.getMan(msg.data.reciever);
            reciever.addMessage(msg, false);
        }
        if (!msg.whisper) {
            lonelyBoy.noises.push(msg);
        }
        god.safeFunction(lonelyBoy.onMessageSent).execute(msg);
    }
    function onNotSent(id) {
        var words = lonelyBoy.allMyWords.remove(function (e) {
            if (god.modes.coding) {
                return true;
            }
            return e.id === id;
        })[0].words;
        god.safeFunction(lonelyBoy.onMessageNotSent).execute(words);
    }
    function onIgnored(id, willing) {
        var basterd = lonelyBoy.getMan(id);
        god.safeFunction(lonelyBoy.onIgnored).execute(basterd.data().name, willing);
        someoneHasLeft(id);
    }
    $.connection.hub.qs = { id: id, key: key };
    if (url) {
        $.connection.hub.url = url;
    }
    var menhub = $.connection.menhub;
    menhub.client.onMessage = onMessage;
    menhub.client.onSent = onSent;
    menhub.client.onNotSent = onNotSent;
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
        lonelyBoy.ignore = function () {
            var him = currentMan();
            if (!god.safeFunction(lonelyBoy.beforeIgnoring).execute(him)) {
                return;
            }
            god.safeFunction(lonelyBoy.onIgnoring).execute(him);
            lonelyBoy.forget();
            var id = him.id;
            var data = {
                basterd: id
            };
            if (god.modes.debugging) {
                data.fucker = god.window.queryString("id");
            }
            soul.prepare(soul.actions.ignoreHim, data).done(function () {
                menhub.server.ignore(id);
            }, true);
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

BearChaser.prototype.onTryingToLove = null;
BearChaser.prototype.onHusbearLeft = null;
BearChaser.prototype.onNoiseGot = null;
BearChaser.prototype.onMessageGot = null;
BearChaser.prototype.onMessageSent = null;
BearChaser.prototype.onMessageNotSent = null;
BearChaser.prototype.onMemberMoved = null;
BearChaser.prototype.onHusbearLeaving = null;
BearChaser.prototype.onSilent = null;
/// <summary>If sure to ignore, return true please.</summary>
BearChaser.prototype.beforeIgnoring = null;
BearChaser.prototype.onIgnoring = null;
BearChaser.prototype.onIgnored = null;
BearChaser.prototype.onExit = null;
if (god.modes.coding) {
    ko.applyBindings(new BearChaser());
}
if (god.modes.debugging) {
    BearChaser.prototype.debug = function () {
        console.log();
    };
}