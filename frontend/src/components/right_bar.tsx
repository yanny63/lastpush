import { useState, useEffect, useRef } from "react"
import { IconUser, IconQuestionMark, IconBell, IconUsers, IconX, IconShoppingCart, IconMoneybag, IconSettings, IconCreditCard, IconMoon } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import useUser from "../contexts/userContext"

function Elo() {
  const [ eloAnimated, setEloAnimated ] = useState<boolean>(false) 

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setEloAnimated(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div className="strength-points">
      <svg width={30} height={30}>
        <circle r={15} cy={15} cx={15} stroke="#AEAEB2" strokeWidth={6} strokeDasharray={3.14 * 15 * 2} 
        strokeDashoffset={3.14 * 15 * 2 * (1 - 70 / 100)} strokeLinecap="round" fill="none"
        transform="rotate(145 15 15)" style={{ transition: `stroke-dashoffset 1.2s ease-in-out`}} />
      </svg>
      <span className="level">
        <IconQuestionMark stroke={2} />
      </span>
      { eloAnimated && <></>}
      <div className="hover-reveal-right">
        <span className="hover-reveal-text">Punkty Siły</span>
      </div>
    </div>
  )
}

function UserProfile() {
  const { user } = useUser()

  function Circle() {
    return (
      <svg height={16} width={16} style={{ borderRadius: 'var(--radius-full)' }}>
        <circle r={8} cx={8} cy={8} fill="var(--color-green)" />
      </svg>
    )
  }

  const [ open, setOpen ] = useState<boolean>(false)
  const handleClick = () => {
    if (user === null) return
    setOpen(prev => !prev)
  }

  const accountOptions = [
    {text: "Ustawienia", svg: <IconSettings stroke={2} />},
    {text: "Subskrypcje", svg: <IconCreditCard stroke={2} />},
  ]

  const [ preffersDark, setPreffersDark ] = useState<boolean>(false)
  useEffect(() => {
    const p = localStorage.getItem('dark-mode') === 'true' ? true : false
    setPreffersDark(p)
  }, [])

  function Avatar() {
    if (!user?.avatar) {
      return <IconUser stroke={2} />
    } else {
      return <img src={`http://192.168.1.33:8000/uploads/${user.avatar}`} alt="Zdjęcie profilowe" />
    }
  }

  return (
    // if user has no profile picture set display the default svg
    <>
      <div className="user-profile" onClick={handleClick}>
        <Avatar />
        <div className="hover-reveal-right">
          <span className="hover-reveal-text">Profil</span>
        </div>
      </div>
      <AnimatePresence>
        { open && 
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="profile-options">
          <div className="profile-header">
            <div className="profile-picture">
              <Avatar />
            </div>
            <div className="profile-info">
              <span className="nickname">{ user?.username }</span>
              <span className="status-container">
                <Circle />
                <span className="status">Online</span>
              </span>
            </div>
            <div className="close-button" onClick={handleClick}>
              <IconX stroke={2} />
            </div>
          </div>
          <div className="profile-shop">
            <Link to={'/shop'} className="available-points">
              <IconShoppingCart className="shop-icon" stroke={2} />
              <span className="points">1204</span>
              <span className="shop">Kupuj</span>
            </Link>
            <Link to={'/shop'} className="available-points">
              <IconMoneybag className="shop-icon" stroke={2} />
              <span className="available">4</span>
              <span className="shop">Dostępne</span>
            </Link>
          </div>
          <div className="go-to-profile">
            <Link to={`/profile/${user!.id}`} className="view-profile">
              <span>Przejdź do profilu</span>
            </Link>
          </div>
          <div className="separator"></div>
          <div className="account-options">
            { accountOptions.map((option) => (
              <div key={option.text} className="account-option">
                { option.svg }
                <span>{option.text}</span>
              </div>
            ))}
            <div className="preffered-theme">
              <IconMoon stroke={2} />
              <span className="theme-toggle-text">Tryb Ciemny</span>
              <span className={preffersDark ? "theme-toggle-container preffers-dark" : "theme-toggle-container"} onClick={() => {setPreffersDark(prev => !prev)}}>
                <span className={preffersDark ? "theme-toggle preffers-dark" : "theme-toggle"}></span>
              </span>
            </div>
          </div>
        </motion.div>}
      </AnimatePresence>
    </>
  )
}

function Notifications() {
  const [ open, setOpen ] = useState<boolean>(false)
  return (
    <>
      <div className="notifications" onClick={() => {setOpen(prev => !prev)}}>
        <IconBell stroke={2} />
        <div className="hover-reveal-right">
          <span className="hover-reveal-text">Powiadomienia</span>
        </div>
      </div>
      <AnimatePresence>
        { open && 
        <motion.div initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="notifications-container">
          <div className="notifications-header">
            <h2 style={{ flex: 1 }}>Powiadomienia</h2>
            <div className="close-button" onClick={() => (setOpen(false))}>
              <IconX stroke={2} />
            </div>
          </div>
          <div className="separator"></div>
        </motion.div>}
      </AnimatePresence>
    </>
  )
}

function Friends() {
  return (
    <div className="friends">
      <IconUsers stroke={2} />
      <div className="hover-reveal-right">
        <span className="hover-reveal-text">Znajomi</span>
      </div>
    </div>
  )
}


export default function RightBar() {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const updateWidth = () => {
      const width = ref.current?.getBoundingClientRect().width ?? 0
      document.documentElement.style.setProperty("--right-sidebar-width", `${width}px`)
    };

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="right-side-main">
      <div className="right-side">
        <UserProfile />
        <Elo />
        <div className="separator"></div>
        <div className="community">
          <Notifications />
          <Friends />
        </div>
      </div>
    </div>
  )
}