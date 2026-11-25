import { ArrowRight, ArrowUpRight, Brain, CheckCircle2, Play, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const highlights = [{ icon: Brain, title: "Learn by doing", text: "Build practical skills with lessons designed around real outcomes." }, { icon: Users, title: "A community that gets it", text: "Keep your momentum with instructors and curious learners." }, { icon: Zap, title: "Your pace, your path", text: "Pick up where you left off and make learning fit your life." }];
const tracks = [{ n:"01", title:"Design & creativity", count:"Explore courses", color:"track-purple" }, { n:"02", title:"Development", count:"Explore courses", color:"track-orange" }, { n:"03", title:"Business & growth", count:"Explore courses", color:"track-blue" }];
export function HomePage() {
  return <div>
    <section className="hero-section"><div className="hero-glow glow-a"/><div className="hero-glow glow-b"/><div className="container hero-grid">
      <div className="hero-copy"><motion.div className="eyebrow" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}><Sparkles size={14}/> THE NEXT CHAPTER STARTS HERE</motion.div>
        <motion.h1 initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:.08 }}>Make your next skill<br/><span className="gradient-text">your best one.</span></motion.h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.18 }}>Curated courses, inspiring teachers, and a little momentum. Everything you need to turn “someday” into “I did it.”</motion.p>
        <motion.div className="hero-buttons" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.26 }}><Link to="/courses" className="btn btn-primary btn-lg">Explore courses <ArrowUpRight size={17}/></Link><a href="#how-it-works" className="btn btn-outline btn-lg"><Play size={15}/> How it works</a></motion.div>
        <div className="hero-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><div><strong>Keep growing, together</strong><small>One lesson at a time.</small></div></div>
      </div>
      <motion.div className="hero-visual" initial={{ opacity:0, scale:.94, rotate:2 }} animate={{ opacity:1, scale:1, rotate:0 }} transition={{ duration:.7, delay:.15 }}>
        <div className="visual-backdrop"/><div className="floating-note note-top"><span className="note-icon"><CheckCircle2 size={16}/></span><div><strong>Small steps add up</strong><small>Your streak is waiting</small></div></div>
        <div className="hero-window"><div className="window-top"><div className="window-dots"><i/><i/><i/></div><span>YOUR LEARNING SPACE</span><span className="window-menu">•••</span></div>
          <div className="window-content"><div className="window-kicker">MONDAY MOTIVATION</div><h3>Ideas become<br/>skills here.</h3><p>Pick a path. Find your flow.</p><div className="window-progress"><span/><span/><span/><span/><span/><span/><span/></div><div className="window-foot"><span>YOUR WEEKLY GOAL</span><strong>4 / 5 hours</strong></div></div>
          <div className="window-decoration">✳</div></div>
        <div className="floating-note note-bottom"><span className="note-score">92%</span><div><strong>You're on track</strong><small>Keep the good energy</small></div></div>
        <div className="visual-spark spark-one">✦</div><div className="visual-spark spark-two">✳</div>
      </motion.div>
    </div><div className="container hero-bottom"><span>BUILT FOR THE CURIOUS</span><div><span>DESIGN</span><span>TECHNOLOGY</span><span>BUSINESS</span><span>CREATIVITY</span></div></div></section>
    <section className="section container" id="how-it-works"><div className="section-heading"><div><span className="eyebrow">A BETTER WAY TO GROW</span><h2>Learning that moves<br/><span className="muted-heading">you forward.</span></h2></div><p>Less endless scrolling. More meaningful progress. Find the knowledge you need and put it to work.</p></div>
      <div className="feature-grid">{highlights.map((item,i)=><motion.div className="feature-card" key={item.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}}><span className="feature-icon"><item.icon size={21}/></span><span className="feature-number">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p><ArrowUpRight className="feature-arrow" size={18}/></motion.div>)}</div>
    </section>
    <section className="tracks-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">FIND YOUR DIRECTION</span><h2>What are you curious<br/>about <span className="gradient-text">today?</span></h2></div><Link to="/courses" className="text-link">Browse all courses <ArrowRight size={16}/></Link></div><div className="tracks-list">{tracks.map(t=><Link to="/courses" className={`track-row ${t.color}`} key={t.n}><span className="track-n">{t.n}</span><strong>{t.title}</strong><span className="track-count">{t.count}</span><ArrowUpRight className="track-arrow"/></Link>)}</div></div></section>
    <section className="cta-section container"><div className="cta-card"><div className="cta-orb"/><span className="eyebrow">YOUR FUTURE SELF SAYS THANKS</span><h2>One curious click<br/>can change a lot.</h2><p>Start with one course. See where it takes you.</p><Link to="/register" className="btn btn-light btn-lg">Start learning <ArrowUpRight size={17}/></Link></div></section>
  </div>;
}