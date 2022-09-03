const {schedule} = require('@netlify/functions');
const axios = require("axios");


const crontab = process.env.CRONTAB_STRING || `0 */6 * * *`

exports.handler = schedule(crontab, async function(event, context){

    await axios.post(process.env.REBUILD_TRIGGER_URL, {});

    return {
        statusCode: 200,
    };
});