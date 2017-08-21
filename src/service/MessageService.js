import $ from 'jquery'
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

    static roomSay(msg) {
        $("#line-end").before(`
        <li class='room-status'><p>${msg}</p></li>
        `);
        this.toBottom();
    }

    static checkTime() {
        let now = new Date();
        if (now.getTime() - this.lastMessageTime.getTime() > 1000 * 60 * 2) {
            this.addTimeStamp(now)
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

export default MessageService;