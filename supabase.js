// ==================== Supabase 配置 ====================
const SUPABASE_URL = 'https://pgphhfqiyqdnlrqurzvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VD3xRTYLl_0CXCz_SR1jHw_17shJsXj';

// 全局 supabase 对象，由 HTML 中的 <script> 标签加载后赋值
// 如果加载失败，这里会保持 undefined，后续代码会优雅降级

// ==================== 通用工具函数 ====================
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const iconMap = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };
    const colorMap = {
        success: 'bg-emerald-100 text-emerald-600',
        error: 'bg-red-100 text-red-600',
        warning: 'bg-amber-100 text-amber-600',
        info: 'bg-blue-100 text-blue-600'
    };
    const iconDiv = toast.querySelector('.w-10, .w-8');
    const iconI = toast.querySelector('i.fas');
    if (iconI) iconI.className = `fas ${iconMap[type]}`;
    if (iconDiv) iconDiv.className = `w-10 h-10 ${colorMap[type]} rounded-full flex items-center justify-center flex-shrink-0`;
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-message').textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function updateTime() {
    const el = document.getElementById('current-time');
    if (el) {
        el.textContent = new Date().toLocaleString('zh-CN', {
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}

// ==================== 检查 Supabase 是否可用 ====================
function isSupabaseReady() {
    return typeof window !== 'undefined' && window.supabase && window.supabase.from;
}

function handleSupabaseError(context, error) {
    console.error(`[Supabase] ${context}:`, error);
    showToast('连接异常', `数据库连接失败 (${context})，使用离线模式`, 'warning');
}

// ==================== 数据加载函数（带降级）====================
async function loadSopTemplates() {
    if (!isSupabaseReady()) { console.warn('Supabase 未加载，使用空数据'); return []; }
    try {
        const { data, error } = await window.supabase.from('sop_templates').select('*').order('id', { ascending: false });
        if (error) { handleSupabaseError('loadSopTemplates', error); return []; }
        return (data || []).map(item => ({...item, steps: item.steps || []}));
    } catch (e) { handleSupabaseError('loadSopTemplates', e); return []; }
}

async function saveSopTemplate(template) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库，数据仅本地有效', 'warning'); return null; }
    try {
        const { data, error } = await window.supabase.from('sop_templates').upsert(template).select();
        if (error) { handleSupabaseError('saveSopTemplate', error); return null; }
        return data?.[0];
    } catch (e) { handleSupabaseError('saveSopTemplate', e); return null; }
}

async function deleteSopTemplate(id) {
    if (!isSupabaseReady()) return false;
    try {
        const { error } = await window.supabase.from('sop_templates').delete().eq('id', id);
        if (error) { handleSupabaseError('deleteSopTemplate', error); return false; }
        return true;
    } catch (e) { handleSupabaseError('deleteSopTemplate', e); return false; }
}

async function loadShifts() {
    if (!isSupabaseReady()) return [];
    try {
        const { data, error } = await window.supabase.from('shifts').select('*').order('id');
        if (error) { handleSupabaseError('loadShifts', error); return []; }
        return (data || []).map(s => ({...s, sop_ids: s.sop_ids || []}));
    } catch (e) { handleSupabaseError('loadShifts', e); return []; }
}

async function saveShift(shift) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const { data, error } = await window.supabase.from('shifts').upsert(shift).select();
        if (error) { handleSupabaseError('saveShift', error); return null; }
        return data?.[0];
    } catch (e) { handleSupabaseError('saveShift', e); return null; }
}

async function deleteShift(id) {
    if (!isSupabaseReady()) return false;
    try {
        const { error } = await window.supabase.from('shifts').delete().eq('id', id);
        if (error) { handleSupabaseError('deleteShift', error); return false; }
        return true;
    } catch (e) { handleSupabaseError('deleteShift', e); return false; }
}

async function loadPersonnel() {
    if (!isSupabaseReady()) return [];
    try {
        const { data, error } = await window.supabase.from('personnel').select('*').order('id');
        if (error) { handleSupabaseError('loadPersonnel', error); return []; }
        return data || [];
    } catch (e) { handleSupabaseError('loadPersonnel', e); return []; }
}

async function savePersonnel(person) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const { data, error } = await window.supabase.from('personnel').upsert(person).select();
        if (error) { handleSupabaseError('savePersonnel', error); return null; }
        return data?.[0];
    } catch (e) { handleSupabaseError('savePersonnel', e); return null; }
}

async function deletePersonnel(id) {
    if (!isSupabaseReady()) return false;
    try {
        const { error } = await window.supabase.from('personnel').delete().eq('id', id);
        if (error) { handleSupabaseError('deletePersonnel', error); return false; }
        return true;
    } catch (e) { handleSupabaseError('deletePersonnel', e); return false; }
}

async function loadSchedules(month, year) {
    if (!isSupabaseReady()) return [];
    try {
        const start = `${year}-${String(month+1).padStart(2,'0')}-01`;
        const end = `${year}-${String(month+1).padStart(2,'0')}-${new Date(year, month+1, 0).getDate()}`;
        const { data, error } = await window.supabase.from('schedules')
            .select('*')
            .gte('date', start).lte('date', end);
        if (error) { handleSupabaseError('loadSchedules', error); return []; }
        return data || [];
    } catch (e) { handleSupabaseError('loadSchedules', e); return []; }
}

async function saveSchedule(schedule) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const { data: existing } = await window.supabase.from('schedules')
            .select('*').eq('person_id', schedule.person_id).eq('date', schedule.date).maybeSingle();
        if (existing) {
            const { data, error } = await window.supabase.from('schedules')
                .update({ shift_id: schedule.shift_id }).eq('id', existing.id).select();
            if (error) { handleSupabaseError('updateSchedule', error); return null; }
            return data?.[0];
        } else {
            const { data, error } = await window.supabase.from('schedules').insert(schedule).select();
            if (error) { handleSupabaseError('saveSchedule', error); return null; }
            return data?.[0];
        }
    } catch (e) { handleSupabaseError('saveSchedule', e); return null; }
}

async function deleteSchedule(personId, date) {
    if (!isSupabaseReady()) return;
    try {
        await window.supabase.from('schedules').delete().eq('person_id', personId).eq('date', date);
    } catch (e) { handleSupabaseError('deleteSchedule', e); }
}

async function loadSopTasks(date) {
    if (!isSupabaseReady()) return [];
    try {
        const { data, error } = await window.supabase.from('sop_tasks')
            .select('*, sop_templates(title, category, steps), personnel(name, avatar, color)')
            .eq('date', date)
            .order('id');
        if (error) { handleSupabaseError('loadSopTasks', error); return []; }
        return (data || []).map(t => ({
            ...t,
            steps: t.steps || [],
            sop_template: t.sop_templates,
            person: t.personnel
        }));
    } catch (e) { handleSupabaseError('loadSopTasks', e); return []; }
}

async function saveSopTask(task) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const { data, error } = await window.supabase.from('sop_tasks').upsert(task).select();
        if (error) { handleSupabaseError('saveSopTask', error); return null; }
        return data?.[0];
    } catch (e) { handleSupabaseError('saveSopTask', e); return null; }
}

async function uploadPhoto(file, taskId, stepIndex) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法上传照片', 'warning'); return null; }
    try {
        const fileName = `task_${taskId}_step_${stepIndex}_${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await window.supabase.storage.from('sop-photos').upload(fileName, file);
        if (error) { handleSupabaseError('uploadPhoto', error); return null; }
        const { data: { publicUrl } } = window.supabase.storage.from('sop-photos').getPublicUrl(fileName);
        return publicUrl;
    } catch (e) { handleSupabaseError('uploadPhoto', e); return null; }
}

// ==================== 生成每日任务 ====================
async function generateDailyTasks(date, force = false) {
    if (!isSupabaseReady()) return [];
    try {
        // 正确解析本地日期，避免时区问题
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript month is 0-based
        const schedules = await loadSchedules(month, year);
        const todaySchedules = schedules.filter(s => s.date === date);
        const shifts = await loadShifts();
        const templates = await loadSopTemplates();

        const existing = await loadSopTasks(date);
        // 如果已有任务且不是强制重新生成，直接返回已有任务
        if (!force && existing.length > 0) return existing;

        // 如果是强制重新生成，先删除已有任务
        if (force && existing.length > 0) {
            for (const task of existing) {
                try { await window.supabase.from('sop_tasks').delete().eq('id', task.id); } catch (e) {}
            }
        }

        const tasks = [];
        for (const sched of todaySchedules) {
            const shift = shifts.find(s => s.id === sched.shift_id);
            if (!shift) continue;
            for (const sopId of (shift.sop_ids || [])) {
                const template = templates.find(t => t.id === sopId);
                if (!template) continue;
                tasks.push({
                    schedule_id: sched.id,
                    sop_template_id: sopId,
                    person_id: sched.person_id,
                    date: date,
                    status: 'pending',
                    steps: (template.steps || []).map(s => ({
                        name: s.name,
                        done: false,
                        photos: [],
                        completed_at: null
                    }))
                });
            }
        }

        for (const task of tasks) {
            await window.supabase.from('sop_tasks').insert(task);
        }
        return await loadSopTasks(date);
    } catch (e) { handleSupabaseError('generateDailyTasks', e); return []; }
}

// ==================== 导航高亮 ====================
function highlightNav(activePage) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active', 'bg-emerald-50', 'text-emerald-700');
        el.classList.add('text-gray-600');
    });
    const nav = document.getElementById(`nav-${activePage}`);
    if (nav) {
        nav.classList.add('active', 'bg-emerald-50', 'text-emerald-700');
        nav.classList.remove('text-gray-600');
    }
}

// 导出到全局（非 ES Module 方式）
window.showToast = showToast;
window.updateTime = updateTime;
window.highlightNav = highlightNav;
window.loadSopTemplates = loadSopTemplates;
window.saveSopTemplate = saveSopTemplate;
window.deleteSopTemplate = deleteSopTemplate;
window.loadShifts = loadShifts;
window.saveShift = saveShift;
window.deleteShift = deleteShift;
window.loadPersonnel = loadPersonnel;
window.savePersonnel = savePersonnel;
window.deletePersonnel = deletePersonnel;
window.loadSchedules = loadSchedules;
window.saveSchedule = saveSchedule;
window.deleteSchedule = deleteSchedule;
window.loadSopTasks = loadSopTasks;
window.saveSopTask = saveSopTask;
window.uploadPhoto = uploadPhoto;
window.generateDailyTasks = generateDailyTasks;
window.isSupabaseReady = isSupabaseReady;
