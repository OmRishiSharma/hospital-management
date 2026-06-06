/**
 * tenantModels.js — Returns Mongoose models bound to a specific tenant DB connection.
 *
 * Why this is needed:
 *   Normal Mongoose models (e.g. require('../models/user.model')) are always
 *   bound to the DEFAULT connection (master DB). For tenant data, we need
 *   the same schemas but bound to the TENANT connection.
 *
 * Usage in a route:
 *   const { User, Appointment } = getTenantModels(req.tenantDb);
 *   const patients = await User.find({ hospitalId: req.hospitalId });
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Schema Definitions (reusable, not bound to any connection) ───────────────

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true },
    password: { type: String, required: false },
    phone: { type: String, default: '' },
    role: { type: mongoose.Schema.Types.Mixed, default: 'patient' },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, default: null },
    patientId: { type: String, unique: true, sparse: true },
    dob: String,
    gender: String,
    bloodGroup: String,
    address: String,
    city: String,
    mrn: { type: String, unique: true, sparse: true },
    aadhaarNumber: { type: String, unique: true, sparse: true, trim: true },
    isAadhaarVerified: { type: Boolean, default: false },
    patientType: { type: String, enum: ['Primary', 'Partner'], default: 'Primary' },
    departments: [{ type: String }],
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function (entered) {
    if (!this.password) return false;
    return await bcrypt.compare(entered, this.password);
};

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hospitalId: { type: mongoose.Schema.Types.ObjectId },
    date: Date,
    time: String,
    appointmentDate: Date,
    appointmentTime: { type: String, default: '' },
    tokenNumber: { type: Number, default: null },
    status: { type: String, default: 'Scheduled' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Waived'], default: 'Pending' },
    fee: { type: Number, default: 0 },
    type: String,
    notes: String,
    department: String,
    doctorName: String,
    serviceName: String,
    amount: { type: Number, default: 0 },
    bookedBy: { type: mongoose.Schema.Types.ObjectId },
    recommendAdmission: { type: Boolean, default: false },
    recommendAdmissionNotes: { type: String, default: '' },
    recommendAdmissionPriority: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
    recommendAdmissionDept: { type: String, default: '' }
}, { timestamps: true });

const labReportSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: false,
        index: true
    },
    patientId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        index: true
    },
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab'
    },
    testNames: [{
        type: String,
        required: true
    }],
    testStatus: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
        default: 'PENDING',
        index: true
    },
    reportStatus: {
        type: String,
        enum: ['PENDING', 'UPLOADED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID'],
        default: 'PENDING',
        index: true
    },
    paymentMode: {
        type: String,
        enum: ['CASH', 'ONLINE', 'UPI', 'CARD', 'NONE'],
        default: 'NONE'
    },
    amount: {
        type: Number,
        default: 0
    },
    reportFile: {
        url: String,
        fileId: String,
        name: String,
        uploadedAt: Date
    },
    notes: {
        type: String,
        default: ''
    },
    sampleCollected: {
        type: Boolean,
        default: false
    },
    sampleCollectedAt: {
        type: Date
    },
    sampleCollectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sampleType: {
        type: String,
        enum: ['Blood', 'Urine', 'Stool', 'Saliva', 'Sputum', 'Swab', 'Tissue', 'Other']
    },
    collectionNotes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Sample Collected', 'In Testing', 'Report Ready', 'Completed', 'Cancelled'],
        default: 'Pending',
        index: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusHistory: [{
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedByName: String,
        notes: String
    }]
}, { timestamps: true });

const pharmacyOrderSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{ name: String, qty: Number, price: Number }],
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Waived'], default: 'Pending' },
    hospitalId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

const facilityChargeSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    facilityName: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    daysUsed: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Waived'], default: 'Pending' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hospitalId: { type: mongoose.Schema.Types.ObjectId },
    notes: String,
}, { timestamps: true });

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    permissions: [String],
    dashboardPath: { type: String, default: '/my-dashboard' },
    navLinks: [{ label: String, path: String }],
    hospitalId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isSystemRole: { type: Boolean, default: false },
}, { timestamps: true });

const admissionSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, default: '' },
    patientPhone: { type: String, default: '' },
    appointmentId: { type: mongoose.Schema.Types.ObjectId },
    admittedBy: { type: mongoose.Schema.Types.ObjectId },
    admissionDate: { type: Date, default: Date.now },
    dischargeDate: Date,
    status: { type: String, enum: ['Admitted', 'Discharged', 'Pending Allocation'], default: 'Pending Allocation' },
    ward: String,
    bedNumber: String,
    requestedDepartment: { type: String, default: '' },
    priority: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
    selectedFacilities: [{
        facilityName: String,
        pricePerDay: Number,
        days: Number,
        totalAmount: Number
    }],
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    notes: String,
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    items: [{
        itemType: { type: String, enum: ['Consultation', 'Laboratory', 'Pharmacy', 'Admission', 'Facility', 'Service', 'Other'] },
        itemId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
    }],
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    outstandingAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Partially Paid', 'Paid', 'Cancelled'], default: 'Pending' },
    payments: [{
        receiptNumber: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        method: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'], required: true },
        reference: { type: String, default: '' },
        collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        collectedByName: { type: String, default: '' }
    }],
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    generatedByName: { type: String, default: '' }
}, { timestamps: true });

const refundSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    invoiceNumber: { type: String, default: '' },
    refundType: { type: String, enum: ['Cancelled Lab Test', 'Returned Medicine', 'Duplicate Payment', 'Manual Refund'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Refund Pending', 'Refund Approved', 'Refunded'], default: 'Refund Pending' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedByName: { type: String, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedByName: { type: String },
    actionDate: { type: Date },
    history: [{
        status: String,
        actionDate: { type: Date, default: Date.now },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performedByName: String,
        notes: String
    }]
}, { timestamps: true });

const billingActivityLogSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, required: true },
    action: { type: String, enum: ['Invoice Generated', 'Payment Collected', 'Invoice Cancelled', 'Refund Issued', 'Override Approved'], required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    details: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const inventorySchema = new mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        index: true
    },
    name: { type: String, required: true, trim: true },
    salt: { type: String, default: '', trim: true },
    category: { type: String, default: 'General' },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'Tablets' },
    buyingPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    vendor: { type: String, default: '' },
    batchNumber: { type: String, default: '' },
    expiryDate: { type: Date, default: null },
    purchaseDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock'
    }
}, { timestamps: true });

inventorySchema.pre('save', async function () {
    if (this.stock <= 0) {
        this.status = 'Out of Stock';
    } else if (this.stock < 50) {
        this.status = 'Low Stock';
    } else {
        this.status = 'In Stock';
    }
});

const expenseCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

expenseCategorySchema.index({ hospitalId: 1, name: 1 }, { unique: true });

const expenseSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Net Banking'], default: 'Cash' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedByName: { type: String, default: '' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recipientName: { type: String, default: '' }
}, { timestamps: true });

// Indexes for Performance Optimization
userSchema.index({ hospitalId: 1 });
userSchema.index({ createdAt: 1 });

appointmentSchema.index({ hospitalId: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ createdAt: 1 });

labReportSchema.index({ hospitalId: 1 });
labReportSchema.index({ patientId: 1 });
labReportSchema.index({ doctorId: 1 });
labReportSchema.index({ createdAt: 1 });

pharmacyOrderSchema.index({ hospitalId: 1 });
pharmacyOrderSchema.index({ patientId: 1 });
pharmacyOrderSchema.index({ createdAt: 1 });

facilityChargeSchema.index({ hospitalId: 1 });
facilityChargeSchema.index({ patientId: 1 });
facilityChargeSchema.index({ createdAt: 1 });

roleSchema.index({ hospitalId: 1 });
roleSchema.index({ createdAt: 1 });

admissionSchema.index({ hospitalId: 1 });
admissionSchema.index({ patientId: 1 });
admissionSchema.index({ createdAt: 1 });

invoiceSchema.index({ hospitalId: 1 });
invoiceSchema.index({ patientId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ createdAt: 1 });

refundSchema.index({ hospitalId: 1 });
refundSchema.index({ patientId: 1 });
refundSchema.index({ invoiceNumber: 1 });
refundSchema.index({ createdAt: 1 });

billingActivityLogSchema.index({ hospitalId: 1 });
billingActivityLogSchema.index({ patientId: 1 });
billingActivityLogSchema.index({ createdAt: 1 });

inventorySchema.index({ hospitalId: 1 });
inventorySchema.index({ createdAt: 1 });

expenseSchema.index({ hospitalId: 1 });
expenseSchema.index({ createdAt: 1 });

// ─── Model Factory ────────────────────────────────────────────────────────────

/**
 * Returns all Mongoose models bound to the given tenant connection.
 * Models are cached on the connection object itself to avoid re-registering.
 *
 * @param {mongoose.Connection} tenantDb
 * @returns {{ User, Appointment, LabReport, PharmacyOrder, FacilityCharge, Role, Admission, Invoice, Refund, BillingActivityLog, Inventory, ExpenseCategory, Expense }}
 */
function getTenantModels(tenantDb) {
    if (!tenantDb) {
        throw new Error('tenantDb connection is required for getTenantModels()');
    }

    // Helper: register model once per connection
    const model = (name, schema) => {
        try {
            return tenantDb.model(name);
        } catch {
            return tenantDb.model(name, schema);
        }
    };

    return {
        User: model('User', userSchema),
        Appointment: model('Appointment', appointmentSchema),
        LabReport: model('LabReport', labReportSchema),
        PharmacyOrder: model('PharmacyOrder', pharmacyOrderSchema),
        FacilityCharge: model('FacilityCharge', facilityChargeSchema),
        Role: model('Role', roleSchema),
        Admission: model('Admission', admissionSchema),
        Invoice: model('Invoice', invoiceSchema),
        Refund: model('Refund', refundSchema),
        BillingActivityLog: model('BillingActivityLog', billingActivityLogSchema),
        Inventory: model('Inventory', inventorySchema),
        ExpenseCategory: model('ExpenseCategory', expenseCategorySchema),
        Expense: model('Expense', expenseSchema),
    };
}

module.exports = { getTenantModels };

