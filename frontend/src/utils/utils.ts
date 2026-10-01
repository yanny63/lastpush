import type { UserData } from "../contexts/userContext"

export async function login(email: string, password: string, getUser: () => Promise<UserData | null>) {
  if (localStorage.getItem('access-token')) return

  const res = await fetch("http://192.168.1.33:8000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email, password
    })
  })
  if (!res.ok) {
    throw new Error("Nie udało się zalogować")
  }
  const data = await res.json()
  if (!data.token) {
    throw new Error("Nie udało się zalogować, brak tokenu dostępu")
  }
  localStorage.setItem('access-token', data.token)
  await getUser()
}

// PROFILE FUNCTIONS 

export interface TypeProfile {
  username: string
  avatar: string | null
  created_at: string
  friends_count: number
  is_friend: boolean
}

export async function getProfile(id: string) {
  const res = await fetch(`http://192.168.1.33:8000/profile/${id}`)
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  const data : TypeProfile = await res.json()
  return data
}

export function setUpProfile() {
  if (!localStorage.getItem('access-token')) return false
  if (localStorage.getItem('set-up-ignored')) return false
  return true
}

export async function friend(friend_id: string) {
  const token = localStorage.getItem('access-token')
  if (!token) return

  const res = await fetch(`http://192.168.1.33:8000/friend?friend_id=${friend_id}`, {
    method: "POST",
    headers: {"Authentication": `Bearer ${token}`}
  })

  if (!res.ok) {
    throw new Error("Błąd podczas dodawania znajomego")
  }
}

export async function unfriend(friend_id: string) {
  const token = localStorage.getItem('access-token')
  if (!token) return

  const res = await fetch(`http://192.168.1.33:8000/unfriend?friend_id=${friend_id}`, {
    method: "POST",
    headers: {"Authentication": `Bearer ${token}`}
  })

  if (!res.ok) {
    throw new Error("Błąd podczas dodawania znajomego")
  }
}

// NOTIFICATIONS 

export function getNotifications() {

}

