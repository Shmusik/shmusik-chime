require('dotenv').load();
require('body-parser').json();


const AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
const pinpoint = new AWS.Pinpoint({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');
pinpoint.endpoint = new AWS.Endpoint('pinpoint.us-east-1.amazonaws.com')
var extMeetingId = 'testMeeting';

async function createMeeting(request, response) {
  const requestId = request.meetingId;
  const region = 'us-east-1'; // Media Region
  extMeetingId = request.meetingName;

  // console.log(request.body.meetingName);
  try {
    const meeting = await chime.createMeeting({
      ClientRequestToken: requestId,
      MediaRegion: region,
      ExternalMeetingId: extMeetingId,
    }).promise();
    return response.send(meeting);
  }
  catch (err) {
    console.log('createMeeting failed: ' + err.message);
    return response.send(err.message);
  }
}

async function createJoinMeeting(request, response) {
  const callType = request.query.callType;
  const requestId = request.query.meetingId;
  const region = 'us-east-1'; // Media Region
  extMeetingId = request.query.name;
  
  if (callType == "outgoing") {
    try {
      const meeting = await chime.createMeeting({
        ClientRequestToken: requestId,
        MediaRegion: region,
        ExternalMeetingId: extMeetingId,
      }).promise();

      console.log(meeting);
  
      const attendee = (await chime.createAttendee({
        // The meeting ID of the created meeting to add the attendee to
        MeetingId: meeting.Meeting.MeetingId,
        ExternalUserId: extMeetingId,
      }).promise());
  
      let joinInfo = {
        JoinInfo: {
          Meeting: meeting,
          Attendee: attendee,
          PrimaryExternalMeetingId: ""
        },
      };
    
      return response.send(joinInfo);
    }
    catch (err) {
      console.log('createMeeting failed: ' + err.message);
    }
  } else {
    try {
      const meeting = await chime.getMeeting({
        MeetingId: request.query.meetingId,
      }).promise();
  
      const attendee = (await chime.createAttendee({
        // The meeting ID of the created meeting to add the attendee to
        MeetingId: meeting.Meeting.MeetingId,
        ExternalUserId: extMeetingId,
      }).promise());
  
      let joinInfo = {
        JoinInfo: {
          Meeting: meeting,
          Attendee: attendee,
          PrimaryExternalMeetingId: ""
        },
      };
    
      return response.send(joinInfo);
    }
    catch (err) {
      console.log('createMeeting failed: ' + err.message);
    }
  }

  
}

async function getMeeting(request, response) {
  try {
    const meeting = await chime.getMeeting({
      MeetingId: request.query.meetingId,
    }).promise();
    return response.send(meeting);
  }
  catch (err) {
    console.log('getMeeting failed: ' + err.message);
    return response.send(err.message);
  }
}

async function deleteMeeting(request, response) {
  try {
    const meeting = await chime.deleteMeeting({
      MeetingId: request.query.meetingId
    }).promise();
    return response.send(meeting);
  }
  catch (err) {
    console.log('deleteMeeting failed: ' + err.message);
    return response.send(err.message);
  }
}

async function createAttendee(request, response) {
  try {
    const attendee = (await chime.createAttendee({
      // The meeting ID of the created meeting to add the attendee to
      MeetingId: request.meetingId,
      ExternalUserId: request.username,
    }).promise());
    return response.send(attendee);
  }
  catch (err) {
    // handle error - you can retry with the same externalUserId
    console.log("Unable to create attendee:", err.message);
    return response.send(err.message); 
  }
}

async function updateEndpoint(request, response) {
  let endpointRequest = {
    Address: request.address,
    ChannelType: request.channelType,
    OptOut: request.optOut,
    EndpointStatus: request.endpointStatus
  };

  try {
    const updateEndpoint = (await pinpoint.updateEndpoint({
      // The parameters that need to be passed to create/update the endpoint
      ApplicationId: request.applicationId,
      EndpointId: request.endpointId,
      EndpointRequest: endpointRequest,
    }).promise());
    return response.send(updateEndpoint);
  }
  catch (err) {
    console.log("Unable to update endpoint:", err.message);
    return response.send(err.message);
  }
}

async function sendNotification(request, response) {
  
  var endpoint = {};
  endpoint[request.endpoint] = {};

  let messageRequest = {
    MessageConfiguration: {
      APNSMessage: {
        Action: "OPEN_APP",
        APNSPushType: "voip",
        Data: {
          MeetingId: request.meetingId,
          Caller: request.caller,
          CallType: request.callType
        }
      }
    },
    Endpoints: endpoint
  };

  try {
    const sendNotification = (await pinpoint.sendMessages({
      ApplicationId: request.applicationId,
      MessageRequest: messageRequest,
    }).promise());
    console.log(sendNotification);
    console.log(messageRequest);
    return response.send(sendNotification);
  }
  catch (err) {
    console.log("Unable to send notification:", err.message);
    console.log(endpoint);
    return response.send(err.message);
  }
}

exports.createMeeting = createMeeting;
exports.getMeeting = getMeeting;
exports.deleteMeeting = deleteMeeting;
exports.createAttendee = createAttendee;
exports.updateEndpoint = updateEndpoint;
exports.sendNotification = sendNotification;
exports.createJoinMeeting = createJoinMeeting;
