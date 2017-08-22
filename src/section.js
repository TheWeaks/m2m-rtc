//import jQuery.js
import $ from 'jquery';

function model($) {
    let Model = function (element, options) {
        this.options              = options;
        this.$body                = $(document.body);
        this.$element             = $(element);
        this.$content             = this.$element.find("model-content");
        this.$backdrop            = null;
        this.isShown              = null;
        this.ingnoreBackdropClick = true;
    };


}

/*=======================================

    变量与常量初始化

======================================= */
const imageInput       = document.getElementById("input-chat-image");
const fileInput        = document.getElementById("input-chat-file");
const observerConfig   = {attributes: true, childList: true, characterData: false, subtree: true};
const MutationObserver = window.MutationObserver;
let target             = document.querySelector(".chat-lines");
let observer           = new MutationObserver(function () {
    document.getElementById("line-end").scrollIntoView();
});

/*=======================================

    监听器初始化

======================================= */
imageInput.addEventListener("change", messageQueueImageRight, false);
fileInput.addEventListener("change", messageQueueFileRight, false);
observer.observe(target, observerConfig);//监听chat-lines的节点变化，自动将焦点移至底部


/*=======================================

    将点击事件从button绑定至隐藏的input中

======================================= */
$('#button-chat-image').on('click', function () {
    $('#input-chat-image').click();
});

$('#button-chat-file').on('click', function () {
    $('#input-chat-file').click();
});

let p = navigator.mediaDevices.getUserMedia({audio: false, video: {width: 1280, height: 720}});

p.then(function (mediaStream) {
    let video              = document.querySelector('#main-stream');
    let mine               = document.querySelector("#mine-stream");
    let subvideo1          = document.querySelector('#substream-1');
    let subvideo2          = document.querySelector('#substream-2');
    let subvideo3          = document.querySelector('#substream-3');
    let subvideo4          = document.querySelector("#substream-4");
    video.src              = window.URL.createObjectURL(mediaStream);
    subvideo1.src          = window.URL.createObjectURL(mediaStream);
    subvideo2.src          = window.URL.createObjectURL(mediaStream);
    subvideo3.src          = window.URL.createObjectURL(mediaStream);
    subvideo4.src          = window.URL.createObjectURL(mediaStream);
    mine.src               = window.URL.createObjectURL(mediaStream);
    video.onloadedmetadata = function (e) {
        // Do something with the video here.
    };
});

p.catch(function (err) {
    console.log(err.name);
});

/*=======================================

    消息处理

======================================= */

//将文字信息显示至消息栏后清空textarea
$('.chat-textarea').keyup(function (e) {
    if (e.keyCode === 13) {
        if ($(this).val() === '\n') {
            $(".chat-textarea").val("");
        } else {
            messageQueueTextRight($(this).val());
        }
    }
});

//本地消息直接显示在消息栏中
function messageQueueTextRight(msg) {
    $("#line-end").before("<li class='chat-line-right'>" +
        "<div class='line-user-name-right'>User known</div>" +
        "<p>" + msg + "</p>" +
        "</li>");
    $(".chat-textarea").val("");
}

//本地图片直接显示在消息栏中
function messageQueueImageRight() {
    let file = this.files[0];
    if (!/image\/\w+/.test(file.type)) {
        alert("文件必须为图片");
        return false;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        $("#line-end").before("<li class='chat-line-right'>" +
            "<div class='line-user-name-right'>User known</div>" +
            "<p><img class='chat-line-image' src=" + this.result + "></p>" +
            "</li>");
    };
}

//本地文件直接显示在消息栏中
function messageQueueFileRight() {
    let file = this.files[0];
    if (/image\/\w+/.test(file.type)) {
        alert("图片请使用发送图片按钮");
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    $("#line-end").before("<li class='chat-line-right'>" +
        "<div class='line-user-name-right'>User known</div>" +
        "<p><a href=" + this.result + "><i style='font-size: 90px' class=\"fa fa-file-archive-o\" aria-hidden=\"true\"></i></a></p>" +
        "</li>");
}

//本地文件直接显示在消息栏中
function messageQueueFileRight() {
    let file = this.files[0];
    let icon = null;
    //文件类型验证
    if (/image\/\w+/.test(file.type)) {
        alert("图片请使用发送图片按钮");
        return false;
    }
    if (/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/.test(file.type) || /application\/msword/.test(file.type) || /application\/vnd\.ms-works/.test(file.type)) {
        icon = "<i style='font-size: 50px' class=\"fa fa-file-word-o\" aria-hidden=\"true\"></i>";
    }//MS-WORD
    if (/application\/vnd\.ms-excel/.test(file.type)) {
        icon = "<i style='font-size: 50px'  class=\"fa fa-file-excel-o\" aria-hidden=\"true\"></i>";
    }//MS-EXCEL
    if (/application\/pdf/.test(file.type)) {
        icon = "<i style='font-size: 50px'  class=\"fa fa-file-pdf-o\" aria-hidden=\"true\"></i>";
    }//PDF
    if (/application\/zip/.test(file.type)) {
        icon = "<i style='font-size: 50px'  class=\"fa fa-file-archive-o\" aria-hidden=\"true\"></i>";
    }//ZIP
    if (/audio\/\w+/.test(file.type)) {
        icon = "<i style='font-size: 50px'  class=\"fa fa-file-audio-o\" aria-hidden=\"true\"></i>";
    }//AUDIO
    if (/video\/\w+/.test(file.type)) {
        icon = "<i style='font-size: 50px'  class=\"fa fa-file-video-o\" aria-hidden=\"true\"></i>";
    }//VIDEO
    else {
        icon = "<i style='font-size: 50px' class=\"fa fa-file\" aria-hidden=\"true\"></i>";
    }
    $("#line-end").before("<li class='chat-line-right'>" +
        "<div class='line-user-name-right'>User known</div>" +
        "<p><a href=" + window.URL.createObjectURL(file) + ">" + icon + "</i></a></p>" +
        "</li>");
}

