import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { calculateDuration, type Workout, get_most_common, equipment_photos, getExerciseLabel , type WorkoutSession, type ExerciseSet } from "../utils/workout"
import { ReturnTo, WorkoutLogo } from "./shared"
import "../css/workout.css"
import { IconArrowNarrowLeft, IconBarbell, IconBulb, IconCalendar, IconCheck, IconChevronRight, IconClock, IconFlag, IconHelpCircle, IconLogs, IconMaximize, IconPlayerPause, IconPlayerPlay, IconStack2, IconTargetArrow, IconX } from "@tabler/icons-react"
import { parseDay } from "../utils/utils"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion, scale } from "framer-motion"
import * as Dialog from '@radix-ui/react-dialog'
const API_URL = import.meta.env.VITE_BACKEND_ADDRESS

export default function Workout() {
  const navigate = useNavigate()

  const { state } = useLocation()

  const [ workout, setWorkout ] = useState<WorkoutSession | null>(null)
  const [ mostCommon, setMostCommon ] = useState<string | null>(null)
  const [ sessionState, setSessionState ] = useState<boolean>(true)
  const [ seconds, setSeconds ] = useState(0)
	const [ tab, setTab ] = useState(0)
  const [ setsCount, setSetsCount ] = useState(0)
  const [ restEndsAt, setRestEndsAt ] = useState<number | null>(null)
  const [ ascretain, setAscertain ] = useState(false)
  const startTime = useRef<number | null>(null)
  const elapsedTime = useRef(0)
  const sectionRef = useRef<HTMLElement | null>(null)

  const [ currentExercise, setCurrentExercise ] = useState(1)

  useEffect(() => {
    if (!sectionRef.current) return
    sectionRef.current.addEventListener("animationend", (e) => {
      if (e.animationName === "animateEnter") {
        sectionRef.current!.style.opacity = "1"
        sectionRef.current!.style.transform = "translateX(0)"
      }
    })
  }, [sectionRef])

  useEffect(() => {
    if (!state) return
    setWorkout(state.workout)
    console.log(state.workout)
  }, [])

  useEffect(() => {
    if (!sessionState) return

    startTime.current = Date.now() - elapsedTime.current
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startTime.current ? startTime.current : 0)
      elapsedTime.current = elapsed
      setSeconds(Math.floor(elapsed / 1000))
    }, 100)

    return () => clearInterval(interval)
  }, [sessionState])

  useEffect(() => {
    if (!workout) return
    const c = get_most_common(workout.exercises)
    if (c === "full_body") {
      setMostCommon("Całe ciało")
      return
    } else if (c === "abdominals") {
      setMostCommon("Brzuch")
      return
    }
    const legs = ['abductors', 'calves', 'glutes', 'hamstrings', 'quadriceps'] 
    if (legs.includes(c)) {
      setMostCommon("Nogi")
    } else {
      setMostCommon("Górna partia ciała")
    }
  }, [workout])

  useEffect(() => {
    if (!workout) return
    let s = 0
    workout.exercises.forEach((e) => {
      s += e.target_sets
    }) 
    setSetsCount(s)
  }, [workout])

  const minutes = Math.floor(seconds / 60)
  const sec = seconds % 60

  async function animateExit() {
    sectionRef.current?.classList.add("session-exit")
    sectionRef.current?.addEventListener("animationend", (e) => {
      if (e.animationName === "animateExit") {
        navigate(`/workout/${workout!.schema_id}/start`)
      }
    })
  }

  function handleNext_Previous(next: boolean) {
    if (next) {
      if (currentExercise !== Number(workout?.exercises.length)) {
        setCurrentExercise(prev => prev + 1)
      }
    } else {
      if (currentExercise - 1 !== 0) {
        setCurrentExercise(prev => prev - 1)
      }
    }
  }

  function setSet(id: string, field: keyof ExerciseSet, value: ExerciseSet[keyof ExerciseSet]) {
    setWorkout(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((exercise, index) => (
          index === currentExercise - 1 ? {
            ...exercise,
            sets: exercise.sets.map((set) => (
              set.id === id ? {...set, [field]: value} : set
            ))
          } : exercise
        ))
      }
    }) 
  }

  function completeSet(id: string) {
    const exercise = workout?.exercises[currentExercise - 1]
    const set = exercise?.sets.find(set => set.id === id)

    if (!set || !exercise || set.completed) return
    setSet(id, "completed", true)
    const duration = set.rest_seconds ?? exercise.rest_seconds ?? 90
    setRestEndsAt(seconds + duration)

    if (workout.exercises[currentExercise  - 1].sets.every(set => set.completed || set.id === id)) {
      if (currentExercise !== Number(workout.exercises.length)) {
        setCurrentExercise(prev => prev + 1)
      }
    }
  }

  const completedSets = () => {
    let completed = 0
    workout?.exercises.forEach((ex) => (
      completed += ex.sets.filter(set => set.completed).length ?? 0
    ))
    return completed
  }

  const completedExercises = workout?.exercises.filter((ex) => (
    ex.sets.every(set => set.completed)
  )).length ?? 0

  const remainingRest = restEndsAt === null ? 0 : Math.max(0, restEndsAt - seconds)
  const remainingMinutes = Math.floor(remainingRest / 60)
  const remainingSeconds = remainingRest % 60

  const exerciseSetsCompleted = () => {
    return workout?.exercises[currentExercise - 1].sets.filter(set => set.completed).length ?? 0
  } 

  const exercisesCount = workout?.exercises.length ?? 0

  const progress = exercisesCount > 0 ? Math.round(completedExercises / exercisesCount * 100) : 0

  async function endWorkout() {
    const token = localStorage.getItem("access-token")
    try {
      const res = await fetch(`${API_URL}/session/${workout?.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        body: JSON.stringify({
          exercises: workout?.exercises,
          finished: true
        })
      })
      if (!res.ok) alert("")
    } catch (e) {}
  }

  return (
    <section className="session-section container" ref={sectionRef}>
      { workout ? 
      <>
			<header className="session-header">
        <ReturnTo where="" onClick={animateExit} />
        <div className="session-header-info">
          <WorkoutLogo />
          <div className="session-header-i">
            <h2>{ workout.workout_name }</h2>
            <div className="session-header-i-i">
              { workout.weekday &&
              <div className="session-h-i-c">
                <IconCalendar stroke={2} />
                <span>{ parseDay(workout.weekday) }</span>
                <span>·</span>
              </div>}
              <div className="session-h-i-c">
                <span>{ mostCommon }</span>
                <span>·</span>
              </div>
              <div className="session-h-i-c">
                <span>~{ calculateDuration(workout) }min</span>
              </div>
            </div>
          </div>

          <div className="session-uptime">
            <div className="session-state-icon" style={{ background: sessionState ? "var(--accent-green)" : "var(--accent-yellow)" }}></div>
            <div className="session-state-text">
              <span>{ sessionState ? "Sesja w toku" : "Sesja przerwana" }</span>
              <p>{ String(minutes).padStart(2, "0") }:{ String(sec).padStart(2, "0") }</p>
            </div>      
            <div className="session-uptime-c" onClick={() => {setSessionState(prev => !prev)}}>
                { sessionState ? 
                <IconPlayerPause stroke={2} /> :
                <IconPlayerPlay stroke={2} />}
            </div>
          </div>
        </div>
        <div className="navigator">
          <div className="navigator-top">
            <span className="bold">Twój trening, krok po kroku</span>
            <span>{ "Ćwiczenie " + currentExercise + " z " + workout.exercises.length }</span>
          </div>
          <div className="exercise-steps">
            { workout.exercises.map((e) => (
              <button key={e.position} className={ currentExercise === Number(e.position) ? "exercise-step selected" : "exercise-step"} onClick={() => {setCurrentExercise(Number(e.position))}}>
                <div className="step-number">{ e.position }</div>
                <p className="step-name">{ e.exercise_name }</p>
              </button>
            ))}
          </div>
        </div>
      </header> 
      <main className="session-main">
        <section className="session-panel">
          <div className="exercise-top">
            <div className="exercise-title">
              <p>Ćwiczenie { String(currentExercise).padStart(2, "0") }</p>
              <h2>{ workout?.exercises[currentExercise - 1].exercise_name }</h2>
              <p>{ /* exercise's name translation */ }</p>
              <div className="exercise-tags">
                <div className="exercise-tag">
                  <IconTargetArrow stroke={2} />
                  <span>{ workout?.exercises[currentExercise - 1].muscle_group }</span>
                </div>
                {/* <div className="exercise-tag">
                  <IconTargetArrow stroke={2} />
                  <span>{ workout?.exercises[currentExercise - 1]. }</span> // equipment
                </div> */}
                <div className="exercise-tag">
                  <IconClock stroke={2} />
                  <span>{ workout?.exercises[currentExercise - 1].rest_seconds }s</span>
                </div>
              </div>
            </div>
            <div className="exercise-count">
              <span>{ String(currentExercise).padStart(2, "0") } </span> / { String(workout?.exercises.length).padStart(2, "0") }
            </div>
          </div>
          <div className="session-h">
            <img src={equipment_photos.dumbbell} alt="Panel photo" />
            <div className="controls">
              <span className="i-play">
                <IconPlayerPlay stroke={2} />
              </span>
              <span className="controls-text">
                <strong>Zobacz, jak wykonać ćwiczenie</strong>
                <span>Prawidłowa technika to podstawa</span>
              </span>
              <span className="i-chevron">
                <IconChevronRight stroke={2} />
              </span>
            </div>
            <span className="i-maximise">
              <IconMaximize stroke={2} />
            </span>
          </div>

					<div className="exercise-detail">
            <header className="detail-tabs">
              <motion.button onClick={() => {setTab(0)}} className={tab === 0 ? "tab active" : "tab"}>
                <IconLogs stroke={2} />
                <span>Serie i powtórzenia</span>
                <div className="detail-count">{ workout.exercises[currentExercise - 1].target_sets }</div>
                { tab === 0 && <motion.div className="tab-indicator" layoutId="tab" transition={{ type: "spring", stiffness: 800, damping: 40 }}></motion.div>}
              </motion.button>
              <motion.button onClick={() => {setTab(1)}} className={tab === 1 ? "tab active" : "tab"}>
                <IconHelpCircle stroke={2} />
                <span>Jak wykonać</span>
                { tab === 1 && <motion.div className="tab-indicator" layoutId="tab" transition={{ type: "spring", stiffness: 800, damping: 40 }}></motion.div>}
              </motion.button>
            </header>

            <main className="sets-content">
              <AnimatePresence>
                <div key={"sets-caption"} className="sets-caption">
                  <strong>{ workout.exercises[currentExercise - 1].target_sets } serie</strong>
                  <span> × </span>
                  <span>{ workout.exercises[currentExercise - 1].target_reps_min }-{workout.exercises[currentExercise - 1].target_reps_max } powtórzeń</span>
                </div>
                <div key={"sets-content"} className="sets-content">
                  <table className="sets-table">
                    <thead>
                      <tr className="table-header">
                        <th>Seria</th>
                        <th>Ciężar (kg)</th>
                        <th>Powtórzenia</th>
                        <th>Gotowe</th>
                      </tr>
                    </thead>
                    <tbody>
                      { workout.exercises[currentExercise - 1].sets.map((set) => (
                        <tr className={set.completed ? "set-row completed" : "set-row"} key={set.id}>
                          <td className="set-number"><span>{ set.set_number }</span></td>
                          <td><input className="set-weight" readOnly={set.completed} type="number" min={0} max={1000} value={set.weight_kg ?? ""} onChange={(e) => {setSet(set.id, "weight_kg", e.target.value === "" ? undefined : Number(e.target.value))}} /></td>
                          <td><input className="set-reps" readOnly={set.completed} type="number" min={1} max={500} value={set.reps ?? ""} onChange={(e) => {setSet(set.id, "reps", e.target.value === "" ? undefined : Number(e.target.value))}} /></td>
                          <td>
                            <button className="set-check" disabled={set.completed} onClick={() => {completeSet(set.id)}}>
                              <IconCheck stroke={2} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    
                  </table>
                </div>
              </AnimatePresence>
              <AnimatePresence>
                { remainingRest > 0 &&
                <motion.div className="rest-banner">
                  <IconClock stroke={2} width={24} height={24} />
                  <div>
                    <strong>Czas na oddech</strong>
                    <span>Odpocznij przed kolejną serią</span>
                  </div>
                  <span className="remaining-rest">{ String(remainingMinutes).padStart(2, "0") }:{ String(remainingSeconds).padStart(2, "0") }</span>
                  <button onClick={() => {setRestEndsAt(null)}}>
                    Pomiń
                    <IconChevronRight stroke={2} width={13} height={13} />
                  </button>
                </motion.div>}
              </AnimatePresence>
              <p className="sets-note">
                <IconBulb stroke={2} />
                <span>Dobierz ciężar tak, by ostatnie powtórzenia były wyzwaniem</span>
              </p>
            </main>
					</div>

          <footer className="exercise-footer">
            <button className="previous-b" disabled={currentExercise - 1 === 0} onClick={() => {handleNext_Previous(false)}}>
              <IconArrowNarrowLeft stroke={2} width={16} height={16} />
              Poprzednie
            </button>
            <span>{ exerciseSetsCompleted() } z { workout.exercises[currentExercise - 1].sets.length } serii ukończone</span>
            <button className="next-b" disabled={currentExercise === Number(workout?.exercises.length)} onClick={() => {handleNext_Previous(true)}}>
              Następne ćwiczenie
              <IconChevronRight stroke={2} width={16} height={16} />
            </button>
          </footer>
        </section>
									
        <aside className="session-aside">
          <section id="progress">
            <strong className="progress-header">Postęp treningu</strong>
            <div className="progress-body">
              <div className="progress-ring">
                <svg viewBox="0 0 110 110">
                  <circle className="ring-track" cx={55} cy={55} r={47}></circle>
                  <circle className="ring-value" cx={55} cy={55} r={47} pathLength={100} strokeDasharray={`${progress}, 100`}></circle>
                </svg>
                <div>
                  <strong>{ progress }<span>%</span></strong>
                  <span>ukończono</span>
                </div>
              </div>  
              <div className="progress-stats">
                <div>
                  <IconBarbell stroke={2} style={{ rotate: "45deg" }}/>
                  <p>
                    <strong>{ completedExercises } <span>/ { workout?.exercises.length }</span></strong>
                    <span>ćwiczeń</span>
                  </p>
                </div>
                <div>
                  <IconClock stroke={2} />
                  <p>
                    <strong>{ minutes }<span> min</span></strong>
                    <span>czas treningu</span>
                  </p>
                </div>
                <div>
                  <IconCheck stroke={2} />
                  <p>
                    <strong>{ completedSets() } <span>/ { setsCount }</span></strong>
                    <span>ukończonych serii</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="plan">
            <div className="plan-heading">
              <strong>Plan treningu</strong>
							<small>{ getExerciseLabel(workout!.exercises) }</small>
            </div>
            <div className="plan-list">
							{ workout?.exercises.map((exercise) => (
								<button key={exercise.position} className={currentExercise === Number(exercise.position) ? "plan-item plan-active" : "plan-item"} onClick={() => {setCurrentExercise(Number(exercise.position))}}>
									<span className="plan-position">{ exercise.position }</span>
									<img src={ exercise.image_url } alt="" />
									<span className="plan-item-text">
										<strong>{ exercise.exercise_name }</strong>
										<span>{ exercise.target_sets } serie · { exercise.target_reps_min }-{ exercise.target_reps_max } powt.</span>
									</span>
									{ currentExercise === Number(exercise.position) ? <span className="active-dot"></span> : <IconChevronRight className="plan-chevron" stroke={2} />}
								</button>
							))}
            </div>
						<div className="plan-total">
							<IconClock stroke={2} />
							<span>Szacowany czas</span>
							<strong>~{ calculateDuration(workout) }min</strong>
						</div>
          </section>

          <button className="finish-workout" onClick={() => {setAscertain(true)}}>
            <IconFlag stroke={2} width={22} height={22} />
            <span>Zakończ trening</span>
          </button>
        </aside>
      </main>
			</>
			:
      <></>}
      <Dialog.Root open={ascretain}>
        <AnimatePresence>
          { ascretain && 
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div className="d-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}></motion.div>
              </Dialog.Overlay>
              <div className="dialog-wrapper">
                <Dialog.Content className="d-content" asChild forceMount>
                  <motion.div initial={{ transform: "scale(0.95)", opacity: 0 }} 
                  animate={{ transform: "scale(0.95)", opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <header className="d-header">
                      <Dialog.Close className="dialog-close" onClick={() => {setAscertain(false)}}>
                        <IconX stroke={2} />
                      </Dialog.Close>
                      <div className="d-flag">
                        <IconFlag stroke={2} width={32} height={32} />
                      </div>
                      <div className="d-i-h">
                        <h2>Zakończyć trening?</h2>
                        <p>Świetna robota! Zanim zakończysz, sprawdź swoje postępy</p>
                      </div>
                    </header>
                    <main>
                      <div className="x">
                        <IconBarbell stroke={2} width={32} height={32} />
                        <strong>{ completedExercises } / { workout?.exercises.length }</strong>
                        <span>Ukończone ćwiczenia</span>
                      </div>
                      <div className="x">
                        <IconStack2 stroke={2} width={32} height={32} />
                        <strong>{ completedSets() } / { setsCount }</strong>
                        <span>Ukończone serie</span>
                      </div>
                    </main>
                    <footer>
                      <button className="e" onClick={endWorkout}>Zakończ trening</button>
                      <button className="r" onClick={() => {setAscertain(false)}}>Wróć do treningu</button>
                    </footer>
                  </motion.div>
                </Dialog.Content>
              </div>
            </Dialog.Portal>}
        </AnimatePresence>
      </Dialog.Root>
    </section>
  )
}