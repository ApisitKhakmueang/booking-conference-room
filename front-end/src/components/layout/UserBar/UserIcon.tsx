import Button from "../../ui/Button";

type Props = {
  MOCK_USER: {
    name: string;
    avatarUrl: string;
    email: string;
  };
  isMobile?: boolean;
}

export default function UserIcon({ MOCK_USER, isMobile }: Props) {
  return (
    <>
      <Button size="userIcon" variant="userIconColor" className={`flex items-center gap-2 rounded-full ${!isMobile ? 'pr-5' : 'p-1.5'}`}>
        <img src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} className="w-10 h-10 rounded-full object-cover" />

        <div className="lg:flex lg:flex-col lg:items-start hidden font-bold">
          {MOCK_USER.name}
          <span className="text-sm text-slate font-semibold">{MOCK_USER.email}</span>
        </div>
      </Button>
    </>
  )
}