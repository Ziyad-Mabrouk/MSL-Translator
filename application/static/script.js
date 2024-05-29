const translateButton = document.querySelector('.text-form button[type="submit"]');
const editButton = document.querySelector('.text-form button.edit');
const textArea = document.querySelector('.text-form textarea');
const videoElement = document.querySelector('.video-box-1 video');
const switchButton = document.getElementById('switch');
const textToMSL = document.querySelector('.text-to-MSL');
const MSLToText = document.querySelector('.MSL-to-text');
const title = document.querySelector('.sub-header-title');
const titel1 = document.querySelector('.first');
const titel2 = document.querySelector('.second');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const predictionElement = document.getElementById('prediction');
const startStopButton = document.getElementById('startStopButton');
const resetButton = document.getElementById('resetButton');

let direction = 0;

switchButton.addEventListener('click', () => {
  if (direction === 0) {
    direction = 1;
    title.innerHTML = 'Translate your MSL to Text';
    titel1.innerHTML = 'MSL';
    titel2.innerHTML = 'Text';
    textToMSL.classList.add('hidden');
    MSLToText.classList.remove('hidden');

  } else { 
    direction = 0;
    title.innerHTML = 'Translate your Text to MSL';
    titel1.innerHTML = 'Text';
    titel2.innerHTML = 'MSL';
    textToMSL.classList.remove('hidden');
    MSLToText.classList.add('hidden');
  }
});

translateButton.addEventListener('click', (event) => {
  event.preventDefault();
  const message = textArea.value;
  translateButton.disabled = true; // Disable the translate button
  textArea.disabled = true; // Disable the textarea
  fetch('/process_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: message,
      language: 'arabic'
    })
  })
  .then(response => response.json())
  .then(result => {
    const videoUrl = result["filepath"];
    sendVideo(videoUrl); // Send the video to the video element
    editButton.disabled = false; // Enable the edit button
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

editButton.addEventListener('click', () => {
  textArea.disabled = false; // Enable the textarea
  translateButton.disabled = false; // Enable the translate button
});

function sendVideo(videoUrl) {
  const cacheBuster = Math.random(); // Generate a random number as a cache-busting query parameter
  const updatedUrl = `${videoUrl}?cb=${cacheBuster}`; // Add cache-buster as a query parameter
  videoElement.src = updatedUrl; // Update the video src attribute
  // Attach an event handler for video loading
  videoElement.addEventListener("canplaythrough", function() {
    videoElement.play();
  });
}

let phrase = [];
let capturing = false;
let intervalId;
let stream = null;

startStopButton.addEventListener('click', toggleCapturing);

function startCapturing() {
  intervalId = setInterval(captureAndPredict, 1000); // Capture an image every 1000 ms (1 second)
}

function stopCapturing() {
  clearInterval(intervalId);
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }
}

function toggleCapturing() {
  if (capturing) {
    stopCapturing();
    startStopButton.textContent = 'Start';
  } else {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(localStream => {
        stream = localStream;
        video.srcObject = stream;  // Assign the video stream to the <video> element
        video.play();              // Start playing the video stream
        startCapturing();
        startStopButton.textContent = 'Stop';
      })
      .catch(err => {
        console.error("Error accessing webcam: " + err);  // Error handling
      });
  }
  capturing = !capturing;
}

// Function to capture an image and get a prediction
function captureAndPredict() {
  // Capture the current image from the video and draw it on the <canvas>
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the image from the <canvas> to a base64 data URL
  const dataURL = canvas.toDataURL('image/jpeg');
  const base64Image = dataURL.split(',')[1];

  // Send the base64 image to the Flask server for a prediction
  fetch('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: base64Image })
  })
  .then(response => response.json())
  .then(data => {
    // Display the received prediction in the <div> with the ID "prediction"
    const action = data.action;
    if (action !== phrase[phrase.length - 1]) {
      phrase.push(action);
    }
    displayPrediction();
  })
  .catch(err => {
    console.error("Error predicting action: " + err);  // Error handling
  });
}

// Function to display the received prediction
function displayPrediction() {
  predictionElement.innerText = `${phrase.join(' ')}`;
}

resetButton.addEventListener('click', () => {
  phrase = [];
  displayPrediction();
});