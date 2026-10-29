"use client";

import { FilterBar, FilterSearch, StatRow, filterClass } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card, Field, PrimaryButton, inputClass } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";
import { Shield, UserPlus, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

export default function StaffPage() {
  const { users, addStaff, currentUser, resetDemo } = useStore();
  const [role, setRole] = useState<UserRole>("staff");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const stats = [
    { label: "Team", value: String(users.length), hint: "All accounts", icon: Users, tint: "from-blue-500 to-sky-400" },
    { label: "Admins", value: String(users.filter((u) => u.role === "admin").length), hint: "Full access", icon: Shield, tint: "from-indigo-500 to-blue-400" },
    { label: "Staff", value: String(users.filter((u) => u.role === "staff").length), hint: "Floor users", icon: UserPlus, tint: "from-sky-500 to-cyan-400" },
    { label: "Signed in", value: currentUser?.name ?? "—", hint: currentUser?.role ?? "", icon: Users, tint: "from-emerald-500 to-teal-400" },
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      if (term && !`${u.name} ${u.email}`.toLowerCase().includes(term)) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, q, roleFilter]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addStaff({
      name: String(form.get("name")),
      email: String(form.get("email")),
      role,
    });
    e.currentTarget.reset();
  }

  return (
    <AppShell>
      <h1 className="mb-1 text-[22px] font-semibold tracking-tight text-slate-950">Staff</h1>
      <p className="mb-3 text-sm text-slate-500">Adrienne is admin. Add extra staff emails here.</p>
      <StatRow items={stats} />
      <FilterBar>
        <FilterSearch value={q} onChange={setQ} placeholder="Search name or email" />
        <select className={filterClass} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </FilterBar>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] font-medium text-slate-500">
            <tr className="border-b border-blue-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Session</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-slate-50">
                <td className="px-4 py-2.5 font-medium text-zinc-950">{user.name}</td>
                <td className="px-4 py-2.5">{user.email}</td>
                <td className="px-4 py-2.5 capitalize">{user.role}</td>
                <td className="px-4 py-2.5 text-slate-500">
                  {currentUser?.id === user.id ? "Signed in" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No staff match these filters.</p> : null}
      </Card>
      <Card className="mt-3 p-5">
        <p className="font-semibold">Add a user</p>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <div className="flex items-end">
            <PrimaryButton type="submit">Add staff account</PrimaryButton>
          </div>
        </form>
        {currentUser?.role === "admin" ? (
          <button type="button" className="mt-4 text-xs text-slate-400" onClick={resetDemo}>
            Reset demo data
          </button>
        ) : null}
      </Card>
    </AppShell>
  );
}
