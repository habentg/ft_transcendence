const messagebox_btn = document.querySelector('.close_messagebox');

if (messagebox_btn) {
    messagebox_btn.addEventListener('click', () => {
        const messagebox = document.querySelector('.messagebox');
        messagebox.style.display = 'none';
        console.log('messagebox closed');
    });
}