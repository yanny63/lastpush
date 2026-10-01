import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { createPortal } from "react-dom"
import "../css/nav.css"
import { IconArrowNarrowRight, IconBell, IconUser, IconX } from "@tabler/icons-react"
import { setUpProfile } from "../utils/utils"
import useUser from "../contexts/userContext"

function Nav({ navVisibleRef }: {navVisibleRef: React.RefObject<boolean>}) {

  const [ isOpen, setIsOpen ] = useState<boolean>(false)
  const [ scrolled, setScrolled ] = useState<boolean>(false)
  const [ mobileNavOpen, setMobileNavOpen ] = useState<boolean>(false)
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
      <div className="nav-profile">
        <IconUser stroke={2} />
      </div>
    )
  }

  const notSetUp = setUpProfile()

  const { user } = useUser()

  return (
    <div className={notSetUp ? "nav top-zero" : "nav"}>
        { notSetUp && 
        <div className="nav-top-notifications">
          <div className="set-up-profile">
            <div className="set-up-profile-inner">
              <span>Dodaj zdjęcie i dane, by inni Cię rozpoznali -&nbsp;</span>
              <Link to={`/profile/${user?.id}`} className="set-up-profile-link">
                Uzupełnij profil
                <IconArrowNarrowRight stroke={2} className="link-arrow" />
              </Link>
              <IconX stroke={2} className="notification-close" />
            </div>
          </div>
        </div>}
      <div className={["nav-container", !navVisibleRef.current && "nav-not-visible", !scrolled && !isOpen && "nav-not-scrolled",].filter(Boolean).join(" ")}>
        <div className="nav-links" style={user ? {width: "100%"} : {}}>
          <Link to={"/"} className="nav-link">Strona Główna</Link>
          <Link to={"/"} className="nav-link">Trening</Link>
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
            <Link to={"/"} className="nav-link">Strona Główna</Link>
            <Link to={"/"} className="nav-link">Trening</Link>
            <Link to={"/"} className="nav-link">Ćwiczenia</Link>
            <Link to={"/"} className="nav-link">Kalkulatory</Link>
            <Link to={"/"} className="nav-link">Stoper</Link>
            <div className="nav-separator"></div>
            { !user &&
            <>
              <Link to={"/register"} className="nav-link">Zarejestruj się</Link>
              <Link to={"/login"} className="nav-link">Zaloguj się</Link>
            </>
            }
          </motion.div> }
        </AnimatePresence>, document.body ) }
      </div>
    </div>
  )
}

export default Nav