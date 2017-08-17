import Participant from './Participant'
import { WebRtcPeer } from 'kurento-utils'
import { EventEmitter } from 'events'
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
        this.room = 123;
        this.ws = null;
        this.serverUrl = url;
    }

    /**
     * 开启连接
     * @return {Promise<KMSService>} 返回自身的promise
     */
    connect() {
        let promise = new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.serverUrl);
            this.ws.onopen = () => {
                this.ws.onmessage = messageEvent => {
                    let message = JSON.parse(messageEvent.data)
                    console.info('Received message:\n' + JSON.stringify(message));
                    switch (message.type) {
                        case 'loginError':
                            break;
                        // 已在房间中的参与者
                        case 'existingParticipants':
                            this.onExistingParticipants(message);
                            break;
                        case 'newParticipantArrived':
                            this.onNewArrived(message);
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
                        case 'receiveTextMessage':
                            this.onReceiveTextMessage(message);
                            break;
                        default:
                            this.emit('unrecognizedMessageError', message);

                    }
                }
                this.emit('connect');
                resolve(this);
            }

            this.ws.onerror = event => {
                this.emit('connectError', event);
                reject(event);
            }
            this.ws.onclose = closeEvent => {
                console.log(closeEvent);
            }
            window.onbeforeunload = event => {
                this.emit('unloadPage', event);
            }
            window.onunload = event => {
                this.emit('unloadPage', event);
            }
        })
        return promise;


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
        config = Object.assign({ type: 'join', room: this.room }, config);
        this.me.userId = config.userId;
        this.room = config.room;
        this.sendMessage(config);
    }

    leave() {
        this.sendMessage({ type: 'leave' });
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
        // 获取显示自己视频画面的
        let videoElement = document.getElementById('mine-stream');
        this.me.videoElement = videoElement;

        let constraints = {
            audio: true,
            video: {
                mandatory: {
                    maxWidth: 320,
                    maxFrameRate: 30,
                    minFrameRate: 15
                }
            }
        }

        let myOptions = {
            localVideo: this.me.videoElement,
            mediaConstraints: constraints,
            onicecandidate: candidate => {
                let msg = {
                    type: 'onIceCandidate',
                    userId: this.me.userId,
                    candidate: candidate,
                }
                this.sendMessage(msg);
            }
        }
        let that = this;

        this.me.rtcPeer = new WebRtcPeer.WebRtcPeerSendonly(myOptions, function (error) {
            if (error) {
                this.emit('createPeerConnectionError', error);
                return;
            }
            this.generateOffer((error, sdpOffer) => {
                if (error) {
                    this.emit('offerError', error);
                }
                let msg = {
                    type: "receiveVideoFrom",
                    userId: that.me.userId,
                    sdpOffer: sdpOffer
                };
                that.sendMessage(msg);
                this.emit('youJoinRoom', this.participants);
            });
        })

        // console.log(message.participants);
        message.participants.forEach(p => this.receiveVideo(p))
    }

    onNewArrived(message) {
        let currentP = this.receiveVideo(message.participant);
        this.emit('newParticipantJoinRoom', currentP);
    }

    /**
     * 准备接收其他参与者的视频
     * @param {{name, userId, prefix, suffix}} 参与者信息 
     * @return {Participant} 当前参与者对象
     */
    receiveVideo(p) {
        let part = new Participant();
        part.userId = p.userId;
        part.name = p.name;
        part.prefix = p.prefix;
        part.suffix = p.suffix;
        part.videoElement = document.createElement('video');
        // part.videoElement = document.getElementById('substream-1');
        this.participants.push(part);
        // console.log(part);
        console.log(this.participants);
        let myOptions = {
            remoteVideo: part.videoElement,
            onicecandidate: candidate => {
                let msg = {
                    type: 'onIceCandidate',
                    userId: part.userId,
                    candidate: candidate,
                }
                this.sendMessage(msg);
            }
        }
        let that = this;
        part.rtcPeer = new WebRtcPeer.WebRtcPeerRecvonly(myOptions, function (error) {
            if (error) {
                this.emit('createPeerConnectionError', error);
                return;
            }
            this.generateOffer((error, sdpOffer) => {
                if (error) {
                    this.emit('offerError', error);
                    return;
                }
                let msg = {
                    type: "receiveVideoFrom",
                    userId: part.userId,
                    sdpOffer: sdpOffer
                };
                that.sendMessage(msg);
            })
        })

        return part;
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
            this.emit('participantLeftRoom', p);
            this.participants.splice(index, 1);
        }
    }

    onReceiveVideoAnswer(message) {
        if (message.userId === this.me.userId) {
            this.me.rtcPeer.processAnswer(message.sdpAnswer, error => {
                if (error)
                    this.emit('processAnswerError', error);
            });
        } else {
            let p = this.queryParticipantById(message.userId);
            if (p) {
                p.rtcPeer.processAnswer(message.sdpAnswer, error => {
                    if (error) {
                        this.emit('processAnswerError', error);
                        return;
                    }
                    this.emit('startReceiveVideo', p);
                });
            } else {
                this.emit('participantNotFoundError', new Error('participant with userid: ' + message.userId + ' not found\nwhen do onReceiveVideoAnswer'))
            }
        }
    }

    onNeedIceCandidate(message) {
        if (message.userId === this.me.userId) {
            this.me.rtcPeer.addIceCandidate(message.candidate, error => {

            })
        } else {
            let p = this.queryParticipantById(message.userId);
            if (p) {
                p.rtcPeer.addIceCandidate(message.candidate, error => {
                    if (error) {
                        this.emit('addIceCandidateError', error);
                    }
                })
            } else {
                this.emit('participantNotFoundError', new Error('participant with userid: ' + message.userId + ' not found\nwhen do onNeedIceCandidate'))
            }
        }
    }

    onReceiveTextMessage(message) {
        let user = message.userId === this.me.userId ? this.me : this.queryParticipantById(message.userId);
        if (!user) {
            this.emit('receiveTextMessageError', new Error('participant not found'));
        } else {
            this.emit('receiveTextMessage', user, message.message)
        }
    }

    /**
     * 发送websocket信息
     * @param {{}} message 
     */
    sendMessage(message) {
        let jsonMsg = JSON.stringify(message);
        this.ws.send(jsonMsg);
        // console.log('message send: \n' + jsonMsg);
    }

    disposeAll() {
        this.participants.forEach(p => p.dispose());
        this.leave();
        this.ws.close();
    }

    queryParticipantById(userId) {
        let index = this.participants.findIndex(p => p.userId == userId)
        console.log(index);
        return index == -1 ? null : this.participants[index];
    }

}

export default KMSService