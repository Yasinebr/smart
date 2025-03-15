import cv2
import numpy as np
import time
import os
import logging
from hezar.models import Model
from pathlib import Path
from django.conf import settings
from typing import Dict, Tuple, List, Union, Optional

# تنظیم لاگر
logger = logging.getLogger(__name__)

# حد آستانه تشخیص
DETECTION_THRESHOLD = 0.5
RECOGNITION_THRESHOLD = 0.7


class LicensePlateProcessor:
    """
    پردازشگر تشخیص و استخراج متن پلاک با استفاده از YOLOv5 و CRNN
    """

    def __init__(self):
        """
        بارگذاری مدل‌ها و آماده‌سازی پردازشگر
        """
        self.detection_model = None
        self.recognition_model = None
        self.load_models()

    def load_models(self) -> None:
        """
        بارگذاری مدل‌های تشخیص و استخراج متن پلاک
        """
        try:
            # بارگذاری مدل YOLOv5 برای تشخیص پلاک
            import torch
            self.detection_model = torch.hub.load('ultralytics/yolov5', 'models/last.pt', path=DETECTION_MODEL_PATH)
            self.detection_model.conf = DETECTION_THRESHOLD

            # تنظیم دستگاه پردازش
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
            self.detection_model.to(device)

            logger.info(f"License plate detection model loaded successfully. Using device: {device}")

            # بارگذاری مدل CRNN برای استخراج متن پلاک
            from hezarai.models import Model
            self.recognition_model = Model.load("hezarai/crnn-fa-64x256-license-plate-recognition")

            logger.info("License plate recognition model loaded successfully.")

        except Exception as e:
            logger.error(f"Failed to load license plate models: {str(e)}")
            self.detection_model = None
            self.recognition_model = None
            raise

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        پیش‌پردازش تصویر برای استفاده در مدل تشخیص

        Args:
            image_path: مسیر فایل تصویر

        Returns:
            تصویر پیش‌پردازش شده
        """
        try:
            # خواندن تصویر و تغییر اندازه
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")

            # تبدیل RGB به BGR برای استفاده در مدل
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            return img

        except Exception as e:
            logger.error(f"Error in preprocess_image: {str(e)}")
            raise

    def detect_license_plate(self, image: np.ndarray) -> List[Dict]:
        """
        تشخیص پلاک در تصویر با استفاده از YOLOv5

        Args:
            image: تصویر ورودی

        Returns:
            لیستی از پلاک‌های تشخیص داده شده با مختصات و احتمال
        """
        if self.detection_model is None:
            raise ValueError("Detection model is not loaded")

        try:
            # انجام تشخیص با YOLOv5
            results = self.detection_model(image)

            # استخراج نتایج
            predictions = results.pandas().xyxy[0].to_dict('records')

            # فیلتر کردن نتایج بر اساس کلاس و احتمال
            license_plates = []
            for pred in predictions:
                if pred['confidence'] >= DETECTION_THRESHOLD:
                    license_plates.append({
                        'bbox': [
                            int(pred['xmin']),
                            int(pred['ymin']),
                            int(pred['xmax']),
                            int(pred['ymax'])
                        ],
                        'confidence': float(pred['confidence'])
                    })

            return license_plates

        except Exception as e:
            logger.error(f"Error in detect_license_plate: {str(e)}")
            return []

    def recognize_license_plate(self, image: np.ndarray, bbox: List[int]) -> Tuple[str, float]:
        """
        استخراج متن پلاک با استفاده از CRNN

        Args:
            image: تصویر ورودی
            bbox: مختصات پلاک [xmin, ymin, xmax, ymax]

        Returns:
            متن پلاک و میزان اطمینان
        """
        if self.recognition_model is None:
            raise ValueError("Recognition model is not loaded")

        try:
            # جدا کردن بخش پلاک از تصویر
            x_min, y_min, x_max, y_max = bbox
            plate_image = image[y_min:y_max, x_min:x_max]

            # تغییر اندازه تصویر برای ورودی به CRNN
            plate_image = cv2.resize(plate_image, (256, 64))

            # پیش‌بینی با مدل
            prediction = self.recognition_model.predict(plate_image)

            # استخراج متن و اطمینان از پیش‌بینی
            plate_text = prediction.get('text', '')
            confidence = prediction.get('confidence', 0.0)

            return plate_text, confidence

        except Exception as e:
            logger.error(f"Error in recognize_license_plate: {str(e)}")
            return "", 0.0

    def process_image(self, image_path: str) -> Dict:
        """
        پردازش کامل تصویر از ورودی تا خروجی نهایی

        Args:
            image_path: مسیر فایل تصویر

        Returns:
            اطلاعات پلاک شناسایی شده
        """
        start_time = time.time()

        try:
            # پیش‌پردازش تصویر
            image = self.preprocess_image(image_path)

            # تشخیص پلاک
            license_plates = self.detect_license_plate(image)

            if not license_plates:
                return {
                    'success': False,
                    'message': 'No license plate detected',
                    'processing_time': time.time() - start_time
                }

            # استفاده از پلاک با بیشترین اطمینان
            best_plate = max(license_plates, key=lambda x: x['confidence'])

            # تشخیص متن پلاک
            plate_text, confidence = self.recognize_license_plate(image, best_plate['bbox'])

            # آماده‌سازی و ذخیره تصویر خروجی
            output_image = image.copy()
            x_min, y_min, x_max, y_max = best_plate['bbox']
            cv2.rectangle(output_image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            cv2.putText(output_image, plate_text, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

            # تبدیل به BGR برای ذخیره با OpenCV
            output_image = cv2.cvtColor(output_image, cv2.COLOR_RGB2BGR)

            # ایجاد نام فایل خروجی
            output_filename = f"output_{Path(image_path).stem}.jpg"
            output_path = os.path.join(settings.MEDIA_ROOT, 'license_plates', output_filename)

            # ایجاد دایرکتوری خروجی اگر وجود ندارد
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # ذخیره تصویر خروجی
            cv2.imwrite(output_path, output_image)

            processing_time = time.time() - start_time

            return {
                'success': True,
                'license_plate': plate_text,
                'confidence': confidence,
                'bbox': best_plate['bbox'],
                'output_image': os.path.join(settings.MEDIA_URL, 'license_plates', output_filename),
                'processing_time': processing_time
            }

        except Exception as e:
            logger.error(f"Error in process_image: {str(e)}")
            return {
                'success': False,
                'message': str(e),
                'processing_time': time.time() - start_time
            }