import $ from 'jquery'
class MessageService {

    static iSay(msg) {
        $("#line-end").before(`
        <li class='chat-line-right'> +
            <div class='line-user-name-right'>你</div> +
            <p>${msg}</p> +
        </li>
        `);
        $(".chat-textarea").val("");
    }

    static otherSay(msg, participant) {
        $("#line-end").before(`
        <li class='chat-line-left'>
            <div class='line-user-name'>
                ${this.getParticipantString(participant)}
            </div>
            <p>${msg}</p>
        </li>
        `);
    }

    static getParticipantString(participant) {
        return `${participant.prefix} ${participant.name} ${participant.suffix}`;
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
        <li class="time-divider">${time.toLocaleTimeString()}</li>
        `);
    }
}

MessageService.lastMessageTime = new Date();

export default MessageService;