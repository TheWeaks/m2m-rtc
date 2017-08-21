class VideoService {
    /**
     * 将自己的视频扩大至整个主视频区
     * @param {Participant} me 代表自己的participant 
     */
    static expandYourself(me) {
        let myVideoELe = me.videoElement;
        myVideoELe.style.width='100%';
        myVideoELe.style.height='100%';
    }

    /**
     * 将自己的视频缩小至右上角
     * @param {Participant} me 代表自己的participant
     */
    static shrinkYourself(me) {
        let myVideoELe = me.videoElement;
        myVideoELe.style.width='25%';
        myVideoELe.style.height='auto';
    }

    /**
     * 初始化参与者视频标签
     * @param {Participant} participant 参与者 
     */
    static initSubVideo(participant) {
        let v = participant.videoElement;
        v.autoplay = true;
        v.controls = true;
        let videoContainer = document.createElement('div');
        videoContainer.className = 'stream-sub';
        // 视频元素添加进container
        v.className = 'substream';
        videoContainer.appendChild(v)
        // 添加标题
        let title = document.createElement('div');
        title.innerText = participant.toString();
        title.className = 'member-title';
        videoContainer.appendChild(title);
        //添加按钮组
        let videoCtrlBtn = document.createElement('button');
        videoCtrlBtn.className = 'controller-video';
        // let 
        videoCtrlBtn.innerHTML = 
        `<i class="fa fa-play" aria-hidden="true" style='display: none'>
        </i><i class="fa fa-pause" aria-hidden="true" style='display: block'></i>`
        videoCtrlBtn.onclick = event => {
            if (v.paused) {
                v.play();
                videoCtrlBtn.childNodes[0].style.display = 'none';
                videoCtrlBtn.childNodes[1].style.display = 'block';
            } else {
                v.pause();
                videoCtrlBtn.childNodes[0].style.display = 'block';
                videoCtrlBtn.childNodes[1].style.display = 'none';
            }
        }

        let audioCtrlBtn = document.createElement('button');
        audioCtrlBtn.className = 'controller-audio';
        audioCtrlBtn.innerHTML =
        `<i class="fa fa-microphone" aria-hidden="true" style='display: block'></i>
        <i class="fa fa-microphone-slash" aria-hidden="true" style='display: none'></i>`
        audioCtrlBtn.onclick = event => {
            if (v.muted) {
                v.muted = false;
                videoCtrlBtn.childNodes[0].style.display = 'block';
                videoCtrlBtn.childNodes[1].style.display = 'none';
            } else {
                videoCtrlBtn.childNodes[0].style.display = 'none';
                videoCtrlBtn.childNodes[1].style.display = 'block';
            }
        }

        let stageCtrlBtn = document.createElement('button');
        stageCtrlBtn.className = 'controller-stage';
        stageCtrlBtn.innerHTML = '<i class="fa fa-caret-square-o-up" aria-hidden="true"></i>';
        stageCtrlBtn.onclick =  event => {
            this.downStage(this.upStageParticipant);
            this.upStage(participant);
        }
        document.getElementById('stream-container-bottom').appendChild(videoContainer);
    }

    /**
     * 上主视频区(上麦)
     * @param {Participant} participant 参与者 
     */
    static upStage(participant) {
        this.upStageParticipant = participant;
        let pv = participant.videoElement;
        let mainVideo = document.getElementById('main-stream');
        let mainVideoContainer = mainVideo.parentNode;
        mainVideoContainer.childNodes[0].innerText = participant.toString();
        mainVideo.src = pv.src;
        
        pv.parentNode.style.display = 'none';
    }

    /**
     * 下主视频区(下麦)
     * @param {Participant} participant 参与者
     */
    static downStage(participant) {
        let mainVideo = document.getElementById('main-stream');
        let mainVideoContainer = mainVideo.parentNode;
        mainVideo.src = '';
        mainVideoContainer.childNodes[0].innerText = '';
        if (participant)
            this.showVideo(participant);
    }

    /**
     * 显示视频
     * @param {Participant} participant 参与者
     */
    static showVideo(participant) {
        let v = participant.videoElement;
        v.parentNode.style.display = 'block';
        v.play();
    }

    /**
     * 移除视频及其container
     * @param {Participant} participant 参与者 
     */
    static removeVideoEle(participant) {
        let videoContainer = participant.videoElement.parentNode;
        videoContainer.parentNode.removeChild(videoContainer);
    }

    /**
     * 查询参与者在视频序上的位置
     * @param {Participant} participant 参与者 
     */
    static querySequenceIndex(participant) {
        return this.sequence.findIndex(p => p === participant);
    }

    /**
     * 移除视频序上的参与者
     * @param {Participant} participant 参与者 
     */
    static removeVideoOnSequence(participant) {
        let index = this.querySequenceIndex(participant);
        if (index !== -1) {
            this.sequence.splice(index, 1);
        }
    }
}
VideoService.sequence = new Array();
VideoService.upStageParticipant = null;

export default VideoService