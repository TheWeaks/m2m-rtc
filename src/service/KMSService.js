import Participant from './Participant';
import { WebRtcPeer } from 'kurento-utils';
import { EventEmitter } from 'events';

/**
 * KMS 服务类
 */
export class KMSService extends EventEmitter {
    /**
     * 构造方法
     * @param {string} url websocket服务器地址
     */
    constructor(url) {
        super();
        this.me = new Participant();
        this.participants = new Array();
        this.room = 123;
        this.ws = null;
        this.serverUrl = url;
    }

    /**
     * 开启连接
     * @return {Promise<KMSService>}  返回自身的promise
     */
    connect() {
        let promise = new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.serverUrl);
            this.ws.onopen = () => {

                this.ws.onmessage = messageEvent => {
                    let message = JSON.parse(messageEvent.data);
                    console.info('Received message:\n' + JSON.stringify(message));
                    /**
                     *
                     * 从服务器接受的websocket数据结构(json)
                     * {   
                     *     type: ...,
                     *     **: ...,
                     *     ***: ...
                     * }
                     *
                     */
                    switch (message.type) {
                        // 用户不存在
                        case 'userNotFound':
                            this.emit('permisionDeny');
                            break;
                        // 用户权限不足（无法加入此房间）
                        case 'permisionDeny':
                            this.emit('permisionDeny');
                            break;
                        // 已在房间中的参与者
                        case 'existingParticipants':
                            this.onExistingParticipants(message);
                            break;
                        // 新参与者加入时
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
                        // 收到打洞方式时
                        case 'iceCandidate':
                            this.onNeedIceCandidate(message);
                            break;
                        // 收到文字信息时
                        case 'receiveTextMessage':
                            this.onReceiveTextMessage(message);
                            break;
                        case 'fileUploaded':
                            this.onReceiveFile(message);
                        // 无法识别返回信息的格式时
                        case 'unrecognizedMessage':
                        default:
                            this.emit('unrecognizedMessageError', message);

                    }
                };
                this.emit('connect');
                resolve(this);
            };

            this.ws.onerror = event => {
                this.emit('connectError', event);
                reject(event);
            };
            this.ws.onclose = closeEvent => {
                console.log(closeEvent);
            };
            window.onbeforeunload = event => {
                this.emit('unloadPage', event);
            };
            window.onunload = event => {
                this.emit('unloadPage', event);
            };
        });
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
     * @param {{room, userId, (pw)}} config 请求信息，结构：{id: 'join, room}  不填 默认加入123房间
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
     * @param {{userId, message}} msg
     */
    sendTextMessage(msg) {
        msg = Object.assign({ type: 'sendMessage' }, msg);
        this.sendMessage(msg);

    }

    uploadSuccess(msg) {
        msg = Object.assign({ type: 'uploadSuccess' }, msg);
        console.log(msg);
        this.sendMessage(msg);
    }

    /**
     * 当加入房间成功并返回当前房间用户数据的时
     * @param {{type, participants: [Participant]}} message 报文
     */
    onExistingParticipants(message) {
        // 获取显示自己视频画面的
        let videoElement = document.getElementById('mine-stream');
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
        };

        let myOptions = {
            localVideo: this.me.videoElement,
            mediaConstraints: constraints,
            onicecandidate: candidate => {
                let msg = {
                    type: 'onIceCandidate',
                    userId: this.me.userId,
                    candidate: candidate
                };
                this.sendMessage(msg);
            }
        };
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
                    type: 'receiveVideoFrom',
                    userId: that.me.userId,
                    sdpOffer: sdpOffer
                };
                that.sendMessage(msg);
                that.emit('youJoinRoom', that.participants);
            });
        });

        message.participants.forEach(p => this.receiveVideo(p));
    }

    onNewArrived(message) {
        let currentP = this.receiveVideo(message.participant);
        this.emit('newParticipantJoinRoom', currentP);
    }

    /**
     * 准备接收其他参与者的视频
     * @param {{name, userId, prefix, suffix}} p 参与者信息
     * @return {Participant} 当前参与者对象
     */
    receiveVideo(p) {
        let part = new Participant();
        part.userId = p.userId;
        part.name = p.name;
        part.prefix = p.prefix;
        part.suffix = p.suffix;
        part.videoElement = document.createElement('video');
        this.participants.push(part);
        let myOptions = {
            remoteVideo: part.videoElement,
            onicecandidate: candidate => {
                let msg = {
                    type: 'onIceCandidate',
                    userId: part.userId,
                    candidate: candidate
                };
                this.sendMessage(msg);
            }
        };
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
            });
        });

        return part;
    }

    /**
     * 当参与者离开时
     * @param {{type, userId}} message 报文
     */
    onParticipantLeft(message) {
        let index = this.participants.findIndex(p => p.userId == message.userId);
        if (index === -1) {
        } else {
            let p = this.participants[index];
            p.dispose();
            this.participants.splice(index, 1);
            this.emit('participantLeftRoom', p);
        }
    }


    /**
     * 当收到参与者视频应答时
     * @param {{type, sdpAnswer}} message 报文
     */
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
                this.emit('participantNotFoundError', new Error('participant with userid: ' + message.userId + ' not found\nwhen do onReceiveVideoAnswer'));
            }
        }
    }

    /**
     * 当需要打洞时
     * @param {{type, candidate}} message 报文
     */
    onNeedIceCandidate(message) {
        if (message.userId === this.me.userId) {
            this.me.rtcPeer.addIceCandidate(message.candidate, error => {
                if (error) {
                    this.emit('addIceCandidateError', error);
                }
            });
        } else {
            let p = this.queryParticipantById(message.userId);
            if (p) {
                p.rtcPeer.addIceCandidate(message.candidate, error => {
                    if (error) {
                        this.emit('addIceCandidateError', error);
                    }
                });
            } else {
                this.emit('participantNotFoundError', new Error('participant with userid: ' + message.userId + ' not found\nwhen do onNeedIceCandidate'));
            }
        }
    }

    /**
     * 当接收到文字聊天信息时
     * @param {{type, message}} message 报文
     */
    onReceiveTextMessage(message) {
        let user = message.userId === this.me.userId ? this.me : this.queryParticipantById(message.userId);
        if (!user) {
            this.emit('receiveTextMessageError', new Error('participant not found'));
        } else {
            this.emit('receiveTextMessage', user, message.message);
        }
    }

    /**
     * 当接收到文件信息时
     * @param {{type, userId, fileType, fileName, fileUrl}} message
     */
    onReceiveFile(message) {
        let user = message.userId === this.me.userId ? this.me : this.queryParticipantById(message.userId);
        if (!user) {
            this.emite('receiveFileError', new Error('participant not found'));
        } else {
            this.emit('receiveFile', message, user);
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

    /**
     * 销毁所有参与者（断开连接并退出）
     */
    disposeAll() {
        this.participants.forEach(p => p.dispose());
        this.leave();
        this.ws.close();
    }

    /**
     * 通过userId查找参与者
     * @param {number} userId
     */
    queryParticipantById(userId) {
        let index = this.participants.findIndex(p => p.userId == userId);
        return index == -1 ? null : this.participants[index];
    }

}

export default KMSService;