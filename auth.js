// auth.js - 页面权限控制中间件

class AuthGuard {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.role = null;
        this.personId = null;
    }

    static PAGE_PERMISSIONS = {
        'index.html': ['admin', 'user'],
        'calendar.html': ['admin', 'user'],
        'shift-schedule.html': ['admin'],
        'personnel.html': ['admin'],
        'sop-templates.html': ['admin'],
        'metrics.html': ['admin'],
        'login.html': ['admin', 'user']
    };

    static NAV_ITEMS = [
        { id: 'index', href: 'index.html', icon: 'fa-chart-pie', label: '数据概览', roles: ['admin', 'user'] },
        { id: 'sop-templates', href: 'sop-templates.html', icon: 'fa-list-check', label: 'SOP流程模板', roles: ['admin'] },
        { id: 'shift-schedule', href: 'shift-schedule.html', icon: 'fa-users-gear', label: '排班管理', roles: ['admin'] },
        { id: 'calendar', href: 'calendar.html', icon: 'fa-calendar-days', label: '任务日历', roles: ['admin', 'user'] },
        { id: 'personnel', href: 'personnel.html', icon: 'fa-users', label: '人员管理', roles: ['admin'] },
        { id: 'metrics', href: 'metrics.html', icon: 'fa-gauge-high', label: '指标监控', roles: ['admin'] }
    ];

    async init() {
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(
                'https://pgphhfqiyqdnlrqurzvv.supabase.co',
                'sb_publishable_VD3xRTYLl_0CXCz_SR1jHw_17shJsXj'
            );
        }

        const { data: { session } } = await this.supabase.auth.getSession();

        if (!session) {
            window.location.href = 'login.html';
            return false;
        }

        this.user = session.user;
        this.role = sessionStorage.getItem('userRole') || 'user';
        this.personId = sessionStorage.getItem('personId') || '';

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const allowedRoles = AuthGuard.PAGE_PERMISSIONS[currentPage] || [];

        if (!allowedRoles.includes(this.role)) {
            window.location.href = 'calendar.html';
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
        navContainer.innerHTML = '';

        AuthGuard.NAV_ITEMS.forEach(item => {
            if (!item.roles.includes(this.role)) return;

            const isActive = currentPage === item.href;
            const a = document.createElement('a');
            a.href = item.href;
            a.target = '_self';
            a.className = `nav-item ${isActive ? 'active bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all`;
            a.innerHTML = `<i class="fas ${item.icon} w-5"></i>${item.label}`;
            navContainer.appendChild(a);
        });

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'nav-item text-gray-600 hover:bg-red-50 hover:text-red-600 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-4 border-t border-gray-100 pt-4';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt w-5"></i>退出登录';
        logoutBtn.onclick = () => this.logout();
        navContainer.appendChild(logoutBtn);
    }

    renderUserInfo() {
        const userNameEl = document.querySelector('.hidden.md\\:block p:first-child');
        const userDeptEl = document.querySelector('.hidden.md\\:block p:last-child');
        const avatarEl = document.querySelector('.w-9.h-9.bg-emerald-100');

        if (userNameEl) userNameEl.textContent = sessionStorage.getItem('userName') || '用户';
        if (userDeptEl) userDeptEl.textContent = this.role === 'admin' ? '管理员' : '一般用户';
        if (avatarEl) {
            avatarEl.textContent = this.role === 'admin' ? '管' : '员';
            avatarEl.className = `w-9 h-9 ${this.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} rounded-full flex items-center justify-center font-bold text-sm`;
        }
    }

    async logout() {
        await this.supabase.auth.signOut();
        sessionStorage.clear();
        window.location.href = 'login.html';
    }

    getCurrentPersonId() {
        return this.personId;
    }

    isAdmin() {
        return this.role === 'admin';
    }

    filterDataByPermission(data, personIdField = 'person_id') {
        if (this.role === 'admin') return data;
        return data.filter(item => item[personIdField] === this.personId);
    }
}

const authGuard = new AuthGuard();

window.authGuard = authGuard;
