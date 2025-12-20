import Button from "../ui/Button";

type Props = {
  MOCK_USER: {
    name: string;
    avatarUrl: string;
    email: string;
  };
}

export default function UserIcon({ MOCK_USER }: Props) {
  return (
    <>
      <Button size="userIcon" variant="userIconColor" className="flex items-center gap-2 rounded-full">
        <img src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} className="w-10 h-10 rounded-full" />

        <div className="flex flex-col items-start font-bold">
          {MOCK_USER.name}
          <span className="text-sm text-slate font-semibold">{MOCK_USER.email}</span>
        </div>
      </Button>
    </>
  )
}