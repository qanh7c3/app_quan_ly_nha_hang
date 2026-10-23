const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  accountType: {
    type: String,
    enum: ['owner', 'staff'],
    default: 'staff'
  },
  position: {
    type: String,
    enum: ['reception', 'waiter', 'kitchen', 'cashier', 'manager', 'owner'],
    default: 'waiter'
  },
  plan: {
    type: String,
    enum: ['starter', 'standard', 'pro', 'enterprise', null],
    default: null
  },
  planName: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
