/** ======== Extract the root URL (protocol + hostname + port) ======== **/
const rootUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
/*=======================================================================*/

/** ======== CLIENT SERVER-SIDE URL ======== **/

const serverUrl = 'http://localhost:3003'; //Localhost Test Server

// const serverUrl = rootUrl; // Same server as the backend server-side
/*=======================================================================*/

export { serverUrl, rootUrl };

