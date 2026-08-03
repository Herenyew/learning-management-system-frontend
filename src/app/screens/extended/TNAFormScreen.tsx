import React, { useMemo, useState } from "react";
import { Check, Clock, Search, User, Users, X } from "lucide-react";
import { P, PageHeader } from "./extended.shared";

type RequestStatus = "pending" | "approved" | "rejected";
type SubmitterType = "individual" | "manager";

type TNARequest = {
  id: string;
  employee: string;
  employeeRole: string;
  department: string;
  submittedBy: string;
  submitterType: SubmitterType;
  training: string;
  funding: "Free" | "Paid";
  cost?: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  submittedOn: string;
  status: RequestStatus;
};

const INITIAL_REQUESTS: TNARequest[] = [
  {
    id: "TNA-2026-041",
    employee: "Marcus Johnson",
    employeeRole: "Senior Engineer",
    department: "Engineering",
    submittedBy: "Marcus Johnson",
    submitterType: "individual",
    training: "AWS Solutions Architect Certification",
    funding: "Paid",
    cost: 1800,
    priority: "High",
    submittedOn: "03 Aug 2026",
    status: "pending",
  },
  {
    id: "TNA-2026-040",
    employee: "Priya Nair",
    employeeRole: "Marketing Manager",
    department: "Marketing",
    submittedBy: "Daniel Okafor",
    submitterType: "manager",
    training: "Data-Driven Marketing Strategy",
    funding: "Free",
    priority: "Medium",
    submittedOn: "02 Aug 2026",
    status: "pending",
  },
  {
    id: "TNA-2026-039",
    employee: "Luca Ferrari",
    employeeRole: "Sales Executive",
    department: "Sales",
    submittedBy: "Luca Ferrari",
    submitterType: "individual",
    training: "Enterprise Negotiation Skills",
    funding: "Paid",
    cost: 950,
    priority: "High",
    submittedOn: "01 Aug 2026",
    status: "pending",
  },
  {
    id: "TNA-2026-038",
    employee: "Mei Lin",
    employeeRole: "Operations Lead",
    department: "Operations",
    submittedBy: "Sophia Martinez",
    submitterType: "manager",
    training: "Lean Process Improvement",
    funding: "Free",
    priority: "Medium",
    submittedOn: "30 Jul 2026",
    status: "approved",
  },
  {
    id: "TNA-2026-037",
    employee: "Carlos Mendez",
    employeeRole: "Product Manager",
    department: "Product",
    submittedBy: "Carlos Mendez",
    submitterType: "individual",
    training: "Advanced Product Analytics",
    funding: "Paid",
    cost: 1400,
    priority: "Low",
    submittedOn: "29 Jul 2026",
    status: "rejected",
  },
];

const STATUS_STYLES: Record<RequestStatus, { background: string; color: string }> = {
  pending: { background: "#FFF4D6", color: "#8A6A1A" },
  approved: { background: "#DFF3D5", color: "#3F651E" },
  rejected: { background: "#FDE8E6", color: "#B42318" },
};

const PRIORITY_STYLES: Record<TNARequest["priority"], { background: string; color: string }> = {
  Low: { background: "#F1F5F2", color: P.textMuted },
  Medium: { background: "#E7F4EC", color: P.olive },
  High: { background: "#FFF4D6", color: "#8A6A1A" },
  Critical: { background: "#FDE8E6", color: "#B42318" },
};

export function TNAFormScreen({ navigate: _navigate }: { navigate: (s: string) => void }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("pending");
  const [sourceFilter, setSourceFilter] = useState<"all" | SubmitterType>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length,
      rejected: requests.filter((request) => request.status === "rejected").length,
    }),
    [requests],
  );

  const visibleRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesSource = sourceFilter === "all" || request.submitterType === sourceFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          request.id,
          request.employee,
          request.submittedBy,
          request.department,
          request.training,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesSource && matchesQuery;
    });
  }, [query, requests, sourceFilter, statusFilter]);

  const updateStatus = (id: string, status: Exclude<RequestStatus, "pending">) => {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  };

  return (
    <div className="p-6 max-w-[1500px] space-y-6">
      <PageHeader
        title="TNA Requests"
        sub="Review training needs submitted by employees and managers"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Pending Review", counts.pending, Clock, "#FFF4D6", "#8A6A1A"],
            ["Approved", counts.approved, Check, "#DFF3D5", "#3F651E"],
            ["Rejected", counts.rejected, X, "#FDE8E6", "#B42318"],
          ] as const
        ).map(([label, value, Icon, background, color]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border bg-white p-4"
            style={{ borderColor: P.border }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: P.textMuted }}>
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold" style={{ color: P.text }}>
                {value}
              </p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background, color }}
            >
              <Icon size={18} />
            </div>
          </div>
        ))}
      </div>

      <section
        className="overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: P.border }}
      >
        <div className="space-y-3 border-b p-4" style={{ borderColor: P.border }}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-lg">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: P.textMuted }}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employee, submitter, department, or training..."
                className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm outline-none"
                style={{ borderColor: P.border, color: P.text }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["pending", "all", "approved", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="rounded-lg border px-3 py-2 text-xs font-semibold capitalize"
                  style={{
                    borderColor: statusFilter === status ? P.olive : P.border,
                    background: statusFilter === status ? P.olive : "white",
                    color: statusFilter === status ? "white" : P.textMid,
                  }}
                >
                  {status === "all" ? "All statuses" : status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All submitters", Users],
                ["individual", "Individuals", User],
                ["manager", "Managers", Users],
              ] as const
            ).map(([source, label, Icon]) => (
              <button
                key={source}
                onClick={() => setSourceFilter(source)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium"
                style={{
                  borderColor: sourceFilter === source ? P.sage : P.border,
                  background: sourceFilter === source ? P.lightSage : "white",
                  color: sourceFilter === source ? P.olive : P.textMid,
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead style={{ background: P.paleGreen }}>
              <tr>
                {[
                  "Request",
                  "Employee",
                  "Submitted By",
                  "Training Need",
                  "Funding",
                  "Priority",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                    style={{ borderColor: P.border, color: P.textMid }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: P.border }}
                >
                  <td className="px-4 py-4 align-top">
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {request.id}
                    </p>
                    <p className="mt-1 text-[11px]" style={{ color: P.textMuted }}>
                      {request.submittedOn}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {request.employee}
                    </p>
                    <p className="mt-1 text-[11px]" style={{ color: P.textMuted }}>
                      {request.employeeRole} · {request.department}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ background: P.lightSage, color: P.olive }}
                      >
                        {request.submitterType === "manager" ? (
                          <Users size={13} />
                        ) : (
                          <User size={13} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: P.text }}>
                          {request.submittedBy}
                        </p>
                        <p className="text-[10px] capitalize" style={{ color: P.textMuted }}>
                          {request.submitterType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[280px] px-4 py-4 align-top">
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {request.training}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-xs font-medium" style={{ color: P.text }}>
                      {request.funding}
                    </p>
                    {request.cost !== undefined && (
                      <p className="mt-1 text-[11px]" style={{ color: P.textMuted }}>
                        ${request.cost.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold"
                      style={PRIORITY_STYLES[request.priority]}
                    >
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize"
                      style={STATUS_STYLES[request.status]}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {request.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(request.id, "approved")}
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                          style={{ background: P.olive }}
                          aria-label={`Accept ${request.id}`}
                        >
                          <Check size={13} /> Accept
                        </button>
                        <button
                          onClick={() => updateStatus(request.id, "rejected")}
                          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                          style={{ borderColor: "#E5A6A0", color: "#B42318" }}
                          aria-label={`Reject ${request.id}`}
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: P.textMuted }}>
                        Review complete
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleRequests.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              No TNA requests found
            </p>
            <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
              Try changing the filters or search term.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
