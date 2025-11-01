const API_BASE_URL = 'http://localhost:3000/api/salaries';

let editingId = null;
let deleteId = null;

const elements = {
  modal: document.getElementById('modal'),
  deleteModal: document.getElementById('deleteModal'),
  modalTitle: document.getElementById('modalTitle'),
  salaryForm: document.getElementById('salaryForm'),
  salaryTableBody: document.getElementById('salaryTableBody'),
  addNewBtn: document.getElementById('addNewBtn'),
  closeModal: document.getElementById('closeModal'),
  cancelBtn: document.getElementById('cancelBtn'),
  filterBtn: document.getElementById('filterBtn'),
  clearFilterBtn: document.getElementById('clearFilterBtn'),
  closeDeleteModal: document.getElementById('closeDeleteModal'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  startDateFilter: document.getElementById('startDate'),
  endDateFilter: document.getElementById('endDate'),
};

const formFields = {
  type: document.getElementById('type'),
  amount: document.getElementById('amount'),
  paidTo: document.getElementById('paidTo'),
  paidOn: document.getElementById('paidOn'),
  paidThrough: document.getElementById('paidThrough'),
  startDate: document.getElementById('startDateInput'),
  endDate: document.getElementById('endDateInput'),
  remarks: document.getElementById('remarks'),
};

const openModal = () => {
  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeModalHandler = () => {
  elements.modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  resetForm();
};

const openDeleteModal = (id) => {
  deleteId = id;
  elements.deleteModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeDeleteModalHandler = () => {
  elements.deleteModal.classList.remove('active');
  document.body.style.overflow = 'auto';
  deleteId = null;
};

const resetForm = () => {
  elements.salaryForm.reset();
  editingId = null;
  elements.modalTitle.textContent = 'Add Salary';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const showLoading = () => {
  elements.salaryTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="loading">Loading salaries...</td>
    </tr>
  `;
};

const showEmpty = () => {
  elements.salaryTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="empty-state">No salary records found</td>
    </tr>
  `;
};

const showError = (message) => {
  elements.salaryTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="empty-state" style="color: var(--danger);">${message}</td>
    </tr>
  `;
};

const fetchSalaries = async (filters = {}) => {
  showLoading();

  try {
    let url = API_BASE_URL;
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch salaries');
    }

    const salaries = await response.json();
    renderSalaries(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    showError('Failed to load salaries. Please try again.');
  }
};

const renderSalaries = (salaries) => {
  if (salaries.length === 0) {
    showEmpty();
    return;
  }

  elements.salaryTableBody.innerHTML = salaries.map(salary => `
    <tr>
      <td>${salary.type}</td>
      <td class="amount">${formatCurrency(salary.amount)}</td>
      <td>${salary.paidTo}</td>
      <td>${formatDate(salary.paidOn)}</td>
      <td>${salary.paidThrough}</td>
      <td class="period">
        ${formatDate(salary.startDate)} - ${formatDate(salary.endDate)}
      </td>
      <td>${salary.remarks || '-'}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary btn-sm" onclick="editSalary(${salary.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSalaryPrompt(${salary.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const createSalary = async (salaryData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(salaryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create salary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating salary:', error);
    throw error;
  }
};

const updateSalary = async (id, salaryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(salaryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update salary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating salary:', error);
    throw error;
  }
};

const deleteSalary = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete salary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting salary:', error);
    throw error;
  }
};

const getSalary = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch salary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching salary:', error);
    throw error;
  }
};

window.editSalary = async (id) => {
  try {
    const salary = await getSalary(id);

    editingId = id;
    elements.modalTitle.textContent = 'Edit Salary';

    formFields.type.value = salary.type;
    formFields.amount.value = salary.amount;
    formFields.paidTo.value = salary.paidTo;
    formFields.paidOn.value = salary.paidOn;
    formFields.paidThrough.value = salary.paidThrough;
    formFields.startDate.value = salary.startDate;
    formFields.endDate.value = salary.endDate;
    formFields.remarks.value = salary.remarks || '';

    openModal();
  } catch (error) {
    alert('Failed to load salary record');
  }
};

window.deleteSalaryPrompt = (id) => {
  openDeleteModal(id);
};

elements.addNewBtn.addEventListener('click', () => {
  resetForm();
  openModal();
});

elements.closeModal.addEventListener('click', closeModalHandler);
elements.cancelBtn.addEventListener('click', closeModalHandler);

elements.closeDeleteModal.addEventListener('click', closeDeleteModalHandler);
elements.cancelDeleteBtn.addEventListener('click', closeDeleteModalHandler);

elements.modal.addEventListener('click', (e) => {
  if (e.target === elements.modal) {
    closeModalHandler();
  }
});

elements.deleteModal.addEventListener('click', (e) => {
  if (e.target === elements.deleteModal) {
    closeDeleteModalHandler();
  }
});

elements.salaryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const salaryData = {
    type: formFields.type.value,
    amount: parseFloat(formFields.amount.value),
    paidTo: formFields.paidTo.value,
    paidOn: formFields.paidOn.value,
    paidThrough: formFields.paidThrough.value,
    startDate: formFields.startDate.value,
    endDate: formFields.endDate.value,
    remarks: formFields.remarks.value,
  };

  try {
    if (editingId) {
      await updateSalary(editingId, salaryData);
    } else {
      await createSalary(salaryData);
    }

    closeModalHandler();
    fetchSalaries();
  } catch (error) {
    alert(error.message || 'Failed to save salary record');
  }
});

elements.confirmDeleteBtn.addEventListener('click', async () => {
  if (!deleteId) return;

  try {
    await deleteSalary(deleteId);
    closeDeleteModalHandler();
    fetchSalaries();
  } catch (error) {
    alert(error.message || 'Failed to delete salary record');
  }
});

elements.filterBtn.addEventListener('click', () => {
  const filters = {
    startDate: elements.startDateFilter.value,
    endDate: elements.endDateFilter.value,
  };

  fetchSalaries(filters);
});

elements.clearFilterBtn.addEventListener('click', () => {
  elements.startDateFilter.value = '';
  elements.endDateFilter.value = '';
  fetchSalaries();
});

fetchSalaries();
