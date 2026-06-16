// auth.js - 页面权限控制中间件
// 支持两种用户：admins 表（管理员）和 personnel 表（普通用户）

class AuthGuard {
    constructor() {
        this.user = null;
    }

    static PAGE_PERMISSIONS = {
        'index.html': ['admin'],
        'calendar.html': ['admin', 'user'],
        'shift-schedule.html': ['admin'],
        'personnel.html': ['admin'],
        'sop-templates.html': ['admin'],
        'metrics.html': ['admin']
    };

    static NAV_ITEMS = {
        admin: [
            { id: 'index', href: 'index.html', icon: 'fa-chart-pie', label: '数据概览' },
            { id: 'sop-templates', href: 'sop-templates.html', icon: 'fa-list-check', label: 'SOP流程模板' },
            { id: 'shift-schedule', href: 'shift-schedule.html', icon: 'fa-users-gear', label: '排班管理' },
            { id: 'calendar', href: 'calendar.html', icon: 'fa-calendar-days', label: '任务日历' },
            { id: 'personnel', href: 'personnel.html', icon: 'fa-users', label: '人员管理' },
            { id: 'metrics', href: 'metrics.html', icon: 'fa-gauge-high', label: '指标监控' }
        ],
        user: [
            { id: 'calendar', href: 'calendar.html', icon: 'fa-calendar-days', label: '任务日历' }
        ]
    };

    init() {
        // 从 sessionStorage 读取登录态
        const authStr = sessionStorage.getItem('authUser');
        if (!authStr) {
            window.location.href = 'login.html';
            return false;
        }

        try {
            this.user = JSON.parse(authStr);
        } catch (e) {
            sessionStorage.clear();
            window.location.href = 'login.html';
            return false;
        }

        // 验证当前页面权限
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const allowedRoles = AuthGuard.PAGE_PERMISSIONS[currentPage] || [];

        if (!allowedRoles.includes(this.user.role)) {
            // 无权限，跳转到对应角色的首页
            window.location.href = this.user.role === 'admin' ? 'index.html' : 'calendar.html';
            return false;
        }

        this.renderNav();
        this.renderUserInfo();

        return true;
    }

    renderNav() {
        const navContainer = document.querySelector('nav');
        if (!navContainer) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const items = AuthGuard.NAV_ITEMS[this.user.role] || [];
        navContainer.innerHTML = '';

        items.forEach(item => {
            const isActive = currentPage === item.href;
            const a = document.createElement('a');
            a.href = item.href;
            a.target = '_self';
            a.className = `nav-item ${isActive ? 'active bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all`;
            a.innerHTML = `<i class="fas ${item.icon} w-5"></i>${item.label}`;
            navContainer.appendChild(a);
        });

        const changePwdBtn = document.createElement('button');
        changePwdBtn.className = 'nav-item text-gray-600 hover:bg-blue-50 hover:text-blue-600 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-4 border-t border-gray-100 pt-4';
        changePwdBtn.innerHTML = '<i class="fas fa-key w-5"></i>修改密码';
        changePwdBtn.onclick = () => { if (typeof openChangePasswordModal === 'function') openChangePasswordModal(); };
        navContainer.appendChild(changePwdBtn);

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'nav-item text-gray-600 hover:bg-red-50 hover:text-red-600 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt w-5"></i>退出登录';
        logoutBtn.onclick = () => this.logout();
        navContainer.appendChild(logoutBtn);
    }

    renderUserInfo() {
        const userNameEl = document.querySelector('.hidden.md\\:block p:first-child');
        const userDeptEl = document.querySelector('.hidden.md\\:block p:last-child');
        const avatarEl = document.querySelector('.w-9.h-9.bg-emerald-100');

        if (userNameEl) userNameEl.textContent = this.user.name || this.user.username;
        if (userDeptEl) userDeptEl.textContent = this.user.role === 'admin' ? '管理员' : '一般用户';
        if (avatarEl) {
            avatarEl.textContent = this.user.role === 'admin' ? '管' : (this.user.name ? this.user.name.charAt(0) : '员');
            avatarEl.className = `w-9 h-9 ${this.user.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} rounded-full flex items-center justify-center font-bold text-sm`;
        }
    }

    logout() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }

    getCurrentPersonId() {
        return this.user.role === 'user' ? this.user.personId : null;
    }

    isAdmin() {
        return this.user.role === 'admin';
    }

    getUser() {
        return this.user;
    }

    // 过滤数据：普通用户只能看到自己的数据
    filterDataByPermission(data, personIdField = 'person_id') {
        if (this.user.role === 'admin') return data;
        return data.filter(item => item[personIdField] === this.user.personId);
    }
}

const authGuard = new AuthGuard();
window.authGuard = authGuard;
