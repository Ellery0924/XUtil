/**
 * Created by Ellery1 on 15/7/27.
 */
$(function () {

    var safeEvent = XUtil.helpers.safeEvent;

    var testInput = $('#test');

    var consoleInput = function () {

        console.log(this.value);
    };

    var triggerEveryGap = safeEvent(consoleInput, testInput[0], 200),
        triggerAfterStop = safeEvent(consoleInput, testInput[0], 0, 200),
        triggerEveryGapNAfterStop = safeEvent(consoleInput, testInput[0], 200, 300);

    testInput.keyup(triggerEveryGapNAfterStop);
});