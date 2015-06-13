(function () {
    "use strict";
    WinJS.UI.Pages.define("/pages/trends/trends.html", {

        ready: function (element, options) {
            "use strict";
            if (WinJS.Application.sessionState.helpersObj !== undefined) {
                var lastHelpers = JSON.parse(WinJS.Application.sessionState.helpersObj);//recover helpers
                Helpers.appName = lastHelpers.appName;
            }
            if (WinJS.Application.sessionState.currentItem !== undefined) {
                options = JSON.parse(WinJS.Application.sessionState.currentItem);
                Helpers.getFlyElement();
            }
            document.getElementById("header").textContent = Helpers.appName + " - " + options.kod_waluty;
            var drawObj = document.getElementById("draw");
            Helpers.setFlyElement (options);
            drawObj.addEventListener("click", Helpers.drawChart, options);
            var saveObj = document.getElementById("saveFile");
            saveFile.addEventListener("click", Helpers.saveFile);
        }
    });

})();
