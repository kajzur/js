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
            var saveFileObj = document.getElementById("saveFile");
            Helpers.setFlyElement (options);
            saveFileObj.addEventListener("click", Helpers.drawChart, options);
        }
    });

})();
