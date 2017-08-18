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
        this.toBottom();       
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
        this.toBottom();
    }

    static roomSay(msg) {
        $("#line-end").before(`
        <li class='room-status'><p>${msg}</p></li>
        `);  
        this.toBottom();  
    }

    static getParticipantString(participant) {
        return `${participant.prefix} ${participant.name} ${participant.suffix}`;
        return `${participant.name}`;
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
}

MessageService.lastMessageTime = new Date();

export default MessageService;