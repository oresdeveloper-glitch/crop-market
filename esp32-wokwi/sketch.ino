#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// WiFi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Backend HTTP endpoint (update IP to match your machine)
const char* serverUrl = "http://192.168.0.68:5000/api/push-sensor";

// Sensor pins
#define DHTPIN 15
#define DHTTYPE DHT22
#define MOISTURE_PIN 34
#define LED_PIN 2

// OLED
#define OLED_SDA 21
#define OLED_SCL 22
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

DHT dht(DHTPIN, DHTTYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

unsigned long lastPublish = 0;
const int PUBLISH_INTERVAL = 3000; // every 3 seconds

float calculateQualityScore(float temperature, float humidity, int moistureRaw) {
  float moisturePercent = ((float)moistureRaw / 4095.0) * 100.0;
  float moistureScore = moisturePercent;
  float tempScore = 100 - abs(temperature - 25) * 5;
  float humidityScore = 100 - abs(humidity - 65) * 2;
  tempScore = constrain(tempScore, 0, 100);
  humidityScore = constrain(humidityScore, 0, 100);
  return constrain((moistureScore * 0.40) + (tempScore * 0.30) + (humidityScore * 0.30), 0, 100);
}

char getGrade(float score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());
}

void showOnOLED(float temp, float hum, float moisture, float score, char grade) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);   display.println("Crop Quality System");
  display.setCursor(0, 14);  display.print("Temp: "); display.print(temp, 1); display.println(" C");
  display.setCursor(0, 26);  display.print("Hum : "); display.print(hum, 1); display.println(" %");
  display.setCursor(0, 38);  display.print("Moist: "); display.print(moisture, 0); display.println(" %");
  display.setCursor(0, 50);  display.print("Score:"); display.print(score, 1); display.print(" Gr:"); display.print(grade);
  display.display();
}

void postToBackend(float temp, float hum, float moisture, float score, char grade) {
  if (WiFi.status() != WL_CONNECTED) { Serial.println("WiFi not connected"); return; }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"temperature\":" + String(temp, 1) + ",";
  payload += "\"humidity\":" + String(hum, 1) + ",";
  payload += "\"moisture\":" + String(moisture, 1) + ",";
  payload += "\"score\":" + String(score, 1) + ",";
  payload += "\"grade\":\"" + String(grade) + "\"";
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("HTTP POST: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  dht.begin();
  Wire.begin(OLED_SDA, OLED_SCL);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (true);
  }

  display.clearDisplay();
  display.setCursor(0, 20);
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.println("Connecting WiFi...");
  display.display();

  setupWiFi();

  display.clearDisplay();
  display.setCursor(0, 20);
  display.println("System Ready");
  display.display();
  delay(1500);
}

void loop() {
  unsigned long now = millis();
  if (now - lastPublish < PUBLISH_INTERVAL) return;
  lastPublish = now;

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int moistureRaw = analogRead(MOISTURE_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT22 reading failed");
    return;
  }

  float moisturePercent = ((float)moistureRaw / 4095.0) * 100.0;
  float qualityScore = calculateQualityScore(temperature, humidity, moistureRaw);
  char grade = getGrade(qualityScore);

  digitalWrite(LED_PIN, grade == 'A' ? HIGH : LOW);

  showOnOLED(temperature, humidity, moisturePercent, qualityScore, grade);
  postToBackend(temperature, humidity, moisturePercent, qualityScore, grade);
}
