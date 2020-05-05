/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as audio from './audio.js';
import * as utils from './utils.js';
import * as visualizer from './visualizer.js';

const drawParams = {
    frequencyData: true,
    waveformData: false,
    showLinearGradient: false,
    showRadialGradient: false,
    showBars: true,
    barsFillColor: "white",
    barsOutlineColor: "black",
    showLineHorizontal: true,
    lineHorizontalColor: "white",
    showLineVertical: false,
    lineVerticalColor: "white",
    invertLines: true,
    showCircles: false,
    circlesMaxRadius: 150,
    showNoise: false,
    showInvert: false,
    showEmboss: false
};

let trackProgress;

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/MickGordon-OnlyThingTheyFear.mp3"
});

audio.setupWebaudio(DEFAULTS.sound1);

function init(){
	console.log("init called");
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);
    visualizer.setupCanvas(canvasElement, audio.analyserNode);
    trackProgress = document.querySelector("#trackProgress");
    loop();
}

function setupUI(canvasElement){
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fsButton");
	
    // add .onclick event to fullscreen button
    fsButton.onclick = e => {
        console.log("init called");
        utils.goFullscreen(canvasElement);
    };
    
    // add .onclick event to the play button
    let playButton = document.querySelector("#playButton");
    playButton.onclick = e => {
        //check if contect is in suspended state (autoplay policy)
        if (audio.audioCtx.state == "suspended"){
            audio.audioCtx.resume();
        }
        if (e.target.dataset.playing == "no"){
            // if track is currently paused, play it
            audio.playCurrentSound();
            e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"
            // if track IS playing, pause it
        }else{
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
        }
    };
  
    // hookup volume slider and label
    let volumeSlider = document.querySelector("#volumeSlider");
    let volumeLabel = document.querySelector("#volumeLabel");
    
    // add .oninput event to the slider
    volumeSlider.oninput = e => {
        // set the gain
        audio.setVolume(e.target.value);
        // update the value of the label to match the value of the slider
        volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
    };
    
    // set the value of label to match inital value of slider
    volumeSlider.dispatchEvent(new Event("input"));
    
    // hookup delay slider
    let delaySlider = document.querySelector("#delaySlider");
    let delayLabel = document.querySelector("#delayLabel");
    delaySlider.oninput = e => {
        audio.setDelay(e.target.value);
        delayLabel.innerHTML = e.target.value;
    }
    delaySlider.dispatchEvent(new Event("input"));
    
    // hookup track select
    let trackSelect = document.querySelector("#trackSelect");
    // add .onchange to the select
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);
        // pause the current track if it is playing
        if (playButton.dataset.playing = "yes"){
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    };
    
    // hookup file picking
    let fileChooser = document.querySelector("#userTrack");
    fileChooser.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            audio.loadSoundFile(e.target.result);
        }
        // pause the current track if it is playing
        if (playButton.dataset.playing = "yes"){
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    }
    
    // Additional controls
    let noBackground = document.querySelector("#none");
    let linearGradientSelect = document.querySelector("#linearGradient");
    let radialGradientSelect = document.querySelector("#radialGradient");
    let barsSelect = document.querySelector("#barsCB");
    let barFillSelect = document.querySelector("#barFillColor");
    let barOutlineSelect = document.querySelector("#barOutlineColor");
    let circlesSelect = document.querySelector("#circlesCB");
    let nosieSelect = document.querySelector("#noiseCB");
    let invertSelect = document.querySelector("#invertCB");
    let embossSelect = document.querySelector("#embossCB");
    let freqencySelect = document.querySelector("#frequency");
    let waveformSelect = document.querySelector("#waveform");
    let circleRadiusSlider = document.querySelector("#radiusSlider");
    let horizontalSelect = document.querySelector("#horLineCB");
    let horizontalColorSelect = document.querySelector("#horLineColor");
    let verticalColorSelect = document.querySelector("#vertLineColor");
    let verticalSelect = document.querySelector("#vertLineCB");
    let invertLinesSelect = document.querySelector("#invertLines");
    let createNewGradient = document.querySelector("#newGradient");
    
    none.onchange = e => {
        drawParams.showLinearGradient = linearGradientSelect.checked;
        drawParams.showRadialGradient = radialGradientSelect.checked;
    };
    
    linearGradientSelect.onchange = e => {
        drawParams.showLinearGradient = e.target.checked;
        drawParams.showRadialGradient = radialGradientSelect.checked;
    };
    
    radialGradientSelect.onchange = e => {
        drawParams.showRadialGradient = e.target.checked;
        drawParams.showLinearGradient = linearGradientSelect.checked;
    };
    
    barsSelect.onchange = e => {
        drawParams.showBars = e.target.checked;
    };
    
    circlesSelect.onchange = e => {
        drawParams.showCircles = e.target.checked;
    };
    
    nosieSelect.onchange = e => {
        drawParams.showNoise = e.target.checked;
    };
    
    invertSelect.onchange = e => {
        drawParams.showInvert = e.target.checked;
    };
    
    embossSelect.onchange = e => {
        drawParams.showEmboss = e.target.checked;
    };
    
    freqencySelect.onchange = e => {
        drawParams.frequencyData = e.target.checked;
        drawParams.waveformData = waveformSelect.checked;
    };
    
    waveformSelect.onchange = e => {
        drawParams.waveformData = e.target.checked;
        drawParams.frequencyData = freqencySelect.checked;
    };
    
    circleRadiusSlider.oninput = e => {
        circleRadiusSlider.value = e.target.value;
        drawParams.circlesMaxRadius = e.target.value;
        document.querySelector("#radiusLabel").innerHTML = e.target.value;
    }
    circleRadiusSlider.dispatchEvent(new Event("input"));
    
    horizontalSelect.onchange = e => {
        drawParams.showLineHorizontal = e.target.checked;
    }
    
    verticalSelect.onchange = e => {
        drawParams.showLineVertical = e.target.checked;
    }
    
    invertLinesSelect.onchange = e => {
        drawParams.invertLines = e.target.checked;
    }
    
    createNewGradient.onclick = e => {
        if(drawParams.showLinearGradient)
            visualizer.createNewLinearGradient(document.querySelector("#colorStopNum").value, document.querySelector("#bgColorPicker1").value, document.querySelector("#bgColorPicker2").value, document.querySelector("#bgColorPicker3").value, document.querySelector("#bgColorPicker4").value);
        else if (drawParams.showRadialGradient)
            visualizer.createNewRadialGradient(document.querySelector("#colorStopNum").value, document.querySelector("#bgColorPicker1").value, document.querySelector("#bgColorPicker2").value, document.querySelector("#bgColorPicker3").value, document.querySelector("#bgColorPicker4").value);
    }
    
    horizontalColorSelect.onchange = e => {
        drawParams.lineHorizontalColor = e.target.value;
    }
    
    verticalColorSelect.onchange = e => {
        drawParams.lineVerticalColor = e.target.value;
    }
    
    barFillSelect.onchange = e => {
        drawParams.barsFillColor = e.target.value;
    }
    
    barOutlineSelect.onchange = e => {
        drawParams.barsOutlineColor = e.target.value;
    }
    
} // end setupUI

function loop(){
	requestAnimationFrame(loop);
    visualizer.draw(drawParams);
	// 1) create a byte array (values of 0-255) to hold the audio data
	// normally, we do this once when the program starts up, NOT every frame
	let audioData = new Uint8Array(audio.analyserNode.fftSize/2);
	
	// 2) populate the array of audio data *by reference* (i.e. by its address)
    if(drawParams.frequencyData)
	   audio.analyserNode.getByteFrequencyData(audioData);
    else if(drawParams.waveformData)
	   audio.analyserNode.getByteTimeDomainData(audioData);
    
    trackProgress.innerHTML = `${Math.trunc(audio.getCurrentSoundProgress()/60)}: ${audio.getCurrentSoundProgress()%60} / ${Math.trunc(audio.getCurrentSoundDuration()/60)}: ${audio.getCurrentSoundDuration()%60}`;
}

export {init};