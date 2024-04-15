var express = require('express');
var router = express.Router();
var axios = require('axios');

const { ZOOM_API_BASE_URL } = require('../constants');

// get Participants infornation

router.get('/', async (req, res) => {
    try {
        const { headerConfig, query } = req;
        let meetingId = query.meetingId;
      /** 
      * If you provide a meeting ID, the API will return a response for the latest meeting instance.
      * If you provide a meeting UUID that begins with a / character or contains the // characters, you must double-encode the meeting UUID before making an API request.
      */
        console.log(' meetingId is  ', meetingId);
        console.log(' headerConfig is  ', headerConfig);

          if (meetingId.startsWith('/') || meetingId.includes('//')) 
          {
              const encodedMeetingID = encodeURIComponent(meetingId);
              meetingId = encodeURIComponent(encodedMeetingID);
              console.log('Double-encode meetingId is  ', meetingId);
          } 
     
        // Create a function that get one page participants info
       const getOnePageParticipants = async (pageToken = '') => {

         let zoomAPIURL = `${ZOOM_API_BASE_URL}/past_meetings/${meetingId}/participants`;
         if (pageToken)
               zoomAPIURL = `${zoomAPIURL}?next_page_token=${pageToken}`;
          
        console.log(' zoomAPIURL is  ', zoomAPIURL);

          try {
                const response = await axios.get(zoomAPIURL,headerConfig );
                return response.data;
              } catch (error) {
                console.error('Error fetching participants:', error);
                throw error;
             }
        };

    let participants = [];
    let nextPageToken = '';
    let totalParticipants = 0;

    // get the first page participants info
    let result = await getOnePageParticipants();
    totalParticipants = result.total_records;
    participants = result.participants;

    // if there are more pages, get all  pages participants info.
    while (result.next_page_token) {
        nextPageToken = result.next_page_token;
        result = await getOnePageParticipants(nextPageToken);
        participants = participants.concat(result.participants);
      }
    
    participants.sort((a, b) => new Date(a.join_time) - new Date(b.join_time));
    console.log(' participants is  ', participants );
    
    res.render('participantsInfo', { participants: participants, numParticipants: totalParticipants });

    } catch (error) {
        console.error('Error fetching Zoom meeting participants:', error);
        res.status(500).send('Error fetching Zoom meeting participants');
    }
});

module.exports = router;