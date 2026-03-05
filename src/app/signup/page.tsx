export const dynamic = "force-dynamic";
export const revalidate = 0;

import AuthForm from "../(auth)/auth-form";

export default function SignupPage() {
  return <AuthForm variant="signup" />;
}
