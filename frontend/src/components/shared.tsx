import { IconArrowLeft, IconBarbell } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export function ReturnTo({ where, onClick }: { where?: string, onClick?: () => void }) {
  if (!where && !onClick) throw new Error("ReturnTo has to have at least one valid prop")
  return (
    <div className="b-t-c" onClick={onClick}>
      { where ? <Link to={where} className="b-t">
        <IconArrowLeft stroke={2} />
        <span>Wróć do treningów</span>
      </Link> :
      <div className="b-t">
        <IconArrowLeft stroke={2} />
        <span>Wróć do treningów</span>
      </div>}
    </div>
  )
}

export function WorkoutLogo() {
  return (
    <div className="w-i">
      <IconBarbell stroke={2} />
    </div>
  )
}

export function Circle() {
  return (
    <svg height={16} width={16} style={{ borderRadius: 'var(--radius-full)' }}>
      <circle r={8} cx={8} cy={8} fill="var(--color-green)" />
    </svg>
  )
}