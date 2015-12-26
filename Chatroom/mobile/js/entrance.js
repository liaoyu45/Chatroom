/// <reference path="god.js" />
/// <reference path="E:\Documents\Visual Studio 2013\Projects\LoveFactory\Chatroom\Scripts/jquery-2.1.3.js" />
$(function () {
    var $email = $("#email");
    var $password = $("#password");
    var $passwordRepeat = $("#passwordRepeat");
    var $enter = $("#enter");
    var $switcher = $("#switcher");
    var $registerPart = $("#registerPart");
    var $h1 = $("h1");
    var textR = /\w{4,16}/;
    var emailR = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
    var logining = true;
    var registering = false;
    var requesting = false;
    var url = "/LoveShop.ashx";
    $registerPart.hide();
    $h1.html("登录");
    $switcher.html("注册").click(function () {
        if (requesting) {
            return god.window.toast("正在请求数据中");
        }
        logining = !logining;
        registering = !registering;
        $switcher.html(registering ? "登录" : "注册");
        $h1.html(registering ? "注册" : "登录");
        $registerPart.toggle(registering);
    });

    $enter.click(function () {
        var message = (function () {
            if (requesting)
                return "正在请求数据中";
            if (!emailR.test($email.val())) {
                return "请填写正确的电子邮箱地址";
            } else if (!textR.test($("#password").val())) {
                return "密码长度应为4-16位字母或数字";
            } else if (registering && $password.val() != $passwordRepeat.val()) {
                return "两次输入密码不一致";
            } else {
                return false;
            }
        })();
        if (message) return god.window.toast(message);
        requesting = true;
        $.ajax(url, {
            type: "post",
            data: {
                serverMethod: logining ? "login" : "register",
                email: $email.val(),
                password: $password.val(),
            },
            success: function (protocal) {
                if (god.modes.debugging) {
                    window.open("menhub.html" + god.formatString("?id={0}&key={1}", protocal.id, protocal.key), "_blank");
                    return;
                }
                localStorage.setItem("id", protocal.id);
                localStorage.setItem("key", protocal.key);
                window.open("menhub.html","_blank");
                window.close();
            },
            error: function (e) {
                if (god.modes.debugging) {
                    alert(e.responseText);
                }
                if (logining) alert("用户名或密码错误");
                if (registering) alert("此电子邮箱地址已被占用");
            },
            complete: function () {
                requesting = false;
            },
        });
    });
});