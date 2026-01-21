import AuthProvider from '@/components/AuthProvider';

export default function SuperuserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
