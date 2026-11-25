import { useQuery } from "@tanstack/react-query";
import { Activity, BookOpen, Star, Users } from "lucide-react";
import { api, API, getApiError } from "../lib/api";
import type { AdminStats } from "../lib/types";

export function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get(API.admin.stats)).data as { stats?: AdminStats } & AdminStats,
  });
  const stats = (data?.stats || data) as AdminStats | undefined;

  if (isLoading) return <section className="container page-section"><div className="empty-state">Loading platform statistics...</div></section>;
  if (isError || !stats) return <section className="container page-section"><div className="empty-state"><h2>Couldn't load admin dashboard</h2><p>{getApiError(error, "Check that this account has the admin role.")}</p><button className="btn btn-outline" onClick={() => void refetch()}>Try again</button></div></section>;

  const cards = [
    { label: "Total users", value: stats.users.totalUsers, icon: Users },
    { label: "Courses", value: stats.courses.totalCourses, icon: BookOpen },
    { label: "Enrollments", value: stats.enrollments.totalEnrollments, icon: Activity },
    { label: "Average rating", value: stats.reviews.averageRating.toFixed(1), icon: Star },
  ];
  return <section className="container page-section admin-page">
    <div className="page-intro"><span className="eyebrow">PLATFORM OVERVIEW</span><h1>Admin <span className="gradient-text">dashboard.</span></h1><p>A live overview of Learnova's users, courses, enrollments, and learner feedback.</p></div>
    <div className="stats-grid admin-stats-grid">{cards.map(({ label, value, icon: Icon }) => <div className="stat-card" key={label}><span className="stat-icon"><Icon/></span><small>{label}</small><strong>{value}</strong></div>)}</div>
    <div className="admin-breakdown"><article className="profile-card"><h2>User breakdown</h2><div className="admin-stat-line"><span>Students</span><strong>{stats.users.totalStudents}</strong></div><div className="admin-stat-line"><span>Teachers</span><strong>{stats.users.totalTeachers}</strong></div><div className="admin-stat-line"><span>Total reviews</span><strong>{stats.reviews.totalReviews}</strong></div></article><article className="profile-card"><h2>Popular courses</h2>{stats.popularCourses?.length ? stats.popularCourses.map((course, index) => <div className="popular-course-row" key={course.courseId}><span>{String(index + 1).padStart(2, "0")}</span><strong>{course.title}</strong><small>{course.totalEnrollments} enrollments</small></div>) : <p className="muted-copy">No enrollment data yet.</p>}</article></div>
    <p className="muted-copy small-note">This dashboard uses the statistics endpoint currently available in the backend. User management and role assignment are not supported by the API.</p>
  </section>;
}
