const {schedule} = require('@netlify/functions');
const axios = require("axios");


exports.handler = schedule("0 */6 * * *", async function(event, context){

    await axios.post(process.env.REBUILD_TRIGGER_URL, {});

    return {
        statusCode: 200,
    };
});