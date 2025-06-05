// import React, { useRef, useState } from 'react';
// import Webcam from 'react-webcam';
// import axios from 'axios';

// const videoConstraints = {
//   width: 400,
//   height: 300,
//   facingMode: 'user',
// };

// const EmotionDetector = () => {
//   const webcamRef = useRef(null);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [responseJson, setResponseJson] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const capture = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setCapturedImage(imageSrc);
//     setResponseJson(null);
//     setError('');
//   };

//   const handleSubmit = async () => {
//     if (!capturedImage) {
//       setError('Please capture an image first.');
//       return;
//     }

//     const blob = await (await fetch(capturedImage)).blob();
//     const formData = new FormData();
//     formData.append('image', blob, 'captured_image.jpg');

//     try {
//       setLoading(true);
//       const response = await axios.post('http://127.0.0.1:5000/emotion-by-face', formData);
//       setResponseJson(response.data.emotion);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', padding: '20px' }}>
//       <h2>Detect Emotion from Webcam</h2>

//       <Webcam
//         audio={false}
//         height={300}
//         ref={webcamRef}
//         screenshotFormat="image/jpeg"
//         width={400}
//         videoConstraints={videoConstraints}
//       />

//       <br />
//       <button onClick={capture}>📸 Capture Photo</button>
//       <button onClick={handleSubmit} disabled={loading} style={{ marginLeft: '10px' }}>
//         {loading ? 'Detecting...' : 'Detect Emotion'}
//       </button>

//       {capturedImage && (
//         <div style={{ marginTop: '10px' }}>
//           <h4>Captured Image:</h4>
//           <img src={capturedImage} alt="Captured" style={{ width: '200px' }} />
//         </div>
//       )}

//       <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
//         {responseJson && (
//           <>
//             <h3>Dominant Emotion: {responseJson[0]?.dominant_emotion}</h3>
//             <h4>Full Response:</h4>
//             <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
//               {JSON.stringify(responseJson, null, 2)}
//             </pre>
//           </>
//         )}
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//       </div>
//     </div>
//   );
// };

// export default EmotionDetector;
