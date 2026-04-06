import CheckIn from "@/components/route/check-in";

export default async function Page({ params }: { params: Promise<{ room: string }> }) {
  const resolvedParams = await params;

  return (
    <CheckIn roomNumber={resolvedParams.room} />
  )
}