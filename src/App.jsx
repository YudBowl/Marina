import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  VENUES, INIT_NHANVIEN, INIT_CHAMCONG, INIT_NHAPKHO, INIT_XUATKHO,
  INIT_TONKHO, INIT_FOODCOST, INIT_HAOHUT, INIT_NVL,
  INIT_DOANHTHU, INIT_CHIPHI, INIT_CONGNO,
} from "./data.js";

/* ── localStorage hook ── */
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem("marina_" + key);
      return stored ? JSON.parse(stored) : init;
    } catch { return init; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("marina_" + key, JSON.stringify(val));
    } catch {}
  }, [key, val]);

  const set = useCallback((v) => {
    setVal(prev => typeof v === "function" ? v(prev) : v);
  }, []);

  return [val, set];
}

/* ── Format helpers ── */
const vnd  = (n) => (n || 0).toLocaleString("vi-VN") + "đ";
const mtr  = (n) => ((n || 0) / 1e6).toFixed(1) + "tr";
const pct  = (n) => (n || 0).toFixed(1) + "%";
const uid  = () => Date.now() + Math.random();

/* ── Chart colors (Tidepool) ── */
const CC = ["#2a78d6","#1baf7a","#eda100","#4a3aa7","#eb6834","#e34948","#e87ba4","#898781"];

/* ── Navigation ── */
const NAV = [
  { id:"dashboard",   icon:"⊞",  label:"Tổng quan" },
  { section: "Nhân sự" },
  { id:"ns-dsnv",     icon:"👥", label:"Danh sách nhân viên" },
  { id:"ns-chamcong", icon:"📅", label:"Bảng chấm công" },
  { id:"ns-luong",    icon:"💵", label:"Bảng tính lương" },
  { section: "Vận hành & kho" },
  { id:"vh-nhapkho",  icon:"📥", label:"Phiếu nhập kho" },
  { id:"vh-xuatkho",  icon:"📤", label:"Phiếu xuất kho" },
  { id:"vh-tonkho",   icon:"📦", label:"Tồn kho tổng hợp" },
  { section: "Chi phí" },
  { id:"c-foodcost",  icon:"%",  label:"Food cost hàng ngày" },
  { id:"c-haohut",    icon:"⚠",  label:"Hao hụt nguyên liệu" },
  { section: "Thu & Chi" },
  { id:"tc-dt",       icon:"📈", label:"Doanh thu" },
  { id:"tc-cp",       icon:"📉", label:"Chi phí" },
  { id:"tc-cn",       icon:"🗒", label:"Công nợ NCC" },
  { section: "Báo cáo" },
  { id:"bc-pl",       icon:"📊", label:"P&L tháng" },
  { id:"bc-venue",    icon:"🏪", label:"So sánh chi nhánh" },
  { id:"api-test",    icon:"🧪", label:"API test" },
];

const PAGE_TITLES = {
  dashboard:"Tổng quan",
  "ns-dsnv":"Danh sách nhân viên","ns-chamcong":"Bảng chấm công","ns-luong":"Bảng tính lương",
  "vh-nhapkho":"Phiếu nhập kho","vh-xuatkho":"Phiếu xuất kho","vh-tonkho":"Tồn kho tổng hợp",
  "c-foodcost":"Food cost hàng ngày","c-haohut":"Hao hụt nguyên liệu",
  "tc-dt":"Bảng doanh thu","tc-cp":"Bảng chi phí","tc-cn":"Công nợ nhà cung cấp",
  "bc-pl":"Kết quả kinh doanh (P&L)","bc-venue":"So sánh chi nhánh","api-test":"API test",
};

const API_METADATA = [
  { key: 'nhanvien', label: 'Nhân viên', endpoint: '/api/nhanvien' },
  { key: 'chamcong', label: 'Chấm công', endpoint: '/api/chamcong' },
  { key: 'nhapkho', label: 'Phiếu nhập kho', endpoint: '/api/nhapkho' },
  { key: 'xuatkho', label: 'Phiếu xuất kho', endpoint: '/api/xuatkho' },
  { key: 'tonkho', label: 'Tồn kho', endpoint: '/api/tonkho' },
  { key: 'foodcost', label: 'Food cost', endpoint: '/api/foodcost' },
  { key: 'haohut', label: 'Hao hụt', endpoint: '/api/haohut' },
  { key: 'nvl', label: 'Định mức NVL', endpoint: '/api/nvl' },
  { key: 'doanhthu', label: 'Doanh thu', endpoint: '/api/doanhthu' },
  { key: 'chiphi', label: 'Chi phí', endpoint: '/api/chiphi' },
  { key: 'congno', label: 'Công nợ', endpoint: '/api/congno' },
];

const API_ID_KEY = {
  nhanvien: 'id',
  chamcong: 'nvId',
  nhapkho: 'id',
  xuatkho: 'id',
  tonkho: 'id',
  foodcost: 'id',
  haohut: 'id',
  nvl: 'id',
  doanhthu: 'id',
  chiphi: 'id',
  congno: 'id',
};

/* ══════════════════════════════════════════
   UI PRIMITIVES
══════════════════════════════════════════ */
function KpiCard({ label, value, sub, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function Badge({ text, type = "gray" }) {
  return <span className={`badge badge-${type}`}>{text}</span>;
}

function DataTable({ heads, rows, emptyText = "Không có dữ liệu" }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            {heads.map((h, i) => (
              <th key={i} className={h.r ? "r" : ""}>{typeof h === 'object' && h !== null ? ('label' in h ? h.label : '') : h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={heads.length} className="tbl-empty">{emptyText}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={heads[j] && heads[j].r ? "r" : ""}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhieuBlock({ phieu, colorClass }) {
  const total = phieu.items.reduce((s, i) => s + i.sl * i.dg, 0);
  return (
    <div className="phieu">
      <div className="phieu-head">
        <span className={`strong ${colorClass}`} style={{ fontSize: 13 }}>{phieu.phieu}</span>
        <span className="muted" style={{ fontSize: 12 }}>📅 {phieu.date}</span>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{phieu.ncc || phieu.cn}</span>
        {phieu.hanmuc && <Badge text={phieu.hanmuc} type="blue" />}
        {phieu.lydo   && <Badge text={phieu.lydo} type="yellow" />}
        <span style={{ marginLeft: "auto" }} className={`strong ${colorClass}`}>{vnd(total)}</span>
      </div>
      <DataTable
        heads={[{label:"Tên hàng hóa"},{label:"ĐVT"},{label:"SL",r:true},{label:"Đơn giá",r:true},{label:"Thành tiền",r:true}]}
        rows={phieu.items.map(item => [
          item.ten, item.dvt, item.sl,
          <span className="muted">{vnd(item.dg)}</span>,
          <span className={colorClass}>{vnd(item.sl * item.dg)}</span>,
        ])}
      />
    </div>
  );
}

function FormBox({ children }) {
  return <div className="form-box">{children}</div>;
}

function downloadCsv(filename, headers, rows) {
  const escapeValue = (value) => {
    const text = value == null ? '' : String(value);
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };
  const csv = [headers.map(escapeValue).join(','), ...rows.map(row => row.map(escapeValue).join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ApiTestPage({ dataMap, setDataMap }) {
  const [selected, setSelected] = useState(API_METADATA[0].key);
  const [action, setAction] = useState('get');
  const [payload, setPayload] = useState('');
  const [idValue, setIdValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const metadata = API_METADATA.find(m => m.key === selected) || API_METADATA[0];
  const endpoint = metadata.endpoint;
  const idKey = API_ID_KEY[selected] || 'id';
  const list = dataMap[selected] || [];

  useEffect(() => {
    setResult(null);
    setError('');
  }, [selected, action]);

  const parsePayload = () => {
    if (!payload.trim()) return null;
    try {
      return JSON.parse(payload);
    } catch (err) {
      throw new Error('JSON body không hợp lệ: ' + err.message);
    }
  };

  const handleRun = () => {
    try {
      const id = idValue.trim();
      const body = parsePayload();
      let next = list;
      let response;

      if (action === 'get') {
        response = id ? next.filter(item => String(item[idKey]) === id) : next;
      } else if (action === 'create') {
        if (!body || typeof body !== 'object') throw new Error('Cần body JSON để tạo mới.');
        const created = { ...body };
        if (!created[idKey]) {
          created[idKey] = id || `${selected}_${Date.now()}`;
        }
        next = [...next, created];
        setDataMap(selected, next);
        response = created;
      } else if (action === 'update') {
        const targetId = id || (body && body[idKey]);
        if (!targetId) throw new Error('Cần chỉ định ID để cập nhật.');
        const index = next.findIndex(item => String(item[idKey]) === targetId);
        if (index < 0) throw new Error(`Không tìm thấy ${idKey} = ${targetId}.`);
        if (!body || typeof body !== 'object') throw new Error('Cần body JSON để cập nhật.');
        const updated = { ...next[index], ...body, [idKey]: next[index][idKey] };
        next = [...next.slice(0, index), updated, ...next.slice(index + 1)];
        setDataMap(selected, next);
        response = updated;
      } else if (action === 'delete') {
        if (!id) throw new Error('Cần chỉ định ID để xóa.');
        if (!next.some(item => String(item[idKey]) === id)) throw new Error(`Không tìm thấy ${idKey} = ${id}.`);
        next = next.filter(item => String(item[idKey]) !== id);
        setDataMap(selected, next);
        response = { deleted: id };
      }

      setResult({ endpoint: `${endpoint}${id && action !== 'create' ? `/${id}` : ''}`, action, data: response, count: next.length });
      setError('');
    } catch (err) {
      setResult(null);
      setError(err.message || 'Lỗi khi thực hiện yêu cầu.');
    }
  };

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Trang kiểm thử API</span>
      </div>

      <div className="form-box">
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="form-group">
            <label className="form-label">Chọn dataset</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}>
              {API_METADATA.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hành động</label>
            <select value={action} onChange={e => setAction(e.target.value)}>
              <option value="get">GET</option>
              <option value="create">CREATE</option>
              <option value="update">UPDATE</option>
              <option value="delete">DELETE</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ID / query</label>
            <input value={idValue} onChange={e => setIdValue(e.target.value)} placeholder={`vd: ${idKey} hoặc id mong muốn`} />
          </div>

          <div className="form-group">
            <label className="form-label">Request body</label>
            <textarea
              value={payload}
              onChange={e => setPayload(e.target.value)}
              placeholder='Nhập body JSON cho CREATE/UPDATE, ví dụ: {"name":"Nguyễn A","cn":"CF Marina","luong":12000000}'
              rows={6}
            />
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-start', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleRun}>Chạy</button>
          <span style={{ marginTop: 6, color: 'var(--text-muted)' }}>
            ID field: <strong>{idKey}</strong> • Tổng bản ghi hiện tại: <strong>{list.length}</strong>
          </span>
        </div>

        {error && <div className="info-box" style={{ borderColor: '#ef4444', color: '#b91c1c' }}>{error}</div>}

        {result && (
          <div className="info-box" style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            <div><strong>Endpoint:</strong> {result.endpoint}</div>
            <div><strong>Action:</strong> {result.action.toUpperCase()}</div>
            <div><strong>Kết quả:</strong></div>
            <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(result.data, null, 2)}</pre>
            <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>Số bản ghi: {result.count}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   NHÂN SỰ — Danh sách
══════════════════════════════════════════ */
function DanhSachNV({ data, setData, chamCong }) {
  const safeData = Array.isArray(data) ? data : [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", chucvu:"Phục vụ", cn: VENUES[0], loai:"Toàn thời gian", luong:0, tt:"Còn làm" });
  const CHUCVU = ["Quản lý","Thu ngân","Phục vụ","Pha chế","Bếp trưởng","Đầu bếp","Bảo vệ","Kế toán","Khác"];

  const attendanceMap = useMemo(() => (Array.isArray(chamCong) ? chamCong : []).reduce((acc, item) => {
    acc[item.nvId] = item.ngay.filter(d => d === "P").length;
    return acc;
  }, {}), [chamCong]);

  const save = () => {
    if (!form.name.trim()) return;
    setData(p => [...p, {
      ...form,
      id: uid(),
      code: `NV${String(p.length + 1).padStart(3, '0')}`,
      luong: Number(form.luong),
      tamUng: 0,
    }]);
    setOpen(false);
    setForm({ name:"", chucvu:"Phục vụ", cn: VENUES[0], loai:"Toàn thời gian", luong:0, tt:"Còn làm" });
  };
  const remove = (id) => setData(p => p.filter(x => x.id !== id));
  const requestAdvance = (id) => {
    const value = prompt("Nhập số tiền tạm ứng (đ)", "0");
    if (value === null) return;
    const amount = Number(value.toString().replace(/[^0-9]/g, ""));
    if (Number.isNaN(amount) || amount < 0) return;
    setData(p => p.map(n => n.id !== id ? n : { ...n, tamUng: amount }));
  };
  const toggleWorkStatus = (id) => setData(p => p.map(n => {
    if (n.id !== id) return n;
    const next = n.tt === "Còn làm" ? "Nghỉ làm" : n.tt === "Nghỉ làm" ? "Còn làm" : n.tt;
    return { ...n, tt: next };
  }));

  const byVenue = VENUES.map(v => {
    const list = data.filter(n => n.cn === v);
    return { v, count: list.length, total: list.reduce((s, n) => s + (n.luong || 0), 0) };
  });

  return (
    <>
      <div className="kpi-grid kpi-5">
        {byVenue.map(v => (
          <KpiCard key={v.v} label={v.v} value={v.count + " người"} sub={mtr(v.total) + "/tháng"} color="#3B82F6" />
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Danh sách nhân viên ({safeData.length} người)</span>
          <div className="card-head-right">
            <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>+ Thêm nhân viên</button>
          </div>
        </div>

        {open && (
          <FormBox>
            <div className="form-grid" style={{ gridTemplateColumns:"repeat(6,1fr)" }}>
              {[
                { label:"Họ và tên *", key:"name", type:"text" },
                { label:"Chức vụ", key:"chucvu", type:"select", opts: CHUCVU },
                { label:"Chi nhánh", key:"cn", type:"select", opts: VENUES },
                { label:"Loại hợp đồng", key:"loai", type:"select", opts:["Toàn thời gian","Bán thời gian","Thời vụ"] },
                { label:"Lương cơ bản (đ)", key:"luong", type:"number" },
                { label:"Trạng thái", key:"tt", type:"select", opts:["Đang làm","Nghỉ phép","Đã nghỉ việc"] },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type === "select"
                    ? <select value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} />
                  }
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={save}>Lưu</button>
              <button className="btn" onClick={() => setOpen(false)}>Hủy</button>
            </div>
          </FormBox>
        )}

        <DataTable
          heads={["#",{label:"Mã NV"},{label:"Họ và tên"},{label:"Chức vụ"},{label:"Chi nhánh"},{label:"Loại HĐ"},{label:"Lương CB",r:true},{label:"Ngày công",r:true},{label:"Tạm ứng",r:true},{label:"Trạng thái"},{label:""}]}
          rows={safeData.map((n, i) => [
            i+1,
            n.code || "—",
            <span className="strong">{n.name}</span>,
            n.chucvu,
            <Badge text={n.cn} type="blue" />,
            <Badge text={n.loai} type={n.loai === "Toàn thời gian" ? "green" : "yellow"} />,
            <span className="warn">{vnd(n.luong)}</span>,
            <span className={attendanceMap[n.id] >= 22 ? "pos" : "warn"}>{attendanceMap[n.id] || 0} ngày</span>,
            <span className="warn">{vnd(n.tamUng || 0)}</span>,
            <Badge text={n.tt} type={n.tt === "Còn làm" ? "green" : "red"} />,
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <button className="btn btn-sm" style={{ minWidth: 80 }} onClick={() => requestAdvance(n.id)}>Tạm ứng</button>
              <button className="btn btn-sm" style={{ minWidth: 80, background: "#FBBF2415", borderColor: "#F59E0B33", color: "#92400E" }} onClick={() => toggleWorkStatus(n.id)}>
                {n.tt === "Còn làm" ? "Nghỉ làm" : "Còn làm"}
              </button>
              <button className="btn btn-sm" style={{ color:"var(--red)", background:"#EF444415" }} onClick={() => remove(n.id)}>Xóa</button>
            </div>,
          ])}
        />
        <div className="info-box">
          Tổng quỹ lương CB: <strong className="warn">{vnd(data.reduce((s,n)=>s+n.luong,0))}</strong> /tháng
          &nbsp;|&nbsp; Toàn thời gian: <strong>{data.filter(n=>n.loai==="Toàn thời gian").length}</strong>
          &nbsp;|&nbsp; Bán thời gian: <strong>{data.filter(n=>n.loai==="Bán thời gian").length}</strong>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   NHÂN SỰ — Chấm công
══════════════════════════════════════════ */
const DAYS30  = Array.from({length:30}, (_, i) => i+1);
const WEEKDAYS = [6,7,13,14,20,21,27,28];

function ChamCong({ data, setData }) {
  const [records, setRecords] = useState(data || []);

  const months = [
    { value: 0, label: 'Tháng mới', days: 30 },
  ];

  useEffect(() => {
    setRecords(data || []);
  }, [data]);

  // Đồng bộ chấm công với danh sách nhân viên:
  // - Giữ lại record có nvId thuộc danh sách nhân viên hiện tại (xóa bản ghi mồ côi)
  // - Tạo bản ghi mới cho nhân viên mới (để hiển thị nhân viên mới)
  useEffect(() => {
    if (!Array.isArray(data)) return;

    setData(prev => {
      const prevArr = Array.isArray(prev) ? prev : [];
      const byId = new Map(prevArr.map(r => [r.nvId, r]));

      // Luôn rebuild theo danh sách nhân viên hiện tại để:
      // - Không còn record mồ côi (nvId không còn tồn tại)
      // - Update lại name/chucvu/cn nếu nhân viên đổi
      return data.map(nv => {
        const existing = byId.get(nv.id);
        const ngay = existing && Array.isArray(existing.ngay)
          ? existing.ngay
          : Array.from({ length: 30 }, () => 'N');
        return {
          nvId: nv.id,
          name: nv.name,
          chucvu: nv.chucvu,
          cn: nv.cn,
          ngay,
        };
      });
    });
  }, [data, setData]);





  const persistChange = (nvId, dayIndex, forced) => {
    const nextRecords = (data || []).map(row => {
      if (row.nvId !== nvId) return row;
      const next = [...row.ngay];
      const current = next[dayIndex] || 'N';
      next[dayIndex] = forced ? forced : (current === 'P' ? 'V' : 'P');
      return { ...row, ngay: next };
    });
    setData(nextRecords);
    setRecords(nextRecords);
  };

  const toggleDay = (id, dayIndex, forced) => {
    persistChange(id, dayIndex, forced);
  };

  const renderTable = (month) => {
    const days = month.days;
    return (
      <div className="card">

        <div className="card-head">
          <span className="card-title">Bảng chấm công</span>
          <div className="card-head-right">

            <span style={{fontSize:11,color:"var(--text-muted)"}}>
              <span className="cc-cell cc-P">P</span> Có mặt &nbsp;
              <span className="cc-cell cc-V">V</span> Vắng
            </span>
            <button
              className="btn"
              style={{marginLeft:12, fontSize:11, padding:'6px 10px'}}
              onClick={() => {
                const resetRecords = (data || []).map(row => ({
                  ...row,
                  ngay: Array.from({ length: 30 }, () => 'N'),
                }));
                setData(resetRecords);
                setRecords(resetRecords);
              }}
            >
              Kết thúc tháng
            </button>
          </div>
        </div>
        <div className="cc-wrap" style={{overflowX:"auto"}}>
          <table style={{minWidth:990}}>
            <thead>
              <tr>
                <th style={{minWidth:140}}>Họ tên</th>
                <th style={{minWidth:60}}>Chi nhánh</th>
                {Array.from({ length: days }, (_, index) => index + 1).map(d => (
                  <th key={d} style={{padding:"5px 2px",width:22,textAlign:"center",color:WEEKDAYS.includes(d)?"#F59E0B":undefined}}>{d}</th>
                ))}
                <th className="r">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {records.map((cc, i) => {
                const row = Array.from({ length: days }, (_, index) => cc.ngay[index] || 'V');
                const total = row.filter(d => d === "P").length;
                return (
                  <tr key={i}>
                    <td className="strong">{cc.name}</td>
                    <td className="muted" style={{fontSize:11}}>{cc.cn.replace("Marina ","").replace("CF ","CF ")}</td>
                    {row.map((d, j) => (
                      <td key={j} style={{padding:"3px 2px",textAlign:"center"}}>
                        <button
                          className={`cc-button cc-${d}`}
                          onClick={() => toggleDay(cc.nvId, j)}
                          onKeyDown={e => {
                            const key = e.key.toUpperCase();
                            if (key === 'P' || key === 'V') {
                              e.preventDefault();
                              toggleDay(cc.nvId, j, key);
                            }
                          }}
                          tabIndex={0}
                          title="Nhấn hoặc gõ P/V để thay đổi trạng thái"
                        >
                          {d}
                        </button>
                      </td>
                    ))}
                    <td className="r">
                      <span className={total >= 22 ? "pos" : "warn"}>{total}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTable(months[0])}
    </>
  );
}

/* ══════════════════════════════════════════
   NHÂN SỰ — Bảng lương
══════════════════════════════════════════ */
function BangLuong({ nhanVien, chamCong }) {
  const rows = nhanVien.map(nv => {
    const cc  = chamCong.find(c => c.nvId === nv.id);
    const ngay = cc ? cc.ngay.filter(d => d === "P").length : 0;
    const dailySalary = nv.luong / 30;
    const basePay = Math.round(dailySalary * ngay);
    const bonus = ngay >= 28 ? Math.round(basePay * 0.05) : 0;
    const penalty = ngay < 22 ? Math.round(basePay * 0.1) : 0;
    const luongTinh = basePay + bonus - penalty;
    const thuong  = bonus;
    const bhxh   = Math.round(luongTinh * 0.105);
    const thucLinh = luongTinh - bhxh;
    const tamUng  = nv.tamUng != null ? Number(nv.tamUng) : Math.round(thucLinh * 0.4);
    return { ...nv, ngay, luongTinh, thuong, penalty, bhxh, thucLinh, tamUng, conLai: Math.max(0, thucLinh - tamUng) };
  });

  const totLinh  = rows.reduce((s, r) => s + r.thucLinh, 0);
  const totUng   = rows.reduce((s, r) => s + r.tamUng, 0);
  const totConLai= totLinh - totUng;

  return (
    <>
      <div className="kpi-grid kpi-4">
        <KpiCard label="Tổng quỹ lương thực lĩnh" value={mtr(totLinh)} sub="Sau BHXH & thưởng" color="#F59E0B" />
        <KpiCard label="Đã tạm ứng"    value={mtr(totUng)}    sub="40% thực lĩnh"      color="#3B82F6" />
        <KpiCard label="Còn phải trả"  value={mtr(totConLai)} sub="Thanh toán cuối tháng" color="#10B981" />
        <KpiCard label="BHXH công ty"  value={mtr(totLinh * 0.215)} sub="21.5% lương"   color="#8B5CF6" />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Bảng tính lương Tháng mới</span>

          <button className="btn" onClick={() => downloadCsv('bang-luong.csv', [
            'Họ tên','Chức vụ','Chi nhánh','Lương CB','Ngày công','Lương tính','Thưởng','BHXH 10.5%','Thực lĩnh','Tạm ứng','Còn lại'
          ], rows.map(r => [r.name, r.chucvu, r.cn, r.luong, r.ngay, r.luongTinh, r.thuong, r.bhxh, r.thucLinh, r.tamUng, r.conLai]))}>
            Xuất Excel
          </button>
        </div>
        <DataTable
          heads={["#",{label:"Họ tên"},{label:"Chức vụ"},{label:"Chi nhánh"},{label:"Lương CB",r:true},{label:"Ngày công",r:true},{label:"Lương tính",r:true},{label:"Thưởng",r:true},{label:"BHXH 10.5%",r:true},{label:"Thực lĩnh",r:true},{label:"Tạm ứng",r:true},{label:"Còn lại",r:true}]}
          rows={rows.map((r, i) => [
            i+1,
            <span className="strong">{r.name}</span>,
            r.chucvu, r.cn,
            <span className="muted">{vnd(r.luong)}</span>,
            <span className={r.ngay >= 22 ? "pos" : "warn"}>{r.ngay} ngày</span>,
            vnd(r.luongTinh),
            r.thuong ? <span className="pos">+{vnd(r.thuong)}</span> : "—",
            <span className="neg">-{vnd(r.bhxh)}</span>,
            <span className="warn">{vnd(r.thucLinh)}</span>,
            <span className="blue">{vnd(r.tamUng)}</span>,
            <span className="pos">{vnd(r.conLai)}</span>,
          ])}
        />
        <div className="info-box" style={{textAlign:"right"}}>
          Tổng thực lĩnh: <strong className="warn">{vnd(totLinh)}</strong>
          &nbsp;|&nbsp; Đã tạm ứng: <strong className="blue">{vnd(totUng)}</strong>
          &nbsp;|&nbsp; Còn phải thanh toán: <strong className="pos">{vnd(totConLai)}</strong>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   VẬN HÀNH — Nhập kho
══════════════════════════════════════════ */
function NhapKho({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date:'', ncc:'', hanmuc:'', ten:'', dvt:'', sl:0, dg:0 });
  const totalGT = data.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.sl * i.dg, 0), 0);

  const save = () => {
    if (!form.date || !form.ncc || !form.hanmuc || !form.ten || !form.dvt) return;
    setData(p => [...p, {
      id: uid(),
      phieu: `NK-${String(p.length + 1).padStart(3, '0')}`,
      date: form.date,
      ncc: form.ncc,
      hanmuc: form.hanmuc,
      items: [{ ten: form.ten, dvt: form.dvt, sl: Number(form.sl), dg: Number(form.dg) }],
    }] );
    setOpen(false);
    setForm({ date:'', ncc:'', hanmuc:'', ten:'', dvt:'', sl:0, dg:0 });
  };

  return (
    <>
      <div className="kpi-grid kpi-3">
          <KpiCard label="Tổng phiếu nhập"   value={data.length + " phiếu"} sub="Tháng mới" color="#3B82F6" />

        <KpiCard label="Tổng giá trị nhập" value={mtr(totalGT)}           sub="Theo giá mua" color="#F59E0B" />
        <KpiCard label="Nhà cung cấp"      value={new Set(data.map(p=>p.ncc)).size + " NCC"} sub="Hoạt động T6" color="#10B981" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Danh sách phiếu nhập kho</span>
          <div className="card-head-right">
            <button className="btn" onClick={() => downloadCsv('nhap-kho.csv', [
              'Phiếu','Ngày','Nhà cung cấp','Hạng mục','Tên hàng','ĐVT','SL','Đơn giá','Thành tiền'
            ], data.flatMap(p => p.items.map(item => [p.phieu, p.date, p.ncc, p.hanmuc, item.ten, item.dvt, item.sl, item.dg, item.sl * item.dg])))}>
              Xuất CSV
            </button>
            <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>+ Tạo phiếu mới</button>
          </div>
        </div>

        {open && (
          <FormBox>
            <div className="form-grid" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
              {[
                { label:"Ngày", key:"date", type:"text", ph:"VD: 06/06/2025" },
                { label:"Nhà cung cấp", key:"ncc", type:"text" },
                { label:"Hạng mục", key:"hanmuc", type:"text" },
                { label:"Tên hàng", key:"ten", type:"text" },
                { label:"ĐVT", key:"dvt", type:"text" },
                { label:"Số lượng", key:"sl", type:"number" },
                { label:"Đơn giá", key:"dg", type:"number" },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.ph || ''}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={save}>Lưu</button>
              <button className="btn" onClick={() => setOpen(false)}>Hủy</button>
            </div>
          </FormBox>
        )}

        {data.map(p => <PhieuBlock key={p.id} phieu={p} colorClass="pos" />)}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   VẬN HÀNH — Xuất kho
══════════════════════════════════════════ */
function XuatKho({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date:'', cn: VENUES[0], lydo:'', ten:'', dvt:'', sl:0, dg:0 });
  const totalGT = data.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.sl * i.dg, 0), 0);

  const save = () => {
    if (!form.date || !form.cn || !form.ten || !form.dvt) {
      alert("Vui lòng điền đầy đủ: Ngày, Chi nhánh, Tên hàng, ĐVT.");
      return;
    }
    setData(p => [...p, {
      id: uid(),
      phieu: `XK-${String(p.length + 1).padStart(3, '0')}`,
      date: form.date,
      cn: form.cn,
      lydo: form.lydo || "",
      items: [{ ten: form.ten, dvt: form.dvt, sl: Number(form.sl), dg: Number(form.dg) }],
    }] );
    setOpen(false);
    setForm({ date:'', cn: VENUES[0], lydo:'', ten:'', dvt:'', sl:0, dg:0 });
  };

  return (
    <>
      <div className="kpi-grid kpi-3">
        <KpiCard label="Tổng phiếu xuất"   value={data.length + " phiếu"} sub="Tháng mới" color="#3B82F6" />

        <KpiCard label="Tổng giá trị xuất" value={mtr(totalGT)}           sub="Giá nhập kho"  color="#EF4444" />
        <KpiCard label="Chi nhánh nhận"    value={new Set(data.map(p=>p.cn)).size + " CN"}  sub="Đã xuất kho" color="#10B981" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Danh sách phiếu xuất kho</span>
          <div className="card-head-right">
            <button className="btn" onClick={() => downloadCsv('xuat-kho.csv', [
              'Phiếu','Ngày','Chi nhánh','Lý do','Tên hàng','ĐVT','SL','Đơn giá','Thành tiền'
            ], data.flatMap(p => p.items.map(item => [p.phieu, p.date, p.cn, p.lydo, item.ten, item.dvt, item.sl, item.dg, item.sl * item.dg])))}>
              Xuất CSV
            </button>
            <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>+ Tạo phiếu mới</button>
          </div>
        </div>

        {open && (
          <FormBox>
            <div className="form-grid" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
              {[
                { label:"Ngày", key:"date", type:"text", ph:"VD: 06/06/2025" },
                { label:"Chi nhánh", key:"cn", type:"select", opts: VENUES },
                { label:"Lý do", key:"lydo", type:"text" },
                { label:"Tên hàng", key:"ten", type:"text" },
                { label:"ĐVT", key:"dvt", type:"text" },
                { label:"Số lượng", key:"sl", type:"number" },
                { label:"Đơn giá", key:"dg", type:"number" },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select'
                    ? <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input
                        type={f.type}
                        placeholder={f.ph || ''}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      />
                  }
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={save}>Lưu</button>
              <button className="btn" onClick={() => setOpen(false)}>Hủy</button>
            </div>
          </FormBox>
        )}

        {data.map(p => <PhieuBlock key={p.id} phieu={p} colorClass="neg" />)}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   VẬN HÀNH — Tồn kho
══════════════════════════════════════════ */
function TonKho({ data }) {
  const withTC = data.map(r => ({ ...r, tc: r.td + r.nhap - r.xuat }));
  const totalGT = withTC.reduce((s, r) => s + r.tc * r.dg, 0);
  const sapHet  = withTC.filter(r => r.tc < 10).length;

  return (
    <>
      <div className="kpi-grid kpi-4">
        <KpiCard label="Tổng mặt hàng"   value={data.length + " SKU"} sub="Đang theo dõi" color="#3B82F6" />
        <KpiCard label="Giá trị tồn kho" value={mtr(totalGT)}         sub="Theo giá nhập" color="#F59E0B" />
        <KpiCard label="Sắp hết hàng"    value={sapHet + " mặt hàng"} sub="< 10 đơn vị"  color="#EF4444" />
        <KpiCard label="Vòng quay TB"    value="4.2 lần"               sub="Trong tháng"  color="#10B981" />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Bảng tổng hợp tồn kho — Tháng mới</span>

          <button className="btn" onClick={() => downloadCsv('ton-kho.csv', [
            'Tên hàng hóa','ĐVT','Tồn đầu','Nhập','Xuất','Tồn cuối','Đơn giá','Giá trị tồn','Trạng thái'
          ], withTC.map(r => [r.ten, r.dvt, r.td, r.nhap, r.xuat, r.tc, r.dg, r.tc * r.dg, r.tc === 0 ? 'Hết hàng' : r.tc < 10 ? 'Sắp hết' : 'Đủ hàng']))}>
            Xuất Excel
          </button>
        </div>
        <DataTable
          heads={["#",{label:"Tên hàng hóa"},{label:"ĐVT"},{label:"Tồn đầu",r:true},{label:"Nhập",r:true},{label:"Xuất",r:true},{label:"Tồn cuối",r:true},{label:"Đơn giá",r:true},{label:"Giá trị tồn",r:true},{label:"Trạng thái"}]}
          rows={withTC.map((r, i) => {
            const gt  = r.tc * r.dg;
            const st  = r.tc === 0 ? ["Hết hàng","red"] : r.tc < 10 ? ["Sắp hết","yellow"] : ["Đủ hàng","green"];
            return [
              i+1,
              <span className="strong">{r.ten}</span>,
              r.dvt, r.td,
              <span className="pos">+{r.nhap}</span>,
              <span className="neg">-{r.xuat}</span>,
              <span className={r.tc < 10 ? "warn" : ""}>{r.tc}</span>,
              <span className="muted">{vnd(r.dg)}</span>,
              <span className="warn">{vnd(gt)}</span>,
              <Badge text={st[0]} type={st[1]} />,
            ];
          })}
        />
        <div className="info-box" style={{textAlign:"right"}}>
          Tổng giá trị tồn kho cuối kỳ: <strong className="warn">{vnd(totalGT)}</strong>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   COST — Food cost
══════════════════════════════════════════ */
function FoodCost({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date:"", cn: VENUES[0], dt:0, cp:0 });

  const save = () => {
    const dt = Number(form.dt), cp = Number(form.cp);
    setData(p => [...p, { ...form, id: uid(), dt, cp }]);
    setOpen(false);
  };

  const avgFC = data.length ? data.reduce((s, r) => s + r.cp / r.dt * 100, 0) / data.length : 0;

  return (
    <>
      <div className="kpi-grid kpi-4">
        <KpiCard label="Food cost trung bình" value={pct(avgFC)} sub="Mục tiêu ≤ 30%" color={avgFC > 30 ? "#EF4444" : "#10B981"} />
        <KpiCard label="Số lần vượt mục tiêu" value={data.filter(r=>r.cp/r.dt*100>30).length+" lần"} sub="Trong kỳ báo cáo" color="#EF4444" />
        <KpiCard label="Tổng doanh thu" value={mtr(data.reduce((s,r)=>s+r.dt,0))} color="#10B981" />
        <KpiCard label="Tổng chi phí NVL" value={mtr(data.reduce((s,r)=>s+r.cp,0))} color="#F59E0B" />
      </div>


      <div className="card">
        <div className="card-head">
          <span className="card-title">Theo dõi food cost hàng ngày</span>
          <button className="btn btn-primary" onClick={() => setOpen(o=>!o)}>+ Nhập food cost</button>
        </div>

        {open && (
          <FormBox>
            <div className="form-grid" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
              {[
                {label:"Ngày",key:"date",type:"text",ph:"VD: 06/06/2025"},
                {label:"Chi nhánh",key:"cn",type:"select",opts:VENUES},
                {label:"Doanh thu (đ)",key:"dt",type:"number"},
                {label:"Chi phí NVL (đ)",key:"cp",type:"number"},
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type==="select"
                    ? <select value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}>
                        {f.opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    : <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                  }
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Food cost %</label>
                <div style={{padding:"6px 9px",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:6,fontSize:12,color:"#F59E0B"}}>
                  {form.dt > 0 ? pct(form.cp / form.dt * 100) : "—"}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={save}>Lưu</button>
              <button className="btn" onClick={()=>setOpen(false)}>Hủy</button>
            </div>
          </FormBox>
        )}

        <DataTable
          heads={["#",{label:"Ngày"},{label:"Chi nhánh"},{label:"Doanh thu",r:true},{label:"Chi phí NVL",r:true},{label:"Food cost %",r:true},{label:"Đánh giá"}]}
          rows={data.map((r, i) => {
            const fc = r.cp / r.dt * 100;
            const ok = fc <= 30;
            return [
              i+1, r.date,
              <Badge text={r.cn} type="blue" />,
              <span className="pos">{vnd(r.dt)}</span>,
              vnd(r.cp),
              <span className={ok?"pos":"neg"}>{pct(fc)}</span>,
              <Badge text={ok?"✓ Đạt":"✗ Vượt"} type={ok?"green":"red"} />,
            ];
          })}
        />
        <div className="info-box">
          Tiêu chuẩn food cost F&B: <strong>Quán bia/nhậu ≤ 32%</strong> | <strong>Café/đồ uống ≤ 28%</strong> | <strong>Nhà hàng fine dining ≤ 35%</strong>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   COST — Hao hụt
══════════════════════════════════════════ */
function HaoHut({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date:'', cn: VENUES[0], nvl:'', dvt:'Kg', lt:0, tt:0, lydo:'' });

  const save = () => {
    if (!form.date || !form.cn || !form.nvl || !form.dvt || form.lt <= 0) return;
    setData(p => [...p, { id: uid(), date: form.date, cn: form.cn, nvl: form.nvl, dvt: form.dvt, lt: Number(form.lt), tt: Number(form.tt), lydo: form.lydo }]);
    setOpen(false);
    setForm({ date:'', cn: VENUES[0], nvl:'', dvt:'Kg', lt:0, tt:0, lydo:'' });
  };

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Bảng theo dõi hao hụt nguyên vật liệu</span>
        <div className="card-head-right">
          <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>+ Nhập hao hụt</button>
        </div>
      </div>

      {open && (
        <FormBox>
          <div className="form-grid" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
            {[
              { label:"Ngày", key:"date", type:"text", ph:"VD: 06/06/2025" },
              { label:"Chi nhánh", key:"cn", type:"select", opts: VENUES },
              { label:"Nguyên liệu", key:"nvl", type:"text" },
              { label:"ĐVT", key:"dvt", type:"text" },
              { label:"Lý thuyết", key:"lt", type:"number" },
              { label:"Thực tế", key:"tt", type:"number" },
              { label:"Lý do", key:"lydo", type:"text" },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                {f.type === 'select'
                  ? <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  : <input
                      type={f.type}
                      placeholder={f.ph || ''}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    />
                }
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={save}>Lưu</button>
            <button className="btn" onClick={() => setOpen(false)}>Hủy</button>
          </div>
        </FormBox>
      )}

      <DataTable
        heads={["#",{label:"Ngày"},{label:"Chi nhánh"},{label:"Nguyên liệu"},{label:"ĐVT"},{label:"Lý thuyết",r:true},{label:"Thực tế",r:true},{label:"Hao hụt",r:true},{label:"% Hao hụt",r:true},{label:"Lý do"},{label:"Đánh giá"}]}
        rows={data.map((r, i) => {
          const hh = r.lt - r.tt;
          const p  = hh / r.lt * 100;
          const ok = p <= 8;
          return [
            i+1, r.date, r.cn,
            <span className="strong">{r.nvl}</span>,
            r.dvt, r.lt, r.tt,
            <span className="neg">{hh.toFixed(2)}</span>,
            <span className={ok?"warn":"neg"}>{pct(p)}</span>,
            r.lydo,
            <Badge text={ok?"Chấp nhận":"Cần xem xét"} type={ok?"yellow":"red"} />,
          ];
        })}
      />
      <div className="info-box">
        Tiêu chuẩn hao hụt cho phép: <strong>Sơ chế / chế biến ≤ 8%</strong> | <strong>Bảo quản ≤ 3%</strong> | <strong>Phục vụ / rót ≤ 2%</strong>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COST — Định mức NVL
══════════════════════════════════════════ */
function DinhMucNVL({ data }) {
  const groups = [...new Set(data.map(r => r.mon))];
  return (
    <>
      {groups.map(mon => {
        const items = data.filter(r => r.mon === mon);
        const tc    = items.reduce((s, i) => s + i.dm * i.dg / 1000, 0);
        const giaBan = Math.round(tc * 3.5 / 1000) * 1000;
        return (
          <div key={mon} className="card">
            <div className="card-head">
              <div>
                <span className="card-title">{mon}</span>
                <span style={{marginLeft:12,fontSize:11,color:"var(--text-muted)"}}>
                  Cost NVL: <strong className="warn">{vnd(Math.round(tc))}</strong>
                  &nbsp;|&nbsp; Giá bán đề xuất: <strong className="pos">{vnd(giaBan)}</strong>
                  &nbsp;|&nbsp; Food cost: <strong className={tc/giaBan*100 <= 30 ? "pos" : "warn"}>{pct(tc/giaBan*100)}</strong>
                </span>
              </div>
            </div>
            <DataTable
              heads={[{label:"Nguyên liệu"},{label:"ĐVT"},{label:"Định mức / phần",r:true},{label:"Đơn giá / ĐVT",r:true},{label:"Chi phí NVL",r:true}]}
              rows={[
                ...items.map(item => [
                  item.nvl, item.dvt,
                  `${item.dm} ${item.dvt}`,
                  <span className="muted">{vnd(item.dg)}/{item.dvt}</span>,
                  <span className="warn">{vnd(Math.round(item.dm * item.dg / 1000))}</span>,
                ]),
                [
                  <strong>TỔNG CHI PHÍ NVL / PHẦN</strong>, "", "", "",
                  <strong className="warn" style={{fontSize:13}}>{vnd(Math.round(tc))}</strong>,
                ],
              ]}
            />
          </div>
        );
      })}
    </>
  );
}

function Dashboard({ nhanVien, doanhThu, chiPhi, foodCost, congNo }) {
  const totalDT = doanhThu.reduce((s, r) => s + r.dt, 0);
  const totalCP = chiPhi.reduce((s, r) => s + r.so, 0);
  const totalNo = congNo.reduce((sum, r) => {
    const dk = Number(r.dk || 0);
    const ps = Number(r.ps || 0);
    const dtt = Number(r.dtt || 0);
    return sum + Math.max(0, dk + ps - dtt);
  }, 0);
  const avgFC = foodCost.length ? foodCost.reduce((s, r) => s + (r.cp / Math.max(1, r.dt)) * 100, 0) / foodCost.length : 0;
  const byVenue = VENUES.map(v => ({
    v,
    dt: doanhThu.filter(r => r.cn === v).reduce((s, r) => s + r.dt, 0),
    hd: doanhThu.filter(r => r.cn === v).reduce((s, r) => s + r.hd, 0),
  }));

  return (
    <>
      <div className="kpi-grid kpi-5">
        <KpiCard label="Tổng doanh thu" value={mtr(totalDT)} sub="Tháng mới" color="#10B981" />
        <KpiCard label="Tổng chi phí" value={mtr(totalCP)} sub="Tháng mới" color="#EF4444" />




              <KpiCard label="Công nợ hiện tại" value={vnd(totalNo)} sub="Tổng công nợ" color="#8B5CF6" />

        <KpiCard label="Food cost TB" value={pct(avgFC)} sub="Trung bình" color={avgFC <= 30 ? "#10B981" : "#EF4444"} />
        <KpiCard label="Nhân viên" value={nhanVien.length + " người"} sub="Đang lưu" color="#3B82F6" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Doanh thu theo chi nhánh</span></div>
          <DataTable
            heads={[{label:"Chi nhánh"},{label:"Doanh thu",r:true},{label:"Số HD",r:true}]}
            rows={byVenue.map((v, i) => [
              <span className="strong" key={i}>{v.v}</span>,
              <span className="pos">{mtr(v.dt)}</span>,
              v.hd || '—',
            ])}
          />
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Tổng quan chi phí</span></div>
          <div className="info-box">
            <p>Hiện tại có <strong>{nhanVien.length}</strong> nhân sự và <strong>{doanhThu.length}</strong> bản ghi doanh thu.</p>
            <p>Tổng chi phí hàng tháng: <strong>{mtr(totalCP)}</strong>.</p>
            <p>Công nợ nhà cung cấp: <strong>{vnd(totalNo)}</strong>.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   THU CHI — Doanh thu
══════════════════════════════════════════ */
function DoanhThu({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date:"", cn: VENUES[0], loai:"Ăn uống", hd:0, dt:0, tt:"Tiền mặt", ghi:"" });

  const save = () => {
    setData(p => [...p, { ...form, id: uid(), hd: Number(form.hd), dt: Number(form.dt) }]);
    setOpen(false);
  };

  const total = data.reduce((s, r) => s + r.dt, 0);
  const byVenue = VENUES.map(v => ({ v, dt: data.filter(r=>r.cn===v).reduce((s,r)=>s+r.dt,0) }));

  return (
    <>
      <div className="kpi-grid kpi-5">
        {byVenue.map(v => (
          <KpiCard key={v.v} label={v.v} value={mtr(v.dt)} sub={pct(v.dt/total*100) + "% tổng DT"} color="#10B981" />
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Bảng doanh thu theo ngày</span>
          <div className="card-head-right">
            <strong className="pos" style={{fontSize:14}}>{vnd(total)}</strong>
            <button className="btn btn-success" onClick={()=>setOpen(o=>!o)}>+ Nhập doanh thu</button>
          </div>
        </div>

        {open && (
          <FormBox>
            <div className="form-grid" style={{gridTemplateColumns:"repeat(7,1fr)"}}>
              {[
                {label:"Ngày",key:"date",type:"text",ph:"VD: 06/06/2025"},
                {label:"Chi nhánh",key:"cn",type:"select",opts:VENUES},
                {label:"Loại",key:"loai",type:"select",opts:["Ăn uống","Đồ uống","Sự kiện","Dịch vụ"]},
                {label:"Số hóa đơn",key:"hd",type:"number"},
                {label:"Doanh thu (đ)",key:"dt",type:"number"},
                {label:"Thanh toán",key:"tt",type:"select",opts:["Tiền mặt","Chuyển khoản","Hỗn hợp"]},
                {label:"Ghi chú",key:"ghi",type:"text"},
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type==="select"
                    ? <select value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}>
                        {f.opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    : <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                  }
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={save}>Lưu</button>
              <button className="btn" onClick={()=>setOpen(false)}>Hủy</button>
            </div>
          </FormBox>
        )}

        <DataTable
          heads={["#",{label:"Ngày"},{label:"Chi nhánh"},{label:"Loại"},{label:"Số HD",r:true},{label:"Doanh thu",r:true},{label:"Thanh toán"},{label:"Ghi chú"}]}
          rows={data.map((r, i) => [
            i+1, r.date,
            <Badge text={r.cn} type="blue" />,
            r.loai, r.hd,
            <span className="pos">{vnd(r.dt)}</span>,
            <Badge text={r.tt} type={r.tt==="Tiền mặt"?"green":r.tt==="Chuyển khoản"?"blue":"yellow"} />,
            <span className="muted">{r.ghi || "—"}</span>,
          ])}
        />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   THU CHI — Chi phí
══════════════════════════════════════════ */
function ChiPhi({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date:"", dm:"Nguyên vật liệu", mo:"", so:0, ncc:"", tt:"Đã thanh toán" });
  const CATS = ["Nguyên vật liệu","Nhân sự","Điện nước","Thuê mặt bằng","Marketing","CCDC","Sửa chữa","Khác"];

  const save = () => {
    setData(p => [...p, { ...form, id: uid(), so: Number(form.so) }]);
    setOpen(false);
  };

  const total   = data.reduce((s, r) => s + r.so, 0);
  const chuaTT  = data.filter(r => r.tt === "Chưa thanh toán").reduce((s, r) => s + r.so, 0);

  return (
    <>
      <div className="kpi-grid kpi-4">
        <KpiCard label="Tổng chi phí"    value={mtr(total)}  sub="Tháng mới"         color="#EF4444" />

        <KpiCard label="Nguyên vật liệu" value={mtr(data.filter(r=>r.dm==="Nguyên vật liệu").reduce((s,r)=>s+r.so,0))} sub={pct(data.filter(r=>r.dm==="Nguyên vật liệu").reduce((s,r)=>s+r.so,0)/total*100)+" tổng CP"} color="#F59E0B" />
        <KpiCard label="Nhân sự"         value={mtr(data.filter(r=>r.dm==="Nhân sự").reduce((s,r)=>s+r.so,0))} color="#3B82F6" />
        <KpiCard label="Chưa thanh toán" value={mtr(chuaTT)} sub="Cần xử lý"            color="#8B5CF6" />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Bảng chi phí Tháng mới</span>

          <button className="btn btn-danger" onClick={()=>setOpen(o=>!o)}>+ Nhập chi phí</button>
        </div>

        {open && (
          <FormBox>
            <div className="form-grid" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
              {[
                {label:"Ngày",key:"date",type:"text",ph:"VD: 06/06/2025"},
                {label:"Danh mục",key:"dm",type:"select",opts:CATS},
                {label:"Mô tả",key:"mo",type:"text"},
                {label:"Số tiền (đ)",key:"so",type:"number"},
                {label:"Nhà cung cấp",key:"ncc",type:"text"},
                {label:"Trạng thái",key:"tt",type:"select",opts:["Đã thanh toán","Chưa thanh toán"]},
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type==="select"
                    ? <select value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}>
                        {f.opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    : <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                  }
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={save}>Lưu</button>
              <button className="btn" onClick={()=>setOpen(false)}>Hủy</button>
            </div>
          </FormBox>
        )}

        <DataTable
          heads={["#",{label:"Ngày"},{label:"Danh mục"},{label:"Mô tả"},{label:"Số tiền",r:true},{label:"Nhà cung cấp"},{label:"Trạng thái"}]}
          rows={data.map((r, i) => [
            i+1, r.date,
            <Badge text={r.dm} type="purple" />,
            r.mo,
            <span className="neg">{vnd(r.so)}</span>,
            r.ncc,
            <Badge text={r.tt} type={r.tt==="Đã thanh toán"?"green":"red"} />,
          ])}
        />
        <div className="info-box" style={{textAlign:"right"}}>
          Tổng chi phí tháng 6: <strong className="neg">{vnd(total)}</strong>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   THU CHI — Công nợ NCC
══════════════════════════════════════════ */
function CongNo({ data }) {
  const withCL = data.map(r => {
    const dk = Number(r.dk || 0);
    const ps = Number(r.ps || 0);
    const dtt = Number(r.dtt || 0);
    const cl = Math.max(0, dk + ps - dtt);
    return { ...r, dk, ps, dtt, cl };
  });
  const totalNo = withCL.reduce((s, r) => s + r.cl, 0);

  return (
    <>
      <div className="kpi-grid kpi-4">
        <KpiCard label="Tổng công nợ"   value={vnd(totalNo)}    sub="Cần thanh toán"                  color="#8B5CF6" />
        <KpiCard label="Đã quá hạn"     value={data.filter(r=>r.tt==="Đã quá hạn").length+" NCC"} sub={mtr(data.filter(r=>r.tt==="Đã quá hạn").reduce((s,r)=>{
          const dk = Number(r.dk || 0);
          const ps = Number(r.ps || 0);
          const dtt = Number(r.dtt || 0);
          return s + Math.max(0, dk + ps - dtt);
        },0))} color="#EF4444" />
        <KpiCard label="NCC đang nợ"    value={withCL.filter(r=>r.cl>0).length+" NCC"}          color="#F59E0B" />
        <KpiCard label="Đã thanh toán"  value={mtr(data.reduce((s,r)=>s+Number(r.dtt||0),0))}   sub="Tháng 6/2025" color="#10B981" />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Bảng theo dõi công nợ nhà cung cấp</span>
          <button className="btn" onClick={() => downloadCsv('cong-no.csv', [
            'Nhà cung cấp','Loại','Nợ đầu kỳ','Phát sinh','Đã TT','Còn lại','Hạn TT','Trạng thái'
          ], withCL.map(r => [r.ncc, r.loai, r.dk, r.ps, r.dtt, r.cl, r.han, r.tt]))}>
            Xuất Excel
          </button>
        </div>
        <DataTable
          heads={["#",{label:"Nhà cung cấp"},{label:"Loại"},{label:"Nợ đầu kỳ",r:true},{label:"Phát sinh",r:true},{label:"Đã TT",r:true},{label:"Còn lại",r:true},{label:"Hạn TT"},{label:"Trạng thái"}]}
          rows={withCL.map((r, i) => [
            i+1,
            <span className="strong">{r.ncc}</span>,
            r.loai,
            r.dk ? <span className="muted">{vnd(r.dk)}</span> : "—",
            <span className="neg">{vnd(r.ps)}</span>,
            <span className="pos">{vnd(r.dtt)}</span>,
            <span className={r.cl > 0 ? "warn" : "pos"}>{r.cl > 0 ? vnd(r.cl) : "0đ"}</span>,
            r.han,
            <Badge text={r.tt} type={r.tt==="Đã thanh toán"?"green":r.tt==="Đã quá hạn"?"red":"yellow"} />,
          ])}
        />
        <div className="info-box" style={{textAlign:"right"}}>
          Tổng cần thanh toán: <strong className="warn">{vnd(totalNo)}</strong>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   BÁO CÁO — P&L
══════════════════════════════════════════ */
function PLRow({ label, value, total, indent = 0, section = false }) {
  return (
    <div className={`pl-row${section ? " pl-section" : ""}`} style={{ paddingLeft: 14 + indent * 18 }}>
      <span style={{ fontSize: section ? 13 : 12.5 }}>{label}</span>
      <div style={{ display:"flex", gap:32 }}>
        <span style={{ minWidth:140, textAlign:"right", fontSize: section ? 13 : 12.5, color: section ? undefined : "var(--text-3)" }}>
          {vnd(value)}
        </span>
        <span style={{ minWidth:60, textAlign:"right", fontSize:11, color:"var(--text-muted)" }}>
          {total > 0 ? pct(value / total * 100) : "—"}
        </span>
      </div>
    </div>
  );
}

function PLBaoCao({ doanhThu, chiPhi }) {
  const totDT  = doanhThu.reduce((s, r) => s + r.dt, 0);
  const totNVL = chiPhi.filter(r=>r.dm==="Nguyên vật liệu").reduce((s,r)=>s+r.so,0);
  const totNS  = chiPhi.filter(r=>r.dm==="Nhân sự").reduce((s,r)=>s+r.so,0);
  const totMB  = chiPhi.filter(r=>r.dm==="Thuê mặt bằng").reduce((s,r)=>s+r.so,0);
  const totDN  = chiPhi.filter(r=>r.dm==="Điện nước").reduce((s,r)=>s+r.so,0);
  const totMKT = chiPhi.filter(r=>r.dm==="Marketing").reduce((s,r)=>s+r.so,0);
  const totCCDC= chiPhi.filter(r=>r.dm==="CCDC").reduce((s,r)=>s+r.so,0);
  const totSC  = chiPhi.filter(r=>r.dm==="Sửa chữa").reduce((s,r)=>s+r.so,0);
  const totCP  = chiPhi.reduce((s, r) => s + r.so, 0);
  const ln     = totDT - totCP;

  return (
    <>
      <div className="kpi-grid kpi-4">
        <KpiCard label="Doanh thu thuần" value={mtr(totDT)}   sub="Tháng 6/2025"                     color="#10B981" />
        <KpiCard label="Tổng chi phí"   value={mtr(totCP)}   sub={pct(totCP/totDT*100)+" doanh thu"} color="#EF4444" />
        <KpiCard label="Lợi nhuận"      value={mtr(ln)}       sub="Trước thuế"                        color="#F59E0B" />
        <KpiCard label="Biên lợi nhuận" value={pct(ln/totDT*100)} sub={ln>=0?"Đạt mục tiêu":"Cần cải thiện"} color={ln>=0?"#10B981":"#EF4444"} />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Báo cáo kết quả kinh doanh (P&L) — Tháng 6 / 2025</span>
          <div style={{fontSize:11,color:"var(--text-muted)"}}>Đơn vị: VNĐ</div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:32,padding:"0 14px 6px",fontSize:10,color:"var(--text-muted)",fontWeight:700,textTransform:"uppercase"}}>
          <span style={{minWidth:140,textAlign:"right"}}>Số tiền (VNĐ)</span>
          <span style={{minWidth:60,textAlign:"right"}}>% Doanh thu</span>
        </div>

        <PLRow label="I. DOANH THU THUẦN"             value={totDT}             total={totDT} section />
        <PLRow label="II. GIÁ VỐN HÀNG BÁN (NVL)"    value={totNVL}            total={totDT} section />
        <PLRow label="→ Chi phí NVL thực phẩm"        value={Math.round(totNVL*.55)} total={totDT} indent={1} />
        <PLRow label="→ Chi phí NVL đồ uống"          value={Math.round(totNVL*.45)} total={totDT} indent={1} />
        <PLRow label="LỢI NHUẬN GỘP"                  value={totDT-totNVL}      total={totDT} section />
        <PLRow label="III. CHI PHÍ VẬN HÀNH"          value={totCP-totNVL}      total={totDT} section />
        <PLRow label="1. Chi phí nhân sự"             value={totNS}             total={totDT} indent={1} />
        <PLRow label="2. Tiền thuê mặt bằng"          value={totMB}             total={totDT} indent={1} />

        <PLRow label="3. Điện, nước, gas"             value={totDN}             total={totDT} indent={1} />
        <PLRow label="4. Marketing & quảng cáo"       value={totMKT}            total={totDT} indent={1} />
        <PLRow label="5. CCDC & công cụ bếp"          value={totCCDC}           total={totDT} indent={1} />
        <PLRow label="6. Sửa chữa & bảo trì"         value={totSC}             total={totDT} indent={1} />

        <PLRow label="IV. TỔNG CHI PHÍ"               value={totCP}             total={totDT} section />

        <div className={ln >= 0 ? "pl-profit" : "pl-loss"}>
          <span style={{fontSize:15,fontWeight:800}}>LỢI NHUẬN TRƯỚC THUẾ</span>
          <div style={{display:"flex",gap:32,alignItems:"center"}}>
            <span style={{fontSize:18,fontWeight:800,color:ln>=0?"#10B981":"#EF4444"}}>{vnd(ln)}</span>
            <span style={{fontSize:14,fontWeight:700,color:ln>=0?"#10B981":"#EF4444"}}>{pct(ln/totDT*100)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   BÁO CÁO — So sánh venue
══════════════════════════════════════════ */
function VenueSoSanh({ doanhThu }) {
  const total = doanhThu.reduce((s, r) => s + r.dt, 0);
  const vdata = VENUES.map((v, i) => {
    const recs = doanhThu.filter(r => r.cn === v);
    const dt   = recs.reduce((s, r) => s + r.dt, 0);
    const hd   = recs.reduce((s, r) => s + r.hd, 0);
    return { v, dt, hd, avgHD: hd > 0 ? Math.round(dt/hd) : 0, pct: dt/total*100, clr: CC[i] };
  });

  const tt = { style: { background:"#132140", border:"1px solid #1E3A5F", borderRadius:8, fontSize:12, color:"#CBD5E1" }};

  return (
    <>
      <div className="kpi-grid kpi-5">
        {vdata.map(v => (
          <KpiCard key={v.v} label={v.v} value={mtr(v.dt)} sub={pct(v.pct) + "% tổng DT"} color={v.clr} />
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Doanh thu theo chi nhánh (triệu đ)</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vdata.map(v=>({name:v.v.replace("Marina ",""),dt:Math.round(v.dt/1e6)}))} layout="vertical" margin={{left:10}}>
              <XAxis type="number" tick={{fontSize:11,fill:"#64748B"}} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:"#CBD5E1"}} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tt.style} formatter={v => v+"tr"} />
              <Bar dataKey="dt" radius={[0,4,4,0]}>
                {vdata.map((v, i) => <Cell key={i} fill={v.clr} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Bảng so sánh chi tiết</span></div>
          <DataTable
            heads={[{label:"Chi nhánh"},{label:"Doanh thu",r:true},{label:"% Đóng góp",r:true},{label:"Hóa đơn",r:true},{label:"TB/HD",r:true}]}
            rows={vdata.sort((a,b)=>b.dt-a.dt).map(v => [
              <span className="strong">{v.v}</span>,
              <span className="pos">{mtr(v.dt)}</span>,
              <span className="warn">{pct(v.pct)}</span>,
              v.hd,
              <span className="blue">{v.avgHD > 0 ? Math.round(v.avgHD/1000)+"k" : "—"}</span>,
            ])}
          />
          <div className="info-box" style={{textAlign:"right"}}>
            Tổng doanh thu: <strong className="pos">{vnd(total)}</strong>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [page,      setPage]     = useState("dashboard");
  const [collapsed, setCollapsed]= useState(false);

  // Persistent data via localStorage
  const [nhanVien,  setNhanVien] = useStorage("nhanvien",  INIT_NHANVIEN);
  const [chamCong, setChamCong] = useStorage("chamcong",  INIT_CHAMCONG);
  const [nhapKho,   setNhapKho]  = useStorage("nhapkho",   INIT_NHAPKHO);
  const [xuatKho,   setXuatKho]  = useStorage("xuatkho",   INIT_XUATKHO);
  const [tonKho,    setTonKho]   = useStorage("tonkho",    INIT_TONKHO);
  const [foodCost,  setFoodCost] = useStorage("foodcost",  INIT_FOODCOST);
  const [haoHut,    setHaoHut]   = useStorage("haohut",    INIT_HAOHUT);
  const [nvlData,   setNvlData]  = useStorage("nvl",       INIT_NVL);
  const [doanhThu,  setDoanhThu] = useStorage("doanhthu",  INIT_DOANHTHU);
  const [chiPhi,    setChiPhi]   = useStorage("chiphi",    INIT_CHIPHI);
  const [congNo,    setCongNo]   = useStorage("congno",    INIT_CONGNO);


  useEffect(() => {
    setChamCong(prev => {
      const existingIds = new Set(prev.map(cc => cc.nvId));
      const newEntries = nhanVien
        .filter(nv => !existingIds.has(nv.id))
        .map(nv => ({ nvId: nv.id, name: nv.name, chucvu: nv.chucvu, cn: nv.cn, ngay: Array.from({ length: 30 }, () => 'V') }));
      const merged = [...prev, ...newEntries];
      const seen = new Set();
      const deduped = merged.filter(item => {
        if (seen.has(item.nvId)) return false;
        seen.add(item.nvId);
        return true;
      });
      if (deduped.length === prev.length && newEntries.length === 0) return prev;
      return deduped;
    });
  }, [nhanVien, setChamCong]);

  const resetData = () => {
    if (!window.confirm("Chuyển tháng mới: xóa toàn bộ dữ liệu (nhập/xuất, doanh thu, chi phí, công nợ, tồn kho, hao hụt, food cost) về số 0?\n\nLưu ý: Dữ liệu nhân viên giữ nguyên (có nút riêng).")) return;

    // Chỉ reset dữ liệu nghiệp vụ tháng (không đụng tới nhân sự/chấm công).
    setNhapKho([]);

    setXuatKho([]);

    setTonKho((prev) => (Array.isArray(prev) ? prev.map(r => ({ ...r, td: 0, nhap: 0, xuat: 0 })) : []));

    setFoodCost([]);
    setHaoHut([]);
    setDoanhThu([]);
    setChiPhi([]);
    setCongNo([]);


    // Không cần reset chấm công riêng vì đã setChamCong([]) ở trên.

  };

  const dataMap = {
    nhanvien: nhanVien,
    chamcong: chamCong,
    nhapkho: nhapKho,
    xuatkho: xuatKho,
    tonkho: tonKho,
    foodcost: foodCost,
    haohut: haoHut,
    nvl: nvlData,
    doanhthu: doanhThu,
    chiphi: chiPhi,
    congno: congNo,
  };

  const setDataMap = (key, next) => {
    switch (key) {
      case 'nhanvien': return setNhanVien(next);
      case 'chamcong': return setChamCong(next);
      case 'nhapkho': return setNhapKho(next);
      case 'xuatkho': return setXuatKho(next);
      case 'tonkho': return setTonKho(next);
      case 'foodcost': return setFoodCost(next);
      case 'haohut': return setHaoHut(next);
      case 'nvl': return setNvlData(next);
      case 'doanhthu': return setDoanhThu(next);
      case 'chiphi': return setChiPhi(next);
      case 'congno': return setCongNo(next);
      default: return;
    }
  };

  const renderContent = () => {
    switch (page) {
      case "dashboard":    return <Dashboard nhanVien={nhanVien} doanhThu={doanhThu} chiPhi={chiPhi} foodCost={foodCost} congNo={congNo} />;
          case "ns-dsnv":      return <DanhSachNV data={nhanVien} setData={setNhanVien} chamCong={chamCong} />;
      case "ns-chamcong":  return <ChamCong data={chamCong} setData={setChamCong} />;
      case "ns-luong":     return <BangLuong nhanVien={nhanVien} chamCong={chamCong} />;
      case "vh-nhapkho":   return <NhapKho data={nhapKho} setData={setNhapKho} />;
      case "vh-xuatkho":   return <XuatKho data={xuatKho} setData={setXuatKho} />;
      case "vh-tonkho":    return <TonKho data={tonKho} />;
      case "c-foodcost":   return <FoodCost data={foodCost} setData={setFoodCost} />;
      case "c-haohut":     return <HaoHut data={haoHut} setData={setHaoHut} />;
      case "tc-dt":        return <DoanhThu data={doanhThu} setData={setDoanhThu} />;
      case "tc-cp":        return <ChiPhi data={chiPhi} setData={setChiPhi} />;
      case "tc-cn":        return <CongNo data={congNo} />;
      case "bc-pl":        return <PLBaoCao doanhThu={doanhThu} chiPhi={chiPhi} />;
      case "bc-venue":     return <VenueSoSanh doanhThu={doanhThu} />;
      case "api-test":     return <ApiTestPage dataMap={dataMap} setDataMap={setDataMap} />;
      default:             return <Dashboard nhanVien={nhanVien} doanhThu={doanhThu} chiPhi={chiPhi} foodCost={foodCost} congNo={congNo} />;
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="logo">
          <div className="logo-mark">M</div>
          {!collapsed && (
            <div className="logo-info">
              <div className="logo-name">Marina Quy Nhơn</div>
              <div className="logo-sub">Hệ thống của Nẫu Làm MKT</div>
            </div>
          )}
        </div>

        <nav>
          {NAV.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section">{item.section}</div>;
            }
            return (
              <div
                key={item.id}
                className={`nav-item${page === item.id ? " active" : ""}`}
                onClick={() => setPage(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && item.label}
              </div>
            );
          })}
        </nav>

        <div className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
          <span>{collapsed ? "▶" : "◀"}</span>
          {!collapsed && "Thu gọn"}
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="header">
          <div className="header-left">
            <div className="page-title">{PAGE_TITLES[page] || "Tổng quan"}</div>
            <div className="page-sub">Marina Quy Nhơn - Hệ thống của Nẫu Làm MKT</div>


          </div>
          <div className="header-right">
            <select defaultValue="Tất cả chi nhánh">
              <option>Tất cả chi nhánh</option>
              {VENUES.map(v => <option key={v}>{v}</option>)}
            </select>
            <button className="btn" onClick={resetData} style={{fontSize:11,color:"var(--text-muted)"}}>
              Tháng mới
            </button>
          </div>

        </header>

        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
