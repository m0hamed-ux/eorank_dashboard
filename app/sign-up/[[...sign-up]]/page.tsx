import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 bg-[url('/footerbg.png')] bg-cover bg-center">
      <SignUp />
    </div>
  );
}
