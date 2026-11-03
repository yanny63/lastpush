from fastapi import FastAPI, Form, HTTPException, Query, WebSocket, Depends, WebSocketException, status, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from fastapi_mail import MessageType, ConnectionConfig, FastMail, MessageSchema
from fastapi.staticfiles import StaticFiles
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from psycopg2.errors import UniqueViolation
import dotenv
import os
from pydantic import EmailStr, BaseModel, ValidationError
from utils.passwords import Passwords
import jwt
from datetime import datetime, timedelta, timezone
import secrets
import hashlib
from typing import Optional

dotenv.load_dotenv()

conf = ConnectionConfig(
  MAIL_USERNAME=os.getenv("MAIL_USER"),
  MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
  MAIL_FROM=os.getenv("MAIL_USER"),
  MAIL_PORT=465,
  MAIL_SERVER="smtp.gmail.com",
  MAIL_STARTTLS=False,
  MAIL_SSL_TLS=True,
  USE_CREDENTIALS=True,
  VALIDATE_CERTS=True,
)

app = FastAPI()
passwords = Passwords()

app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173', 'http://192.168.1.33:5173'],
  allow_credentials=True,
  allow_headers=['*'],
  allow_methods=['*']
)

app.mount("/uploads", StaticFiles(directory="images"), name="uploads")

auth_scheme = OAuth2PasswordBearer(tokenUrl='token', auto_error=False)

conn_pool =  pool.SimpleConnectionPool(
  minconn=1,
  maxconn=10,
  host='localhost',
  database='gym_app',
  user=os.getenv('DATABASE_USER'),
  password=os.getenv('DATABASE_PASSWORD')
)

SECRET_KEY = os.getenv("SECRET_KEY")

def _fetch_one(query, params=None):
  try:
    conn = conn_pool.getconn()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
      cur.execute(query, params)
      return cur.fetchone()
  finally:
    conn_pool.putconn(conn)

def _fetch_all(query, params=None):
  try:
    conn = conn_pool.getconn()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
      cur.execute(query, params)
      return cur.fetchall()
  finally:
    conn_pool.putconn(conn)

def _execute(query, params=None):
  try:
    conn = conn_pool.getconn()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
      cur.execute(query, params)
      conn.commit()
  except:
    conn.rollback()
    raise
  finally:
    conn_pool.putconn(conn)

def _execute_get_one(query, params=None):
  try:
    conn = conn_pool.getconn()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
      cur.execute(query, params)
      row = cur.fetchone()
    conn.commit()
    return row
  finally:
    conn_pool.putconn(conn)

async def fetch_all(query, params=None):
  return await run_in_threadpool(_fetch_all, query, params)

async def fetch_one(query, params=None):
  return await run_in_threadpool(_fetch_one, query, params)

async def execute(query, params=None):
  return await run_in_threadpool(_execute, query, params)

async def execute_get_one(query, params=None):
  return await run_in_threadpool(_execute_get_one, query, params)

async def sendEmail(username: str, email: str, link: str):
    message = MessageSchema(
        recipients=[email],
        subject="LastPush - Weryfikacja Konta",
        body=f"""<!DOCTYPE html>
          <html lang="pl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 48px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 8px; padding: 32px;">
                    <tr>
                      <td align="center" style="padding-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <h1 style="margin:0; font-size: 20px; color:#000;">Witaj {username}!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 20px 0; color:#333; font-size: 14px;">
                        Dziękujemy za rejestrację.
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <a href="{link}"
                          style="display:inline-block; background-color:#007AFF; color:#ffffff;
                                  text-decoration:none; font-weight:bold; font-size:16px;
                                  padding:16px 20px; border-radius:16px;">
                          Potwierdź konto
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>""",
        subtype=MessageType.html,
    )
    try:
        await FastMail(conf).send_message(message)
        print(f"Email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise

class Email(BaseModel):
  email: EmailStr

class User(BaseModel):
  username: str
  email: str
  password: str

@app.post("/register")
async def register(user: User):
  username = user.username
  email = user.email
  password = user.password
  try:
    user = Email(email=email)
  except ValidationError:
    raise HTTPException(status_code=422, detail="Niepoprawny adres email")
  b = passwords.hashPassword(password)

  try:
    row = await execute_get_one(
      "INSERT INTO users (username, email, password, verified) VALUES (%s, %s, %s, %s) RETURNING id", (username, email, b.decode(), False)
    )
    token = secrets.token_urlsafe(32)
    token_to_db = hashlib.sha256(token.encode()).hexdigest()
    expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    link = f"http://192.168.1.33:5173/verify?token={token}"
    register_session = secrets.token_urlsafe(32)
    await execute(
      "INSERT INTO verification (id, user_id, token, session, expires) VALUES (%s, %s, %s, %s, %s)", (register_session, row.get("id"), token_to_db, register_session, expires)
    )
    await sendEmail(username, email, link)

    return {
      "register_session": register_session
    }
  
  except UniqueViolation as e:
    constraint = e.diag.constraint_name
    if constraint == "users_username_key":
      raise HTTPException(status_code=409, detail="Ta nazwa użytkownika jest już zajęta")
    elif constraint == "users_email_key":
      raise HTTPException(status_code=490, detail="Użytkownik z tym adresem już istnieje")
    else:
      raise HTTPException(status_code=409, detail="Naruszenie unikalności danych")

from utils.ws import RegistrationWebsockets
registrationWs = RegistrationWebsockets()

@app.post("/verify")
async def verify(token: str = Query(...)):
  try:
    db_token = hashlib.sha256(token.encode()).hexdigest()
    verification = await fetch_one(
      "SELECT user_id, session, expires FROM verification WHERE token = %s", (db_token,)
    )
    if not verification:
      raise HTTPException(status_code=404, detail="User nie istnieje")

    await execute(
      "UPDATE users SET verified = %s WHERE id = %s", (True, verification.get("user_id"))
    )
    await execute(
      "UPDATE verification SET used_at = NOW() WHERE token = %s", (db_token,)
    )
    session = verification.get("session")
    await registrationWs.verify(session, {"type": "verification", "verified": True})

  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=400, detail="Token wygasł")
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=400, detail="Nieprawidłowy token")

class Login(BaseModel):
  identifier: str
  password: str

@app.post("/login")
async def login(user: Login):
  u = await fetch_one(
    "SELECT * FROM users WHERE email = %s OR username = %s", (user.identifier, user.identifier)
  )

  if not u:
    raise HTTPException(status_code=401, detail="Nieprawidłowy login lub hasło")

  if not u.get("verified"):
    raise HTTPException(status_code=403, detail="Niezweryfikowane konto")
  
  if not passwords.checkPassword(u.get('password'), user.password):
    raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")

  token = jwt.encode({
    "sub": u.get('id'),
    "role": u.get('role')
  }, SECRET_KEY, "HS256")

  return {"token": token}

@app.websocket("/ws/verify")
async def wsVerify(websocket: WebSocket, session: Optional[str] = None):
  if not session or session == 'null':
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    return

  await registrationWs.connect(session, websocket)

  try:
    while True:
      data = await websocket.receive_json()
      verified = data.get("verified", False)

      if verified:
          await registrationWs.disconnect(session)
  except WebSocketDisconnect:
    await registrationWs.disconnect(session)

@app.get("/me")
async def getMe(token = Depends(auth_scheme)):
  if not token:
    raise HTTPException(status_code=404)

  payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

  user = await fetch_one(
    "SELECT id, username, email, avatar, created_at, verified, role FROM users WHERE id = %s", (payload.get("sub"),)
  )

  proper_date = user.get("created_at").isoformat()
  user["created_at"] = proper_date

  return user

@app.get("/profile/{id}")
async def profile(id: str, token = Depends(auth_scheme)):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id = payload.get('sub')
  except:
    user_id = None

  try: 
    profile = await fetch_one(
      """SELECT u.username, u.avatar, u.created_at, COUNT(f.friend_id) AS friends_count, fr.status,
      EXISTS (
        SELECT 1 
        FROM friends AS relation
        WHERE relation.user_id = u.id AND relation.friend_id = %s OR relation.user_id = %s AND relation.friend_id = u.id
      ) AS is_friend
      FROM users AS u
      LEFT JOIN friends AS f 
        ON f.user_id = u.id OR f.friend_id = u.id
        AND f.status = 'accepted'
      LEFT JOIN friends AS fr 
        ON fr.user_id = u.id OR f.friend_id = u.id
        AND fr.status = 'pending'
      WHERE u.id = %s
      GROUP BY u.id, u.username, u.avatar, u.created_at, fr.status""", (user_id, user_id, id)
    )
  except psycopg2.DataError:
    raise HTTPException(status_code=404)

  return profile

@app.post("/friend")
async def friend(token = Depends(auth_scheme), friend_id: str = Query(...)):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Zły token")

  await execute(
    """INSERT INTO friends (user_id, friend_id) VALUES (%s, %s) ON CONFLICT DO NOTHING""", (payload.get('sub', None), friend_id)
  )

  return {"status": 200}

@app.post("/unfriend")
async def unfriend(token = Depends(auth_scheme), friend_id: str = Query(...)):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Zły token")

  await execute(
    """DELETE FROM friends WHERE user_id = %s AND friend_id = %s AND status != %s""", (payload.get('user_id', None), friend_id, 'blocked')
  )

  return {"status": 200}

@app.get("/api/exercises")
async def exercises(startId: int = Query(...)):
  limit = 20
  e = await fetch_all("SELECT * FROM exercises WHERE id > %s ORDER BY id ASC LIMIT %s", (startId, limit))
  
  return {
    "limit": 20,
    "current_start_id": startId,
    "next_start_id": e[-1]["id"] if e else startId,
    "exercises": e
  }

@app.get("/api/exercises/info")
async def exercisesInfo():
  count = await fetch_all("SELECT COUNT(id) FROM exercises")

  return {
    "count": count[0].get("count")
  }

class Exercises(BaseModel):
  id: int
  name: str
  muscle_group: str
  equipment: str
  movement_type: str
  is_compound: bool
  description: Optional[str] = None
  sets: int
  reps: str
  rest_seconds: int

class Workout(BaseModel):
  name: str
  exercises: list[Exercises]
  when: Optional[int] = None

@app.post("/workout")
async def saveWorkout(workout: Workout, token: str = Depends(auth_scheme)):
  if not token:
    raise HTTPException(status_code=401, detail="Zaloguj się, aby zapisać trening")

  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token wygasł", headers={"WWW-Authenticate": "Bearer"})
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Nieprawidłowy token", headers={"WWW-Authenticate": "Bearer"})

  user_id = payload.get('sub')

  schema = await execute_get_one(
    "INSERT INTO workout_schemas (user_id, name) VALUES (%s, %s) RETURNING id", (user_id, workout.name)
  )

  if workout.when:
    await execute(
      "INSERT INTO workout_schedule_days (schema_id, weekday) VALUES (%s, %s)", (schema.get('id'), workout.when)
    )

  for index, exercise in enumerate(workout.exercises):
    min_reps = exercise.reps.split("-")[0]
    max_reps = exercise.reps.split("-")[1]

    await execute(
      """INSERT INTO workout_schema_exercises (schema_id, exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds)
      VALUES (%s, %s, %s, %s, %s, %s, %s)""", (schema.get('id'), exercise.id, index + 1, exercise.sets, min_reps, max_reps, exercise.rest_seconds)
    )

@app.get("/workouts")
async def workouts(token: str = Depends(auth_scheme)):
  if not token:
    raise HTTPException(status_code=401, detail="Zaloguj się, aby zobaczyć swoje treningi")

  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token wygasł", headers={"WWW-Authenticate": "Bearer"})
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Nieprawidłowy token", headers={"WWW-Authenticate": "Bearer"})

  user_id = payload.get('sub')

  workouts = await fetch_all(
    """SELECT * FROM workout_schemas WHERE user_id = %s""", (user_id,)
  )

  for w in workouts:
    exercises = await fetch_all(
      """SELECT e.name AS exercise_name, wse.position, wse.target_sets, wse.rest_seconds
      FROM workout_schema_exercises AS wse 
      LEFT JOIN exercises AS e ON e.id = wse.exercise_id
      WHERE wse.schema_id = %s""", (w.get("id"),)
    )

    weekdays = await fetch_all(
      "SELECT weekday FROM workout_schedule_days WHERE schema_id = %s", (w.get('id'),)
    )

    w["exercises"] = list(exercises)
    w["weekdays"] = list(weekdays)

    currentDay = datetime.now().weekday() + 1

    nextWorkout = await fetch_one(
      """SELECT w.id, w.name, w.created_at, w.updated_at, d.weekday FROM workout_schedule_days AS d
      LEFT JOIN workout_schemas AS w ON w.id = d.schema_id
      WHERE weekday >= %s AND w.user_id = %s""", (currentDay, user_id)
    )

    if not nextWorkout:
      nextWorkout = await fetch_one(
        """SELECT w.id, w.name, w.created_at, w.updated_at, d.weekday FROM workout_schedule_days AS d
        LEFT JOIN workout_schemas AS w ON w.id = d.schema_id
        WHERE user_id = %s ORDER BY d.weekday ASC LIMIT 1""", (user_id,)
      )

    print(nextWorkout)

  return {
    "workout": workouts,
    "next_workout": nextWorkout
  }

async def get_workout_data(workout_id: str, user_id: str):
  workout = await fetch_one(
    """SELECT w.id, w.name, wd.weekday
    FROM workout_schemas AS w
    LEFT JOIN workout_schedule_days AS wd ON wd.schema_id = w.id
    WHERE w.id = %s AND w.user_id = %s""", (workout_id, user_id))

  if not workout:
    return None

  exercises = await fetch_all(
    """SELECT e.id, e.name AS exercise_name, e.image_url, e.muscle_group, we.position, we.target_sets, we.target_reps_min, we.target_reps_max, we.rest_seconds
      FROM workout_schema_exercises AS we
      LEFT JOIN exercises AS e ON e.id = we.exercise_id
      WHERE we.schema_id = %s
      ORDER BY we.position""", (workout_id,)
  )

  workout["exercises"] = exercises
  
  return workout

@app.get("/workout/{workout_id}")
async def w(workout_id: str, token: str = Depends(auth_scheme)):
  try: 
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token wygasł", headers={"WWW-Authenticate": "Bearer"})
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Nieprawidłowy token", headers={"WWW-Authenticate": "Bearer"})

  user_id = payload.get("sub")

  workout = await get_workout_data(workout_id, user_id)
  if not workout:
    raise HTTPException(status_code=404, detail="Nie znaleziono treningu")
  
  return workout

@app.get("/session/{session_id}")
async def find_workout(session_id: str, token: str = Depends(auth_scheme)):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token wygasł", headers={"WWW-Authenticate:" "Bearer"})
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Nieprawidłowy token", headers={"WWW-Authenticate:" "Bearer"})

  user_id = payload.get("sub")

  session = await fetch_one(
    """SELECT w.id, w.name AS workout_name, w.started_at, w.status
    FROM workouts AS w 
    
    WHERE w.schema_id = %s AND w.user_id = %s AND w.status = 'in_progress'""", (session_id, user_id)
  )

  workout = await get_workout_data(session_id, user_id)

  if not workout:
    raise HTTPException(status_code=404, detail="Nie znaleziono szablonu treningu")

  exercises = await fetch_all(
    """SELECT e.id, ex.name AS exercise_name, ex.muscle_group, e.position, e.notes, e.rest_seconds, e.target_reps_min, e.target_reps_max, e.target_sets, ex.image_url
    FROM workout_exercises AS e
    LEFT JOIN exercises AS ex ON ex.id = e.exercise_id 
    WHERE workout_id = %s""", (session["id"],)
  )

  for e in exercises:
    sets = await fetch_all(
      """SELECT * FROM workout_sets WHERE workout_exercise_id = %s""", (e["id"],)
    )
    e["sets"] = sets
 
  session["exercises"] = exercises
  session["weekday"] = workout["weekday"]
  session["schema_id"] = workout["id"]

  return session

@app.post("/session")
async def new_session(schema_id: str = Query(...), name: str = Query(...), token: str = Depends(auth_scheme)):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token wygasł", headers={"WWW-Authenticate:" "Bearer"})
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail="Nieprawidłowy token", headers={"WWW-Authenticate:" "Bearer"})

  user_id = payload.get("sub")

  session = await execute_get_one(
    """INSERT INTO workouts (user_id, schema_id, name, status) VALUES (%s, %s, %s, 'in_progress') RETURNING id""", (user_id, schema_id, name)
  )

  workout = await get_workout_data(schema_id, user_id)
  
  if not workout:
    raise HTTPException(status_code=404, detail="Nie znaleziono szablonu treningu")

  exercises = [] 
  for e in workout["exercises"]:
    ex = {}
    ex["workout_id"] = session["id"]
    ex["exercise_id"] = e["id"]
    ex["position"] = e["position"]
    ex["target_sets"] = e["target_sets"]
    ex["target_reps_min"] = e["target_reps_min"]
    ex["target_reps_max"] = e["target_reps_max"]
    ex["rest_seconds"] = e["rest_seconds"]

    e_ = await execute_get_one(
      """INSERT INTO workout_exercises (workout_id, exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""", 
      (ex["workout_id"], ex["exercise_id"], ex["position"], ex["target_sets"], ex["target_reps_min"], ex["target_reps_max"], ex["rest_seconds"])
    )
    ex["id"] = e_.get("id")
    exercises.append(ex)

  session["exercises"] = exercises
  session["weekday"] = workout["weekday"]

  for e in session["exercises"]:
    sets = []
    for s in range(e.get("target_sets", 0)):
      se = {}
      set_number = s + 1
      reps = e.get("target_reps_min", 8)
      completed = False
      weight = 0
      set_id = await execute_get_one(
        """INSERT INTO workout_sets (workout_exercise_id, set_number, reps) VALUES (%s, %s, %s) RETURNING id""", (e["id"], set_number, reps)
      )
      se["set_number"] = set_number
      se["reps"] = reps
      se["completed"] = completed
      se["weight"] = weight
      se["set_id"] = set_id.get("id")

      sets.append(se)
    e["sets"] = sets

  return session