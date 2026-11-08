import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { createPortal } from "react-dom"
import "../css/nav.css"
import { IconBell, IconCreditCard, IconLogout, IconMoneybag, IconMoon, IconSettings, IconShoppingCart, IconUser, IconX } from "@tabler/icons-react"
import useUser from "../contexts/userContext"
import { Circle } from "./shared"

function Nav({ navVisibleRef }: {navVisibleRef: React.RefObject<boolean>}) {
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const [ isOpen, setIsOpen ] = useState<boolean>(false)
  const [ scrolled, setScrolled ] = useState<boolean>(false)
  const [ mobileNavOpen, setMobileNavOpen ] = useState<boolean>(false)
  const [ profileOpen, setProfileOpen ] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 16) setScrolled(true) 
      else setScrolled(false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function MenuIcon({ isOpen }: { isOpen: boolean }) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <motion.line
          x1="3" y1="6" x2="21" y2="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          style={{ originX: 0.5 , originY: 0.5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.line
          x1="3" y1="12" x2="21" y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.line
          x1="3" y1="18" x2="21" y2="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          style={{ originX: 0.5 , originY: 0.5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </svg>
    )
  }

  function Notifications() {
    return (
      <div className="nav-notifications">
        <IconBell stroke={2} />
      </div>
    )
  }

  function Profile() {
    return (
      <div className="nav-profile" onClick={() => {setProfileOpen(true)}}>
        <IconUser stroke={2} />
      </div>
    )
  }

  async function _logout() {
    setProfileOpen(false)
    await logout()
  }

  const accountOptions = [
    {text: "Ustawienia", svg: <IconSettings stroke={2} />},
    {text: "Subskrypcje", svg: <IconCreditCard stroke={2} />},
  ]

  const [ prefersDark, setPrefersDark ] = useState<boolean>(false)
  useEffect(() => {
    const p = localStorage.getItem('dark-mode') === 'true' ? true : false
    setPrefersDark(p)
  }, [])

  function Avatar() {
    if (!user?.avatar) {
      return <IconUser stroke={2} />
    } else {
      return <img src={`http://192.168.1.33:8000/uploads/${user.avatar}`} alt="Zdjęcie profilowe" />
    }
  }

  return (
    <div className={profileOpen ? "" : "nav"}>
      <div className={["nav-container", !navVisibleRef.current && "nav-not-visible", !scrolled && !isOpen && "nav-not-scrolled",].filter(Boolean).join(" ")}>
        <div className="nav-links" style={user ? {width: "100%"} : {}}>
          <Link to={"/"} className="nav-link">Strona Główna</Link>
          <Link to={"/trening"} className="nav-link">Trening</Link>
          <Link to={"/"} className="nav-link">Ćwiczenia</Link>
          <span className="nav-utils-container" onMouseEnter={() => {handleMouseEnter()}} onMouseLeave={() => {handleMouseLeave()}}>
            <span>Narzędzia</span>
            <AnimatePresence>
                { isOpen && 
              <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="nav-utils" onMouseEnter={() => {handleMouseEnter()}} onMouseLeave={() => {handleMouseLeave()}}>
                <Link to={"/"} className="nav-link">Kalkulatory</Link>
                <Link to={"/"} className="nav-link">Stoper</Link>
              </motion.div> }
            </AnimatePresence>
          </span>
        </div>
        { !user &&
        <div className="nav-login">
          <Link to={"/register"} className="nav-link">Zarejestruj się</Link>
          <Link to={"/login"} className="nav-link">Zaloguj się</Link>
        </div>}
        <div className="nav-mobile">
          <div className="menu" onClick={() => {setMobileNavOpen(prev => !prev)}}>
            <MenuIcon isOpen={mobileNavOpen}  />
          </div>
          
          <div className="nav-mobile-utils">
            <Notifications />
            <Profile />
          </div>
        </div>
        { createPortal(
        <AnimatePresence>
          { mobileNavOpen &&
          <motion.div className="nav-mobile-options" initial={{ height: 0, opacity: 0 }} animate={{ height: "100dvh", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <Link to={"/"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Strona Główna</Link>
            <Link to={"/trening"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Trening</Link>
            <Link to={"/"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Ćwiczenia</Link>
            <Link to={"/"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Kalkulatory</Link>
            <Link to={"/"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Stoper</Link>
            <div className="nav-separator"></div>
            { !user &&
            <>
              <Link to={"/register"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Zarejestruj się</Link>
              <Link to={"/login"} className="nav-link" onClick={() => {setMobileNavOpen(false)}}>Zaloguj się</Link>
            </>
            }
          </motion.div> }
          { profileOpen && 
          <motion.div className="nav-mobile-options-profile" initial={{ height: 0, opacity: 0 }} animate={{ height: "100dvh", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="profile-header nav-p">
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
              <div className="close-button" onClick={() => {setProfileOpen(false)}}>
                <IconX stroke={2} />
              </div>
            </div>
            <div className="profile-shop nav-p">
              <Link to={'/shop'} className="available-points white">
                <IconShoppingCart className="shop-icon" stroke={2} />
                <span className="points">1204</span>
                <span className="shop">Kupuj</span>
              </Link>
              <Link to={'/shop'} className="available-points white">
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
            <div className="account-options nav-p">
              { accountOptions.map((option) => (
                <div key={option.text} className="account-option nav-p-o">
                  { option.svg }
                  <span>{option.text}</span>
                </div>
              ))}
              <div className="prefered-theme nav-p-o">
                <IconMoon stroke={2} />
                <span className="theme-toggle-text">Tryb Ciemny</span>
                <button type="button" className={prefersDark ? "theme-toggle-container prefers-dark" : "theme-toggle-container"} aria-pressed={prefersDark} aria-label="Przełącz tryb ciemny"
                onClick={() => {setPrefersDark(prev => !prev)}}>
                  <span className={prefersDark ? "theme-toggle prefers-dark" : "theme-toggle"}></span>
                </button>
              </div>
              <div className="account-option nav-p-o" onClick={() => {_logout()}}>
                <IconLogout stroke={2} />
                <span>Wyloguj</span>
              </div>
            </div>
          </motion.div>}
        </AnimatePresence>, document.body ) }
      </div>
    </div>
  )
}

export default Nav