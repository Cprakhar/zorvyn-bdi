import type { CreateUserInput, User, UserRole } from "@/lib/types";

interface UserManagementPanelProps {
  users: User[];
  form: CreateUserInput;
  loading: boolean;
  onFormChange: (next: CreateUserInput) => void;
  onCreateUser: () => void;
  onUpdateUserRole: (userId: string, role: UserRole) => void;
  onToggleUserStatus: (userId: string, nextStatus: boolean) => void;
}

export function UserManagementPanel({
  users,
  form,
  loading,
  onFormChange,
  onCreateUser,
  onUpdateUserRole,
  onToggleUserStatus,
}: Readonly<UserManagementPanelProps>) {
  return (
    <article className="panel">
      <h3>User Management</h3>

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateUser();
        }}
      >
        <div className="field">
          <label htmlFor="newUserName">Name</label>
          <input
            id="newUserName"
            value={form.name}
            onChange={(event) => onFormChange({ ...form, name: event.target.value })}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="newUserEmail">Email</label>
          <input
            id="newUserEmail"
            type="email"
            value={form.email}
            onChange={(event) => onFormChange({ ...form, email: event.target.value })}
            placeholder="jane@finance.local"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="newUserRole">Role</label>
          <select
            id="newUserRole"
            value={form.role}
            onChange={(event) => onFormChange({ ...form, role: event.target.value as UserRole })}
          >
            <option value="viewer">Viewer</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="newUserActive">Status</label>
          <select
            id="newUserActive"
            value={form.isActive ? "active" : "inactive"}
            onChange={(event) =>
              onFormChange({ ...form, isActive: event.target.value === "active" })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          Create User
        </button>
      </form>

      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td className="mono">{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      onUpdateUserRole(user.id, event.target.value as UserRole)
                    }
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onToggleUserStatus(user.id, !user.isActive)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={5}>No users found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
