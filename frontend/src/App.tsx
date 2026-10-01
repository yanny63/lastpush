import { useRef, useEffect, lazy } from "react"
import { motion } from "motion/react"
const Home = lazy(() => import("./components/home"))
const Nav = lazy(() => import("./components/nav"))
const LeftSideBar = lazy(() => import("./components/side_bar"))
const RightBar = lazy(() => import("./components/right_bar"))
const Login = lazy(() => import("./components/auth/login"))
const Register = lazy(() => import("./components/auth/register"))
import { Routes, Route, useLocation } from "react-router-dom"
import { ScrollToHash } from "./utils/scroll_hash"
const Verify = lazy(() => import("./components/auth/verify"))
const Profile = lazy(() => import("./components/profile"))
import useUser from "./contexts/userContext"

export default function App() {
  const navVisibleRef = useRef<boolean>(true)
  const lastScrollRef = useRef<number>(0)
  useEffect(() => {
    const handleScroll = () => {
      const sY = window.scrollY
      if (navVisibleRef.current && lastScrollRef.current - sY >= 10) {
        lastScrollRef.current = sY
        navVisibleRef.current = false
      }
      else if (!navVisibleRef.current && lastScrollRef.current - sY <= -10) {
        lastScrollRef.current = sY
        navVisibleRef.current = true
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const location = useLocation()
  const hideNav = location.pathname.startsWith("/profile/")

  const { getUser } = useUser()
  useEffect(() => {
    getUser()
  }, [getUser])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="app-container">
      <ScrollToHash />
      { !hideNav && <Nav navVisibleRef={navVisibleRef} /> }
      <div className="app-body">
        <LeftSideBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </main>
        <RightBar />
      </div>
    </motion.div>
  )
}