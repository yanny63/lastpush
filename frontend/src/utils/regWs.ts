import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./utils";
import useUser from "../contexts/userContext";

export default function useRegConnect(session: string | null, email: string, password: string) {
  const ws = useRef<WebSocket | null>(null)
  const navigate = useNavigate()

  const { getUser } = useUser()

  useEffect(() => {
    ws.current = new WebSocket(`ws://192.168.1.33:8000/ws/verify?session=${session}`)

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