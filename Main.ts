import * as Common from './Common';

class ColumnDefinition {
    private _title: string;
    private _propertyName: string;

    constructor(title: string, propertyName: string) {
        this._title = title;
        this._propertyName = propertyName;
    }

    /**
     * Getter title
     * @return {string}
     */
    public get title(): string {
        return this._title;
    }

    /**
     * Getter propertyName
     * @return {string}
     */
    public get propertyName(): string {
        return this._propertyName;
    }
}

class TableDefinition {
    private _element?: HTMLTableElement;
    private _collectionName: string;
    private _editUrl: string;
    private _columns: ColumnDefinition[];
    private _columnPropertyNameMap: string[];

    constructor(collectionName: string, editUrl: string, columns: ColumnDefinition[]) {
        this._collectionName = collectionName;
        this._editUrl = editUrl;
        this._columns = columns;
        this._columnPropertyNameMap = [];
    }

    public createTable(parentElement: HTMLElement) {
        var button = $(`<button class="btn btn-primary btn-lg" type="button">New</button>`);
        button.click(() => {
            window.location.href = this._editUrl;
        });
        $(parentElement).append(button);
        let table = $(`<table class="table table-hover"><thead></thead><tbody></tbody></table>`);
        $(parentElement).append(table);
        this._element = table[0] as HTMLTableElement;

        var thead = $(this._element).find('thead');
        let index = 0;
        for (let column of this._columns) {
            thead.append(`<th scope="col" class="border-top-0">${column.title}</th>`);
            this._columnPropertyNameMap[index] = column.propertyName;
            index++;
        }

        return this;
    }

    public loadData() {
        var props = this._columns.map(column => column.propertyName);
        Common.postJSON(`/api/${this._collectionName}/list/`, { props: props }, this.onDataLoaded.bind(this), this.onDataLoaded.bind(this));
        return this;
    }

    private onDataLoaded(data?: any) {
        if (this._element) {
            var tbody = $(this._element).find('tbody');
            tbody.empty();

            for (let record of data) {
                var row = $('<tr></tr>');
                row.click(() => {
                    this.onRowClick(record.id);
                });

                for (var i = 0; i < this._columnPropertyNameMap.length; i++) {
                    let value = record[this._columnPropertyNameMap[i]];
                    row.append(`<td>${value}</td>`);
                }

                tbody.append(row);
            }
        }
    }

    private onRowClick(recordId: number) {
        window.location.href = this._editUrl + '?id=' + recordId;
    }
}

/////////////////////

new TableDefinition('building', 'BuildingEditor.html', [
    new ColumnDefinition('Name', 'name'),
    new ColumnDefinition('Address Line 1', 'address'),
    new ColumnDefinition('Address Line 2', 'address2'),
    new ColumnDefinition('Country', 'country'),
    new ColumnDefinition('State', 'state'),
    new ColumnDefinition('Postal Code', 'zip'),
]).createTable($('#buildingTabPane')[0]).loadData();

new TableDefinition('room', 'RoomEditor.html', [
    new ColumnDefinition('Name', 'name'),
]).createTable($('#roomTabPane')[0]).loadData();