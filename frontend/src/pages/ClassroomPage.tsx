import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api, API, getApiError } from "../lib/api";
import { getList, type Course, type Lesson } from "../lib/types";

export function ClassroomPage() {
  const { id = "" } = useParams();
  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => { const { data } = await api.get(API.courses.byId(id)); return (data.course || data.data || data) as Course; },
    enabled: Boolean(id),
  });
  const { data: lessons = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => { const { data } = await api.get(API.lessons.byCourse(id)); return getList<Lesson>(data); },
    enabled: Boolean(id),
  });

  return <section className="container page-section classroom-page">
    <Link to={`/courses/${id}`} className="back-link"><ArrowLeft size={16}/> Back to course</Link>
    <div className="page-intro"><span className="eyebrow"><BookOpen size={14}/> LEARNOVA CLASSROOM</span><h1>{course?.title || "Your classroom"}</h1><p>{course?.description || "Your course lessons are collected here."}</p></div>
    {isLoading ? <div className="empty-state">Loading lessons...</div> : isError ? <div className="empty-state"><h3>Unable to load lessons</h3><p>{getApiError(error, "Make sure you're enrolled in this course and logged in as a student.")}</p><button className="btn btn-outline" onClick={() => void refetch()}>Try again</button></div> : lessons.length ? <div className="lesson-list">{lessons.map((lesson, index) => <article className="lesson-item" key={lesson._id}><span className="lesson-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{lesson.title}</h3><p>{lesson.content}</p></div><ChevronRight size={18}/></article>)}</div> : <div className="empty-state"><BookOpen size={30}/><h3>No lessons published yet</h3><p>Your teacher hasn't added lessons to this course.</p></div>}
  </section>;
}
