import React, { useState } from "react";
import { AlertCircle, CheckCircle, Lock, Send, Star, ThumbsUp, X } from "lucide-react";
import { Av } from "../../components/common";
import { P } from "../../constants/theme.constants";

type CourseReview = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  title: string;
  text: string;
  time: string;
  helpful: number;
  helpfulVoted: boolean;
};

const SEED_REVIEWS: CourseReview[] = [
  {
    id: "r1",
    name: "Marcus Johnson",
    initials: "MJ",
    rating: 5,
    title: "Exactly what business leaders need",
    text: "Exceptional course. The business application focus makes complex AI concepts immediately actionable. Dr. Chen's frameworks are ones I now use in every strategic conversation.",
    time: "2 weeks ago",
    helpful: 34,
    helpfulVoted: false,
  },
  {
    id: "r2",
    name: "Priya Sharma",
    initials: "PS",
    rating: 5,
    title: "Best AI course I've taken",
    text: "Dr. Chen explains AI in a way that actually makes sense for business leaders. The case studies are directly relevant to enterprise decision-making — not just academic exercises.",
    time: "1 month ago",
    helpful: 28,
    helpfulVoted: false,
  },
  {
    id: "r3",
    name: "Lena Mueller",
    initials: "LM",
    rating: 4,
    title: "Great depth, pacing could improve",
    text: "Content quality is superb. Module 3 was particularly impactful for me. I'd love to see slightly shorter video segments — some run a bit long without interaction breaks.",
    time: "6 weeks ago",
    helpful: 15,
    helpfulVoted: false,
  },
  {
    id: "r4",
    name: "James Okafor",
    initials: "JO",
    rating: 4,
    title: "Solid foundation for non-technical execs",
    text: "I came in with zero ML background and finished feeling genuinely confident discussing AI strategy with our engineering team. The ethical AI module is a must-read for any leader.",
    time: "2 months ago",
    helpful: 21,
    helpfulVoted: false,
  },
  {
    id: "r5",
    name: "Sofia Andersen",
    initials: "SA",
    rating: 3,
    title: "Good but expected more depth on LLMs",
    text: "Comprehensive overview, but given the current landscape I was hoping for more on large language models and generative AI. The foundational content is strong — just feels a bit dated in places.",
    time: "3 months ago",
    helpful: 9,
    helpfulVoted: false,
  },
];

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform"
          style={{ transform: hover >= n || value >= n ? "scale(1.15)" : "scale(1)" }}
        >
          <Star
            size={22}
            className={hover >= n || value >= n ? "text-amber-400 fill-amber-400" : "text-gray-300"}
            style={{ transition: "color 120ms ease, fill 120ms ease" }}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsTab({ isEnrolled }: { isEnrolled: boolean }) {
  const [reviews, setReviews] = useState<CourseReview[]>(SEED_REVIEWS);
  const [myRating, setMyRating] = useState(0);
  const [myTitle, setMyTitle] = useState("");
  const [myText, setMyText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "highest" | "lowest">("recent");
  const [filterStar, setFilterStar] = useState(0);

  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));
  const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;

  const sorted = [...reviews]
    .filter((r) => filterStar === 0 || r.rating === filterStar)
    .sort((a, b) => {
      if (sortBy === "helpful") return b.helpful - a.helpful;
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0; // recent — keep seed order (newest first by id)
    });

  function handleSubmit() {
    if (!isEnrolled) return;
    if (!myRating || !myText.trim()) return;
    const newR: CourseReview = {
      id: `r${Date.now()}`,
      name: "Alex Mercer",
      initials: "AM",
      rating: myRating,
      title: myTitle || "My Review",
      text: myText.trim(),
      time: "Just now",
      helpful: 0,
      helpfulVoted: false,
    };
    setReviews((prev) => [newR, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    setMyRating(0);
    setMyTitle("");
    setMyText("");
  }

  function toggleHelpful(id: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              helpful: r.helpfulVoted ? r.helpful - 1 : r.helpful + 1,
              helpfulVoted: !r.helpfulVoted,
            }
          : r,
      ),
    );
  }

  return (
    <div className="space-y-5">
      {/* Rating summary */}
      <div
        className="flex items-start gap-6 p-4 rounded-xl"
        style={{ background: P.bg, border: `1px solid ${P.border}` }}
      >
        <div className="text-center flex-shrink-0">
          <p
            className="text-4xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {avgRating.toFixed(1)}
          </p>
          <div className="flex items-center justify-center gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={12}
                className={
                  avgRating >= n
                    ? "text-amber-400 fill-amber-400"
                    : avgRating >= n - 0.5
                      ? "text-amber-300 fill-amber-300"
                      : "text-gray-200"
                }
              />
            ))}
          </div>
          <p className="text-[10px]" style={{ color: P.textMuted }}>
            Course Rating
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingCounts.map(({ star, count }) => (
            <button
              key={star}
              onClick={() => setFilterStar(filterStar === star ? 0 : star)}
              className="w-full flex items-center gap-2 group"
            >
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 7, background: P.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                    background: filterStar === star ? P.gold : P.olive,
                  }}
                />
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star size={9} className="text-amber-400 fill-amber-400" />
                <span className="text-[10px] w-3" style={{ color: P.textMuted }}>
                  {star}
                </span>
              </div>
              <span className="text-[10px] w-4 text-right" style={{ color: P.textMuted }}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Write review CTA */}
      {isEnrolled && !submitted && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: P.lightSage,
            color: P.darkOlive,
            border: `1px solid ${P.sage}60`,
            transition: "background 150ms ease, transform 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = P.sage + "50";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = P.lightSage;
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
        >
          <Star size={14} style={{ color: P.olive }} /> Write a Review
        </button>
      )}

      {!isEnrolled && !showForm && (
        <button
          type="button"
          disabled
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          style={{
            background: P.bg,
            color: P.textMuted,
            border: `1px solid ${P.border}`,
            opacity: 0.85,
          }}
        >
          <Lock size={14} /> Review locked until enrollment
        </button>
      )}

      {submitted && (
        <div
          className="flex items-center gap-2.5 p-3 rounded-xl"
          style={{ background: "#F0FAF0", border: `1px solid #B6D9B6` }}
        >
          <CheckCircle size={15} style={{ color: "#5A7A2A" }} />
          <p className="text-xs font-medium" style={{ color: "#3D6B3D" }}>
            Your review has been posted. Thank you for your feedback!
          </p>
        </div>
      )}

      {!isEnrolled && (
        <div
          className="flex items-center gap-2.5 p-3 rounded-xl"
          style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
        >
          <AlertCircle size={14} style={{ color: P.gold, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: "#7A5A10" }}>
            Enroll in this course to leave a review.
          </p>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ background: "white", borderColor: P.sage }}
        >
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Your Review
          </p>

          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: P.textMid }}>
              Overall Rating *
            </p>
            <StarPicker value={myRating} onChange={setMyRating} />
            {myRating > 0 && (
              <p className="text-[11px] mt-1" style={{ color: P.textMuted }}>
                {["", "Poor", "Below average", "Average", "Good", "Excellent"][myRating]}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: P.textMid }}>
              Review Title
            </label>
            <input
              value={myTitle}
              onChange={(e) => setMyTitle(e.target.value)}
              placeholder="Summarise your experience..."
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              style={{ border: `1px solid ${P.border}`, background: P.bg, color: P.text }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: P.textMid }}>
              Your Comment *
            </label>
            <textarea
              value={myText}
              onChange={(e) => setMyText(e.target.value)}
              rows={4}
              placeholder="What did you think about the course content, instructor, and learning experience?"
              className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{ border: `1px solid ${P.border}`, background: P.bg, color: P.text }}
            />
            <p className="text-[10px] mt-1 text-right" style={{ color: P.textMuted }}>
              {myText.length} / 500
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleSubmit}
              disabled={!myRating || !myText.trim()}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5"
              style={{
                background: !myRating || !myText.trim() ? P.sage : P.olive,
                opacity: !myRating || !myText.trim() ? 0.55 : 1,
                transition: "background 150ms ease",
              }}
            >
              <Send size={13} /> Submit Review
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-lg"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sort & filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-medium" style={{ color: P.textMuted }}>
          Sort by:
        </p>
        {(["recent", "helpful", "highest", "lowest"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg capitalize transition-colors"
            style={
              sortBy === opt
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            {opt}
          </button>
        ))}
        {filterStar > 0 && (
          <button
            onClick={() => setFilterStar(0)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg ml-auto"
            style={{ background: P.goldLight, color: "#8A6A1A", border: `1px solid ${P.gold}40` }}
          >
            <Star size={9} className="fill-amber-400 text-amber-400" /> {filterStar} stars only{" "}
            <X size={9} />
          </button>
        )}
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {sorted.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: P.textMuted }}>
            No reviews match this filter.
          </p>
        )}
        {sorted.map((review) => (
          <div
            key={review.id}
            className="p-4 rounded-xl border"
            style={{ background: "white", borderColor: P.border }}
          >
            <div className="flex items-start gap-3 mb-2">
              <Av
                initials={review.initials}
                size={32}
                color={review.initials === "AM" ? P.gold : P.sage}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {review.name}
                  </p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: P.textMuted }}>
                    {review.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={10}
                      className={
                        review.rating >= n ? "text-amber-400 fill-amber-400" : "text-gray-200"
                      }
                    />
                  ))}
                  <span className="text-[10px] ml-1 font-medium" style={{ color: P.textMuted }}>
                    {review.rating}.0
                  </span>
                </div>
              </div>
            </div>
            {review.title && (
              <p className="text-xs font-semibold mb-1" style={{ color: P.text }}>
                {review.title}
              </p>
            )}
            <p className="text-xs leading-relaxed mb-3" style={{ color: P.textMid }}>
              {review.text}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                Helpful?
              </p>
              <button
                onClick={() => toggleHelpful(review.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors"
                style={
                  review.helpfulVoted
                    ? {
                        background: P.lightSage,
                        color: P.darkOlive,
                        border: `1px solid ${P.sage}60`,
                      }
                    : {
                        background: "transparent",
                        color: P.textMuted,
                        border: `1px solid ${P.border}`,
                      }
                }
              >
                <ThumbsUp size={10} /> Yes ({review.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
