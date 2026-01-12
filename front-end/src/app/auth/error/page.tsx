import AuthLayout from "@/components/auth/auth-layout";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-lg">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-lg">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <AuthLayout>
      <div>
        <p className="text-3xl font-semibold">Error</p>
        <Suspense>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
      </div>
    </AuthLayout>
  )
}