import { IconDots, IconQuestionMark, IconUser, IconUserCheck } from "@tabler/icons-react";
import useUser from "../contexts/userContext";
import "../css/profile.css"
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProfile, type TypeProfile, friend, unfriend } from "../utils/utils";
// import { Dialog } from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";

gsap.registerPlugin(DrawSVGPlugin)

function useMedia(query: string) {
  const [ matches, setMatches ] = useState(false)
  useEffect(() => {
    const media =  window.matchMedia(query)

    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])
  return matches
}

export default function Profile() {
  const { user } = useUser()
  const { id } = useParams()
  
  // document.documentElement.style.setProperty("--profile-bg", user!.background)

  const avatarRef = useRef<SVGSVGElement | null>(null)

  function Avatar() {
    if (!user?.avatar) {
      return <IconUser stroke={2} height={80} width={80} ref={avatarRef}/>
    } else {
      return <img src={`http://192.168.1.33:8000/uploads/${user.avatar}`} alt="Zdjęcie profilowe" />
    }
  }

  useGSAP(() => {
    const goalPercentageContainer = gsap.utils.toArray<HTMLSpanElement>(".goal-completion-percentage")

    if (avatarRef.current) {
      gsap.from(avatarRef.current.querySelectorAll("path, circle"), {
        drawSVG: 0,
        duration: 0.8,
        stagger: 0.12
      })
    }
    goalPercentageContainer.forEach((span) => {
      gsap.from(span, {
        width: 0,
        duration: 2,
        ease: "back.out"      
      })
    })
  })

  const [ showFriendActions, setShowFriendActions ] = useState(false)
  const [ isRemovingFriend, setIsRemovingFriend ] = useState(false)
  const [ isUser, setIsUser ] = useState(false)
  const [ profile, setProfile ] = useState<TypeProfile | null>(null)

  useEffect(() => {
    if (!id) {
      setProfile(null)
      return
    }
    try {
      const getInfo = async () => {
        const p : TypeProfile =  await getProfile(id)
        setProfile(p)
      }
      getInfo()
    } catch (err) {
      console.error(err)
    }
    if (!user) {
      setIsUser(false) 
      return
    }
    setIsUser(user.id === id)
  }, [user, id])

  const isMedia = useMedia('(max-width: 768px)')

  const friendActionsRef = useRef<HTMLDivElement | null>(null)
  const toggleActionsRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!showFriendActions) return
    
    function windowClick(e: MouseEvent) {
      if (friendActionsRef.current?.contains(e.target as Node)) return
      if (toggleActionsRef.current?.contains(e.target as Node)) return
      setShowFriendActions(false)
    }

    window.addEventListener("click", windowClick)

    return () => window.removeEventListener("click", windowClick)
  }, [showFriendActions])

  type Error = { id: number; message: string }

  const [ errors, setErrors ] = useState<Error[]>([])

  function showError(message: string) {
    const id = Date.now() + Math.random() * 50
    console.log(id)
    setErrors(prev => [...prev, {id, message}])
    setTimeout(() => {
      setErrors(prev => prev.filter(error => error.id !== id))
    }, 3000)
  }

  async function addFriend() {
    if (user && user.id === id) return
    if (!id) return
    try {
      await friend(id)
    } catch {
      showError("Wystąpił błąd podczas dodawania znajomego")
    }
  }

  async function removeFriend() {
    if (user && user.id === id) return
    if (!id) return
    try {
      await unfriend(id)
    } catch {
      showError("Wystąpił błąd podczas usuwania znajomego")
    }
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-background"></div>
        <div className="profile-not-found-container">
          <div className="profile-not-found-inner">
            <div className="profile-not-found-image">
              <IconQuestionMark className="question-mark" height={60} width={60} stroke={2} />
              <Avatar />
            </div>
            <div className="profile-not-found">
              <h1>Nie znaleźliśmy tego profilu</h1>
              <p>Profil nie istnieje bądź został usunięty</p>
              <button className="profile-not-found-search">
                Wróć do wyszukiwania
              </button>
              <Link to={"/"} className="profile-not-found-home">Wróć na stronę główną</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-errors">
        { errors.map((error) => (
          <div key={error.id} className="error" onClick={() => {setErrors(prev => prev.filter(err => err.id !== error.id))}}>
            { error.message }
          </div>
        ))}
      </div>
      <div className="profile-background"></div>
      <div className="profile">
        <div className="profile-top">
          <div className="profile-avatar">
            <Avatar />
          </div>
          <div className="user-info">
            <h1>{ profile.username }</h1>
            <p className="profile-info-p">
              <span className="user-tag">
                @{ profile.username }
              </span>
              <span className="dot"></span>
              <span className="">
                { profile.friends_count } znajomych
              </span>
            </p>
          </div>
          <div className="profile-manage-container">
            <AnimatePresence>
              { showFriendActions &&
              <motion.div ref={friendActionsRef} className="friend-actions" initial={ isMedia ? { transform: 'translateY(100px)', opacity: 0 } : { opacity: 0 }} 
              animate={isMedia ? { transform: 'translateY(0)', opacity: 1 } : { opacity: 1 }} exit={isMedia ? { transform: 'translateY(100px)', opacity: 0 } : { opacity: 0 }} transition={{ duration: 0.2, type: "spring", stiffness: 80, damping: 20 }}>
                <button className="friend-action">Zaobserwuj</button>
                <button className="friend-action">Dodaj do ulubionych</button>
                <button className="friend-action" onClick={removeFriend}>Usuń znajomego</button>
              </motion.div>}
            </AnimatePresence>
            <div className="profile-manage">
              { profile.is_friend ? 
              <button ref={toggleActionsRef} className="add-friend are-friends" onClick={() => {setShowFriendActions(true)}}>
                <IconUserCheck stroke={2} />
                <span>Znajomi</span>
              </button> :
              <button className="add-friend" onClick={addFriend}>
                Dodaj do znajomych
              </button> }
              <button className="user-manage">
                <IconDots stroke={2} />
              </button>
            </div>
          </div>
        </div>
        <div className="profile-center">
          <div className="user-stats-container">
            <div className="user-stats">
              <div className="stat">
                <h2>48</h2>
                <p>treningów</p>
              </div>
              <div className="stat">
                <h2>12h</h2>
                <p>w tym miesiącu</p>
              </div>
              <div className="stat">
                <h2>7</h2>
                <p>Dni serii</p>
              </div>
            </div>
            <div className="profile-recent-activity">
              <h3>Ostatnia aktywność</h3>
              <div className="profile-activity">
                <div className="activity">
                  <div className="activity-icon"></div>
                  <div className="activity-info-container">
                    <p className="activity-name">Push - klata bary</p>
                    <p className="activity-info">
                      <span>dzisiaj</span>
                      <span className="dot"></span>
                      <span>58 min</span>
                      <span className="dot"></span>
                      <span>5 ćwiczeń</span>
                    </p>
                  </div>
                </div>
                <div className="line"></div>
                <div className="activity">
                  <div className="activity-icon"></div>
                  <div className="activity-info-container">
                    <p className="activity-name">Push - klata bary</p>
                    <p className="activity-info">
                      <span>dzisiaj</span>
                      <span className="dot"></span>
                      <span>58 min</span>
                      <span className="dot"></span>
                      <span>5 ćwiczeń</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-center-right">
            <div className="current-goal">
              <h2>Aktualny cel</h2>
              <h4>20 treningów we wrześniu</h4>
              <div className="goal-completion">
                <div className="goal-math">
                  <span>14 z 20</span>
                  <span className="percentage">
                    70%
                  </span>
                </div>
                <div className="goal-completion-percentage-container">
                  <span className="goal-completion-percentage" style={{ width: "70%" }}></span>
                </div>
              </div>
            </div>
            <div className="user-about">
              <h2>O mnie</h2>
              <p>Buduję siłę i formę. Trenuje 4x w tygodniu. Wawa</p>
            </div>
          </div>
          </div>
      </div>
    </div>
  )
}