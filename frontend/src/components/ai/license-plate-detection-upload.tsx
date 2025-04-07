"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, ImageIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LicensePlateDetection } from "@/types/ai";

interface LicensePlateDetectionUploadProps {
  onUpload: (file: File, sessionId?: number) => Promise<LicensePlateDetection>;
  parkingSessions?: { id: number; vehicle_plate: string }[];
  mode?: "entry" | "exit" | "detect";
}

export function LicensePlateDetectionUpload({
  onUpload,
  parkingSessions,
  mode = "detect"
}: LicensePlateDetectionUploadProps) {
  const [tab, setTab] = useState<string>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // برای آپلود تصویر
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // نمایش پیش‌نمایش تصویر
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // برای گرفتن عکس از دوربین
  const handleCameraStart = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا در دسترسی به دوربین",
        description: "لطفاً مجوز دسترسی به دوربین را بررسی کنید.",
      });
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // تنظیم اندازه canvas با اندازه ویدیو
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // رسم فریم فعلی ویدیو در canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // تبدیل canvas به فایل
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            setFile(capturedFile);
            setPreview(canvas.toDataURL('image/jpeg'));
          }
        }, 'image/jpeg');

        // توقف دوربین
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      videoRef.current.srcObject = null;
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "لطفاً ابتدا یک تصویر انتخاب کنید.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onUpload(file, sessionId ? parseInt(sessionId) : undefined);
      toast({
        title: "آپلود موفقیت‌آمیز",
        description: "تصویر با موفقیت آپلود شد و در حال پردازش است.",
      });

      // پاک کردن فرم
      setFile(null);
      setPreview(null);
      setSessionId("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا در آپلود",
        description: "مشکلی در آپلود تصویر رخ داده است.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // هنگام تغییر تب
  const handleTabChange = (value: string) => {
    setTab(value);
    if (value === "camera") {
      handleCameraStart();
    } else {
      stopCamera();
    }
  };

  // هنگام خارج شدن از کامپوننت
  const cleanUp = () => {
    stopCamera();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  // تعیین عنوان بر اساس حالت
  const getTitle = () => {
    switch(mode) {
      case "entry": return "ثبت ورود خودرو";
      case "exit": return "ثبت خروج خودرو";
      default: return "تشخیص پلاک خودرو";
    }
  };

  // تعیین توضیحات بر اساس حالت
  const getDescription = () => {
    switch(mode) {
      case "entry": return "تصویر پلاک خودرو را برای ثبت ورود آپلود کنید";
      case "exit": return "تصویر پلاک خودرو را برای ثبت خروج آپلود کنید";
      default: return "یک تصویر برای تشخیص پلاک خودرو آپلود کنید";
    }
  };

  // تعیین متن دکمه بر اساس حالت
  const getButtonText = () => {
    switch(mode) {
      case "entry": return "ثبت ورود خودرو";
      case "exit": return "ثبت خروج خودرو";
      default: return "آپلود و تشخیص";
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">آپلود تصویر</TabsTrigger>
            <TabsTrigger value="camera">دوربین</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="license-plate-picture">تصویر پلاک</Label>
              <Input
                id="license-plate-picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="camera" className="space-y-4">
            <div className="relative overflow-hidden rounded-lg border">
              <video
                ref={videoRef}
                autoPlay
                className="w-full h-auto aspect-video"
              />
              <Button
                type="button"
                className="absolute bottom-2 right-2"
                onClick={handleCapture}
              >
                <Camera className="ml-2 h-4 w-4" /> گرفتن عکس
              </Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </TabsContent>
        </Tabs>

        {preview && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        {mode === "detect" && parkingSessions && (
          <div className="space-y-2">
            <Label htmlFor="session-select">جلسه پارک (اختیاری)</Label>
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger id="session-select">
                <SelectValue placeholder="انتخاب جلسه پارک" />
              </SelectTrigger>
              <SelectContent>
                {parkingSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.vehicle_plate} - جلسه {session.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="ml-2 h-4 w-4 animate-spin" /> در حال آپلود...
            </>
          ) : (
            <>
              <Upload className="ml-2 h-4 w-4" /> {getButtonText()}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}