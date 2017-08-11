class EventEmitter {
    events = {};
    on(eventName, callback) {
        this.events[eventName] = this.events[eventname] || [];
        this.events[eventName].push(callback);
    }

    emit(eventName) {
        events = this.events[eventName];
        args = Array.prototype.slice(1, arguments);
        for (let i = 0, m = events.length; i < m; i++) {
            events[i].apply(null, args);
        }
    }
}
export default EventEmitter;