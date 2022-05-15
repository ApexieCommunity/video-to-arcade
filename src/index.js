'use strict';

let mode = "full-width"
const gifFrames = require("gif-frames")
const jszip = require("jszip")
const jquery = require("jquery")
const axios = require("axios")

const canvas = document.querySelector("canvas")
const copyButton = document.querySelector("button#copy")
const fileInput = document.querySelector("input#uploadFile")
const form = document.querySelector("form")
const url = document.getElementById("url")
const textarea = document.querySelector("textarea#code")

const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(
                'sw.js',
                {
                    scope: '/',
                }
            );
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();

let originalImageSize = {
	width: 0,
	height: 0
}

fileInput.addEventListener("change", async function whenImageIsUploaded() {
	if(this.files[0].name.endsWith(".gif")) {
		let gifFrameArray = new Array()
		await gifFrames({ url: window.URL.createObjectURL(this.files[0]), frames: "all", outputType: "canvas", cumulative: true }).then(function(frameData) {
            frameData.forEach(function(frame) {
                var image = new Image()
                image.width = frame.frameInfo.width
                image.height = frame.frameInfo.height
                image.src = frame.getImage().toDataURL()
                gifFrameArray.push(image)
            })
		})
		originalImageSize.width = gifFrameArray[0].width
        originalImageSize.height = gifFrameArray[0].height
        console.log(gifFrameArray)
        convert(gifFrameArray)
	} /** else if(this.files[0].name.endsWith(".mp4")) {
		let file = this.files[0]
		let fileName = file.name
		let fileSize = (file.size / 1024).toFixed(2)
		let fileType = file.type
		let fileReader = new FileReader()
		var b64str = ""
		fileReader.onload = function(e) {
			b64str = e.target.result
		}
		fileReader.readAsDataURL(file)

		var videoObj = document.createElement('video');
		var displayedHeight=500;

		if(videoObj.canPlayType(fileType)) {
			videoObj.setAttribute('id','inputVideo');
			videoObj.setAttribute('src', b64str);
			videoObj.setAttribute('height', displayedHeight);
		}

		var vidHeight=videoObj.videoHeight;
		var vidWidth=videoObj.videoWidth;
		var bitmap = document.createElement('canvas');
		bitmap.setAttribute('id', 'bitmap');
		bitmap.setAttribute('width', vidWidth);
		bitmap.setAttribute('height', vidHeight);

		const inputVideo = document.getElementById('inputVideo');
		const bitmapCanvas = document.getElementById('bitmap');
		const bitmapCtx = bitmapCanvas.getContext('2d');
		inputVideo.muted = true;
		inputVideo.loop = false;
		inputVideo.autoplay=true;
		const background = () => {
  			bitmapCtx.fillStyle = '#FFFFFF';
  			bitmapCtx.fillRect(0, 0, vidWidth, vidHeight);
		};

		const encoder = new GIFEncoder(vidWidth, vidHeight);
		encoder.setRepeat(0);
		encoder.setDelay(500);

		const step = async() => {
			background();
			await new Promise(resolve => {
			  	bitmapCtx.drawImage(inputVideo, 0, 0, vidWidth, vidHeight);
			  	frameB64Str = bitmapCanvas.toDataURL();
				encoder.addFrame(bitmapCtx);
			  	resolve();
			});
			window.requestAnimationFrame(step);
		};
		inputVideo.addEventListener('play', () => {
			encoder.start();
			step();
			window.requestAnimationFrame(step);
		});

		inputVideo.addEventListener('ended', () => {
			encoder.finish();
		});

		var newFileType='image/gif';
		var readableStream=encoder.stream();
		var binary_gif=readableStream.getData();
		var gifB64Str= 'data:'+ newFileType +';base64,'+ encode64(binary_gif);

		gifFrames({ url: gifB64Str, frames: "all", outputType: "canvas", cumulative: true }).then(function(frameData) {
            let gifFrameArray = new Array()
            frameData.forEach(function(frame) {
                var image = new Image()
                image.width = frame.frameInfo.width
                image.height = frame.frameInfo.height
                image.src = frame.getImage().toDataURL()
                gifFrameArray.push(image)
            })

            originalImageSize.width = frameData[0].frameInfo.width
            originalImageSize.height = frameData[0].frameInfo.height
            console.log(gifFrameArray)
            convert(gifFrameArray)
		})
	} */ else {
		let imgArray = new Array()
		async function pushFrames() {
			for(let i = 0; i < this.files.length; i++) {
				i = i % this.files.length
				var image = new Image()
				image.width = this.files[i].width
				image.height = this.files[i].height
				image.id = this.files[i].name
				image.src = window.URL.createObjectURL(this.files[i])
				imgArray.push(image)
				imgArray.sort((a, b) => a.id - b.id)
			}
		}
		await pushFrames().then(() => {
			originalImageSize.width = img.width
			originalImageSize.height = img.height
			console.log(imgArray)
			convert(imgArray)
		})
	}
})

document.getElementById("url-button").addEventListener("click", async function() {
	if(url.value.endsWith(".gif")) {
		let gifFrameArray = new Array()
		const response = await axios.get(url.value,  { responseType: 'arraybuffer' })
		const buffer = Buffer.from(response.data, "utf-8")
		await gifFrames({ url: `data:image/gif;base64,${buffer.toString("base64")}`, frames: "all", outputType: "canvas", cumulative: true }).then(function(frameData) {
			frameData.forEach(function(frame) {
				var image = new Image()
				image.width = frame.frameInfo.width
				image.height = frame.frameInfo.height
				image.src = frame.getImage().toDataURL()
				gifFrameArray.push(image)
			})
		})

		originalImageSize.width = gifFrameArray[0].width
    	originalImageSize.height = gifFrameArray[0].height
        console.log(gifFrameArray)
        convert(gifFrameArray)
	} else {
		alert("Please enter a valid URL")
	}
})

form.addEventListener("submit", function convertImage(event) {
	event.preventDefault()
	const imageDOM = document.querySelector("img")
	if (originalImageSize.width === 0 && originalImageSize.height === 0) {
		originalImageSize.width = imageDOM.width
		originalImageSize.height = imageDOM.height
	}
	let imgArray = new Array()
	for(let i = 0; i < this.files.length; i++) {
		i = i % this.files.length
		var image = new Image()
		image.width = this.files[i].width
		image.height = this.files[i].height
		image.id = this.files[i].name
		image.src = window.URL.createObjectURL(this.files[i])
		imgArray.push(image)
		imgArray.sort((a, b) => a.id - b.id)
	}
	console.log(imgArray)
	convert(imgArray)
	// resetImageSize(imageDOM)
})

function convertFrame(img) {
	const arcadeColors = [
		"#00000000", // Transparent
		"#ffffff",
		"#ff2121",
		"#ff93c4",
		"#ff8135",
		"#fff609",
		"#249ca3",
		"#78dc52",
		"#003fad",
		"#87f2ff",
		"#8e2ec4",
		"#a4839f",
		"#5c406c",
		"#e5cdc4",
		"#91463d",
		"#000000",
	].map(function convertFromHexToRGB(color, index) {
		const r = parseInt(color[1] + color[2], 16) // parseInt("a", 16) === 10
		const g = parseInt(color[3] + color[4], 16)
		const b = parseInt(color[5] + color[6], 16)

		return {
			color: { r, g, b },
			index: (index).toString(16) // (10).toString(16) === "a"
		}
	})

	/**
	 * MakeCode Arcade is 160x120
	 * 
	* 	Full width:
	 * 		factor = 160 / img.width
	 * 	Full height:
	 * 		factor = 120 / img.height
	 * 	Custom width:
	 * 		factor = n / img.width
	 * 	Custom height:
	 * 		factor = n / img.height
	 * 		 
	 * 	w *= factor
	 * 	h *= factor
	 */
	function setSpriteDimensions(type) {
		let imageWidth = originalImageSize.width
		let imageHeight = originalImageSize.height
		let factor = 1
		if (type === "custom") {
			let customWidth = document.querySelector(".custom#width").value
			let customHeight = document.querySelector(".custom#height").value

			if (customWidth && !customHeight) {
				const factor = customWidth / originalImageSize.width
				imageWidth = customWidth
				imageHeight *= factor
			} else if (!customWidth && customHeight) {
				const factor = customHeight / originalImageSize.height
				imageWidth *= factor
				imageHeight = customHeight
			} else {
				imageWidth = customWidth
				imageHeight = customHeight
			}
		} else if (type === "scale") {
			const factor = document.querySelector("input#factor").value
			imageWidth *= factor
			imageHeight *= factor
		} else if (type === "full-width") {
			const factor = 160 / imageWidth
			imageWidth *= factor
			imageHeight *= factor
		} else if (type === "full-height") {
			const factor = 120 / imageHeight
			imageWidth *= factor
			imageHeight *= factor
		}
		img.width = imageWidth
		img.height = imageHeight
	}

	setSpriteDimensions(mode) // Mode is set when radio buttons are clicked. Default is full-width.

	// Get the image's pixels and draw them onto a canvas element
	// This way, we can loop through the pixels
	canvas.width = img.width
	canvas.height = img.height
	const c = canvas.getContext("2d")
	c.drawImage(img, 0, 0, canvas.width, canvas.height)

	let pixelIndex = 0
	let makeCodeString = {}
	const data = c.getImageData(0, 0, canvas.width, canvas.height).data

	// Canvas pixel values are stored as rgba: [r, g, b, a, r, g, b, a, ...]
	for (let i = 0; i < data.length; i += 4) {
		// This is how you get x and y coordinates from one variable
		const x = pixelIndex % canvas.width
		const y = Math.floor(pixelIndex / canvas.width)

		const r = data[i + 0]
		const g = data[i + 1]
		const b = data[i + 2]
		const a = data[i + 3]

		/*
		Now we have the rgba values for one pixel from the original image.
		MakeCode colors are represented as index values from 0-15 (or really, 0-f).
		We loop through the 16 color palette and pick the one that has
		the closest r, g, and b values to the pixel we're checking.
		*/
		const nearest = arcadeColors.sort((prev, curr) => {
			const rDifference = Math.abs(prev.color.r - r) - Math.abs(curr.color.r - r)
			const gDifference = Math.abs(prev.color.g - g) - Math.abs(curr.color.g - g)
			const bDifference = Math.abs(prev.color.b - b) - Math.abs(curr.color.b - b)

			return rDifference + gDifference + bDifference
		})[0]

		/*
		makeCodeString is a piece of working code that can be directly
		pasted into MakeCode's JavaScript window.
		*/
		if (makeCodeString[`row-${y}`] === undefined) {
			makeCodeString[`row-${y}`] = ""
		} else {
			if (nearest.index == 0) {
				// 0 is transparent, f is black.
				makeCodeString[`row-${y}`] += "f"
			} else {
				makeCodeString[`row-${y}`] += nearest.index
			}
		}

		pixelIndex++
	}

	let frameJavaScript = `img\``
	for (const row in makeCodeString) {
		frameJavaScript += makeCodeString[row] + "\n"
	}
	frameJavaScript += `\``
	return frameJavaScript
}
/**
 * @param {string[]} img
 */
function convert(img) {
	let arrayCode = ``
	for (let i = 0; i < img.length; i++) {
		i = i % img.length
		arrayCode += convertFrame(img[i]) + `, `
	}
	copyButton.innerText = "Copy code" // Reset text if another image is uploaded
	let backgroundCode = `let index = 0\n`
	backgroundCode += `let videoFrames = [${arrayCode}]\n`
	backgroundCode += `forever(() => {\n`
	backgroundCode += `    if (index == videoFrames.length - 1) {\n`
	backgroundCode += `        index = 0\n`
	backgroundCode += `    } else {\n`
	backgroundCode += `        index++\n`
	backgroundCode += `    }\n`
	backgroundCode += `    scene.setBackgroundImage(videoFrames[index])\n`
	backgroundCode += `    pause(100)\n`
	backgroundCode += `})`
    console.log("Code generated successfully for " + img.length + " frames.")

	// Copy text when user clicks button
	// Sure, they can copy it themselves, but it's good to do nice things sometimes.
	textarea.textContent = backgroundCode
	copyButton.removeAttribute("disabled")

	copyButton.addEventListener("click", function addCodeToClipboard() {
		textarea.select()
		if (!navigator.clipboard) {
			document.execCommand("copy")
			console.log("Copied to clipboard using the old method.")
		} else {
			navigator.clipboard.writeText(textarea.textContent).then(
				function(){
					console.log("Copied to clipboard!")
					copyButton.innerText = "Code copied to clipboard!"
				})
			  .catch(
				 function(e) {
					console.log("Could not copy to clipboard!")
					console.error(e)
					copyButton.innerText = "Could not copy to clipboard!"
			  });
		}
		resetImageSize(img)
	})
}

function resetImageSize(img) {
	img.width = originalImageSize.width
	img.height = originalImageSize.height
}