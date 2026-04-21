import EachPageLayout from "@/components/layout/each-page-layout"
import UserHistory from "@/components/route/user-management/user-history"

// 🌟 2. รับ params เข้ามาใน Component
export default async function Page({ params }: { params: Promise<{ userID: string }> }) {
  const resolvedParams = await params;

  return (
    <EachPageLayout className="flex justify-center">
      {/* 🌟 4. ส่ง userId เป็น Prop เข้าไปใน Component ลูก */}
      <UserHistory userID={resolvedParams.userID} />
    </EachPageLayout>
  )
}