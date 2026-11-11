// Estado Global da Aplicação
let isLoggedIn = false;
let currentUser = { name: "Eduardo Almeida", email: "eduardo@email.com" };
let connectedBank = { name: "Nubank", icon: "Nu" };

let familyMembers = [
  {
    id: 1,
    name: "Carlos Almeida",
    relationship: "Pai",
    phone: "(51) 99888-1111",
    canConfirmIdentity: true,
    canAuthorize: true,
    status: "Confirmado"
  },
  {
    id: 2,
    name: "Maria Almeida",
    relationship: "Mãe",
    phone: "(51) 99777-2222",
    canConfirmIdentity: true,
    canAuthorize: true,
    status: "Confirmado"
  }
];

let currentRequest = null;
let verificationStep = 1;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderFamilyList();
  populateFamilySelect();
});

// Autenticação & Cadastro
function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-user').value;
  currentUser.email = emailInput;
  currentUser.name = emailInput.split('@')[0];
  isLoggedIn = true;
  
  document.getElementById('user-greeting').textContent = `Olá, ${currentUser.name}`;
  document.getElementById('header-user-status').classList.remove('hidden');
  navigateTo('screen-1');
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;

  currentUser = { name, email };
  isLoggedIn = true;

  document.getElementById('user-greeting').textContent = `Olá, ${currentUser.name}`;
  document.getElementById('header-user-status').classList.remove('hidden');
  alert("Conta criada com sucesso! Bem-vindo ao Pix Rota Segura.");
  navigateTo('screen-1');
}

function handleLogout() {
  isLoggedIn = false;
  document.getElementById('header-user-status').classList.add('hidden');
  navigateTo('screen-login');
}

// Controle do Banco Conectado (Open Finance dentro do app)
function openBankConnectModal() {
  document.getElementById('bank-connect-modal').classList.remove('hidden');
  document.getElementById('bank-connect-modal').classList.add('flex');
}

function closeBankConnectModal() {
  document.getElementById('bank-connect-modal').classList.add('hidden');
  document.getElementById('bank-connect-modal').classList.remove('flex');
}

function selectConnectedBank(bankName, iconText) {
  connectedBank = { name: bankName, icon: iconText };
  document.getElementById('connected-bank-label').textContent = bankName;
  document.getElementById('connected-bank-icon').textContent = iconText;
  
  // Atualizar badges no modal
  ['Nubank', 'Itaú', 'Banco do Brasil', 'Inter'].forEach(b => {
    const badge = document.getElementById(`badge-bank-${b}`);
    if (badge) {
      if (b === bankName) {
        badge.textContent = "Conectado";
        badge.className = "text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-300";
      } else {
        badge.textContent = "Conectar";
        badge.className = "text-[10px] text-slate-500 hidden";
      }
    }
  });

  closeBankConnectModal();
}

// Navegação de Telas
function navigateTo(screenId) {
  if (screenId !== 'screen-login' && screenId !== 'screen-register' && !isLoggedIn) {
    alert("Faça login para acessar o sistema.");
    return;
  }

  if (screenId === 'screen-2') {
    const canConfirm = familyMembers.some(m => m.canConfirmIdentity);
    const canAuth = familyMembers.some(m => m.canAuthorize);
    if (!canConfirm || !canAuth) {
      alert("Para prosseguir, você precisa ter ao menos um familiar cadastrado para confirmar identidade e outro para autorizar!");
      return;
    }
  }

  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

// Renderizar Lista de Familiares (Tela 1)
function renderFamilyList() {
  const container = document.getElementById('contacts-list');
  if (!container) return;
  container.innerHTML = '';

  if (familyMembers.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Nenhum familiar cadastrado.</p>`;
    return;
  }

  familyMembers.forEach(member => {
    const card = document.createElement('div');
    card.className = "bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
            ${member.name.charAt(0)}
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-100">${member.name}</h3>
            <span class="text-[10px] text-slate-400">${member.relationship} • ${member.phone}</span>
          </div>
        </div>
        <span class="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ${member.status}
        </span>
      </div>
      <div class="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2">
        <div class="flex gap-2">
          ${member.canConfirmIdentity ? '<span class="text-cyan-400">✓ Identidade</span>' : ''}
          ${member.canAuthorize ? '<span class="text-emerald-400">✓ Autorização</span>' : ''}
        </div>
        <button onclick="removeFamilyMember(${member.id})" class="text-rose-400 hover:text-rose-300">Remover</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Popular Select de Solicitantes (Tela 2)
function populateFamilySelect() {
  const select = document.getElementById('req-family-member');
  if (!select) return;
  select.innerHTML = '';
  familyMembers.filter(m => m.canConfirmIdentity).forEach(member => {
    const opt = document.createElement('option');
    opt.value = member.id;
    opt.textContent = `${member.name} (${member.relationship})`;
    select.appendChild(opt);
  });
}

// Modal Adicionar Familiar
function openModal() {
  document.getElementById('family-modal').classList.remove('hidden');
  document.getElementById('family-modal').classList.add('flex');
}

function closeModal() {
  document.getElementById('family-modal').classList.add('hidden');
  document.getElementById('family-modal').classList.remove('flex');
}

function handleSaveFamilyMember(e) {
  e.preventDefault();
  const name = document.getElementById('modal-name').value;
  const relationship = document.getElementById('modal-relationship').value;
  const phone = document.getElementById('modal-phone').value;
  const canConfirmIdentity = document.getElementById('modal-perm-identity').checked;
  const canAuthorize = document.getElementById('modal-perm-authorize').checked;

  const newMember = {
    id: Date.now(),
    name,
    relationship,
    phone,
    canConfirmIdentity,
    canAuthorize,
    status: "Confirmado"
  };

  familyMembers.push(newMember);
  renderFamilyList();
  populateFamilySelect();
  closeModal();
  document.getElementById('add-family-form').reset();
}

function removeFamilyMember(id) {
  familyMembers = familyMembers.filter(m => m.id !== id);
  renderFamilyList();
  populateFamilySelect();
}

// Registrar Solicitação (Tela 2 -> 3)
function handleStartVerification(e) {
  e.preventDefault();
  const familyMemberId = parseInt(document.getElementById('req-family-member').value);
  const requester = familyMembers.find(m => m.id === familyMemberId);
  const amount = parseFloat(document.getElementById('req-amount').value).toFixed(2);
  const recipient = document.getElementById('req-recipient').value;
  const pixKey = document.getElementById('req-pixkey').value;
  const origin = document.getElementById('req-origin').value;

  const authorizer = familyMembers.find(m => m.canAuthorize && m.id !== familyMemberId) || familyMembers.find(m => m.canAuthorize);

  currentRequest = {
    requester,
    authorizer,
    amount,
    recipient,
    pixKey,
    origin
  };

  verificationStep = 1;
  updateVerificationUI();
  navigateTo('screen-3');
}

// Atualizar UI da Verificação (Tela 3)
function updateVerificationUI() {
  const container = document.getElementById('verification-card-container');
  const step1Badge = document.getElementById('step1-badge');
  const step2Badge = document.getElementById('step2-badge');

  if (verificationStep === 1) {
    step1Badge.className = "flex items-center gap-2 text-cyan-400 font-semibold";
    step2Badge.className = "flex items-center gap-2 text-slate-500 font-semibold";

    container.innerHTML = `
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div class="border-b border-slate-800 pb-3">
          <span class="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mb-1">Etapa 1 — Confirmação de Identidade</span>
          <p class="text-xs text-slate-300">Notificação simulada enviada para o canal de confiança de <strong>${currentRequest.requester.name}</strong>:</p>
        </div>

        <div class="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-200 space-y-2">
          <p class="font-semibold text-cyan-300">"Você realmente solicitou um PIX de R$ ${currentRequest.amount} para ${currentRequest.recipient}?"</p>
          <div class="text-[10px] text-slate-400 space-y-0.5">
            <p>• Chave: ${currentRequest.pixKey}</p>
            <p>• Origem informada: ${currentRequest.origin}</p>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button onclick="handleStep1Response(true)" class="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition">
            Sim, fui eu que solicitei
          </button>
          <button onclick="handleStep1Response(false)" class="w-full py-3 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl text-xs transition">
            Não fui eu (Alerta de Golpe)
          </button>
        </div>
      </div>
    `;
  } else if (verificationStep === 2) {
    step1Badge.className = "flex items-center gap-2 text-emerald-400 font-semibold";
    step2Badge.className = "flex items-center gap-2 text-cyan-400 font-semibold";

    container.innerHTML = `
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div class="border-b border-slate-800 pb-3">
          <span class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">Etapa 1 Concluída ✓</span>
          <p class="text-xs text-slate-300">Etapa 2 — Solicitação enviada ao autorizador da rede (<strong>${currentRequest.authorizer.name}</strong>):</p>
        </div>

        <div class="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-200 space-y-2">
          <p class="font-semibold text-cyan-300">"Seu familiar ${currentRequest.requester.name} confirmou a solicitação de PIX de R$ ${currentRequest.amount}. Você autoriza esta transferência?"</p>
        </div>

        <div class="space-y-2 pt-2">
          <button onclick="handleStep2Response(true)" class="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition">
            Autorizar transferência
          </button>
          <button onclick="handleStep2Response(false)" class="w-full py-3 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl text-xs transition">
            Negar transferência
          </button>
        </div>
      </div>
    `;
  }
}

// Respostas da Verificação
function handleStep1Response(confirmed) {
  if (confirmed) {
    verificationStep = 2;
    updateVerificationUI();
  } else {
    showResult('FRAUD_ATTEMPT');
  }
}

function handleStep2Response(authorized) {
  if (authorized) {
    showResult('APPROVED');
  } else {
    showResult('DENIED_BY_AUTHORIZER');
  }
}

// Mostrar Resultado Final (Tela 4)
function showResult(resultType) {
  const container = document.getElementById('result-content');
  
  if (resultType === 'APPROVED') {
    container.innerHTML = `
      <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-3">
        <div class="w-12 h-12 bg-emerald-500/20 border border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 class="text-base font-bold text-emerald-400">Verificação Aprovada!</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Os familiares confirmaram a identidade e autorizaram a solicitação de R$ ${currentRequest.amount}.
        </p>
        <button onclick="redirectToConnectedBankSim()" class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2">
          <span>Abrir ${connectedBank.name} (Simulação)</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </button>
        <p class="text-[10px] text-slate-400">O Pix Rota Segura não realiza transferências diretamente. O redirecionamento leva os dados pré-validados para o app do seu banco.</p>
      </div>
    `;
  } else if (resultType === 'FRAUD_ATTEMPT') {
    container.innerHTML = `
      <div class="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-center space-y-3">
        <div class="w-12 h-12 bg-rose-500/20 border border-rose-400 text-rose-400 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 class="text-base font-bold text-rose-400">Atenção! Possível Golpe de IA</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          O familiar informou que <strong>NÃO</strong> solicitou esse dinheiro. Recomendamos <strong>NÃO</strong> realizar a transferência.
        </p>
        <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left text-[11px] text-slate-300 space-y-1">
          <p class="font-semibold text-rose-400">Recomendações de segurança:</p>
          <p>• Ligue diretamente para o número original do seu familiar.</p>
          <p>• Não transfira dinheiro para a chave informada.</p>
        </div>
      </div>
    `;
  } else if (resultType === 'DENIED_BY_AUTHORIZER') {
    container.innerHTML = `
      <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center space-y-3">
        <div class="w-12 h-12 bg-amber-500/20 border border-amber-400 text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
        </div>
        <h3 class="text-base font-bold text-amber-400">Transferência Não Autorizada</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          A operação foi negada por <strong>${currentRequest.authorizer.name}</strong> na etapa de autorização.
        </p>
        <p class="text-[11px] text-slate-400">Recomendamos interromper a transação e confirmar os detalhes diretamente com os envolvidos.</p>
      </div>
    `;
  }

  navigateTo('screen-4');
}

// Redirecionamento Simulado de Banco
function redirectToConnectedBankSim() {
  document.getElementById('sim-bank-title').textContent = `Aplicativo ${connectedBank.name}`;
  document.getElementById('sim-bank-logo').textContent = connectedBank.icon;
  document.getElementById('sim-recipient').textContent = currentRequest.recipient;
  document.getElementById('sim-amount').textContent = `R$ ${currentRequest.amount}`;
  navigateTo('screen-bank-sim');
}

function restartSimulation() {
  currentRequest = null;
  verificationStep = 1;
  navigateTo('screen-1');
}
