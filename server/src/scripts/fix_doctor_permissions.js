/**
 * fix_doctor_permissions.js
 * 
 * One-time script: removes 'lab_view' and 'pharmacy_view' from every
 * role whose name is 'Doctor' (case-insensitive) across all hospitals.
 *
 * Run with:
 *   node src/scripts/fix_doctor_permissions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/role.model');

const REMOVE_PERMS = ['lab_view', 'pharmacy_view'];
const ADD_PERMS    = ['lab_reports_view'];

const dbURI = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm_db';

mongoose.connect(dbURI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Find all roles named "doctor" (case-insensitive)
        const doctorRoles = await Role.find({ name: /^doctor$/i });

        if (doctorRoles.length === 0) {
            console.log('ℹ️  No Doctor roles found in the database.');
            process.exit(0);
        }

        console.log(`Found ${doctorRoles.length} Doctor role(s). Updating permissions...`);

        for (const role of doctorRoles) {
            const before = [...(role.permissions || [])];
            let perms = role.permissions.filter(p => !REMOVE_PERMS.includes(p));
            ADD_PERMS.forEach(p => {
                if (!perms.includes(p)) perms.push(p);
            });
            role.permissions = perms;
            
            // Clean up nav links
            role.navLinks = (role.navLinks || []).filter(
                link => !['Lab Dashboard', 'Pharmacy'].includes(link.label)
            );
            if (!role.navLinks.find(link => link.label === 'Patients')) {
                role.navLinks.push({ label: 'Patients', path: '/doctor/patients' });
            }
            
            await role.save();
            const removed = before.filter(p => REMOVE_PERMS.includes(p));
            console.log(
                `✅ Updated role "${role.name}" (hospital: ${role.hospitalId || 'global'}) — removed: [${removed.join(', ') || 'none'}], added: [${ADD_PERMS.join(', ')}]`
            );
        }

        console.log('\n✅ Done. Doctor roles updated successfully.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
