Quiet.init({
    libfecPrefix: "./vendor/",
    profilesPrefix: "./vendor/",
    memoryInitializerPrefix: "./vendor/",
});

const profile = 'audible-fsk';

let transmitter;

function send(payload) {
    transmitter.transmit(Quiet.str2ab(payload));
}

function onReceive(payload) {
    let content = new ArrayBuffer(0);
    content = Quiet.mergeab(content, payload);
    const text = Quiet.ab2str(content);
    console.log(text);
    document.getElementById('received').innerText += text;
}

async function onQuietReady() {
    console.log(`Quiet is ready.`);

    transmitter = Quiet.transmitter({profile: profile, clampFrame: false/*important*/});

    Quiet.receiver({
        profile: profile,
        stream: location.href.endsWith('mic') ? await getMicStream() : await getSpeakerStream(),
        onReceive: (a) => onReceive(a),
        onCreateFail: (reason) => console.log("failed to create quiet receiver: " + reason),
        onReceiveFail: (num_fails) => console.log(`receive failed! ${num_fails}`)
    });
}

document.addEventListener("DOMContentLoaded", () => Quiet.addReadyCallback(
    onQuietReady,
    (reason) => console.log("quiet failed to initialize: " + reason)
));

async function getSpeakerStream() {
    const speaker = new MediaStream();

    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true ,
        audio: true
    });

    speaker.addTrack(stream.getAudioTracks()[0].clone());
    // stopping and removing the video track to enhance the performance
    stream.getVideoTracks()[0].stop();
    stream.removeTrack(stream.getVideoTracks()[0]);

    return speaker;
}

async function getMicStream() {
    return await navigator.mediaDevices.getUserMedia({
        audio: true
    });
}

