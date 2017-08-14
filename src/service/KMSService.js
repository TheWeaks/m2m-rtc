import EventEmitter from './EventEmitter'
import Participant from './Participant'
import { WebRtcPeer } from 'kurento-utils'
/**
 * KMS 服务类
 */
export class KMSService extends EventEmitter {
    /**
     * 
     * @param {string} url websocket服务器地址 
     */
    constructor(url) {
        super();
        this.me = new Participant()
        this.participants = new Array();
        this.room = 'default';
        this.ws = null;
        this.serverUrl = url;
    }

    /**
     * 开启连接
     * @param {string} username 
     * @param {string} password 
     */
    connect(username, password) {
        this.ws = new WebSocket(this.serverUrl);
        this.ws.onopen = () => {
            // this.login(username, password);
            this.emit('connect');
        }
        this.ws.onerror = event => {
            this.emit('connectError', event);
        }
        this.ws.onmessage = messageEvent => {
            let message = JSON.parse(messageEvent.data)
            console.log(message);
            switch (message.type) {
                // 身份验证通过
                // case '_login':
                //     this.emit('loginSuccess');
                //     break;
                case 'loginError':

                // 已在房间中的参与者
                case 'existingParticipants':
                    this.onExistingParticipants(message);
                    break;
                // 参与者离开时
                case 'participantLeft':
                    this.onParticipantLeft(message);
                    break;
                // 收到视频应答
                case 'receiveVideoAnswer':
                    this.onReceiveVideoAnswer(message);
                    break;
                case 'iceCandidate':
                    this.onNeedIceCandidate(message);
                    break;
                case 'reciveTextMessage':
                    this.sendMessage('reciveTextMessage: '+ message.message + '\nuserID: '+ message.userId );
                default:

            }
        }
    }

    /**
     * 验证用户身份
     * @param {string} username 用户名
     * @param {string} password 密码
     */
    login(username, password) {

    }

    /**
     * 加入房间
     * @param {{room, userId, (pw)}} config 请求信息，结构：{id: 'join, room}  不填 默认加入default房间
     */
    join(config) {
        config = Object.assign({ type: 'join' }, config);
        this.me.userId = config.userId;
        this.room = config.room;
        this.sendMessage(config);
    }

    /**
     * room 内发送消息
     * @param {{userId, message}} config 
     */
    sendTextMessage(config) {
        config = Object.assign({ type: 'sendMessage' }, config);
        this.sendMessage(config);

    }

    uploadFile() {

    }


    /**
     * 当加入房间成功并返回当前房间用户数据的时
     * @param {{data}} message 
     */
    onExistingParticipants(message) {

        this.me.createRtcPeer();
        // 获取显示自己视频画面的
        let videoElement = document.getElementById('video-mine');
        this.me.videoElement = videoElement;

        let constraints = {
            audio: true,
            video: {
                mandatory: {
                    maxWidth: 480,
                    maxFrameRate: 30,
                    minFrameRate: 15
                }
            }
        }

        let myOptions = {
            localVideo: this.me.videoElement,
            mediaConstraints: constraints
        }
        let that = this;

        this.me.rtcPeer = new WebRtcPeer.WebRtcPeerSendonly(myOptions, function (error) {
            if (error) {

            }
            this.generateOffer((error, sdpOffer) => {
                if (error) {

                }
                var msg = {
                    type: "receiveVideoFrom",
                    userId: that.me.userId,
                    sdpOffer: sdpOffer
                };
                that.sendMessage(msg);
            });
        })

        // 将参与者添加进列表
        for (let part of message.participants) {
            let p = new Participant();
            p.id = part.id;
            p.name = part.name;
            p.prefix = part.prefix;
            p.suffix = part.suffix;
            this.participants.push(p);
        }
        this.participants.forEach(this.recieveVideo)
        this.emit('join');
    }

    /**
     * 准备接收其他参与者的视频
     * @param {Participant} participant 
     */
    recieveVideo(participant) {
        let remoteVideo = document.createElement('video');

        let myOptions = {
            remoteVideo: remoteVideo,
            onicecandidate: (candidate) => {
                let msg = {
                    id: 'onIceCandidate',
                    userId: participant.userId,
                    candidate: candidate,
                }
                this.sendMessage(msg);
            }
        }

        participant.rtcPeer = new WebRtcPeer.WebRtcPeerRecvonly(myOptions, function (error) {
            if (error) {

            }
            this.generateOffer((error, sdpOffer) => {
                if (error) {

                }
                var msg = {
                    id: "receiveVideoFrom",
                    userId: participant.userId,
                    sdpOffer: sdpOffer
                };
                this.sendMessage(msg);
            })
        })
    }

    /**
     * 当参与者离开时
     * @param {{type, userId}} message 
     */
    onParticipantLeft(message) {
        let index = this.participants.findIndex(p => p.userId == message.userId);
        if (index === -1) {

        } else {
            let p = this.participants[index];
            p.dispose();
            delete this.participants[index];
        }
    }

    onReceiveVideoAnswer(message) {
        let p = this.queryParticipantById(message.userId);
        if (p) {
            p.rtcPeer.processAnswer(message.sdpAnswer, error => {

            });
        } else {

        }
    }

    onNeedIceCandidate(message) {
        let p = this.queryParticipantById(message.userId);
        if (p) {
            p.rtcPeer.addIceCandidate(message.candidate, error => {
                
            })
        } else {
            
        }
    }

    /**
     * 发送websocket信息
     * @param {{}} message 
     */
    sendMessage(message) {
        let jsonMsg = JSON.stringify(message);
        this.ws.send(jsonMsg);
        console.log('message send: \n' + jsonMsg);
    }

    queryParticipantById(userId) {
        let index = this.participants.findIndex(p => p.userId == userId)
        return index == -1 ? null : this.participants[index];
    }

}

export default KMSService