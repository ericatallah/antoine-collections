const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');
const constants = require('../utils');

let cached_count = 0;

const getJson = (sqlResult) => {
    const jsonArr = [];

    const checkType = (item) => {
        if (item.constructor.name.toLowerCase() === 'array') {
            item.forEach(obj => {
                checkType(obj);
            });
        } else if (item.constructor.name.toLowerCase() === 'rowdatapacket') {
            jsonArr.push(item);
        }
    };
    
    checkType(sqlResult);
    return jsonArr;
};

router.get('/', async (req, res) => {
    const sql = `${constants.retrieveMusicSql} LIMIT 30;`;
    
    let err;
    const countResult = await pool.query(constants.GET_MUSIC_COUNT).catch(e => err = e);
    cached_count = countResult[0]['COUNT(id)'];
    const types = await pool.query(constants.GET_MUSIC_TYPES).catch(e => err = e);
    const defaultType = types[0] && types[0].type ? types[0].type : 'Ballet';
    const byTypeCountResult = await pool.query(constants.getMusicByType(pool.escape(defaultType))).catch(e => err = e);
    const byTypeCount = byTypeCountResult.length;
    const music = await pool.query(sql).catch(e => err = e);

    if (err) {
        const message = 'There was an error retrieving your music, please reload this page.';
        const messageType = 'danger';
        console.error('Sql error: ', err);
        res.render('music/music', { message, messageType });
    } else {
        res.render('music/music', { music, count: cached_count, types, byTypeCount });
    }
});

router.get('/musicbytype/:type', async (req, res) => {
    const type = pool.escape(req.params.type);
    const sql = constants.getMusicByType(type);
    let err;
    if (!cached_count) {
        const countResult = await pool.query(constants.GET_MUSIC_COUNT).catch(e => err = e);
        cached_count = countResult[0]['COUNT(id)'];
    }
    const music = await pool.query(sql).catch(e => err = e);
    const types = await pool.query(constants.GET_MUSIC_TYPES).catch(e => err = e);

    if (err) {
        const message = 'There was an error retrieving your music, please reload this page.';
        const messageType = 'danger';
        console.error('Sql error: ', err);
        res.status(500).json({ message, messageType });
    } else {
        res.render('music/music', { music, count: cached_count, types, byTypeCount: music.length, selected_music_type: req.sanitize(req.params.type) });
    }
});

// Search music by query parameter string
router.get('/searchmusic', async (req, res) => {
    const s = pool.escape(`%${req.query.musicsearch.trim()}%`);
    let message = 'Please enter a search term first.';
    let messageType = 'danger';
    
    if (!req.query.musicsearch) {
        res.render('music/music', { message, messageType });
    } else {
        const sql = 
            `${constants.retrieveMusicSql}
            WHERE
                composer LIKE ${s} OR 
                work LIKE ${s} OR 
                work_number LIKE ${s} OR 
                item_number LIKE ${s} OR 
                conductor LIKE ${s}
                ${constants.retrieveMusicOrderBy}`

        let err;
        const musicResult = await pool.query(sql).catch(e => err = e);
        const music = getJson(musicResult);

        const countResult = await pool.query(constants.GET_MUSIC_COUNT).catch(e => err = e);
        const count = countResult[0]['COUNT(id)'];
        const types = await pool.query(constants.GET_MUSIC_TYPES).catch(e => err = e);
        const defaultType = types[0] && types[0].type ? types[0].type : 'Ballet';
        const byTypeCountResult = await pool.query(constants.getMusicByType(pool.escape(defaultType))).catch(e => err = e);
        const byTypeCount = byTypeCountResult[0]['COUNT(id)'];
        
        if (err) {
            message = 'There was an error with that search, please try it again.';
            console.error('Sql error: ', err);
            res.render('music/music', { message, messageType });
        } else {
            res.render('music/music', { music, count, types, byTypeCount });
        }
    }
});

// Insert music get and post
router.get('/addmusic', async (req, res) => {
    let messageType = 
        req.query.success === '1' ? 'success' : 
        req.query.success === '0' ? 'danger' : false;

    let message;

    let err;
    const types = await pool.query(constants.GET_MUSIC_TYPES).catch(e => err = e);
    
    if (err) {
        messageType = 'danger';
        message = 'There was an error, please try that action again.';
        console.error('SQL Error: ', err);
        res.render('music/music', { messageType, message });
    } else {
        message = messageType === 'danger' ? 
            'There was an error trying to add this piece, please try again.' : 
            'This piece has been added to your collection.';

        const templateData = {
            message,
            messageType,
            types,
        };
        res.render('music/addmusic', templateData);
    }
});

router.post('/insertmusic', async (req, res) => {
    const musical_piece = { 
        composer: req.body.composer.trim(), 
        work: req.body.work.trim(), 
        work_number: req.body.work_number.trim(), 
        type: req.body.type, 
        item_number: req.body.item_number.trim(),
        conductor: req.body.conductor.trim(), 
    };

    let err;
    const sql = 'INSERT INTO music SET ?';

    const result = await pool.query(sql, musical_piece).catch(e => err = e);
    if (err) {
        console.error('SQL Error: ', err);
        res.redirect('/music/addmusic?success=0');
    } else {
        res.redirect('/music/addmusic?success=1');
    }
});

// Update music GET and POST (by id)
router.get('/updatemusic', async (req, res) => {
    let messageType = 
        req.query.success === '1' ? 'success' : 
        req.query.success === '0' ? 'danger' : false;

    let message;
     
    const id = pool.escape(req.query.id);
    const sql =
        `
        SELECT * FROM music WHERE id = ${id};
        ${constants.GET_MUSIC_TYPES};
        `;

    let err;
    const results = await pool.query(sql).catch(e => err = e);
    
    if (err) {
        messageType = 'danger';
        message = 'There was an error, please try that action again.';
        console.error('SQL Error: ', err);
        res.render('music/music', { messageType, message });
    } else {
        message = messageType === 'danger' ? 
            'There was an error trying to update this piece, please try again.' : 
            'This piece has been updated.';

        const templateData = {
            messageType,
            message,
            music: results[0][0],
            types: results[1],
        }
        res.render('music/updatemusic', templateData);
    }
});

router.post('/updatemusic/:id', async (req, res) => {
    const id = req.params.id;
    const musical_piece = { 
        id,
        composer: req.body.composer.trim(), 
        work: req.body.work.trim(), 
        work_number: req.body.work_number.trim(), 
        type: req.body.type, 
        item_number: req.body.item_number.trim(),
        conductor: req.body.conductor.trim(), 
    };

    let err;
    const sql = `UPDATE music SET ? WHERE id = ${pool.escape(id)};`;

    const result = await pool.query(sql, musical_piece).catch(e => err = e);
    if (err) {
        console.error('SQL Error: ', err);
        res.redirect(`/music/updatemusic?id=${id}&success=0`);
    } else {
        res.redirect(`/music/updatemusic?id=${id}&success=1`);
    }
});

// Delete music by id
router.delete('/deletemusic/:id', async (req, res) => {
    const id = pool.escape(req.params.id);
    const sql = 
        `
        SELECT composer, work FROM music WHERE id = ${id};
        DELETE FROM music WHERE id = ${id};
        `;

    let err;
    const deleteResult = await pool.query(sql).catch(e => err = e);
    const result = getJson(deleteResult);
    
    if(err) {
        console.error('SQL Error: ', err);
        res.status(500).json({ fail: true, msg: 'There was a problem attempting to delete this piece, please try again.' });
    } else {
        res.status(200).json({ fail: false, msg: `${result[0].composer}: ${result[0].work} has been removed.` });
    }
});

module.exports = router;
