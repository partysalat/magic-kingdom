/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
  address: "0.0.0.0", // Address to listen on, can be:
  // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
  // - another specific IPv4/6 to listen on a specific interface
  // - "0.0.0.0" to listen on any interface
  // Default, when address config is left out, is "localhost"
  port: 8080,
  ipWhitelist: [], // Set [] to allow all IP addresses
  // or add a specific IPv4 of 192.168.1.5 :
  // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
  // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
  // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

  language: "en",
  timeFormat: 24,
  units: "metric",

  modules: [
    {
      module: "braccounting",
      position: "bottom_left",
      config: {
        src:"http://bra:8080/snippets/bestlist",
        width: "600px",
        height: "500px",
        backgroundColor: "#000",
        updateInterval: 3600000, // in milli seconds
      }
    },
    {
      module: "braccounting",
      position: "bottom_right",
      config: {
        src:"http://bra:8080/snippets/newsfeed",
        width: "600px",
        height: "500px",
        backgroundColor: "#000",
      }
    },
    {
      module: 'smoke-background',
      position: 'fullscreen_below',
      config: {
        height: "1920",
        width: "1080",
      }
    },
    {
      module: "alert",
    },
    {
      module: "updatenotification",
      position: "top_bar"
    },
  ]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
