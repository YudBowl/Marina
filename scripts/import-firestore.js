const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../serviceAccountKey.json');

const reportData = {
  system_info: {
    company: 'Marina Group',
    sub_title: 'Hệ thống kế toán F&B',
    report_period: 'Tháng 6 / 2025',
    location: 'Marina Group Quy Nhơn',
    branches: ['CF Marina', 'CF À Merci', 'Marina Beer Garden', 'Marina Beer 52', 'Motchai']
  },
  tong_quan: {
    doanh_thu_t6: 295500000,
    chi_phi_t6: 140175000,
    loi_nhuan: 155325000,
    food_cost_tb: '31.4%',
    nhan_vien_count: 10,
    cong_no_ncc: 31200000,
    co_cau_chi_phi: {
      NVL: '32%',
      Nhan_su: '28%',
      Thue_MB: '18%',
      Dien_nuoc: '10%',
      Marketing: '6%',
      Khac: '6%'
    },
    canh_bao_van_hanh: [
      'Công nợ NCC Minh Long đã quá hạn — 10tr',
      'Tồn kho cà phê hạt còn thấp — 17 kg',
      'Percent Food cost CF Marina 32% vượt mục tiêu',
      '3 nhân viên xin nghỉ phép tuần tới',
      'Doanh thu T6 đạt 85.7% KPI tháng'
    ]
  },
  bang_luong_nhan_vien: [
    { id: 1, ho_ten: 'Nguyễn Văn An', chuc_vu: 'Quản lý', chi_nhanh: 'CF Marina', luong_cb: 12000000, ngay_cong: 18, luong_tinh: 8307692, thuong: 0, bhxh: -872308, thuc_linh: 7435384, tam_ung: 2974154, con_lai: 4461230 },
    { id: 2, ho_ten: 'Trần Thị Bình', chuc_vu: 'Thu ngân', chi_nhanh: 'CF Marina', luong_cb: 7500000, ngay_cong: 21, luong_tinh: 6057692, thuong: 0, bhxh: -636058, thuc_linh: 5421634, tam_ung: 2168654, con_lai: 3252980 },
    { id: 3, ho_ten: 'Lê Văn Cường', chuc_vu: 'Phục vụ', chi_nhanh: 'CF Marina', luong_cb: 4500000, ngay_cong: 27, luong_tinh: 4673077, thuong: 500000, bhxh: -490673, thuc_linh: 4682404, tam_ung: 1872962, con_lai: 2809442 },
    { id: 4, ho_ten: 'Phạm Thị Dung', chuc_vu: 'Pha chế', chi_nhanh: 'CF À Merci', luong_cb: 8000000, ngay_cong: 21, luong_tinh: 6461538, thuong: 0, bhxh: -678461, thuc_linh: 5783077, tam_ung: 2313231, con_lai: 3469846 },
    { id: 5, ho_ten: 'Hoàng Văn Em', chuc_vu: 'Bảo vệ', chi_nhanh: 'Marina Beer Garden', luong_cb: 6000000, ngay_cong: 18, luong_tinh: 4153846, thuong: 0, bhxh: -436154, thuc_linh: 3717692, tam_ung: 1487077, con_lai: 2230615 },
    { id: 6, ho_ten: 'Đỗ Thị Phương', chuc_vu: 'Phục vụ', chi_nhanh: 'Marina Beer Garden', luong_cb: 4200000, ngay_cong: 21, luong_tinh: 3392308, thuong: 0, bhxh: -356192, thuc_linh: 3036116, tam_ung: 1214446, con_lai: 1821670 },
    { id: 7, ho_ten: 'Vũ Văn Giang', chuc_vu: 'Bếp trưởng', chi_nhanh: 'Motchai', luong_cb: 10000000, ngay_cong: 21, luong_tinh: 8076923, thuong: 0, bhxh: -848077, thuc_linh: 7228846, tam_ung: 2891538, con_lai: 4337308 },
    { id: 8, ho_ten: 'Bùi Thị Hoa', chuc_vu: 'Phục vụ', chi_nhanh: 'Motchai', luong_cb: 4000000, ngay_cong: 21, luong_tinh: 3230769, thuong: 0, bhxh: -339231, thuc_linh: 2891538, tam_ung: 1156615, con_lai: 1734923 },
    { id: 9, ho_ten: 'Ngô Văn Ích', chuc_vu: 'Phục vụ', chi_nhanh: 'Marina Beer Garden', luong_cb: 5500000, ngay_cong: 24, luong_tinh: 5076923, thuong: 0, bhxh: -533077, thuc_linh: 4543846, tam_ung: 1817538, con_lai: 2726308 },
    { id: 10, ho_ten: 'Đinh Thị Kim', chuc_vu: 'Thu ngân', chi_nhanh: 'Marina Beer 52', luong_cb: 7000000, ngay_cong: 20, luong_tinh: 5384615, thuong: 0, bhxh: -565385, thuc_linh: 4819230, tam_ung: 1927692, con_lai: 2891538 }
  ],
  phieu_nhap_kho: [
    { ma_phieu: 'NK-001', ngay: '02/06/2025', ncc: 'Công ty Bia Sài Gòn', loai: 'Đồ uống', tong_tien: 23300000, chi_tiet: [
      { ten: 'Bia Sài Gòn lon 330ml', dvt: 'Thùng 24 lon', sl: 50, don_gia: 280000, thanh_tien: 14000000 },
      { ten: 'Bia Tiger lon 330ml', dvt: 'Thùng 24 lon', sl: 30, don_gia: 310000, thanh_tien: 9300000 }
    ] },
    { ma_phieu: 'NK-002', ngay: '03/06/2025', ncc: 'Vựa rau Bình Định', loai: 'Rau củ quả', tong_tien: 975000, chi_tiet: [
      { ten: 'Rau muống', dvt: 'Kg', sl: 20, don_gia: 15000, thanh_tien: 300000 },
      { ten: 'Cà chua', dvt: 'Kg', sl: 15, don_gia: 25000, thanh_tien: 375000 },
      { ten: 'Hành tây', dvt: 'Kg', sl: 10, don_gia: 30000, thanh_tien: 300000 }
    ] },
    { ma_phieu: 'NK-003', ngay: '05/06/2025', ncc: 'Công ty Minh Long', loai: 'Thực phẩm', tong_tien: 12000000, chi_tiet: [
      { ten: 'Thịt bò nhập khẩu', dvt: 'Kg', sl: 30, don_gia: 280000, thanh_tien: 8400000 },
      { ten: 'Mực tươi', dvt: 'Kg', sl: 20, don_gia: 180000, thanh_tien: 3600000 }
    ] },
    { ma_phieu: 'NK-004', ngay: '07/06/2025', ncc: 'Nhà phân phối Lavie', loai: 'Đồ uống', tong_tien: 6150000, chi_tiet: [
      { ten: 'Nước suối Lavie 500ml', dvt: 'Thùng 24 chai', sl: 20, don_gia: 120000, thanh_tien: 2400000 },
      { ten: 'Pepsi lon 330ml', dvt: 'Thùng 24 lon', sl: 15, don_gia: 250000, thanh_tien: 3750000 }
    ] }
  ],
  phieu_xuat_kho: [
    { ma_phieu: 'XK-001', ngay: '02/06/2025', chi_nhanh_nhan: 'CF Marina', ly_do: 'Sử dụng hàng ngày', tong_tien: 1275000, chi_tiet: [
      { ten: 'Bia Sài Gòn lon 330ml', dvt: 'Lon', sl: 100, don_gia: 12000, thanh_tien: 1200000 },
      { ten: 'Rau muống', dvt: 'Kg', sl: 5, don_gia: 15000, thanh_tien: 75000 }
    ] },
    { ma_phieu: 'XK-002', ngay: '03/06/2025', chi_nhanh_nhan: 'Marina Beer Garden', ly_do: 'Sử dụng hàng ngày', tong_tien: 3360000, chi_tiet: [
      { ten: 'Bia Tiger lon 330ml', dvt: 'Lon', sl: 80, don_gia: 14000, thanh_tien: 1120000 },
      { ten: 'Thịt bò nhập khẩu', dvt: 'Kg', sl: 8, don_gia: 280000, thanh_tien: 2240000 }
    ] },
    { ma_phieu: 'XK-003', ngay: '05/06/2025', chi_nhanh_nhan: 'Motchai', ly_do: 'Chế biến bếp', tong_tien: 975000, chi_tiet: [
      { ten: 'Mực tươi', dvt: 'Kg', sl: 5, don_gia: 180000, thanh_tien: 900000 },
      { ten: 'Cà chua', dvt: 'Kg', sl: 3, don_gia: 25000, thanh_tien: 75000 }
    ] }
  ],
  ton_kho_tong_hop: [
    { ten: 'Bia Sài Gòn lon 330ml', dvt: 'Lon', ton_dau: 1200, nhap: 1200, xuat: -850, ton_cuoi: 1550, don_gia: 12000, gia_tri_ton: 18600000, trang_thai: 'Đủ hàng' },
    { ten: 'Bia Tiger lon 330ml', dvt: 'Lon', ton_dau: 720, nhap: 720, xuat: -610, ton_cuoi: 830, don_gia: 14000, gia_tri_ton: 11620000, trang_thai: 'Đủ hàng' },
    { ten: 'Rau muống', dvt: 'Kg', ton_dau: 0, nhap: 20, xuat: -15, ton_cuoi: 5, don_gia: 15000, gia_tri_ton: 75000, trang_thai: 'Sắp hết' },
    { ten: 'Cà chua', dvt: 'Kg', ton_dau: 5, nhap: 15, xuat: -12, ton_cuoi: 8, don_gia: 25000, gia_tri_ton: 200000, trang_thai: 'Sắp hết' },
    { ten: 'Thịt bò nhập khẩu', dvt: 'Kg', ton_dau: 10, nhap: 30, xuat: -22, ton_cuoi: 18, don_gia: 280000, gia_tri_ton: 5040000, trang_thai: 'Đủ hàng' },
    { ten: 'Mực tươi', dvt: 'Kg', ton_dau: 5, nhap: 20, xuat: -16, ton_cuoi: 9, don_gia: 180000, gia_tri_ton: 1620000, trang_thai: 'Sắp hết' },
    { ten: 'Nước suối Lavie 500ml', dvt: 'Chai', ton_dau: 200, nhap: 480, xuat: -320, ton_cuoi: 360, don_gia: 5500, gia_tri_ton: 1980000, trang_thai: 'Đủ hàng' },
    { ten: 'Pepsi lon 330ml', dvt: 'Lon', ton_dau: 180, nhap: 360, xuat: -290, ton_cuoi: 250, don_gia: 11000, gia_tri_ton: 2750000, trang_thai: 'Đủ hàng' },
    { ten: 'Cà phê hạt Robusta', dvt: 'Kg', ton_dau: 15, nhap: 20, xuat: -18, ton_cuoi: 17, don_gia: 120000, gia_tri_ton: 2040000, trang_thai: 'Đủ hàng' },
    { ten: 'Sữa đặc Ông Thọ', dvt: 'Lon 380g', ton_dau: 50, nhap: 100, xuat: -85, ton_cuoi: 65, don_gia: 22000, gia_tri_ton: 1430000, trang_thai: 'Đủ hàng' }
  ],
  food_cost_hang_ngay: [
    { ngay: '01/06/2025', chi_nhanh: 'CF Marina', doanh_thu: 18500000, chi_phi_nvl: 5920000, food_cost_percent: '32.0%', danh_gia: 'Vượt' },
    { ngay: '01/06/2025', chi_nhanh: 'Marina Beer Garden', doanh_thu: 35000000, chi_phi_nvl: 10850000, food_cost_percent: '31.0%', danh_gia: 'Vượt' },
    { ngay: '02/06/2025', chi_nhanh: 'CF Marina', doanh_thu: 21000000, chi_phi_nvl: 6510000, food_cost_percent: '31.0%', danh_gia: 'Vượt' },
    { ngay: '02/06/2025', chi_nhanh: 'Marina Beer Garden', doanh_thu: 42000000, chi_phi_nvl: 13020000, food_cost_percent: '31.0%', danh_gia: 'Vượt' },
    { ngay: '03/06/2025', chi_nhanh: 'Motchai', doanh_thu: 28000000, chi_phi_nvl: 8400000, food_cost_percent: '30.0%', danh_gia: 'Đạt' },
    { ngay: '03/06/2025', chi_nhanh: 'CF À Merci', doanh_thu: 15000000, chi_phi_nvl: 4950000, food_cost_percent: '33.0%', danh_gia: 'Vượt' },
    { ngay: '04/06/2025', chi_nhanh: 'CF Marina', doanh_thu: 19500000, chi_phi_nvl: 6240000, food_cost_percent: '32.0%', danh_gia: 'Vượt' },
    { ngay: '05/06/2025', chi_nhanh: 'Marina Beer 52', doanh_thu: 31000000, chi_phi_nvl: 9610000, food_cost_percent: '31.0%', danh_gia: 'Vượt' }
  ],
  hao_hut_nguyen_lieu: [
    { ngay: '01/06/2025', chi_nhanh: 'CF Marina', nguyen_lieu: 'Cà phê hạt', dvt: 'Kg', ly_thuyet: 2.5, thuc_te: 2.3, hao_hut: 0.2, hao_hut_percent: '8.0%', ly_do: 'Sơ chế', danh_gia: 'Cần xem xét' },
    { ngay: '01/06/2025', chi_nhanh: 'Motchai', nguyen_lieu: 'Thịt bò', dvt: 'Kg', ly_thuyet: 10, thuc_te: 9.2, hao_hut: 0.8, hao_hut_percent: '8.0%', ly_do: 'Chế biến', danh_gia: 'Cần xem xét' },
    { ngay: '02/06/2025', chi_nhanh: 'CF Marina', nguyen_lieu: 'Sữa tươi', dvt: 'Lít', ly_thuyet: 20, thuc_te: 19.5, hao_hut: 0.5, hao_hut_percent: '2.5%', ly_do: 'Đổ tràn', danh_gia: 'Chấp nhận' },
    { ngay: '03/06/2025', chi_nhanh: 'Marina Beer Garden', nguyen_lieu: 'Rau muống', dvt: 'Kg', ly_thuyet: 8, thuc_te: 7.2, hao_hut: 0.8, hao_hut_percent: '10.0%', ly_do: 'Loại bỏ lá hỏng', danh_gia: 'Cần xem xét' },
    { ngay: '04/06/2025', chi_nhanh: 'Motchai', nguyen_lieu: 'Mực tươi', dvt: 'Kg', ly_thuyet: 5, thuc_te: 4.6, hao_hut: 0.4, hao_hut_percent: '8.0%', ly_do: 'Sơ chế', danh_gia: 'Cần xem xét' }
  ],
  dinh_muc_nvl: [
    { ten_mon: 'Cà phê sữa đá', cost_nvl: 6, thanh_phan: [
      { nguyen_lieu: 'Cà phê hạt Robusta', dvt: 'g', dinh_muc: 25, don_gia: '120đ/g', chi_phi: 3 },
      { nguyen_lieu: 'Sữa đặc Ông Thọ', dvt: 'g', dinh_muc: 40, don_gia: '58đ/g', chi_phi: 2 },
      { nguyen_lieu: 'Đường cát trắng', dvt: 'g', dinh_muc: 10, don_gia: '20đ/g', chi_phi: 0 }
    ] },
    { ten_mon: 'Bò lúc lắc', cost_nvl: 60, thanh_phan: [
      { nguyen_lieu: 'Thịt bò nhập khẩu', dvt: 'g', dinh_muc: 200, don_gia: '280đ/g', chi_phi: 56 },
      { nguyen_lieu: 'Hành tây', dvt: 'g', dinh_muc: 50, don_gia: '30đ/g', chi_phi: 2 },
      { nguyen_lieu: 'Ớt chuông', dvt: 'g', dinh_muc: 30, don_gia: '45đ/g', chi_phi: 1 },
      { nguyen_lieu: 'Bơ lạt', dvt: 'g', dinh_muc: 15, don_gia: '80đ/g', chi_phi: 1 }
    ] },
    { ten_mon: 'Mực chiên giòn', cost_nvl: 32, thanh_phan: [
      { nguyen_lieu: 'Mực tươi', dvt: 'g', dinh_muc: 150, don_gia: '180đ/g', chi_phi: 27 },
      { nguyen_lieu: 'Bột chiên xù', dvt: 'g', dinh_muc: 30, don_gia: '35đ/g', chi_phi: 1 },
      { nguyen_lieu: 'Trứng gà', dvt: 'quả', dinh_muc: 1, don_gia: '3.500đ/quả', chi_phi: 4 }
    ] }
  ],
  danh_sach_doanh_thu_ngay: [
    { ngay: '01/06/2025', chi_nhanh: 'CF Marina', loai: 'Đồ uống', so_hd: 145, doanh_thu: 18500000, thanh_toan: 'Tiền mặt', ghi_chu: '' },
    { ngay: '01/06/2025', chi_nhanh: 'Marina Beer Garden', loai: 'Ăn uống', so_hd: 210, doanh_thu: 35000000, thanh_toan: 'Chuyển khoản', ghi_chu: 'Cuối tuần' },
    { ngay: '01/06/2025', chi_nhanh: 'Motchai', loai: 'Ăn uống', so_hd: 88, doanh_thu: 28000000, thanh_toan: 'Hỗn hợp', ghi_chu: '' },
    { ngay: '01/06/2025', chi_nhanh: 'CF À Merci', loai: 'Đồ uống', so_hd: 95, doanh_thu: 15000000, thanh_toan: 'Tiền mặt', ghi_chu: '' },
    { ngay: '01/06/2025', chi_nhanh: 'Marina Beer 52', loai: 'Ăn uống', so_hd: 178, doanh_thu: 31000000, thanh_toan: 'Hỗn hợp', ghi_chu: '' },
    { ngay: '02/06/2025', chi_nhanh: 'CF Marina', loai: 'Đồ uống', so_hd: 162, doanh_thu: 21000000, thanh_toan: 'Tiền mặt', ghi_chu: '' },
    { ngay: '02/06/2025', chi_nhanh: 'Marina Beer Garden', loai: 'Ăn uống', so_hd: 265, doanh_thu: 42000000, thanh_toan: 'Hỗn hợp', ghi_chu: 'Event DJ' },
    { ngay: '02/06/2025', chi_nhanh: 'Motchai', loai: 'Ăn uống', so_hd: 102, doanh_thu: 32000000, thanh_toan: 'Chuyển khoản', ghi_chu: '' },
    { ngay: '03/06/2025', chi_nhanh: 'CF À Merci', loai: 'Sự kiện', so_hd: 1, doanh_thu: 45000000, thanh_toan: 'Chuyển khoản', ghi_chu: 'Tiệc công ty' },
    { ngay: '03/06/2025', chi_nhanh: 'Marina Beer 52', loai: 'Ăn uống', so_hd: 155, doanh_thu: 28000000, thanh_toan: 'Hỗn hợp', ghi_chu: '' }
  ],
  chi_phi_chi_tiet: [
    { id: 1, ngay: '01/06/2025', danh_muc: 'Nguyên vật liệu', mo_ta: 'Mua bia Sài Gòn', so_tien: 14000000, ncc: 'Công ty Bia Sài Gòn', trang_thai: 'Đã thanh toán' },
    { id: 2, ngay: '02/06/2025', danh_muc: 'Nguyên vật liệu', mo_ta: 'Mua rau củ quả', so_tien: 975000, ncc: 'Vựa rau Bình Định', trang_thai: 'Đã thanh toán' },
    { id: 3, ngay: '03/06/2025', danh_muc: 'Nguyên vật liệu', mo_ta: 'Mua thịt bò, mực', so_tien: 12000000, ncc: 'Công ty Minh Long', trang_thai: 'Đã thanh toán' },
    { id: 4, ngay: '05/06/2025', danh_muc: 'Điện nước', mo_ta: 'Tiền điện T6 — CF Marina', so_tien: 8500000, ncc: 'Điện lực Quy Nhơn', trang_thai: 'Đã thanh toán' },
    { id: 5, ngay: '05/06/2025', danh_muc: 'Điện nước', mo_ta: 'Tiền điện T6 — Beer Garden', so_tien: 12000000, ncc: 'Điện lực Quy Nhơn', trang_thai: 'Đã thanh toán' },
    { id: 6, ngay: '10/06/2025', danh_muc: 'Nhân sự', mo_ta: 'Tạm ứng lương T6', so_tien: 35000000, ncc: 'Nội bộ', trang_thai: 'Đã thanh toán' },
    { id: 7, ngay: '10/06/2025', danh_muc: 'Marketing', mo_ta: 'Quảng cáo Facebook Ads', so_tien: 5000000, ncc: 'Facebook', trang_thai: 'Đã thanh toán' },
    { id: 8, ngay: '12/06/2025', danh_muc: 'CCDC', mo_ta: 'Mua ly, chén, dụng cụ bếp', so_tien: 3500000, ncc: 'Siêu thị Coop Mart', trang_thai: 'Đã thanh toán' },
    { id: 9, ngay: '15/06/2025', danh_muc: 'Thuê mặt bằng', mo_ta: 'Tiền thuê MB tháng 6', so_tien: 45000000, ncc: 'Chủ nhà', trang_thai: 'Đã thanh toán' },
    { id: 10, ngay: '18/06/2025', danh_muc: 'Sửa chữa', mo_ta: 'Sửa máy lạnh Beer Garden', so_tien: 4200000, ncc: 'Công ty ĐLBT', trang_thai: 'Chưa thanh toán' }
  ],
  cong_no_ncc_chi_tiet: [
    { id: 1, ncc: 'Công ty Bia Sài Gòn', loai: 'Đồ uống', no_dau_ky: 0, phat_sinh: 65000000, da_tt: 50000000, con_lai: 15000000, han_tt: '25/06/2025', trang_thai: 'Chưa đến hạn' },
    { id: 2, ncc: 'Công ty Minh Long', loai: 'Thực phẩm', no_dau_ky: 5000000, phat_sinh: 45000000, da_tt: 40000000, con_lai: 10000000, han_tt: '20/06/2025', trang_thai: 'Đã quá hạn' },
    { id: 3, ncc: 'Vựa rau Bình Định', loai: 'Rau củ', no_dau_ky: 0, phat_sinh: 8500000, da_tt: 8500000, con_lai: 0, han_tt: '15/06/2025', trang_thai: 'Đã thanh toán' },
    { id: 4, ncc: 'Nhà phân phối Lavie', loai: 'Đồ uống', no_dau_ky: 2000000, phat_sinh: 12000000, da_tt: 12000000, con_lai: 2000000, han_tt: '30/06/2025', trang_thai: 'Chưa đến hạn' },
    { id: 5, ncc: 'Công ty ĐLBT', loai: 'Dịch vụ', no_dau_ky: 0, phat_sinh: 4200000, da_tt: 0, con_lai: 4200000, han_tt: '28/06/2025', trang_thai: 'Chưa đến hạn' }
  ],
  bao_cao_p_and_l: {
    doanh_thu_thuan: { so_tien: 295500000, tile: '100.0%' },
    gia_von_hang_ban: {
      tong: { so_tien: 26975000, tile: '9.1%' },
      chi_phi_nvl_thuc_pham: 14836250,
      chi_phi_nvl_do_uong: 12138750
    },
    loi_nhuan_gop: { so_tien: 268525000, tile: '90.9%' },
    chi_phi_van_hanh: {
      tong: { so_tien: 113200000, tile: '38.3%' },
      chi_phi_nhan_su: 35000000,
      tien_thue_mat_bang: 45000000,
      dien_nuoc_gas: 20500000,
      marketing_quang_cao: 5000000,
      ccdc_cong_cu_bep: 3500000,
      sua_chua_bao_tri: 4200000
    },
    tong_chi_phi: { so_tien: 140175000, tile: '47.4%' },
    loi_nhuan_truoc_thue: { so_tien: 155325000, tile: '52.6%' }
  },
  so_sanh_chi_nhanh: [
    { chi_nhanh: 'Marina Beer Garden', doanh_thu: 77000000, dong_gop: '26.1%', hoa_don: 475, tb_hd: 162000 },
    { chi_nhanh: 'CF À Merci', doanh_thu: 60000000, dong_gop: '20.3%', hoa_don: 96, tb_hd: 625000 },
    { chi_nhanh: 'Motchai', doanh_thu: 60000000, dong_gop: '20.3%', hoa_don: 190, tb_hd: 316000 },
    { chi_nhanh: 'Marina Beer 52', doanh_thu: 59000000, dong_gop: '20.0%', hoa_don: 333, tb_hd: 177000 },
    { chi_nhanh: 'CF Marina', doanh_thu: 39500000, dong_gop: '13.4%', hoa_don: 307, tb_hd: 129000 }
  ]
};

function normalizeDocId(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function ensureFirestore() {
  if (!admin.apps || !admin.apps.length) {
    admin.initializeApp({
      credential: admin.cert(serviceAccount)
    });
  }
  return getFirestore();
}

async function writeDocsInBatches(db, collectionName, docs, getDocId = null) {
  const collectionRef = db.collection(collectionName);
  let batch = db.batch();
  let opCount = 0;

  for (const item of docs) {
    const docId = getDocId ? getDocId(item) : undefined;
    const docRef = docId ? collectionRef.doc(docId) : collectionRef.doc();
    batch.set(docRef, item, { merge: true });
    opCount += 1;

    if (opCount === 499) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
}

async function main() {
  const db = ensureFirestore();
  console.log('Starting Firestore import for Marina Group data...');

  await db.collection('system_settings').doc('marina_group_t6_2025').set({
    ...reportData.system_info,
    ...reportData.tong_quan,
    bao_cao_p_and_l: reportData.bao_cao_p_and_l
  }, { merge: true });

  await writeDocsInBatches(
    db,
    'salaries',
    reportData.bang_luong_nhan_vien.map((employee) => ({
      ...employee,
      id: employee.id,
      document_id: `nv_${employee.id}`
    })),
    (employee) => `nv_${employee.id}`
  );

  await writeDocsInBatches(db, 'purchase_orders', reportData.phieu_nhap_kho, (order) => order.ma_phieu);
  await writeDocsInBatches(db, 'export_orders', reportData.phieu_xuat_kho, (order) => order.ma_phieu);
  await writeDocsInBatches(db, 'inventory', reportData.ton_kho_tong_hop, (item) => normalizeDocId(item.ten));
  await writeDocsInBatches(db, 'daily_food_costs', reportData.food_cost_hang_ngay);
  await writeDocsInBatches(db, 'material_wastages', reportData.hao_hut_nguyen_lieu);
  await writeDocsInBatches(db, 'recipes', reportData.dinh_muc_nvl, (recipe) => normalizeDocId(recipe.ten_mon));
  await writeDocsInBatches(db, 'daily_revenues', reportData.danh_sach_doanh_thu_ngay);
  await writeDocsInBatches(db, 'detailed_expenses', reportData.chi_phi_chi_tiet, (expense) => String(expense.id));
  await writeDocsInBatches(db, 'supplier_debts', reportData.cong_no_ncc_chi_tiet, (debt) => String(debt.id));
  await writeDocsInBatches(db, 'branch_performance', reportData.so_sanh_chi_nhanh, (branch) => normalizeDocId(branch.chi_nhanh));

  console.log('Firestore import completed successfully.');
}

main().catch((error) => {
  console.error('Firestore import failed:', error);
  process.exit(1);
});
