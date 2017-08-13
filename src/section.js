//import jQuery.js
import $ from 'jquery'

const imageInput = document.getElementById("input-chat-image");
const fileInput = document.getElementById("button-chat-file");

imageInput.addEventListener("change", messageQueueImage, false);
fileInput.addEventListener("change", messageQueueFile, false);

//将将点击事件从button绑定至隐藏的input中
$('#button-chat-image').on('click', function () {
	$('#input-chat-image').click();
});

$('#button-chat-file').on('click', function () {
	$('#input-chat-file').click();
});

let p = navigator.mediaDevices.getUserMedia({audio: false, video: {width: 1280, height: 720}});

p.then(function (mediaStream) {
	let video = document.querySelector('#main-stream');
	let subvideo1 = document.querySelector('#substream-1');
	let subvideo2 = document.querySelector('#substream-2');
	let subvideo3 = document.querySelector('#substream-3');
	video.src = window.URL.createObjectURL(mediaStream);
	subvideo1.src = window.URL.createObjectURL(mediaStream);
	subvideo2.src = window.URL.createObjectURL(mediaStream);
	subvideo3.src = window.URL.createObjectURL(mediaStream);
	video.onloadedmetadata = function (e) {
		// Do something with the video here.
	};
});

p.catch(function (err) {
	console.log(err.name);
});

//消息队列

$('.chat-textarea').keyup(function (e) {
	if (e.keyCode === 13) {
		if ($(this).val() === '\n') {
			$(".chat-textarea").val("");
		} else {
			messageQueueText($(this).val())
		}
	}
});

function messageQueueText(msg) {
	$("#end").before("<li class='chat-line-right'>" +
		"<div class='line-user-name-right'>User known</div>" +
		"<p>" + msg + "</p>" +
		"</li>");
	document.getElementById("end").scrollIntoView();
	$(".chat-textarea").val("");
}

function messageQueueImage() {
	let file = this.files[0];
	if (!/image\/\w+/.test(file.type)) {
		alert("文件必须为图片");
		return false;
	}
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function (e) {
		$("#end").before("<li class='chat-line-right'>" +
			"<div class='line-user-name-right'>User known</div>" +
			"<p><img class='chat-line-image' src=" + this.result + "></p>" +
			"</li>");
	};
	document.getElementById("end").scrollIntoView();
}

function messageQueueFile() {
	let file = this.files[0];
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload(function (e) {
		$("#end").before("<li class='chat-line-right'>" +
			"<div class='line-user-name-right'>User known</div>" +
			"<p><i style='font-size: larger' class=\"fa fa-file-archive-o\" aria-hidden=\"true\"></i></p>" +
			"</li>");
	});
	document.getElementById("end").scrollIntoView();
}