import { useContext, createContext, useCallback, type ReactNode, useState } from "react";

export interface UserData {
  id: string
  username: string
  email: string
  avatar: string | null
  role: string
  createdAt: string
  background: string | null
}

interface User {
  user: UserData | null
  setUser: (user: UserData | null) => void
  getUser: () => Promise<UserData | null>
  logout: () => void
}

const UserContext = createContext<User | null>(null)

export function UserProvider({ children }: {children: ReactNode}) {
  const [ user, setUser ] = useState<UserData | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem("access-token")
    setUser(null)
  }, [])

  const getUser = useCallback(async () => {
    const token = localStorage.getItem("access-token")
    
    if (!token) {
      setUser(null)
      return null
    }

    const res = await fetch("http://192.168.1.33:8000/me",{
      headers: {"Authorization": `Bearer ${token}`}
    })

    if (!res.ok) {
      throw new Error("Nie można było pobrać danych użytkownika: Ja")
    }

    const data : UserData = await res.json()
    setUser(data)
    return data 
  }, [logout])

  return (
    <UserContext.Provider value={{ user, setUser, getUser, logout }}>
      { children }
    </UserContext.Provider>
  )
}

export default function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser musi być użyte wewnątrz UserProvider.")
  }
  return context
}