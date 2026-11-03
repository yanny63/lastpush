const API_URL = import.meta.env.VITE_BACKEND_ADDRESS

type ApiError = {
  detail: string;
}

export const WORKOUT_TIPS: string[] = [
  "Zacznij od kilku minut lekkiego ruchu i serii przygotowawczych. Rozgrzewka powinna przygotować Cię do dzisiejszych ćwiczeń.",
  "Wykonuj powtórzenia w kontrolowany sposób. Jeśli nie możesz utrzymać stabilnej techniki, zmniejsz ciężar.",
  "Oddychaj swobodnie i nie wstrzymuj oddechu dłużej, niż wymaga tego ruch. Przy ciężkich ćwiczeniach napnij tułów, by utrzymać stabilną pozycję.",
  "Dobierz zakres ruchu do ćwiczenia i swoich możliwości. Nie wymuszaj pozycji, która powoduje ból.",
  "W seriach roboczych zostaw zwykle kilka powtórzeń w zapasie. Nie musisz doprowadzać każdej serii do całkowitego zmęczenia.",
  "Odpoczywaj między seriami na tyle długo, by móc wykonać kolejną z dobrą techniką.",
  "Zapisuj ciężary i powtórzenia. To pomaga ocenić postępy i rozsądnie planować kolejne treningi.",
  "Gdy wszystkie serie wykonujesz pewnie i zgodnie z planem, stopniowo zwiększaj liczbę powtórzeń lub ciężar.",
  "Nie musisz zmieniać ćwiczeń co tydzień. Powtarzanie podobnego planu ułatwia naukę techniki i śledzenie postępów.",
  "Dostosuj trening do samopoczucia. Gorszy dzień może oznaczać lżejszy ciężar lub mniej serii.",
  "Zmęczenie mięśni podczas wysiłku jest częste, ale ostry lub narastający ból to sygnał, by przerwać ćwiczenie.",
  "Po treningu nie musisz od razu pić odżywki. Zadbaj o wystarczającą ilość białka i energii w ciągu dnia.",
  "Sen i regularne dni odpoczynku wspierają regenerację. Potrzebna ilość snu zależy od wieku i indywidualnych potrzeb.",
  "Spacer w dzień wolny to dobry sposób na lekką aktywność, jeśli masz na niego ochotę.",
  "Regularność jest ważniejsza niż idealny trening. Wróć do planu po przerwie bez nadrabiania wszystkiego naraz.",
  "Porównuj swoje wyniki przede wszystkim z własnymi wcześniejszymi treningami.",
  "Po treningu odłóż sprzęt na miejsce i zostaw stanowisko gotowe dla kolejnej osoby."
]

export type WorkoutSessionStatus = "in_progress" | "completed" | "abandoned";

export interface WorkoutSession {
  id: string
  schema_id: string
  workout_id: string
  workout_name: string
  started_at: string
  completed_at?: string
  status: WorkoutSessionStatus
  weekday?: number 
  exercises: SessionExercise[]
}

export interface SessionExercise {
  id: string
  exercise_name: string
  position: number
  image_url: string
  muscle_group: string
  target_sets: number
  target_reps_min: number
  target_reps_max: number
  rest_seconds: number
  completed_at?: string
  sets: ExerciseSet[]
}

export interface ExerciseSet {
  id: string
  set_number: number
  completed: boolean
  reps?: number
  weight_kg?: number
  rest_seconds?: number
  is_warmup?: boolean
  completed_at?: string
}

export interface Workout {
  id: string,
  name: string,
  created_at?: string,
  updated_at?: string,
  weekday?: number
  exercises: Exercises[]
}

export interface Exercises {
  exercise_name: string,
  position: string,
  muscle_group: string,
  target_sets: number,
  rest_seconds: number,
  target_reps_min: number,
  target_reps_max: number,
  image_url: string
}

export async function save_session(workoutId: string) {
  
}

export function get_most_common(exercises: SessionExercise[]) {
  const values = new Map()

  for (const e of exercises) {
    const value = e.muscle_group
    values.set(value, (values.get(e) || 0) + 1)
  }

  let most_commmon = null
  let max_count = 0

  for (const [e, c] of values) {
    if (c > max_count) {
      max_count = c
      most_commmon = e
    }
  }

  return most_commmon
}

export async function create_session(schema_id: string, name: string) {
  const token = localStorage.getItem("access-token")
  if (!token) return null
  const res = await fetch(`${API_URL}/session?schema_id=${schema_id}&name=${name}`, {
    method: "POST",
    headers: {"Authorization": `Bearer ${token}`}
  })
  if (!res.ok) {
    const d : ApiError = await res.json()
    throw new Error(d.detail)
  }
  return res.json()
}

export async function find_active_session(workoutId: string) {
  const token = localStorage.getItem("access-token")
  try {
    const res = await fetch(`${API_URL}/session/${workoutId}`, {
      headers: {"Authorization": `Bearer ${token}`}
    })
    if (!res.ok) {
      const data : ApiError = await res.json()
      throw new Error(data.detail)
    }
    return res.json()
  } catch (e) {}
}

export async function evaluateBodyPart() {
  return null
}

export function calculateDuration(workout: WorkoutSession | Workout) {
  if (!workout) return
  let d = 0
  workout.exercises.forEach((exercise) => {
    const rest = exercise.rest_seconds / 60
    const sets = exercise.target_sets
    d = d + rest * (sets - 1) + sets * 1
  })
  return d
}

export const equipment_photos = {
  "dumbbell": "https://images.unsplash.com/photo-1734630341082-0fec0e10126c?q=80&w=897&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1734630341082-0fec0e10126c?q=80&w=897&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "barbell": "https://images.unsplash.com/photo-1741478551825-e7e5c77a2247?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "kettlebell": "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=725&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "pulley": "https://images.unsplash.com/photo-1764426445439-681ca4a15c1d?q=80&w=671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "bands": "https://images.unsplash.com/photo-1663054015287-9f16708a9991?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "cardio": "https://images.unsplash.com/photo-1662386392754-c0fe8e9dc7af?q=80&w=437&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "mat": "https://images.unsplash.com/photo-1746796751590-a8c0f15d4900?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "medicine ball": "https://images.unsplash.com/photo-1765302762700-81992a568be5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "pull-up": "https://images.unsplash.com/photo-1772450014229-2a8b006893e9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
}

export function getExerciseLabel(exercises: SessionExercise[]) {
  const length = exercises.length
  if (length === 1) return `1 ćwiczenie`
  if ([2, 3, 4].includes(length)) return `${length} ćwiczenia`
  return `${length} ćwiczeń`
}