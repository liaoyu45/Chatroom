/// <reference path="../personal.html" />
/// <reference path="/Scripts/jquery-2.1.3.js" />
/// <reference path="god.js" />
/// <reference path="/Scripts/knockout-3.3.0.debug.js" />
god.request.setUrl("/Soul.ashx");
var id = (function () {
    if (god.modes.debugging) {
        var fucker = god.window.queryString("fucker");
        $("form").each(function () {
            $(this).append($("<input>").attr("name", "fucker").val(fucker));
        });
        return fucker;
    }
    return localStorage.getItem("id");
})();
submitButton.onclick = function () {
    $("#dataForm").ajaxSubmit(function () {
        alert("修改成功~");
    });
    return false;
};
modifyPhoto.onclick = function () {
    photoForm.photoFile.click();
};
photoForm.photoFile.onchange = function () {
    var filepath = photoForm.photoFile.value.split('.');
    var suffix = filepath[filepath.length - 1];
    if (["jpg", "bmp", "gif", "png"].indexOf(suffix) === -1) {
        alert("格式不正确！");
        return;
    }
    $("#photoForm").ajaxSubmit(function (path) {
        alert("上传成功！");
    });
};
function Me() {
    this.Birthday = ko.observable(new Date());
    this.Height = ko.observable(0);
    this.Weight = ko.observable(0);
    this.Charactor = ko.observable("");
    this.Name = ko.observable("");
    this.Introduce = ko.observable("");
    this.Taste = ko.observable("");
    this.Filter = ko.observable("");
    this.orignal = null;
    this.reset = function () {
        for (var i in this.orignal) {
            if (this.hasOwnProperty(i)) {
                this[i](this.orignal[i]);
            }
        }
        $("select").selectmenu("refresh");
    }
};
var me = new Me();
god.request.prepare("MyData", { fucker: god.window.queryString("fucker") }).send(function (data) {
    me.orignal = data;
    me.reset();
});
ko.applyBindings(me);
$(document).on("pageshow", "#photosPage", function () {
    god.request.prepare("GetPhotos").send(function (photos) {
        for (var i = 0; i < photos; i++) {
            var p = document.createElement("img");
            p.src = photos[i];
            p.className = "ui-block-b";
            p.onclick = function (e) {
                $(e.target).dialog();
            };
            gallery.appendChild(p);
        }
    });
});