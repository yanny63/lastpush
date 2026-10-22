import { IconBarbell, IconCalendarPlus, IconChartBar, IconHistory, IconPlus, IconTrophy } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/trening.css"

export default function Trening() {
  const navigate = useNavigate()
  return (
    <section className="trening-main-con container">
      <header className="trening-header">
        <div className="t-header-l">
          <p className="greyish">Twoja przestrzeń</p>
          <h1>Trening</h1>
        </div>
        <div className="t-header-r">
          <div className="blue-bg">
            <IconBarbell stroke={2} className="green" />
          </div>
        </div>
      </header>

      <main className="trening-main">
        <div className="blue-bg">
          <IconCalendarPlus stroke={2} className="green" />
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
    </section>
  )
}