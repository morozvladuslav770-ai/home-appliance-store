import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const { pathname, state } = useLocation();
  const scrollTarget = (state as { scroll?: string } | null)?.scroll;
  const previous = useRef(pathname);

  // При переході на іншу сторінку повертаємось нагору (крім переходу до каталогу)
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (!scrollTarget) window.scrollTo(0, 0);
  }, [pathname, scrollTarget]);

  return (
    <div id="top">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
