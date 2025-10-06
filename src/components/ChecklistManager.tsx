import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { ChecklistItem } from '@/types/investment';
import { generateId } from '@/lib/storage';

interface ChecklistManagerProps {
  title: string;
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  availableItems: string[];
  onAvailableItemsChange: (items: string[]) => void;
}

export const ChecklistManager = ({ 
  title, 
  items, 
  onItemsChange, 
  availableItems, 
  onAvailableItemsChange 
}: ChecklistManagerProps) => {
  const [newItemText, setNewItemText] = useState('');

  const addNewItem = (e: React.MouseEvent) => {
    e.preventDefault(); // form 제출 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (newItemText.trim()) {
      const updatedAvailable = [...availableItems, newItemText.trim()];
      onAvailableItemsChange(updatedAvailable);
      setNewItemText('');
    }
  };

  const removeAvailableItem = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); // form 제출 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    const updatedAvailable = availableItems.filter((_, i) => i !== index);
    onAvailableItemsChange(updatedAvailable);
    
    // 체크된 항목에서도 제거
    const removedText = availableItems[index];
    const updatedItems = items.filter(item => item.text !== removedText);
    onItemsChange(updatedItems);
  };

  const toggleItem = (text: string, checked: boolean) => {
    if (checked) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text,
        checked: true,
      };
      onItemsChange([...items, newItem]);
    } else {
      const updatedItems = items.filter(item => item.text !== text);
      onItemsChange(updatedItems);
    }
  };

  const isItemChecked = (text: string) => {
    return items.some(item => item.text === text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // form 제출 방지
      if (newItemText.trim()) {
        const updatedAvailable = [...availableItems, newItemText.trim()];
        onAvailableItemsChange(updatedAvailable);
        setNewItemText('');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 새 항목 추가 */}
        <div className="flex gap-2">
          <Input
            placeholder="새 체크리스트 항목 추가"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
          />
          <Button 
            onClick={addNewItem} 
            type="button"
            size="sm" 
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 체크리스트 항목들 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableItems.map((text, index) => (
            <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded">
              <div className="flex items-center space-x-2 flex-1">
                <Checkbox
                  id={`${title}-${index}`}
                  checked={isItemChecked(text)}
                  onCheckedChange={(checked) => toggleItem(text, checked as boolean)}
                />
                <Label 
                  htmlFor={`${title}-${index}`} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {text}
                </Label>
              </div>
              <Button
                onClick={(e) => removeAvailableItem(e, index)}
                type="button"
                size="sm"
                variant="ghost"
                className="px-2 h-6 text-red-500 hover:text-red-700"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {availableItems.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            위에서 새 체크리스트 항목을 추가하세요
          </div>
        )}

        {/* 체크된 항목 수 표시 */}
        <div className="text-sm text-gray-600 pt-2 border-t">
          체크된 항목: {items.length}개 / 전체: {availableItems.length}개
        </div>
      </CardContent>
    </Card>
  );
};