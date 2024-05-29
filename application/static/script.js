const translateButton = document.querySelector('.text-form button[type="submit"]');
const editButton = document.querySelector('.text-form button.edit');
const textArea = document.querySelector('.text-form textarea');
const videoElement = document.querySelector('.video-box-1 video');

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