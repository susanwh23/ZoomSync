var express = require('express');
var router = express.Router();
var axios = require('axios');

const { ZOOM_API_BASE_URL } = require('../constants');

// get Participants infornation

router.get('/', async (req, res) => {
    try {
        
        const { headerConfig, query } = req;
        const meetingId = query.meetingId;
      
        console.log(' meetingId is  ', meetingId);
        console.log(' headerConfig is  ', headerConfig);
     
        const response  = await axios.get(`${ZOOM_API_BASE_URL}/past_meetings/${meetingId}`, headerConfig);
      
        
        const meetingInfo = response.data;
        res.render('meetingInfo', { meetingInfo });

    } catch (error) {
        console.error('Error fetching Zoom meeting participants:', error);
        res.status(500).send('Error fetching Zoom meeting participants');
    }
});

module.exports = router;



