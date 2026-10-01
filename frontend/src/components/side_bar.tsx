import { Link } from "react-router-dom"
import '../css/sidebars.css'
import { IconSearch, IconApple, IconChartLine, IconHistory, IconTargetArrow, IconShoppingCart, IconList, IconPremiumRights } from '@tabler/icons-react';
import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";

function Logo({ xy = 200 }: {xy?: number}) {
  const strokeFrac = 0.05
  const gapFrac = 0.03
  const paddingFrac = 0.1

  const step = strokeFrac + gapFrac
  const outerR = 0.5 - paddingFrac - strokeFrac / 2

  const rings = [
    {r: xy * outerR, color: '#FF3B30', percent: 83},
    {r: xy * (outerR - step), color: '#34C759', percent: 75},
    {r: xy * (outerR - step * 2), color: '#007AFF', percent: 86}
  ]

  const [ animated, setAnimated ] = useState<boolean>(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setAnimated(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
 
  return (
    <svg className="logo" width={xy} height={xy}>
      { rings.map((ring) => (
        <circle key={ring.color} r={ring.r} cy={xy * 0.5} cx={xy * 0.5} stroke={ring.color} strokeWidth={xy * strokeFrac} fill="none"
        strokeDasharray={3.14 * ring.r * 2} strokeDashoffset={animated ? 3.14 * ring.r * 2 * (1 - ring.percent / 100) : 3.14 * ring.r * 2} 
        strokeLinecap="round" transform={`rotate(-90 ${xy * 0.5} ${xy * 0.5})`} style={{
          transition: `stroke-dashoffset 1.2s ease-in-out`
        }} />
      ))}
    </svg>
  )
}


export default function LeftSideBar() {
  const sideBarButtons = [
    {text: "Statystyki", svg: <IconChartLine stroke={2} />},
    {text: "Historia", svg: <IconHistory stroke={2} />},
    {text: "Cele", svg: <IconTargetArrow stroke={2} />},
    {text: "Diety", svg: <IconApple stroke={2} />},
  ]

  const sideBarUtils = [
    {text: "Zadania", svg: <IconList stroke={2} />, link: ''},
    {text: "Sklep", svg: <IconShoppingCart stroke={2} />, link: ''},
    {text: "Ulepsz Plan", svg: <IconPremiumRights stroke={2} />, link: "/#home-plans"},
  ]

  const [ searchInputOpen, setSearchInputOpen ] = useState<boolean>(false)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateWidth = () => {
      const width = ref.current?.getBoundingClientRect().width ?? 0
      document.documentElement.style.setProperty("--left-sidebar-width", `${width}px`)
    };

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="left-side-main">
      <div className="left-side">
        <div className="side-logo-container">
          <Link to={'/#home'}>
            <Logo xy={40}/>
          </Link>
        </div>
        <div className="search-input-container side-bar-div" onClick={() => (setSearchInputOpen(true))}>
          <IconSearch stroke={2} />
          <span>Szukaj</span>
          <div className="hover-reveal">
            <span className="hover-reveal-text">Szukaj</span>
          </div>
        </div>
        <div className="separator"></div>
        <div className="often-used">
          { sideBarButtons.map((button) => (
            <div className="side-bar-div" key={button.text}>
              { button.svg }
              <span>{ button.text }</span>
              <div className="hover-reveal">
                <span className="hover-reveal-text">{ button.text }</span>
              </div>
            </div>
          ))}
        </div>
        <div className="separator"></div>
        <div className="side-utils">
          { sideBarUtils.map((util) => (
            <Link to={util.link} key={util.text} className={util.text == "Ulepsz Plan" ? "utils-container side-bar-div get-premium" : "utils-container side-bar-div"}>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                { util.svg }
              </div>
              <span>{ util.text }</span>
              <div className="hover-reveal">
                <span className="hover-reveal-text">{ util.text }</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Dialog.Root open={searchInputOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="input-overlay">
            <Dialog.Content onClick={(e) => {
            if (e.currentTarget === e.target)  setSearchInputOpen(false)}} className="input-content">
              <div className="search-input-bg">
                <input type="text" id="search-input" className="search-input" />
              </div> 
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
