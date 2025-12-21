import serial
import mysql.connector

PORT = "COM3"
BAUD_RATE = 9600

voltage = 0
current = 0
power = 0

bluetooth = serial.Serial(PORT, BAUD_RATE)

db = mysql.connector.connect(
    host = "localhost",
    user = "root",
    password = "",
    database = "home_energy_monitor_system"
)

cursor = db.cursor()


while True:
    try:
        data = bluetooth.readline().decode().strip()
        print("Received: ", data)
        voltage, current, power = map(float, data.split(","))

        insert_query = f"INSERT INTO sample_table (voltage, current, power) VALUES ({voltage}, {current}, {power})"
        cursor.execute(insert_query)
        db.commit()
    except KeyboardInterrupt:
        print("Stopping...")
        empty_table_query = "DELETE FROM sample_table"
        cursor.execute(empty_table_query)
        db.commit()
        break