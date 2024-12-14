const startButton = document.getElementById('startButton');
const video = document.getElementById('video');
const aiResponses = document.getElementById('aiResponses');

// **Replace with your actual Gemini API key**
const apiKey = 'AIzaSyC8RyA5eAZZnGzn_tFC4yIsfkPtl6FKgZk'; 

function captureVideoFrame() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg'); // Return the frame as a JPEG image
}

startButton.addEventListener('click', async () => {
  try {
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Configure Gemini API
    const client = new google.generativeai.Client({ apiKey });

    // Start a streaming conversation
    const response = await client.models.start_stream(
      'gemini-2.0-flash-exp', 
      { 
        contents: 'Start a live skin consultation.' 
      }
    );

    // Send video frames to Gemini
    setInterval(async () => {
      const videoFrame = captureVideoFrame();
      await client.models.send_message(response.stream_id, {
        message: new google.generativeai.BidiGenerateContentRealtimeInput({
          video: videoFrame 
        })
      });
    }, 500); // Send a frame every 500 milliseconds (adjust as needed)

    // Receive and display responses
    for await (const message of response) {
      if (message instanceof google.generativeai.BidiGenerateContentServerContent) {
        aiResponses.innerHTML += `<p>${message.text}</p>`; 
      }
    }

  } catch (err) {
    console.error("Error:", err);
    alert('An error occurred. Please check the console for details.');
  }
});