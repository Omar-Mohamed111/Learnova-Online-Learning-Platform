import { ArrowUpRight, BookOpen, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { api, API } from "../lib/api";
import { getList, type Enrollment } from "../lib/types";

export function DashboardPage() {
  const { user } = useAuth();
  const {
    data: enrollments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const { data } = await api.get(API.enrollments.mine);
      return getList<Enrollment>(data);
    },
    enabled: user?.role === "student",
  });
  const validEnrollments = enrollments.filter(
    (item) => item.course && typeof item.course !== "string",
  );

  return (
    <section className="container page-section dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> YOUR LEARNING SPACE
          </span>
          <h1>
            Good to see you,{" "}
            <span className="gradient-text">
              {user?.name?.split(" ")[0] || "learner"}.
            </span>
          </h1>
          <p>
            Your courses are waiting. Keep moving forward, one lesson at a time.
          </p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          Find a new course <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">
            <BookOpen />
          </span>
          <small>Enrolled courses</small>
          <strong>{validEnrollments.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-icon peach-icon">
            <PlayCircle />
          </span>
          <small>Available lessons</small>
          <strong>—</strong>
          <em>Open a classroom to learn</em>
        </div>
        <div className="stat-card">
          <span className="stat-icon mint-icon">
            <Sparkles />
          </span>
          <small>Learning progress</small>
          <strong>—</strong>
          <em>Progress tracking isn't available yet</em>
        </div>
      </div>
      <div className="dashboard-section-head">
        <div>
          <span className="eyebrow">PICK UP THE MOMENTUM</span>
          <h2>Continue learning</h2>
        </div>
        <Link to="/courses" className="text-link">
          Explore more <ArrowUpRight size={16} />
        </Link>
      </div>
      {isLoading ? (
        <div className="course-grid">
          {[1, 2, 3].map((n) => (
            <div className="skeleton-card" key={n}>
              <div />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="empty-state">
          <h3>Couldn't load your enrollments</h3>
          <button className="btn btn-outline" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : validEnrollments.length ? (
        <div className="course-grid">
          {validEnrollments.map((enrollment, index) => {
            const course = enrollment.course as Exclude<
              Enrollment["course"],
              string
            >;
            return (
              <article
                className="course-card enrolled-course-card"
                key={enrollment._id}
              >
                <Link
                  to={`/courses/${course._id}`}
                  className={`course-art ${["violet", "peach", "blue", "mint"][index % 4]}`}
                >
                  <span className="art-label">YOUR CLASSROOM</span>
                  <span className="art-symbol">✳</span>
                  <span className="art-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
                <div className="course-info">
                  <div className="course-meta">
                    <span>ENROLLED</span>
                    <span>
                      <BookOpen size={13} /> Learning
                    </span>
                  </div>
                  <Link to={`/courses/${course._id}`}>
                    <h3>{course.title}</h3>
                  </Link>
                  <p className="instructor">
                    Enrolled{" "}
                    {enrollment.createdAt
                      ? new Date(enrollment.createdAt).toLocaleDateString()
                      : "successfully"}
                  </p>
                  <div className="course-bottom">
                    <strong>
                      {course.price === 0
                        ? "Free"
                        : `${course.price.toLocaleString()} EGP`}
                    </strong>
                    <Link
                      to={`/courses/${course._id}/learn`}
                      className="text-link"
                    >
                      Open class <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state dashboard-empty">
          <span className="empty-icon">
            <PlayCircle size={28} />
          </span>
          <h3>Your learning journey starts here</h3>
          <p>Enroll in a course and it will show up here.</p>
          <Link to="/courses" className="btn btn-primary">
            Explore courses <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      {enrollments.length > validEnrollments.length && (
        <p className="muted-copy">
          Some enrollment records did not include populated course details.
          Refresh after checking the API response.
        </p>
      )}
    </section>
  );
}
