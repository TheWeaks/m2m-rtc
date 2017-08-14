import { WebRtcPeer } from 'kurento-utils'
import EventEmitter from './EventEmitter'

class Participant {

	constructor() {
		this.userId = 0;
		this.name = '';
		this.prefix = '';
		this.suffix = '';
		this.videoElement = null;
	}

	createRtcPeer() {
		Object.defineProperty(this, 'rtcPeer', { writable: true });
	}

	dispose() {
		this.rtcPeer.dispose();
		this.removeElement();
	};

	removeElement() {

	}



	


	// this.offerToReceiveVideo = function(error, offerSdp, wp){
	// 	if (error) return console.error ("sdp offer error")
	// 	console.log('Invoking SDP offer callback function');
	// 	var msg =  { id : "receiveVideoFrom",
	// 			sender : name,
	// 			sdpOffer : offerSdp
	// 		};
	// 	sendMessage(msg);
	// }


	// this.onIceCandidate = function (candidate, wp) {
	// 	  console.log("Local candidate" + JSON.stringify(candidate));

	// 	  var message = {
	// 	    id: 'onIceCandidate',
	// 	    candidate: candidate,
	// 	    name: name
	// 	  };
	// 	  sendMessage(message);
	// }

	// Object.defineProperty(this, 'rtcPeer', { writable: true});

	// this.dispose = function() {
	// 	console.log('Disposing participant ' + this.name);
	// 	this.rtcPeer.dispose();
	// 	container.parentNode.removeChild(container);
	// };
}

export default Participant;
