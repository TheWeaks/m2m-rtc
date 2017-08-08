import { WebRtcPeer } from 'kurento-utils'

class Participant {

    constructor(name, isHost = false) {
        this.name = name;
    }

    startSendRTC(videoElement) {
        if (this.rtcPeer) {
            this.rtcPeer.dispose();
        }
        Object.defineProperty(this, 'rtcPeer', { writable: true});
        this.rtcPeer = new WebRtcPeer.WebRtcPeerSendOnly(option, error => {
			if (error) {
				throw error;
			}
		})
    }
	

	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")
		console.log('Invoking SDP offer callback function');
		var msg =  { id : "receiveVideoFrom",
				sender : name,
				sdpOffer : offerSdp
			};
		sendMessage(msg);
	}


	this.onIceCandidate = function (candidate, wp) {
		  console.log("Local candidate" + JSON.stringify(candidate));

		  var message = {
		    id: 'onIceCandidate',
		    candidate: candidate,
		    name: name
		  };
		  sendMessage(message);
	}

	Object.defineProperty(this, 'rtcPeer', { writable: true});

	this.dispose = function() {
		console.log('Disposing participant ' + this.name);
		this.rtcPeer.dispose();
		container.parentNode.removeChild(container);
	};
}
