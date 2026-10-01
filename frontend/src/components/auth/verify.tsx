import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import '../../css/verify.css'

type Status = 'loading' | 'success' | 'error'

export default function Verify() {

  const [ status, setStatus ] = useState<Status>('loading')
  const [ searchParams ] = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    fetch(`http://192.168.1.33:8000/verify?token=${token}`, {
      method: "POST"
    }).then(res => {
      if (res.ok) {
        setStatus('success')
      } else setStatus('error')
    })
  }, [token])

  return (
    <div className="verification">
      { status === 'loading' ? 
      <span className="status">Weryfikowanie
        <span className="verifying-dots-one">.</span>
        <span className="verifying-dots-two">.</span>
        <span className="verifying-dots-three">.</span>
      </span> : status === 'success' ? "Email potwierdzony! Możesz się zalogować" : "Link jest nieprawidłowy lub wygasł" }
    </div>
  )
}