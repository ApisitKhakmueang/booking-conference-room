import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';

export default function useSession() {
  const supabase = createClient()
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // 1. ดึง Token มาเตรียมไว้ก่อนเชื่อมต่อ WS
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setSessionToken(session.access_token);
    };
    fetchSession();
  }, []);

  return sessionToken
}