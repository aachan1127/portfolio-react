import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFilePen,
  faArrowRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  return (
    <header
      className={`siteHeader ${isHomePage ? "isHomeHeader" : "isSubPageHeader"} ${
        isScrolled ? "isScrolled" : ""
      } ${isMenuOpen ? "isMenuOpen" : ""}`}
    >
      <Link to="/" className="siteLogo" onClick={() => setIsMenuOpen(false)}>
        {isScrolled || !isHomePage ? (
          "Akane Yamamoto"
        ) : (
          <>
            Akane
            <br />
            Yamamoto
          </>
        )}
      </Link>

      <div className="mobileMenuArea">
        <button
          type="button"
          className={`hamburgerButton ${isMenuOpen ? "isOpen" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニューを開閉する"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`siteNav ${isMenuOpen ? "isOpen" : ""}`}>
          <a href="/#about" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="/#study" onClick={() => setIsMenuOpen(false)}>
            Study
          </a>
          <a href="/#works" onClick={() => setIsMenuOpen(false)}>
            Works
          </a>
          <a href="/#skills" onClick={() => setIsMenuOpen(false)}>
            Skills
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
