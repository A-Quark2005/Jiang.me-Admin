const storageKeys = {
  apiBaseUrl: 'jiangleme_admin_api_base_url',
  adminUserId: 'jiangleme_admin_user_id',
  adminToken: 'jiangleme_admin_token',
  selectedAccountId: 'jiangleme_admin_selected_account_id',
};

const state = {
  apiBaseUrl: localStorage.getItem(storageKeys.apiBaseUrl) || 'https://api.whkerdb.top',
  adminUserId: localStorage.getItem(storageKeys.adminUserId) || 'user_internal_ops',
  adminToken: localStorage.getItem(storageKeys.adminToken) || '',
  adminAccounts: [],
  publicAccounts: [],
  selectedAccountId: localStorage.getItem(storageKeys.selectedAccountId) || '',
  selectedApplicationTypeId: '',
  selectedApplicationTypes: [],
  selectedRuleInterface: null,
  selectedApplications: [],
};

const elements = {
  apiBaseUrlInput: document.querySelector('#apiBaseUrlInput'),
  adminAccountSelect: document.querySelector('#adminAccountSelect'),
  adminUserIdInput: document.querySelector('#adminUserIdInput'),
  loginButton: document.querySelector('#loginButton'),
  refreshAccountsButton: document.querySelector('#refreshAccountsButton'),
  logoutButton: document.querySelector('#logoutButton'),
  serverModeBadge: document.querySelector('#serverModeBadge'),
  sessionUserValue: document.querySelector('#sessionUserValue'),
  sessionTokenValue: document.querySelector('#sessionTokenValue'),

  openCreateAccountButton: document.querySelector('#openCreateAccountButton'),
  closeCreateAccountButton: document.querySelector('#closeCreateAccountButton'),
  createAccountButton: document.querySelector('#createAccountButton'),
  submitCreateAccountButton: document.querySelector('#submitCreateAccountButton'),
  createAccountModal: document.querySelector('#createAccountModal'),
  createAccountBackdrop: document.querySelector('#createAccountBackdrop'),
  createAccountForm: document.querySelector('#createAccountForm'),
  createNameInput: document.querySelector('#createNameInput'),
  createSlugInput: document.querySelector('#createSlugInput'),
  createSummaryInput: document.querySelector('#createSummaryInput'),
  createDescriptionInput: document.querySelector('#createDescriptionInput'),
  createAvatarInput: document.querySelector('#createAvatarInput'),
  createCoverInput: document.querySelector('#createCoverInput'),

  refreshPublicAccountsButton: document.querySelector('#refreshPublicAccountsButton'),
  publicAccountsList: document.querySelector('#publicAccountsList'),
  publicAccountsEmpty: document.querySelector('#publicAccountsEmpty'),
  selectedAccountTitle: document.querySelector('#selectedAccountTitle'),
  selectedAccountSubtitle: document.querySelector('#selectedAccountSubtitle'),
  reloadSelectedAccountButton: document.querySelector('#reloadSelectedAccountButton'),

  applicationTypesEmpty: document.querySelector('#applicationTypesEmpty'),
  applicationTypesList: document.querySelector('#applicationTypesList'),
  applicationTypeForm: document.querySelector('#applicationTypeForm'),
  applicationTypeKeyInput: document.querySelector('#applicationTypeKeyInput'),
  applicationTypeNameInput: document.querySelector('#applicationTypeNameInput'),
  applicationTypeButtonLabelInput: document.querySelector('#applicationTypeButtonLabelInput'),
  applicationTypeDescriptionInput: document.querySelector('#applicationTypeDescriptionInput'),
  applicationTypeActiveInput: document.querySelector('#applicationTypeActiveInput'),
  applicationTypeCertificationInput: document.querySelector('#applicationTypeCertificationInput'),
  saveApplicationTypeButton: document.querySelector('#saveApplicationTypeButton'),
  resetApplicationTypeButton: document.querySelector('#resetApplicationTypeButton'),

  ruleInterfaceForm: document.querySelector('#ruleInterfaceForm'),
  ruleTitleInput: document.querySelector('#ruleTitleInput'),
  ruleDescriptionInput: document.querySelector('#ruleDescriptionInput'),
  ruleActiveInput: document.querySelector('#ruleActiveInput'),
  certEnabledInput: document.querySelector('#certEnabledInput'),
  certModeInput: document.querySelector('#certModeInput'),
  certEndpointInput: document.querySelector('#certEndpointInput'),
  certStartUrlTemplateInput: document.querySelector('#certStartUrlTemplateInput'),
  certTitleInput: document.querySelector('#certTitleInput'),
  certDescriptionInput: document.querySelector('#certDescriptionInput'),
  certSuccessTitleInput: document.querySelector('#certSuccessTitleInput'),
  certSuccessDescriptionInput: document.querySelector('#certSuccessDescriptionInput'),
  certFailureTitleInput: document.querySelector('#certFailureTitleInput'),
  certFailureDescriptionInput: document.querySelector('#certFailureDescriptionInput'),
  certConfigInput: document.querySelector('#certConfigInput'),
  submissionEnabledInput: document.querySelector('#submissionEnabledInput'),
  submissionEndpointInput: document.querySelector('#submissionEndpointInput'),
  submissionConfigInput: document.querySelector('#submissionConfigInput'),
  connectionEnabledInput: document.querySelector('#connectionEnabledInput'),
  connectionEndpointInput: document.querySelector('#connectionEndpointInput'),
  connectionConfigInput: document.querySelector('#connectionConfigInput'),
  extensionsConfigInput: document.querySelector('#extensionsConfigInput'),

  applicationsList: document.querySelector('#applicationsList'),
  applicationsEmpty: document.querySelector('#applicationsEmpty'),
  eventLog: document.querySelector('#eventLog'),
  clearLogButton: document.querySelector('#clearLogButton'),
  saveRuleInterfaceButton: document.querySelector('#saveRuleInterfaceButton'),
};

function normalizeBaseUrl(value) {
  return `${value || ''}`.trim().replace(/\/+$/, '');
}

function getHeaders(withAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (withAuth && state.adminToken) {
    headers.Authorization = `Bearer ${state.adminToken}`;
  }
  return headers;
}

async function requestJson(path, options = {}) {
  const url = `${normalizeBaseUrl(state.apiBaseUrl)}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(options.withAuth),
      ...(options.headers || {}),
    },
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      body?.data?.message ||
      `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return body;
}

function appendLog(message) {
  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
  const line = `[${timestamp}] ${message}`;
  elements.eventLog.textContent = `${line}\n${elements.eventLog.textContent}`.trim();
}

function setBusy(target, busy) {
  if (target) {
    target.disabled = busy;
  }
}

function persistSession() {
  localStorage.setItem(storageKeys.apiBaseUrl, state.apiBaseUrl);
  localStorage.setItem(storageKeys.adminUserId, state.adminUserId);
  localStorage.setItem(storageKeys.adminToken, state.adminToken);
  localStorage.setItem(storageKeys.selectedAccountId, state.selectedAccountId);
}

function escapeHtml(value) {
  return `${value ?? ''}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function prettifyJson(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

function certificationConfigFromFields() {
  const advancedConfig = parseJsonField(
    elements.certConfigInput.value,
    '认证 advanced config',
  );
  const config = {
    ...advancedConfig,
    mode: elements.certModeInput.value.trim(),
    startUrlTemplate: elements.certStartUrlTemplateInput.value.trim(),
    title: elements.certTitleInput.value.trim(),
    description: elements.certDescriptionInput.value.trim(),
    successTitle: elements.certSuccessTitleInput.value.trim(),
    successDescription: elements.certSuccessDescriptionInput.value.trim(),
    failureTitle: elements.certFailureTitleInput.value.trim(),
    failureDescription: elements.certFailureDescriptionInput.value.trim(),
  };
  Object.keys(config).forEach((key) => {
    if (config[key] === '') {
      delete config[key];
    }
  });
  return config;
}

function applyCertificationConfig(config) {
  const nextConfig = config || {};
  elements.certModeInput.value = `${nextConfig.mode || ''}`;
  elements.certStartUrlTemplateInput.value = `${nextConfig.startUrlTemplate || ''}`;
  elements.certTitleInput.value = `${nextConfig.title || ''}`;
  elements.certDescriptionInput.value = `${nextConfig.description || ''}`;
  elements.certSuccessTitleInput.value = `${nextConfig.successTitle || ''}`;
  elements.certSuccessDescriptionInput.value = `${nextConfig.successDescription || ''}`;
  elements.certFailureTitleInput.value = `${nextConfig.failureTitle || ''}`;
  elements.certFailureDescriptionInput.value = `${nextConfig.failureDescription || ''}`;

  const advancedConfig = { ...nextConfig };
  delete advancedConfig.mode;
  delete advancedConfig.startUrlTemplate;
  delete advancedConfig.title;
  delete advancedConfig.description;
  delete advancedConfig.successTitle;
  delete advancedConfig.successDescription;
  delete advancedConfig.failureTitle;
  delete advancedConfig.failureDescription;
  elements.certConfigInput.value = prettifyJson(advancedConfig);
}

function parseJsonField(value, fieldName) {
  const raw = `${value || ''}`.trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${fieldName} 不是合法 JSON。`);
  }
}

function formatDateTime(value) {
  if (!value) {
    return '未记录';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('zh-CN', { hour12: false });
}

function statusClass(status) {
  const normalized = `${status || ''}`.trim().toLowerCase();
  if (['approved', 'active', 'published'].includes(normalized)) {
    return `status-${normalized}`;
  }
  if (['submitted', 'under_review', 'need_more_info', 'rejected', 'archived'].includes(normalized)) {
    return `status-${normalized}`;
  }
  return 'status-default';
}

function statusLabel(status) {
  const normalized = `${status || ''}`.trim().toLowerCase();
  const labels = {
    active: '启用',
    approved: '已通过',
    archived: '已归档',
    need_more_info: '待补充',
    published: '已发布',
    rejected: '已拒绝',
    submitted: '已提交',
    under_review: '审核中',
  };
  return labels[normalized] || (status || '未知');
}

function selectedAccount() {
  return state.publicAccounts.find((entry) => entry.id === state.selectedAccountId) || null;
}

function selectedApplicationType() {
  return (
    state.selectedApplicationTypes.find(
      (entry) => entry.id === state.selectedApplicationTypeId,
    ) || null
  );
}

function openCreateAccountModal() {
  elements.createAccountModal.hidden = false;
}

function closeCreateAccountModal() {
  elements.createAccountModal.hidden = true;
}

function clearSession() {
  state.adminToken = '';
  state.adminUserId = '';
  state.publicAccounts = [];
  state.selectedAccountId = '';
  state.selectedApplicationTypeId = '';
  state.selectedApplicationTypes = [];
  state.selectedRuleInterface = null;
  state.selectedApplications = [];
  persistSession();
  render();
  appendLog('已退出管理员登录。');
}

function renderSession() {
  elements.apiBaseUrlInput.value = state.apiBaseUrl;
  elements.adminUserIdInput.value = state.adminUserId;
  elements.sessionUserValue.textContent = state.adminUserId || '未登录';
  elements.sessionTokenValue.textContent = state.adminToken
    ? `${state.adminToken.slice(0, 16)}...`
    : '未获取';
  elements.serverModeBadge.textContent = state.adminToken ? '已连接服务器' : '未连接';
}

function renderAdminAccounts() {
  const html = state.adminAccounts.length
    ? state.adminAccounts
        .map((entry) => {
          const selected = entry.id === state.adminUserId ? ' selected' : '';
          return `<option value="${escapeHtml(entry.id)}"${selected}>${escapeHtml(entry.id)}</option>`;
        })
        .join('')
    : '<option value="">暂无管理员账号</option>';
  elements.adminAccountSelect.innerHTML = html;
}

function renderPublicAccounts() {
  const hasAccounts = state.publicAccounts.length > 0;
  elements.publicAccountsEmpty.hidden = hasAccounts;
  elements.publicAccountsList.innerHTML = hasAccounts
    ? state.publicAccounts
        .map((entry) => {
          const selected = entry.id === state.selectedAccountId ? ' selected' : '';
          const analytics = entry.analytics || {};
          return `
            <article class="account-card${selected}" data-account-id="${escapeHtml(entry.id)}">
              <div class="account-title-row">
                <h3>${escapeHtml(entry.name || entry.id)}</h3>
                <span class="status-badge ${statusClass(entry.status)}">${escapeHtml(statusLabel(entry.status))}</span>
              </div>
              <p class="account-subtitle">${escapeHtml(entry.slug || '')}</p>
              <p class="card-copy">${escapeHtml(entry.summary || '暂无摘要')}</p>
              <div class="meta-row">
                <span class="metric">申请数 ${escapeHtml(analytics.postCount ?? 0)}</span>
                <span class="metric">点击 ${escapeHtml(analytics.totalClickCount ?? 0)}</span>
                <span class="metric">转化 ${escapeHtml(analytics.totalDealCount ?? 0)}</span>
              </div>
            </article>
          `;
        })
        .join('')
    : '';
}

function renderRuleInterface() {
  const account = selectedAccount();
  const rule = state.selectedRuleInterface;
  const interfaces = rule?.interfaces || {};
  const certification = interfaces.certification || {};
  const submission = interfaces.submission || {};
  const connection = interfaces.connection || {};

  elements.selectedAccountTitle.textContent = account ? account.name || account.id : '公众号详情';
  elements.selectedAccountSubtitle.textContent = account
    ? `${account.slug || ''} · ${account.summary || '未填写摘要'}`
    : '尚未选择公众号';

  elements.ruleTitleInput.value = rule?.title || '';
  elements.ruleDescriptionInput.value = rule?.description || '';
  elements.ruleActiveInput.checked = rule?.isActive === true;
  elements.certEnabledInput.checked = certification.enabled === true;
  elements.certEndpointInput.value = certification.endpointKey || '';
  applyCertificationConfig(certification.config || {});
  elements.submissionEnabledInput.checked = submission.enabled === true;
  elements.submissionEndpointInput.value = submission.endpointKey || '';
  elements.submissionConfigInput.value = prettifyJson(submission.config || {});
  elements.connectionEnabledInput.checked = connection.enabled === true;
  elements.connectionEndpointInput.value = connection.endpointKey || '';
  elements.connectionConfigInput.value = prettifyJson(connection.config || {});
  elements.extensionsConfigInput.value = prettifyJson(interfaces.extensions || {});
}

function renderApplicationTypes() {
  const hasTypes = state.selectedApplicationTypes.length > 0;
  elements.applicationTypesEmpty.hidden = hasTypes;
  elements.applicationTypesList.innerHTML = hasTypes
    ? state.selectedApplicationTypes
        .map((entry) => {
          const selected = entry.id === state.selectedApplicationTypeId ? ' selected' : '';
          const capabilityType =
            entry.extraConfig?.submissionCapabilityType === 'certification_application'
              ? '认证'
              : '普通';
          return `
            <article class="account-card${selected}" data-application-type-id="${escapeHtml(entry.id)}">
              <div class="account-title-row">
                <h3>${escapeHtml(entry.name || entry.id)}</h3>
                <span class="status-badge ${statusClass(entry.isActive ? 'active' : 'archived')}">${escapeHtml(entry.isActive ? '启用' : '停用')}</span>
              </div>
              <p class="account-subtitle">${escapeHtml(entry.key || '')}</p>
              <p class="card-copy">${escapeHtml(entry.description || '暂无说明')}</p>
              <div class="meta-row">
                <span class="metric">按钮 ${escapeHtml(entry.buttonLabel || '-')}</span>
                <span class="metric">类型 ${escapeHtml(capabilityType)}</span>
              </div>
            </article>
          `;
        })
        .join('')
    : '';

  const current = selectedApplicationType();
  elements.applicationTypeKeyInput.value = current?.key || '';
  elements.applicationTypeNameInput.value = current?.name || '';
  elements.applicationTypeButtonLabelInput.value = current?.buttonLabel || '';
  elements.applicationTypeDescriptionInput.value = current?.description || '';
  elements.applicationTypeActiveInput.checked = current?.isActive ?? true;
  elements.applicationTypeCertificationInput.checked =
    current?.extraConfig?.submissionCapabilityType === 'certification_application';
}

function renderApplications() {
  const hasApplications = state.selectedApplications.length > 0;
  elements.applicationsEmpty.hidden = hasApplications;
  elements.applicationsList.innerHTML = hasApplications
    ? state.selectedApplications
        .map((entry) => `
          <article class="application-card">
            <div class="application-title-row">
              <h4>${escapeHtml(entry.title || entry.id)}</h4>
              <span class="status-badge ${statusClass(entry.status)}">${escapeHtml(statusLabel(entry.status))}</span>
            </div>
            <p class="application-subtitle">
              ${escapeHtml(entry.applicationType?.name || '未命名类型')}
              · 申请人 ${escapeHtml(entry.author?.displayName || entry.author?.profileId || '未知')}
            </p>
            <p class="card-copy">${escapeHtml(entry.coverNote || '暂无补充说明')}</p>
            <div class="meta-row">
              <span class="metric">提交 ${escapeHtml(formatDateTime(entry.submittedAt))}</span>
              <span class="metric">处理 ${escapeHtml(formatDateTime(entry.resolvedAt))}</span>
              <span class="metric">点击 ${escapeHtml(entry.clickCount ?? 0)}</span>
              <span class="metric">转化 ${escapeHtml(entry.dealCount ?? 0)}</span>
            </div>
            <div class="application-actions">
              <button class="secondary-button" type="button" data-review-id="${escapeHtml(entry.id)}" data-review-decision="approved">通过</button>
              <button class="warning-button" type="button" data-review-id="${escapeHtml(entry.id)}" data-review-decision="need_more_info">待补充</button>
              <button class="danger-button" type="button" data-review-id="${escapeHtml(entry.id)}" data-review-decision="rejected">拒绝</button>
            </div>
          </article>
        `)
        .join('')
    : '';
}

function render() {
  renderSession();
  renderAdminAccounts();
  renderPublicAccounts();
  renderApplicationTypes();
  renderRuleInterface();
  renderApplications();
}

async function loadAdminAccounts() {
  appendLog(`读取管理员账号列表：${state.apiBaseUrl}/api/admin/auth/accounts`);
  const body = await requestJson('/api/admin/auth/accounts');
  state.adminAccounts = Array.isArray(body?.data) ? body.data : [];
  if (!state.adminAccounts.length && !state.adminUserId.trim()) {
    state.adminUserId = 'user_internal_ops';
    persistSession();
  }
  renderAdminAccounts();
  appendLog(`管理员账号读取完成，共 ${state.adminAccounts.length} 个。`);
}

async function loginAdmin() {
  const userId = elements.adminUserIdInput.value.trim() || elements.adminAccountSelect.value.trim();
  if (!userId) {
    throw new Error('请先选择或填写管理员 userId。');
  }
  state.adminUserId = userId;
  state.apiBaseUrl = normalizeBaseUrl(elements.apiBaseUrlInput.value);
  persistSession();
  appendLog(`管理员登录：${userId}`);
  const body = await requestJson('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  state.adminToken = body?.data?.token || '';
  if (!state.adminToken) {
    throw new Error('登录成功，但未返回 token。');
  }
  persistSession();
  renderSession();
  appendLog(`管理员 ${userId} 登录成功。`);
}

async function loadPublicAccounts() {
  if (!state.adminToken) {
    state.publicAccounts = [];
    renderPublicAccounts();
    return;
  }
  appendLog('读取公众号列表。');
  const body = await requestJson('/api/admin/public-accounts', {
    method: 'GET',
    withAuth: true,
  });
  state.publicAccounts = Array.isArray(body?.data) ? body.data : [];
  if (state.selectedAccountId && !state.publicAccounts.some((entry) => entry.id === state.selectedAccountId)) {
    state.selectedAccountId = '';
  }
  if (!state.selectedAccountId && state.publicAccounts[0]) {
    state.selectedAccountId = state.publicAccounts[0].id;
  }
  persistSession();
  renderPublicAccounts();
  appendLog(`公众号列表读取完成，共 ${state.publicAccounts.length} 个。`);
}

async function createPublicAccount() {
  const payload = {
    name: elements.createNameInput.value.trim(),
    slug: elements.createSlugInput.value.trim(),
    summary: elements.createSummaryInput.value.trim(),
    description: elements.createDescriptionInput.value.trim(),
    avatarUrl: elements.createAvatarInput.value.trim(),
    coverUrl: elements.createCoverInput.value.trim(),
  };
  if (!payload.name || !payload.slug) {
    throw new Error('公众号名称和 slug 都必填。');
  }

  appendLog(`创建公众号：${payload.slug}`);
  const body = await requestJson('/api/admin/public-accounts', {
    method: 'POST',
    withAuth: true,
    body: JSON.stringify(payload),
  });

  elements.createAccountForm.reset();
  closeCreateAccountModal();

  const createdId = body?.data?.id || '';
  appendLog(`公众号创建成功：${createdId || payload.slug}`);
  await loadPublicAccounts();
  if (createdId) {
    state.selectedAccountId = createdId;
    persistSession();
    await loadSelectedAccount();
  }
}

async function loadSelectedAccount() {
  const accountId = state.selectedAccountId;
  if (!accountId || !state.adminToken) {
    state.selectedApplicationTypes = [];
    state.selectedApplicationTypeId = '';
    state.selectedRuleInterface = null;
    state.selectedApplications = [];
    renderApplicationTypes();
    renderRuleInterface();
    renderApplications();
    return;
  }

  appendLog(`读取公众号详情：${accountId}`);
  const [ruleBody, applicationsBody, applicationTypesBody] = await Promise.all([
    requestJson(`/api/admin/public-accounts/${accountId}/rule-interface`, {
      method: 'GET',
      withAuth: true,
    }),
    requestJson(`/api/admin/public-accounts/${accountId}/posts`, {
      method: 'GET',
      withAuth: true,
    }),
    requestJson(`/api/admin/public-accounts/${accountId}/application-types`, {
      method: 'GET',
      withAuth: true,
    }),
  ]);

  state.selectedRuleInterface = ruleBody?.data || null;
  state.selectedApplications = Array.isArray(applicationsBody?.data) ? applicationsBody.data : [];
  state.selectedApplicationTypes = Array.isArray(applicationTypesBody?.data)
    ? applicationTypesBody.data
    : [];
  if (
    state.selectedApplicationTypeId &&
    !state.selectedApplicationTypes.some(
      (entry) => entry.id === state.selectedApplicationTypeId,
    )
  ) {
    state.selectedApplicationTypeId = '';
  }
  renderRuleInterface();
  renderApplicationTypes();
  renderApplications();
  appendLog(
    `公众号 ${accountId} 已加载，申请类型 ${state.selectedApplicationTypes.length} 个，认证申请 ${state.selectedApplications.length} 条。`,
  );
}

async function saveRuleInterface() {
  const accountId = state.selectedAccountId;
  if (!accountId) {
    throw new Error('请先选择公众号。');
  }

  const payload = {
    title: elements.ruleTitleInput.value.trim(),
    description: elements.ruleDescriptionInput.value.trim(),
    isActive: elements.ruleActiveInput.checked,
    interfaces: {
      certification: {
        enabled: elements.certEnabledInput.checked,
        endpointKey: elements.certEndpointInput.value.trim(),
        config: certificationConfigFromFields(),
      },
      submission: {
        enabled: elements.submissionEnabledInput.checked,
        endpointKey: elements.submissionEndpointInput.value.trim(),
        config: parseJsonField(elements.submissionConfigInput.value, '投稿 config'),
      },
      connection: {
        enabled: elements.connectionEnabledInput.checked,
        endpointKey: elements.connectionEndpointInput.value.trim(),
        config: parseJsonField(elements.connectionConfigInput.value, '连接 config'),
      },
      extensions: parseJsonField(elements.extensionsConfigInput.value, 'extensions'),
    },
  };

  appendLog(`保存规则接口：${accountId}`);
  const body = await requestJson(`/api/admin/public-accounts/${accountId}/rule-interface`, {
    method: 'PUT',
    withAuth: true,
    body: JSON.stringify(payload),
  });
  state.selectedRuleInterface = body?.data || null;
  renderRuleInterface();
  appendLog(`规则接口保存完成：${accountId}`);
}

async function saveApplicationType() {
  const accountId = state.selectedAccountId;
  if (!accountId) {
    throw new Error('请先选择公众号。');
  }

  const key = elements.applicationTypeKeyInput.value.trim();
  const name = elements.applicationTypeNameInput.value.trim();
  if (!key || !name) {
    throw new Error('申请类型的 key 和名称都必填。');
  }

  const payload = {
    key,
    name,
    buttonLabel: elements.applicationTypeButtonLabelInput.value.trim(),
    description: elements.applicationTypeDescriptionInput.value.trim(),
    isActive: elements.applicationTypeActiveInput.checked,
    extraConfig: elements.applicationTypeCertificationInput.checked
      ? { submissionCapabilityType: 'certification_application' }
      : {},
  };

  const current = selectedApplicationType();
  if (current) {
    appendLog(`更新申请类型：${current.id}`);
    await requestJson(
      `/api/admin/public-accounts/${accountId}/application-types/${current.id}`,
      {
        method: 'PUT',
        withAuth: true,
        body: JSON.stringify(payload),
      },
    );
  } else {
    appendLog(`创建申请类型：${payload.key}`);
    await requestJson(`/api/admin/public-accounts/${accountId}/application-types`, {
      method: 'POST',
      withAuth: true,
      body: JSON.stringify(payload),
    });
  }

  await loadSelectedAccount();
}

function resetApplicationTypeForm() {
  state.selectedApplicationTypeId = '';
  renderApplicationTypes();
}

async function reviewApplication(applicationId, decision) {
  if (!applicationId) {
    throw new Error('缺少 applicationId。');
  }
  const note =
    window.prompt(
      decision === 'approved'
        ? '审核备注，可留空'
        : decision === 'need_more_info'
          ? '补充说明，建议填写要补什么'
          : '拒绝原因，建议填写给申请人',
      '',
    ) || '';

  appendLog(`审核认证申请：${applicationId} -> ${decision}`);
  await requestJson(`/api/applications/${applicationId}/reviews`, {
    method: 'POST',
    withAuth: true,
    body: JSON.stringify({
      decision,
      note: note.trim(),
    }),
  });
  await loadSelectedAccount();
}

function bindEvents() {
  elements.apiBaseUrlInput.addEventListener('change', () => {
    state.apiBaseUrl = normalizeBaseUrl(elements.apiBaseUrlInput.value);
    persistSession();
    renderSession();
  });

  elements.adminAccountSelect.addEventListener('change', () => {
    elements.adminUserIdInput.value = elements.adminAccountSelect.value;
  });

  elements.refreshAccountsButton.addEventListener('click', async () => {
    setBusy(elements.refreshAccountsButton, true);
    try {
      state.apiBaseUrl = normalizeBaseUrl(elements.apiBaseUrlInput.value);
      persistSession();
      await loadAdminAccounts();
      render();
    } catch (error) {
      appendLog(`刷新管理员失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.refreshAccountsButton, false);
    }
  });

  elements.loginButton.addEventListener('click', async () => {
    setBusy(elements.loginButton, true);
    try {
      await loginAdmin();
      await loadPublicAccounts();
      await loadSelectedAccount();
      render();
    } catch (error) {
      appendLog(`登录失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.loginButton, false);
    }
  });

  elements.logoutButton.addEventListener('click', () => {
    clearSession();
  });

  elements.openCreateAccountButton.addEventListener('click', () => {
    openCreateAccountModal();
  });

  elements.closeCreateAccountButton.addEventListener('click', () => {
    closeCreateAccountModal();
  });

  elements.createAccountButton.addEventListener('click', () => {
    closeCreateAccountModal();
  });

  elements.createAccountBackdrop.addEventListener('click', () => {
    closeCreateAccountModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.createAccountModal.hidden) {
      closeCreateAccountModal();
    }
  });

  elements.createAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBusy(elements.submitCreateAccountButton, true);
    try {
      await createPublicAccount();
      render();
    } catch (error) {
      appendLog(`创建公众号失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.submitCreateAccountButton, false);
    }
  });

  elements.refreshPublicAccountsButton.addEventListener('click', async () => {
    setBusy(elements.refreshPublicAccountsButton, true);
    try {
      await loadPublicAccounts();
      await loadSelectedAccount();
      render();
    } catch (error) {
      appendLog(`刷新公众号失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.refreshPublicAccountsButton, false);
    }
  });

  elements.publicAccountsList.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-account-id]');
    if (!card) {
      return;
    }
    state.selectedAccountId = card.dataset.accountId || '';
    persistSession();
    renderPublicAccounts();
    try {
      await loadSelectedAccount();
    } catch (error) {
      appendLog(`读取公众号详情失败：${error.message}`);
      alert(error.message);
    }
  });

  elements.applicationTypesList.addEventListener('click', (event) => {
    const card = event.target.closest('[data-application-type-id]');
    if (!card) {
      return;
    }
    state.selectedApplicationTypeId = card.dataset.applicationTypeId || '';
    renderApplicationTypes();
  });

  elements.resetApplicationTypeButton.addEventListener('click', () => {
    resetApplicationTypeForm();
  });

  elements.reloadSelectedAccountButton.addEventListener('click', async () => {
    setBusy(elements.reloadSelectedAccountButton, true);
    try {
      await loadSelectedAccount();
    } catch (error) {
      appendLog(`刷新当前公众号失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.reloadSelectedAccountButton, false);
    }
  });

  elements.ruleInterfaceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBusy(elements.saveRuleInterfaceButton, true);
    try {
      await saveRuleInterface();
    } catch (error) {
      appendLog(`保存规则失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.saveRuleInterfaceButton, false);
    }
  });

  elements.applicationTypeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBusy(elements.saveApplicationTypeButton, true);
    try {
      await saveApplicationType();
    } catch (error) {
      appendLog(`保存申请类型失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(elements.saveApplicationTypeButton, false);
    }
  });

  elements.applicationsList.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-review-id]');
    if (!button) {
      return;
    }
    setBusy(button, true);
    try {
      await reviewApplication(button.dataset.reviewId, button.dataset.reviewDecision);
    } catch (error) {
      appendLog(`审核申请失败：${error.message}`);
      alert(error.message);
    } finally {
      setBusy(button, false);
    }
  });

  elements.clearLogButton.addEventListener('click', () => {
    elements.eventLog.textContent = '操作日志已清空。';
  });
}

async function bootstrap() {
  render();
  bindEvents();
  try {
    await loadAdminAccounts();
    if (state.adminToken) {
      await loadPublicAccounts();
      await loadSelectedAccount();
    }
    render();
  } catch (error) {
    appendLog(`初始化失败：${error.message}`);
  }
}

bootstrap();
