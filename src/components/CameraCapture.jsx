import React, { useRef, useState, useCallback, useEffect } from 'react';

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      onCapture(imageData);
      stopCamera();
    }
  };

  const retake = () => {
    setCapturedImage(null);
    onCapture(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center bg-black/80">
                <p className="text-white text-sm">{error}</p>
              </div>
            )}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button 
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Capture Photo"
              />
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured Profile" className="w-full h-full object-cover" />
        )}
      </div>
      
      {capturedImage && (
        <button 
          onClick={retake}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Retake Photo
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
