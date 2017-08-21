import { WebRtcPeer } from 'kurento-utils'

/**
 * 参与者
 */
class Participant {

	constructor() {
		this.userId = 0;
		this.name = '';
		this.prefix = '';
		this.suffix = '';
		this.videoElement = null;
		this.rtcPeer = null;
	}

	dispose() {
		this.rtcPeer.dispose();
	};

	toString() {
		// return `${this.prefix} ${this.name} ${this.suffix}`;
        return `${this.name}`;
	}
}

export default Participant;
