import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Pencil, Trash2, Save, X, Layers } from "lucide-react";
import { api, API, getApiError } from "../lib/api";
import type { Course, Lesson } from "../lib/types";
import { getList } from "../lib/types";
import { toast } from "sonner";

type CourseForm = { title: string; description: string; price: string };
type LessonForm = { title: string; content: string; courseId: string };

export function TeacherDashboardPage() {
  const qc = useQueryClient();
  const [courseForm, setCourseForm] = useState<CourseForm>({ title: "", description: "", price: "0" });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>({ title: "", content: "", courseId: "" });
  const [createdLessons, setCreatedLessons] = useState<Lesson[]>([]);

  const { data: courses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: async () => { const { data } = await api.get(API.courses.mine); return getList<Course>(data); },
  });

  const saveCourse = useMutation({
    mutationFn: async () => {
      const payload = { title: courseForm.title.trim(), description: courseForm.description.trim(), price: Number(courseForm.price) };
      if (editingCourse) return api.patch(API.courses.byId(editingCourse), payload);
      return api.post(API.courses.create, payload);
    },
    onSuccess: async () => { toast.success(editingCourse ? "Course updated." : "Course created."); setCourseForm({ title: "", description: "", price: "0" }); setEditingCourse(null); await qc.invalidateQueries({ queryKey: ["teacher-courses"] }); },
    onError: (error) => toast.error(getApiError(error, "Couldn't save course.")),
  });

  const deleteCourse = useMutation({
    mutationFn: (id: string) => api.delete(API.courses.byId(id)),
    onSuccess: async () => { toast.success("Course deleted."); await qc.invalidateQueries({ queryKey: ["teacher-courses"] }); },
    onError: (error) => toast.error(getApiError(error, "Couldn't delete course.")),
  });

  const createLesson = useMutation({
    mutationFn: async () => (await api.post(API.lessons.create, { title: lessonForm.title.trim(), content: lessonForm.content.trim(), courseId: lessonForm.courseId })).data,
    onSuccess: (data) => {
      const lesson = data.lesson as Lesson | undefined;
      if (lesson) setCreatedLessons((current) => [lesson, ...current]);
      toast.success("Lesson created.");
      setLessonForm((current) => ({ ...current, title: "", content: "" }));
    },
    onError: (error) => toast.error(getApiError(error, "Couldn't create lesson.")),
  });

  const editCourse = (course: Course) => {
    setEditingCourse(course._id);
    setCourseForm({ title: course.title, description: course.description, price: String(course.price) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <section className="container page-section teacher-page">
    <div className="page-intro"><span className="eyebrow"><Layers size={14}/> TEACHER WORKSPACE</span><h1>Build your <span className="gradient-text">classroom.</span></h1><p>Create courses, organize lesson content, and keep your teaching workspace up to date.</p></div>
    <div className="teacher-grid">
      <section className="profile-card">
        <div className="profile-card-heading"><div className="profile-icon"><Plus size={21}/></div><div><h2>{editingCourse ? "Edit course" : "Create a course"}</h2><p>Course details shown in the public catalog</p></div></div>
        <form className="form-stack" onSubmit={(e) => { e.preventDefault(); saveCourse.mutate(); }}>
          <label className="field-label">Course title<input required minLength={3} value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. TypeScript Fundamentals"/></label>
          <label className="field-label">Description<textarea required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={4} placeholder="What will students learn?"/></label>
          <label className="field-label">Price<input type="number" min="0" required value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}/></label>
          <div className="button-row"><button className="btn btn-primary" disabled={saveCourse.isPending}><Save size={16}/>{saveCourse.isPending ? "Saving..." : editingCourse ? "Save changes" : "Create course"}</button>{editingCourse && <button type="button" className="btn btn-outline" onClick={() => { setEditingCourse(null); setCourseForm({ title: "", description: "", price: "0" }); }}><X size={16}/> Cancel</button>}</div>
        </form>
      </section>
      <section className="profile-card">
        <div className="profile-card-heading"><div className="profile-icon"><BookOpen size={21}/></div><div><h2>Add a lesson</h2><p>Lessons are visible to enrolled students</p></div></div>
        <form className="form-stack" onSubmit={(e) => { e.preventDefault(); createLesson.mutate(); }}>
          <label className="field-label">Course<select required value={lessonForm.courseId} onChange={(e) => setLessonForm({ ...lessonForm, courseId: e.target.value })}><option value="">Choose a course</option>{courses.map((course) => <option value={course._id} key={course._id}>{course.title}</option>)}</select></label>
          <label className="field-label">Lesson title<input required value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title"/></label>
          <label className="field-label">Lesson content<textarea required rows={5} value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="Write the lesson content..."/></label>
          <button className="btn btn-primary" disabled={createLesson.isPending || !courses.length}><Plus size={16}/>{createLesson.isPending ? "Creating..." : "Add lesson"}</button>
        </form>
        <p className="muted-copy small-note">The current backend has no teacher endpoint to list existing lessons. Lessons created in this session appear below; they are not a complete persisted lesson list.</p>
        {createdLessons.map((lesson) => <article className="created-lesson" key={lesson._id}><strong>{lesson.title}</strong><span>{lesson.content.slice(0, 90)}{lesson.content.length > 90 ? "…" : ""}</span><div className="button-row"><button className="btn btn-outline btn-small" onClick={async () => { const title = window.prompt("New lesson title", lesson.title); if (title === null) return; const content = window.prompt("New lesson content", lesson.content); if (content === null) return; try { const { data } = await api.patch(API.lessons.byId(lesson._id), { title, content }); const updated = data.lesson as Lesson; setCreatedLessons((items) => items.map((item) => item._id === lesson._id ? updated : item)); toast.success("Lesson updated."); } catch (error) { toast.error(getApiError(error)); } }}>Edit</button><button className="btn btn-outline btn-small" onClick={async () => { if (!window.confirm("Delete this lesson?")) return; try { await api.delete(API.lessons.byId(lesson._id)); setCreatedLessons((items) => items.filter((item) => item._id !== lesson._id)); toast.success("Lesson deleted."); } catch (error) { toast.error(getApiError(error)); } }}>Delete</button></div></article>)}
      </section>
    </div>
    <div className="dashboard-section-head"><div><span className="eyebrow">YOUR CONTENT</span><h2>My courses</h2></div><span className="muted-copy">{courses.length} courses</span></div>
    {isLoading ? <div className="empty-state">Loading your courses...</div> : isError ? <div className="empty-state"><p>Couldn't load your courses.</p><button className="btn btn-outline" onClick={() => void refetch()}>Try again</button></div> : courses.length ? <div className="teacher-course-list">{courses.map((course) => <article className="teacher-course-row" key={course._id}><div><h3>{course.title}</h3><p>{course.description}</p><strong>{course.price === 0 ? "Free" : `${course.price.toLocaleString()} EGP`}</strong></div><div className="button-row"><button className="btn btn-outline btn-small" onClick={() => editCourse(course)}><Pencil size={14}/> Edit</button><button className="btn btn-outline btn-small danger-button" disabled={deleteCourse.isPending} onClick={() => { if (window.confirm("Delete this course? This may be blocked if it has enrollments or reviews.")) deleteCourse.mutate(course._id); }}><Trash2 size={14}/> Delete</button></div></article>)}</div> : <div className="empty-state"><h3>No courses yet</h3><p>Create your first course using the form above.</p></div>}
  </section>;
}
