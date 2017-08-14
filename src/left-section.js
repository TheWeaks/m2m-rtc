import $ from 'jquery'
import KMSService from './service/KMSService'

let kmsService = new KMSService('wss://' + 'localhost:8443' + '/groupcall');

kmsService.on('connect', () => {
    console.log('connect');
    kmsService.join({
        room: 'default',
        userId: 1
    });
})
kmsService.on('connectError', event => {
    console.log('connectError: '+ event);
})
kmsService.connect();

$('#send-button').click(() => {
    kmsService.sendTextMessage({
        message: '1111111'
    });
})

