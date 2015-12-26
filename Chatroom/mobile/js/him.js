god.request.setUrl("/LoveShop.ashx");
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
god.request.prepare("HisData", {
    him: god.window.queryString("him"),
    fucker: god.window.queryString("fucker")
}).send(function (data) {
    for (var i in data) {
        if (man.hasOwnProperty(i)) {
            man[i](data[i]);
        }
    }
});
