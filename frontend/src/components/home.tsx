import logApp from "../images/log-app.png";
import React, { useState, useEffect, useRef } from "react";
function FirstHomeSection({ ref }: {ref: React.RefObject<HTMLDivElement | null>}) {
  return (
    <section className="home-section" id="home">
      <div ref={ref} className="container">
        <div className="header-btn-container">
          <a className="download-button" download={""}>
            <span>Zainstaluj na Android/iOS</span>
          </a>
          <div className="home-header">
            <p className="header-text">Zapisywanie treningów</p>
            <h2 className="header-gradient">
              LastPush
            </h2>
            <p className="header-text">nigdy nie było prostsze dzięki</p>
          </div>
        </div>
      </div>
      <picture>
        <img className="home-background" src={logApp} alt="Home Background" />
      </picture>
    </section>
  )
}

function Plans({ ref }: {ref: React.RefObject<HTMLDivElement | null>}) {
  const plans = [
    {type: 'Standard', price: '0zł', length: 'na zawsze', features: ["Tworzenie treningów", "Zapisywanie serii", "Podstawowa historia", "Podstawowe statystyki", "Część gotowych planów"], buttonText: 'Załóż darmowe konto'},
    {type: 'Premium', price: '20zł', length: 'miesięcznie', features: ["Zaawansowane wykresy", "PR i analiza progresu", "Automatyczne sugerowanie ciężaru", "Dieta", "Nieograniczone plany", "Regeneracja", "Szczegółowe statystyki"], buttonText: 'Wybróbuj za darmo'}
  ]

  const [ currentlyDisplayedFirst, setCurrentlyDisplayedFirst ] = useState<boolean>(true)
  const isPointerDownRef = useRef<boolean>(false) 
  const startingX = useRef<number | null>(null)
  const plansRef = useRef<HTMLDivElement | null>(null)

  const handlePointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || isPointerDownRef.current) return
    if (e.target instanceof Element && e.target.closest("button")) return

    isPointerDownRef.current = true
    startingX.current = e.clientX
    plansRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerUp = (e: PointerEvent) => {
    if (startingX.current === null) {
      isPointerDownRef.current = false
      return
    }

    const diff = e.clientX - startingX.current
    const threshold = 10

    startingX.current = null
    isPointerDownRef.current = false

    if (Math.abs(diff) < threshold) return

    plansRef.current?.scrollBy({
      left: -diff,
      behavior: "smooth"
    })
  }

  const handleButtonClick = () => {
    plansRef.current?.scrollBy({
      left: currentlyDisplayedFirst ? plansRef.current.clientWidth : - plansRef.current.clientWidth,
      behavior: "smooth"
    })
    setCurrentlyDisplayedFirst(prev => !prev)
  }

  useEffect(() => {
    plansRef.current?.addEventListener("pointerdown", handlePointerDown)
    plansRef.current?.addEventListener("pointerup", handlePointerUp)

    return () => {
      plansRef.current?.removeEventListener("pointerdown", handlePointerDown)
      plansRef.current?.removeEventListener("pointerup", handlePointerUp)
    }

  }, [])

  useEffect(() => {
    const plans = plansRef.current
    if (!plans) return

    const syncFromScroll = () => {
      const maxScroll = plans.scrollWidth - plans.clientWidth
      if (maxScroll <= 0) return
      setCurrentlyDisplayedFirst(plans.scrollLeft < maxScroll / 2)
    }

    plans.addEventListener("scrollend", syncFromScroll)
    return () => plans.removeEventListener("scrollend", syncFromScroll)
}, [])

  function PlansButton() {
    return (
      <button className="change-displayed-plan" onClick={handleButtonClick}>
        <svg style={{ transform: !currentlyDisplayedFirst ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} 
        xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l14 0" />
          <path d="M5 12l4 4" />
          <path d="M5 12l4 -4" />
        </svg>
      </button>
    )
  }

  return (
    <section className="home-section" id="home-plans">
      <div className="plans-container container" ref={ref}>
        <div className="plans-header-container">
          <h2 className="plans-header">Wybierz plan idealny dla siebie</h2>
          <p className="plans-subheader">Przejdź na wyższy poziom i odblokuj pełne możliwości.</p>
        </div>
        <div className="plans-mobile" ref={plansRef}> 
          <div className="plans"> 
            {plans.map((plan) => ( 
              <div className={ plan.type == "Premium" ? "plan premium" : "plan" } key={plan.buttonText}>
                <p className={ plan.type == "Premium" ? "plan-type premium" : "plan-type" }>{plan.type}</p>
                <div className="plan-pricing">
                  <span className="plan-price">{plan.price}</span>
                  <span className="plan-length">{plan.length}</span>
                </div>
                <div className="plan-features">
                  { plan.features.map((feature) => (
                    <span className="plan-feature" key={feature}>{feature}</span>
                  ))}
                </div>
                <button className={ plan.type == "Premium" ? "plan-start premium" : "plan-start" }><span>{plan.buttonText}</span></button>
              </div>
            ))}
          </div>
          <PlansButton />
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const firstHomeRef = useRef(null)
  const plansRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }, { threshold: 0.2 })

    if (firstHomeRef.current) {
      observer.observe(firstHomeRef.current)
    }
    if (plansRef.current) {
      observer.observe(plansRef.current)
    }

    return () => observer.disconnect()
  }, [])
  return (
    <div className="home-container">
      <FirstHomeSection ref={firstHomeRef} />
      <Plans ref={plansRef} />
    </div>
  )
}