interface NotificationsProps {
  error: string | null;
  okMessage: string | null;
}

export function Notifications({ error, okMessage }: Readonly<NotificationsProps>) {
  return (
    <>
      {error ? <div className="alert">{error}</div> : null}
      {okMessage ? <div className="alert ok">{okMessage}</div> : null}
    </>
  );
}
