import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Course } from "../lib/types";

const palettes = ["violet", "peach", "blue", "mint"];

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const palette = palettes[index % palettes.length];
  return (
    <motion.article
      className="course-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: (index % 6) * 0.04, duration: 0.35 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/courses/${course._id}`} className={`course-art ${palette}`}>
        <span className="art-orbit orbit-one" />
        <span className="art-orbit orbit-two" />
        <span className="art-label">LEARNOVA CLASSROOM</span>
        <span className="art-symbol">{["✳", "◈", "⌘", "✺"][index % 4]}</span>
        <span className="art-arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="course-info">
        <div className="course-meta"><span>COURSE</span><span><BookOpen size={13} /> Self-paced</span></div>
        <Link to={`/courses/${course._id}`}><h3>{course.title}</h3></Link>
        <p className="instructor">Instructor ID: {course.teacher}</p>
        <div className="course-bottom">
          <strong>{course.price === 0 ? "Free" : `${course.price.toLocaleString()} EGP`}</strong>
          <Link to={`/courses/${course._id}`} className="text-link">View course <ArrowUpRight size={14} /></Link>
        </div>
      </div>
    </motion.article>
  );
}
