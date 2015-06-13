var Helpers = {
    getContentFormUrl: function (url, callback) {
        WinJS.xhr({ url: url })
            .done(callback);
    },
    nbpUrlPrefix: "http://www.nbp.pl/kursy/xml/",
    appName: "NBP Reader JS",
    getFlyElement: function () {
        var data = Helpers.flyElement;
        Helpers.flyElement = undefined;
        return data;
    },
    setFlyElement: function (vars) {
        if(Helpers.flyElement !== undefined)
            throw ("FlyElement not undefined!");
        Helpers.flyElement = vars;
    },
    flyElement: undefined,
    getDataForChart: function(validFileNames, currentData, afterCallback){
        for (var index in validFileNames) {
            var filename = validFileNames[index];
            var url = Helpers.nbpUrlPrefix + filename + ".xml";
            var chartValues = [];
            function isObject(obj) {
                return typeof obj === 'object';
            }
            Helpers.getContentFormUrl(url, function (res) {
                var xml = res.responseXML;
                var items = xml.getElementsByTagName("pozycja");
                for (var itemIndex in items) {
                    var item = items[itemIndex];
                    var date = xml.getElementsByTagName("data_publikacji")[0].textContent;
                    if (!isObject(item)) continue;
                    if (item.getElementsByTagName("kod_waluty")[0].textContent !== currentData.kod_waluty) continue;
                    var object = [];
                    object[0] = date;
                    object[1] = item.getElementsByTagName("kurs_sredni")[0] !== undefined ? item.getElementsByTagName("kurs_sredni")[0].textContent : item.getElementsByTagName("kurs_kupna")[0].textContent;
                    chartValues.push(object);
                }
                
            });

        }
        var checker = setInterval(function () {
            if (chartValues === undefined) {
                clearInterval(checker);
                return;
            };
            if (chartValues.length === validFileNames.length) {
                clearInterval(checker);
                afterCallback(chartValues);
            }
        }, 500);
    },
    drawChart: function (eventInfo) {
        var currentData = Helpers.getFlyElement();
        Helpers.setFlyElement(currentData);
        var fromDate = document.getElementById("fromDate").winControl.current;
        var toDate = document.getElementById("toDate").winControl.current;
        Helpers.getContentFormUrl(Helpers.nbpUrlPrefix + "dir.txt", function (result) {
            var fileNames = result.responseText.split("\r\n");
            var validFileNames = [];
            for (index in fileNames) {
                var fileName = fileNames[index];
                var datePart = fileName.substring(5);
                var date = new Date("20"+datePart.substring(0, 2), datePart.substring(2, 4)-1, datePart.substring(4));
                if (date >= fromDate && date <= toDate && fileName.substring(0,1) == "a") {
                    validFileNames.push(fileName);
                }
            }
            Helpers.getDataForChart(validFileNames, currentData, function (chartValues) {
                chartValues.sort(function (a, b) {
                    return new Date(a[0]) -new Date(b[0]) ;
                });
                var labels = [];
                var set = [];
                for (var ind in chartValues) {
                    var value = chartValues[ind];
                    labels.push(value[0]);
                    set.push(value[1].replace(",","."));
                }
                var canvas = document.getElementById('chart');
                var ctx = canvas.getContext("2d");

                var graph = new BarGraph(ctx);
                var max = 0;
                for (var i = 0; i < set.length; i++) {
                    if (set[i] > max)
                        max = set[i];
                }
                graph.maxValue = max;
                graph.margin = 3;
                graph.height = 300;
                graph.colors = ["grey"];
                graph.xAxisLabelArr = labels;
                graph.update(set);


            });

        });
    },
    saveFile: function () {
        var Imaging = Windows.Graphics.Imaging;
        var picker = new Windows.Storage.Pickers.FileSavePicker();
        picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        picker.fileTypeChoices.insert("PNG file", [".png"]);
        var imgData, fileStream = null;
        picker.pickSaveFileAsync().then(function (file) {
            if (file) {
                return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
            } else {
                return WinJS.Promise.wrapError("No file selected");
            }
        }).then(function (stream) {
            fileStream = stream;
            var canvas = document.getElementById("chart");
            var ctx = canvas.getContext("2d");
            imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            return Imaging.BitmapEncoder.createAsync(Imaging.BitmapEncoder.pngEncoderId, stream);
        }).then(function (encoder) {
            //Set the pixel data--assume "encoding" object has options from elsewhere
            var canvas = document.getElementById("chart");
            encoder.setPixelData(Imaging.BitmapPixelFormat.bgra8, Imaging.BitmapAlphaMode.straight,
                canvas.width, canvas.height, 0, 0,
                new Uint8Array(imgData.data));
            //Go do the encoding
            return encoder.flushAsync();
        }).done(function () {
            //Make sure to do this at the end
            fileStream.close();
        }, function () {
            //Empty error handler (do nothing if the user canceled the picker
        });
    }
}