import $ from 'jquery'
import KMSService from './service/KMSService'
import MessageService from './service/MessageService'
import VideoService from './service/VideoService'
import UploadService from './service/UploadService'


const ms = MessageService;
const vs = VideoService;
const us = UploadService;


// let kmsService = new KMSService('wss://' + '45.76.6.255:8443' + '/groupcall');
let kmsService = new KMSService('wss://' + '192.168.22.145:8443' + '/groupcall');
if (process.env.ENV === 'production')
    kmsService = new KMSService('wss://' + location.host + '/groupcall');

// 连接成功时
kmsService.on('connect', () => {
    ms.roomSay('连接成功');
});

// 连接出现问题时
kmsService.on('connectError', error => {
    console.log('connectError: ' + error.stack);
});

// 返回无法识别格式的数据时
kmsService.on('unrecognizedMessageError', error => {
    console.error(error.stack);
});

kmsService.on('youJoinRoom', otherParticipants => {
    ms.roomSay('欢迎加入房间');
    let pCount = otherParticipants.length;
    let msg    = `当前在线${pCount}人`;
    if (pCount == 0) {
        vs.expandYourself(kmsService.me);
    } else {
        msg += ':';
        otherParticipants.forEach(p => msg += `<br>${p.name}`);
    }
    ms.roomSay(msg);
});

kmsService.on('createPeerConnectionError', error => {
    console.error('peerConnection Error: \n' + error.stack);
});

kmsService.on('offerError', error => {
    console.error('offer Error: \n' + error.stack);
});

kmsService.on('processAnswerError', error => {
    console.error('process answer error: \n' + error.stack);
});

kmsService.on('addIceCandidateError', error => {
    console.error('add ice candidate error:\n' + error.stack);
});

kmsService.on('participantNotFoundError', error => {
    console.error(error.stack);
});

// 当有新的参与者加入时
kmsService.on('newParticipantJoinRoom', participant => {
    vs.shrinkYourself(kmsService.me);
    ms.roomSay(`${participant.name}<br/>加入`);
});

// 开始接受视频时
kmsService.on('startReceiveVideo', participant => {
    ms.roomSay(`开始从: ${participant.name} 接受视频`);
    // 初始化video标签至container
    vs.initSubVideo(participant);
    // 添加至视频序
    vs.sequence.push(participant);
    // 当只有除了你之外只有一个参与者的时候，自动上台
    if (vs.sequence.length === 1) {
        vs.upStage(participant);
    }
});

// 当参与者离开房间时
kmsService.on('participantLeftRoom', participant => {
    if (kmsService.participants.length == 0) {
        vs.expandYourself(kmsService.me);
    }
    vs.removeVideoEle(participant);
    vs.removeVideoOnSequence(participant);
    ms.roomSay(`${participant.name}<br/>离开房间`);
    // 如果离开的参与者现在正在台上，则下台并让麦序上的第一个人上台
    if (participant === vs.upStageParticipant) {
        vs.downStage();
        if (vs.sequence.length)
            vs.upStage(vs.sequence[0]);
    }
});


// 接收到文字消息时
kmsService.on('receiveTextMessage', (user, msg) => {
    ms.checkTime();
    if (user === kmsService.me) {
        ms.iSay(msg);
    } else {
        ms.otherSay(msg, user);
    }
});

kmsService.on('receiveTextMessageError', error => {

});

kmsService.on('unloadPage', event => {
    if (kmsService.ws) {
        if (confirm(`是否退出房间${kmsService.room},并且关闭页面？`)) {
            window.close();
            kmsService.disposeAll();
        } else
            event.preventDefault();
    }
});

kmsService.connect()
    .then(kms => {
        kms.join({ userId: Math.round(Math.random() * 1000) });
    }).catch(error => {
        console.error(error);
    })


//===================================
//  文字发送事件监听
//===================================

let clear_button = $('#clear-button');
let chat_textarea = $('#chat-textarea');
let chat_textarea_container = $('#chat-textarea-container');

// 可使用enter换行，ctrl+enter提交
chat_textarea.keyup(e => {
    let text = chat_textarea.val();
    if (e.keyCode == 13 && e.ctrlKey) {
        e.preventDefault();
        chat_textarea.val(text.substring(0, text.length - 1));
        chat_textarea_container.submit();
    }
    else if (e.keyCode == 13) {
        // 避免回车键换行
        // chat_textarea.val(text + '\n');
    }
});

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
});

// 清空输入框
clear_button.click(e => {
    e.preventDefault();
    chat_textarea.val('');
});




//===================================
//  图片／文件发送事件监听
//===================================
let imageButton = $('#button-chat-image');
let fileButton = $('#button-chat-file');
let fileInput = $('#input-chat-file');
let imageInput = $('#input-chat-image');

imageInput.change(event => {
    us.uploadFile(us.IMG_SERVER, event.target.files[0], imageButton.get(0))
      .then()
      .catch(error => {
          alert(`上传失败：\n${error.stack}`);
      })
})
fileInput.change(event => {
    us.uploadFile(us.FILE_SERVER, event.target.files[0], imageButton.get(0))
      .then()
      .catch(error => {
          alert(`上传失败：\n${error.stack}`);
      })
})
imageButton.click(() => imageInput.click());
fileButton.click(() => fileInput.click());

