import $ from 'jquery';

class MessageService {

    static iSay(msg) {
        $("#line-end").before(`
        <li class='chat-line-right'>
            <div class='line-user-name-right'>你</div>
            <p>${this.encodeHTML(msg)}</p>
        </li>
        `);
        $('.chat-textarea').val('');
        this.toBottom();
    }

    static otherSay(msg, participant) {
        $("#line-end").before(`
        <li class='chat-line-left'>
            <div class='line-user-name'>
                ${participant.toString()}
            </div>
            <p>${this.encodeHTML(msg)}</p>
        </li>
        `);
        this.toBottom();
    }

    /**
     * 
     * @param {{type, userId, fileType, fileName, fileUrl}} fileInfo
     */
    static iSendFile(fileInfo) {
        this.sendFile('right', fileInfo, null);
        this.toBottom();
    }

    /**
     * 
     * @param {{type, userId, fileType, fileName, fileUrl}} fileInfo
     * @param {Participant} participant
     */
    static otherSendFile(fileInfo, participant) {
        this.sendFile('left', fileInfo, participant);
        this.toBottom();
    }

    static sendFile(className, fileInfo, participant) {
        if (new RegExp(this.FILE_TYPE_REGEX.IMAGE).test(fileInfo.fileType))
            $("#line-end").before(`
            <li class="chat-line-${className}">
                <div class="line-user-name-${className}">${participant ? participant.toString() : '你'}</div>
                <p><a href="${fileInfo.fileUrl}" target="_blank"><img class="chat-line-image" src="${fileInfo.fileUrl}"></a></p>
            </li>
            `)
        else {
            let icon = '';
            for (let key in this.FILE_TYPE_REGEX) {
                if (new RegExp(this.FILE_TYPE_REGEX[key]).test(fileInfo.fileType)) {
                    icon = this.FILE_TYPE_ICON[key];
                    break;
                }
            }
            if (!icon) {
                icon = this.FILE_TYPE_ICON.UNKNOW;
            }
            $("#line-end").before(`
            <li class='chat-line-${className}'>
                <div class="line-user-name-${className}">${participant ? participant.toString() : '你'}</div>
                <p><a href="${fileInfo.fileUrl}" target="_blank">${icon}<br/>${fileInfo.fileName}</a></p>
            </li>
            `)
        }
    }

    static roomSay(msg) {
        $("#line-end").before(`
        <li class='room-status'><p>${msg}</p></li>
        `);
        this.toBottom();
    }

    static checkTime() {
        let now = new Date();
        if (now.getTime() - this.lastMessageTime.getTime() > 1000 * 60 * 2) {
            this.addTimeStamp(now);
        }
        this.lastMessageTime = now;
    }

    static addTimeStamp(time) {
        $("#line-end").before(`
        <li class="time-divider"><p>${time.toLocaleTimeString()}</p></li>
        `);
    }

    static toBottom() {
        document.getElementById("line-end").scrollIntoView();
    }

    static encodeHTML(msg) {
        let temp = document.createElement('div');
        temp.innerText = msg;
        return temp.innerHTML;
    }

    static decodeHTML(msg) {
        let temp = document.createElement('div');
        temp.innerHTML = msg;
        return temp.innerText;
    }
}

MessageService.lastMessageTime = new Date();
MessageService.FILE_TYPE_REGEX = {
    IMAGE: /image\/\w+/,
    WORD: /vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/msword/,
    EXCEL: /application\/vnd\.ms-excel/,
    PDF: /application\/pdf/,
    ZIP: /application\/zip|application\/x-rar-compressed|application\/octet-stream/,
    AUDIO: /audio\/\w+/,
    VIDEO: /video\/\w+/
}

MessageService.FILE_TYPE_ICON = {
    WORD: `<i style="font-size: 50px" class="fa fa-file-word-o" aria-hidden="true"></i>`,
    EXCEL: `<i style="font-size: 50px"  class="fa fa-file-excel-o" aria-hidden="true"></i>`,
    PDF: `<i style="font-size: 50px"  class="fa fa-file-pdf-o" aria-hidden="true"></i>`,
    ZIP: `<i style="font-size: 50px"  class="fa fa-file-archive-o" aria-hidden="true"></i>`,
    AUDIO: `<i style="font-size: 50px"  class="fa fa-file-audio-o" aria-hidden="true"></i>`,
    VIDEO: `<i style="font-size: 50px"  class="fa fa-file-video-o" aria-hidden="true"></i>`,
    UNKNOW: `<i style="font-size: 50px" class="fa fa-file" aria-hidden="true"></i>`
}


export default MessageService;
