// Fake Internal Database (with LocalStorage Persistence)
let DB = localStorage.getItem('medtrack_DB') ? JSON.parse(localStorage.getItem('medtrack_DB')) : {
    patients: [
        {
            id: '1122', name: 'أحمد محمود', disease: 'السكري', state: 'مستقر', specialtyNeeded: 'باطنة',
            history: 'دخول طوارئ 1/1/2026 وعملية ناجحة', previousPlans: [],
            hasAllergies: true, allergyTypes: 'البنسلين ومسكنات قوية',
            doctorId: '9988', hospId: 'hosp001', phone: '201011111111', guardianContact: '201122334455',
            age: '45', governorate: 'القاهرة', city: 'مدينة نصر', coverImg: 'logo.jpg',
            homeCarePlan: [{ id: 'task1', time: '08:00 صباحاً', task: 'قياس سكر وضغط', status: 'مكتمل' }],
            hospitalCarePlan: [{ id: 'htask1', time: '09:00 صباحاً', task: 'تحليل دم شامل', status: 'مكتمل' }],
            postCarePlan: [{ id: 'ptask1', time: 'يومياً بالتزام', task: 'مشي 20 دقيقة', status: 'لم يكتمل بعد' }],
            drNotes: [{ drName: 'د. محمود سعيد', date: 'توصيات حديثة', text: 'يرجى الاستمرار على العلاج والمحافظة على الوجبات.' }],
            adminNotes: []
        },
        {
            id: '3456', name: 'سناء محمد', disease: 'ضغط دم', state: 'حرج', specialtyNeeded: 'قلب',
            history: 'أزمة قلبية سابقة', previousPlans: [],
            hasAllergies: false, allergyTypes: '',
            doctorId: '9988', hospId: 'hosp001', phone: '201022222222', guardianContact: '',
            age: '55', governorate: 'الجيزة', city: 'الدقي', coverImg: 'logo.jpg',
            homeCarePlan: [],
            hospitalCarePlan: [{ id: 'htask2', time: 'كل 4 ساعات', task: 'متابعة وريدية وعلامات حيوية', status: 'لم يكتمل بعد' }],
            postCarePlan: [], drNotes: [], adminNotes: []
        }
    ],
    doctors: [
        {
            id: '9988', name: 'د. محمود سعيد', specialty: 'باطنة وجهاز هضمي', code: '1234', hospId: 'hosp001',
            pastPatients: [], availability: ['الإثنين: 10:00 ص - 02:00 م', 'الأربعاء: 04:00 م - 08:00 م'],
            developerNotes: ['الرجاء الالتزام بإرسال التقارير.'], phone: '201011111111'
        }
    ],
    hospitals: [
        { id: 'hosp001', name: 'مستشفى الشفاء التخصصي', phone: '201022222222', developerNotes: [] }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const adminDashboardScreen = document.getElementById('admin-dashboard-screen');
    const doctorDashboardScreen = document.getElementById('doctor-dashboard-screen');
    const hospitalDashboardScreen = document.getElementById('hospital-dashboard-screen');
    const globalCornerMenu = document.getElementById('global-corner-menu');

    const logoutBtns = document.querySelectorAll('.logout-btn');
    let currentLoginRole = localStorage.getItem('medtrack_role') || null;
    let loggedInUserId = localStorage.getItem('medtrack_uid') || null;

    setTimeout(() => { // Session Auto-Restore Feature
        if (currentLoginRole === 'developer') {
            if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
            showScreen(adminDashboardScreen); renderAdminDashboard();
        } else if (currentLoginRole === 'hospital') {
            loggedInUserId = 'hosp001';
            if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
            showScreen(hospitalDashboardScreen); renderHospitalDashboard();
        } else if (currentLoginRole === 'doctor') {
            if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
            showScreen(doctorDashboardScreen); renderDoctorDashboard();
        } else if (currentLoginRole === 'patient') {
            const i = document.getElementById('patient-code-input');
            const b = document.getElementById('patient-login-btn');
            if (i && b) { i.value = loggedInUserId; b.click(); }
        }
    }, 50);

    const cornerMenuBtn = document.getElementById('corner-menu-btn');
    const cornerMenuDropdown = document.getElementById('corner-menu-dropdown');

    if (cornerMenuBtn && cornerMenuDropdown) {
        cornerMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cornerMenuDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
            if (!cornerMenuDropdown.classList.contains('hidden')) cornerMenuDropdown.classList.add('hidden');
        });
    }

    const loginModal = document.getElementById('login-modal');
    const modalSecretCode = document.getElementById('modal-secret-code');
    const modalLoginBtn = document.getElementById('modal-login-btn');

    window.openLoginModal = (role) => {
        currentLoginRole = role;
        if (role === 'developer') {
            if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
            showScreen(adminDashboardScreen);
            renderAdminDashboard();
            return;
        } else if (role === 'hospital') {
            if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
            loggedInUserId = 'hosp001';
            showScreen(hospitalDashboardScreen);
            renderHospitalDashboard();
            return;
        }
        loginModal.classList.remove('hidden');
        document.getElementById('modal-title').innerText = 'تسجيل دخول الطبيب';
        modalSecretCode.value = '';
        modalSecretCode.focus();
        cornerMenuDropdown.classList.add('hidden');
    };

    window.closeLoginModal = () => { loginModal.classList.add('hidden'); currentLoginRole = null; };

    if (modalLoginBtn) modalLoginBtn.addEventListener('click', performModalLogin);
    if (modalSecretCode) modalSecretCode.addEventListener('keypress', (e) => { if (e.key === 'Enter') performModalLogin(); });

    function performModalLogin() {
        if (!currentLoginRole) return;
        const code = modalSecretCode.value.trim();
        if (code === '') return alert('يرجى إدخال الكود السري');

        if (currentLoginRole === 'doctor') {
            const doc = DB.doctors.find(d => d.code === code);
            if (doc) {
                loggedInUserId = doc.id;
                closeLoginModal();
                if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
                showScreen(doctorDashboardScreen);
                renderDoctorDashboard();
            } else alert('كود الطبيب غير صحيح.');
        }
    }

    const patientCodeInput = document.getElementById('patient-code-input');
    const patientLoginBtn = document.getElementById('patient-login-btn');
    const displayCode = document.getElementById('display-code');
    const displayDoctor = document.getElementById('display-doctor-info');
    const patientGreeting = document.getElementById('patient-greeting');

    if (patientLoginBtn) {
        patientLoginBtn.addEventListener('click', () => {
            const code = patientCodeInput.value.trim();
            const pat = DB.patients.find(p => p.id === code);
            if (pat) {
                loggedInUserId = pat.id;
                if (displayCode) displayCode.innerText = pat.id;

                const doc = DB.doctors.find(d => d.id === pat.doctorId);
                if (patientGreeting) {
                    patientGreeting.innerText = `مرحبا ${pat.name}، سيقوم ${doc ? doc.name : 'طبيب التخصص'} بتقديم الرعاية اللازمة لك.`;
                }

                if (displayDoctor && doc) {
                    displayDoctor.innerHTML = `<span style="cursor:pointer; text-decoration:underline; font-size:0.9rem;" onclick="popupDoctorAvail('${doc.id}')">مواعيد التواجد للطبيب المختص</span>`;
                }

                // Update Cover Image for patient
                const coverImg = document.getElementById('patient-cover-img');
                if (coverImg && pat.coverImg) coverImg.src = pat.coverImg;

                if (globalCornerMenu) globalCornerMenu.classList.add('hidden');
                showScreen(dashboardScreen);
                renderPatientDashboard(pat.id);
            } else alert('كود مريض غير مقيد بالنظام.');
        });
    }

    const coverInput = document.getElementById('cover-img-upload');
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    document.getElementById('patient-cover-img').src = ev.target.result;
                    const pat = DB.patients.find(p => p.id === loggedInUserId);
                    if (pat) { pat.coverImg = ev.target.result; alert('تم تغيير صورة الغلاف بنجاح'); }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const docCoverInput = document.getElementById('doc-cover-img-upload');
    if (docCoverInput) {
        docCoverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = document.getElementById('doctor-cover-img');
                    if (img) img.src = ev.target.result;
                    alert('تم تغيير غلاف الطبيب بنجاح للواجهة الحالية'); // Just front-end simulation
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const dynamicModal = document.getElementById('dynamic-glass-modal');
    const dynamicModalContent = document.getElementById('dynamic-modal-content');

    window.openDynamicModal = (htmlContent) => {
        dynamicModalContent.innerHTML = htmlContent;
        dynamicModal.classList.remove('hidden');
    };
    window.closeDynamicModal = () => { dynamicModal.classList.add('hidden'); dynamicModalContent.innerHTML = ''; };

    // Package Registration specific
    window.openPackageDataModal = (pkgName) => {
        const html = `
            <div style="text-align:right;">
                <h3 style="color:var(--primary); margin-bottom:15px;"><i class="fa-solid fa-file-signature"></i> استمارة الاشتراك: ${pkgName}</h3>
                <div class="form-group"><label>الاسم الكامل</label><input type="text" id="pkg-name"></div>
                <div class="form-row">
                    <div class="form-group"><label>السن</label><input type="number" id="pkg-age"></div>
                    <div class="form-group"><label>المحافظة</label><input type="text" id="pkg-gov"></div>
                    <div class="form-group"><label>المدينة</label><input type="text" id="pkg-city"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>رقم التواصل الواتساب</label><input type="text" id="pkg-phone"></div>
                    <div class="form-group"><label>رقم ولي الأمر (اختياري)</label><input type="text" id="pkg-guardian"></div>
                </div>
                <div class="form-group"><label>هل تعاني من حساسية؟ (اختياري)</label><input type="text" id="pkg-allergy" placeholder="اذكر التفاصيل إن وجدت..."></div>
                <button class="btn btn-whatsapp" onclick="submitPackageForm('${pkgName}')" style="width:100%; justify-content:center; padding:15px; font-size:1.1rem;"><i class="fa-brands fa-whatsapp"></i> تحويل وحفظ البيانات</button>
            </div>
        `;
        openDynamicModal(html);
    };

    window.submitPackageForm = (pkgName) => {
        const name = document.getElementById('pkg-name').value;
        const phone = document.getElementById('pkg-phone').value;
        if (!name || !phone) return alert('برجاء كتابة الاسم ورقم التواصل على الأقل');

        let msg = `مرحباً، أود الاشتراك في ${pkgName}%0A`;
        msg += `الاسم: ${name}%0A`;
        msg += `السن: ${document.getElementById('pkg-age').value}%0A`;
        msg += `المحافظة/المدينة: ${document.getElementById('pkg-gov').value} / ${document.getElementById('pkg-city').value}%0A`;
        msg += `الرقم: ${phone}%0A`;
        msg += `ولي الأمر: ${document.getElementById('pkg-guardian').value}%0A`;
        msg += `تاريخ الحساسية: ${document.getElementById('pkg-allergy').value}`;

        closeDynamicModal();
        window.open(`https://wa.me/201035919821?text=${msg}`, '_blank');
    };

    window.requestNotification = () => {
        if (!("Notification" in window)) alert("متصفحك الحالي لا يدعم إشعارات النظام.");
        else if (Notification.permission === "granted") {
            const n = new Notification('MedTrack', { body: 'تمت مزامنة الإشعارات والربط مع الهاتف مسبقاً بنجاح!' });
            setTimeout(() => n.close(), 3000);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") new Notification('MedTrack', { body: 'تم تفعيل ربط إشعارات الهاتف بنجاح!' });
            });
        }
    };

    window.popupDoctorAvail = (docId) => {
        const doc = DB.doctors.find(d => d.id === docId);
        if (!doc) return;
        const html = `<div style="text-align:center;"><h2 style="color:var(--primary); margin-bottom:20px;">مواعيد تواجد ${doc.name}</h2>
            <div class="glass-card" style="padding:20px;">
                <ul style="list-style:none; padding:0; font-size:1.1rem; line-height:2;">
                    ${doc.availability.map(v => `<li><i class="fa-regular fa-clock" style="color:var(--secondary);"></i> ${v}</li>`).join('')}
                </ul>
            </div></div>`;
        openDynamicModal(html);
    };

    window.patientFilterDocs = () => {
        const spec = document.getElementById('pat-dash-spec').value;
        const docSel = document.getElementById('pat-dash-doc');
        if (!docSel) return;
        const docs = DB.doctors.filter(d => spec === '' || d.specialty === spec);
        docSel.innerHTML = '<option value="">اختر الطبيب المتوفر...</option>' + docs.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    };

    window.savePatientDoctor = () => {
        const pat = DB.patients.find(x => x.id === loggedInUserId);
        const spec = document.getElementById('pat-dash-spec').value;
        const docId = document.getElementById('pat-dash-doc').value;
        if (!pat || !spec || !docId) return alert('الرجاء اختيار القسم والطبيب أولاً');
        pat.specialtyNeeded = spec;
        pat.doctorId = docId;
        alert('تم تأكيد الاختيار.. يمكنك الآن التواصل مع طبيبك!');

        // Update greeting
        const doc = DB.doctors.find(d => d.id === docId);
        const patientGreeting = document.getElementById('patient-greeting');
        const displayDoctor = document.getElementById('display-doctor-info');
        if (patientGreeting && doc) {
            patientGreeting.innerText = `مرحبا ${pat.name}، سيقوم ${doc.name} بتقديم الرعاية لك.`;
        }
        if (displayDoctor && doc) {
            displayDoctor.innerHTML = `<span style="cursor:pointer; text-decoration:underline; font-size:0.9rem; color:var(--primary-light);" onclick="popupDoctorAvail('${doc.id}')">عرض مواعيد عمل (${doc.name})</span>`;
        }
        renderPatientDashboard(pat.id);
    };

    function renderPatientDashboard(id) {
        const p = DB.patients.find(x => x.id === id);
        if (!p) return;

        const renderStatus = (s) => `<span class="status ${s === 'مكتمل' ? 'completed' : 'pending'}">${s}</span>`;

        const specSel = document.getElementById('pat-dash-spec');
        if (specSel) {
            const specs = [...new Set(DB.doctors.map(d => d.specialty))];
            specSel.innerHTML = '<option value="">اختر القسم...</option>' + specs.map(s => `<option value="${s}" ${s === p.specialtyNeeded ? 'selected' : ''}>${s}</option>`).join('');
            patientFilterDocs();
            if (p.doctorId) {
                const docSel = document.getElementById('pat-dash-doc');
                if (docSel) docSel.value = p.doctorId;
            }
        }

        const notesContainer = document.getElementById('patient-dr-notes');
        if (notesContainer) {
            let notesHTML = '';
            if (p.drNotes.length) {
                notesHTML += p.drNotes.map(n => `
                    <div class="note-item">
                        <div class="note-meta"><span class="dr-name"><i class="fa-solid fa-user-md"></i> ${n.drName}</span><span class="note-date">${n.date}</span></div>
                        <div class="note-body"><p>${n.text}</p></div>
                    </div>`).join('');
            }
            if (p.adminNotes.length) {
                notesHTML += p.adminNotes.map(n => `
                    <div class="note-item" style="background:rgba(234, 179, 8, 0.1); border-right-color:var(--warning);">
                        <div class="note-meta text-main"><span class="dr-name"><i class="fa-solid fa-crown"></i> الإدارة ومسؤول النظام</span><span class="note-date">تعليم جديد</span></div>
                        <div class="note-body"><p>${n}</p></div>
                    </div>`).join('');
            }
            notesContainer.innerHTML = notesHTML || '<p class="text-center" style="padding:20px;">لا توجد ملاحظات طبية أو إدارية حالياً.</p>';
        }

        const docObj = DB.doctors.find(d => d.id === p.doctorId);
        const drWaBtn = document.getElementById('patient-dr-wa-btn');
        if (drWaBtn && docObj && docObj.phone) drWaBtn.href = `https://wa.me/${docObj.phone}?text=MedTrack: أود التواصل مع الطبيب بخصوص حالتي`;

        const hcContainer = document.getElementById('patient-homecare-table');
        if (hcContainer) {
            hcContainer.innerHTML = p.homeCarePlan.length ? p.homeCarePlan.map(n => `
                <tr><td>${n.time}</td><td>${n.task}</td><td>${renderStatus(n.status)}</td></tr>
            `).join('') : '<tr><td colspan="3" class="text-center">لا توجد مسارات مسجلة للمنزل</td></tr>';
        }

        const hospContainer = document.getElementById('patient-hospital-timeline');
        if (hospContainer) {
            hospContainer.innerHTML = p.hospitalCarePlan.length ? p.hospitalCarePlan.map(n => `
                <div class="timeline-item"><div class="time">${n.time}</div>
                <div class="task-det"><h4>${n.task}</h4><p>الحالة: ${renderStatus(n.status)}</p></div></div>
            `).join('') : '<p>لا توجد مسارات مسجلة للمستشفى.</p>';
        }

        const pcContainer = document.getElementById('patient-postcare-table');
        if (pcContainer) {
            pcContainer.innerHTML = p.postCarePlan.length ? p.postCarePlan.map(n => `
                <tr><td>${n.time}</td><td>${n.task}</td><td>${renderStatus(n.status)}</td></tr>
            `).join('') : '<tr><td colspan="3" class="text-center">لا توجد مهام للمتابعة</td></tr>';
        }
    }

    const requestCareForm = document.getElementById('care-request-form');
    if (requestCareForm) requestCareForm.addEventListener('submit', (e) => { e.preventDefault(); /* ... */ });

    // Doctor Dashboard
    function renderDoctorDashboard() {
        const d = DB.doctors.find(x => x.id === loggedInUserId);
        if (!d) return;

        const docGreeting = document.getElementById('doc-greeting');
        const docSpecialty = document.getElementById('doc-specialty-display');
        if (docGreeting) docGreeting.innerText = `مرحباً د. ${d.name}`;
        if (docSpecialty) docSpecialty.innerText = d.specialty;

        const patTable = document.getElementById('doc-patients-table-body');
        if (patTable) {
            const drPatients = DB.patients.filter(p => p.doctorId === d.id);
            if (drPatients.length > 0) {
                patTable.innerHTML = drPatients.map(p => {
                    const latestDate = p.drNotes.length > 0 ? p.drNotes[0].date : 'لم يتم البدء';
                    return `<tr><td>${p.name}</td><td>${latestDate}</td><td><span class="status ${p.state === 'مستقر' ? 'completed' : 'pending'}">${p.state}</span></td></tr>`;
                }).join('');
            } else {
                patTable.innerHTML = '<tr><td colspan="3" style="text-align:center;">لا يوجد مرضى مقيدين حالياً لهذا التخصص.</td></tr>';
            }
        }

        const availContainer = document.getElementById('doctor-availability-list');
        if (availContainer) availContainer.innerHTML = d.availability.length ? d.availability.map(a => `<div class="note-item" style="margin-bottom:10px; border-right:4px solid var(--primary); padding:10px;"><div style="font-weight:bold;"><i class="fa-regular fa-clock"></i> ${a}</div></div>`).join('') : '<p>لم يتم تسجيل أوقات.</p>';

        const devNotesContainer = document.getElementById('doctor-dev-notes-list');
        if (devNotesContainer) devNotesContainer.innerHTML = d.developerNotes.length ? d.developerNotes.map(n => `<div class="note-item" style="background:rgba(234, 179, 8, 0.1); border-right:4px solid var(--warning); margin-bottom:15px;"><div style="font-weight:bold; color:var(--text-main); margin-bottom:5px;"><i class="fa-solid fa-user-shield"></i> تعليم إداري:</div><div>${n}</div></div>`).join('') : '<p>لا توجد تعليمات.</p>';
    }

    const docReportForm = document.getElementById('doctor-report-form');
    if (docReportForm) docReportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pid = document.getElementById('doc-patient-code').value.trim();
        const note = document.getElementById('doc-patient-note').value.trim();
        const p = DB.patients.find(x => x.id === pid);
        if (!p) return alert('كود غير متوفر!');
        p.drNotes.unshift({ drName: DB.doctors.find(x => x.id === loggedInUserId).name, date: new Date().toLocaleDateString(), text: note });
        alert(`تم الإرسال بنجاح`); docReportForm.reset();
    });

    // Unified CRUD logic
    const renderTable = (items, cols, actionHtmlFn) => {
        if (!items || !items.length) return '<p>لايوجد بينات.</p>';
        let html = `<table style="width:100%; text-align:right;"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}<th>إجراء</th></tr></thead><tbody>`;
        html += items.map(itr => `<tr>${actionHtmlFn(itr)}</tr>`).join('');
        return html + '</tbody></table>';
    };

    window.deletePatient = (id) => {
        if (confirm('هل أنت متأكد من حذف المريض بالكامل من المنظومة؟')) {
            DB.patients = DB.patients.filter(x => x.id !== id);
            renderAdminDashboard(); alert('تم الحذف'); closeDynamicModal();
        }
    };
    window.deleteDoctor = (id) => {
        if (confirm('هل أنت متأكد من حذف الطبيب؟')) { DB.doctors = DB.doctors.filter(x => x.id !== id); renderAdminDashboard(); }
    };
    window.deleteHospital = (id) => {
        if (confirm('هل متأكد من حذف المشفى؟')) { DB.hospitals = DB.hospitals.filter(x => x.id !== id); renderAdminDashboard(); }
    };

    window.renderAdminDashboard = () => {
        document.getElementById('admin-patient-count').innerText = `إجمالي المرضى: ${DB.patients.length}`;
        document.getElementById('admin-patient-list').innerHTML = renderTable(DB.patients, ['الكود', 'الاسم', 'الحالة'], p => `
            <td>${p.id}</td><td>${p.name}</td><td>${p.state}</td>
            <td>
                <button class="btn btn-primary" style="padding:5px 10px; font-size:0.9rem;" onclick="openUnifiedPatientModal('${p.id}', 'admin')">عرض وتعديل</button>
                <button class="btn btn-danger-outline" style="padding:5px 10px; font-size:0.9rem;" onclick="deletePatient('${p.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `);

        document.getElementById('admin-doctor-count').innerText = `إجمالي الأطباء: ${DB.doctors.length}`;
        document.getElementById('admin-doctor-list').innerHTML = renderTable(DB.doctors, ['الطبيب', 'الكود', 'التخصص'], d => `
            <td>${d.name}</td><td>${d.code}</td><td>${d.specialty}</td>
            <td><button class="btn btn-danger-outline" style="padding:5px 10px; font-size:0.9rem;" onclick="deleteDoctor('${d.id}')"><i class="fa-solid fa-trash"></i></button></td>
        `);

        const hContainer = document.getElementById('admin-hospital-list');
        if (hContainer) hContainer.innerHTML = renderTable(DB.hospitals, ['المستشفى', 'الكود'], h => `
            <td>${h.name}</td><td>${h.id}</td>
            <td><button class="btn btn-danger-outline" style="padding:5px 10px; font-size:0.9rem;" onclick="deleteHospital('${h.id}')"><i class="fa-solid fa-trash"></i></button></td>
        `);

    };

    window.adminAddNewPatient = () => {
        const name = document.getElementById('add-pat-name').value;
        const code = document.getElementById('add-pat-code').value;
        const phone = document.getElementById('add-pat-phone').value;
        const age = document.getElementById('add-pat-age').value;
        const gov = document.getElementById('add-pat-gov').value;
        const city = document.getElementById('add-pat-city').value;
        const guardian = document.getElementById('add-pat-guardian').value;
        const allergy = document.getElementById('add-pat-allergy').value;

        if (!name || !code || !phone) return alert('البيانات الأساسية غير مكتملة (الاسم، الهاتف، والكود السري)');
        DB.patients.push({
            id: code, name, disease: 'جديد', state: 'مستقر', specialtyNeeded: 'غير محدد',
            history: '', previousPlans: [], hasAllergies: !!allergy, allergyTypes: allergy, doctorId: '', hospId: 'hosp001',
            phone, guardianContact: guardian, age, governorate: gov, city, coverImg: 'logo.jpg',
            homeCarePlan: [], hospitalCarePlan: [], postCarePlan: [], drNotes: [], adminNotes: []
        });
        alert('تم تسجيل المريض بنجاح!');
        renderAdminDashboard();
        document.getElementById('add-pat-name').value = '';
        document.getElementById('add-pat-code').value = '';
        document.getElementById('add-pat-phone').value = '';
        document.getElementById('add-pat-age').value = '';
        document.getElementById('add-pat-gov').value = '';
        document.getElementById('add-pat-city').value = '';
        document.getElementById('add-pat-guardian').value = '';
        document.getElementById('add-pat-allergy').value = '';
    };

    window.toggleTaskStatus = (pId, listType, taskId) => {
        const p = DB.patients.find(x => x.id === pId);
        if (!p) return;
        let list = p[listType];
        let task = list.find(t => t.id === taskId);
        if (task) { task.status = (task.status === 'مكتمل' ? 'لم يكتمل بعد' : 'مكتمل'); }
        openUnifiedPatientModal(pId, loggedInUserId === 'hosp001' ? 'hospital' : 'admin');
    };

    window.openUnifiedPatientModal = (id, role) => {
        const p = DB.patients.find(x => x.id === id);
        if (!p) return;

        const renderTasks = (list, typeId) => {
            return list.length ? list.map(t => `
                <div class="plan-item">
                    <div>
                        <div style="font-weight:bold; color:var(--primary);">${t.task} <span style="font-size:0.8rem; color:#888;">(${t.time})</span></div>
                        <div style="font-size:0.9rem;">الحالة: <span style="color:${t.status === 'مكتمل' ? 'green' : 'red'}">${t.status}</span></div>
                    </div>
                    <div class="crud-btns">
                        ${(role === 'admin' || role === 'hospital') ? `<button class="btn btn-${t.status === 'مكتمل' ? 'danger-outline' : 'primary'}" style="padding:5px 10px; font-size:0.8rem;" onclick="toggleTaskStatus('${p.id}','${typeId}','${t.id}')">${t.status === 'مكتمل' ? 'تراجع' : 'إكمال'}</button>` : ''}
                        ${role === 'admin' ? `<button class="btn btn-danger-outline" style="padding:5px 10px; font-size:0.8rem;" onclick="deleteTask('${p.id}','${typeId}','${t.id}')">حذف</button>` : ''}
                    </div>
                </div>
            `).join('') : '<p>لا يوجد.</p>';
        };

        const doc = DB.doctors.find(d => d.id === p.doctorId);
        const docName = doc ? doc.name : 'غير محدد';

        const html = `
            <div class="unified-pat-modal">
                <h2 style="color:var(--primary); margin-bottom:10px;">الملف السريري: ${p.name}</h2>
                <div style="font-size:0.9rem; color:var(--text-muted); margin-bottom:20px;">كود المريض: ${p.id} | التخصص المطلوب: ${p.specialtyNeeded} | المعالج: ${docName} | العمر: ${p.age || '--'}</div>
                
                <div class="history-box">
                    <h3 style="font-size:1.1rem; margin-bottom:5px;"><i class="fa-solid fa-clock-rotate-left"></i> السجل المرضي السابق</h3>
                    <p style="font-size:0.95rem;">${p.history || 'لا يوجد سجل مرضي مسجل'}</p>
                    <p style="font-size:0.95rem; margin-top:5px; color:${p.hasAllergies ? 'red' : 'green'}">الحساسية: ${p.hasAllergies ? p.allergyTypes : 'لا توجد'}</p>
                </div>

                <div style="margin-bottom:20px;">
                    <h3 style="font-size:1.1rem; margin-bottom:10px; color:var(--secondary);"><i class="fa-solid fa-house-medical"></i> الخطة المنزلية</h3>
                    ${renderTasks(p.homeCarePlan, 'homeCarePlan')}
                </div>
                
                <div style="margin-bottom:20px;">
                    <h3 style="font-size:1.1rem; margin-bottom:10px; color:var(--secondary);"><i class="fa-solid fa-hospital"></i> خطة المستشفى</h3>
                    ${renderTasks(p.hospitalCarePlan, 'hospitalCarePlan')}
                </div>

                ${role === 'admin' ? `
                <div class="glass-card" style="padding:15px; margin-top:20px; background:rgba(2,132,199,0.05); border:1px dashed var(--primary);">
                    <h3 style="font-size:1.1rem; margin-bottom:10px;">إضافة تكليف جديد للمسار</h3>
                    <div class="form-row" style="align-items:flex-end;">
                        <div class="form-group" style="flex:1;"><label>المسار:</label><select id="add-path-type"><option value="homeCarePlan">رعاية منزلية</option><option value="hospitalCarePlan">مستشفى</option><option value="postCarePlan">متابعة ما بعد العلاج</option></select></div>
                        <div class="form-group" style="flex:1;"><label>التوقيت:</label><input type="text" id="add-path-time"></div>
                        <div class="form-group" style="flex:2;"><label>الوصف:</label><input type="text" id="add-path-task"></div>
                        <div class="form-group"><button class="btn btn-primary" onclick="addPatientPath('${p.id}')">إضافة</button></div>
                    </div>
                </div>` : ''}
            </div>
        `;
        openDynamicModal(html);
    };

    window.addPatientPath = (id) => {
        const p = DB.patients.find(x => x.id === id);
        if (!p) return;
        const type = document.getElementById('add-path-type').value;
        const time = document.getElementById('add-path-time').value;
        const task = document.getElementById('add-path-task').value;
        if (!time || !task) return;
        p[type].push({ id: 't_' + Date.now(), time, task, status: 'لم يكتمل بعد' });
        openUnifiedPatientModal(id, 'admin');
    };

    window.deleteTask = (pId, listType, taskId) => {
        const p = DB.patients.find(x => x.id === pId);
        if (!p) return;
        p[listType] = p[listType].filter(t => t.id !== taskId);
        openUnifiedPatientModal(pId, 'admin');
    };

    // Hospital Search Logic
    window.renderHospitalDashboard = (searchTerm = '') => {
        const hpContainer = document.getElementById('hospital-patients-render');
        if (hpContainer) {
            let pList = DB.patients.filter(p => p.hospId === 'hosp001');
            if (searchTerm) pList = pList.filter(p => p.name.includes(searchTerm) || p.id.includes(searchTerm));
            hpContainer.innerHTML = pList.length ? pList.map(p => `
                <div class="glass-card" style="padding:15px; margin-bottom:10px; cursor:pointer;" onclick="openUnifiedPatientModal('${p.id}', 'hospital')">
                    <h4 style="margin:0;">${p.name}</h4><p style="margin:5px 0 0; font-size:0.9rem; color:var(--text-muted);">عرض التفاصيل والمسارات</p>
                </div>
            `).join('') : '<p>لا توجد نتائج.</p>';
        }

        const devNotesContainer = document.getElementById('hospital-dev-notes-list');
        if (devNotesContainer) {
            const h = DB.hospitals.find(x => x.id === 'hosp001');
            devNotesContainer.innerHTML = (h && h.developerNotes.length) ? h.developerNotes.map(n => `<div class="note-item" style="background:rgba(234, 179, 8, 0.1); border-right:4px solid var(--warning); margin-bottom:15px;"><div style="font-weight:bold;"><i class="fa-solid fa-crown"></i> توجيه المطور:</div><div>${n}</div></div>`).join('') : '<p>لا توجد تعليمات</p>';
        }
    };

    // Admin Messaging
    const adminMsgSelect = document.getElementById('admin-msg-type');
    const adminMsgTarget = document.getElementById('admin-msg-target');
    if (adminMsgSelect) {
        window.updateAdminMsgTargets = () => {
            const type = adminMsgSelect.value;
            let html = '';
            if (type === 'doctor') html = DB.doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            else if (type === 'hospital') html = DB.hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
            else if (type === 'patient') html = DB.patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            adminMsgTarget.innerHTML = html;
        };
        adminMsgSelect.addEventListener('change', updateAdminMsgTargets);
    }
    window.sendAdminMessage = () => {
        const type = document.getElementById('admin-msg-type').value;
        const targetId = document.getElementById('admin-msg-target').value;
        const txt = document.getElementById('admin-msg-text').value.trim();
        if (!txt) return;
        if (type === 'doctor') { const d = DB.doctors.find(x => x.id === targetId); if (d) d.developerNotes.unshift(txt); }
        else if (type === 'hospital') { const h = DB.hospitals.find(x => x.id === targetId); if (h) h.developerNotes.unshift(txt); }
        else if (type === 'patient') { const p = DB.patients.find(x => x.id === targetId); if (p) p.adminNotes.unshift(txt); }
        alert('تم إرسال التعليم بنجاح!'); document.getElementById('admin-msg-text').value = '';
    };

    function showScreen(screen) {
        [loginScreen, dashboardScreen, adminDashboardScreen, doctorDashboardScreen, hospitalDashboardScreen].forEach(s => { if (s) s.classList.remove('active'); });
        screen.classList.add('active');
        const activeTab = screen.querySelector('.tab-pane.active');
        if (activeTab) { activeTab.classList.remove('fade-in'); void activeTab.offsetWidth; activeTab.classList.add('fade-in'); }

        const testDataBox = document.getElementById('test-data-box');
        if (testDataBox) {
            if (screen === loginScreen) testDataBox.classList.remove('hidden');
            else testDataBox.classList.add('hidden');
        }
    }

    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLoginRole = null;
            loggedInUserId = null;
            localStorage.clear();
            showScreen(loginScreen); if (globalCornerMenu) globalCornerMenu.classList.remove('hidden');
            if (patientCodeInput) patientCodeInput.value = ''; if (modalSecretCode) modalSecretCode.value = '';
        });
    });

    const navLinks = document.querySelectorAll('.nav-links li[data-tab]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const screen = link.closest('.screen-box');
            if (!screen) return;
            screen.querySelectorAll('[data-tab]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const targetPane = document.getElementById(link.getAttribute('data-tab'));
            if (targetPane) {
                screen.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                targetPane.classList.add('active'); targetPane.classList.remove('fade-in'); void targetPane.offsetWidth; targetPane.classList.add('fade-in');
            }
            if (link.getAttribute('data-tab') === 'admin-messaging' && window.updateAdminMsgTargets) window.updateAdminMsgTargets();
        });
    });

    // Theme Toggler
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const savedTheme = localStorage.getItem('medtrack_theme');

    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-theme');
            if (document.documentElement.classList.contains('light-theme')) {
                localStorage.setItem('medtrack_theme', 'light');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            } else {
                localStorage.setItem('medtrack_theme', 'dark');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }
        });
    }

    window.addEventListener('beforeunload', () => {
        localStorage.setItem('medtrack_role', currentLoginRole || '');
        localStorage.setItem('medtrack_uid', loggedInUserId || '');
        localStorage.setItem('medtrack_DB', JSON.stringify(DB));
    });
});
