// supabase.js
// ==================== Supabase 配置 ====================
const SUPABASE_URL = 'https://pgphhfqiyqdnlrqurzvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VD3xRTYLl_0CXCz_SR1jHw_17shJsXj';

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

// ==================== 职位管理 ====================
async function loadPositions() {
    if (!isSupabaseReady()) { console.warn('Supabase 未加载，使用空数据'); return []; }
    try {
        const { data, error } = await window.supabase.from('positions').select('*').order('id');
        if (error) { handleSupabaseError('loadPositions', error); return []; }
        return data || [];
    } catch (e) { handleSupabaseError('loadPositions', e); return []; }
}

async function savePosition(position) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const { data, error } = await window.supabase.from('positions').upsert(position).select();
        if (error) { handleSupabaseError('savePosition', error); return null; }
        return data?.[0];
    } catch (e) { handleSupabaseError('savePosition', e); return null; }
}

async function deletePosition(id) {
    if (!isSupabaseReady()) return false;
    try {
        const { error } = await window.supabase.from('positions').delete().eq('id', id);
        if (error) { handleSupabaseError('deletePosition', error); return false; }
        return true;
    } catch (e) { handleSupabaseError('deletePosition', e); return false; }
}

// ==================== 部门管理 ====================
async function loadDepartments() {
    if (!isSupabaseReady()) { console.warn('Supabase 未加载，使用空数据'); return []; }
    try {
        const { data, error } = await window.supabase.from('departments').select('*').order('id');
        if (error) { handleSupabaseError('loadDepartments', error); return []; }
        return data || [];
    } catch (e) { handleSupabaseError('loadDepartments', e); return []; }
}

async function saveDepartment(department) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const { data, error } = await window.supabase.from('departments').upsert(department).select();
        if (error) { handleSupabaseError('saveDepartment', error); return null; }
        return data?.[0];
    } catch (e) { handleSupabaseError('saveDepartment', e); return null; }
}

async function deleteDepartment(id) {
    if (!isSupabaseReady()) return false;
    try {
        const { error } = await window.supabase.from('departments').delete().eq('id', id);
        if (error) { handleSupabaseError('deleteDepartment', error); return false; }
        return true;
    } catch (e) { handleSupabaseError('deleteDepartment', e); return false; }
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
        // 先查询该排班关联的所有任务，清理图片后再删除排班
        // 避免数据库级联删除 sop_tasks 时跳过了 cleanupTaskPhotos
        const { data: tasks } = await window.supabase
            .from('sop_tasks')
            .select('id')
            .eq('person_id', personId)
            .eq('date', date);

        if (tasks && tasks.length > 0) {
            const taskIds = tasks.map(t => t.id);
            console.log(`[deleteSchedule] 预清理 ${taskIds.length} 个任务的图片...`);
            await cleanupTaskPhotos(taskIds);
        }

        await window.supabase.from('schedules').delete().eq('person_id', personId).eq('date', date);
    } catch (e) { handleSupabaseError('deleteSchedule', e); }
}

async function loadSopTasks(date) {
    if (!isSupabaseReady()) return [];
    try {
        console.log(`[loadSopTasks] 加载 ${date} 的任务...`);
        const { data, error } = await window.supabase.from('sop_tasks')
            .select('*, sop_templates(title, category, steps), personnel(name, avatar, color)')
            .eq('date', date)
            .order('id');
        if (error) { 
            console.error('[loadSopTasks] 错误:', error);
            handleSupabaseError('loadSopTasks', error); 
            return []; 
        }
        console.log(`[loadSopTasks] 加载到 ${(data || []).length} 个任务`);
        return (data || []).map(t => ({
            ...t,
            steps: t.steps || [],
            sop_template: t.sop_templates,
            person: t.personnel
        }));
    } catch (e) { 
        console.error('[loadSopTasks] 异常:', e);
        handleSupabaseError('loadSopTasks', e); 
        return []; 
    }
}

async function saveSopTask(task) {
    if (!isSupabaseReady()) { showToast('离线模式', '无法保存到数据库', 'warning'); return null; }
    try {
        const cleanTask = {
            id: task.id,
            schedule_id: task.schedule_id,
            sop_template_id: task.sop_template_id,
            person_id: task.person_id,
            date: task.date,
            status: task.status,
            steps: task.steps,
            completed_at: task.completed_at
        };
        Object.keys(cleanTask).forEach(key => {
            if (cleanTask[key] === undefined) delete cleanTask[key];
        });

        const { data, error } = await window.supabase.from('sop_tasks').upsert(cleanTask).select();
        if (error) { 
            console.error('[saveSopTask] 错误:', error);
            handleSupabaseError('saveSopTask', error); 
            return null; 
        }
        return data?.[0];
    } catch (e) { 
        console.error('[saveSopTask] 异常:', e);
        handleSupabaseError('saveSopTask', e); 
        return null; 
    }
}

// ==================== 删除 SOP 任务 ====================
async function deleteSopTask(id) {
    if (!isSupabaseReady()) return false;
    try {
        const { error } = await window.supabase.from('sop_tasks').delete().eq('id', id);
        if (error) { 
            console.error('[deleteSopTask] 错误:', error);
            handleSupabaseError('deleteSopTask', error); 
            return false; 
        }
        return true;
    } catch (e) { 
        console.error('[deleteSopTask] 异常:', e);
        handleSupabaseError('deleteSopTask', e); 
        return false; 
    }
}

// ==================== 清理任务关联图片 ====================
async function cleanupTaskPhotos(taskIds) {
    if (!isSupabaseReady() || !taskIds || taskIds.length === 0) return;
    try {
        const { data: photos, error: photoError } = await window.supabase
            .from('task_photos')
            .select('id, photo_url')
            .in('task_id', taskIds);

        if (photoError) {
            console.error('[cleanupTaskPhotos] 查询照片失败:', photoError);
            return;
        }

        if (photos && photos.length > 0) {
            for (const photo of photos) {
                try {
                    const urlObj = new URL(photo.photo_url);
                    const pathMatch = urlObj.pathname.match(/\/sop-photos\/(.+)/);
                    if (pathMatch) {
                        await window.supabase.storage.from('sop-photos').remove([pathMatch[1]]);
                    }
                } catch (storageErr) {
                    console.warn('[cleanupTaskPhotos] 删除 storage 图片失败:', storageErr);
                }
            }

            const { error: delPhotoError } = await window.supabase
                .from('task_photos')
                .delete()
                .in('task_id', taskIds);

            if (delPhotoError) {
                console.error('[cleanupTaskPhotos] 删除照片记录失败:', delPhotoError);
            } else {
                console.log(`[cleanupTaskPhotos] 已清理 ${photos.length} 张图片`);
            }
        }
    } catch (e) {
        console.error('[cleanupTaskPhotos] 异常:', e);
    }
}

// ==================== 生成每日任务（修复版）====================
async function generateDailyTasks(date, force = false) {
    if (!isSupabaseReady()) {
        console.warn('[generateDailyTasks] Supabase 未就绪，跳过任务生成');
        return [];
    }
    try {
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;

        console.log(`[generateDailyTasks] 开始处理 ${date} 的任务...`);

        const schedules = await loadSchedules(month, year);
        console.log(`[generateDailyTasks] 加载到 ${schedules.length} 条排班记录`);

        const todaySchedules = schedules.filter(s => s.date === date);
        console.log(`[generateDailyTasks] 当日排班: ${todaySchedules.length} 条`);

        const shifts = await loadShifts();
        console.log(`[generateDailyTasks] 加载到 ${shifts.length} 个班次`);

        const templates = await loadSopTemplates();
        console.log(`[generateDailyTasks] 加载到 ${templates.length} 个 SOP 模板`);

        let existing = await loadSopTasks(date);
        console.log(`[generateDailyTasks] 已有任务: ${existing.length} 个`);

        // 构建期望的任务集合：schedule_id + sop_template_id
        const expectedKeys = new Set();
        for (const sched of todaySchedules) {
            const shift = shifts.find(s => s.id === sched.shift_id);
            if (!shift) continue;
            const sopIds = shift.sop_ids || [];
            for (const sopId of sopIds) {
                expectedKeys.add(`${sched.id}-${sopId}`);
            }
        }
        console.log(`[generateDailyTasks] 期望任务数: ${expectedKeys.size}`);

        // 清理不再有效的任务（排班删除或班次变更导致SOP不匹配）
        const tasksToDelete = [];
        for (const task of existing) {
            const key = `${task.schedule_id}-${task.sop_template_id}`;
            if (!expectedKeys.has(key)) {
                tasksToDelete.push(task.id);
                console.log(`[generateDailyTasks] 标记删除旧任务: task=${task.id}, key=${key}`);
            }
        }

        if (tasksToDelete.length > 0) {
            await cleanupTaskPhotos(tasksToDelete);
            console.log(`[generateDailyTasks] 删除 ${tasksToDelete.length} 个无效任务...`);
            const { error: delError } = await window.supabase.from('sop_tasks').delete().in('id', tasksToDelete);
            if (delError) {
                console.error('[generateDailyTasks] 删除旧任务失败:', delError);
            } else {
                console.log('[generateDailyTasks] 旧任务已删除');
                existing = existing.filter(t => !tasksToDelete.includes(t.id));
            }
        }

        // 生成新增的任务
        const existingKeys = new Set(existing.map(t => `${t.schedule_id}-${t.sop_template_id}`));
        const tasks = [];

        for (const sched of todaySchedules) {
            const shift = shifts.find(s => s.id === sched.shift_id);
            if (!shift) {
                console.warn(`[generateDailyTasks] 排班 ${sched.id} 未找到对应班次 ${sched.shift_id}`);
                continue;
            }

            const sopIds = shift.sop_ids || [];
            if (sopIds.length === 0) {
                console.warn(`[generateDailyTasks] 班次 ${shift.name} 未关联 SOP 模板，跳过`);
                continue;
            }

            for (const sopId of sopIds) {
                const key = `${sched.id}-${sopId}`;

                if (existingKeys.has(key)) {
                    console.log(`[generateDailyTasks] 任务已存在: schedule=${sched.id}, sop=${sopId}`);
                    continue;
                }

                const template = templates.find(t => t.id === sopId);
                if (!template) {
                    console.warn(`[generateDailyTasks] 未找到 SOP 模板 ${sopId}`);
                    continue;
                }
                console.log(`[generateDailyTasks] 生成新任务: ${template.title}`);
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

        console.log(`[generateDailyTasks] 将插入 ${tasks.length} 个新任务`);

        for (const task of tasks) {
            const { data, error } = await window.supabase.from('sop_tasks').insert(task).select();
            if (error) {
                console.error(`[generateDailyTasks] 插入任务失败:`, error);
            } else {
                console.log(`[generateDailyTasks] 任务插入成功:`, data?.[0]?.id);
            }
        }

        const result = await loadSopTasks(date);
        console.log(`[generateDailyTasks] 完成，最终任务数: ${result.length}`);
        return result;
    } catch (e) { 
        console.error('[generateDailyTasks] 异常:', e);
        handleSupabaseError('generateDailyTasks', e); 
        return []; 
    }
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

// 导出到全局
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
window.deleteSopTask = deleteSopTask;
window.cleanupTaskPhotos = cleanupTaskPhotos;
window.generateDailyTasks = generateDailyTasks;
window.isSupabaseReady = isSupabaseReady;
window.loadPositions = loadPositions;
window.savePosition = savePosition;
window.deletePosition = deletePosition;
window.loadDepartments = loadDepartments;
window.saveDepartment = saveDepartment;
window.deleteDepartment = deleteDepartment;
