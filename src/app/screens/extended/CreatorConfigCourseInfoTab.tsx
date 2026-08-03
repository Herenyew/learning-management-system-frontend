import { Input, P, Plus, Select, Textarea, X } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigCourseInfoTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "course-info" && (
        <div className="max-w-2xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Course Information
          </h2>
          <Input label="Course Title" value="AI & ML for Business Leaders" required />
          <Textarea
            label="Course Description"
            placeholder="Describe what learners will gain from this course…"
            rows={4}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Difficulty Level"
              options={["Beginner", "Intermediate", "Advanced"]}
              required
            />
            <Select
              label="Category"
              options={[
                "Technology",
                "Leadership",
                "Compliance",
                "Finance",
                "Design",
                "Management",
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Estimated Duration" placeholder="e.g. 8h 30m" />
            <Input label="Contact Person" placeholder="Name or email of course contact" />
          </div>
          <Input label="Course Thumbnail URL" placeholder="https://…" />
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["AI", "Machine Learning", "Strategy", "Leadership", "Innovation"].map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                  style={{ background: P.lightSage, color: P.darkOlive }}
                >
                  {tag}
                  <button className="ml-1" data-prototype-action="true">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ border: `1px dashed ${P.sage}`, color: P.textMuted }}
                data-prototype-action="true"
              >
                <Plus size={11} /> Add tag
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
