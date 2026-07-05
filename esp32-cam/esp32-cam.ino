/*
 * ESP32-CAM Crop Image Capture
 * Captures photo on demand or periodically and uploads to Trust Market backend
 * 
 * Hardware: ESP32-CAM (AI-Thinker)
 * Camera: OV2640
 * 
 * Pins:
 *   PWDN_GPIO_NUM  = 32
 *   RESET_GPIO_NUM = -1
 *   XCLK_GPIO_NUM  = 0
 *   SIOD_GPIO_NUM  = 26
 *   SIOC_GPIO_NUM  = 27
 *   Y9_GPIO_NUM    = 35
 *   Y8_GPIO_NUM    = 34
 *   Y7_GPIO_NUM    = 39
 *   Y6_GPIO_NUM    = 36
 *   Y5_GPIO_NUM    = 21
 *   Y4_GPIO_NUM    = 19
 *   Y3_GPIO_NUM    = 18
 *   Y2_GPIO_NUM    = 5
 *   VSYNC_GPIO_NUM = 25
 *   HREF_GPIO_NUM  = 23
 *   PCLK_GPIO_NUM  = 22
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "esp_camera.h"

// WiFi
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend URL
const char* serverUrl = "http://192.168.100.248:5000/api/iot/crop-image";
const char* authToken = "YOUR_AUTH_TOKEN"; // JWT token from login

// Flash LED pin
#define FLASH_LED 4

// Photo capture interval (seconds)
const int CAPTURE_INTERVAL = 30;
unsigned long lastCapture = 0;

// Camera pins for AI-Thinker ESP32-CAM
static camera_config_t camera_config = {
  .pin_pwdn = 32,
  .pin_reset = -1,
  .pin_xclk = 0,
  .pin_sscb_sda = 26,
  .pin_sscb_scl = 27,
  .pin_d7 = 35,
  .pin_d6 = 34,
  .pin_d5 = 39,
  .pin_d4 = 36,
  .pin_d3 = 21,
  .pin_d2 = 19,
  .pin_d1 = 18,
  .pin_d0 = 5,
  .pin_vsync = 25,
  .pin_href = 23,
  .pin_pclk = 22,
  .xclk_freq_hz = 20000000,
  .ledc_timer = LEDC_TIMER_0,
  .ledc_channel = LEDC_CHANNEL_0,
  .pixel_format = PIXFORMAT_JPEG,
  .frame_size = FRAMESIZE_SVGA,
  .jpeg_quality = 12,
  .fb_count = 1,
  .fb_location = CAMERA_FB_IN_PSRAM,
  .grab_mode = CAMERA_GRAB_WHEN_EMPTY,
};

void setup() {
  Serial.begin(115200);

  pinMode(FLASH_LED, OUTPUT);
  digitalWrite(FLASH_LED, LOW);

  // Init camera
  esp_err_t err = esp_camera_init(&camera_config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    return;
  }
  Serial.println("Camera initialized");

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long now = millis();
  if (now - lastCapture < CAPTURE_INTERVAL * 1000) return;
  lastCapture = now;

  digitalWrite(FLASH_LED, HIGH);
  delay(200);

  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    digitalWrite(FLASH_LED, LOW);
    return;
  }

  digitalWrite(FLASH_LED, LOW);
  Serial.printf("Captured %d bytes\n", fb->len);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("Authorization", "Bearer " + String(authToken));
    http.addHeader("X-Crop-Name", "crop_capture");
    http.addHeader("X-Device-Code", "ESP32-CAM-001");

    int httpCode = http.POST(fb->buf, fb->len);
    Serial.printf("HTTP response: %d\n", httpCode);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println(response);
    }
    http.end();
  }

  esp_camera_fb_return(fb);
}
