import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Star, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { api, API, getApiError } from "../lib/api";
import type { Course, Enrollment, Review } from "../lib/types";
import { getList } from "../lib/types";
import { useAuth } from "../features/auth/AuthProvider";
import { toast } from "sonner";

export function CourseDetailsPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data } = await api.get(API.courses.byId(id));
      return (data.course || data.data || data) as Course;
    },
    enabled: Boolean(id),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const { data } = await api.get(API.enrollments.mine);
      return getList<Enrollment>(data);
    },
    enabled: user?.role === "student",
  });

  const { data: reviewData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => (await api.get(API.reviews.byCourse(id))).data,
    enabled: Boolean(user && id),
  });
  const reviews = getList<Review>(reviewData);
  const ownReview = reviews.find((review) =>
    typeof review.student === "string" ? review.student === user?._id : review.student?._id === user?._id
  );
  const averageRating = Number(reviewData?.averageRating || 0);
  const enrolled = enrollments.some((item) =>
    typeof item.course === "string" ? item.course === id : item.course?._id === id
  );

  const enrollmentMutation = useMutation({
    mutationFn: () => api.post(API.enrollments.create, { courseId: id }, {
      headers: { "Idempotency-Key": crypto.randomUUID() },
    }),
    onSuccess: async () => {
      toast.success("You're enrolled in this course.");
      await queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
    onError: (error) => {
      const message = getApiError(error, "Couldn't enroll in this course.");
      if (message.toLowerCase().includes("already enrolled")) {
        toast.info("You're already enrolled in this course.");
        void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      } else toast.error(message);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => api.delete(API.reviews.byId(reviewId)),
    onSuccess: async () => {
      toast.success("Review deleted.");
      await queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: (error) => toast.error(getApiError(error, "Couldn't delete your review.")),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (editingReviewId) {
        await api.patch(API.reviews.byId(editingReviewId), { rating, comment: comment.trim() });
      } else {
        await api.post(API.reviews.create, { courseId: id, rating, ...(comment.trim() ? { comment: comment.trim() } : {}) });
      }
    },
    onSuccess: async () => {
      toast.success(editingReviewId ? "Review updated." : "Review submitted.");
      setComment("");
      setEditingReviewId(null);
      await queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: (error) => toast.error(getApiError(error, "Couldn't submit your review.")),
  });

  if (isLoading) return <div className="container page-section"><div className="skeleton-detail" /></div>;
  if (isError || !course) return <div className="container page-section empty-state"><h2>Course unavailable</h2><Link to="/courses" className="text-link">Back to courses <ArrowLeft size={16} /></Link></div>;

  return (
    <section className="container page-section">
      <Link to="/courses" className="back-link"><ArrowLeft size={16} /> All courses</Link>
      <div className="detail-layout">
        <div>
          <div className="detail-art"><span className="eyebrow">LEARNOVA COURSE</span><span className="detail-art-symbol">✳</span><span className="detail-art-bottom">LEARNOVA CLASSROOM</span></div>
          <div className="detail-body">
            <span className="eyebrow">ABOUT THIS COURSE</span>
            <h2>What you'll explore</h2>
            <p>{course.description}</p>
            <div className="detail-perks"><span><CheckCircle2 /> Learn at your own pace</span><span><CheckCircle2 /> Practical knowledge</span><span><CheckCircle2 /> Access to course lessons after enrollment</span></div>
          </div>
          <section className="reviews-section">
            <div className="dashboard-section-head"><div><span className="eyebrow">LEARNER FEEDBACK</span><h2>Reviews</h2></div><span className="review-average"><Star size={16} fill="currentColor" /> {averageRating ? averageRating.toFixed(1) : "New"} · {reviewData?.totalReviews ?? reviews.length} reviews</span></div>
            {!user ? <p className="muted-copy">Log in to view learner reviews.</p> : (
              <>
                {user.role === "student" && enrolled && !ownReview && (
                  <form className="review-form" onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate(); }}>
                    <label>Rate this course
                      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select>
                    </label>
                    <label>Your comment <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Share what you learned..." /></label>
                    <button className="btn btn-primary" disabled={reviewMutation.isPending}>Submit review</button>
                  </form>
                )}
                {ownReview && <div className="own-review-actions"><span className="muted-copy">You've reviewed this course.</span><button className="btn btn-outline" onClick={() => { setEditingReviewId(ownReview._id); setRating(ownReview.rating); setComment(ownReview.comment || ""); }}>Edit my review</button><button className="btn btn-outline danger-button" disabled={deleteReviewMutation.isPending} onClick={() => { if (window.confirm("Delete your review?")) deleteReviewMutation.mutate(ownReview._id); }}>Delete review</button></div>}
                {editingReviewId && <form className="review-form" onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate(); }}>
                  <label>Update rating<select value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>
                  <label>Update comment<textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000}/></label>
                  <div className="button-row"><button className="btn btn-primary" disabled={reviewMutation.isPending}>Save review</button><button type="button" className="btn btn-outline" onClick={() => { setEditingReviewId(null); setComment(""); }}>Cancel</button></div>
                </form>}
                <div className="review-list">
                  {reviews.length ? reviews.map((review) => <article className="review-card" key={review._id}><div className="review-card-head"><strong>{typeof review.student === "string" ? "Learner" : review.student.name}</strong><span><Star size={13} fill="currentColor" /> {review.rating}/5</span></div><p>{review.comment || "No written comment."}</p></article>) : <p className="muted-copy">No reviews yet.</p>}
                </div>
              </>
            )}
          </section>
        </div>
        <aside className="enroll-panel">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>{course.title}</h1>
          <div className="detail-stats"><span><Star size={15} /> {averageRating ? averageRating.toFixed(1) : "New"} rating</span><span><Users size={15} /> {reviewData?.totalReviews ?? 0} reviews</span><span><BookOpen size={15} /> Course lessons</span></div>
          <div className="enroll-price">{course.price === 0 ? "Free" : `${course.price.toLocaleString()} EGP`}<small> one-time</small></div>
          {user?.role === "student" ? enrolled ? <Link className="btn btn-primary btn-lg full-width" to={`/courses/${id}/learn`}>Go to classroom <ArrowUpRight size={17} /></Link> : <button className="btn btn-primary btn-lg full-width" onClick={() => enrollmentMutation.mutate()} disabled={enrollmentMutation.isPending}>{enrollmentMutation.isPending ? "Enrolling..." : "Enroll now"} <ArrowUpRight size={17} /></button> : !user ? <button className="btn btn-primary btn-lg full-width" onClick={() => navigate("/login")}>Log in to enroll <ArrowUpRight size={17} /></button> : <p className="muted-copy">Only student accounts can enroll in courses.</p>}
          <p className="secure-note">A better skill starts with one step.</p>
        </aside>
      </div>
    </section>
  );
}
