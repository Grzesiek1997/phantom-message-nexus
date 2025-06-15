
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeHub } from './useRealtimeHub';
import { useAuth } from '@/hooks/useAuth';

interface CallSession {
  id: string;
  initiator_id: string;
  receiver_id: string;
  type: 'voice' | 'video';
  status: 'calling' | 'connecting' | 'connected' | 'ended' | 'declined';
  started_at?: string;
  ended_at?: string;
  duration?: number;
}

/**
 * Real-time call management system
 * Handles voice/video call signaling, WebRTC connections, and call state
 */
export const useCallStream = () => {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallSession[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  
  const { user } = useAuth();
  const { subscribe, broadcast } = useRealtimeHub();

  /**
   * Handles incoming call events
   */
  const handleCallEvent = useCallback(async (payload: any) => {
    const { event, call_session, data } = payload;
    
    switch (event) {
      case 'call_initiated':
        if (call_session.receiver_id === user?.id) {
          setIncomingCall(call_session);
        }
        break;
        
      case 'call_accepted':
        if (call_session.initiator_id === user?.id) {
          setActiveCall(call_session);
          // Start WebRTC negotiation
          await initiateWebRTCConnection();
        }
        break;
        
      case 'call_declined':
      case 'call_ended':
        setActiveCall(null);
        setIncomingCall(null);
        cleanupCall();
        setCallHistory(prev => [call_session, ...prev]);
        break;
        
      case 'webrtc_offer':
        if (data.receiver_id === user?.id) {
          await handleWebRTCOffer(data.offer);
        }
        break;
        
      case 'webrtc_answer':
        if (data.initiator_id === user?.id) {
          await handleWebRTCAnswer(data.answer);
        }
        break;
        
      case 'ice_candidate':
        if (peerConnection && (data.receiver_id === user?.id || data.initiator_id === user?.id)) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;
    }
  }, [user?.id, peerConnection]);

  /**
   * Initiates a call to another user
   */
  const initiateCall = useCallback(async (receiverId: string, type: 'voice' | 'video') => {
    if (!user) return;

    const callSession: CallSession = {
      id: `call-${Date.now()}`,
      initiator_id: user.id,
      receiver_id: receiverId,
      type,
      status: 'calling',
      started_at: new Date().toISOString()
    };

    setActiveCall(callSession);

    // Get user media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Failed to get user media:', error);
      return;
    }

    // Broadcast call initiation
    broadcast('calls', 'call_event', {
      event: 'call_initiated',
      call_session: callSession
    });
  }, [user, broadcast]);

  /**
   * Accepts an incoming call
   */
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !user) return;

    // Get user media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.type === 'video'
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Failed to get user media:', error);
      return;
    }

    const updatedCall = {
      ...incomingCall,
      status: 'connecting' as const
    };

    setActiveCall(updatedCall);
    setIncomingCall(null);

    // Broadcast call acceptance
    broadcast('calls', 'call_event', {
      event: 'call_accepted',
      call_session: updatedCall
    });

    await setupWebRTCConnection();
  }, [incomingCall, user, broadcast]);

  /**
   * Declines an incoming call
   */
  const declineCall = useCallback(() => {
    if (!incomingCall) return;

    const updatedCall = {
      ...incomingCall,
      status: 'declined' as const,
      ended_at: new Date().toISOString()
    };

    setIncomingCall(null);
    setCallHistory(prev => [updatedCall, ...prev]);

    broadcast('calls', 'call_event', {
      event: 'call_declined',
      call_session: updatedCall
    });
  }, [incomingCall, broadcast]);

  /**
   * Ends the current call
   */
  const endCall = useCallback(() => {
    if (!activeCall) return;

    const updatedCall = {
      ...activeCall,
      status: 'ended' as const,
      ended_at: new Date().toISOString(),
      duration: activeCall.started_at 
        ? Math.floor((Date.now() - new Date(activeCall.started_at).getTime()) / 1000)
        : 0
    };

    setActiveCall(null);
    setCallHistory(prev => [updatedCall, ...prev]);
    cleanupCall();

    broadcast('calls', 'call_event', {
      event: 'call_ended',
      call_session: updatedCall
    });
  }, [activeCall, broadcast]);

  /**
   * Sets up WebRTC peer connection
   */
  const setupWebRTCConnection = useCallback(async () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && activeCall) {
        broadcast('calls', 'call_event', {
          event: 'ice_candidate',
          data: {
            candidate: event.candidate,
            initiator_id: activeCall.initiator_id,
            receiver_id: activeCall.receiver_id
          }
        });
      }
    };

    return pc;
  }, [localStream, activeCall, broadcast]);

  /**
   * Initiates WebRTC connection (for call initiator)
   */
  const initiateWebRTCConnection = useCallback(async () => {
    const pc = await setupWebRTCConnection();
    if (!pc || !activeCall) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      broadcast('calls', 'call_event', {
        event: 'webrtc_offer',
        data: {
          offer,
          initiator_id: activeCall.initiator_id,
          receiver_id: activeCall.receiver_id
        }
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }, [setupWebRTCConnection, activeCall, broadcast]);

  /**
   * Handles WebRTC offer (for call receiver)
   */
  const handleWebRTCOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const pc = await setupWebRTCConnection();
    if (!pc || !activeCall) return;

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      broadcast('calls', 'call_event', {
        event: 'webrtc_answer',
        data: {
          answer,
          initiator_id: activeCall.initiator_id,
          receiver_id: activeCall.receiver_id
        }
      });

      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  }, [setupWebRTCConnection, activeCall, broadcast]);

  /**
   * Handles WebRTC answer (for call initiator)
   */
  const handleWebRTCAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(answer);
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }, [peerConnection]);

  /**
   * Cleans up call resources
   */
  const cleanupCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
  }, [localStream, remoteStream, peerConnection]);

  /**
   * Toggles mute for audio track
   */
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  /**
   * Toggles video for video track
   */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribe('calls', 'calls', handleCallEvent);

    return () => {
      unsubscribe();
      cleanupCall();
    };
  }, [user, subscribe, handleCallEvent, cleanupCall]);

  return {
    activeCall,
    incomingCall,
    callHistory,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    isConnected: activeCall?.status === 'connected',
    isAudioMuted: localStream?.getAudioTracks()[0]?.enabled === false,
    isVideoEnabled: localStream?.getVideoTracks()[0]?.enabled === true
  };
};
