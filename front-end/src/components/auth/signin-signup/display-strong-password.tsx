import { ValidateDetailProps, DisplayStrongPasswordProps } from "@/lib/interface/interface"
import { CircleCheck, CircleX } from "lucide-react"

const ValidateDetail:ValidateDetailProps[] = [{
    text: 'Uppercase letter',
    name: 'hasUppercase'
  },
  {
    text: 'Lowercase letter',
    name: 'hasLowercase'
  },
  {
    text: 'Number',
    name: 'hasNumber'
  },
  {
    text: 'Special character (e.g. @$!%*?&)',
    name: 'hasSpecial'
  },
  {
    text: '8 characters or more',
    name: 'hasLength'
  }
]

export default function DisplayStrongPassword({ password } : DisplayStrongPasswordProps ) {

  return (
    <div>
      <ul className="flex flex-col gap-1 text-sm">
        {ValidateDetail.map((detail) => (
          <li 
            key={detail.name}
            className={`${password[detail.name] ? 'text-green-400 dark:text-main' : 'text-red-400 dark:text-secondary'} flex gap-2 items-center`}>
            {password[detail.name] ? (
              <CircleCheck size={20} />
            ) : (
              <CircleX size={20} />
            )}

            {detail.text}
          </li>
        ))}
      </ul>
    </div>
  )
}