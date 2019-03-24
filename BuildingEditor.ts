import * as Common from './Common';

new Common.FormManager(
    'building',
    $('#mainForm')[0] as HTMLFormElement,
    $('#buttonsDiv')[0],
    onClose
).createButtons().loadData();

function onClose() {
    window.location.href = 'Main.html';
}