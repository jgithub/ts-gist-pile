"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPlusOneCountToStathat = sendPlusOneCountToStathat;
exports.sendStatToKpitracks = sendStatToKpitracks;
function sendPlusOneCountToStathat(countStatName) {
    var _a, _b;
    if (process.env.STATHAT_EZ_KEY != null && ((_a = process.env.STATHAT_EZ_KEY.trim()) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        var controller_1 = new AbortController();
        var timeoutId_1 = setTimeout(function () { return controller_1.abort(); }, 750);
        var url_1 = "https://api.stathat.com/ez";
        var ezKeyLabel = "ezkey";
        var requestBody_1 = "stat=".concat(countStatName.trim(), "&").concat(ezKeyLabel, "=").concat((_b = process.env.STATHAT_EZ_KEY) === null || _b === void 0 ? void 0 : _b.trim(), "&count=1");
        setTimeout(function () {
            var beforeAt = new Date();
            fetch(url_1, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                signal: controller_1.signal,
                body: requestBody_1
            }).then(function (response) {
                var deltaInMs = new Date().getTime() - beforeAt.getTime();
                clearTimeout(timeoutId_1);
            }).catch(function (err) {
            });
        }, 0);
    }
}
function sendStatToKpitracks(requestBodyString) {
    var _a;
    var kpitracksEzKey = process.env.KPITRACKS_EZ_KEY;
    kpitracksEzKey = kpitracksEzKey === null || kpitracksEzKey === void 0 ? void 0 : kpitracksEzKey.trim();
    if (kpitracksEzKey != null && (kpitracksEzKey === null || kpitracksEzKey === void 0 ? void 0 : kpitracksEzKey.length) > 0) {
        var controller_2 = new AbortController();
        var timeoutId_2 = setTimeout(function () { return controller_2.abort(); }, 750);
        var url = "https://stat.kpitracks.com/c";
        requestBodyString = requestBodyString + "&ezkey=".concat((_a = process.env.KPITRACKS_EZ_KEY) === null || _a === void 0 ? void 0 : _a.trim());
        console.log("sendStatToKpitracks(): Sending POST to Stathat url = '".concat(url, "',  requestBodyString = '").concat(requestBodyString, "'"));
        var beforeAt_1 = new Date();
        fetch(url, {
            method: 'POST',
            signal: controller_2.signal,
            body: requestBodyString
        }).then(function (response) {
            var deltaInMs = new Date().getTime() - beforeAt_1.getTime();
            clearTimeout(timeoutId_2);
        }).catch(function (err) {
            console.log("sendStatToKpitracks(): Failed to send stat.  requestBodyString = ".concat(requestBodyString, ",  Reason: ").concat(JSON.stringify(err)));
        });
    }
}
//# sourceMappingURL=statUtil.js.map