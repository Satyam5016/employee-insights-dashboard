import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import SignatureCanvas from '../components/SignatureCanvas';
import { mergeImageSignature } from '../utils/mergeImageSignature';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [signatureCanvas, setSignatureCanvas] = useState(null);
  const [merging, setMerging] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setEmployee({ id, name: `Employee ${id}`, designation: 'Software Engineer', city: 'Mumbai' });
  }, [id]);

  const handleCapture = (imageData) => {
    setPhoto(imageData);
  };

  const handleSignatureSave = (canvas) => {
    setSignatureCanvas(canvas);
  };

  const handleComplete = async () => {
    if (!photo || !signatureCanvas) return;

    try {
      setMerging(true);
      const mergedImage = await mergeImageSignature(photo, signatureCanvas);
      
      localStorage.setItem('verification_image', mergedImage);
      
      navigate('/analytics');
    } catch (err) {
      console.error("Merge failed:", err);
      alert("Failed to merge image and signature. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  if (!employee) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verification</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verifying details for {employee.name} (#{employee.id})</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`h-3 w-3 rounded-full ${step === 1 ? 'bg-indigo-600 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Step {step} of 2</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Capture Profile Photo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please look into the camera and click the capture button.</p>
              </div>
              <CameraCapture onCapture={handleCapture} />
              <div className="flex justify-end pt-4">
                <button
                  disabled={!photo}
                  onClick={() => setStep(2)}
                  className={`px-8 py-3 rounded-xl font-bold transition-all ${
                    photo 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">E-Signature</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please sign in the box below to authorize verification.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={photo} alt="Identity" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-center text-gray-500 italic">Captured Profile Photo</p>
                </div>
                <SignatureCanvas onSave={handleSignatureSave} />
              </div>

              <div className="flex justify-between pt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Back to Camera
                </button>
                <button
                  disabled={!signatureCanvas || merging}
                  onClick={handleComplete}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    signatureCanvas && !merging
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {merging ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Complete Verification</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
