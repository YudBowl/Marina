# 🍺 Marina Group — Hệ thống kế toán F&B

Hệ thống quản lý kế toán nội bộ cho chuỗi F&B Marina Group tại Quy Nhơn.

## Tính năng

- **Nhân sự**: Danh sách nhân viên, bảng chấm công, tính lương tự động (có BHXH 10.5%)
- **Vận hành & kho**: Phiếu nhập kho, phiếu xuất kho, tổng hợp tồn kho
- **Chi phí**: Theo dõi food cost hàng ngày, kiểm soát hao hụt NVL, định mức công thức món
- **Thu & Chi**: Nhập doanh thu theo ngày, theo dõi chi phí, công nợ nhà cung cấp
- **Báo cáo**: P&L tháng, so sánh 5 chi nhánh
- **Lưu trữ dữ liệu**: Tự động lưu vào localStorage (không mất khi tắt trình duyệt)

---

## Cài đặt & Chạy local

### Yêu cầu
- Node.js 18+ ([tải tại nodejs.org](https://nodejs.org))
- npm hoặc yarn

### Các bước

```bash
# 1. Vào thư mục project
cd marina-ketoan

# 2. Cài dependencies
npm install

# 3. Chạy development server
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

---

## Deploy lên Vercel (miễn phí, team cùng dùng)

### Cách 1 — Kéo thả nhanh nhất (5 phút)

1. Vào **[vercel.com](https://vercel.com)** → Đăng ký bằng GitHub (miễn phí)
2. Tạo repository trên GitHub và đẩy code lên:
   ```bash
   git init
   git add .
   git commit -m "Marina Group F&B Accounting System"
   git remote add origin https://github.com/YOUR_USERNAME/marina-ketoan.git
   git push -u origin main
   ```
3. Trên Vercel → **"New Project"** → chọn repo vừa tạo → **Deploy**
4. Vercel tự build, sau ~1 phút có link dạng: `https://marina-ketoan.vercel.app`
5. **Chia sẻ link cho cả team** — mọi người dùng qua trình duyệt, không cần cài gì

### Cách 2 — Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

---

## Nâng cấp lên multi-user với Supabase (tùy chọn)

Hiện tại dữ liệu lưu trong localStorage của từng máy. Nếu muốn **nhiều người cùng nhập, cùng xem dữ liệu real-time**, cần thêm database:

### 1. Tạo project Supabase (miễn phí)
Vào **[supabase.com](https://supabase.com)** → New Project → lấy `URL` và `anon key`

### 2. Cài thư viện
```bash
npm install @supabase/supabase-js
```

### 3. Tạo file `.env`
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Tạo bảng trong Supabase
Chạy SQL sau trong Supabase Dashboard → SQL Editor:

```sql
-- Nhân viên
CREATE TABLE nhan_vien (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  chucvu TEXT,
  chi_nhanh TEXT,
  loai TEXT,
  luong_cb INTEGER,
  trang_thai TEXT DEFAULT 'Đang làm',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doanh thu
CREATE TABLE doanh_thu (
  id SERIAL PRIMARY KEY,
  ngay DATE,
  chi_nhanh TEXT,
  loai TEXT,
  so_hoa_don INTEGER,
  doanh_thu BIGINT,
  phuong_thuc_tt TEXT,
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chi phí
CREATE TABLE chi_phi (
  id SERIAL PRIMARY KEY,
  ngay DATE,
  danh_muc TEXT,
  mo_ta TEXT,
  so_tien BIGINT,
  nha_cung_cap TEXT,
  trang_thai TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nhập kho
CREATE TABLE nhap_kho (
  id SERIAL PRIMARY KEY,
  so_phieu TEXT,
  ngay DATE,
  nha_cung_cap TEXT,
  hang_muc TEXT,
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tồn kho
CREATE TABLE ton_kho (
  id SERIAL PRIMARY KEY,
  ten TEXT NOT NULL,
  dvt TEXT,
  ton_dau INTEGER DEFAULT 0,
  nhap INTEGER DEFAULT 0,
  xuat INTEGER DEFAULT 0,
  don_gia BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (tuỳ chọn)
ALTER TABLE nhan_vien ENABLE ROW LEVEL SECURITY;
ALTER TABLE doanh_thu ENABLE ROW LEVEL SECURITY;
```

### 5. Thay useStorage bằng Supabase queries
Trong `src/App.jsx`, thay `useStorage` hook bằng:
```jsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Ví dụ fetch doanh thu
const { data } = await supabase.from('doanh_thu').select('*')
```

---

## Cấu trúc thư mục

```
marina-ketoan/
├── src/
│   ├── App.jsx        ← Toàn bộ logic & UI components
│   ├── data.js        ← Dữ liệu mẫu ban đầu
│   ├── index.css      ← Global styles (dark theme)
│   └── main.jsx       ← Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Tùy chỉnh cho Marina Group

### Thêm chi nhánh mới
Trong `src/data.js`:
```js
export const VENUES = [
  "CF Marina", "CF À Merci", "Marina Beer Garden", 
  "Marina Beer 52", "Motchai",
  "Chi nhánh mới"  // ← thêm vào đây
];
```

### Đổi màu theme
Trong `src/index.css`, sửa phần `:root`:
```css
:root {
  --accent: #F59E0B;    /* màu vàng amber — có thể đổi */
  --green:  #10B981;
  --blue:   #3B82F6;
}
```

### Thêm module mới
1. Thêm route vào `NAV` array trong `App.jsx`
2. Thêm component mới
3. Thêm case vào `switch` trong `renderContent()`

---

## Hỗ trợ

Liên hệ Agency Destiny — Quy Nhơn, Bình Định.
