/* ============================================
   TEAM MANAGEMENT - Team members, roles, user access control
   ============================================ */

/**
 * Team Management Feature Module
 *
 * Provides:
 * - Team member CRUD operations
 * - Role-based filtering and search
 * - User roles & access control (RBAC)
 * - Team allocation to orders
 * - Firestore synchronization
 *
 * @exports Team
 */

import { Utils } from '../utils/helpers.js';

export const Team = {
    /**
     * Render main team management interface
     * @param {Object} oms - Reference to OMS
     */
    renderTeam(oms) {
        const container = document.getElementById('team');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('teamManagement')}</h2>
                    <p style="color: var(--text-gray); margin-top: 0.5rem;">${oms.t('teamManagement')}</p>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${oms.t('addTeamMember')}</h3>
                    </div>
                    <div class="form-grid" style="grid-template-columns: repeat(2, 1fr);">
                        <div class="form-group">
                            <label class="form-label required">${oms.t('memberName')}</label>
                            <input type="text" id="teamMemberName" class="form-input" placeholder="e.g., Rajesh Kumar">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">${oms.t('phoneNumber')}</label>
                            <input type="tel" id="teamMemberWhatsApp" class="form-input" placeholder="e.g., +91 98765 43210">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('email')}</label>
                            <input type="email" id="teamMemberEmail" class="form-input" placeholder="e.g., rajesh@example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">${oms.t('status')}</label>
                            <select id="teamMemberStatus" class="form-select">
                                <option value="Active">${oms.t('active')}</option>
                                <option value="Inactive">${oms.t('inactive')}</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label required">${oms.t('roles')}</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--white);">
                                <input type="checkbox" id="roleDriver" value="Driver" style="width: 18px; height: 18px; cursor: pointer;">
                                <span>🚗 ${oms.t('driver')}</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--white);">
                                <input type="checkbox" id="roleOperator" value="Operator" style="width: 18px; height: 18px; cursor: pointer;">
                                <span>⚙️ ${oms.t('operator')}</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--white);">
                                <input type="checkbox" id="roleHelper" value="Helper" style="width: 18px; height: 18px; cursor: pointer;">
                                <span>🤝 ${oms.t('helpers')}</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--white);">
                                <input type="checkbox" id="roleManager" value="Manager" style="width: 18px; height: 18px; cursor: pointer;">
                                <span>👔 Manager</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--white);">
                                <input type="checkbox" id="roleSupervisor" value="Supervisor" style="width: 18px; height: 18px; cursor: pointer;">
                                <span>📋 Supervisor</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">${oms.t('roles')}</label>
                        <input type="text" id="teamMemberSkills" class="form-input" placeholder="e.g., Wedding Expert, Corporate Events, Sound Systems">
                        <small style="color: var(--text-gray);">${oms.t('multipleHelpersSeparated')}</small>
                    </div>

                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="OMS.addTeamMember()">${oms.t('addTeamMember')}</button>
                        <button class="btn btn-secondary" onclick="OMS.clearTeamForm()">${oms.t('clearForm')}</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${oms.t('team')}</h3>
                    </div>
                    <div class="form-row" style="margin-bottom: 1rem;">
                        <select id="teamRoleFilter" class="form-select" onchange="OMS.renderTeamTable()">
                            <option value="">${oms.t('roles')}</option>
                            <option value="Driver">🚗 ${oms.t('driver')}</option>
                            <option value="Operator">⚙️ ${oms.t('operator')}</option>
                            <option value="Helper">🤝 ${oms.t('helpers')}</option>
                            <option value="Manager">👔 Manager</option>
                            <option value="Supervisor">📋 Supervisor</option>
                        </select>
                        <select id="teamStatusFilter" class="form-select" onchange="OMS.renderTeamTable()">
                            <option value="">${oms.t('status')}</option>
                            <option value="Active">${oms.t('active')}</option>
                            <option value="Inactive">${oms.t('inactive')}</option>
                        </select>
                        <input type="text" id="teamSearch" class="form-input" placeholder="${oms.t('searchPlaceholder')}" oninput="OMS.renderTeamTable()">
                    </div>
                    <div id="teamMembersContainer"></div>
                </div>

                <div class="card" id="userRolesCard">
                    <div class="card-header">
                        <h3 class="card-title">🔐 User Access Control</h3>
                        <p style="color: var(--text-gray); margin-top: 0.5rem;">Manage user roles and access permissions</p>
                    </div>
                    <div id="userRolesContainer"></div>
                </div>
            </div>
        `;

        this.renderTeamTable(oms);
        this.renderUserRoles(oms);
    },

    /**
     * Render team members table with filters
     * @param {Object} oms - Reference to OMS
     */
    renderTeamTable(oms) {
        const container = document.getElementById('teamMembersContainer');
        if (!container) return;

        // Get filter values
        const roleFilter = document.getElementById('teamRoleFilter')?.value || '';
        const statusFilter = document.getElementById('teamStatusFilter')?.value || '';
        const searchQuery = document.getElementById('teamSearch')?.value.toLowerCase() || '';

        // Filter team members
        let filteredTeam = oms.data.team.filter(member => {
            const matchesRole = !roleFilter || member.roles.includes(roleFilter);
            const matchesStatus = !statusFilter || member.status === statusFilter;
            const matchesSearch = !searchQuery || member.name.toLowerCase().includes(searchQuery);
            return matchesRole && matchesStatus && matchesSearch;
        });

        if (filteredTeam.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                    <p>${oms.t('noOrdersFound')}</p>
                </div>
            `;
            return;
        }

        // Render table
        const tableHtml = `
            <div style="overflow-x: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>${oms.t('memberName')}</th>
                            <th>${oms.t('roles')}</th>
                            <th>${oms.t('phoneNumber')}</th>
                            <th>${oms.t('email')}</th>
                            <th>${oms.t('roles')}</th>
                            <th>${oms.t('status')}</th>
                            <th>${oms.t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTeam.map(member => {
                            const roleIcons = {
                                'Driver': '🚗',
                                'Operator': '⚙️',
                                'Helper': '🤝',
                                'Manager': '👔',
                                'Supervisor': '📋'
                            };
                            const roleBadges = member.roles.map(role =>
                                `<span style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.25rem;">${roleIcons[role] || ''} ${role}</span>`
                            ).join('');

                            const statusColor = member.status === 'Active' ? 'var(--success)' : 'var(--text-gray)';
                            const statusBadge = `<span style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${oms.t(member.status.toLowerCase())}</span>`;

                            return `
                                <tr>
                                    <td><strong>${member.name}</strong></td>
                                    <td>${roleBadges}</td>
                                    <td>
                                        <a href="https://wa.me/${member.whatsApp.replace(/[^0-9]/g, '')}" target="_blank" style="color: var(--success);">
                                            ${member.whatsApp}
                                        </a>
                                    </td>
                                    <td>${member.email || '-'}</td>
                                    <td><small>${member.skills && member.skills.length > 0 ? member.skills.join(', ') : '-'}</small></td>
                                    <td>${statusBadge}</td>
                                    <td>
                                        <button class="btn btn-info btn-small" onclick="OMS.editTeamMember('${member.id}')">${oms.t('edit')}</button>
                                        <button class="btn btn-danger btn-small" onclick="OMS.deleteTeamMember('${member.id}')">${oms.t('delete')}</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHtml;
    },

    /**
     * Add new team member
     * @param {Object} oms - Reference to OMS
     */
    addTeamMember(oms) {
        const name = Utils.get('teamMemberName');
        const whatsApp = Utils.get('teamMemberWhatsApp');
        const email = Utils.get('teamMemberEmail');
        const status = Utils.get('teamMemberStatus');
        const skillsStr = Utils.get('teamMemberSkills');

        // Get selected roles
        const roles = [];
        if (document.getElementById('roleDriver')?.checked) roles.push('Driver');
        if (document.getElementById('roleOperator')?.checked) roles.push('Operator');
        if (document.getElementById('roleHelper')?.checked) roles.push('Helper');
        if (document.getElementById('roleManager')?.checked) roles.push('Manager');
        if (document.getElementById('roleSupervisor')?.checked) roles.push('Supervisor');

        // Validation
        if (!name || !whatsApp || roles.length === 0) {
            oms.showToast('Please fill Name, WhatsApp, and select at least one Role', 'error');
            return;
        }

        // Parse skills
        const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(s => s) : [];

        // Create team member object
        const teamMember = {
            id: Utils.generateId(),
            name,
            roles,
            whatsApp,
            email: email || '',
            skills,
            status,
            createdAt: new Date().toISOString()
        };

        oms.data.team.push(teamMember);
        oms.saveToStorage();

        // Save to Firestore
        this.saveTeamMemberToFirestore(oms, teamMember).then(success => {
            if (success) {
                oms.showToast(`${name} added to team and synced!`, 'success');
            } else {
                oms.showToast(`${name} added locally, but sync failed`, 'warning');
            }
        });

        this.renderTeamTable(oms);
        this.clearTeamForm();
    },

    /**
     * Clear team member form
     */
    clearTeamForm() {
        Utils.set('teamMemberName', '');
        Utils.set('teamMemberWhatsApp', '');
        Utils.set('teamMemberEmail', '');
        Utils.set('teamMemberSkills', '');
        Utils.set('teamMemberStatus', 'Active');

        // Uncheck all role checkboxes
        ['roleDriver', 'roleOperator', 'roleHelper', 'roleManager', 'roleSupervisor'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
    },

    /**
     * Edit team member - show modal
     * @param {Object} oms - Reference to OMS
     * @param {string} id - Team member ID
     */
    editTeamMember(oms, id) {
        const member = oms.data.team.find(m => m.id === id);
        if (!member) return;

        // Show edit modal
        oms.showModal('Edit Team Member', `
            <div class="form-group">
                <label class="form-label required">Name</label>
                <input type="text" id="editTeamMemberName" class="form-input" value="${member.name}">
            </div>
            <div class="form-group">
                <label class="form-label required">WhatsApp Number</label>
                <input type="tel" id="editTeamMemberWhatsApp" class="form-input" value="${member.whatsApp}">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="editTeamMemberEmail" class="form-input" value="${member.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label required">Status</label>
                <select id="editTeamMemberStatus" class="form-select">
                    <option value="Active" ${member.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label required">Roles</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editRoleDriver" value="Driver" ${member.roles.includes('Driver') ? 'checked' : ''}>
                        🚗 Driver
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editRoleOperator" value="Operator" ${member.roles.includes('Operator') ? 'checked' : ''}>
                        ⚙️ Operator
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editRoleHelper" value="Helper" ${member.roles.includes('Helper') ? 'checked' : ''}>
                        🤝 Helper
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editRoleManager" value="Manager" ${member.roles.includes('Manager') ? 'checked' : ''}>
                        👔 Manager
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="editRoleSupervisor" value="Supervisor" ${member.roles.includes('Supervisor') ? 'checked' : ''}>
                        📋 Supervisor
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Skills (comma-separated)</label>
                <input type="text" id="editTeamMemberSkills" class="form-input" value="${member.skills && member.skills.length > 0 ? member.skills.join(', ') : ''}">
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="OMS.saveTeamMemberEdit('${id}')">💾 Save Changes</button>
                <button class="btn btn-secondary" onclick="OMS.closeModal()">Cancel</button>
            </div>
        `);
    },

    /**
     * Save team member edits
     * @param {Object} oms - Reference to OMS
     * @param {string} id - Team member ID
     */
    saveTeamMemberEdit(oms, id) {
        const member = oms.data.team.find(m => m.id === id);
        if (!member) return;

        const name = Utils.get('editTeamMemberName');
        const whatsApp = Utils.get('editTeamMemberWhatsApp');
        const email = Utils.get('editTeamMemberEmail');
        const status = Utils.get('editTeamMemberStatus');
        const skillsStr = Utils.get('editTeamMemberSkills');

        // Get selected roles
        const roles = [];
        if (document.getElementById('editRoleDriver')?.checked) roles.push('Driver');
        if (document.getElementById('editRoleOperator')?.checked) roles.push('Operator');
        if (document.getElementById('editRoleHelper')?.checked) roles.push('Helper');
        if (document.getElementById('editRoleManager')?.checked) roles.push('Manager');
        if (document.getElementById('editRoleSupervisor')?.checked) roles.push('Supervisor');

        // Validation
        if (!name || !whatsApp || roles.length === 0) {
            oms.showToast('Please fill all required fields', 'error');
            return;
        }

        // Update member
        member.name = name;
        member.whatsApp = whatsApp;
        member.email = email;
        member.status = status;
        member.roles = roles;
        member.skills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(s => s) : [];
        member.updatedAt = new Date().toISOString();

        oms.saveToStorage();

        // Save to Firestore
        this.saveTeamMemberToFirestore(oms, member).then(success => {
            if (success) {
                oms.showToast('Team member updated and synced!', 'success');
            } else {
                oms.showToast('Team member updated locally, but sync failed', 'warning');
            }
        });

        this.renderTeamTable(oms);
        oms.closeModal();
    },

    /**
     * Delete team member
     * @param {Object} oms - Reference to OMS
     * @param {string} id - Team member ID
     */
    deleteTeamMember(oms, id) {
        const member = oms.data.team.find(m => m.id === id);
        if (!member) return;

        if (confirm(`Are you sure you want to delete ${member.name} from the team?`)) {
            const index = oms.data.team.findIndex(m => m.id === id);
            if (index !== -1) {
                const memberName = member.name;

                oms.data.team.splice(index, 1);
                oms.saveToStorage();

                // Delete from Firestore
                this.deleteTeamMemberFromFirestore(id).then(success => {
                    if (success) {
                        oms.showToast(`${memberName} removed from team and synced!`, 'success');
                    } else {
                        oms.showToast(`${memberName} removed locally, but sync failed`, 'warning');
                    }
                });

                this.renderTeamTable(oms);
            }
        }
    },

    /**
     * Render user roles and access control (RBAC)
     * @param {Object} oms - Reference to OMS
     */
    async renderUserRoles(oms) {
        const container = document.getElementById('userRolesContainer');
        if (!container) return;

        const isAdmin = await oms.isAdminOrOwner();

        if (!isAdmin) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                    <p>⛔ Only Admin and Owner can manage user roles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '<div style="text-align: center; padding: 1rem;">Loading users...</div>';

        try {
            // Fetch all user roles from Firestore
            const userRolesSnapshot = await window.db.collection('user_roles').get();
            const users = [];

            userRolesSnapshot.forEach(doc => {
                users.push({
                    uid: doc.id,
                    ...doc.data()
                });
            });

            if (users.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                        <p>No users found. Users will appear here after they log in.</p>
                    </div>
                `;
                return;
            }

            // Render users table
            const tableHtml = `
                <div style="overflow-x: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Current Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => {
                                const roleColor = user.role === 'admin' ? '#f44336' : user.role === 'owner' ? '#ff9800' : '#2196f3';
                                const roleBadge = `<span style="background: ${roleColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; text-transform: uppercase;">${user.role || 'staff'}</span>`;

                                return `
                                    <tr>
                                        <td><strong>${user.email}</strong></td>
                                        <td>${user.name || '-'}</td>
                                        <td>${roleBadge}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff9c4; border-left: 4px solid #fbc02d; border-radius: 0.25rem;">
                    <strong>⚠️ Role Permissions:</strong>
                    <ul style="margin: 0.5rem 0 0 1.5rem; line-height: 1.8;">
                        <li><strong>Admin</strong> - Full access to all features including financials</li>
                        <li><strong>Owner</strong> - Full access to all features including financials</li>
                        <li><strong>Staff</strong> - Limited access (no financial data or payment information)</li>
                    </ul>
                </div>
            `;

            container.innerHTML = tableHtml;

        } catch (error) {
            console.error('Error loading user roles:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--danger);">
                    <p>Error loading users: ${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Populate team dropdowns for single-day orders
     * @param {Object} oms - Reference to OMS
     */
    populateTeamDropdowns(oms) {
        // Get active team members
        const activeTeam = oms.data.team.filter(m => m.status === 'Active');

        // Populate Driver dropdown
        const driverSelect = document.getElementById('driverName');
        if (driverSelect) {
            const drivers = activeTeam.filter(m => m.roles.includes('Driver'));
            driverSelect.innerHTML = '<option value="">Select Driver</option>' +
                drivers.map(d => `<option value="${d.name}" data-id="${d.id}">🚗 ${d.name}</option>`).join('');
        }

        // Populate Driver 2 dropdown
        const driver2Select = document.getElementById('driverName2');
        if (driver2Select) {
            const drivers = activeTeam.filter(m => m.roles.includes('Driver'));
            driver2Select.innerHTML = '<option value="">Select Driver</option>' +
                drivers.map(d => `<option value="${d.name}" data-id="${d.id}">🚗 ${d.name}</option>`).join('');
        }

        // Populate Operator dropdown
        const operatorSelect = document.getElementById('operator');
        if (operatorSelect) {
            const operators = activeTeam.filter(m => m.roles.includes('Operator'));
            operatorSelect.innerHTML = '<option value="">Select Operator</option>' +
                operators.map(o => `<option value="${o.name}" data-id="${o.id}">⚙️ ${o.name}</option>`).join('');
        }

        // Helper field is now a text input - no population needed
    },

    /**
     * Populate team dropdowns for multi-day function
     * @param {Object} oms - Reference to OMS
     * @param {number} dayIndex - Day index
     * @param {number} functionIndex - Function index
     */
    populateFunctionTeamDropdowns(oms, dayIndex, functionIndex) {
        // Get active team members
        const activeTeam = oms.data.team.filter(m => m.status === 'Active');
        const functionId = `day${dayIndex}func${functionIndex}`;

        // Populate Driver multi-select for this function
        const driverSelect = document.getElementById(`${functionId}Driver`);
        if (driverSelect) {
            const drivers = activeTeam.filter(m => m.roles.includes('Driver'));
            const currentValues = Array.from(driverSelect.selectedOptions).map(opt => opt.value);
            driverSelect.innerHTML = drivers.map(d =>
                `<option value="${d.name}" data-id="${d.id}" ${currentValues.includes(d.name) ? 'selected' : ''}>🚗 ${d.name}</option>`
            ).join('');
        }

        // Populate Operator dropdown for this function
        const operatorSelect = document.getElementById(`${functionId}Operator`);
        if (operatorSelect) {
            const operators = activeTeam.filter(m => m.roles.includes('Operator'));
            const currentValue = operatorSelect.value;
            operatorSelect.innerHTML = '<option value="">Select Operator</option>' +
                operators.map(o => `<option value="${o.name}" data-id="${o.id}" ${o.name === currentValue ? 'selected' : ''}>⚙️ ${o.name}</option>`).join('');
        }

        // Helper field is now a text input - no population needed
    },

    /**
     * Update all team dropdowns (single-day and multi-day)
     * @param {Object} oms - Reference to OMS
     */
    updateTeamDropdowns(oms) {
        // Update single-day order form dropdowns
        this.populateTeamDropdowns(oms);

        // Update multiday function dropdowns if they exist
        const multidayData = oms.data.multidayOrders || [];
        multidayData.forEach((day, dayIndex) => {
            if (day.functions) {
                day.functions.forEach((func, functionIndex) => {
                    this.populateFunctionTeamDropdowns(oms, dayIndex, functionIndex);
                });
            }
        });
    },

    /**
     * Save team member to Firestore
     * @param {Object} oms - Reference to OMS
     * @param {Object} teamMember - Team member data
     * @returns {Promise<boolean>} Success status
     */
    async saveTeamMemberToFirestore(oms, teamMember) {
        try {
            const user = window.auth.currentUser;
            if (!user) {
                console.error('❌ No user logged in');
                return false;
            }

            await window.db.collection('team').doc(teamMember.id).set({
                ...teamMember,
                updatedBy: user.email,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Team member saved to Firestore:', teamMember.name);
            return true;
        } catch (error) {
            console.error('❌ Error saving team member to Firestore:', error);
            oms.showToast('Failed to sync team member: ' + error.message, 'error');
            return false;
        }
    },

    /**
     * Load team members from Firestore
     * @param {Object} oms - Reference to OMS
     * @returns {Promise<boolean>} Success status
     */
    async loadTeamFromFirestore(oms) {
        try {
            console.log('👷 Loading team from Firestore...');

            const teamSnapshot = await window.db.collection('team')
                .orderBy('createdAt', 'desc')
                .get();

            oms.data.team = [];
            teamSnapshot.forEach(doc => {
                oms.data.team.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${oms.data.team.length} team members from Firestore`);
            return true;
        } catch (error) {
            console.error('❌ Error loading team from Firestore:', error);
            // Try to load from localStorage as fallback
            const saved = localStorage.getItem('oms_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                oms.data.team = parsed.team || [];
                console.log('📦 Loaded team from localStorage backup');
            }
            return false;
        }
    },

    /**
     * Delete team member from Firestore
     * @param {string} teamMemberId - Team member ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteTeamMemberFromFirestore(teamMemberId) {
        try {
            await window.db.collection('team').doc(teamMemberId).delete();
            console.log('✅ Team member deleted from Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error deleting team member from Firestore:', error);
            return false;
        }
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Team = Team;
}
