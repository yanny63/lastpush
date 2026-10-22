import { IconBarbell, IconBolt, IconChevronRight, IconFilter, IconFlame, IconProgressDown, IconSearch, IconStack2 } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom'
import "../css/newWorkout.css"
import { AnimatePresence, motion } from "framer-motion";

interface Exercise {
  id: number,
  name: string,
  muscle_group: string,
  equipment: string,
  movement_type: string,
  is_compound: boolean,
  description?: string
}

interface ExerciseInfo {
  count: number
}

type Muscles = "all" | "chest" | "back" | "legs" | "shoulders" | "arms" 

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
      const res = await fetch(`http://192.168.1.33:8000/api/exercises?startId=${currentId}`)
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

  async function submitWorkout() {
    
  }

  async function changePortalVisibility(e: React.MouseEvent) {
    e.preventDefault()
    setPortalVisible(true)
  }

  function setPortalHidden(e: React.MouseEvent) {
    if ((e.target as Element).closest(".exercises-portal")) {
      return
    }
    setPortalVisible(false)
  }

  const [ exerciseInfo, setExerciseInfo ] = useState<ExerciseInfo | null>(null)

  async function getExerciseInfo() {
    try {
      const res = await fetch("http://192.168.1.33:8000/api/exercises/info")
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

  const [ musclesFilter, setMusclesFilter ] = useState<Muscles>("all")
  const [ currentSearch, setCurrentSearch ] = useState<string>("")

  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const legsV = ["calves", "glutes", "hamstrings", "quadriceps"]

  const filtered = exercises.filter((ex) => {
    const q = normalize(currentSearch)
    let matchesMuscles
    if (musclesFilter === "legs") {
      matchesMuscles = legsV.includes(normalize(ex.muscle_group))
    } else matchesMuscles = musclesFilter == "all" || normalize(ex.muscle_group) === musclesFilter
    const matchesSearch = normalize(ex.name).includes(q) || normalize(ex.muscle_group).includes(q) || normalize(ex.equipment).includes(q)
    return matchesMuscles && matchesSearch
  })
  

  const overlay = (<AnimatePresence>
    <motion.div key={"portal"} className={portalVisible ? "portal portal-visible" : "portal"} initial={{ opacity: 0 }} animate={{ opacity: 1}} transition={{ duration: 0.1 }} onClick={setPortalHidden}>
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
              <select id="movement-type">
                <option value={"all"}>Typ ruchu: Wszystkie</option>
                <option value={"push"}>Push</option>
                <option value={"pull"}>Pull</option>
              </select>
              <select id="movement-complexity">
                <option value={"all"}>Złożoność: Wszystkie</option>
                <option value={"compound"}>Wielostawowe</option>
                <option value={"isolation"}>Izolowane</option>
              </select>
            </div>
          </div>
          <main className="exercises">
            { filtered.map((exercise) => (
              <div key={exercise.id} className="exercise" onClick={() => {}}>
                <div className="exercise-left-i">
                  <div className="exercise-h-con">
                    <h3 className="exercise-h">{ exercise.name }</h3>
                    { exercise.is_compound ? <p className="compound">Wielostawowe</p> : <p className="isolation">Izolowane</p>}
                  </div>
                  <div className="e-tags">
                    <span className="tag"><IconFlame stroke={1} className="tag-svg-f" /> { exercise.muscle_group }</span>
                    <span className="tag"><IconBolt stroke={1} className="tag-svg-s" /> { exercise.movement_type }</span>
                    <span className="tag"><IconStack2 stroke={1} /> { exercise.equipment }</span>
                  </div>
                </div>
                <div className="exercise-right-i">
                  <button className="add-to-plan">Dodaj do planu</button>
                  <IconChevronRight stroke={2} className="exercise-see-more" />
                </div>
              </div>
            ))}
            <div ref={scrollRef} style={{ minHeight: "1px", visibility: "hidden" }}>a</div>
          </main>
        </div>
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
          <input className="newWorkout-input" type="text" id="workout-name" required />
          <p>Partie mięśniowe</p>
          <div className="body-parts">
            <button className="add-exercise-parts" onClick={changePortalVisibility}>+ Dodaj</button>
          </div>
          <div className="added-exercises">
            <div className="exercises-header">
              <h3>Ćwiczenia</h3>
              <p className="exercise-count">0 ćwiczeń</p>
            </div>
            <button className="add-exercise" onClick={changePortalVisibility}>+ Dodaj ćwiczenie</button>
          </div>
          <div className="estimated-time-save">
            <div className="estimated-con">
              <p>SZACOWANY CZAS</p>
              <p className="estimated-time">55-65 min</p>
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