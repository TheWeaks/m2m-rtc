//import jQuery.js
import $ from 'jquery'

let p = navigator.mediaDevices.getUserMedia({audio: true, video: {width: 1280, height: 720}});

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