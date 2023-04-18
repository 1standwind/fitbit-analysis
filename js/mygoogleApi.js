const CLIENT_ID = '236479125763-3759sec7es0ihs4t7pb995u92ecqs02s.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDnr3fSrH3hnYOoQRZXZIqjn8ydfolR2Z4';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    await listUpcomingEvents(new Date());
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function colorConverter(colorId) {
  switch (colorId) {
    case 1:
      return 'rgba(121, 134, 203, 0.5)';
    case 2:
      return 'rgba(51, 182, 121, 0.5)';
    case 3:
      return 'rgba(142, 36, 170, 0.5)';
    case 4:
      return 'rgba(230, 124, 115, 0.5)';
    case 5:
      return 'rgba(246, 191, 38, 0.5)';
    case '6':
      return 'rgba(244, 81, 30, 0.5)';
    case 7:
      return 'rgba(3, 155, 229, 0.5)';
    case 8:
      return 'rgba(97, 97, 97, 0.5)';
    case 9:
      return 'rgba(63, 81, 181, 0.5)';
    case 10:
      return 'rgba(11, 128, 67, 0.5)';
    case 11:
      return 'rgba(213, 0, 0, 0.5)';
    default:
      return 'rgba(121, 134, 203, 0.5)';
  }
}

async function listUpcomingEvents(date) {
  let response;
  try {
    const request = {
      'calendarId': 'primary',
      'timeMax': (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)).toISOString(),
      'timeMin': (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    return
  }

  scheduleReset()
  const events = response.result.items;
  for (var i = 0; i < events.length; i++) {
    eventname = events[i].summary
    color = events[i].colorId
    startdate = new Date(events[i].start.dateTime)
    starthours = ('0' + startdate.getHours()).slice(-2);
    startminutes = ('0' + startdate.getMinutes()).slice(-2);
    enddate = new Date(events[i].end.dateTime)
    endhours = ('0' + enddate.getHours()).slice(-2);
    endminutes = ('0' + enddate.getMinutes()).slice(-2);
    //console.log(eventname);
    //console.log(color);
    (function (j) {
      scheduleInput(j, eventname, colorConverter(color), starthours + ":" + startminutes, endhours + ":" + endminutes);
    }(i));
  }
}
