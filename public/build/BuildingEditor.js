(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Common = __importStar(require("./Common"));
new Common.FormManager('building', $('#mainForm')[0], $('#buttonsDiv')[0], onClose).createButtons().loadData();
function onClose() {
    window.location.href = 'Main.html';
}

},{"./Common":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getFormData(form) {
    var data = {};
    $(form).find('[name]').each(function (index, element) {
        var name = $(element).attr('name');
        if (name) {
            data[name] = $(element).val();
        }
    });
    return data;
}
exports.getFormData = getFormData;
function getFormFieldNames(form) {
    var names = [];
    $(form).find('[name]').each(function (index, element) {
        var name = $(element).attr('name');
        if (name) {
            names.push(name);
        }
    });
    return names;
}
exports.getFormFieldNames = getFormFieldNames;
function postJSON(url, data, successCallback, failureCallback) {
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(data),
        processData: false,
        success: successCallback,
        error: failureCallback
    });
}
exports.postJSON = postJSON;
var FormManager = /** @class */ (function () {
    function FormManager(collectionName, form, buttonsWrapper, onClose) {
        this.collectionName = collectionName;
        this.form = form;
        this.onClose = onClose;
        this.buttonsWrapper = buttonsWrapper;
    }
    FormManager.prototype.createButtons = function () {
        var _this = this;
        this.deleteButton = $('<button class="btn btn-danger btn-lg" type="button">Delete</button>')[0];
        this.saveAndCloseButton = $('<button class="btn btn-primary btn-lg" type="button">Save and Close</button>')[0];
        this.saveButton = $('<button class="btn btn-secondary btn-lg" type="button">Save</button>')[0];
        this.closeButton = $('<button class="btn btn-secondary btn-lg" type="button">Cancel</button>')[0];
        var leftSection = $('<div></div>');
        leftSection.append(this.deleteButton);
        var rightSection = $('<div></div>');
        rightSection.append(this.saveAndCloseButton);
        rightSection.append('\n'); // Needed to properly add spacing between buttons
        rightSection.append(this.saveButton);
        rightSection.append('\n'); // Needed to properly add spacing between buttons
        rightSection.append(this.closeButton);
        var div = $('<div class="d-flex justify-content-between"></div>');
        div.append(leftSection);
        div.append(rightSection);
        $(this.buttonsWrapper).append(div);
        $(this.deleteButton).click(function () {
            _this.tryDelete();
        });
        $(this.saveAndCloseButton).click(function () {
            _this.trySave(function () {
                _this.onClose();
            });
        });
        $(this.saveButton).click(function () {
            _this.trySave();
        });
        $(this.closeButton).click(function () {
            _this.onClose();
        });
        return this;
    };
    FormManager.prototype.setSaveButtonsEnabled = function (enabled) {
        if (this.saveAndCloseButton) {
            $(this.saveAndCloseButton).prop('disabled', !enabled);
        }
        if (this.saveButton) {
            $(this.saveButton).prop('disabled', !enabled);
        }
    };
    FormManager.prototype.loadData = function () {
        var _this = this;
        var url = new URL(window.location.href);
        var recordId = url.searchParams.get('id');
        if (recordId) {
            this.setSaveButtonsEnabled(false);
            var newCallback = function (data) {
                for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                    var _b = _a[_i], name_1 = _b[0], value = _b[1];
                    $(_this.form).find("[name='" + name_1 + "']").val(value);
                }
                _this.setSaveButtonsEnabled(true);
            };
            var recordIdNumber = parseInt(recordId);
            if (recordIdNumber) {
                this.currentRecordId = recordIdNumber;
                var props = getFormFieldNames(this.form);
                postJSON("/api/" + this.collectionName + "/get/", { id: recordIdNumber, props: props }, newCallback, newCallback);
            }
        }
    };
    FormManager.prototype.tryDelete = function () {
        var _this = this;
        if (this.currentRecordId) {
            this.setSaveButtonsEnabled(false);
            var newCallback = function () {
                _this.setSaveButtonsEnabled(true);
                _this.onClose();
            };
            postJSON("/api/" + this.collectionName + "/delete/", { id: this.currentRecordId }, newCallback, newCallback);
        }
        else {
            this.onClose();
        }
    };
    FormManager.prototype.trySave = function (callback) {
        var _this = this;
        if (this.form.checkValidity()) {
            console.log('Valid');
            $(this.form).removeClass('was-validated');
            this.setSaveButtonsEnabled(false);
            var newCallback = function (data) {
                _this.setSaveButtonsEnabled(true);
                if (data && data.id) {
                    _this.currentRecordId = data.id;
                }
                if (callback) {
                    callback();
                }
            };
            var record = getFormData(this.form);
            if (this.currentRecordId) {
                record.id = this.currentRecordId;
            }
            postJSON("/api/" + this.collectionName + "/set/", { record: record }, newCallback, newCallback);
        }
        else {
            console.log('Invalid');
            $(this.form).addClass('was-validated');
            if (callback) {
                callback();
            }
        }
    };
    return FormManager;
}());
exports.FormManager = FormManager;

},{}]},{},[1]);
