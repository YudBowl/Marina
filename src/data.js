export const VENUES = ["CF Marina", "CF À Merci", "Marina Beer Garden", "Cô Hai", "Motchai"];

export const INIT_NHANVIEN = [
  {  },
  { id:2, code:"NV002", name:"Trần Thị Bình",   chucvu:"Thu ngân",     cn:"CF Marina",          loai:"Fulltime", luong:7500000,  tt:"Còn làm" },
  { id:3, code:"NV003", name:"Lê Văn Cường",    chucvu:"Phục vụ",      cn:"CF Marina",          loai:"Parttime", luong:4500000,  tt:"Còn làm" },
  { id:4, code:"NV004", name:"Phạm Thị Dung",   chucvu:"Pha chế",      cn:"CF À Merci",         loai:"Fulltime", luong:8000000,  tt:"Còn làm" },
  { id:5, code:"NV005", name:"Hoàng Văn Em",    chucvu:"Bảo vệ",       cn:"Marina Beer Garden", loai:"Fulltime", luong:6000000,  tt:"Còn làm" },
  { id:6, code:"NV006", name:"Đỗ Thị Fương",    chucvu:"Phục vụ",      cn:"Marina Beer Garden", loai:"Parttime", luong:4200000,  tt:"Còn làm" },
  { id:7, code:"NV007", name:"Vũ Văn Giang",    chucvu:"Bếp trưởng",   cn:"Motchai",            loai:"Fulltime", luong:10000000, tt:"Còn làm" },
  { id:8, code:"NV008", name:"Bùi Thị Hoa",     chucvu:"Phục vụ",      cn:"Motchai",            loai:"Parttime", luong:4000000,  tt:"Còn làm" },
  { id:9, code:"NV009", name:"Ngô Văn Ích",     chucvu:"Phục vụ",      cn:"Cô Hai",     loai:"Fulltime", luong:5500000,  tt:"Còn làm" },
  { id:10,code:"NV010", name:"Đinh Thị Kim",   chucvu:"Thu ngân",     cn:"Cô Hai",     loai:"Fulltime", luong:7000000,  tt:"Còn làm" },
];

const WEEKENDS = [6,7,13,14,20,21,27,28];
export const INIT_CHAMCONG = INIT_NHANVIEN.map(nv => ({
  nvId: nv.id, name: nv.name, chucvu: nv.chucvu, cn: nv.cn,
  ngay: Array.from({length:30}, (_,i) => {
    const d = i+1;
    return WEEKENDS.includes(d) ? "V" : (Math.random()>.12 ? "P" : "V");
  }),
}));

export const INIT_NHAPKHO = [
  { id:1, phieu:"NK-001", date:"02/06/2025", ncc:"Công ty Bia Sài Gòn", hanmuc:"Đồ uống",
    items:[{ten:"Bia Sài Gòn lon 330ml",dvt:"Thùng 24 lon",sl:50,dg:280000},{ten:"Bia Tiger lon 330ml",dvt:"Thùng 24 lon",sl:30,dg:310000}]},
  { id:2, phieu:"NK-002", date:"03/06/2025", ncc:"Vựa rau Bình Định", hanmuc:"Rau củ quả",
    items:[{ten:"Rau muống",dvt:"Kg",sl:20,dg:15000},{ten:"Cà chua",dvt:"Kg",sl:15,dg:25000},{ten:"Hành tây",dvt:"Kg",sl:10,dg:30000}]},
  { id:3, phieu:"NK-003", date:"05/06/2025", ncc:"Công ty Minh Long", hanmuc:"Thực phẩm",
    items:[{ten:"Thịt bò nhập khẩu",dvt:"Kg",sl:30,dg:280000},{ten:"Mực tươi",dvt:"Kg",sl:20,dg:180000}]},
  { id:4, phieu:"NK-004", date:"07/06/2025", ncc:"Nhà phân phối Lavie", hanmuc:"Đồ uống",
    items:[{ten:"Nước suối Lavie 500ml",dvt:"Thùng 24 chai",sl:20,dg:120000},{ten:"Pepsi lon 330ml",dvt:"Thùng 24 lon",sl:15,dg:250000}]},
];

export const INIT_XUATKHO = [
  { id:1, phieu:"XK-001", date:"02/06/2025", cn:"CF Marina", lydo:"Sử dụng hàng ngày",
    items:[{ten:"Bia Sài Gòn lon 330ml",dvt:"Lon",sl:100,dg:12000},{ten:"Rau muống",dvt:"Kg",sl:5,dg:15000}]},
  { id:2, phieu:"XK-002", date:"03/06/2025", cn:"Marina Beer Garden", lydo:"Sử dụng hàng ngày",
    items:[{ten:"Bia Tiger lon 330ml",dvt:"Lon",sl:80,dg:14000},{ten:"Thịt bò nhập khẩu",dvt:"Kg",sl:8,dg:280000}]},
  { id:3, phieu:"XK-003", date:"05/06/2025", cn:"Motchai", lydo:"Chế biến bếp",
    items:[{ten:"Mực tươi",dvt:"Kg",sl:5,dg:180000},{ten:"Cà chua",dvt:"Kg",sl:3,dg:25000}]},
];

export const INIT_TONKHO = [
  { id:1, ten:"Bia Sài Gòn lon 330ml",    dvt:"Lon",       td:1200, nhap:1200, xuat:850,  dg:12000  },
  { id:2, ten:"Bia Tiger lon 330ml",       dvt:"Lon",       td:720,  nhap:720,  xuat:610,  dg:14000  },
  { id:3, ten:"Rau muống",                dvt:"Kg",        td:0,    nhap:20,   xuat:15,   dg:15000  },
  { id:4, ten:"Cà chua",                  dvt:"Kg",        td:5,    nhap:15,   xuat:12,   dg:25000  },
  { id:5, ten:"Thịt bò nhập khẩu",        dvt:"Kg",        td:10,   nhap:30,   xuat:22,   dg:280000 },
  { id:6, ten:"Mực tươi",                 dvt:"Kg",        td:5,    nhap:20,   xuat:16,   dg:180000 },
  { id:7, ten:"Nước suối Lavie 500ml",    dvt:"Chai",      td:200,  nhap:480,  xuat:320,  dg:5500   },
  { id:8, ten:"Pepsi lon 330ml",           dvt:"Lon",       td:180,  nhap:360,  xuat:290,  dg:11000  },
  { id:9, ten:"Cà phê hạt Robusta",        dvt:"Kg",        td:15,   nhap:20,   xuat:18,   dg:120000 },
  { id:10,ten:"Sữa đặc Ông Thọ",          dvt:"Lon 380g",  td:50,   nhap:100,  xuat:85,   dg:22000  },
];

export const INIT_FOODCOST = [
  { id:1, date:"01/06/2025", cn:"CF Marina",          dt:18500000, cp:5920000  },
  { id:2, date:"01/06/2025", cn:"Marina Beer Garden", dt:35000000, cp:10850000 },
  { id:3, date:"02/06/2025", cn:"CF Marina",          dt:21000000, cp:6510000  },
  { id:4, date:"02/06/2025", cn:"Marina Beer Garden", dt:42000000, cp:13020000 },
  { id:5, date:"03/06/2025", cn:"Motchai",             dt:28000000, cp:8400000  },
  { id:6, date:"03/06/2025", cn:"CF À Merci",          dt:15000000, cp:4950000  },
  { id:7, date:"04/06/2025", cn:"CF Marina",          dt:19500000, cp:6240000  },
  { id:8, date:"05/06/2025", cn:"Marina Beer 52",     dt:31000000, cp:9610000  },
];

export const INIT_HAOHUT = [
  { id:1, date:"01/06/2025", cn:"CF Marina",          nvl:"Cà phê hạt", dvt:"Kg", lt:2.5,  tt:2.3,  lydo:"Sơ chế"            },
  { id:2, date:"01/06/2025", cn:"Motchai",             nvl:"Thịt bò",    dvt:"Kg", lt:10.0, tt:9.2,  lydo:"Chế biến"          },
  { id:3, date:"02/06/2025", cn:"CF Marina",          nvl:"Sữa tươi",   dvt:"Lít",lt:20.0, tt:19.5, lydo:"Đổ tràn"           },
  { id:4, date:"03/06/2025", cn:"Marina Beer Garden", nvl:"Rau muống",  dvt:"Kg", lt:8.0,  tt:7.2,  lydo:"Loại bỏ lá hỏng"  },
  { id:5, date:"04/06/2025", cn:"Motchai",             nvl:"Mực tươi",   dvt:"Kg", lt:5.0,  tt:4.6,  lydo:"Sơ chế"            },
];

export const INIT_NVL = [
  { id:1, mon:"Cà phê sữa đá",   nvl:"Cà phê hạt Robusta", dvt:"g",    dm:25,  dg:120  },
  { id:2, mon:"Cà phê sữa đá",   nvl:"Sữa đặc Ông Thọ",    dvt:"g",    dm:40,  dg:58   },
  { id:3, mon:"Cà phê sữa đá",   nvl:"Đường cát trắng",    dvt:"g",    dm:10,  dg:20   },
  { id:4, mon:"Bò lúc lắc",      nvl:"Thịt bò nhập khẩu",  dvt:"g",    dm:200, dg:280  },
  { id:5, mon:"Bò lúc lắc",      nvl:"Hành tây",            dvt:"g",    dm:50,  dg:30   },
  { id:6, mon:"Bò lúc lắc",      nvl:"Ớt chuông",           dvt:"g",    dm:30,  dg:45   },
  { id:7, mon:"Bò lúc lắc",      nvl:"Bơ lạt",              dvt:"g",    dm:15,  dg:80   },
  { id:8, mon:"Mực chiên giòn",  nvl:"Mực tươi",            dvt:"g",    dm:150, dg:180  },
  { id:9, mon:"Mực chiên giòn",  nvl:"Bột chiên xù",        dvt:"g",    dm:30,  dg:35   },
  { id:10,mon:"Mực chiên giòn",  nvl:"Trứng gà",            dvt:"quả",  dm:1,   dg:3500 },
];

export const INIT_DOANHTHU = [
  { id:1, date:"01/06/2025", cn:"CF Marina",          loai:"Đồ uống",  hd:0, dt:0, tt:"Tiền mặt",     ghi:"" },
  { id:2, date:"01/06/2025", cn:"Marina Beer Garden", loai:"Ăn uống",  hd:210, dt:35000000, tt:"Chuyển khoản", ghi:"Cuối tuần" },
  { id:3, date:"01/06/2025", cn:"Motchai",             loai:"Ăn uống",  hd:0,  dt:0, tt:"Hỗn hợp",      ghi:"" },
  { id:4, date:"01/06/2025", cn:"CF À Merci",          loai:"Đồ uống",  hd:95,  dt:15000000, tt:"Tiền mặt",     ghi:"" },
  { id:5, date:"01/06/2025", cn:"Marina Beer 52",     loai:"Ăn uống",  hd:178, dt:31000000, tt:"Hỗn hợp",      ghi:"" },
  { id:6, date:"02/06/2025", cn:"CF Marina",          loai:"Đồ uống",  hd:0, dt:0, tt:"Tiền mặt",     ghi:"" },
  { id:7, date:"02/06/2025", cn:"Marina Beer Garden", loai:"Ăn uống",  hd:265, dt:42000000, tt:"Hỗn hợp",      ghi:"Event DJ" },
  { id:8, date:"02/06/2025", cn:"Motchai",             loai:"Ăn uống",  hd:0, dt:0, tt:"Chuyển khoản", ghi:"" },
  { id:9, date:"03/06/2025", cn:"CF À Merci",          loai:"Sự kiện",  hd:1,   dt:45000000, tt:"Chuyển khoản", ghi:"Tiệc công ty" },
  { id:10,date:"03/06/2025", cn:"Marina Beer 52",     loai:"Ăn uống",  hd:155, dt:28000000, tt:"Hỗn hợp",      ghi:"" },
];

export const INIT_CHIPHI = [
  { id:1, date:"01/06/2025", dm:"Nguyên vật liệu", mo:"Mua bia Sài Gòn",          so:14000000, ncc:"Công ty Bia Sài Gòn",   tt:"Đã thanh toán"   },
  { id:2, date:"02/06/2025", dm:"Nguyên vật liệu", mo:"Mua rau củ quả",           so:975000,   ncc:"Vựa rau Bình Định",     tt:"Đã thanh toán"   },
  { id:3, date:"03/06/2025", dm:"Nguyên vật liệu", mo:"Mua thịt bò, mực",         so:12000000, ncc:"Công ty Minh Long",     tt:"Đã thanh toán"   },
  { id:4, date:"05/06/2025", dm:"Điện nước",        mo:"Tiền điện T6 — CF Marina", so:8500000,  ncc:"Điện lực Quy Nhơn",    tt:"Đã thanh toán"   },
  { id:5, date:"05/06/2025", dm:"Điện nước",        mo:"Tiền điện T6 — Beer Garden",so:12000000,ncc:"Điện lực Quy Nhơn",    tt:"Đã thanh toán"   },
  { id:6, date:"10/06/2025", dm:"Nhân sự",          mo:"Tạm ứng lương T6",         so:35000000, ncc:"Nội bộ",               tt:"Đã thanh toán"   },
  { id:7, date:"10/06/2025", dm:"Marketing",        mo:"Quảng cáo Facebook Ads",   so:5000000,  ncc:"Facebook",             tt:"Đã thanh toán"   },
  { id:8, date:"12/06/2025", dm:"CCDC",             mo:"Mua ly, chén, dụng cụ bếp",so:3500000,  ncc:"Siêu thị Coop Mart",  tt:"Đã thanh toán"   },
  { id:9, date:"15/06/2025", dm:"Thuê mặt bằng",   mo:"Tiền thuê MB tháng 6",     so:45000000, ncc:"Chủ nhà",              tt:"Đã thanh toán"   },
  { id:10,date:"18/06/2025", dm:"Sửa chữa",        mo:"Sửa máy lạnh Beer Garden", so:4200000,  ncc:"Công ty ĐLBT",         tt:"Chưa thanh toán" },
];

export const INIT_CONGNO = [
  { id:1, ncc:"Công ty Bia Sài Gòn",   loai:"Đồ uống",   dk:0,       ps:65000000, dtt:50000000, han:"25/06/2025", tt:"Chưa đến hạn"  },
  { id:2, ncc:"Công ty Minh Long",      loai:"Thực phẩm", dk:5000000, ps:45000000, dtt:40000000, han:"20/06/2025", tt:"Đã quá hạn"    },
  { id:3, ncc:"Vựa rau Bình Định",      loai:"Rau củ",    dk:0,       ps:8500000,  dtt:8500000,  han:"15/06/2025", tt:"Đã thanh toán" },
  { id:4, ncc:"Nhà phân phối Lavie",   loai:"Đồ uống",   dk:2000000, ps:12000000, dtt:12000000, han:"30/06/2025", tt:"Chưa đến hạn"  },
  { id:5, ncc:"Công ty ĐLBT",           loai:"Dịch vụ",   dk:0,       ps:4200000,  dtt:0,        han:"28/06/2025", tt:"Chưa đến hạn"  },
];
