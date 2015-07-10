/**
 * Created by Ellery1 on 15/7/9.
 */
/**
 * Created by Ellery1 on 15/7/6.
 */

XUtil.paginator = function (opt) {

    var renderTo = opt.renderTo,
        total = opt.pageCount || 12,
        range = opt.range || 5,
        callback = opt.callback || function (pageNum, prevPage) {

                window.console && console.log('rendering ' + pageNum + "," + prevPage);
            };

    var currentPage = opt.defaultPage || 1,
        prevPage = -1;

    var controllerTmpl = "<div class='paginator_ctrl'></div>",
        commonBtnWrapTmpl = "<table class='commonBtnWrap'>" +
            "<tr></tr>" +
            "</table>",
        pageBtnTmpl = "<td class='pageBtnTd'>" +
            "<a href='javascript:void 0;' class='pageBtn common_btn' pageIndex='{{pageNum}}'>{{pageNum}}</a>" +
            "</td>",
        firstBtnTmpl = "<a pageIndex='1' href='javascript:void 0;' class='pageBtn to_first'>1</a>",
        lastBtnTmpl = "<a pageIndex='" + total + "' href='javascript:void 0;' class='pageBtn to_last'>" + total + "</a>",
        emmiterTmpl = "<span class='emmiter'>...</span>",
        nextPageTmpl = "<a href='javascript:void 0;' class='pageBtn to_next'>下一页</a>",
        prevPageTmpl = "<a href='javascript:void 0;' class='pageBtn to_prev'>上一页</a>",
        clearTmpl = "<div style='clear:both'></div>";

    var ctrlDom = $(controllerTmpl);

    var getCurrentPage = function () {

        return currentPage;
    };

    var getPrevPage = function () {

        return prevPage;
    };

    var toPage = function (pageNum) {

        var renderCtrlBar = function () {

            var getPageBtn = function (num) {

                commonBtnWrap.find('tr').append(pageBtnTmpl.replace(/\{\{pageNum}}/g, num));
            };

            var status = -1,
                i;

            var commonBtnWrap = $(commonBtnWrapTmpl);

            if (pageNum < range && pageNum > 0)
                status = 0;

            else if (pageNum >= range && pageNum <= total - range + 1)
                status = 1;

            else if (pageNum > total - range + 1 && pageNum <= total)
                status = 2;

            if (status === 0) {

                ctrlDom.empty();
                ctrlDom.append(prevPageTmpl)
                    .append(commonBtnWrap);

                for (i = 1; i <= range; i++) {

                    getPageBtn(i);
                }

                ctrlDom.append(emmiterTmpl)
                    .append(lastBtnTmpl)
                    .append(nextPageTmpl);

                if (pageNum === 1) {

                    ctrlDom.find('.to_prev').hide();
                }
            }

            else if (status === 1) {

                ctrlDom.empty();
                ctrlDom.append(prevPageTmpl)
                    .append(firstBtnTmpl)
                    .append(emmiterTmpl)
                    .append(commonBtnWrap);

                for (i = pageNum - 2; i <= pageNum + 2; i++) {

                    getPageBtn(i);
                }

                ctrlDom.append(emmiterTmpl)
                    .append(lastBtnTmpl)
                    .append(nextPageTmpl);
            }

            else if (status === 2) {

                ctrlDom.empty();
                ctrlDom.append(prevPageTmpl)
                    .append(firstBtnTmpl)
                    .append(emmiterTmpl)
                    .append(commonBtnWrap);

                for (i = total - 4; i <= total; i++) {

                    getPageBtn(i);
                }

                ctrlDom.append(nextPageTmpl);

                if (pageNum === total) {

                    ctrlDom.find('.to_next').hide();
                }
            }

            ctrlDom.append(clearTmpl);

            ctrlDom.find('[pageIndex=' + pageNum + ']').addClass('current');
        };

        prevPage = currentPage;
        currentPage = pageNum;

        renderCtrlBar();
        callback(pageNum, prevPage);
    };

    var toPrev = function () {

        toPage(--currentPage);
    };

    var toNext = function () {

        toPage(++currentPage);
    };

    var init = function () {

        $(renderTo).append(ctrlDom).append(clearTmpl);

        (function bindEvent() {

            var commonBtnSel = '.pageBtn.common_btn,.pageBtn.to_first,.pageBtn.to_last',
                prevSel = '.pageBtn.to_prev',
                nextSel = '.pageBtn.to_next';

            $(ctrlDom)
                .off('click', commonBtnSel)
                .on('click', commonBtnSel, function () {

                    var pageIndex = parseInt(this.getAttribute('pageIndex'), 10);
                    toPage(pageIndex);
                });

            $(ctrlDom)
                .off('click', prevSel)
                .on('click', prevSel, function () {

                    toPrev();
                });

            $(ctrlDom)
                .off('click', nextSel)
                .on('click', nextSel, function () {

                    toNext();
                });
        })();

        toPage(1);
    };

    init();

    return {
        ctrl: ctrlDom,
        init: init,
        toPage: toPage,
        toPrev: toPrev,
        toNext: toNext,
        getCurrentPage: getCurrentPage,
        getPrevPage: getPrevPage
    };
};

