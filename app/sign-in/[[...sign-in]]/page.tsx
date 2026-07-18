import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 bg-[url('/footerbg.png')] bg-cover bg-center">
      <SignIn />
    </div>
  );
}
