const $ = require('jquery');
const self = module.exports = {
    alertTimeout: null,
    searchBooksForm: $('#search-books-form'),
    removeBookModal: $('#removeBookModal'),
    searchMusicForm: $('#search-music-form'),
    removeMusicModal: $('#removeMusicModal'),
    bookDetailsModal: $('#bookDetailsModal'),
    defaultBookImage: 'https://via.placeholder.com/428x695.png?text=No+Image+Available',
    showLoader: () => {
        document.getElementById('loadingSpinner').classList.toggle('show');
    },
    showAlert: (type, msg, callback) => {
        const alertStr = 
            `<div class="alert alert-${type} fade show" role="alert">
                <strong>${msg}</strong>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`;
    
        $('body').prepend(alertStr);
        self.removeAlert(callback);
    },
    removeAlert: callback => {
        clearTimeout(self.alertTimeout);
        self.alertTimeout = setTimeout(() => {
            $('.alert').alert('close');
            if (callback) callback();
        }, 3000);
    }
};