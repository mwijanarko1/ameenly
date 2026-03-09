export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="homepage-viewport">{children}</div>;
}
