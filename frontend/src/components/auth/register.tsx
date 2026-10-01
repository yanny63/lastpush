import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import '../../css/register.css'
import { IconCheck, IconEye, IconEyeOff, IconLock, IconMail, IconMailForward, IconUser, IconX } from "@tabler/icons-react";
import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import useRegConnect from "../../utils/regWs";

gsap.registerPlugin(DrawSVGPlugin)

type AuthType = "email" | "google"

interface Credentials {
  username: string
  email: string
  password: string
}

interface Error {
  detail: string
}

export default function Register() {
  const [ chosenType, setChosenType ] = useState<AuthType>("email")
  const [ nickname, setNickname ] = useState<string>("")
  const [ email, setEmail ] = useState<string>("")
  const [ password, setPassword ] = useState<string>("")
  const [ passwordShown, setPasswordShown ] = useState<boolean>(false)
  const [ isPasswordFocused, setIsPasswordFocused ] = useState<boolean>(false)

  const [ hasMinLength, setHasMinLength ] = useState<boolean>(false)
  const [ hasSpecialChar, setHasSpecialChar ] = useState<boolean>(false)
  const [ containsUppercase, setContainsUppercase ] = useState<boolean>(false)

  function Google() {
    return (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google/default.svg"
        alt="Google"
        width="24"
        height="24"
      />
    )
  }

  const validate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    if (password.length >= 8) {
      setHasMinLength(true)
    } else setHasMinLength(false)
    if (/[A-Z]/.test(password)) {
      setContainsUppercase(true)
    } else setContainsUppercase(false)
    if (/[!?&*$#]/.test(password)) {
      setHasSpecialChar(true)
    } else setHasSpecialChar(false)
    setPassword(password)
  }

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ registerError, setRegisterError ] = useState<string | null>(null)
  const [ veryfing, setVeryfing ] = useState(false)
  const [ registering, setRegistering ] = useState(false)

  const [session, setSession] = useState<string | null>(null)

  useRegConnect(session, email, password)
  const register = async (user: Credentials) => {
    setRegistering(true)
    const res = await fetch("http://192.168.1.33:8000/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user)
    })
    
    if (!res.ok) {
      const data : Error = await res.json()
      setRegisterError(data.detail)
      setRegistering(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setRegisterError(null)
        timeoutRef.current = null
      }, 3000);
      return
    }

    const data = await res.json()
    const session = data.register_session
    console.log(session)
    setSession(session)
    setVeryfing(true)
    setRegistering(false)
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const mailSentRef = useRef<HTMLDivElement | null>(null)
  const iconRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const descriptionRef = useRef<HTMLSpanElement | null>(null)
  
  useEffect(() => {
    if (!veryfing) return
    if (!iconRef.current) return

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out"
      }
    })

    tl.from(mailSentRef.current, {
      opacity: 0,
      scale: 0.96,
      duration: 0.4
    })

    .from(iconRef.current, {
      opacity: 0,
      scale: 0.5,
      rotation: -10,
      duration: 0.55,
      ease: "back.out(1.8)"
    }, "-=0.15")

    .from(titleRef.current, {
      yPercent: 110,
      duration: 0.65,
      ease: "power4.out"
    }, "-=0.15")

    .from(descriptionRef.current, {
      opacity: 0,
      y: 14,
      filter: "blur(6px)",
      duration: 0.5
    }, "-=0.3")

    .to(iconRef.current, {
      y: -10,
      duration: 0.25,
      ease: "power2.out"
    })

    .to(iconRef.current, {
      y: 0,
      duration: 0.35,
      ease: "bounce.out"
    })
  }, [veryfing])

  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const handleInputKey = (e: React.KeyboardEvent) => {
    if (!buttonRef.current) return
    if (e.key === "Enter") {
      buttonRef.current.click()
    }
  }

  return (
    <div className="register-container">
      <AnimatePresence>
      { !veryfing ? 
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transform: 'translateX(-80px)' }} transition={{ duration: 0.3 }}>
      <div className="register-left-side">
        <div className="register-header">
          <h2>Załóż konto</h2>
        </div>
        <div className="register-type">
          <div className="type" onClick={() => (setChosenType("email"))}>
            { chosenType === "email" &&
            <motion.div className="type-background" layoutId="type-bg" transition={{ type: 'spring' , stiffness: 800, damping: 80 }}/>}
            <span className="type-text">Emailem</span>
          </div>
          <div className="type" onClick={() => (setChosenType("google"))}>
            { chosenType === "google" &&
            <motion.div className="type-background" layoutId="type-bg" transition={{ type: 'spring', stiffness: 800, damping: 80 }}/>}
            <span className="type-text">Googlem</span>
          </div>
        </div>
        <div className="register-form">
          <AnimatePresence mode="wait">
            { chosenType === "email" ? 
            <motion.div key={"email"} className="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconUser stroke={2} />
                  <span>Nazwa Użytkownika</span>  
                </span>
                <input className="form-input" id="nickname" type="text" placeholder="" value={nickname} onChange={(e) => (setNickname(e.target.value))} />
              </div>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconMail stroke={2} />
                  <span>Email</span>  
                </span>
                <input className="form-input" id="email" type="email" placeholder="" value={email} onChange={(e) => (setEmail(e.target.value))} />
              </div>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconLock stroke={2} />
                  <span>Hasło</span>  
                </span>
                <input onFocus={() => {setIsPasswordFocused(true)}} onBlur={() => {setIsPasswordFocused(false)}} className="form-input" 
                type={passwordShown ? "text" : "password"} onKeyDown={(e) => {handleInputKey(e)}}
                id="password" placeholder="" value={password} onChange={validate} />
                { passwordShown ? <IconEyeOff stroke={2} className="password-icon" onClick={() => (setPasswordShown(false))} /> 
                : <IconEye stroke={2} className="password-icon" onClick={() => (setPasswordShown(true))} /> }
              </div>
              <AnimatePresence>
                { ((!hasMinLength || !hasSpecialChar || !containsUppercase) && isPasswordFocused) && 
                <motion.div className="password-requirements" initial={{ opacity: 0, transform: 'scale(0.9)' }} animate={{ opacity: 1, transform: 'scale(1)' }} 
                exit={{ opacity: 0, transform: 'scale(0.9)' }} transition={{ duration: 0.2 }}>
                <h4>Wymagania hasła:</h4>
                <div className="requirements-container">
                  <span className="requirement">
                    <AnimatePresence mode="wait">
                      { hasMinLength ? 
                      <motion.div key={'check'} initial={{ transform: 'rotate(45deg) scale(0.95)', opacity: 0 }} animate={{ transform: 'rotate(0deg) scale(1)', opacity: 1 }} 
                      exit={{ transform: 'rotate(-45deg) scale(0.95)', opacity: 0 }} transition={{ duration: 0.2 }}>
                        <IconCheck stroke={2} color="#34C759" />
                      </motion.div> :
                      <motion.div key={'x'} initial={{ transform: 'rotate(45deg) scale(0.95)', opacity: 0 }} animate={{ transform: 'rotate(0deg) scale(1)', opacity: 1 }} 
                      exit={{ transform: 'rotate(-45deg) scale(0.95)', opacity: 0 }} transition={{ duration: 0.2 }}>
                        <IconX stroke={2} color="#FF3B30" />
                      </motion.div>}
                    </AnimatePresence>
                    <span>Minimum 8 znaków</span>
                  </span>
                  <span className="requirement">
                    <AnimatePresence mode="wait">
                      { hasSpecialChar ? 
                      <motion.div key={'check'} initial={{ transform: 'rotate(45deg) scale(0.95)', opacity: 0 }} animate={{ transform: 'rotate(0deg) scale(1)', opacity: 1 }} 
                      exit={{ transform: 'rotate(-45deg) scale(0.95)', opacity: 0 }} transition={{ duration: 0.2 }}>
                        <IconCheck stroke={2} color="#34C759" />
                      </motion.div> :
                      <motion.div key={'x'} initial={{ transform: 'rotate(45deg) scale(0.95)', opacity: 0 }} animate={{ transform: 'rotate(0deg) scale(1)', opacity: 1 }} 
                      exit={{ transform: 'rotate(-45deg) scale(0.95)', opacity: 0 }} transition={{ duration: 0.2 }}>
                        <IconX stroke={2} color="#FF3B30" />
                      </motion.div>}
                    </AnimatePresence>
                    <span>Minimum 1 znak specjalny</span>
                  </span>
                  <span className="requirement">
                    <AnimatePresence mode="wait">
                      { containsUppercase ? 
                      <motion.div key={'check'} initial={{ transform: 'rotate(45deg) scale(0.95)', opacity: 0 }} animate={{ transform: 'rotate(0deg) scale(1)', opacity: 1 }} 
                      exit={{ transform: 'rotate(-45deg) scale(0.95)', opacity: 0 }} transition={{ duration: 0.2 }}>
                        <IconCheck stroke={2} color="#34C759" />
                      </motion.div> :
                      <motion.div key={'x'} initial={{ transform: 'rotate(45deg) scale(0.95)', opacity: 0 }} animate={{ transform: 'rotate(0deg) scale(1)', opacity: 1 }} 
                      exit={{ transform: 'rotate(-45deg) scale(0.95)', opacity: 0 }} transition={{ duration: 0.2 }}>
                        <IconX stroke={2} color="#FF3B30" />
                      </motion.div>}
                    </AnimatePresence>
                    <span>Minimum 1 dużą literę</span>
                  </span>
                </div>
              </motion.div>}
              </AnimatePresence>
              <AnimatePresence>
                { registerError && 
                <motion.div style={{ color: '#FF3B30', fontWeight: "bold" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  { registerError }
                </motion.div>}
              </AnimatePresence>
              
              <button className={registering ? "send-form no-hover" : "send-form"} disabled={nickname.length < 2 || !hasMinLength || !hasSpecialChar || !containsUppercase || email.length < 3}
              onClick={() => {register({ username: nickname, email: email, password: password })}} ref={buttonRef}>
                <AnimatePresence>
                  { registering ? 
                  <>
                    <svg className="spinner" viewBox="0 0 50 50">
                      <circle
                        className="spinner-path"
                        cx="25" cy="25" r="20"
                        fill="none"
                      />
                    </svg>
                    <div className="registering"></div>
                  </> :
                  <span>Zarejestruj się</span>}
                </AnimatePresence>
              </button>
              <p className="download-app">Masz telefon pod ręką?<a download={""}>Pobierz aplikacje</a></p>
            </motion.div> : 
            <motion.div key={"google"} className="" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="google">
                <div className="continue-google">
                  <Google />
                  <span>Kontynuuj z google</span>
                </div>
              </div>
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>
      <div className="register-right-side">
        
      </div>
      </motion.div>
      : 
      <motion.div className="mail-sent" ref={mailSentRef}>
        <div className="mail-icon" ref={iconRef}>
          <IconMailForward stroke={2} />
        </div>
        <header className="mail-sent-header">
          <div className="mail-header-wrapper" ref={titleRef}>
            <h2>Sprawdź swoją skrzynkę</h2>
          </div>
          <span ref={descriptionRef}>Wysłaliśmy Ci wiadomość z linkiem weryfikacyjnym</span>
        </header>
      </motion.div>
      }
      </AnimatePresence>
    </div>
  )
}