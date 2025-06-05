import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const videoConstraints = {
  width: 400,
  height: 300,
  facingMode: "user",
};

const SongsByEmotion = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [lastImageSource, setLastImageSource] = useState("");
  const [selectedOption, setSelectedOption] = useState("capture");
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState("");
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [delayMessage, setDelayMessage] = useState("");
  const delayTimeoutRef = useRef(null);

  useEffect(() => {
    document.title = "VibeTunes | Emotion-Based Songs Recommendation";
  }, []);

  // const googleAPIKey = import.meta.env.VITE_GOOGLE_API_KEY

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setUploadedImage(null);
    setLastImageSource("capture");
    setGenre("");
    setVideos([]);
    setError("");
  };

  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setCapturedImage(null);
      setLastImageSource("upload");
      setGenre("");
      setVideos([]);
      setError("");
    }
  };

  // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async () => {
    const formData = new FormData();

    try {
      if (lastImageSource === "upload" && uploadedImage) {
        formData.append("image", uploadedImage, uploadedImage.name);
      } else if (lastImageSource === "capture" && capturedImage) {
        const blob = await (await fetch(capturedImage)).blob();
        formData.append("image", blob, "captured_image.jpg");
      } else {
        setError("Please capture or upload an image first.");
        return;
      }

      setLoading(true);
      setError("");
      setDelayMessage("");

      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }

      const delayTimeout = setTimeout(() => {
        setDelayMessage("⏳ The process is taking longer than usual. Sometimes, when server load is high, it can take up to 2-3 minutes. Please be patient.");
      }, 15000);

      // await delay(30000);

      const response = await axios.post("/genre-by-emotion", formData);

      clearTimeout(delayTimeout);
      setDelayMessage("");

      const { genre, videos } = response.data;

      setGenre(genre);
      setVideos(videos);
      setShowResults(true);

    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.error;

      if (backendMessage && backendMessage.includes("Face could not be detected")) {
        setError("No face detected. Please upload or capture a clear photo of your face.");
      } else {
        setError(
          backendMessage ||
          err.message ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      clearTimeout(delayTimeoutRef.current);
      setLoading(false);
    }
  };

  const handleSubmit2 = async () => {
    const formData = new FormData();

    try {
      if (lastImageSource === "upload" && uploadedImage) {
        formData.append("image", uploadedImage, uploadedImage.name);
      } else if (lastImageSource === "capture" && capturedImage) {
        const blob = await (await fetch(capturedImage)).blob();
        formData.append("image", blob, "captured_image.jpg");
      } else {
        setError("Please capture or upload an image first.");
        return;
      }

      setLoading(true);
      setError("");

      const flaskResponse = await axios.post("/genre-by-emotion", formData);
      const detectedGenre = flaskResponse.data.genre;
      setGenre(detectedGenre);
      // const ytResponse = await axios.get(
      //   `https://youtube.googleapis.com/youtube/v3/search?key=${googleAPIKey}&part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
      //     detectedGenre + " genre official bollywood songs"
      //   )}`
      // );
      const ytResponse = await axios.get(`/youtube-search?genre=${encodeURIComponent(detectedGenre)}`);

      setVideos(ytResponse.data.items);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.error;

      if (backendMessage && backendMessage.includes("Face could not be detected")) {
        setError("No face detected. Please upload or capture a clear photo of your face.");
      } else {
        setError(
          backendMessage ||
          err.message ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setLastImageSource("");
    setSelectedOption("capture");
    setGenre("");
    setVideos([]);
    setError("");
    setShowResults(false);
  };

  return (
    <div className="container my-2">
      <h2 className="text-center mb-1">
        🎵 Emotion-Based Songs Recommendation
      </h2>

      {!showResults && (
        <>
          <p className="lead font-monospace text-center mb-0"> Capture or upload your photo and let AI find your emotion and songs! </p>

          <div className="container">
            <div className="row justify-content-center mb-1">
              <div className="col-auto d-flex align-items-center">
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="inputOption" id="captureOption" value="capture" checked={selectedOption === "capture"} onChange={() => setSelectedOption("capture")} />
                  <label className="form-check-label" htmlFor="captureOption"> 📷 Capture Pic </label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="inputOption" id="uploadOption" value="upload" checked={selectedOption === "upload"} onChange={() => setSelectedOption("upload")} />
                  <label className="form-check-label" htmlFor="uploadOption"> 🖼️ Upload Image </label>
                </div>
              </div>
            </div>

            <div className="row justify-content-center g-4">
              {selectedOption === "capture" && (
                <div className="col-md-6">
                  <div className="card shadow border-0 my-2">
                    <div className="card-body text-center p-2">
                      <h5 className="card-title">📸 Capture Pic</h5>
                      <Webcam audio={false} height={300} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" videoConstraints={videoConstraints} />
                      <button onClick={capture} className="btn btn-outline-primary my-1 w-100"> Capture Photo </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedOption === "upload" && (
                <div className="col-md-6">
                  <div className="card shadow border-0 my-2">
                    <div className="card-body text-center p-2">
                      <h5 className="card-title">🖼️ Upload an Image</h5>
                      <input type="file" accept="image/*" onChange={handleUploadChange} className="form-control mt-4" />
                    </div>
                  </div>
                </div>
              )}

              {(capturedImage || uploadedImage) && (
                <div className="col-md-6">
                  <div className="card shadow border-0 my-2">
                    <div className="card-body text-center p-2">
                      <h5 className="card-title">👁️ Image Preview</h5>
                      <img src={capturedImage || (uploadedImage && URL.createObjectURL(uploadedImage))} alt="Preview" className="img-fluid rounded" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-2">
              {loading && delayMessage && (
                <div className="alert alert-warning" role="alert">
                  {delayMessage}
                </div>
              )}
              <button className="btn btn-success btn-lg px-5 py-2" onClick={handleSubmit} disabled={loading}>
                {loading ? "🔍 Detecting..." : "🎶 Detect Emotion & Get Songs"}
              </button>
            </div>

            {error && (
              <div className="alert alert-danger mt-4 text-center" role="alert">
                {typeof error === "string" ? error : error.message || "Unexpected error"}
              </div>
            )}
          </div>
        </>
      )}

      {showResults && (
        <>
          {genre && (
            <div className="text-center">
              <h2 className="text-info"> 🎧 Emotion Detected: <span className="fw-bold">{genre}</span></h2>
              <p className="lead font-monospace"> Here are some songs that match your current vibe! </p>
            </div>
          )}

          {videos.length > 0 && (
            <div className="container">
              <div className="row g-4">
                {videos.map((video) => (
                  <div key={video.id.videoId} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow border-0">
                      <iframe className="card-img-top" width="100%" height="225" src={`https://www.youtube.com/embed/${video.id.videoId}`} title={video.snippet.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{video.snippet.title}</h5>
                        <p className="card-text text-muted small"> {video.snippet.channelTitle} </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-5">
            <button className="btn btn-info text-light fw-bold btn-lg px-4 py-2" onClick={handleTryAgain}>
              🔁 Try Again
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SongsByEmotion;
