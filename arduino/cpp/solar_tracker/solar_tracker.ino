#include <Servo.h>
Servo myservo;
const int DIFFERENCE_MARGIN = 25;
int angle = 0, prL, prR, difference;
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
  Serial.print("Sensor L: ");
  Serial.print(prL);
  Serial.print("  | Sensor R: ");
  Serial.print(prR);
  Serial.print("  | Difference: ");
  Serial.println(difference);
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
