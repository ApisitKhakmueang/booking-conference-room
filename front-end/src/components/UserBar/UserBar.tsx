import NotificationComp from "./Notification";
import UserIcon from "./UserIcon";
import Welcomeback from "./Welcomeback";

type Props = {
  isOpen: boolean;
  isMobile: boolean;
}

const MOCK_USER = {
  name: "Guyae",
  avatarUrl: "/userIcon/user_icon.jpg",
  email: 'guyae@example.com'
};

export default function UserBar({ isOpen, isMobile }: Props) {
  return (
    <div className={`fixed w-full transition-duration-300`}>
      <nav className={`w-full bg-slate-50 flex ${!isMobile
      ? isOpen
        ? "pl-70 justify-between"
        : "pl-23 justify-between"
      : 'justify-end'} p-5`}>

        {!isMobile && <Welcomeback isOpen={isOpen} MOCK_USER={MOCK_USER}></Welcomeback>}

        <div className="flex items-center gap-2">
          <div>
            <NotificationComp />
          </div>

          <div>
            <UserIcon MOCK_USER={MOCK_USER} />
          </div>
        </div>
      </nav>
    </div>
  )
}