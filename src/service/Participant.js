import { WebRtcPeer } from 'kurento-utils'

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
}

export default Participant;
