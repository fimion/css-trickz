const {schedule} = require('@netlify/functions');
const axios = require("axios");



exports.handler = schedule(process.env.CRONTAB_STRING, async function(event, context){

    await axios.post(process.env.REBUILD_TRIGGER_URL, {});

    return {
        statusCode: 200,
    };
});