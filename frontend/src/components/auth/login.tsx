import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import '../../css/login.css'

export default function Login() {

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

  type AuthType = "username" | "email" | "google"

  interface Credentials {
    username: string
    email: string
    password: string
  }

  const [ chosenType, setChosenType ] = useState<AuthType>('username')

  const [ username, setUsername ] = useState<string>('')
  const [ email, setEmail ] = useState<string>('')
  const [ password, setPassword ] = useState<string>('')
  const [ passwordShown, setPasswordShown ] = useState(false)
  const [ rememberMe, setRememberMe ] = useState(true)

  return (
    <div className="login-container">
      <div className="login-left">
        <header className="login-header">
          <h2>Wróć do swojej formy</h2>
          <p>Zaloguj się, sprawdź swój plan i zrób kolejny krok do celu</p>
        </header>
        <div className="register-type">
          <div className="type" onClick={() => (setChosenType("username"))}>
            { chosenType === "username" &&
            <motion.div className="type-background" layoutId="type-bg" transition={{ type: 'spring' , stiffness: 800, damping: 80 }}/>}
            <span className="type-text">Nazwą</span>
          </div>
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

        <div className="login">
          <AnimatePresence mode="wait">
            { chosenType === 'username' ? 
            <motion.div key={'username'} className="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconUser stroke={2} />
                  <span>Nazwa Użytkownika</span>  
                </span>
                <input type="text" id="username" placeholder="" className="input" value={username} onChange={(e) => {setUsername(e.target.value)}} required />
              </div>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconLock stroke={2} />
                  <span>Hasło</span>  
                </span>
                <input type={passwordShown ? 'text' : 'password'} id="password" placeholder="" className="input" value={password} onChange={(e) => {setPassword(e.target.value)}} required />
                { passwordShown ? <IconEyeOff stroke={2} className="password-icon" onClick={() => (setPasswordShown(false))} /> 
                  : <IconEye stroke={2} className="password-icon" onClick={() => (setPasswordShown(true))} /> }
                </div>
                <div className="login-buttons">
                  <div className="remember-me-container">
                    <label className="remember-me">
                      <span>Zapamiętaj mnie</span>
                      <span className="checkbox"></span>
                      <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => {setRememberMe(e.target.checked)}} />
                    </label>
                  </div>
                  <Link to={'/reset'} className="reset-password">Zresetuj hasło</Link>
                  <button className="login-button" disabled={username.length < 2 || password.length < 8}>
                    <span>Zaloguj się</span>
                  </button>
                </div>
            </motion.div>
            : chosenType === 'email' ? 
            <motion.div key={'email'} className="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconMail stroke={2} />
                  <span>Email</span>  
                </span>
                <input type="email" id="email" placeholder="" className="input" value={email} onChange={(e) => {setEmail(e.target.value)}} required />
              </div>
              <div className="input-border">
                <span className="input-placeholder">
                  <IconLock stroke={2} />
                  <span>Hasło</span>  
                </span>
                <input type={passwordShown ? 'text' : 'password'} id="password" placeholder="" className="input" value={password} onChange={(e) => {setPassword(e.target.value)}} required />
                { passwordShown ? <IconEyeOff stroke={2} className="password-icon" onClick={() => (setPasswordShown(false))} /> 
                  : <IconEye stroke={2} className="password-icon" onClick={() => (setPasswordShown(true))} /> }
                </div>
                <div className="login-buttons">
                  <div className="remember-me-container">
                    <label className="remember-me">
                      <span>Zapamiętaj mnie</span>
                      <span className="checkbox"></span>
                      <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => {setRememberMe(e.target.checked)}} />
                    </label>
                  </div>
                  <Link to={'/reset'} className="reset-password">Zresetuj hasło</Link>
                  <button className="login-button" disabled={email.length < 3 || password.length < 8}>
                    <span>Zaloguj się</span>
                  </button>
                </div>
            </motion.div> :
            <motion.div key={'google'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
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
    </div>
  )
}