import { createContext, useContext, useState, useEffect, createElement } from "react";
import type { ReactNode } from "react";

type ActiveUser = "Christopher" | "Tamara";

interface ActiveUserContextValue {
  activeUser: ActiveUser;
  setActiveUser: (u: ActiveUser) => void;
}

const ActiveUserContext = createContext<ActiveUserContextValue>({
  activeUser: "Christopher",
  setActiveUser: () => {},
});

function readStored(): ActiveUser {
  try {
    const stored = localStorage.getItem("activeUser");
    if (stored === "Christopher" || stored === "Tamara") return stored;
  } catch {}
  return "Christopher";
}

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUserState] = useState<ActiveUser>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem("activeUser", activeUser);
    } catch {}
  }, [activeUser]);

  function setActiveUser(u: ActiveUser) {
    setActiveUserState(u);
  }

  return createElement(
    ActiveUserContext.Provider,
    { value: { activeUser, setActiveUser } },
    children,
  );
}

export function useActiveUser(): ActiveUserContextValue {
  return useContext(ActiveUserContext);
}
