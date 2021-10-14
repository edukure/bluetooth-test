int val = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Battery Level Indicator - BLE");
}

void loop() {
  Serial.println(val);
  delay(1000);
  val++;
}
