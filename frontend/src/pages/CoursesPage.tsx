import { Search, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, API } from "../lib/api";
import { getList, type Course } from "../lib/types";
import { CourseCard } from "../components/CourseCard";

const PAGE_SIZE = 9;

export function CoursesPage() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price">("createdAt");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, minPrice, maxPrice, sortBy, order]);

  const { data: courses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["courses", search, minPrice, maxPrice, sortBy, order, page],
    queryFn: async () => {
      const { data } = await api.get(API.courses.all, {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(minPrice ? { minPrice: Number(minPrice) } : {}),
          ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
          sortBy,
          order,
        },
      });
      return getList<Course>(data);
    },
  });

  const hasNextPage = courses.length === PAGE_SIZE;

  return (
    <section className="page-section container">
      <div className="page-intro">
        <span className="eyebrow"><Sparkles size={14} /> THE COURSE LIBRARY</span>
        <h1>Find your next <span className="gradient-text">thing.</span></h1>
        <p>Fresh ideas, useful skills, and expert-led paths to help you grow.</p>
      </div>

      <div className="catalog-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." />
        </label>
        <span className="catalog-count">{courses.length} courses on this page</span>
      </div>

      <div className="catalog-filters">
        <span className="filter-heading"><SlidersHorizontal size={16} /> Refine results</span>
        <label>Min price <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" /></label>
        <label>Max price <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" /></label>
        <label>Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "createdAt" | "price")}>
            <option value="createdAt">Newest</option><option value="price">Price</option>
          </select>
        </label>
        <label>Order
          <select value={order} onChange={(e) => setOrder(e.target.value as "asc" | "desc")}>
            <option value="desc">Descending</option><option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="course-grid">{[1,2,3,4,5,6].map((n) => <div className="skeleton-card" key={n}><div /><span /><span /></div>)}</div>
      ) : isError ? (
        <div className="empty-state"><h3>We couldn't load courses</h3><p>Check that the API is running and try again.</p><button className="btn btn-outline" onClick={() => void refetch()}>Try again</button></div>
      ) : courses.length ? (
        <>
          <div className="course-grid">{courses.map((course, index) => <CourseCard key={course._id} course={course} index={index} />)}</div>
          <div className="pagination">
            <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /> Previous</button>
            <span>Page {page}</span>
            <button className="btn btn-outline" disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
          </div>
        </>
      ) : (
        <div className="empty-state"><h3>No courses found</h3><p>Try changing your search or price filters.</p><button className="btn btn-outline" onClick={() => { setSearch(""); setMinPrice(""); setMaxPrice(""); setPage(1); }}>Clear filters</button></div>
      )}
    </section>
  );
}
