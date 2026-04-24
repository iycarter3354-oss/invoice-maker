// かんたん請求書メーカー — ロジック

// ===== 入力フィールドとプレビュー要素の対応マップ =====
const fieldMap = [
  { input: 'senderName',    preview: 'p-senderName'    },
  { input: 'senderAddress', preview: 'p-senderAddress' },
  { input: 'senderPhone',   preview: 'p-senderPhone'   },
  { input: 'senderEmail',   preview: 'p-senderEmail'   },
  { input: 'bankInfo',      preview: 'p-bankInfo'      },
  { input: 'clientName',    preview: 'p-clientName'    },
  { input: 'clientPerson',  preview: 'p-clientPerson'  },
  { input: 'invoiceNo',     preview: 'p-invoiceNo'     },
];

// ===== テキストフィールドをプレビューに同期 =====
function bindTextFields() {
  fieldMap.forEach(({ input, preview }) => {
    const el = document.getElementById(input);
    const pr = document.getElementById(preview);
    if (!el || !pr) return;

    el.addEventListener('input', () => {
      pr.textContent = el.value || '—';
    });
  });
}

// ===== 日付フィールドを「YYYY年MM月DD日」形式でプレビュー =====
function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  return `${y}年${m}月${d}日`;
}

function bindDateFields() {
  ['issueDate', 'dueDate'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      const previewId = id === 'issueDate' ? 'p-issueDate' : 'p-dueDate';
      document.getElementById(previewId).textContent = formatDate(el.value);
    });
  });
}

// ===== 金額を「¥1,234,567」形式にフォーマット =====
function formatMoney(value) {
  return '¥' + Math.floor(value).toLocaleString('ja-JP');
}

// ===== 明細行を1行生成して tbody に追加 =====
function addItemRow() {
  const tbody = document.getElementById('itemsBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" class="item-name" placeholder="Webサイト制作" /></td>
    <td><input type="number" class="item-qty"   placeholder="1"      min="0" step="0.5" style="width:60px" /></td>
    <td><input type="number" class="item-price" placeholder="100000" min="0" step="100" /></td>
    <td><button type="button" class="btn-delete-row" title="行を削除">✕</button></td>
  `;

  // 削除ボタン
  row.querySelector('.btn-delete-row').addEventListener('click', () => {
    row.remove();
    updateInvoicePreview();
  });

  // 入力があるたびに合計を更新
  row.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', updateInvoicePreview);
  });

  tbody.appendChild(row);
}

// ===== 明細プレビューと合計金額を更新 =====
function updateInvoicePreview() {
  const previewTbody = document.getElementById('p-itemsBody');
  previewTbody.innerHTML = '';

  let subtotal = 0;

  document.querySelectorAll('#itemsBody tr').forEach(row => {
    const name  = row.querySelector('.item-name')?.value  || '';
    const qty   = parseFloat(row.querySelector('.item-qty')?.value)   || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    const amount = qty * price;
    subtotal += amount;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name || '（品名未入力）'}</td>
      <td>${qty}</td>
      <td>${formatMoney(price)}</td>
      <td class="amount-cell">${formatMoney(amount)}</td>
    `;
    previewTbody.appendChild(tr);
  });

  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  const tax     = subtotal * taxRate;
  const total   = subtotal + tax;

  // 消費税ラベルを税率に応じて変更
  const taxPercent = Math.round(taxRate * 100);
  const taxLabelEl = document.getElementById('p-taxLabel');
  taxLabelEl.textContent = taxPercent === 0 ? '消費税（非課税）' : `消費税（${taxPercent}%）`;

  document.getElementById('p-subtotal').textContent   = formatMoney(subtotal);
  document.getElementById('p-tax').textContent        = formatMoney(tax);
  document.getElementById('p-total').textContent      = formatMoney(total);
  document.getElementById('p-grandTotal').textContent = formatMoney(total);
}

// ===== 今日の日付と30日後をデフォルト値として設定 =====
function setDefaultDates() {
  const today = new Date();
  const due   = new Date();
  due.setDate(due.getDate() + 30);

  const toISO = d => d.toISOString().split('T')[0];

  document.getElementById('issueDate').value = toISO(today);
  document.getElementById('dueDate').value   = toISO(due);

  // プレビューも即座に反映
  document.getElementById('p-issueDate').textContent = formatDate(toISO(today));
  document.getElementById('p-dueDate').textContent   = formatDate(toISO(due));
}

// ===== デフォルトの請求書番号を生成 =====
function setDefaultInvoiceNo() {
  const now = new Date();
  const no  = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-001`;
  const el  = document.getElementById('invoiceNo');
  el.value  = no;
  document.getElementById('p-invoiceNo').textContent = no;
}

// ===== 印刷（PDF保存） =====
function bindPrintButton() {
  document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
  });
}

// ===== プロ版メール登録（仮実装：実際はメール収集サービスに送る） =====
function bindProSignup() {
  document.getElementById('proSignupBtn').addEventListener('click', () => {
    const email = document.getElementById('proEmail').value.trim();
    const msg   = document.getElementById('signupMessage');

    if (!email || !email.includes('@')) {
      msg.style.color = '#fc8181';
      msg.textContent = '正しいメールアドレスを入力してください。';
      return;
    }

    // ★ ここに Mailchimp / ConvertKit などのAPIを接続する
    // 例: fetch('https://your-api.com/subscribe', { method:'POST', body: JSON.stringify({email}) })
    console.log('登録メールアドレス:', email);

    msg.style.color = '#48bb78';
    msg.textContent = `${email} に登録完了！プロ版公開時にお知らせします。`;
    document.getElementById('proEmail').value = '';
  });
}

// ===== 初期化 =====
function init() {
  setDefaultDates();
  setDefaultInvoiceNo();
  bindTextFields();
  bindDateFields();

  // デフォルトで1行追加
  addItemRow();

  // 行追加ボタン
  document.getElementById('addRowBtn').addEventListener('click', addItemRow);

  // 消費税率変更時に合計を更新
  document.getElementById('taxRate').addEventListener('change', updateInvoicePreview);

  bindPrintButton();
  bindProSignup();
}

document.addEventListener('DOMContentLoaded', init);
