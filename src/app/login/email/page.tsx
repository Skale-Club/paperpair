import AuthForm from "../../(auth)/auth-form";

export default function EmailLoginPage() {
  return (
    <AuthForm
      variant="signin"
      title="Sign in with your email"
      description="Use any email provider (Yahoo, Hotmail/Outlook, AOL, custom domains). Enter the password you set for PaperPair."
      showOAuth={false}
    />
  );
}
