import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function saveUserProfileToSupabase(userId: string, { email, displayName, photoURL }: { email: string; displayName: string; photoURL: string }) {
  try {
    const profile = {
      id: userId,
      email,
      display_name: displayName,
      photo_url: photoURL,
      is_public: false,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
    if (error) throw error;
    console.log('사용자 프로필 저장 성공');
  } catch (error) {
    console.error('사용자 프로필 저장 실패:', error);
  }
}

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('인증 오류:', error);
          navigate('/');
          return;
        }

        if (session?.user) {
          // 사용자 프로필 저장
          await saveUserProfileToSupabase(session.user.id, {
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email || '',
            photoURL: session.user.user_metadata?.avatar_url || '',
          });
          
          console.log('로그인 성공, 메인 페이지로 이동');
          navigate('/');
        } else {
          console.log('세션 없음, 메인 페이지로 이동');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback 오류:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default AuthCallback;