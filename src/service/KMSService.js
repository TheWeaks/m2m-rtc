import EventEmitter from './EventEmitter'
/**
 * KMS 服务类
 */
export class KMSService extends EventEmitter {
    constructor(url) {
        super();
        this.defaultJoinRoomConfig = {
            id: 'join',
            room: 'default',
        }
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
            this.login(username, password);
        }
        this.ws.onerror = event => {
            this.emit('error', event);
        }
        this.ws.onmessage = messageEvent => {
            let message = JSON.parse(messageEvent.data)
            console.log('message received: ' + message);
            switch (message.id) {
                // 身份验证通过
                case '_login':
                    this.emit('loginSuccess');
                    break;
                // 房间加入成功
                case '_joinRoom': 
                    this.emit('joinRoomSuccess');
                    break;
                // 已在房间中的参与者
                case 'existingParticipants': 
                    if (message.error) {
                        this.emit('error', message.error)
                    } else {
                        this.onExistingParticipants(message);
                    }
                
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
     * @param {{id, room}} config 请求信息，结构：{id: 'join, room}  不填 默认加入default房间
     */
    joinRoom(config) {
        this.j
        config = Object.assign(this.defaultJoinRoomConfig, config);
        this.sendMessage(config);
    }

    /**
     * 当加入房间成功并返回当前房间用户数据的时候
     * @param {{data}} message 
     */
    onExistingParticipants(message) {
        
    }

    sendMessage(message) {
        let jsonMsg = JSON.stringify(message);
        this.ws.send(jsonMsg);
        console.log('message send: \n' + jsonMsg);
    }
}