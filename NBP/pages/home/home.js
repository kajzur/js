(function () {
    "use strict";
    WinJS.UI.Pages.define("/pages/home/home.html", {

    ready: function () {
        "use strict";
        document.getElementById("header").textContent = Helpers.appName;
        var objectToList = [];
        var bottomListData = [];
        function parseDate(input, filename) {
            return {
                date: input.substring(4) + "." + input.substring(2, 4) + ".20" + input.substring(0, 2),
                filename: filename
            };
        }

        function isObject(obj) {
            return typeof obj === 'object';
        }

        var rightListClickHandler = function (ev) {
            ev.detail.itemPromise.then(function (item) {
                WinJS.Application.sessionState.helpersObj = JSON.stringify(Helpers);
                WinJS.Application.sessionState.currentItem = JSON.stringify(item.data);
                WinJS.Navigation.navigate(
                "/pages/trends/trends.html", item.data);
            }
            );
        }

        var leftListClickHandler = function (ev) {
            ev.detail.itemPromise.then(function (invokedItem) {
                Windows.Storage.ApplicationData.current.roamingSettings.values["date"] = JSON.stringify(invokedItem.data);
                var filename = invokedItem.data.filename + ".xml";
                document.getElementById("selectedDate").textContent = "Dane na dzień " + invokedItem.data.date;

                Helpers.getContentFormUrl(Helpers.nbpUrlPrefix +filename, function (result) {
                    var xml = result.responseXML;
                    var items = xml.getElementsByTagName("pozycja");
                    for (var itemIndex in items) {
                        var item = items[itemIndex];
                        if (!isObject(item)) continue;
                        var object = {
                            nazwaWaluty: item.getElementsByTagName("nazwa_waluty")[0].textContent,
                            kod_waluty: item.getElementsByTagName("kod_waluty")[0].textContent,
                            przelicznik: item.getElementsByTagName("przelicznik")[0].textContent,
                            kurs_sredni: item.getElementsByTagName("kurs_sredni")[0] !== undefined ? item.getElementsByTagName("kurs_sredni")[0].textContent : item.getElementsByTagName("kurs_kupna")[0].textContent
                        }

                        bottomListData.push(object);
                    }

                    var dataList = new WinJS.Binding.List(bottomListData);

                    var bottomList = document.getElementById('bottomList').winControl;
                    bottomList.itemDataSource = dataList.dataSource;
                    bottomList.addEventListener("iteminvoked", rightListClickHandler);
                    bottomList.selectionMode = WinJS.UI.SelectionMode.single;
                    bottomListData = [];
                })

            });

        };

        Helpers.getContentFormUrl(Helpers.nbpUrlPrefix+"dir.txt", function (result) {

            var fileNames = result.responseText.split("\r\n");
            var objectToList = [];
            for (var index in fileNames) {
                var filename = fileNames[index];
                if (filename.substring(0, 1) == "a") {
                    var part = filename.substring(5);
                    objectToList.push(parseDate(part, filename));
                }

            }
            objectToList.reverse();

            var dataList = new WinJS.Binding.List(objectToList);

            var topList = document.getElementById('leftList').winControl;
            topList.itemDataSource = dataList.dataSource;
            topList.addEventListener("iteminvoked", leftListClickHandler);
            topList.selectionMode = WinJS.UI.SelectionMode.single;


        })

    }
    });
})();
