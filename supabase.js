// ==================== Supabase 配置 ====================
const SUPABASE_URL = 'https://pgphhfqiyqdnlrqurzvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VD3xRTYLl_0CXCz_SR1jHw_17shJsXj';

let supabase;
try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error('Supabase 初始化失败:', e);
}

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
    toast.querySelector('i').className = `fas ${iconMap[type]}`;
    toast.querySelector('.w-10').className = `w-10 h-10 ${colorMap[type]} rounded-full flex items-center justify-center flex-shrink-0`;
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

// ==================== 数据加载函数 ====================
async function loadSopTemplates() {
    const { data, error } = await supabase.from('sop_templates').select('*').order('id', { ascending: false });
    if (error) { console.error('loadSopTemplates error:', error); return []; }
    return data.map(item => ({...item, steps: item.steps || []}));
}

async function saveSopTemplate(template) {
    const { data, error } = await supabase.from('sop_templates').upsert(template).select();
    if (error) { console.error('saveSopTemplate error:', error); return null; }
    return data?.[0];
}

async function deleteSopTemplate(id) {
    const { error } = await supabase.from('sop_templates').delete().eq('id', id);
    if (error) console.error('deleteSopTemplate error:', error);
    return !error;
}

async function loadShifts() {
    const { data, error } = await supabase.from('shifts').select('*').order('id');
    if (error) { console.error('loadShifts error:', error); return []; }
    return data.map(s => ({...s, sop_ids: s.sop_ids || []}));
}

async function saveShift(shift) {
    const { data, error } = await supabase.from('shifts').upsert(shift).select();
    if (error) { console.error('saveShift error:', error); return null; }
    return data?.[0];
}

async function deleteShift(id) {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) console.error('deleteShift error:', error);
    return !error;
}

async function loadPersonnel() {
    const { data, error } = await supabase.from('personnel').select('*').order('id');
    if (error) { console.error('loadPersonnel error:', error); return []; }
    return data;
}

async function savePersonnel(person) {
    const { data, error } = await supabase.from('personnel').upsert(person).select();
    if (error) { console.error('savePersonnel error:', error); return null; }
    return data?.[0];
}

async function deletePersonnel(id) {
    const { error } = await supabase.from('personnel').delete().eq('id', id);
    if (error) console.error('deletePersonnel error:', error);
    return !error;
}

async function loadSchedules(month, year) {
    const start = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const end = `${year}-${String(month+1).padStart(2,'0')}-${new Date(year, month+1, 0).getDate()}`;
    const { data, error } = await supabase.from('schedules')
        .select('*, shifts(*)')
        .gte('date', start).lte('date', end);
    if (error) { console.error('loadSchedules error:', error); return []; }
    return data;
}

async function saveSchedule(schedule) {
    const { data: existing } = await supabase.from('schedules')
        .select('*').eq('person_id', schedule.person_id).eq('date', schedule.date).maybeSingle();
    if (existing) {
        const { data, error } = await supabase.from('schedules')
            .update({ shift_id: schedule.shift_id }).eq('id', existing.id).select();
        if (error) console.error('updateSchedule error:', error);
        return data?.[0];
    } else {
        const { data, error } = await supabase.from('schedules').insert(schedule).select();
        if (error) console.error('saveSchedule error:', error);
        return data?.[0];
    }
}

async function deleteSchedule(personId, date) {
    await supabase.from('schedules').delete().eq('person_id', personId).eq('date', date);
}

async function loadSopTasks(date) {
    const { data, error } = await supabase.from('sop_tasks')
        .select('*, sop_templates(title, category, steps), personnel(name, avatar, color)')
        .eq('date', date)
        .order('id');
    if (error) { console.error('loadSopTasks error:', error); return []; }
    return data.map(t => ({
        ...t,
        steps: t.steps || [],
        sop_template: t.sop_templates,
        person: t.personnel
    }));
}

async function saveSopTask(task) {
    const { data, error } = await supabase.from('sop_tasks').upsert(task).select();
    if (error) { console.error('saveSopTask error:', error); return null; }
    return data?.[0];
}

async function uploadPhoto(file, taskId, stepIndex) {
    const fileName = `task_${taskId}_step_${stepIndex}_${Date.now()}.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage.from('sop-photos').upload(fileName, file);
    if (error) { console.error('uploadPhoto error:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('sop-photos').getPublicUrl(fileName);
    return publicUrl;
}

// ==================== 生成每日任务 ====================
async function generateDailyTasks(date) {
    const schedules = await loadSchedules(new Date(date).getMonth(), new Date(date).getFullYear());
    const todaySchedules = schedules.filter(s => s.date === date);
    const shifts = await loadShifts();
    const templates = await loadSopTemplates();

    const existing = await loadSopTasks(date);
    if (existing.length > 0) return existing;

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
        await supabase.from('sop_tasks').insert(task);
    }
    return await loadSopTasks(date);
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

export {
    supabase, showToast, updateTime, highlightNav,
    loadSopTemplates, saveSopTemplate, deleteSopTemplate,
    loadShifts, saveShift, deleteShift,
    loadPersonnel, savePersonnel, deletePersonnel,
    loadSchedules, saveSchedule, deleteSchedule,
    loadSopTasks, saveSopTask, uploadPhoto, generateDailyTasks
};
