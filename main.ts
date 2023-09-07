// for wifi connection
function wait_for_response (str: string) {
    time = input.runningTime()
    while (true) {
        serial_str = "" + serial_str + serial.readString()
        if (serial_str.length > 200) {
            serial_str = serial_str.substr(serial_str.length - 200, 0)
        }
        if (serial_str.includes(str)) {
            result2 = true
            break;
        }
        if (input.runningTime() - time > 300000) {
            break;
        }
    }
    return result2
}
function playSadTone () {
    // Play a sad tone (e.g., middle C)
    music.playTone(262, music.beat(BeatFraction.Half))
}
// generate HTML
function getHTML (normal: boolean) {
    web_title = "ESP8266 (ESP-01) Wifi on BBC micro:bit"
    // HTTP response
    html = "" + html + "HTTP/1.1 200 OK\r\n"
    html = "" + html + "Content-Type: text/html\r\n"
    html = "" + html + "Connection: close\r\n\r\n"
    html = "" + html + "<!DOCTYPE html>"
    html = "" + html + "<html>"
    html = "" + html + "<head>"
    html = "" + html + "<link rel=\"icon\" href=\"data:,\">"
    html = "" + html + "<title>" + web_title + "</title>"
    // mobile view
    html = "" + html + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
    html = "" + html + "</head>"
    html = "" + html + "<body>"
    html = "" + html + "<div style=\"text-align:center\">"
    html = "" + html + "<h1>" + web_title + "</h1>"
    html = "" + html + "<br>"
    // generate status text
    if (normal) {
        if (LED_status) {
            LED_statusString = "ON"
            LED_buttonString = "TURN IT OFF"
        } else {
            LED_statusString = "OFF"
            LED_buttonString = "TURN IT ON"
        }
        html = "" + html + "<h3>LED STATUS: " + LED_statusString + "</h3>"
        html = "" + html + "<h3>Light Level STATUS: " + input.lightLevel().toString() + "</h3>"
        html = "" + html + "<h3>Temp STATUS: " + input.temperature().toString() + "</h3>"
        html = "" + html + "<br>"
        // generate buttons
        html = "" + html + "<input type=\"button\" onClick=\"window.location.href='LED'\" value=\"" + LED_buttonString + "\">"
        html = "" + html + "<br>"
    } else {
        html = "" + html + "<h3>ERROR: REQUEST NOT FOUND</h3>"
    }
    html = "" + html + "<br>"
    html = "" + html + "<input type=\"button\" onClick=\"window.location.href='/'\" value=\"Home\">"
    html = "" + html + "</div>"
    html = "" + html + "</body>"
    html = "" + html + "</html>"
    return html
}
/**
 * ESP8266 ESP-01 Wifi control via AT commands on BBC micro:bit
 * 
 * by Alan Wang
 */
let LED_buttonString = ""
let LED_statusString = ""
let html = ""
let web_title = ""
let result2 = false
let time = 0
let HTTP_pos = 0
let GET_pos = 0
let serial_str = ""
let result = false
let HTML_str = ""
let GET_command = ""
let client_ID = ""
let GET_success: boolean = false
let LED_status: number = 0
// user settings
// 1 = STA (station, connect to wifi router); 2 = AP (make itself an access point)
let WIFI_MODE = 2
const Tx_pin: SerialPin = SerialPin.P12
const Rx_pin: SerialPin = SerialPin.P8
const LED_pin: DigitalPin = DigitalPin.P2
// wifi router ssid for station mode
let SSID_1 = "-----"
// wifi router password for station mode
let PASSWORD_1 = "-----"
// AP server ssid for AP mode
let SSID_2 = "Bob's The Bot"
// AP password for AP mode (at least 8 characters)
let PASSWORD_2 = "helloworld"
pins.digitalWritePin(LED_pin, 0)
serial.redirect(Tx_pin, Rx_pin, 115200)
sendAT("AT+RESTORE", 1000)
sendAT("AT+RST", 1000)
sendAT("AT+CWMODE=" + WIFI_MODE)
if (WIFI_MODE == 1) {
    sendAT("AT+CWJAP=\"" + SSID_1 + "\",\"" + PASSWORD_1 + "\"")
result = wait_for_response("OK")
    if (!(result)) {
        control.reset()
    }
} else if (WIFI_MODE == 2) {
    sendAT("AT+CWSAP=\"" + SSID_2 + "\",\"" + PASSWORD_2 + "\",1,4", 1000)
}
sendAT("AT+CIPMUX=1")
sendAT("AT+CIPSERVER=1,80")
sendAT("AT+CIFSR")

// startup completed
basic.showIcon(IconNames.Ghost)
// process HTTP request
while (true) {
    
    // read and store 200 characters from serial port
    serial_str = "" + serial_str + serial.readString()
    if (serial_str.length > 200) {
        serial_str = serial_str.substr(serial_str.length - 200, 0)
    }
    if (serial_str.includes("+IPD") && serial_str.includes("HTTP")) {
        // got a HTTP request
        client_ID = serial_str.substr(serial_str.indexOf("IPD") + 4, 1)
        GET_pos = serial_str.indexOf("GET")
        HTTP_pos = serial_str.indexOf("HTTP")
        GET_command = serial_str.substr(GET_pos + 5, HTTP_pos - 1 - (GET_pos + 5))
        switch (GET_command) {
            case "": // request 192.168.x.x/
                GET_success = true
                break
            case "Sad": // request 192.168.x.x/Sad
                GET_success = true;
                LED_status = 1 - LED_status;
                pins.digitalWritePin(LED_pin, LED_status);
                basic.showIcon(IconNames.Sad);
                playSadTone(); // Play a sad tone
                break;
            case "Happy": // request 192.168.x.x/Happy
                GET_success = true
                LED_status = 1 - LED_status
                pins.digitalWritePin(LED_pin, LED_status)
                basic.showIcon(IconNames.Happy)

                break;
            case "MoveForward": // request 192.168.x.x/Happy
                GET_success = true
                LED_status = 1 - LED_status
                pins.digitalWritePin(LED_pin, LED_status)
                basic.showIcon(IconNames.Angry)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Close)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Close)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 150)
                break;
            case "MoveBackward": // request 192.168.x.x/Happy
                GET_success = true
                LED_status = 1 - LED_status
                pins.digitalWritePin(LED_pin, LED_status)
                basic.showIcon(IconNames.Surprised)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Close)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Close)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Backward, 100)
                break;
            case "MoveLeft": // request 192.168.x.x/Happy
                GET_success = true
                LED_status = 1 - LED_status
                pins.digitalWritePin(LED_pin, LED_status)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Open)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Close)
                basic.showIcon(IconNames.Angry)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, 100)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, 100)
                basic.pause(200)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 100)

                break;

            case "MoveRight": // request 192.168.x.x/Happy
                GET_success = true
                LED_status = 1 - LED_status
                led.toggle(1, 0)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Open)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Close)

                pins.digitalWritePin(LED_pin, LED_status)
                basic.showIcon(IconNames.Angry)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, 100)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, 100)
                basic.pause(200)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 100)                
                break;
            case "Stop":
                maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
                GET_success = true
                LED_status = 1 - LED_status
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Close)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Close)
                pins.digitalWritePin(LED_pin, LED_status)
                basic.showIcon(IconNames.Angry)
                break;
            case "PlayMusic":

                GET_success = true

                LED_status = 1 - LED_status

                pins.digitalWritePin(LED_pin, LED_status)

                basic.showIcon(IconNames.Angry)

                playSouthAfricaNationalAnthem();

                break;

            case "StopMusic":

                maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)

                GET_success = true

                LED_status = 1 - LED_status

                pins.digitalWritePin(LED_pin, LED_status)

                basic.showIcon(IconNames.Angry)

                music.stopAllSounds()

                break;
            

        }
// output HTML
        HTML_str = getHTML(GET_success)
        sendAT("AT+CIPSEND=" + client_ID + "," + (HTML_str.length + 2))
sendAT(HTML_str, 1000)
sendAT("AT+CIPCLOSE=" + client_ID)
serial_str = ""
    }
}
function sendAT(command: string, waitTime: number = 100) {
    serial.writeString(command + "\u000D\u000A")
    basic.pause(waitTime)
}
function playSouthAfricaNationalAnthem() {

    // Define the notes and their durations for "Nkosi Sikelel' iAfrika"

    let notes = [

        330, 392, 440, 523, 587, 523, 440, 392, // Part 1

        330, 330, 349, 392, 349, 330, 294, 294, // Part 2

        523, 587, 659, 784, 659, 587, 523, 392, // Part 3

        349, 392, 440, 523, 440, 392, 349, 294, // Part 4

        523, 659, 784, 880, 784, 659, 523, 392, // Part 5

        330, 392, 440, 523, 587, 523, 440, 392, // Part 6

    ];



    let durations = [

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Half),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Half),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Half),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Quarter),

        music.beat(BeatFraction.Half),

    ];



    // Play the South Africa national anthem

    for (let i = 0; i < notes.length; i++) {

        music.playTone(notes[i], durations[i]);

        basic.pause(durations[i]);

    }

}