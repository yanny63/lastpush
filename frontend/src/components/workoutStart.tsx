import { useState, useEffect, useRef } from "react"
import { type Workout, type Exercises, calculateDuration } from "../utils/workout"
import { useNavigate, useParams } from "react-router-dom"
import { IconBarbell, IconBulb, IconCalendar, IconChevronRight, IconClock, IconDots, IconFlame, IconIdBadge2, IconPlayerPlay } from "@tabler/icons-react"
const API_URL = import.meta.env.VITE_BACKEND_ADDRESS
import "../css/workout-start.css"
import { parseDay } from "../utils/utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { create_session, find_active_session, save_session, WORKOUT_TIPS } from "../utils/workout"
import { type WorkoutSession, type WorkoutSessionStatus, type SessionExercise } from "../utils/workout"
import { ReturnTo, WorkoutLogo } from "./shared"

export default function WorkoutStart() {
  const navigate = useNavigate()

  const [ workout, setWorkout ] = useState<Workout | null>(null)
  const [ done, setDone ] = useState(0)
  const [ workoutTip, setWorkoutTip ] = useState<string>("")

  useEffect(() => {
    const n = Math.floor(Math.random() * WORKOUT_TIPS.length)
    setWorkoutTip(WORKOUT_TIPS[n])
  }, [])

  const params = useParams()

  async function checkWorkout() {
    const token = localStorage.getItem("access-token")
    if (!token) return
    try { 
      const res = await fetch(`${API_URL}/workout/${params.id}`, {
        headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) {
        throw new Error("Nie udało się pobrać treningu")
      }
      const data : Workout = await res.json()
      setWorkout(data)
    } catch (e) {}
  }

  useEffect(() => {
    checkWorkout()
  }, [])

  const progressBarRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!progressBarRef.current) return
    let l = 0
    if (!workout?.exercises.length) { l = 0 }
    else l = workout.exercises.length
    progressBarRef.current.style.width = l > 0 ? `${(done / l) * 100}%` : '0'
  }, [done, workout])

  useGSAP(() => {
    if (!workout) return
    const tl = gsap.timeline()
    tl.fromTo(".w-s-exercise", {
      x: -40,
      opacity: 0,
    }, {
      opacity: 1,
      x: 0,
      ease: "bounce.out",
      stagger: 0.08,
      duration: 0.4 
    })

    const animatable = gsap.utils.toArray<HTMLDivElement>(".ar-animatable")
    const t = gsap.timeline()
    animatable.forEach((e, i) => {
      t.from(e, {
        opacity: 0,
        x: 40
      }, i * 0.1)
    })

    gsap.from(".w-e-c", {
      opacity: 0,
      duration: 1,
    })

    gsap.from(".w-h", {
      opacity: 0,
      x: -40,
      duration: 0.4
    })
  }, { dependencies: [workout] })

  async function startExercise(position: string) {
    if (!workout) return

    function as(w: WorkoutSession) {
      gsap.to(".w-s-s", {
        x: -100,
        opacity: 0,
        pointerEvents: "none",
        duration: 0.2,
        ease: "bounce.in",
        onComplete: () => navigate(`/workout/${workout!.id}/session/${w.id}?position=${position}`, {
          state: {
            workout: w
          }
        })
      })
    }

    const w = await find_active_session(workout.id) 
    if (w) {
      as(w)
      return
    }
    
    const session = await create_session(workout.id, workout.name)
    as(session)
  }

  return (
    <section className="w-s-s container">
      <article className="w-s-al">
        <header className="w-h">
          <img className="w-banner" src="https://i.pinimg.com/736x/e0/3b/fe/e03bfe4fa404527e057812fe70079e14.jpg" alt="workout banner" />
          <ReturnTo where="/trening" />
          <div className="w-h-i-c">
            <WorkoutLogo />
            <div>
              <h2>{ workout?.name }</h2>
            </div>
          </div>

          <p className="w-info">
            { workout?.weekday && 
            <span>
              <IconCalendar stroke={2} />
              <span>{ parseDay(workout?.weekday) }</span>
            </span>}
            { workout &&
            <span>
              <IconClock stroke={2} />
              <span>~{ calculateDuration(workout) }min</span>
            </span>}
          </p>

          <div className="w-d-bs">
            <p className="w-d"> { /* workout note/description */ } </p>
            <div className="w-bs">
              <button className="b-s">
                <IconPlayerPlay stroke={2} fill="#fff" color="#fff" />
                Rozpocznij trening
              </button>
              <button className="b-d">
                <IconDots stroke={2} />
              </button>
            </div>
          </div>

        </header>
        <main className="w-main">
          <div className="w-e-c">
              <h3>Ćwiczenia</h3>
              <div>
                <span style={{ flexShrink: 0 }}>{done}/{workout?.exercises.length} ukończonych</span>
                <span className="p-bar">
                  <span ref={progressBarRef}></span>
                </span>
              </div>
          </div>
          <div className="w-s-exercises">
            { workout?.exercises.map((exercise) => (
              <div key={exercise.position} className="w-s-exercise">
                <span className="w-exercise-pos">{ exercise.position }</span>
                <div className="w-img-c">
                  <img className="w-img" src={exercise.image_url} alt="exercise preview image" />
                </div>
                <div className="w-exercise-info">
                  <h4>{ exercise.exercise_name }</h4>
                  <p>{ exercise.target_sets} serie · { exercise.target_reps_min }-{ exercise.target_reps_max} powtórzeń</p>
                </div>
                <div className="w-exercises-b-c" onClick={() => {startExercise(exercise.position)}}>
                  <button className="w-exercises-b">
                    <div className="w-exercises-b-svg">
                      <IconPlayerPlay stroke={2} className="no-fill" />
                      <IconPlayerPlay stroke={2} className="fill" />
                    </div>
                    <span>Rozpocznij</span>
                  </button>
                  <div className="w-exercises-chevron">
                    <IconChevronRight stroke={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </article>

      <aside className="w-s-ar">
        <h3 className="ar-animatable">Postęp treningu</h3>
        <div className="w-progress-c ar-animatable">
            <div className="w-progress-l">
              <h3>{done / (workout?.exercises.length ?? 1)}%</h3>
              <svg width={128} height={128}>
                <circle r={60} cy={64} cx={64} fill="none" stroke="var(--bg-tertiary)" strokeWidth={8}></circle>
              </svg>
            </div>
            <div className="w-progress-r">
              <div className="w-progress-inner">
                <IconBarbell stroke={2} color="var(--accent-blue-dark)" />
                <div className="w-progress-inner-i">
                  <p>{done} / {workout?.exercises.length}</p>
                  <span>Ćwiczeń</span>
                </div>
              </div>
              
              <div className="w-progress-inner">
                <IconClock stroke={2} color="var(--accent-blue-dark)" />
                <div className="w-progress-inner-i">
                  <p>0 min</p>
                  <span>czas treningu</span>
                </div>
              </div>

              <div className="w-progress-inner">
                <IconFlame stroke={2} />
                <div className="w-progress-inner-i">
                  <p>0 kcal</p>
                  <span>spalone kalorie</span>
                </div>
              </div>
            </div>
        </div>

        <div className="current-w-info-c ar-animatable">
            <h3>Informacje o treningu</h3>
            <div className="current-w-info">
              <IconIdBadge2 stroke={2} />
              <div className="current-w-info-inner">
                <span>Nazwa</span>
                <p>{ workout?.name }</p>
              </div>
            </div>
            { workout?.weekday && 
            <div className="current-w-info">
              <IconCalendar stroke={2} />
              <div className="current-w-info-inner">
                <span>Dzień tygodnia</span>
                <p>{ parseDay(workout?.weekday) }</p>
              </div>
            </div>}
            { workout && 
            <div className="current-w-info">
              <IconClock stroke={2} />
              <div className="current-w-info-inner">
                <span>Czas trwania</span>
                <p>~{ calculateDuration(workout) } min</p>
              </div>
            </div>}
        </div>

        <div className="w-advice-c ar-animatable">
            <div className="w-advice-l">
              <IconBulb width={32} height={32} stroke={2} color="var(--accent-blue)" />
            </div>
            <div className="w-advice">
              <h3>Wskazówka</h3>
              <p>{ workoutTip }</p>
            </div>
        </div>
      </aside>
    </section>
  )
}