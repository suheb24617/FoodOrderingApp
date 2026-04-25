/* ===== myFunctions.js ===== */
/* ملف جافاسكريبت الوحيد لجميع التوابع */

// ===== ربط jQuery =====
$(document).ready(function () {

  // ===== تحديد الصفحة النشطة في القائمة =====
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  $('nav ul li a').each(function () {
    const href = $(this).attr('href');
    if (href === currentPage) {
      $(this).addClass('active');
    }
  });

  // ===== تهيئة صفحة الوجبات =====
  if ($('#meals-table').length) {
    initMealsPage();
  }

  // ===== تهيئة الفورم =====
  if ($('#order-form').length) {
    initOrderForm();
  }

});

// ===== تبديل تفاصيل الوجبة =====
function toggleDetails(id) {
  const $detailsRow = $('#details-' + id);
  const $btn = $('#btn-' + id);

  if ($detailsRow.hasClass('show')) {
    $detailsRow.removeClass('show');
    $btn.text('إظهار التفاصيل');
    $btn.removeClass('active');
  } else {
    $detailsRow.addClass('show');
    $btn.text('إخفاء التفاصيل');
    $btn.addClass('active');
  }
}

// ===== تهيئة صفحة الوجبات =====
function initMealsPage() {

  // زر متابعة
  $('#btn-continue').on('click', function () {
    const selectedMeals = getSelectedMeals();

    if (selectedMeals.length === 0) {
      showToast('⚠️ يرجى اختيار وجبة واحدة على الأقل!', 'warning');
      return;
    }

    // عرض الوجبات المختارة في الفورم
    displaySelectedMealsInForm(selectedMeals);

    // إظهار الفورم
    $('#order-form-section').addClass('show');
    $('html, body').animate({ scrollTop: $('#order-form-section').offset().top - 80 }, 600);
  });

}

// ===== الحصول على الوجبات المختارة =====
function getSelectedMeals() {
  const selected = [];
  $('.meal-checkbox:checked').each(function () {
    const id = $(this).data('id');
    const name = $(this).data('name');
    const price = parseInt($(this).data('price'));
    selected.push({ id, name, price });
  });
  return selected;
}

// ===== عرض الوجبات المختارة في الفورم =====
function displaySelectedMealsInForm(meals) {
  let html = '<div style="background:#fff3e0;border-radius:8px;padding:15px;margin-bottom:20px;">';
  html += '<h4 style="color:#e67e22;margin-bottom:10px;">🛒 الوجبات المختارة:</h4><ul style="list-style:none;">';
  meals.forEach(function (m) {
    html += `<li style="padding:6px 0;border-bottom:1px dashed #f0d9a0;display:flex;justify-content:space-between;">
      <span>🍽️ ${m.name} (${m.id})</span>
      <strong style="color:#27ae60;">${formatPrice(m.price)} ل.س</strong>
    </li>`;
  });
  html += '</ul></div>';
  $('#selected-meals-preview').html(html);
}

// ===== تنسيق السعر =====
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===== تهيئة الفورم والتحقق =====
function initOrderForm() {
  $('#order-form').on('submit', function (e) {
    e.preventDefault();
    if (validateAllFields()) {
      showOrderSummaryModal();
    }
  });

  // التحقق الفوري عند الكتابة
  $('#fullname').on('input', validateName);
  $('#national-id').on('input', validateNationalId);
  $('#birthdate').on('change', validateBirthdate);
  $('#mobile').on('input', validateMobile);
  $('#email').on('input', validateEmail);
}

// ===== التحقق من الاسم الكامل (أحرف هجائية عربية فقط) =====
function validateName() {
  const val = $('#fullname').val().trim();
  const arabicOnly = /^[\u0600-\u06FF\s]+$/;
  const $field = $('#fullname');
  const $err = $('#name-error');
  const $ok = $('#name-ok');

  if (val === '') {
    setFieldError($field, $err, $ok, 'الاسم الكامل مطلوب');
    return false;
  }
  if (!arabicOnly.test(val)) {
    setFieldError($field, $err, $ok, 'يجب أن يحتوي الاسم على أحرف عربية فقط');
    return false;
  }
  if (val.length < 3) {
    setFieldError($field, $err, $ok, 'الاسم يجب أن يكون 3 أحرف على الأقل');
    return false;
  }
  setFieldValid($field, $err, $ok, 'الاسم صحيح ✓');
  return true;
}

// ===== التحقق من الرقم الوطني (11 خانة + بادئة المحافظة 01-14) =====
function validateNationalId() {
  const val = $('#national-id').val().trim();
  const $field = $('#national-id');
  const $err = $('#nid-error');
  const $ok = $('#nid-ok');

  if (val === '') {
    setFieldError($field, $err, $ok, 'الرقم الوطني مطلوب');
    return false;
  }

  if (!/^\d+$/.test(val)) {
    setFieldError($field, $err, $ok, 'الرقم الوطني يجب أن يحتوي على أرقام فقط');
    return false;
  }

  if (val.length !== 11) {
    setFieldError($field, $err, $ok, `الرقم الوطني يجب أن يكون 11 خانة (أدخلت ${val.length})`);
    return false;
  }

  const province = parseInt(val.substring(0, 2));
  if (province < 1 || province > 14) {
    setFieldError($field, $err, $ok, 'الخانتان الأوليان يجب أن تمثلا رقم المحافظة (01-14)');
    return false;
  }

  setFieldValid($field, $err, $ok, 'الرقم الوطني صحيح ✓');
  return true;
}

// ===== التحقق من تاريخ الميلاد (dd-mm-yyyy) =====
function validateBirthdate() {
  const val = $('#birthdate').val().trim();
  const $field = $('#birthdate');
  const $err = $('#bd-error');
  const $ok = $('#bd-ok');

  if (val === '') {
    setFieldNeutral($field, $err, $ok);
    return true; // اختياري
  }

  // التحقق من الشكل dd-mm-yyyy
  const pattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = val.match(pattern);

  if (!match) {
    setFieldError($field, $err, $ok, 'الشكل الصحيح: dd-mm-yyyy (مثال: 15-06-1995)');
    return false;
  }

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  if (month < 1 || month > 12) {
    setFieldError($field, $err, $ok, 'الشهر يجب أن يكون بين 01 و 12');
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    setFieldError($field, $err, $ok, `اليوم يجب أن يكون بين 01 و ${daysInMonth}`);
    return false;
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    setFieldError($field, $err, $ok, 'السنة غير صحيحة');
    return false;
  }

  setFieldValid($field, $err, $ok, 'تاريخ الميلاد صحيح ✓');
  return true;
}

// ===== التحقق من رقم الموبايل (Syriatel: 09x, MTN: 09x) =====
function validateMobile() {
  const val = $('#mobile').val().trim();
  const $field = $('#mobile');
  const $err = $('#mob-error');
  const $ok = $('#mob-ok');

  if (val === '') {
    setFieldNeutral($field, $err, $ok);
    return true; // اختياري
  }

  // Syriatel: 099x, 098x / MTN: 094x, 093x, 096x, 091x, 092x, 095x, 088x
  const syriatelPattern = /^09[589][0-9]{7}$/;
  const mtnPattern = /^09[4361278][0-9]{7}$/;
  // نمط أشمل للشبكتين: 10 أرقام تبدأ بـ 09
  const syriaPattern = /^09[0-9]{8}$/;

  if (!syriaPattern.test(val)) {
    setFieldError($field, $err, $ok, 'رقم الموبايل يجب أن يكون 10 أرقام ويبدأ بـ 09 (Syriatel أو MTN)');
    return false;
  }

  setFieldValid($field, $err, $ok, 'رقم الموبايل صحيح ✓');
  return true;
}

// ===== التحقق من البريد الإلكتروني =====
function validateEmail() {
  const val = $('#email').val().trim();
  const $field = $('#email');
  const $err = $('#email-error');
  const $ok = $('#email-ok');

  if (val === '') {
    setFieldNeutral($field, $err, $ok);
    return true; // اختياري
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(val)) {
    setFieldError($field, $err, $ok, 'صيغة البريد الإلكتروني غير صحيحة');
    return false;
  }

  setFieldValid($field, $err, $ok, 'البريد الإلكتروني صحيح ✓');
  return true;
}

// ===== التحقق من جميع الحقول =====
function validateAllFields() {
  const n = validateName();
  const id = validateNationalId();
  const bd = validateBirthdate();
  const mob = validateMobile();
  const em = validateEmail();
  return n && id && bd && mob && em;
}

// ===== مساعدات التحقق =====
function setFieldError($field, $err, $ok, msg) {
  $field.removeClass('valid').addClass('error');
  $err.text('⚠️ ' + msg).addClass('show');
  $ok.removeClass('show');
}

function setFieldValid($field, $err, $ok, msg) {
  $field.removeClass('error').addClass('valid');
  $ok.text(msg).addClass('show');
  $err.removeClass('show');
}

function setFieldNeutral($field, $err, $ok) {
  $field.removeClass('error valid');
  $err.removeClass('show');
  $ok.removeClass('show');
}

// ===== إظهار نافذة ملخص الطلب =====
function showOrderSummaryModal() {
  const selectedMeals = getSelectedMeals();
  const name = $('#fullname').val().trim();
  const nid = $('#national-id').val().trim();
  const bd = $('#birthdate').val().trim();
  const mob = $('#mobile').val().trim();
  const email = $('#email').val().trim();

  let subtotal = 0;
  let rowsHtml = '';

  selectedMeals.forEach(function (m) {
    subtotal += m.price;
    rowsHtml += `<tr>
      <td>${m.id}</td>
      <td>${m.name}</td>
      <td style="color:#27ae60;font-weight:700;">${formatPrice(m.price)} ل.س</td>
    </tr>`;
  });

  const tax = subtotal * 0.05;
  const total = subtotal - tax;

  $('#modal-customer-name').text(name);
  $('#modal-nid').text(nid);
  $('#modal-bd').text(bd || '-');
  $('#modal-mob').text(mob || '-');
  $('#modal-email').text(email || '-');
  $('#modal-meals-rows').html(rowsHtml);
  $('#modal-subtotal').text(formatPrice(subtotal) + ' ل.س');
  $('#modal-tax').text(formatPrice(Math.round(tax)) + ' ل.س');
  $('#modal-total').text(formatPrice(Math.round(total)) + ' ل.س');

  $('#order-modal').addClass('show');
}

// ===== إغلاق المودال =====
function closeModal() {
  $('#order-modal').removeClass('show');
}

// إغلاق عند النقر خارج المودال
$(document).on('click', '#order-modal', function (e) {
  if ($(e.target).is('#order-modal')) {
    closeModal();
  }
});

// ===== إظهار إشعار Toast =====
function showToast(msg, type) {
  const $toast = $('#toast');
  $toast.text(msg);
  $toast.addClass('show');
  setTimeout(function () {
    $toast.removeClass('show');
  }, 3000);
}

// ===== تأثير hover على صفوف الطلاب =====
function hoverRow(el, isHover) {
  if (isHover) {
    $(el).addClass('hovered');
  } else {
    $(el).removeClass('hovered');
  }
}

// ===== التنقل بين الصفحات =====
function navigateTo(page) {
  window.location.href = page;
}

// ===== الخروج =====
function exitSite() {
  if (confirm('هل أنت متأكد من الخروج من الموقع؟')) {
    window.close();
    // في حال لم يعمل إغلاق النافذة
    window.location.href = 'home.html';
  }
}
