
/* anon modal */
function create_anon_confirmaion_modal() {
	const anon_confirmation_modal = document.createElement('div');
	anon_confirmation_modal.id = 'anon-account-modal';
	anon_confirmation_modal.className = 'modal fade show';
	anon_confirmation_modal.style.display = 'block';
	anon_confirmation_modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	
	anon_confirmation_modal.innerHTML = `
	  <div class="modal-dialog modal-dialog-centered modal-sm">
		<div class="content modal-content">
		  <div class="modal-header border-0 py-3">
			<h5 class="modal-title text-danger">
			  <i class="fas fa-exclamation-triangle me-2"></i>Anonymize Account
			</h5>
			<button type="button" class="btn-close btn-close-white" id="close-anon-modal"></button>
		  </div>
		  <div class="modal-body
		  px-3 py-2">
			<p class="text-white mb-0">This action will log you out and switch to a temporary account. Are you sure you want to proceed? </p>
		  </div>
		  <div class="modal-footer border-0 py-3">
			<button id="anon-acc-confirm" class="btn btn-danger btn-sm">
			  <i class="fas fa-user-secret me-2"></i>Anonymize
			</button>
			<button id="anon-acc-cancel" class="btn btn-outline-light btn-sm">
			  Cancel
			</button>
		  </div>
		</div>
	  </div>
	`;
	return anon_confirmation_modal;
  }
  
  