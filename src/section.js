let p = navigator.mediaDevices.getUserMedia({audio: true, video: {width: 1280, height: 720}});

p.then(function (mediaStream) {
    let video = document.querySelector('#main-stream');
    video.src = window.URL.createObjectURL(mediaStream);
    video.onloadedmetadata = function (e) {
        // Do something with the video here.
    };
});

p.catch(function (err) {
    console.log(err.name);
});