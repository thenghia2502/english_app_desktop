# Vocab Trainer Components

## Tổng quan

Component `VocabTrainer` đã được tách thành nhiều component nhỏ để dễ dàng bảo trì và phát triển. Mỗi component có một chức năng cụ thể và có thể được tái sử dụng.

## Cấu trúc Component

### 1. **TopNavigation.tsx**
- **Chức năng**: Thanh điều hướng phía trên với tiêu đề và nút quay lại
- **Props**: `lessonName` (tên bài học)
- **Độc lập**: Có thể tái sử dụng cho các trang khác

### 2. **TrainerControls.tsx**
- **Chức năng**: Các điều khiển chính (checkbox danh sách từ, radio button US/UK)
- **Props**: `checked`, `setChecked`, `dialect`, `setDialect`, `isLooping`, `isPlaying`
- **State**: Quản lý trạng thái hiển thị danh sách từ và giọng đọc

### 3. **AudioControls.tsx**
- **Chức năng**: Nút điều khiển âm thanh (Bắt đầu/Dừng/Thử lại)
- **Props**: `isLooping`, `isPageLoading`, `isDialectChanging`, `audioError`, `vocabularyData`, `onAudioToggle`, `onRetryAudio`
- **Logic**: Hiển thị trạng thái và xử lý các hành động âm thanh

### 4. **ProgressBadge.tsx**
- **Chức năng**: Hiển thị tiến độ học từ hiện tại (ví dụ: 2/5)
- **Props**: `currentWord`, `lastShownWord`
- **UI**: Badge màu xanh hoặc xanh lá tùy theo trạng thái hoàn thành

### 5. **VocabDisplay.tsx**
- **Chức năng**: Hiển thị từ vựng chính theo các giai đoạn (IPA → Word → Both)
- **Props**: `currentWord`
- **Logic**: Xác định giai đoạn hiển thị dựa trên `progress`, `show_ipa`, `show_word`

### 6. **VocabTable.tsx**
- **Chức năng**: Bảng danh sách từ vựng với khả năng chỉnh sửa
- **Props**: `vocabularyData`, `currentIndex`, `isLooping`, `isPlaying`, `onWordClick`, `onUpdateWord`
- **Tương tác**: Click để chuyển từ, chỉnh sửa thời gian dừng

### 7. **useAudioManager.ts** (Custom Hook)
- **Chức năng**: Quản lý toàn bộ logic âm thanh và vòng lặp học
- **Return**: Các function để điều khiển âm thanh
- **Logic phức tạp**: Play/pause, vòng lặp, chuyển từ, cập nhật tiến độ

### 8. **types.ts**
- **Chức năng**: Định nghĩa TypeScript interfaces cho các component
- **Nội dung**: `AudioManager`, `VocabTrainerState`, `VocabTrainerActions`

## Lợi ích của việc tách component

### 1. **Dễ hiểu và bảo trì**
- Mỗi component có một trách nhiệm cụ thể
- Code ngắn hơn, tập trung vào một chức năng
- Dễ dàng debug khi có lỗi

### 2. **Tái sử dụng**
- `TopNavigation` có thể dùng cho các trang khác
- `AudioControls` có thể dùng cho các trainer khác
- `VocabTable` có thể dùng độc lập

### 3. **Dễ dàng testing**
- Test từng component riêng biệt
- Mock props dễ dàng hơn
- Isolation testing

### 4. **Collaboration**
- Nhiều developer có thể làm việc trên các component khác nhau
- Conflict ít hơn khi merge code
- Review code dễ dàng hơn

### 5. **Performance**
- React.memo có thể áp dụng cho từng component
- Re-render chỉ khi props thay đổi
- Lazy loading nếu cần

## Cách sử dụng

```tsx
import VocabTrainer from '@/app/vocab-trainerV5'

// Hoặc import từng component riêng biệt
import { 
  TopNavigation, 
  TrainerControls, 
  AudioControls,
  VocabDisplay,
  VocabTable,
  useAudioManager 
} from '@/components/vocab-trainer'
```

## Migration từ VocabTrainerV4

1. **Backup**: Giữ lại `vocab-trainerV4.tsx` để so sánh
2. **Test**: Kiểm tra tất cả chức năng hoạt động bình thường
3. **Replace**: Thay thế import trong các file khác
4. **Clean up**: Xóa file cũ sau khi confirm hoạt động ổn định

## Tương lai

- Có thể thêm các component con khác như `WordProgress`, `DialectSelector`
- Implement React.memo để tối ưu performance
- Thêm Storybook để document và test UI components
- Có thể tạo Context để share state giữa các component thay vì props drilling