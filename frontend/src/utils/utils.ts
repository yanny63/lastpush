import type { UserData } from "../contexts/userContext"
const API_URL = import.meta.env.VITE_BACKEND_ADDRESS

type ApiError = {
  detail: string;
}

export async function login(identifier: string, password: string, getUser: () => Promise<UserData | null>) {
  if (localStorage.getItem('access-token')) return

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      identifier, password
    })
  })
  if (!res.ok) {
    const error : ApiError = await res.json()
    throw new Error(error.detail)
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
  const res = await fetch(`${API_URL}/profile/${id}`)
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

  const res = await fetch(`${API_URL}/friend?friend_id=${friend_id}`, {
    method: "POST",
    headers: {"Authorization": `Bearer ${token}`}
  })

  if (!res.ok) {
    const error : ApiError = await res.json()
    throw new Error(error.detail)
  }
}

export async function unfriend(friend_id: string) {
  const token = localStorage.getItem('access-token')
  if (!token) return

  const res = await fetch(`${API_URL}/unfriend?friend_id=${friend_id}`, {
    method: "POST",
    headers: {"Authorization": `Bearer ${token}`}
  }) 

  if (!res.ok) {
    const error : ApiError = await res.json()
    throw new Error(error.detail)
  }
}

// NOTIFICATIONS 

export function getNotifications() {

}

