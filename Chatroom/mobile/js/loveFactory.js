/// <reference path="god.js" />
/// <reference path="E:\Documents\Visual Studio 2013\Projects\LoveFactory\Chatroom\Scripts/jquery-2.1.3.js" />
var factory = {
    baseUrl: "loveFactory.ashx",
    getPhoto: function (id, onSuccess, onFail) {
        $.ajax(factory.baseUrl, {
            success: function () {
                god.safeFunction(onSuccess).execute(id);
            }
        });
    },
}