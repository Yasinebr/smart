import cv2
import numpy as np
import time
import os
import logging
from django.conf import settings
from typing import Dict, List, Tuple, Optional, Any
import json

# تنظیم لاگر
logger = logging.getLogger(__name__)

# مسیرهای مدل‌ها
MODELS_DIR = os.path.join(settings.BASE_DIR, 'apps', 'ai', 'face', 'models')
FACE_DETECTION_MODEL_PATH = os.path.join(MODELS_DIR, 'face_detection_model.xml')
FACE_RECOGNITION_MODEL_PATH = os.path.join(MODELS_DIR, 'face_recognition_model.dat')

# حد آستانه تشخیص
FACE_DETECTION_THRESHOLD = 0.5
FACE_RECOGNITION_THRESHOLD = 0.6


class FaceProcessor:
    """
    پردازشگر تشخیص و شناسایی چهره
    """

    def __init__(self):
        """
        بارگذاری مدل‌ها و آماده‌سازی پردازشگر
        """
        self.face_detector = None
        self.face_recognizer = None
        self.load_models()

    def load_models(self) -> None:
        """
        بارگذاری مدل‌های تشخیص و شناسایی چهره
        """
        try:
            # بارگذاری مدل تشخیص چهره
            self.face_detector = cv2.dnn.readNetFromCaffe(
                os.path.join(MODELS_DIR, 'deploy.prototxt'),
                os.path.join(MODELS_DIR, 'res10_300x300_ssd_iter_140000.caffemodel')
            )

            logger.info("Face detection model loaded successfully.")

            # بارگذاری مدل شناسایی چهره (برای استخراج embedding)
            import dlib
            self.face_recognizer = dlib.face_recognition_model_v1(FACE_RECOGNITION_MODEL_PATH)
            self.shape_predictor = dlib.shape_predictor(
                os.path.join(MODELS_DIR, 'shape_predictor_68_face_landmarks.dat'))

            logger.info("Face recognition model loaded successfully.")

        except Exception as e:
            logger.error(f"Failed to load face models: {str(e)}")
            self.face_detector = None
            self.face_recognizer = None
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
            # خواندن تصویر
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")

            return img

        except Exception as e:
            logger.error(f"Error in preprocess_image: {str(e)}")
            raise

    def detect_faces(self, image: np.ndarray) -> List[Dict]:
        """
        تشخیص چهره در تصویر

        Args:
            image: تصویر ورودی

        Returns:
            لیستی از چهره‌های تشخیص داده شده با مختصات و احتمال
        """
        if self.face_detector is None:
            raise ValueError("Face detector model is not loaded")

        try:
            # تعیین ابعاد تصویر
            (h, w) = image.shape[:2]

            # آماده‌سازی تصویر برای ورودی به شبکه
            blob = cv2.dnn.blobFromImage(
                cv2.resize(image, (300, 300)),
                1.0, (300, 300),
                (104.0, 177.0, 123.0)
            )

            # اعمال مدل تشخیص چهره
            self.face_detector.setInput(blob)
            detections = self.face_detector.forward()

            # پردازش نتایج
            faces = []
            for i in range(0, detections.shape[2]):
                confidence = detections[0, 0, i, 2]

                # فیلتر کردن بر اساس اطمینان
                if confidence > FACE_DETECTION_THRESHOLD:
                    # محاسبه مختصات باکس چهره
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")

                    # اطمینان از اینکه باکس درون تصویر است
                    startX = max(0, startX)
                    startY = max(0, startY)
                    endX = min(w, endX)
                    endY = min(h, endY)

                    faces.append({
                        'bbox': [startX, startY, endX, endY],
                        'confidence': float(confidence)
                    })

            return faces

        except Exception as e:
            logger.error(f"Error in detect_faces: {str(e)}")
            return []

    def extract_face_embedding(self, image: np.ndarray, bbox: List[int]) -> Optional[np.ndarray]:
        """
        استخراج embedding چهره

        Args:
            image: تصویر ورودی
            bbox: مختصات چهره [startX, startY, endX, endY]

        Returns:
            بردار embedding چهره
        """
        if self.face_recognizer is None:
            raise ValueError("Face recognizer model is not loaded")

        try:
            import dlib

            # تبدیل به فرمت RGB برای dlib
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # ایجاد مستطیل dlib از باکس
            startX, startY, endX, endY = bbox
            dlib_rect = dlib.rectangle(startX, startY, endX, endY)

            # پیدا کردن نقاط لندمارک چهره
            shape = self.shape_predictor(rgb_image, dlib_rect)

            # استخراج embedding
            face_embedding = self.face_recognizer.compute_face_descriptor(rgb_image, shape)

            # تبدیل به آرایه NumPy
            face_embedding = np.array(face_embedding)

            return face_embedding

        except Exception as e:
            logger.error(f"Error in extract_face_embedding: {str(e)}")
            return None

    def compare_embeddings(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        مقایسه دو embedding چهره

        Args:
            embedding1: embedding چهره اول
            embedding2: embedding چهره دوم

        Returns:
            میزان شباهت دو چهره (1 = حداکثر شباهت، 0 = حداقل شباهت)
        """
        try:
            # محاسبه فاصله اقلیدسی
            distance = np.linalg.norm(embedding1 - embedding2)

            # تبدیل فاصله به شباهت (هرچه فاصله کمتر، شباهت بیشتر)
            similarity = 1.0 / (1.0 + distance)

            return similarity

        except Exception as e:
            logger.error(f"Error in compare_embeddings: {str(e)}")
            return 0.0

    def process_image(self, image_path: str) -> Dict:
        """
        پردازش کامل تصویر از ورودی تا خروجی نهایی

        Args:
            image_path: مسیر فایل تصویر

        Returns:
            اطلاعات چهره‌های شناسایی شده
        """
        start_time = time.time()

        try:
            # پیش‌پردازش تصویر
            image = self.preprocess_image(image_path)

            # تشخیص چهره
            faces = self.detect_faces(image)

            if not faces:
                return {
                    'success': False,
                    'message': 'No faces detected',
                    'processing_time': time.time() - start_time
                }

            # آماده‌سازی تصویر خروجی
            output_image = image.copy()

            # پردازش هر چهره
            processed_faces = []
            for face in faces:
                bbox = face['bbox']
                confidence = face['confidence']

                # ترسیم باکس روی تصویر
                startX, startY, endX, endY = bbox
                cv2.rectangle(output_image, (startX, startY), (endX, endY), (0, 255, 0), 2)

                # استخراج embedding چهره
                face_embedding = self.extract_face_embedding(image, bbox)

                if face_embedding is not None:
                    # ذخیره اطلاعات چهره
                    processed_face = {
                        'bbox': bbox,
                        'confidence': confidence,
                        # embedding را نمی‌توان مستقیماً در JSON ذخیره کرد
                        # برای استفاده در برنامه باید در دیتابیس ذخیره شود
                    }
                    processed_faces.append(processed_face)

                    # نمایش اطمینان تشخیص روی تصویر
                    text = f"{confidence:.2f}"
                    y = startY - 10 if startY - 10 > 10 else startY + 10
                    cv2.putText(output_image, text, (startX, y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 2)

            # ایجاد نام فایل خروجی
            from pathlib import Path
            output_filename = f"output_{Path(image_path).stem}.jpg"
            output_path = os.path.join(settings.MEDIA_ROOT, 'faces', output_filename)

            # ایجاد دایرکتوری خروجی اگر وجود ندارد
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # ذخیره تصویر خروجی
            cv2.imwrite(output_path, output_image)

            processing_time = time.time() - start_time

            return {
                'success': True,
                'face_count': len(processed_faces),
                'faces': processed_faces,
                'output_image': os.path.join(settings.MEDIA_URL, 'faces', output_filename),
                'processing_time': processing_time
            }

        except Exception as e:
            logger.error(f"Error in process_image: {str(e)}")
            return {
                'success': False,
                'message': str(e),
                'processing_time': time.time() - start_time
            }