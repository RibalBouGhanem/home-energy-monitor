#include <Servo.h>
Servo myservo;
const int DIFFERENCE_MARGIN = 25, RESISTANCE = 10000, MAX_V = 5.5;
int angle = 0, prL, prR, difference;
float adc_value, voltage, current, power;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  myservo.attach(3);
  myservo.write(angle);
}

void loop() {
  // put your main code here, to run repeatedly:
  prL = analogRead(A0);
  prR = analogRead(A1);
  difference = prL - prR;

  adc_value = analogRead(A5);
  voltage = 0.5*(adc_value*MAX_V/1024.0);
  current = voltage/RESISTANCE;
  power = voltage*RESISTANCE;
  Serial.println(power);

  if (difference > DIFFERENCE_MARGIN && angle < 176) {
    // the left photoresistor is recieving more light than the right photoresistor
    angle += 5;
  } else if (difference < (-1*DIFFERENCE_MARGIN) && angle > 4) {
    // the right photoresistor is recieving more light than the left photoresistor
    angle -= 5;
  }
  myservo.write(angle);
  delay(250);
}
