import { IconArrowNarrowRight, IconArrowUpRight, IconBarbell, IconCalendarPlus, IconChartBar, IconDots, IconHistory, IconPlus, IconTrophy } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/trening.css"
import { type Workout } from "../utils/workout"
const API_URL = import.meta.env.VITE_BACKEND_ADDRESS

interface NextWorkout {
  id: string,
  name: string,
  created_at: string,
  updated_at: string,
  weekday: number
}

interface TrainingI {
  workout: Workout[],
  next_workout: NextWorkout
}

export default function Trening() {
  function NoWorkouts() {
    return (
      <>
        <header className="trening-header">
          <div className="t-header-l">
            <p className="greyish">Twoja przestrzeń</p>
            <h1>Trening</h1>
          </div>
          <div className="t-header-r">
            <div className="blue-bg">
              <IconBarbell stroke={2} />
            </div>
          </div>
        </header>

        <main className="trening-main">
          <div className="blue-bg">
            <IconCalendarPlus stroke={2} />
          </div>
          <h1>Zacznij swoją przygodę</h1>
          <p className="greyish">Nie masz jeszcze żadnych treningów. Stwórz swój pierwszy plan i zacznij śledzić postępy</p>
          <button onClick={() => {navigate("/newWorkout")}} className="create-workout-plan">
            <IconPlus className="plus" stroke={4} width={14} height={14} /> 
            <span>Utwórz plan treningowy</span>
          </button>
        </main>

        <footer className="trening-footer">
          <div className="trening-f-inner">
            <div className="t-footer-element">
              <IconChartBar stroke={2} />
              <p>Śledź postępy</p>
            </div>
            <div className="t-footer-element">
              <IconTrophy stroke={2} />
              <p>Bij rekordy</p>
            </div>
            <div className="t-footer-element">
              <IconHistory stroke={2} />
              <p>Buduj historię</p>
            </div>
          </div>
        </footer>
      </>
    )
  }

  const [ workouts, setWorkouts ] = useState<Array<Workout> | null>(null)
  const [ nextWorkout, setNextWorkout ] = useState<NextWorkout | null>(null)

  async function checkAvailability() {
    const token = localStorage.getItem("access-token")
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/workouts`, {
        headers: {"Authorization": `Bearer ${token}`}
      })
      if (!res.ok) {
        throw new Error("Nie udało się pobrać treningów")
      }
      const data : TrainingI = await res.json()
      
      setWorkouts(data.workout)
      if (data.next_workout) {
        setNextWorkout(data.next_workout)
      }
    } catch (e) {
      console.log(e)
    }
  } 

  function getNext(weekday: number) {
    const today = new Date().getDay()
    const target = weekday % 7
    let diff = (target - today + 7) % 7
    if (diff === 0) return "Dzisiaj"
    if (diff === 1) return "Jutro"
    return `Za ${diff} dni`
  }

  function nextWorkoutExercises_Duration() {
    if (!nextWorkout) return

    const workout = workouts?.filter(w => w.id === nextWorkout.id)[0]
    if (!workout) return
    const length = workout.exercises.length
    let duration = 0
    workout.exercises.forEach((exercise) => {
      const sets = exercise.target_sets // 3
      const rest = exercise.rest_seconds / 60 // 180
      duration = duration + (sets - 1) * rest + sets * 1
    })

    duration = Math.round(duration)

    const v = [2, 3, 4]
    const lengthString = length === 1 ? `${length} ćwiczenie` : v.includes(length) ? `${length} ćwiczenia` : `${length} ćwiczeń`

    return `${lengthString} · około ${duration} min`
  }

  function t() {
    if (!workouts?.length) return 0
    const o = 1 
    const v = [2, 3, 4]
    if (workouts.length === o) {
      return o
    } else if (v.includes(workouts.length)) {
      return 2
    } else {
      return 5
    }
  }

  function openAlterWorkoutModal(id: string) {

  }

  function Workouts() {
    return (
      <div className="workouts-i">
        <header className="workouts-h">
          <div className="t-header-l-w">
            <div className="blue-bg">
              <IconBarbell stroke={2} />
            </div>
            <div>
              <p className="greyish">Twoja przestrzeń</p>
              <h1>Twoje treningi</h1>
              <span>Zarządzaj swoimi planami treningowymi</span>
            </div>
          </div>
          <div className="t-header-r">
            <button className="blue-bg button">+ Nowy trening</button>
          </div>
        </header>
        <main className="trening-main">
          <div className="s">
            <div className="s-t">
              <h3>{ workouts?.length ?? 0}</h3>
              <span>{t() === 1 ? "Trening" : t() === 2 ? "Treningi" : "Treningów"}</span>
            </div>
            <div className="s-t">
              <h3>12</h3>
              <span>Sesji w miesiącu</span>
            </div>
            <div className="s-t">
              <h3>3/4</h3>
              <span>Cel w tygodniu</span>
            </div>
          </div>

          <div className="n-t">
            { nextWorkout ? 
            <>
              <div className="n-t-h">
                <h3>Następny trening</h3>
                <span>{ getNext(nextWorkout.weekday) }</span>
              </div>
              <div className="t">
                <div className="t-inner">
                  <div className="blue-bg">
                    <IconBarbell stroke={2} />
                  </div>
                  <div className="">
                    <p>{ nextWorkout.name }</p>
                    <span className="greyish">
                      { nextWorkoutExercises_Duration() }
                    </span>
                  </div>
                  <IconArrowUpRight stroke={2} className="t-svg" onClick={() => {openAlterWorkoutModal(nextWorkout.id)}} />
                </div>
                <button className="blue-bg button" onClick={() => {navigate(`/workout/${nextWorkout.id}/start`)}}>Rozpocznij trening</button>
              </div>
            </> : 
            <div className="t">
              <h2 className="t-n-w">Tutaj pojawią się twoje następne treningi</h2>
            </div>
            }

            <div className="n-t-h">
              <h3>Zapisane treningi</h3>
              <span className="s-a">Zobacz wszystkie</span>
            </div>
            <div className="ws">
              { workouts?.map((workout) => (
                <div className="w" key={workout.id}>
                  <header className="w-h">
                    <div className="i">
                      { /* dodac customisable ikonki do treningow */ }
                    </div>
                    <div className="w-svg">
                      <IconDots stroke={2} />
                    </div>
                  </header>
                  <main className="w-m">
                    <h3>{ workout.name }</h3>
                    { /* Partie miesniowe */ }
                  </main>
                  <footer className="w-f">
                    <span className="greyish">{ workout.exercises.length } ćwiczenia</span>
                    <button className="b-o">Otwórz <IconArrowNarrowRight stroke={1} /></button>
                  </footer>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  useEffect(() => {
    checkAvailability()
  }, [])

  const navigate = useNavigate()
  return (
    <section className="trening-main-con container">
      { workouts ? <Workouts /> : <NoWorkouts />}
    </section>
  )
}