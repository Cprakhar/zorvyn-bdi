import type { AuthTokenResponse } from "@/lib/types";

interface AuthPanelProps {
  email: string;
  auth: AuthTokenResponse | null;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function AuthPanel({
  email,
  auth,
  loading,
  onEmailChange,
  onSubmit,
}: Readonly<AuthPanelProps>) {
  return (
    <article className="panel">
      <h3>Authenticate</h3>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="field">
          <label htmlFor="email">User Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="admin@finance.local"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {auth ? "Refresh Session" : "Get Token"}
        </button>
      </form>
      {auth ? (
        <p className="mono" style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
          Role: {auth.user.role}
        </p>
      ) : null}
    </article>
  );
}
