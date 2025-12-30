import mysql.connector
import random
from datetime import datetime, timedelta

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "company_energy_monitor"
}

TABLE_NAME = "environmental_data"

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

# OPTIONAL: CLEAR TABLE
# cursor.execute(f"TRUNCATE TABLE {TABLE_NAME}")

BASE_TIME = datetime(2024, 3, 1, 0, 0, 0)
TOTAL_ENTRIES = 200

insert_query = f"""
INSERT INTO {TABLE_NAME}
(EnvData_ID, Monitor_ID, Timestamp, Light_Intensity, Temperature, Humidity)
VALUES (%s, %s, %s, %s, %s, %s)
"""

data = []

for i in range(1, TOTAL_ENTRIES + 1):
    consumption_id = i
    monitor_id = random.randint(1, 20)          # Monitor_ID between 1–20
    timestamp = BASE_TIME + timedelta(hours=i-1)
    consumption_value = round(random.uniform(0.5, 4.0), 2)
    Temp_value = round(random.uniform(0.5, 4.0), 2)
    Hum_value = round(random.uniform(0.5, 4.0), 2)

    data.append((
        consumption_id,
        monitor_id,
        timestamp,
        consumption_value,
        Temp_value,
        Hum_value
    ))

cursor.executemany(insert_query, data)
conn.commit()

print(f"✅ Inserted {TOTAL_ENTRIES} consumption records successfully.")

cursor.close()
conn.close()
