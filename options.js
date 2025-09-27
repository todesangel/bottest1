function tabCapture() {
    return new Promise((resolve) => {
        chrome.tabCapture.capture(
            {
                audio: true,
                video: false,
            },
            (stream) => {
                resolve(stream);
            }
        );
    });
}

var cTabObj = {};


const createAudioContext = async (stream) => {
    cTabObj.audioContext = new AudioContext({latencyHint: 'playback'});
    cTabObj.audioSource = cTabObj.audioContext.createMediaStreamSource(stream);

    cTabObj.audioGain = cTabObj.audioContext.createGain(); //Rename gainNode

    let a = new Tuna(cTabObj.audioContext);

    const {isChorus, isConvolver, isMono, isPitch, volume, eq, convolver, chorus, compressor} = await Core.getItem({
        isChorus: false,
        isConvolver: true,
        compressor: {
            threshold: -20,
            attack: 0,
            release: 250,
            makeupGain: 1,
            ratio: 4,
            knee: 5,
            bypass: false,
            automakeup: false
        },
        convolver: {
            highCut: 22050,
            lowCut: 20,
            dryLevel: 1,
            wetLevel: 1,
            level: 1,
            bypass: false,
        },
        chorus: {
            rate: 0,
            depth: 0.7,
            feedback: 0.4,
            delay: 0.0045
        },
        isMono: false,
        isPitch: false,
        volume: 1,
        eq: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    })
    if (isChorus) {
        cTabObj.chorus = new a.Chorus({
            bypass: 0,
            rate: chorus.rate,
            depth: chorus.depth,
            feedback: chorus.depth,
            delay: chorus.delay
        });
    }
    if (isConvolver) {
        cTabObj.convolver = new a.Convolver({
            bypass: 0,
            highCut: convolver.highCut,
            lowCut: convolver.lowCut,
            dryLevel: convolver.dryLevel,
            wetLevel: convolver.wetLevel,
            level: convolver.level
        })
    }
    if (isPitch) {
        cTabObj.pitch = new Jungle(cTabObj.audioContext);
    }

    cTabObj.compressor = new a.Compressor({
        bypass: 0,
        threshold: compressor.threshold,
        attack: compressor.attack,
        release: compressor.release,
        //makeupGain: compressor.makeupGain,
        ratio: compressor.ratio,
        knee: compressor.knee,
    })


    cTabObj.panSplitter = cTabObj.audioContext.createChannelSplitter(2);
    cTabObj.leftGain = cTabObj.audioContext.createGain();
    cTabObj.rightGain = cTabObj.audioContext.createGain();
    cTabObj.panMerger = cTabObj.audioContext.createChannelMerger(2);
    cTabObj.monoSplitter = cTabObj.audioContext.createChannelSplitter(2);
    cTabObj.monoGain = cTabObj.audioContext.createGain();
    cTabObj.monoMerger = cTabObj.audioContext.createChannelMerger(2);


    cTabObj.twenty = cTabObj.audioContext.createBiquadFilter();
    cTabObj.fifty = cTabObj.audioContext.createBiquadFilter();
    cTabObj.oneHundred = cTabObj.audioContext.createBiquadFilter();
    cTabObj.twoHundred = cTabObj.audioContext.createBiquadFilter();
    cTabObj.fiveHundred = cTabObj.audioContext.createBiquadFilter();
    cTabObj.oneThousand = cTabObj.audioContext.createBiquadFilter();
    cTabObj.twoThousand = cTabObj.audioContext.createBiquadFilter();
    cTabObj.fiveThousand = cTabObj.audioContext.createBiquadFilter();
    cTabObj.tenThousand = cTabObj.audioContext.createBiquadFilter();
    cTabObj.twentyThousand = cTabObj.audioContext.createBiquadFilter();



    cTabObj.twenty.type = "lowshelf"
    cTabObj.twenty.frequency.setValueAtTime(32, cTabObj.audioContext.currentTime);
    cTabObj.twenty.gain.setValueAtTime(Number(eq[0]), cTabObj.audioContext.currentTime);

    cTabObj.fifty.type = "peaking";
    cTabObj.fifty.frequency.setValueAtTime(64, cTabObj.audioContext.currentTime);
    cTabObj.fifty.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.fifty.gain.setValueAtTime(Number(eq[1]), cTabObj.audioContext.currentTime);

    cTabObj.oneHundred.type = "peaking";
    cTabObj.oneHundred.frequency.setValueAtTime(125, cTabObj.audioContext.currentTime);
    cTabObj.oneHundred.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.oneHundred.gain.setValueAtTime(Number(eq[2]), cTabObj.audioContext.currentTime);


    cTabObj.twoHundred.type = "peaking";
    cTabObj.twoHundred.frequency.setValueAtTime(250, cTabObj.audioContext.currentTime);
    cTabObj.twoHundred.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.twoHundred.gain.setValueAtTime(Number(eq[3]), cTabObj.audioContext.currentTime);


    cTabObj.fiveHundred.type = "peaking";
    cTabObj.fiveHundred.frequency.setValueAtTime(500, cTabObj.audioContext.currentTime);
    cTabObj.fiveHundred.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.fiveHundred.gain.setValueAtTime(Number(eq[4]), cTabObj.audioContext.currentTime);


    cTabObj.oneThousand.type = "peaking";
    cTabObj.oneThousand.frequency.setValueAtTime(1000, cTabObj.audioContext.currentTime);
    cTabObj.oneThousand.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.oneThousand.gain.setValueAtTime(Number(eq[5]), cTabObj.audioContext.currentTime);


    cTabObj.twoThousand.type = "peaking";
    cTabObj.twoThousand.frequency.setValueAtTime(2000, cTabObj.audioContext.currentTime);
    cTabObj.twoThousand.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.twoThousand.gain.setValueAtTime(Number(eq[6]), cTabObj.audioContext.currentTime);

    cTabObj.fiveThousand.type = "peaking";
    cTabObj.fiveThousand.frequency.setValueAtTime(4000, cTabObj.audioContext.currentTime);
    cTabObj.fiveThousand.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.fiveThousand.gain.setValueAtTime(Number(eq[7]), cTabObj.audioContext.currentTime);


    cTabObj.tenThousand.type = "peaking";
    cTabObj.tenThousand.frequency.setValueAtTime(8000, cTabObj.audioContext.currentTime);
    cTabObj.tenThousand.Q.setValueAtTime(5, cTabObj.audioContext.currentTime);
    cTabObj.tenThousand.gain.setValueAtTime(Number(eq[8]), cTabObj.audioContext.currentTime);


    cTabObj.twentyThousand.type = "highshelf";
    cTabObj.twentyThousand.frequency.setValueAtTime(16000, cTabObj.audioContext.currentTime);
    cTabObj.twentyThousand.gain.setValueAtTime(Number(eq[9]), cTabObj.audioContext.currentTime);


    cTabObj.audioGain.gain.setValueAtTime(volume, cTabObj.audioContext.currentTime);
    cTabObj.monoGain.gain.setValueAtTime(.6, cTabObj.audioContext.currentTime);

    if (isPitch) {
        cTabObj.pitch.value = 0;
        cTabObj.pitch.setPitchOffset(0)
    }
    cTabObj.audioSource.connect(cTabObj.panSplitter);
    cTabObj.panSplitter.connect(cTabObj.leftGain, 0);
    cTabObj.panSplitter.connect(cTabObj.rightGain, 1);
    cTabObj.leftGain.connect(cTabObj.panMerger, 0, 0);
    cTabObj.rightGain.connect(cTabObj.panMerger, 0, 1);

    if (isMono) {
        toggleMonoNodes(true)
    } else {
        toggleMonoNodes(false)
    }

    if (isPitch && isChorus && isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.pitch);
        cTabObj.pitch.output.connect(cTabObj.chorus);
        cTabObj.chorus.connect(cTabObj.convolver);
        cTabObj.convolver.connect(cTabObj.twenty)

    } else if (!isPitch && isChorus && isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.chorus);
        cTabObj.chorus.connect(cTabObj.convolver);
        cTabObj.convolver.connect(cTabObj.twenty);
    } else if (isPitch && !isChorus && isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.pitch);
        cTabObj.pitch.output.connect(cTabObj.convolver);
        cTabObj.convolver.connect(cTabObj.twenty);
    } else if (isPitch && isChorus && !isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.pitch);
        cTabObj.pitch.output.connect(cTabObj.chorus);
        cTabObj.chorus.connect(cTabObj.twenty);
    } else if (isPitch && !isChorus && !isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.pitch);
        cTabObj.pitch.output.connect(cTabObj.twenty);
    } else if (!isPitch && !isChorus && isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.convolver);
        cTabObj.convolver.connect(cTabObj.twenty);
    } else if (!isPitch && !isConvolver && isChorus) {
        cTabObj.monoMerger.connect(cTabObj.chorus);
        cTabObj.chorus.connect(cTabObj.twenty);
    } else if (!isPitch && !isChorus && !isConvolver) {
        cTabObj.monoMerger.connect(cTabObj.twenty);
    }


    cTabObj.twenty.connect(cTabObj.fifty);
    cTabObj.fifty.connect(cTabObj.oneHundred);
    cTabObj.oneHundred.connect(cTabObj.twoHundred);
    cTabObj.twoHundred.connect(cTabObj.fiveHundred);
    cTabObj.fiveHundred.connect(cTabObj.oneThousand);
    cTabObj.oneThousand.connect(cTabObj.twoThousand);
    cTabObj.twoThousand.connect(cTabObj.fiveThousand);
    cTabObj.fiveThousand.connect(cTabObj.tenThousand);
    cTabObj.tenThousand.connect(cTabObj.twentyThousand);
    cTabObj.twentyThousand.connect(cTabObj.compressor);


    cTabObj.compressor.connect(cTabObj.audioGain);
    //cTabObj.wahwah.connect(cTabObj.audioGain)

    cTabObj.audioGain.connect(cTabObj.audioContext.destination)
    return cTabObj;
}

function toggleMonoNodes(status) {
    if (cTabObj.panMerger.context.__connectified__ == 1) {
        cTabObj.panMerger.disconnect();
    }
    if (cTabObj.monoSplitter.context.__connectified__ == 1) {
        cTabObj.monoSplitter.disconnect();
    }
    if (cTabObj.monoGain.context.__connectified__ == 1) {
        cTabObj.monoGain.disconnect();
    }
    if (status === true) {
        cTabObj.panMerger.connect(cTabObj.monoGain);
        cTabObj.monoGain.connect(cTabObj.monoSplitter);
        cTabObj.monoSplitter.connect(cTabObj.monoMerger, 0, 1);
        cTabObj.monoSplitter.connect(cTabObj.monoMerger, 0, 0);
        cTabObj.monoSplitter.connect(cTabObj.monoMerger, 1, 0);
    } else {
        cTabObj.panMerger.connect(cTabObj.monoSplitter);
        cTabObj.monoSplitter.connect(cTabObj.monoMerger, 0, 0);
    }

    cTabObj.monoSplitter.connect(cTabObj.monoMerger, 1, 1)
}


function startRecord() {
    return new Promise(async (resolve, reject) => {
        const stream = await tabCapture();
        if (stream) {
            // call when the stream inactive
            /*stream.oninactive = () => {
                window.close();
            };*/
            await createAudioContext(stream)
            resolve(stream)

        } else {

            window.close();
        }
    })

}

// Receive data from Current Tab or Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {type} = request,
        action = type.toLowerCase();
    switch (action) {
        case "start_record":
            startRecord().then(() => {
                cTabObj.id = request.data.currentTabId;
                sendResponse({
                    status: true
                })
            });
            break;
        case "change_volume":
            cTabObj.audioGain.gain.value = request.value;
            sendResponse({
                status: true,
                ...request
            })
            break;
        case "change_equalizer": {
            const {value} = request;
            cTabObj.twenty.gain.setValueAtTime(Number(value[0]), cTabObj.audioContext.currentTime);
            cTabObj.fifty.gain.setValueAtTime(Number(value[1]), cTabObj.audioContext.currentTime);
            cTabObj.oneHundred.gain.setValueAtTime(Number(value[2]), cTabObj.audioContext.currentTime);
            cTabObj.twoHundred.gain.setValueAtTime(Number(value[3]), cTabObj.audioContext.currentTime);
            cTabObj.fiveHundred.gain.setValueAtTime(Number(value[4]), cTabObj.audioContext.currentTime);
            cTabObj.oneThousand.gain.setValueAtTime(Number(value[5]), cTabObj.audioContext.currentTime);
            cTabObj.twoThousand.gain.setValueAtTime(Number(value[6]), cTabObj.audioContext.currentTime);
            cTabObj.fiveThousand.gain.setValueAtTime(Number(value[7]), cTabObj.audioContext.currentTime);
            cTabObj.tenThousand.gain.setValueAtTime(Number(value[8]), cTabObj.audioContext.currentTime);
            cTabObj.twentyThousand.gain.setValueAtTime(Number(value[9]), cTabObj.audioContext.currentTime);
            sendResponse({status: true, ...request});

            break
        }
        case "closeaudio":
        case "closeAudio": {
            if (cTabObj.audioSource) {
                //cTabObj.audioSource.getAudioTracks()[0].stop();
                window.close()
                cTabObj.audioContext.close();
                cTabObj = {};
                sendResponse({
                    status: true, ...request
                })
            } else {
                sendResponse({
                    status: true, ...request
                })
            }
            break;
        }
        case "change_compressor": {
            const {threshold, release, makeupGain, attack, ratio, knee} = request.value;
            cTabObj.compressor.automate("threshold", parseFloat(threshold))
            cTabObj.compressor.automate("release", parseFloat(release))
            //cTabObj.compressor.automate("makeupGain", parseFloat(makeupGain))
            cTabObj.compressor.automate("attack", parseFloat(attack))
            cTabObj.compressor.automate("ratio", parseFloat(ratio))
            cTabObj.compressor.automate("knee", parseFloat(knee))
            sendResponse(cTabObj.compressor);
            break;
        }

        case "change_pitch": {
            let data = request;
            if (!cTabObj.pitch) {
                cTabObj = {};
                chrome.storage.local.set({
                    isPitch: true
                }, () => {
                    startRecord().then(() => {
                        cTabObj.pitch.setPitchOffset(data.value.value);
                        cTabObj.pitch.value = data.value.value
                        sendResponse(data);
                    })
                })

            } else {
                cTabObj.pitch.setPitchOffset(data.value.value);
                cTabObj.pitch.value = data.value.value;
                sendResponse(data)

            }
            break;
        }
        case "change_convolver": {
            const data = request;
            if (!cTabObj.convolver) {
                //cTabObj.audioContext.close();
                cTabObj = {};
                chrome.storage.local.set({isConvolver: true},
                    () => {
                        startRecord().then(() => {
                            cTabObj.convolver.automate("lowCut", parseFloat(data.value.lowCut));

                        })
                    })

            } else {
                cTabObj.convolver.automate("lowCut", parseFloat(data.value.lowCut));
                cTabObj.convolver.automate("highCut", parseFloat(data.value.highCut));
                cTabObj.convolver.automate("wetLevel", parseFloat(data.value.wetLevel));
                cTabObj.convolver.automate("level", parseFloat(data.value.level));
                cTabObj.convolver.automate("dryLevel", parseFloat(data.value.dryLevel));
                sendResponse({
                    status: true,
                    ...request
                })
            }
            break;
        }
        case "change_chorus": {
            const data = request;
            if (!cTabObj.chorus) {
                //cTabObj.audioContext.close();
                cTabObj = {};
                chrome.storage.local.set({isChorus: true},
                    () => {
                        startRecord().then(() => {
                            cTabObj.chorus.rate = parseFloat(data.value.rate);
                            cTabObj.chorus.depth = parseFloat(data.value.depth);
                            cTabObj.chorus.feedback = parseFloat(data.value.feedback);
                            cTabObj.chorus.delay = parseFloat(data.value.delay);
                            cTabObj.chorusFixedDelay = data.value.delay;
                            sendResponse({
                                status: true,
                                ...request
                            })
                        })
                    })

            } else {
                cTabObj.chorus.rate = parseFloat(data.value.rate);
                cTabObj.chorus.depth = parseFloat(data.value.depth);
                cTabObj.chorus.feedback = parseFloat(data.value.feedback);
                cTabObj.chorus.delay = parseFloat(data.value.delay);
                cTabObj.chorusFixedDelay = data.value.delay;

                sendResponse({
                    status: true,
                    ...request
                })
            }
            break;
        }
        default:
            sendResponse({
                status: false,
                ...request
            })
            break;
    }
});

const getParam = (item)=> {
    return new Promise(resolve => {
        chrome.storage.local.get([item], (data) => {
            resolve(data[item]);
        })
    })
}
const fullScreenFix = function (data) {
    if (data.status == "active" && data.tabId) {
        chrome.storage.local.set({fullScreen: true}, () => {
            chrome.windows.getCurrent(async function (window) {
                const windowId = window.id;
                const isfullScreen = await getParam("fullScreen")
                if(isfullScreen !== false) {
                    if (data.fullscreen == true) {
                        chrome.storage.local.set({windowState: window.state})
                        chrome.windows.update(windowId, {state: "fullscreen"}, null)
                    } else {
                        const windowState = await getParam("windowState");
                        chrome.windows.update(windowId, {state: windowState}, null);
                    }
                } else {
                    chrome.windows.update(windowId, {state: window.state}, null)
                }
            })

        })

    }
}
chrome.tabCapture.onStatusChanged.addListener(fullScreenFix)