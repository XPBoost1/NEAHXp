document.addEventListener('DOMContentLoaded', () => {
    // Modal Logic
    const modalBackdrop = document.getElementById('blog-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const blogCards = document.querySelectorAll('.blog-card');

    // Modal Elements to Update
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDate = document.getElementById('modal-date');
    const modalBody = document.getElementById('modal-body');

    // Open Modal
    blogCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();

            const data = {
                title: card.dataset.title,
                category: card.dataset.category,
                date: card.dataset.date,
                content: card.dataset.content
            };

            // Populate Modal
            modalTitle.textContent = data.title;
            modalCategory.textContent = data.category;
            modalDate.textContent = data.date;

            // Parse and set content (simple HTML support)
            modalBody.innerHTML = data.content;

            // Show Modal
            modalBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close Event Listeners
    modalCloseBtn.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
            closeModal();
        }
    });
});
