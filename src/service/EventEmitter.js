class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(eventName, callback) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(callback);
    }

    emit(eventName) {
        let events = this.events[eventName];
        if (events) {
            let args = Array.prototype.slice(1, arguments);
            for (let i = 0; i < events.length; i++) {
                events[i].apply(null, args);
            }
        }
    }
}
export default EventEmitter;