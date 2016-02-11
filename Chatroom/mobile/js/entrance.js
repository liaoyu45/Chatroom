/// <reference path="god.js" />
/// <reference path="soul.js" />
/// <reference path="/Scripts/knockout-3.3.0.debug.js" />
function Entrance() {
    var self = this;
    this.errorMessage = ko.observable();
    this.email = ko.observable("liaoyu45@163.com");
    this.password = ko.observable("qwe123");
    this.passwordRepeat = ko.observable("qwe123");
    this.pageAction = ko.observable(true);
    var requesting = false;
    function validate() {
        var msg = (function () {
            if (requesting) {
                return "正在请求数据中";
            }
            if (!/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(self.email())) {
                return "请填写正确的电子邮箱地址";
            }
            if (!/\w{4,16}/.test(self.password())) {
                return "密码长度应为4-16位字母或数字";
            }
            if (!self.pageAction() && self.password() !== self.passwordRepeat()) {
                return "两次输入密码不一致";
            }
            return false;
        })();
        if (msg) {
            self.errorMessage(msg);
        }
        return !!msg;
    }
    function success(protocal) {
        if (god.modes.debugging) {
            window.open("menhub.html" + god.formatString("?id={0}&key={1}", protocal.id, protocal.key), "_blank");
            return;
        }
        localStorage.setItem("id", protocal.id);
        localStorage.setItem("key", protocal.key);
        window.open("menhub.html", "_blank");
        window.close();
    }
    function error(e) {
        if (god.modes.debugging) {
            alert(e.responseText);
        }
        var error = self.pageAction() ? "用户名或密码错误" : "此电子邮箱地址已被占用"
        alert(error);
    }
    function complete() {
        requesting = false;
    }
    this.enter = function () {
        if (validate()) {
            return;
        }
        var action = self.pageAction() ? soul.actions.login : soul.actions.register;
        var data = { email: self.email(), password: self.password() };
        soul.prepare(action, data).done(success).failed(error).finished(complete).start();
    };
    this.testDDDD = function () {
        soul.prepare(soul.actions.login, { email: "dddd@163.com", password: "qwe123" }).done(success).failed(error).finished(complete).start();
    };
    this.testWWWW = function () {
        soul.prepare(soul.actions.login, { email: "wwww@163.com", password: "qwe123" }).done(success).failed(error).finished(complete).start();
    };
    this.resetTestData = function () {
        soul.prepare(soul.actions.resetTestData).start();
    };
}
ko.applyBindings(new Entrance());