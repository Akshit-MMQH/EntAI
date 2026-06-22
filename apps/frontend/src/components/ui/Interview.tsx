import { BACKEND_URL } from "@/lib/config";
import { useEffect, useRef } from "react";
import { useParams } from "react-router"
import { DeepgramClient } from "@deepgram/sdk";


export function Interview() {

    const { interviewId } = useParams();
    const audioRef = useRef<HTMLAudioElement>(null);
    const client = new DeepgramClient();


    useEffect(() => {

        (async () => {
            const pc = new RTCPeerConnection();

            audioRef.current = document.createElement("audio");
            audioRef.current.autoplay = true;
            pc.ontrack = (e) => (audioRef.current!.srcObject = e.streams[0]!);

            const ms = await navigator.mediaDevices.getUserMedia({ audio: true });

            const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
                'token',
                process.env.DEEPGRAM_API_KEY!,
            ]);

            socket.onopen = () => {
            const mediaRecorder = new MediaRecorder(ms, {mimeType: 'audio/webm' });
            mediaRecorder.start(250);
            mediaRecorder.addEventListener('dataavailable', (event) => {      
                socket.send(event.data);
            })

            }

            pc.addTrack(ms.getTracks()[0]!);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const sdpResponse = await fetch(`${BACKEND_URL}/api/v1/session/${interviewId}`, {
                method: "POST",
                body: offer.sdp,
                headers: { "Content-Type": "application/sdp" },
            });

            const answer = { type: "answer" as "answer", sdp: await sdpResponse.text() };
            await pc.setRemoteDescription(answer);

        })();

    }, [interviewId])



    return <div>
        <audio autoPlay ref={audioRef}></audio>
        interview
    </div>
}