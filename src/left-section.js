import $ from 'jquery'
import KMSService from './service/KMSService'
import MessageService from './service/MessageService'

let send_button = $('#send-button');
let clear_button = $('#clear-button');
let chat_textarea = $('#chat-textarea');
let chat_textarea_container = $('#chat-textarea-container');


let kmsService = new KMSService('wss://' + '45.76.6.255:8443' + '/groupcall');
if (process.env.ENV === 'production')
    kmsService = new KMSService('wss://' + location.host + '/groupcall');

// 连接成功时
kmsService.on('connect', () => {
    console.log('connect');
})

// 连接出现问题时
kmsService.on('connectError', error => {
    console.log('connectError: ' + error.stack);
})

kmsService.on('unrecognizedMessageError', error => {
    console.error(error.stack);
})

kmsService.on('youJoinRoom', otherParticipants => {
    console.log('participant number: ' + otherParticipants.length)
    if (otherParticipants.length == 0) {
        let myVideoELe = kmsService.me.videoElement;
        myVideoELe.style.width='100%';
        myVideoELe.style.height='100%';

    }
})

kmsService.on('createPeerConnectionError', error => {
    console.error('peerConnection Error: \n' + error.stack);
})

kmsService.on('offerError', error => {
    console.error('offer Error: \n' + error.stack);
})

kmsService.on('processAnswerError', error => {
    console.error('process answer error: \n' + error.stack);
})

kmsService.on('addIceCandidateError', error => {
    console.error('add ice candidate error:\n' + error.stack)
})

kmsService.on('participantNotFoundError', error => {
    console.error(error.stack);
})

// 当有新的参与者加入时
kmsService.on('newParticipantJoinRoom', participant => {
    let myVideoELe = kmsService.me.videoElement;
    myVideoELe.style.width='25%';
    myVideoELe.style.height='auto';
    console.log('someone join...: ' + participant.name);
})

// 开始接受视频时
kmsService.on('startReceiveVideo', participant => {
    console.log('start receive video from: ' + participant);
    participant.videoElement.autoplay = true;
    let videoContainer = document.createElement('div');
    videoContainer.className = 'stream-sub';
    videoContainer.appendChild(participant.videoElement)
    participant.videoElement.className = 'substream';
    document.getElementById('stream-container-bottom').appendChild(videoContainer);

    // if (kmsService.participants.length === 1) {
    //     document.getElementById('main-stream').src = 
    //     // videoContainer.className = 'stream-main';
    //     // participant.videoElement.className = 'main-stream';
    //     // document.getElementById('main-stream-container').appendChild(videoContainer);
    // }
})

// 当参与者离开房间时
kmsService.on('participantLeftRoom', participant => {
    let videoContainer = participant.videoElement.parentNode;
    let base = videoContainer.parentNode;
    base.removeChild(videoContainer);
    console.log('someone left...: ' + participant.name);
})


// 接收到文字消息时
kmsService.on('receiveTextMessage', (user, msg) => {
    MessageService.checkTime();
    if (user === kmsService.me) {
        MessageService.iSay(msg);
    } else {
        MessageService.otherSay(msg, user);
    }
    document.getElementById("line-end").scrollIntoView();
});

kmsService.on('receiveTextMessageError', error => {
    
})

kmsService.on('unloadPage', event => {
    if (kmsService.ws) {
        if (confirm(`是否退出房间${kmsService.room},并且关闭页面？`)){
            window.close();
            kmsService.disposeAll();
        } else 
            event.preventDefault();
    }
})

kmsService.connect()
    .then(kms => {
        kms.join({ userId: Math.round(Math.random()* 1000) });

    }).catch(error => {
        console.error(error);
    })













//===================================
//  文字发送事件监听
//===================================

// 可使用enter提交，ctrl+enter换行
chat_textarea.keyup(e => {
    let text = chat_textarea.val();
    if (e.keyCode == 13 && e.ctrlKey) {
        chat_textarea.val(text + '\n');
    } 
    else if (e.keyCode == 13) {
        // 避免回车键换行
        e.preventDefault();
        chat_textarea.val(text.substring(0, text.length))
        chat_textarea_container.submit();
    }
})

// 处理提交事件
chat_textarea_container.submit(e => {
    e.preventDefault();
    let text = e.target.chatText.value;
    if (text) {
        kmsService.sendTextMessage({
            message: text
        });
        chat_textarea.val('');
    }
})


clear_button.click(e => {
    e.preventDefault();
    chat_textarea.val('');
})

function others() {
    MessageService.checkTime();
    MessageService.otherSay('sssss', kmsService.me);
}