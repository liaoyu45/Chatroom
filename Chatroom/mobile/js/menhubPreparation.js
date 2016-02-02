/// <reference path="../menhub.html" />
/*global window,$,ko,BearChaser,god*/
/*global toPersonalButton,conversationWords,hallWords*/
/// <reference path="menhub.js" />
/// <reference path="menhubExtensions.js" />
var menhub = {
    id: (function () {
        if (god.modes.debugging) {
            return god.window.queryString("id");
        }
        return window.localStorage.getItem("id");
    })(),
    key: (function () {
        if (god.modes.debugging) {
            return god.window.queryString("key");
        }
        return window.localStorage.getItem("key");
    })(),
    conditions: {
        inHall: function () {
            return location.href.indexOf('#') === -1;
        },
        inConversation: function () {
            return location.href.indexOf("#conversationPage") > -1;
        },
        inOptionsDialog: function () {
            return location.href.indexOf("#optionsDialog") > -1;
        },
        inMainPages: function () {
            /// <summary>Return true if current page is hallPage.</summary>
            return location.href.indexOf("#") === -1;
        }
    },
    focusWords: function () {
        /// <summary>Make the words input box focused.</summary>
        if (menhub.conditions.inHall()) {
            noisesWords.focus();
        }
        if (menhub.conditions.inConversation()) {
            conversationWords.focus();
        }
    }
};
if (god.modes.debugging) {
    toPersonalButton.href += "?fucker=" + menhub.id;
}
var lonelyBoy = new BearChaser(menhub.id, menhub.key);
ko.applyBindings(lonelyBoy);
lonelyBoy.onMessageGot = function (man, message) {
    if (menhub.conditions.inConversation()) {
        if (lonelyBoy.husbear().id === man.id) {
            conversation.lastElementChild.scrollIntoView();
            return;
        }
    }
    god.window.toast(god.formatString("{0}发来一条消息", man.data().name));
};
lonelyBoy.onNoiseGot = function (noise) {

};
lonelyBoy.onHusbearLeft = function (man) {
    god.window.toast(man.data().name + "已下线");
};
lonelyBoy.onMessageSent = function (msg) {
    menhub.focusWords();
    if (menhub.conditions.inHall()) {
        if (lonelyBoy.shouting()) {
            god.window.toast("已发送");
        }
    }
    if (menhub.conditions.inConversation()) {
        conversation.lastElementChild.scrollIntoView();
    }
};
lonelyBoy.onMemberMoved = function (man, online) {
    var message = man.data().name + (online ? "加入" : "离开") + "了聊天室";
    god.window.toast(message);
    if (online) {

    }
};
lonelyBoy.onTryingToLove = function (man) {
    menhub.focusWords();
    soul.prepare(soul.actions.hisData, { him: id }).done(function (data) {
        for (var i in data) {
            var newI;
            if (/[A-Z]+/.test(i)) {
                newI = i.toLowerCase();
            } else {
                newI = i[0].toLowerCase() + i.substr(1);
            }
            man.data()[newI] = data[i];
        }
    }, true);
};
lonelyBoy.onSilent = function () {
    menhub.focusWords();
};
window.closed = function () {
    lonelyBoy.exit();
};
lonelyBoy.onHusbearLeaving = function () {
    var goback = setInterval(function () {
        if (menhub.conditions.inMainPages()) {
            clearInterval(goback);
            return;
        }
        history.back();
    }, 123);
};
lonelyBoy.beforeIgnoring = function (basterd) {
    var yes = confirm("使用此帐号登录时，彼此将永远不再出现在对方的在线成员列表内。确定？");
    return yes;
};
lonelyBoy.onIgnored = function (basterd, willing) {
    if (willing) {
        alert(basterd + "已被屏蔽。");
        return;
    }
    if (lonelyBoy.husbear().id === basterd) {
        alert("你被他屏蔽了……");
        history.back();
        return;
    }
    alert("有人屏蔽了你……");
};
noisesWords.onkeypress = function (e) {
    lonelyBoy.words(e.target.value);
    if (e.keyCode === 13) {
        lonelyBoy.shout();
    }
};
conversationWords.onkeypress = function (e) {
    lonelyBoy.words(e.target.value);
    if (e.keyCode === 13) {
        lonelyBoy.speak();
    }
};
$(document).on("pageshow", "#conversationPage", function () {
    
});
hallHeader.onclick = function () {
    if (noises.lastElementChild) {
        noises.lastElementChild.scrollIntoView();
    }
};