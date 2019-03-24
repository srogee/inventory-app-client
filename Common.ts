export function getFormData(form: HTMLFormElement): Object {
    var data = {};
    
    $(form).find('[name]').each((index, element) => {
        var name = $(element).attr('name');
        if (name) {
            (data as any)[name] = $(element).val();
        }
    });

    return data;
}

export function getFormFieldNames(form: HTMLFormElement): string[] {
    var names = [] as Array<string>;

    $(form).find('[name]').each((index, element) => {
        var name = $(element).attr('name');
        if (name) {
            names.push(name);
        }
    })

    return names;
}

export function postJSON(url: string, data: Object, successCallback?: any, failureCallback?: any) {
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

export class FormManager {
    collectionName: string;
    form: HTMLFormElement;
    onClose: Function;
    buttonsWrapper: HTMLElement;
    deleteButton?: HTMLElement;
    saveAndCloseButton?: HTMLElement;
    saveButton?: HTMLElement;
    closeButton?: HTMLElement;
    currentRecordId?: number;

    constructor(collectionName: string, form: HTMLFormElement, buttonsWrapper: HTMLElement, onClose: Function) {
        this.collectionName = collectionName;
        this.form = form;
        this.onClose = onClose;
        this.buttonsWrapper = buttonsWrapper;
    }

    public createButtons() {
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

        $(this.deleteButton).click(() => {
            this.tryDelete();
        });

        $(this.saveAndCloseButton).click(() => {
            this.trySave(() => {
                this.onClose();
            });
        });
        
        $(this.saveButton).click(() => {
            this.trySave();
        });
        
        $(this.closeButton).click(() => {
            this.onClose();
        });

        return this;
    }

    private setSaveButtonsEnabled(enabled: boolean) {
        if (this.saveAndCloseButton) {
            $(this.saveAndCloseButton).prop('disabled', !enabled);
        }

        if (this.saveButton) {
            $(this.saveButton).prop('disabled', !enabled);
        }
    }

    public loadData() {
        var url = new URL(window.location.href);
        var recordId = url.searchParams.get('id');
        if (recordId) {
            this.setSaveButtonsEnabled(false);

            var newCallback = (data?: any) => {
                for (let [name, value] of Object.entries(data)) {
                    $(this.form).find(`[name='${name}']`).val(value as any);
                }

                this.setSaveButtonsEnabled(true);
            }

            var recordIdNumber = parseInt(recordId);
            if (recordIdNumber) {
                this.currentRecordId = recordIdNumber;
                var props = getFormFieldNames(this.form);
                postJSON(`/api/${this.collectionName}/get/`, { id: recordIdNumber, props: props }, newCallback, newCallback);
            }
        }
    }

    private tryDelete() {
        if (this.currentRecordId) {
            this.setSaveButtonsEnabled(false);

            var newCallback = () => {
                this.setSaveButtonsEnabled(true);
                this.onClose();
            }
    
            postJSON(`/api/${this.collectionName}/delete/`, { id: this.currentRecordId }, newCallback, newCallback);
        } else {
            this.onClose();
        }
    }
    
    private trySave(callback?: Function) {
        if (this.form.checkValidity()) {    
            console.log('Valid');
            $(this.form).removeClass('was-validated');

            this.setSaveButtonsEnabled(false);

            var newCallback = (data?: any) => {
                this.setSaveButtonsEnabled(true);

                if (data && data.id) {
                    this.currentRecordId = data.id;
                }
                
                if (callback) {
                    callback();
                }
            }

            var record = getFormData(this.form) as any;
            if (this.currentRecordId) {
                record.id = this.currentRecordId;
            }

            postJSON(`/api/${this.collectionName}/set/`, { record: record }, newCallback, newCallback);
        } else {
            console.log('Invalid');
            $(this.form).addClass('was-validated');
            
            if (callback) {
                callback();
            }
        }
    }
}