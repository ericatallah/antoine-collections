const MUSIC_TABLE = 'music';

module.exports = {
  retrieveBooksSql:
    `
    SELECT 
        book.id,
        book.author,
        book.title,
        book_type.type,
        book_sub_type.sub_type,
        book_location.location,
        book_language.language
    FROM book
    INNER JOIN book_type ON book.book_type_id = book_type.id
    INNER JOIN book_sub_type ON book.book_sub_type_id = book_sub_type.id
    INNER JOIN book_location ON book.book_location_id = book_location.id
    INNER JOIN book_language ON book.book_language_id = book_language.id
    `,
  GET_BOOKS_COUNT: 'SELECT COUNT(id) FROM book;',
  GET_TYPES: 'SELECT * FROM book_type;',
  GET_SUB_TYPES: 'SELECT * FROM book_sub_type;',
  GET_LOCATIONS: 'SELECT * FROM book_location;',
  retrieveMusicSql: `SELECT * FROM ${MUSIC_TABLE}`,
  retrieveMusicOrderBy: 'ORDER BY composer ASC, type ASC',
  GET_MUSIC_COUNT: `SELECT COUNT(id) FROM ${MUSIC_TABLE};`,
  GET_MUSIC_TYPES: `SELECT DISTINCT type FROM ${MUSIC_TABLE};`,
  getMusicByType: (type) => `SELECT * FROM ${MUSIC_TABLE} WHERE type=${type} ORDER BY composer ASC;`,
};