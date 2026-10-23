const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      accountType: user.accountType,
      position: user.position
    },
    process.env.JWT_SECRET || 'restaurant_secret_key_2026',
    { expiresIn: '7d' }
  );
};

const PLAN_MAP = {
  starter: 'Gói Khởi Nghiệp (Starter) - 299.000 đ/tháng',
  standard: 'Gói Tiêu Chuẩn (Standard) - 599.000 đ/tháng',
  pro: 'Gói Chuyên Nghiệp (Pro) - 999.000 đ/tháng',
  enterprise: 'Gói Chuỗi Doanh Nghiệp (Enterprise) - 1.899.000 đ/tháng'
};

exports.registerStaff = async (req, res) => {
  try {
    const { name, username, password, position } = req.body;

    if (!name || !username || !password || !position) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, tên tài khoản, mật khẩu và vị trí làm việc'
      });
    }

    const validPositions = ['reception', 'waiter', 'kitchen', 'cashier', 'manager'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: 'Vị trí làm việc không hợp lệ'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản này đã được sử dụng'
      });
    }

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password,
      accountType: 'staff',
      position,
      approvalStatus: 'approved',
      isActive: true,
      email: `${cleanUsername}@nhahang.com`
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản nhân viên thành công!',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        accountType: user.accountType,
        position: user.position,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerOwner = async (req, res) => {
  try {
    const { name, username, password, plan } = req.body;

    if (!name || !username || !password || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên, tên tài khoản, mật khẩu và chọn một gói thuê app'
      });
    }

    const validPlans = ['starter', 'standard', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Gói thuê app đã chọn không hợp lệ'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản này đã được sử dụng'
      });
    }

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password,
      accountType: 'owner',
      position: 'owner',
      plan,
      planName: PLAN_MAP[plan] || plan,
      approvalStatus: 'approved',
      isActive: true,
      email: `${cleanUsername}@nhahang.com`
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản Chủ nhà hàng thành công!',
      token,
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        accountType: user.accountType,
        position: user.position,
        plan: user.plan,
        planName: user.planName,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, accountType } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên tài khoản và mật khẩu'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }

    if (accountType && user.accountType !== accountType) {
      const expectedLabel = accountType === 'owner' ? 'Chủ nhà hàng' : 'Nhân viên';
      return res.status(400).json({
        success: false,
        message: `Tài khoản này không thuộc nhóm ${expectedLabel}`
      });
    }

    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đang chờ duyệt từ Chủ nhà hàng. Vui lòng liên hệ để được kích hoạt!'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đang bị khóa tạm thời'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        accountType: user.accountType,
        position: user.position,
        plan: user.plan,
        planName: user.planName,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, isActive } = req.body;

    const updateFields = {};
    if (approvalStatus !== undefined) updateFields.approvalStatus = approvalStatus;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Đã xóa tài khoản thành công'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
