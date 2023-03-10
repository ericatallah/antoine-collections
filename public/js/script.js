require('../css/styles.css');
const $ = require('jquery');
import 'bootstrap/dist/js/bootstrap.bundle';
const Utilities = require('./utilities');
let $header;
let $libraryStats;

// Remove any visible alerts on page load
window.onload = () => {
    Utilities.removeAlert();
    $header = $('header');
    $libraryStats = $('#library-stats');
    $(document).trigger('scroll');
};

// Start: sticky search box functionality
$(document).scroll(() => {
    const scrollTop = $(document).scrollTop();
    const offsetHeight = $header.outerHeight() + $libraryStats.outerHeight() + 25; // plus extra padding

    if (scrollTop > offsetHeight) {
        Utilities.searchBooksForm.addClass('sticky');
    } else {
        Utilities.searchBooksForm.removeClass('sticky');
    }
});
// End: sticky search box functionality

const removeBook = async elem => {
    const id = elem.getAttribute('data-bookid');
    
    try {
        const result = await fetch(`/books/deletebook/${id}`, { method: 'DELETE' });
        const jsonResponse = await result.json();
        Utilities.removeBookModal.modal('hide');
        Utilities.showAlert('danger', jsonResponse.msg, () => {
            window.location.reload(true);
        });
    } catch (err) {
        console.error('Error: ', err);
        Utilities.showAlert('danger', err.msg);
    }
};

const removeMusic = async elem => {
    const id = elem.getAttribute('data-musicid');
    
    try {
        const result = await fetch(`/music/deletemusic/${id}`, { method: 'DELETE' });
        const jsonResponse = await result.json();
        Utilities.removeMusicModal.modal('hide');
        Utilities.showAlert('danger', jsonResponse.msg, () => {
            window.location.reload(true);
        });
    } catch (err) {
        console.error('Error: ', err);
        Utilities.showAlert('danger', err.msg);
    }
};

const setDataAttr = elem => {
    const id = elem.getAttribute('data-bookid');
    document.getElementById('removeBookConfirm').setAttribute('data-bookid', id);
};

const setDataAttrMusic = elem => {
    const id = elem.getAttribute('data-musicid');
    document.getElementById('removeMusicConfirm').setAttribute('data-musicid', id);
};

const getBookInfo = async elem => {
    Utilities.showLoader();
    try {
        const bookResponse = await fetch(`/books/getbookinfo?bookquery=${elem.getAttribute('data-query')}`);
        const bookData = await bookResponse.json();

        console.log(bookData);
        // stop here and show console.log on server side (bookquery), and then console.log on client side once server route is complete.

        if (!bookData) {
            Utilities.showAlert('danger', 'Sorry, we could not find any information on that volume.');
            Utilities.showLoader();
            return false;
        }
    
        const title = bookData.volumeInfo.title || '';
        const subtitle = bookData.volumeInfo.subtitle || '';
        const imageUrl = bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.smallThumbnail : false;
        const publishedDate = bookData.volumeInfo.publishedDate || '';
        const pageCount = bookData.volumeInfo.pageCount || '';
        const description = bookData.volumeInfo.description || '';
        const categories = bookData.volumeInfo.categories ? bookData.volumeInfo.categories.join(', ') : '';
        const authors = bookData.volumeInfo.authors ? bookData.volumeInfo.authors.join(', ') : '';
    
        Utilities.bookDetailsModal.find('.modal-title').text(`${title} ${subtitle}`);
        Utilities.bookDetailsModal.find('img').prop('src', imageUrl ? imageUrl : Utilities.defaultBookImage);
        Utilities.bookDetailsModal.find('.published').text(publishedDate);
        Utilities.bookDetailsModal.find('.pages').text(pageCount);
        Utilities.bookDetailsModal.find('.categories').text(categories);
        Utilities.bookDetailsModal.find('.authors').text(authors);
        Utilities.bookDetailsModal.find('.description').text(description);
        
        Utilities.showLoader();
        Utilities.bookDetailsModal.modal('show');
    } catch (err) {
        console.error('Fetch error: ', err);
        Utilities.showAlert('danger', err.message);
        Utilities.showLoader();
    }
};

$('#search-books-submit').on('click', event => {
    event.preventDefault(); // prevent form from automatically submitting
    if ($('#book-search').val().trim()) {
        $('#search-books-form').submit();
    } else {
        Utilities.showAlert('danger', 'Please enter a search term first.');
    }
});

$('#search-music-submit').on('click', event => {
    event.preventDefault(); // prevent form from automatically submitting
    if ($('#music-search').val().trim()) {
        $('#search-music-form').submit();
    } else {
        Utilities.showAlert('danger', 'Please enter a search term first.');
    }
});

$('#books-table').on('click', '.get-book-info', e => {
    getBookInfo(e.currentTarget);
});

$('#book-cards-list').on('click', '.get-book-info', e => {
    getBookInfo(e.currentTarget);
});
// end new stuff...


$('#books-table').on('click', '.remove-book', e => {
    setDataAttr(e.currentTarget);
});

$('#book-cards-list').on('click', '.remove-book', e => {
    setDataAttr(e.currentTarget);
});

$('#music-table').on('click', '.remove-music', e => {
    setDataAttrMusic(e.currentTarget);
});

$('#music-cards-list').on('click', '.remove-music', e => {
    setDataAttrMusic(e.currentTarget);
});

// triggered from "removeBookModal" button
$('#removeBookConfirm').on('click', e => {
    removeBook(e.currentTarget);
});

// triggered from "removeMusicModal" button
$('#removeMusicConfirm').on('click', e => {
    removeMusic(e.currentTarget);
});

$('#type-count').on('change', async function () {
    const id = $(this).val();
    window.location.href = `/books/booksbytype/${id}`;
});

$('#music-type-count').on('change', async function () {
    const id = $(this).val();
    window.location.href = `/music/musicbytype/${id}`;
});
