type Props = {
  isOpen: boolean;
  MOCK_USER: {
    name: string;
    avatarUrl: string;
    email: string;
  };
}


export default function Welcomeback({ isOpen, MOCK_USER }: Props) {
  return (
    <div className={`flex flex-col font-semibold text-3xl ${isOpen ? "pl-5" : "pl-12"}`}>
      Welcome back, {MOCK_USER.name}!
      <span className="font-normal text-base text-slate">This is conference room booking system</span>
    </div>
  )
}