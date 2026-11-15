import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./utils";
import useUser from "../contexts/userContext";
const WS_URL = import.meta.env.VITE_BACKEND_ADDRESS

export default function useRegConnect(session: string | null, email: string, password: string) {
  const ws = useRef<WebSocket | null>(null)
  const navigate = useNavigate()

  const { getUser } = useUser()

  useEffect(() => {
    ws.current = new WebSocket(`${WS_URL}/ws/verify?session=${session}`)

    ws.current.onmessage = async (message) => {
      const data = JSON.parse(message.data)
      console.log(`Data: ${data} | Type ${data.type}`)
      if (data.type === "verification") {
        if (data.verified === true) {
          await login(email, password, getUser)
          navigate("/")
        }
      }
    }

  }, [session])
}