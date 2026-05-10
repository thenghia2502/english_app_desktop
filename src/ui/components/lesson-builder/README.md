# Lesson Builder Components

## Tổng quan

Component `TaoKhoaHocPage` (Tạo bài học) đã được tách thành nhiều component nhỏ để dễ dàng bảo trì và phát triển. Mỗi component có một chức năng cụ thể và có thể được tái sử dụng.

## Cấu trúc Component

### 1. **TopNavigation.tsx**
- **Chức năng**: Thanh điều hướng phía trên với tiêu đề và nút quay lại
- **Props**: `isEditMode` (chế độ chỉnh sửa hay tạo mới)
- **Độc lập**: Có thể tái sử dụng cho các trang khác

### 2. **UnitFilter.tsx**
- **Chức năng**: Bộ lọc các unit/bài học với checkbox "Tất cả" và từng unit riêng biệt
- **Props**: `units`, `selectedUnitIds`, `setSelectedUnitIds`
- **Logic**: Quản lý việc chọn/bỏ chọn units để hiển thị từ vựng

### 3. **WordSelectionPanel.tsx**
- **Chức năng**: Panel hiển thị danh sách từ vựng theo unit, hỗ trợ nhóm từ cha-con
- **Props**: `units`, `selectedUnitIds`, `data`, `expandedChildGroups`, setters
- **Tính năng**: Expand/collapse nhóm từ, hiển thị thông tin bài học đã có

### 4. **TransferControl.tsx**
- **Chức năng**: Nút chuyển từ vựng đã chọn sang panel tạo bài học
- **Props**: `selectedCount`, `onTransfer`
- **UI**: Hiển thị số lượng từ đã chọn và nút "chuyển tiếp"

### 5. **LessonHeader.tsx**
- **Chức năng**: Header của panel tạo bài học với tên bài học, thời gian ước tính và nút lưu
- **Props**: `lessonWordsCount`, `courseName`, `setCourseName`, `estimatedTime`, `isEditMode`, `onSave`, `canSave`
- **Logic**: Quản lý tên bài học và trigger việc tạo/cập nhật bài học

### 6. **EmptyLessonState.tsx**
- **Chức năng**: Hiển thị trạng thái rỗng khi chưa có từ vựng nào trong bài học
- **Props**: Không có props
- **UI**: Icon và text hướng dẫn người dùng

### 7. **LessonWordsTable.tsx**
- **Chức năng**: Bảng hiển thị danh sách từ vựng trong bài học với drag & drop
- **Props**: `lessonWords`, `setLessonWords`, các update functions
- **Tính năng**: Sử dụng DndContext cho việc sắp xếp lại thứ tự từ

### 8. **SortableRow.tsx**
- **Chức năng**: Một hàng trong bảng từ vựng, có thể kéo thả và chỉnh sửa
- **Props**: `word`, `lessonWord`, các update/remove functions
- **Tính năng**: Drag handle, input fields cho các thông số từ, nút xóa

### 9. **useLessonBuilderLogic.ts** (Custom Hook)
- **Chức năng**: Chứa toàn bộ business logic của lesson builder
- **Return**: Các functions để quản lý từ vựng, tạo/cập nhật bài học
- **Logic phức tạp**: Transfer words, calculate time, create/update lesson

### 10. **types.ts**
- **Chức năng**: Định nghĩa TypeScript interfaces cho các component
- **Nội dung**: `LocalWord`, `LessonWithWords`, `LessonBuilderHookReturn`, etc.

## Lợi ích của việc tách component

### 1. **Dễ hiểu và bảo trì**
- Component chính giảm từ ~1000 dòng xuống ~300 dòng
- Mỗi component con có chức năng rõ ràng, dễ hiểu
- Logic phức tạp được tách ra custom hook

### 2. **Tái sử dụng**
- `TopNavigation` có thể dùng cho các trang tạo/chỉnh sửa khác
- `UnitFilter` có thể dùng cho các trang cần filter units
- `EmptyLessonState` có thể dùng cho các empty states khác

### 3. **Dễ dàng testing**
- Test từng component riêng biệt
- Mock props dễ dàng hơn
- Business logic tách biệt với UI logic

### 4. **Collaboration**
- Nhiều developer có thể làm việc trên các component khác nhau
- Conflict ít hơn khi merge code
- Review code dễ dàng hơn

### 5. **Performance**
- React.memo có thể áp dụng cho từng component
- Re-render chỉ khi props thay đổi
- Lazy loading cho các component lớn

## Cấu trúc dữ liệu

### **LocalWord**
```typescript
interface LocalWord extends Word {
    selected: boolean
    done: boolean
    popularity: number
    belong: string
    ipa: string
}
```

### **LessonWithWords**
```typescript
interface LessonWithWords {
    id: string
    title: string
    words: LocalWord[]
}
```

## Data Flow

1. **Units Loading**: `normalizedUnits` từ API curriculum
2. **Word Selection**: User chọn từ trong `WordSelectionPanel` → update `data` state
3. **Transfer**: `TransferControl` → `transferSelectedWords()` → add to `lessonWords`
4. **Edit Words**: `LessonWordsTable` → `updateLessonWord()` → modify `lessonWords`
5. **Save**: `LessonHeader` → `handleCreateLesson()` hoặc `handleUpdateLesson()`

## Cách sử dụng

```tsx
import TaoKhoaHocPage from '@/app/taobaihocV2'

// Hoặc import từng component riêng biệt
import { 
  TopNavigation, 
  UnitFilter, 
  WordSelectionPanel,
  LessonWordsTable,
  useLessonBuilderLogic 
} from '@/components/lesson-builder'
```

## Migration từ TaoKhoaHocPage

1. **Backup**: Giữ lại `taobaihoc/page.tsx` để so sánh
2. **Test**: Kiểm tra tất cả chức năng hoạt động bình thường
3. **Replace**: Thay thế import trong các file khác
4. **Clean up**: Xóa file cũ sau khi confirm hoạt động ổn định

## Tương lai

- Có thể thêm các component con khác như `WordCard`, `UnitCard`
- Implement React.memo để tối ưu performance
- Thêm Storybook để document và test UI components
- Có thể tạo Context để share state giữa các component thay vì props drilling
- Virtual scrolling cho danh sách từ vựng lớn
- Search/filter trong word selection panel