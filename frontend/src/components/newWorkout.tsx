import { IconBarbell, IconBolt, IconChevronRight, IconFlame, IconStack2 } from "@tabler/icons-react";
import React, { useState } from "react";
import ReactDOM from 'react-dom'
import "../css/newWorkout.css"
import { AnimatePresence, motion } from "framer-motion";

export default function newWorkout() {
  interface Exercise {
    id: number,
    name: string,
    muscle_group: string,
    equipment: string,
    movement_type: string,
    is_compound: boolean,
    description?: string
  }

  const fullScreenOverlay = (children: React.ReactNode) => {
    return ReactDOM.createPortal(children, document.body)
  }

  const [ currentId, setCurrentId ] = useState<number>(1)
  const [ exercises, setExercises ] = useState<Array<Exercise>>([])
  const [ portalVisible, setPortalVisible ] = useState(false)

  async function getExercises() {
    const res = await fetch(`http://192.168.1.33:8000/api/exercises?startId=${currentId}`)
    if (!res.ok) {
      throw new Error("Nie udało się pobrać ćwiczeń")
    }
    const data = await res.json()
    const e : Array<Exercise> = data.exercises 
    setExercises(prev => [...prev, ...e])
  }

  async function submitWorkout() {
    
  }

  async function changePortalVisibility(e: React.MouseEvent) {
    e.preventDefault()
    setPortalVisible(true)
    await getExercises()
  }

  const overlay = (<AnimatePresence>
    <motion.div className={portalVisible ? "portal portal-visible" : "portal"} initial={{ opacity: 0 }} animate={{ opacity: 1}} transition={{ duration: 0.1 }} onClick={() => {setPortalVisible(false)}}>
        <div className="exercises-portal">
          <header className="exercises-portal-h">
            <div className="dumbbell-icon">
              <IconBarbell stroke={2} />
            </div>
            <div>
              <h2>Katalog Ćwiczeń</h2>
              <p className="greyish">Skonfiguruj swój plan i dopasuj ruchy pod cel</p>
            </div>
            <p className="downloaded">Pobrano: { exercises.length }</p>
          </header>
          <main className="exercises">
            { exercises.map((exercise) => (
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
      {/* <div className={portalVisible ? "portal portal-visible" : "portal"}>
        <div className="exercises-portal">
          <header className="exercises-portal-h">
            <h2>Ćwiczenia</h2>
            <p>Pobrano: { exercises.length }</p>
          </header>
          <main className="exercises">
            { exercises.map((exercise) => (
              <div key={exercise.id} className="exercise" onClick={() => {}}>
                <div className="exercise-left-i">
                  <h4 className="exercise-h">{ exercise.name }</h4>
                  <p>{ exercise.description }</p>
                </div>
                <div className="exercise-right-i">
                  <p>{ exercise.muscle_group }</p>
                  <p>Typ ruchu: { exercise.movement_type }</p>
                  { exercise.is_compound && <p className="compound">Wielostawowe</p>}
                </div>
              </div>
            ))}
          </main>
        </div>
      </div> */}
    </section>
  )
}