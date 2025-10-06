import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User } from 'lucide-react';
import { authService } from '@/lib/supabase';

interface User {
  id: string;
  nickname: string;
  email: string;
  isPublic?: boolean;
}

interface SearchUsersProps {
  onUserSelect: (user: User) => void;
}

export function SearchUsers({ onUserSelect }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await authService.searchUsers(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="사용자 닉네임을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? '검색 중...' : '검색'}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">검색 결과</h3>
          {searchResults.map((user) => (
            <Card key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onUserSelect(user)}>
              <CardContent className="flex items-center gap-3 p-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.nickname}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
        <p className="text-sm text-muted-foreground text-center py-4">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
}