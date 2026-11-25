import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
export function Footer() {
  return <footer className="footer"><div className="container footer-inner"><div><Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>learnova<span className="brand-dot">.</span></span></Link><p>Make room for what’s next.</p></div><div className="footer-links"><Link to="/courses">Explore courses</Link><a href="mailto:hello@learnova.dev">Contact <ArrowUpRight size={14}/></a></div><span className="copyright">© {new Date().getFullYear()} Learnova</span></div></footer>;
}