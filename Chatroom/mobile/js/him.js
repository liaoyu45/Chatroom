/// <reference path="god.js" />
/// <reference path="soul.js" />
/// <reference path="menhub.js" />
function Man() {
    this.AHWC = ko.observable("");
    this.Filter = ko.observable("");
    this.Introduce = ko.observable("");
    this.Name = ko.observable("");
    this.RegisterTime = ko.observable("");
    this.Taste = ko.observable("");
    this.Relationship = ko.observable("");
}
var man = new Man();
ko.applyBindings(man);
var data = {
    him: god.window.queryString("him"),
    fucker: god.window.queryString("fucker")
};
soul.prepare(soul.actions.hisData, data).done(function () {
    for (var i in data) {
        if (man.hasOwnProperty(i)) {
            man[i](data[i]);
        }
    }
});