import serial
import mysql.connector

PORT = "COM4"
BAUD_RATE = 9600

voltage = 0
current = 0
power = 0

bluetooth = serial.Serial(PORT, BAUD_RATE)

db = mysql.connector.connect(
    host = "localhost",
    user = "root",
    password = "",
    database = "company_energy_monitor"
)

cursor = db.cursor()


while True:
    try:
        data = bluetooth.readline().decode().strip()
        print("Received: ", data)
        power = data

        insert_query = f"INSERT INTO energy_production (Monitor_ID, Timestamp, Production_Value) VALUES (1, NOW(), {power})"
        cursor.execute(insert_query)
        db.commit()
    except KeyboardInterrupt:
        print("Stopping...")
        empty_table_query = "DELETE FROM sample_table WHERE Year(Timestamp) > 2025"
        cursor.execute(empty_table_query)
        db.commit()
        break