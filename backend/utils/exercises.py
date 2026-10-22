import psycopg2
from psycopg2.extras import execute_values
import json
import os
from dotenv import load_dotenv

load_dotenv()

with open("../data/exercises.json") as j:
  exercises = json.load(j)

connection = psycopg2.connect(
  host="localhost",
  database="gym_app",
  user=os.getenv("DATABASE_USER"),
  password=os.getenv("DATABASE_PASSWORD")
)

def insertExercises():
  if not exercises:
    return

  query = """INSERT INTO exercises (
    name,
    muscle_group,
    equipment,
    movement_type,
    is_compound
  ) VALUES %s"""

  try:
    with connection:
      with connection.cursor() as cur:
        values = [
          (
            exercise["name"],
            exercise["muscle_group"],
            exercise["equipment"],
            exercise["movement_type"],
            exercise["is_compound"]
          )
          for exercise in exercises
        ]
        execute_values(cur, query, values)
  except Exception as e:
    print(f"Error: {e}")

insertExercises()