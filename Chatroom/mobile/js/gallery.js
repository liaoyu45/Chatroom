/// <reference path="../gallery.html" />
var id = location.href.split('=')[1];
god.idIndexFile.initiate("/photos", id).loadImgs(function (a) {
    gallery.appendChild(a);
})