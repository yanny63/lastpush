import { IconBarbell, IconBolt, IconCheck, IconChevronRight, IconFilter, IconFlame, IconProgressDown, IconSearch, IconStack2, IconTrash, IconX } from "@tabler/icons-react";
import ReactDOM from 'react-dom'
import "../css/newWorkout.css"
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_BACKEND_ADDRESS

interface Exercise {
  id: number,
  name: string,
  muscle_group: string,
  equipment: string,
  movement_type: string,
  is_compound: boolean,
  description?: string,
  sets?: number,
  reps?: string
  rest_seconds?: number
}

interface ExerciseInfo {
  count: number
}

interface ErrorData {
  detail: string
}

type Muscles = "all" | "chest" | "back" | "legs" | "shoulders" | "arms" 
type Movement = "all" | "push" | "pull"
type Complexity = "all" | "compound" | "isolation"

export default function newWorkout() {
  const fullScreenOverlay = (children: React.ReactNode) => {
    return ReactDOM.createPortal(children, document.body)
  }

  const [ currentId, setCurrentId ] = useState<number>(0)
  const [ exercises, setExercises ] = useState<Array<Exercise>>([])
  const [ portalVisible, setPortalVisible ] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [ loading, setLoading ] = useState(false)

  async function getExercises() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/exercises?startId=${currentId}`)
      const data = await res.json()
      const e : Array<Exercise> = data.exercises 
      setExercises(prev => [...prev, ...e])
      setCurrentId(prev => prev + 20)
    }
    catch (e) {
      console.log("Nie udało się pobrać ćwiczeń")
    }
    finally {
      setLoading(false)
    }
  } 

  const navigate = useNavigate()

  async function submitWorkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const token = localStorage.getItem("access-token")
    try {
      const res = await fetch(`${API_URL}/saveWorkout`, {
        method: "POST",
        headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
        body: JSON.stringify({
          name: workoutName,
          exercises: selectedExercises
        })
      })
      if (!res.ok) {
        const data : ErrorData = await res.json() 
        throw new Error(data.detail)
      }
      setSelectedExercises([])
      setWorkoutName("")
      navigate("/trening", )
    } catch (e) {
      
    }
  }

  async function changePortalVisibility(e: React.MouseEvent) {
    e.preventDefault()
    setPortalVisible(true)
  }

  function setPortalHidden(e: React.MouseEvent) {
    if ((e.target as Element).closest(".exercises-portal") || (e.target as Element).closest(".exercise-details-c")) {
      return
    }
    setPortalVisible(false)
  }

  const [ exerciseInfo, setExerciseInfo ] = useState<ExerciseInfo | null>(null)

  async function getExerciseInfo() {
    try {
      const res = await fetch(`${API_URL}/api/exercises/info`)
      const data : ExerciseInfo = await res.json()
      setExerciseInfo(data)
    }
    catch (e) {
      console.log("Nie udało się pobrać informacji o ćwiczeniach")
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(async (entries) => {
      const observed = entries[0]
      if (observed.isIntersecting) {
        await loadExercises()
      }
    }, {threshold: 1.0})
    
    if (scrollRef.current) {
      observer.observe(scrollRef.current)
    }

    return () => {if (scrollRef.current) observer.unobserve(scrollRef.current)}

  }, [loading, portalVisible, currentId])

  async function loadExercises() {
    if (currentId >= exerciseInfo!.count) return
    await getExercises()
  }

  useEffect(() => {
    getExerciseInfo()
    getExercises()
  }, [])

  const searchRef = useRef<HTMLInputElement | null>(null)

  const [ selectedExercises, setSelectedExercises ] = useState<Array<Exercise>>([])

  function addExercise(exercise: Exercise) {
    setSelectedExercises(prev => [...prev, exercise])
  }

  function removeExercise(exercise: Exercise) {
    setSelectedExercises(prev => prev.filter(e => e.id !== exercise.id))
  }

  const [ workoutName, setWorkoutName ] = useState<string>("")
  const [ musclesFilter, setMusclesFilter ] = useState<Muscles>("all")
  const [ currentSearch, setCurrentSearch ] = useState<string>("")
  const [ movementType, setMovementType ] = useState<Movement>("all")
  const [ complexityType, setComplexityType ] = useState<Complexity>("all")

  const translations: Record<string, string> = {
    "chest": "Klata",
    "back": "Plecy",
    "quadriceps": "Czworogłowy",
    "hamstrings": "Dwugłowe",
    "calves": "Łydki",
    "glutes": "Pośladi",
    "shoulders": "Barki",
    "triceps": "Triceps",
    "biceps": "Biceps",
    "abdominals": "Brzuch",
    "full_body": "Full body",
    "barbell": "Sztanga",
    "bodyweight": "Masa ciała",
    "dumbbell": "Hantle",
    "cable": "Wyciąg",
    "machine": "Maszyny"
  }

  const normalize = (s: string | undefined) => (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const legsV = ["calves", "glutes", "hamstrings", "quadriceps"]
  const armsV = ["triceps", "biceps"]

  const filtered = exercises.filter((ex) => {
    const q = normalize(currentSearch)
    let matchesMuscles

    let selected = selectedExercises.includes(ex)

    let matchesMovement = movementType === "all" || movementType === ex.movement_type

    let complexity = ex.is_compound ? "compound" : "isolation"
    let matchesComplexity = complexityType === "all" || complexityType === complexity

    if (musclesFilter === "arms") {
      matchesMuscles = armsV.includes(normalize(ex.muscle_group))
    }
    else if (musclesFilter === "legs") {
      matchesMuscles = legsV.includes(normalize(ex.muscle_group))
    } else matchesMuscles = musclesFilter == "all" || normalize(ex.muscle_group) === musclesFilter
    const matchesSearch = normalize(ex.name).includes(q) || normalize(ex.muscle_group).includes(q) || normalize(ex.equipment).includes(q) 
    || normalize(translations[ex.muscle_group]).includes(q) || normalize(translations[ex.equipment]).includes(q)
    return matchesMuscles && matchesSearch && matchesComplexity && matchesMovement && !selected
  })

  const targetedMuscles = [... new Set(selectedExercises.map((e) => (e.muscle_group)))]

  const estimatedTime = useMemo(() => {
  const minSet = 1
  const maxSet = 1.5

  let min = 0
  let max = 0

  selectedExercises.forEach((e) => {
    const sets = Number(e.sets) || 0
    if (sets <= 0) return

    const rest = (Number(e.rest_seconds) || 0) / 60
    const restTime = Math.max(0, sets - 1) * rest
    min += sets * minSet + restTime
    max += sets * maxSet + restTime
  })

  if (max === 0) return "0 min"

  return min === max ? `${Math.round(max)} min` : `${Math.round(min)}-${Math.round(max)} min`
}, [selectedExercises])

  const updateExercise = (id: number, field: 'sets' | 'reps' | 'rest_seconds', value: number | string) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          return { ...ex, [field]: value };
        }
        return ex;
      })
    )
  }

  useEffect(() => {
    const handleKDown = (e: WindowEventMap["keydown"]) => {
      if (e.key === "Escape") {
        setPortalVisible(false)
        setCurrentExerciseOpen(null)
        setIsInfoOpen(false)
      }
    }

    window.addEventListener("keydown", handleKDown)

    return () => window.removeEventListener("keydown", handleKDown)
  }, [])

  const [ currentExerciseOpen, setCurrentExerciseOpen ] = useState<Exercise | null>(null)
  const [ isInfoOpen, setIsInfoOpen ] = useState(false)

  function aE() {
    if (!currentExerciseOpen) return
    addExercise(currentExerciseOpen)
    setCurrentExerciseOpen(null)
    setIsInfoOpen(false)
  }

  const exerciseDetails = (<AnimatePresence>
    <motion.div className="exercise-details-portal" key={"p"} initial={{ opacity: 0 }} animate={{ opacity: 1}} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
      <div className="exercise-details-c">
        <header className="exercise-details-header">
          <div>
            <p className="exercise-details-p">Szczegóły ćwiczenia</p>
            <h2 className="exercise-details-h">{ currentExerciseOpen?.name }</h2>
          </div>
          <button className="exercise-details-close" onClick={() => {setCurrentExerciseOpen(null), setIsInfoOpen(false)}}><IconX stroke={1} /></button>
        </header>
        <main className="exercise-details-m">
          <p className="exercise-details-d">{ currentExerciseOpen?.description }</p>
          <div className="exercise-details">
            <div className="exercise-detail">
              <span>Docelowa grupa:</span>
              <p>{currentExerciseOpen?.muscle_group ? translations[currentExerciseOpen.muscle_group] : "Nieznana" }</p>
            </div>
            <div className="exercise-detail">
              <span>Wymagany sprzęt:</span>
              <p>{ currentExerciseOpen?.equipment ? translations[currentExerciseOpen.equipment] : "Nieznany"}</p>
            </div>
            <div className="exercise-detail">
              <span>Wektor ruchu:</span>
              <p className="m">{ currentExerciseOpen?.movement_type }</p>
            </div>
            <div className="exercise-detail">
              <span>Ruch:</span>
              { currentExerciseOpen?.is_compound ? <p className="c">Wielostawowe</p> : <p className="i">Izolowane</p> }
            </div>
          </div>
        </main>
        <button className="add-exercise" onClick={aE}>+ Dodaj do planu treningowego</button>
      </div>
    </motion.div>
  </AnimatePresence>)

  const overlay = (<AnimatePresence>
    <motion.div key={"portal"} className={portalVisible ? "portal portal-visible" : "portal"} initial={{ opacity: 0 }} animate={{ opacity: 1}} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={setPortalHidden}>
        <div className="exercises-portal">
          <header className="exercises-portal-h">
            <div className="dumbbell-icon">
              <IconBarbell stroke={2} />
            </div>
            <div>
              <h2>Katalog Ćwiczeń</h2>
              <p className="greyish">Skonfiguruj swój plan i dopasuj ruchy pod cel</p>
            </div>
            <p className="downloaded"><IconProgressDown stroke={2} /> Pobrano: { exercises.length } z { exerciseInfo?.count } </p>
          </header>
          <div className="filter-search-con">
            <div className="search-con">
              <IconSearch stroke={1} />
              <input type="text" ref={searchRef} id="search" value={currentSearch} onChange={(e) => {setCurrentSearch(e.target.value)}} placeholder="Szukaj ćwiczenia, grupy mięsniowej lub sprzętu..." />
            </div>
            <div className="filter-buttons">
              <span className="muscles"><IconFilter stroke={1} /> Mięśnie: </span>
              <button className={musclesFilter === "all" ? "muscles-button active-all" : "muscles-button"} onClick={() => {setMusclesFilter("all")}}>Wszystkie</button>
              <button className={musclesFilter === "chest" ? "muscles-button active" : "muscles-button"} onClick={() => {setMusclesFilter("chest")}}>Klatka piersiowa</button>
              <button className={musclesFilter === "back" ? "muscles-button active" : "muscles-button"} onClick={() => {setMusclesFilter("back")}}>Plecy</button>
              <button className={musclesFilter === "legs" ? "muscles-button active" : "muscles-button"} onClick={() => {setMusclesFilter("legs")}}>Nogi</button>
              <button className={musclesFilter === "shoulders" ? "muscles-button active" : "muscles-button"} onClick={() => {setMusclesFilter("shoulders")}}>Barki</button>
              <button className={musclesFilter === "arms" ? "muscles-button active" : "muscles-button"} onClick={() => {setMusclesFilter("arms")}}>Ramiona</button>
            </div>
            <div className="filter-selects">
              <select id="movement-type" value={movementType} onChange={(e) => {setMovementType(e.target.value as Movement)}}>
                <option value={"all"}>Typ ruchu: Wszystkie</option>
                <option value={"push"}>Push</option>
                <option value={"pull"}>Pull</option>
              </select>
              <select id="movement-complexity" value={complexityType} onChange={(e) => {setComplexityType(e.target.value as Complexity)}}>
                <option value={"all"}>Złożoność: Wszystkie</option>
                <option value={"compound"}>Wielostawowe</option>
                <option value={"isolation"}>Izolowane</option>
              </select>
            </div>
          </div>
          <main className="exercises">
            { filtered.map((exercise) => (
              <div key={exercise.id} className="exercise" onClick={(e) => {if ((e.target as Element).closest(".add-to-plan")) return; setCurrentExerciseOpen(exercise), setIsInfoOpen(true)}}>
                <div className="exercise-left-i">
                  <div className="exercise-h-con">
                    <h3 className="exercise-h">{ exercise.name }</h3>
                    { exercise.is_compound ? <p className="compound">Wielostawowe</p> : <p className="isolation">Izolowane</p>}
                  </div>
                  <div className="e-tags">
                    <span className="tag"><IconFlame stroke={1} className="tag-svg-f" /> { translations[exercise.muscle_group] }</span>
                    <span className="tag"><IconBolt stroke={1} className="tag-svg-s" /> { exercise.movement_type }</span>
                    <span className="tag"><IconStack2 stroke={1} /> { translations[exercise.equipment] }</span>
                  </div>
                </div>
                <div className="exercise-right-i">
                  <button className="add-to-plan" onClick={() => {addExercise(exercise)}}>Dodaj do planu</button>
                  <IconChevronRight stroke={2} className="exercise-see-more" />
                </div>
              </div>
            ))}
            <div ref={scrollRef} style={{ minHeight: "1px", visibility: "hidden" }}>a</div>
          </main>
        </div>
        { isInfoOpen && exerciseDetails}
      </motion.div>
  </AnimatePresence>)

  return (
    <section className="newWorkout-s container">
      <header className="newWorkout-h">
        <div className="newWorkout-h-r">
          <h1>Utwórz plan</h1>
          <p className="greyish">Skonfiguruj swój trening.</p>
        </div>
        <div className="newWorkout-h-l">
          <IconBarbell stroke={2} />
        </div>
      </header>
      <main>
        <form className="newWokrout-m" onSubmit={submitWorkout}>
          <p>Nazwa treningu</p>
          <input className="newWorkout-input" type="text" id="workout-name" value={workoutName} onChange={(e) => {setWorkoutName(e.target.value)}} required />
          <p>Partie mięśniowe</p>
          <div className="body-parts">
            { targetedMuscles.map((t) => (
              <div className="body-part" key={t}>
                <IconCheck stroke={2} />
                <span>{ translations[t] }</span>
              </div>
            ))}
            <button className="add-exercise-parts" onClick={changePortalVisibility}>+ Dodaj</button>
          </div>
          <div className="added-exercises">
            <div className="exercises-header">
              <div>
                <h3>Ćwiczenia</h3>
                <span className="exercise-count">{ selectedExercises.length }</span>
              </div>
              <p className="estimated-t-h">{ estimatedTime }</p>
            </div>
            { selectedExercises.map((exercise, i) => (
              <div className="selected-exercise" key={exercise.id}>
                <div className="selected-exercise-upper">
                  <span className="exercise-count">#{ i + 1 }</span>
                  <div className="selected-info">
                    <h2>{ exercise.name }</h2>
                    <p className="selected-tags">
                      <span className={exercise.is_compound ? "compound" : "isolation"}>{ exercise.is_compound ? "Wielostawowe" : "Izolowane" }</span>
                      <span className="tag">{ translations[exercise.muscle_group] }</span>
                      <span className="tag">{ translations[exercise.equipment] }</span>
                    </p>
                  </div>
                  <button className="remove-exercise" onClick={(e) => {e.preventDefault(), removeExercise(exercise)}}><IconTrash stroke={2} /></button>
                </div>
                <div className="selected-exercise-lower">
                  <div className="selected-border-con">
                    <span>Serie: </span>
                    <input type="number" className="selected-input" onChange={(e) => {updateExercise(exercise.id, "sets", Number(e.target.value))}} placeholder="3" min={0} max={8} />
                  </div>
                  <div className="selected-border-con">
                    <span>Powtórzenia: </span>
                    <input type="text" className="selected-input reps" onChange={(e) => {updateExercise(exercise.id, "reps", e.target.value)}} placeholder="10-12" maxLength={7} />
                  </div>
                  <div className="selected-border-con">
                    <span>Przerwa: </span>
                    <input type="number" className="selected-input" onChange={(e) => {updateExercise(exercise.id, "rest_seconds", Number(e.target.value))}} placeholder="90" maxLength={4} />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-exercise" onClick={changePortalVisibility}>+ Dodaj ćwiczenie</button>
          </div>
          <div className="estimated-time-save">
            <div className="estimated-con">
              <p>SZACOWANY CZAS</p>
              <p className="estimated-time">{ estimatedTime }</p>
            </div>
            <button type="submit" className="save-workout">Zapisz plan</button>
          </div>
        </form>
      </main>
      { portalVisible && 
      fullScreenOverlay(overlay)
      }
    </section>
  )
}