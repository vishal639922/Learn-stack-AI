"use client";

import { useState, useEffect } from "react";
import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ROLE_LABELS,
  canAssignRole,
  type UserRole,
} from "@/lib/roles";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface UserManagerProps {
  actorRole: string;
}

export function UserManager({ actorRole }: UserManagerProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "author" as UserRole,
  });

  const assignableRoles = (["user", "admin", "subadmin", "editor", "author"] as UserRole[]).filter(
    (r) => canAssignRole(actorRole, r)
  );

  const loadUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUsers(data.data.users);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setForm({ name: "", email: "", password: "", role: "author" });
        loadUsers();
      } else {
        setError(data.error || "User create fail ho gaya");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role } : u))
      );
    } else {
      alert(data.error || "Role update fail ho gaya");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-center py-8">Users load ho rahe hain...</p>;
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Staff Account Banao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
            )}
            <div className="space-y-2">
              <Label>Poora Naam</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                8+ chars, uppercase aur number chahiye
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {assignableRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
              <p><strong>Sub Admin</strong> — categories + users manage</p>
              <p><strong>Editor</strong> — saare articles edit</p>
              <p><strong>Author</strong> — naye articles likh sakta hai</p>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Ban raha hai..." : "Account Banao"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Saare Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4">Naam</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      {canAssignRole(actorRole, user.role) ? (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value as UserRole)
                          }
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {assignableRoles.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                          {!assignableRoles.includes(user.role) && (
                            <option value={user.role}>{ROLE_LABELS[user.role]}</option>
                          )}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
