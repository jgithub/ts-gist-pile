"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmQueryImpl = void 0;
var LlmQueryImpl = (function () {
    function LlmQueryImpl(llmQuery) {
        this._attr = {};
        this._attr = llmQuery || {};
    }
    LlmQueryImpl.prototype.addQuestion = function (questionText) {
        this._attr.qAndA = this._attr.qAndA || [];
        this._attr.qAndA.push({ question: questionText });
    };
    Object.defineProperty(LlmQueryImpl.prototype, "prompt", {
        get: function () {
            return this._attr.prompt;
        },
        set: function (input) {
            this._attr.prompt = input;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LlmQueryImpl.prototype, "additionalContext", {
        get: function () {
            return this._attr.additionalContext;
        },
        set: function (input) {
            this._attr.additionalContext = input;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LlmQueryImpl.prototype, "qAndA", {
        get: function () {
            return this._attr.qAndA;
        },
        set: function (input) {
            this._attr.qAndA = input;
        },
        enumerable: false,
        configurable: true
    });
    return LlmQueryImpl;
}());
exports.LlmQueryImpl = LlmQueryImpl;
//# sourceMappingURL=LlmQueryImpl.js.map