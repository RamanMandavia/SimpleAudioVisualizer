/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,linearGradient,radialGradient,analyserNode,audioData;


function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	//gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:.25,color:"green"},{percent:.5,color:"yellow"},{percent:.75,color:"red"},{percent:1,color:"magenta"}]);
    linearGradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:1,color:"black"}]);
    radialGradient = utils.getRadialGradient(ctx, canvasWidth/2, canvasHeight/2, 25, canvasWidth/2, canvasHeight/2, canvasWidth/2,[{percent:0,color:"blue"},{percent:1,color:"black"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

function draw(params={}){
    // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
    if(params.frequencyData)
	   analyserNode.getByteFrequencyData(audioData); //frequency data
    else if(params.waveformData)
        analyserNode.getByteTimeDomainData(audioData); // waveform data
		
	// 3 - draw linear gradient
    if(params.showLinearGradient){
        ctx.save();
        ctx.fillStyle = linearGradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    } else if(params.showRadialGradient){ //draw radial gradient
        ctx.save();
        ctx.fillStyle = radialGradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    } else {
        // 2 - draw background
        ctx.save();
        ctx.fillStyle = "black";
        ctx.globalAlpha = .1;
        ctx.fillRect(0,0,canvasWidth, canvasHeight);
        ctx.restore();
    }
    
    // Line drawing
    if(params.showLineHorizontal){
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing);
        let barWidth = screenWidthForBars / audioData.length;
        let topSpacing = canvasHeight - 256;
        
        ctx.save();
        ctx.strokeStyle = params.lineHorizontalColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i=0; i<audioData.length; i++){
            if(i > 0)
                ctx.moveTo((i - 1) * (barWidth + barSpacing), (topSpacing + 256-audioData[i - 1])/2);
            else
                ctx.moveTo(-5, canvasHeight - 256);
            ctx.lineTo(i * (barWidth + barSpacing), (topSpacing + 256-audioData[i])/2);
        }
        ctx.stroke();
        ctx.closePath();
        if(params.invertLines){
            ctx.translate(canvasWidth, canvasHeight);
            ctx.rotate(Math.PI);
            ctx.beginPath();
            for (let i=0; i<audioData.length; i++){
                if(i > 0)
                    ctx.moveTo((i - 1) * (barWidth + barSpacing), (topSpacing + 256-audioData[i - 1])/2);
                else
                    ctx.moveTo(-5, canvasHeight - 256);
                ctx.lineTo(i * (barWidth + barSpacing), (topSpacing + 256-audioData[i])/2);
            }
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
    
    if(params.showLineVertical){
        let barSpacing = 4;
        let margin = 0;
        let screenHeightForBars = canvasHeight - (audioData.length * barSpacing);
        let barHeight = screenHeightForBars / audioData.length;
        let sideSpacing = canvasWidth - 256;
        
        ctx.save();
        ctx.strokeStyle = params.lineVerticalColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i=0; i<audioData.length; i++){
            if(i > 0)
                ctx.moveTo((sideSpacing + 256-audioData[i - 1])/2, (i - 1) * (barHeight + barSpacing));
            else
                ctx.moveTo(canvasWidth - 256, -5);
            ctx.lineTo((sideSpacing + 256-audioData[i - 1])/2, i * (barHeight + barSpacing));
        }
        ctx.stroke();
        ctx.closePath();
        if(params.invertLines){
            ctx.translate(canvasWidth, canvasHeight);
            ctx.rotate(Math.PI);
            ctx.beginPath();
            for (let i=0; i<audioData.length; i++){
                if(i > 0)
                    ctx.moveTo((sideSpacing + 256-audioData[i - 1])/2, (i - 1) * (barHeight + barSpacing));
                else
                    ctx.moveTo(canvasWidth - 256, -5);
                ctx.lineTo((sideSpacing + 256-audioData[i - 1])/2, i * (barHeight + barSpacing));
            }
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
    
	// 5 - draw circles
    if(params.showCircles){
        let maxRadius = params.circlesMaxRadius;
        ctx.save();
        ctx.globalAlpha = 0.5;
        for(let i=0; i<audioData.length; i++){
            // reddish circles
            let percent = audioData[i] / 255;
            
            let circleRadius = percent * maxRadius;
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255, 111, 111, .34 - percent/3.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
            
            // blueish circles, bigger, more transparent
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(0, 0, 255, .1 - percent/10.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * 1.5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
            
            // yellowish circles, smaller
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(200, 200, 0, .5 - percent/5.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * .5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
        ctx.restore();
    }
    
    // 4 - draw bars
	if(params.showBars){
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / (audioData.length);
        let topSpacing = 100;
        
        ctx.save();
        ctx.translate(canvasWidth/2, canvasHeight/2);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = params.barsFillColor;
        ctx.strokeStyle = params.barsOutlineColor;
        // loop through the data and draw
        for(let i=0; i<audioData.length; i++){
            let angle = i * ((Math.PI * 2) / audioData.length);
            
            ctx.save();
            ctx.rotate(i * (Math.PI / 45));
            ctx.fillRect(params.circlesMaxRadius * (1/3), -barWidth / 2, barWidth, audioData[i] * (.4 * (params.circlesMaxRadius/100)));
            ctx.strokeRect(params.circlesMaxRadius * (1/3), -barWidth / 2, barWidth, audioData[i] * (.4 * (params.circlesMaxRadius/100)));
            ctx.restore();
        }
        ctx.restore();
    }
    
    if(params.showNoise || params.showInvert || params.showEmboss){
        // 6 - bitmap manipulation
        // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
        // regardless of whether or not we are applying a pixel effect
        // At some point, refactor this code so that we are looping though the image data only if
        // it is necessary

        // A) grab all of the pixels on the canvas and put them in the `data` array
        // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
        // the variable `data` below is a reference to that array 
        let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        let data = imageData.data;
        let length = data.length;
        let width = imageData.width; // not used here
        // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
        for (let i=0; i<length; i+=4){
            // C) randomly change every 20th pixel to grey
            if (params.showNoise && Math.random() < .05){
                // data[i] is the red channel
                // data[i+1] is the green channel
                // data[i+2] is the blue channel
                // data[i+3] is the alpha channel
                data[i] = 145;
                data[i+1] = 145;
                data[i+2] = 145;
                data[i+3] = 175;
            } // end Noise if
            if (params.showInvert){
                let red = data[i], green = data[i+1], blue = data[i+2];
                data[i] = 255 - red; // set red value
                data[i+1] = 255 - green; // set green value
                data[i+2] = 255 - blue; // set blue value
                // leave alpah (data[i+3]) alone
            } // end Invert if
        } // end for
        
        // note we are stepping through each sub-pixel
        if (params.showEmboss){
            for (let i=0; i<length; i++){
                if (i%4 == 3) continue; // skip alpha channel
                data[i] = 127 + 2 * data[i] - data[i+4] - data[i + width * 4];
            }   
        } // end Emboss if

        // D) copy image data back to canvas
        ctx.putImageData(imageData, 0, 0);
    }
}

function createNewLinearGradient(stops, c1, c2, c3, c4){
    if (stops == 2){
        linearGradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:c1},{percent:1,color:c2}]);
    } else if (stops == 3){
        linearGradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:c1},{percent:.5,color:c2},{percent:1,color:c3}]);
    } else if (stops == 4){
        linearGradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:c1},{percent:.33,color:c2},{percent:.67,color:c3},{percent:1,color:c4}]);
    }
}

function createNewRadialGradient(stops, c1, c2, c3, c4){
    if (stops == 2){
        radialGradient = utils.getRadialGradient(ctx, canvasWidth/2, canvasHeight/2, 25, canvasWidth/2, canvasHeight/2, canvasWidth/2,[{percent:0,color:c1},{percent:1,color:c2}]);
    } else if (stops == 3){
        radialGradient = utils.getRadialGradient(ctx, canvasWidth/2, canvasHeight/2, 25, canvasWidth/2, canvasHeight/2, canvasWidth/2,[{percent:0,color:c1},{percent:.5,color:c2},{percent:1,color:c3}]);
    } else if (stops == 4){
        radialGradient = utils.getRadialGradient(ctx, canvasWidth/2, canvasHeight/2, 25, canvasWidth/2, canvasHeight/2, canvasWidth/2,[{percent:0,color:c1},{percent:.33,color:c2},{percent:.67,color:c3},{percent:1,color:c4}]);
    }
}

export {setupCanvas,draw, createNewLinearGradient, createNewRadialGradient};