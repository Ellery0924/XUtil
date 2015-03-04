$(function () {
    var testImages = [];
    var randomHeights = [];

    for (var i = 0; i < 3000; i++) {
        randomHeights.push(parseInt(Math.random() * (500 - 200 + 1) + 200, 10));
    }

    for (var i = 0; i < 3000; i++) {
        var height = randomHeights[i];
        var model = {
            height: height,
            index: i
        }

        testImages.push(model);
    }

    var xwf = XUtil.XWaterfall({
        src: testImages,
        url: '',
        renderTo: $('#wf')[0],
        renderer: function (model) {
            var height = model.height;
            var i = model.index;
            var html = "<div class='wrapper' style='border:1px solid;'>" +
                "<img id='img_" + i + "' src='' style='height:" + height + "px;width:238px;'/>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div></div>" +
                "<div class='des' style=''>img_" + i + "</div>" +
                "</div>";

            return html;
        }
    });

    xwf.set({
        colNum: 5,
        initialSize: 50,
        colWidth: 242,
        contentWidth: 240,
        fetchSize: 20,
        marginTop: 2
    });

    xwf.init();
});
