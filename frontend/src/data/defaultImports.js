// Dữ liệu mẫu và cơ chế lưu trữ lịch sử nhập hàng nguyên vật liệu
export const DEFAULT_IMPORTS_HISTORY = [
  {
    _id: 'imp-001',
    importCode: 'IMP-20261021-001',
    ingredientName: 'Thịt ba chỉ heo',
    category: 'Thịt, Thủy Hải Sản & Trứng',
    quantity: 20,
    unit: 'kg',
    costPerUnit: 140000,
    totalCost: 2800000,
    supplier: 'Công ty Thực phẩm Sạch Hải Phòng',
    importedBy: 'Quản lý kho',
    createdAt: '2026-10-21T08:30:00.000Z'
  },
  {
    _id: 'imp-002',
    importCode: 'IMP-20261021-002',
    ingredientName: 'Thịt thăn bò',
    category: 'Thịt, Thủy Hải Sản & Trứng',
    quantity: 15,
    unit: 'kg',
    costPerUnit: 260000,
    totalCost: 3900000,
    supplier: 'Hợp tác xã Chăn nuôi Bò Vàng',
    importedBy: 'Quản lý kho',
    createdAt: '2026-10-21T09:15:00.000Z'
  },
  {
    _id: 'imp-003',
    importCode: 'IMP-20261022-003',
    ingredientName: 'Sườn non thăn heo',
    category: 'Thịt, Thủy Hải Sản & Trứng',
    quantity: 20,
    unit: 'kg',
    costPerUnit: 160000,
    totalCost: 3200000,
    supplier: 'Công ty CP Chăn nuôi C.P Việt Nam',
    importedBy: 'Quản lý kho',
    createdAt: '2026-10-22T07:45:00.000Z'
  },
  {
    _id: 'imp-004',
    importCode: 'IMP-20261022-004',
    ingredientName: 'Bia Heineken Lon Ướp Lạnh',
    category: 'Đồ uống/Bia',
    quantity: 120,
    unit: 'lon',
    costPerUnit: 19000,
    totalCost: 2280000,
    supplier: 'Đại lý Bia & Nước Ngọt Thành Đạt Hải Phòng',
    importedBy: 'Thu ngân ca sáng',
    createdAt: '2026-10-22T10:00:00.000Z'
  },
  {
    _id: 'imp-005',
    importCode: 'IMP-20261022-005',
    ingredientName: 'Tôm thẻ tươi sống',
    category: 'Thịt, Thủy Hải Sản & Trứng',
    quantity: 15,
    unit: 'kg',
    costPerUnit: 200000,
    totalCost: 3000000,
    supplier: 'Vựa Thủy Hải Sản Đồ Sơn',
    importedBy: 'Quản lý kho',
    createdAt: '2026-10-22T14:20:00.000Z'
  },
  {
    _id: 'imp-006',
    importCode: 'IMP-20261023-006',
    ingredientName: 'Rau củ quả tươi & Gia vị tổng hợp',
    category: 'Rau Củ Quả & Nấm Tươi',
    quantity: 35,
    unit: 'kg',
    costPerUnit: 45000,
    totalCost: 1575000,
    supplier: 'Hợp tác xã Rau sạch An Dương',
    importedBy: 'Bếp trưởng',
    createdAt: '2026-10-23T06:30:00.000Z'
  }
];

export const IMPORTS_STORAGE_KEY = 'restaurant_imports_history_v1';

export const getStoredImports = () => {
  try {
    const raw = localStorage.getItem(IMPORTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc storage lịch sử nhập hàng:', e);
  }
  localStorage.setItem(IMPORTS_STORAGE_KEY, JSON.stringify(DEFAULT_IMPORTS_HISTORY));
  return DEFAULT_IMPORTS_HISTORY;
};

export const addStoredImport = (newRecord) => {
  try {
    const current = getStoredImports();
    const updated = [newRecord, ...current];
    localStorage.setItem(IMPORTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Lỗi lưu storage lịch sử nhập hàng:', e);
    return DEFAULT_IMPORTS_HISTORY;
  }
};
