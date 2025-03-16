// src/pages/ai/FaceVerificationPage.jsx
import React, { useState, useRef, useContext } from 'react';
import { Camera, Upload, RefreshCw, Save, CheckCircle, AlertCircle, X, User } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import NotificationContext from '../../contexts/NotificationContext';
import AIService from '../../api/ai';

const FaceVerificationPage = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState('');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { success, error } = useContext(NotificationContext);

  // راه‌اندازی دوربین
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // استفاده از دوربین جلو
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      error('خطا در دسترسی به دوربین');
    }
  };

  // خاموش کردن دوربین
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // گرفتن عکس از دوربین
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // تنظیم اندازه canvas برابر با ویدیو
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // رسم تصویر فعلی ویدیو روی canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // تبدیل canvas به فایل تصویر
      canvas.toBlob(blob => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setImage(file);
        setImagePreview(URL.createObjectURL(blob));
      }, 'image/jpeg', 0.95);

      stopCamera();
    }
  };

  // انتخاب فایل تصویر
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // باز کردن دیالوگ انتخاب فایل
  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  // پاکسازی تصویر انتخاب شده
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  };

  // پردازش تصویر برای تشخیص چهره
  const processImage = async () => {
    if (!image) {
      error('لطفاً ابتدا یک تصویر انتخاب کنید');
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const response = await AIService.detectFace(image);
      setResult(response.data);
      success('چهره با موفقیت تشخیص داده شد');
    } catch (err) {
      console.error('Error in face detection:', err);
      error(err.response?.data?.detail || 'خطا در تشخیص چهره');
    } finally {
      setProcessing(false);
    }
  };

  // ذخیره نتیجه تشخیص
  const saveDetection = async () => {
    if (!result || !result.success) {
      error('نتیجه تشخیص معتبر نیست');
      return;
    }

    if (!userId) {
      error('لطفاً شناسه کاربر را وارد کنید');
      return;
    }

    setProcessing(true);

    try {
      const response = await AIService.saveFaceDetection({
        image: image,
        userId: userId
      });

      success('نتیجه تشخیص با موفقیت ذخیره شد');
    } catch (err) {
      console.error('Error saving detection:', err);
      error(err.response?.data?.detail || 'خطا در ذخیره نتیجه تشخیص');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="تشخیص چهره"
        subtitle="با استفاده از هوش مصنوعی، چهره افراد را به صورت خودکار تشخیص دهید"
        icon={<User className="h-8 w-8 text-purple-600" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* بخش تصویر ورودی */}
        <Card title="تصویر ورودی">
          <div className="flex flex-col items-center">
            {cameraActive ? (
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                  style={{ maxHeight: '400px' }}
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button
                    onClick={captureImage}
                    variant="primary"
                    className="rounded-full px-4 py-4"
                    icon={<Camera size={20} />}
                  >
                    عکس گرفتن
                  </Button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full h-auto rounded-lg max-h-96 object-contain"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
                <p className="text-gray-500 mb-4">تصویری انتخاب نشده است</p>
                <div className="flex space-x-4">
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    icon={<Camera size={20} />}
                  >
                    استفاده از دوربین
                  </Button>
                  <Button
                    onClick={openFileDialog}
                    variant="outline"
                    icon={<Upload size={20} />}
                  >
                    آپلود تصویر
                  </Button>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />

            {imagePreview && !processing && !result && (
              <Button
                onClick={processImage}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                icon={<RefreshCw size={20} />}
                fullWidth
              >
                تشخیص چهره
              </Button>
            )}

            {processing && (
              <div className="mt-4 w-full">
                <Loader text="در حال پردازش تصویر..." size="md" />
              </div>
            )}
          </div>
        </Card>

        {/* بخش نتیجه تشخیص */}
        <Card title="نتیجه تشخیص">
          {result ? (
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full mr-2 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className={`font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? 'تشخیص موفق' : 'تشخیص ناموفق'}
                  </h3>
                  {!result.success && <p className="text-sm text-gray-500">{result.detail || result.message}</p>}
                </div>
              </div>

              {result.success && (
                <>
                  <div className="mb-6">
                    <img
                      src={result.output_image}
                      alt="Processed"
                      className="w-full h-auto rounded-lg max-h-64 object-contain border"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-lg font-bold text-center mb-2">تعداد چهره‌های تشخیص داده شده: {result.face_count}</h3>
                    </div>

                    {result.faces && result.faces.length > 0 && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">اطلاعات چهره‌ها:</h4>
                        <div className="space-y-2">
                          {result.faces.map((face, index) => (
                            <div key={index} className="bg-white p-2 rounded">
                              <div className="text-sm">چهره {index + 1}:</div>
                              <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                                <div>اطمینان: {Math.round(face.confidence * 100)}%</div>
                                <div>موقعیت: [{face.bbox.join(', ')}]</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>زمان پردازش:</span>
                        <span>{result.processing_time.toFixed(2)} ثانیه</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                        شناسه کاربر برای ذخیره‌سازی:
                      </label>
                      <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="شناسه کاربر را وارد کنید"
                      />
                    </div>

                    <Button
                      onClick={saveDetection}
                      className="mt-4"
                      icon={<Save size={20} />}
                      fullWidth
                      disabled={!userId}
                    >
                      ذخیره نتیجه
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <p className="text-gray-500 mb-2">منتظر تشخیص چهره...</p>
              <p className="text-sm text-gray-400">لطفاً تصویری شامل چهره انتخاب کنید و دکمه تشخیص را بفشارید</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FaceVerificationPage;
